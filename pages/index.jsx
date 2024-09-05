import Image from "next/image";
import { Inter } from "next/font/google";
import ChatPannel from "./_components/ChatPannel";
import SidePannel from "./_components/SidePannel";
import { useEffect, useState } from "react";
import UseCookieData from "../lib/useCookieData";
import { useSocket } from "../context/socketContext";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [contactId, setContactId] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactSocketID, setContactSocketID] = useState("");
  const [userData, setUserData] = useState(UseCookieData());
  const [showChatPanel, setShowChatPanel] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const { userId, username } = UseCookieData();
    socket.emit("addNewUser", {
      userId: userId,
      name: username,
    });

    return () => {
      socket.off("addNewUser");
    };
  }, [socket]);

  return (
    <div className="flex flex-col md:flex-row h-screen   ">
      <div
        className={`md:w-[22vw] ${
          showChatPanel && "hidden md:block"
        } w-full bg-slate-600`}
      >
        <SidePannel
          setContactName={setContactName}
          setShowChatPanel={setShowChatPanel}
          contactId={contactId}
          setContactSocketID={setContactSocketID}
          userData={userData}
          setContactId={setContactId}
        />
      </div>
      <div className={`flex-1 ${!showChatPanel && "hidden md:block"} `}>
        <ChatPannel
          setShowChatPanel={setShowChatPanel}
          contactName={contactName}
          contactSocketID={contactSocketID}
          userData={userData}
          contactId={contactId}
        />
      </div>
    </div>
  );
}
