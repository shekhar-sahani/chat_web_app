import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../context/socketContext";
import ChatTopSection from "./ChatTopSection";

export default function ChatPannel({
  userData,
  contactId,
  contactSocketID,
  contactName,
  setShowChatPanel,
}) {
  const [messages, setMessages] = useState([]);
  const textRef = useRef();
  const chatContainerRef = useRef();
  const userId = userData.userId;
  const { socket } = useSocket();
  console.log({ contactId });

  async function handleSubmit(e) {
    e.preventDefault();
    const text = textRef.current.value.trim();
    if (text === "") return;

    await sendMessage(text);
    textRef.current.value = "";
  }

  async function getMessages(senderId, receiverId) {
    const data = { senderId, receiverId };
    console.log("data", data);
    try {
      const res = await fetch("/api/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const messageData = await res.json();
        console.log("messageData", messageData);
        setMessages(messageData?.messages);
      }
    } catch (err) {
      console.log("err", err);
    }
  }

  async function sendMessage(content) {
    const senderId = userId;
    const receiverId = contactId;
    const data = { senderId, receiverId, content };
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        console.log("contactSocketId=====", contactSocketID);
        const messagae = {
          content,
          senderId,
          receiverId,
        };
        socket.emit("sendMessage", messagae);
        // socket.emit("message-sent", {content, senderId: userId, receiverId: contactId, socketID: contactSocketID});
        getMessages(senderId, receiverId);
      }
    } catch (err) {
      console.log("err", err);
    }
  }

  useEffect(() => {
    if (!socket) return;

    socket.on("getMessage", (message) => {
      console.log("message-------->", message);
      const { senderId, receiverId } = message;
      console.log("activeChat", activeChat);
      var activeChat = JSON.parse(localStorage.getItem("activeChat"));
      if (activeChat?.id === senderId) {
        getMessages(senderId, receiverId);
      }
    });

    return () => {
      socket.off("getMessage");
    };
  }, [socket]);

  useEffect(() => {
    if (contactId) {
      const senderId = userId;
      const receiverId = contactId;
      getMessages(senderId, receiverId);
    }
  }, [contactId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!contactId) {
    return <div className="flex flex-col h-full bg-gray-900 text-white" />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="h-14 md:h-0 ">
        <div className="fixed w-full bg-gray-900 ">
          <ChatTopSection
            setShowChatPanel={setShowChatPanel}
            contactName={contactName}
          />
        </div>
      </div>
      <div
        className="flex-1 overflow-auto p-4 mb-[12px] "
        ref={chatContainerRef}
      >
        <div className="flex flex-col h-full">
          {messages.map((item, id) => (
            <div
              key={id}
              className={`mb-2 p-3 rounded-lg max-w-xs shadow-md ${
                item.senderId === userId
                  ? "ml-auto bg-blue-600 text-white"
                  : "mr-auto bg-gray-700 text-white"
              }`}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>
      {/* Input box and button section */}
      <div className=" mt-12 md:mt-0 w-full  ">
        <div className="p-4 fixed md:relative bottom-0 w-full bg-gray-900 md:bg-transparent ">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center w-full border border-gray-700 rounded-lg overflow-hidden">
              <input
                ref={textRef}
                className="input flex-grow bg-gray-800 text-white border-none focus:ring-0 focus:outline-none"
                placeholder="Type your message..."
              />
              <button className="btn btn-primary bg-blue-600 border-none hover:bg-blue-700">
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
