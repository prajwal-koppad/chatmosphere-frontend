import { createContext, useContext, useEffect, useState } from "react";
import { getStorageItem, setStorageItem } from "../services/StorageService";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [roomId, setRoomId] = useState(() => getStorageItem("roomId", ""));
  const [currentUser, setCurrentUser] = useState(() =>
    getStorageItem("userName", "")
  );
  const [connected, setConnected] = useState(() =>
    getStorageItem("connected", false)
  );

  useEffect(() => {
    setStorageItem("roomId", roomId);
  }, [roomId]);

  useEffect(() => {
    setStorageItem("userName", currentUser);
  }, [currentUser]);

  useEffect(() => {
    setStorageItem("connected", connected);
  }, [connected]);

  return (
    <ChatContext.Provider
      value={{
        roomId,
        currentUser,
        connected,
        setRoomId,
        setCurrentUser,
        setConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

const useChatContext = () => useContext(ChatContext);
export default useChatContext;
