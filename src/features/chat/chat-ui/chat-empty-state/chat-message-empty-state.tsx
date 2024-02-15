import Typography from "@/components/typography";
import { Card } from "@/components/ui/card";
import { FC } from "react";
import { useChatContext } from "../chat-context";
import { ChatFileUI } from "../chat-file/chat-file-ui";
import { ChatStyleSelector } from "./chat-style-selector";
import { ChatTypeSelector } from "./chat-type-selector";
import { Textarea } from "@/components/ui/textarea";

interface Prop {}

export const ChatMessageEmptyState: FC<Prop> = (props) => {
  const { fileState, systemMessage, setSystemMessage, onSystemMessageChange } = useChatContext();

  const { showFileUpload } = fileState;

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSystemMessage(event.target.value);
    onSystemMessageChange(event.target.value);
  };

  return (
    <div className="grid grid-cols-5 w-full items-center container mx-auto max-w-3xl justify-center h-full gap-9">
      <div className="col-span-2 gap-5 flex flex-col flex-1">
        <img src="/ai-icon.png" className="w-36" />
        <p className="">
          Start by just typing your message in the box below. You can also
          personalise the chat by making changes to the settings on the right.
        </p>
      </div>
      <Card className="col-span-3 flex flex-col gap-5 p-5 ">
        <Typography variant="h4" className="text-primary">
          Personalise
        </Typography>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Enter a system message
          </p>
          <Textarea
            rows={8}
            value={systemMessage}
            className="max-m-fit bg-background shadow-sm resize-none py-4 pr-[5px]"
            onChange={onChange}
          ></Textarea>  
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Choose a conversation style
          </p>
          <ChatStyleSelector disable={false} />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            How would you like to chat?
          </p>
          <ChatTypeSelector disable={false} />
        </div>
        {showFileUpload === "data" && <ChatFileUI />}
      </Card>
    </div>
  );
};
