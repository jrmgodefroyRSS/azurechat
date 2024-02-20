import { userHashedId } from "@/features/auth/helpers";
import { OpenAIInstance } from "@/features/common/openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { initAndGuardChatSession } from "./chat-thread-service";
import { CosmosDBChatMessageHistory } from "./cosmosdb/cosmosdb";
import { PromptGPTProps, TokenizedChatCompletionMessage } from "./models";

import openaiTokenCounter from "openai-gpt-token-counter";

export const ChatAPISimple = async (props: PromptGPTProps) => {
  const { lastHumanMessage, chatThread } = await initAndGuardChatSession(props);

  const openAI = OpenAIInstance();

  const userId = await userHashedId();

  const chatHistory = new CosmosDBChatMessageHistory({
    sessionId: chatThread.id,
    userId: userId,
  });

  const newMessageTokenCount = openaiTokenCounter.chat( [{ role: "user", content: lastHumanMessage.content }], 'gpt-3.5-turbo');

  await chatHistory.addMessage({
    content: lastHumanMessage.content,
    role: "user",
  }, newMessageTokenCount);

  let history = await chatHistory.getMessages();  

  const estimatedTokenAnswerTolerance = 100;
  // TODO: Get the model from config
  const systemTokenCount = openaiTokenCounter.chat( [{ role: "system", content: props.systemMessage }], 'gpt-3.5-turbo');
  const historyTokenCount = history.reduce((sum, current) => sum + current.tokens, 0);
  const totalTokenCount = systemTokenCount + historyTokenCount;
  
  if (totalTokenCount >= 4096) { // Then shift down the chat context:
    const overflow = totalTokenCount - 4096;
    let tokenCount = 0;
    let firstMessage: TokenizedChatCompletionMessage;
    do {
      firstMessage = history[0];    
      history = history.slice(1); 
      if (firstMessage) {
        tokenCount = tokenCount + firstMessage.tokens;
      }
    } while(firstMessage.role === "user" ||  tokenCount < overflow + estimatedTokenAnswerTolerance);
  }

  const topHistory = history.map((h => {
    return {
      role: h.role,
      content: h.content,
    };
  }));

  try {
    const response = await openAI.chat.completions.create({
      messages: [
        {
          role: "system",
          content: props.systemMessage,
        },
        ...topHistory,
      ],
      model: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
      stream: true,
    });

    const stream = OpenAIStream(response, {
      async onCompletion(completion) {
        const completionTokenCount = openaiTokenCounter.chat( [{ role: "user", content: completion }], 'gpt-3.5-turbo');
        await chatHistory.addMessage({
          content: completion,
          role: "assistant",
        }, completionTokenCount);
      },
    });
    return new StreamingTextResponse(stream);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return new Response(e.message, {
        status: 500,
        statusText: e.toString(),
      });
    } else {
      return new Response("An unknown error occurred.", {
        status: 500,
        statusText: "Unknown Error",
      });
    }
  }
};
