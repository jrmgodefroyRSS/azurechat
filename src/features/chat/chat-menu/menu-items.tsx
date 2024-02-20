"use client";
import { MenuItem } from "@/components/menu";
import { Button } from "@/components/ui/button";
import { SoftDeleteChatThreadByID, editChatThreadTitle, FindChatThreadByID } from "@/features/chat/chat-services/chat-thread-service";
import { useGlobalMessageContext } from "@/features/global-message/global-message-context";
import { FileText, MessageCircle, Trash, Edit } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FC, useState } from "react";
import { ChatThreadModel } from "../chat-services/models";
import { Textarea } from "@/components/ui/textarea";

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';

interface Prop {
  menuItems: Array<ChatThreadModel>;
}

export const MenuItems: FC<Prop> = (props) => {
  const { id } = useParams();
  const router = useRouter();
  const { showError } = useGlobalMessageContext();

  const [open, setOpen] = useState(false);
  const [editThreadId, setEditThreadId] = useState("");
  const [editThreadName, setEditThreadName] = useState("");

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditThreadName(event.target.value);
  };


  const deleteData = async (threadID: string) => {
    try {
      await SoftDeleteChatThreadByID(threadID);
      router.refresh();
      router.replace("/chat");
    } catch (e) {
      console.log(e);
      showError("" + e);
    }
  };

  const editData = async (threadId: string) => {
    try {
      const threads = await FindChatThreadByID(threadId);
      if (threads && threads.length > 0 && threads.at(0)) {
        await editChatThreadTitle(threads.at(0)!, editThreadName);
        router.refresh();
      }
    } catch (e) {
      console.log(e);
      showError("" + e);
    }
  };

  return (
    <>
      {props.menuItems.map((thread, index) => (
        <MenuItem
          href={"/chat/" + thread.id}
          isSelected={id === thread.id}
          key={index}
          className="justify-between group/item"
        >
          {thread.chatType === "data" ? (
            <FileText
              size={16}
              className={id === thread.id ? " text-brand" : ""}
            />
          ) : (
            <MessageCircle
              size={16}
              className={id === thread.id ? " text-brand" : ""}
            />
          )}

          <span className="flex gap-2 items-center overflow-hidden flex-1">
            <span className="overflow-ellipsis truncate"> {thread.name}</span>
          </span>

          <Button
            className="invisible  group-hover/item:visible hover:text-brand"
            size={"sm"}
            variant={"ghost"}
            onClick={(e) => {
              e.preventDefault();
              setOpen(true);
              setEditThreadId(thread.id);
              setEditThreadName(thread.name);
            }}
          >
            <Edit size={16} />
          </Button>

          <Dialog 
            aria-labelledby="customized-dialog-title" 
            open={open} 
            onClose={() => {
              setOpen(false);
            }}
          > 
            <DialogContent dividers>
              <Box
                component="form"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  m: 'auto',
                  width: 'fit-content',
                }}
              >
                <FormControl sx={{ mt: 2, minWidth: 400 }}>
                  <Textarea
                    rows={1}
                    value={editThreadName}
                    className="min-h-fit resize-none py-4 pr-[10px]"
                    onChange={onChange}
                  ></Textarea>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                autoFocus
                variant={"secondary"}
                onClick={ async (e) => {
                  setOpen(false);
                }} 
              >
                Close
              </Button>
              <Button 
                autoFocus
                onClick={ async (e) => {
                  e.preventDefault();
                  await editData(editThreadId);
                  setOpen(false);
                }} 
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>

          <Button
            className="invisible  group-hover/item:visible hover:text-brand"
            size={"sm"}
            variant={"ghost"}
            onClick={async (e) => {
              e.preventDefault();
              const yesDelete = confirm(
                "Are you sure you want to delete this chat?"
              );
              if (yesDelete) {
                await deleteData(thread.id);
              }
            }}
          >
            <Trash size={16} />
          </Button>
        </MenuItem>
      ))}
    </>
  );
};
