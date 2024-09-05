import { createContext, useState, useContext, useEffect } from "react";
import { io } from "socket.io-client";
import UseCookieData from "../lib/useCookieData";

const SockeContext = createContext();

export function useSocket() {
  return useContext(SockeContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState();
  const [testing, setTesting] = useState();
  const userData = UseCookieData();

  useEffect(() => {
    console.log("enterd in socket useEffect=======");
    const newSocket = io("http://192.168.29.26:3001/");

    newSocket.on("connect", async () => {
      console.log("socket id", newSocket.id);
      setSocket(newSocket);
      if (userData) {
        console.log("userData from context====", userData);
        newSocket.emit("addNewUser", {
          userId: userData.userId,
          name: userData.username,
        });
      }
    });

    return () => {
      console.log("Cleaning up WebSocket connection...");
      newSocket.close();
    };
  }, []);

  return (
    <SockeContext.Provider value={{ socket, setSocket, setTesting }}>
      {children}
    </SockeContext.Provider>
  );
}
