import { Menu, MenuContent, MenuHeader } from "@/components/menu";
import { FindAllChatThreadForCurrentUser } from "@/features/chat/chat-services/chat-thread-service";
import { MenuItems } from "./menu-items";
import { NewChat } from "./new-chat";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export const ChatMenu = async () => {
  const items = await FindAllChatThreadForCurrentUser();

  return (
    <Menu className=" p-2">
      <MenuHeader className="justify-end">
        <div className="flex flex-col gap-8 px-12">
          <img src="/ratp-hd.png" className="w-36"/>
        </div>
        <NewChat />
      </MenuHeader>
      <MenuContent>
        <MenuItems menuItems={items} />
      </MenuContent>
    </Menu>
  );
};
