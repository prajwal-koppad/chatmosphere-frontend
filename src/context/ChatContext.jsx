import { createContext, useContext, useEffect, useState } from "react";
import { getStorageItem, setStorageItem, removeStorageItem, clearStorage } from "../services/StorageService";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [token, setToken] = useState(() => getStorageItem("token") || "");
  const [currentUser, setCurrentUser] = useState(() => getStorageItem("userName") || "");
  const [displayName, setDisplayName] = useState(() => getStorageItem("displayName") || "");
  const [avatarUrl, setAvatarUrl] = useState(() => getStorageItem("avatarUrl") || "");
  const [roomId, setRoomId] = useState(() => getStorageItem("roomId") || "");
  const [connected, setConnected] = useState(() => getStorageItem("connected") === "true" || false);

  useEffect(() => {
    if (token) setStorageItem("token", token);
    else removeStorageItem("token");
  }, [token]);

  useEffect(() => {
    if (currentUser) setStorageItem("userName", currentUser);
    else removeStorageItem("userName");
  }, [currentUser]);

  useEffect(() => {
    if (displayName) setStorageItem("displayName", displayName);
    else removeStorageItem("displayName");
  }, [displayName]);

  useEffect(() => {
    if (avatarUrl) setStorageItem("avatarUrl", avatarUrl);
    else removeStorageItem("avatarUrl");
  }, [avatarUrl]);

  useEffect(() => {
    if (roomId) setStorageItem("roomId", roomId);
    else removeStorageItem("roomId");
  }, [roomId]);

  useEffect(() => {
    setStorageItem("connected", connected ? "true" : "false");
  }, [connected]);

  const logout = () => {
    setToken("");
    setCurrentUser("");
    setDisplayName("");
    setAvatarUrl("");
    setRoomId("");
    setConnected(false);
    clearStorage();
  };

  return (
    <ChatContext.Provider
      value={{
        token,
        setToken,
        currentUser,
        setCurrentUser,
        displayName,
        setDisplayName,
        avatarUrl,
        setAvatarUrl,
        roomId,
        setRoomId,
        connected,
        setConnected,
        logout,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

const useChatContext = () => useContext(ChatContext);
export default useChatContext;

