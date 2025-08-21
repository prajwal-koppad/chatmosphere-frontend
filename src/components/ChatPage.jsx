import React, { useEffect, useRef, useState, useMemo } from "react";
import { MdAttachment, MdExitToApp, MdSend } from "react-icons/md";
import backgroundImage from "../assets/background.png";
import av2 from "../assets/av-2.png";
import groupIcon from "../assets/group.png";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import {
  baseUrl,
  chatPath,
  receiveMessagePath,
  sendMessageUrl,
} from "../config/AxiosHelper";
import { Stomp } from "@stomp/stompjs";
import { toast } from "react-hot-toast";
import { getMessages } from "../services/RoomService";
import { formatMessageDate } from "../utilities/Utility";

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [page, setPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalMessageCount, setTotalMessageCount] = useState(0);
  const [scrollToBottom, setScrollToBottom] = useState(true);

  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const navigate = useNavigate();

  const {
    roomId,
    currentUser,
    connected,
    setRoomId,
    setCurrentUser,
    setConnected,
  } = useChatContext();

  useEffect(() => {
    if (!connected) navigate("/");
  }, [connected]);

  //load messages

  // init stompClient and subscribe
  useEffect(() => {
    const connectWebSocket = () => {
      const socketFactory = () => new SockJS(`${baseUrl}${chatPath}`); // wrapped as factory
      const client = Stomp.over(socketFactory);

      client.onConnect = () => {
        setStompClient(client);
        toast.success("Connected");

        client.subscribe(receiveMessagePath(roomId), (message) => {
          const newMessage = JSON.parse(message?.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      };

      client.onStompError = (frame) => {
        console.error("Broker reported error:", frame.headers["message"]);
        console.error("Additional details:", frame.body);
        toast.error("WebSocket STOMP error");
      };

      client.activate();
    };

    if (connected) {
      connectWebSocket();
    }
  }, [roomId]);

  useEffect(() => {
    if (chatBoxRef.current && scrollToBottom) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      const message = {
        senderId: currentUser,
        messageContent: input,
        roomId: roomId,
      };

      stompClient.send(sendMessageUrl(roomId), {}, JSON.stringify(message));
      setInput("");
    }
  };

  useEffect(() => {
    async function loadMessage() {
      try {
        const data = await getMessages(roomId, 0);
        setMessages(data.messages);
        setTotalMessageCount(data?.totalMessages);
      } catch (error) {
        if (error?.response) {
          toast.error(error?.response?.data?.message);
        } else {
          toast.error("Failed to load messages !!!");
        }
        console.error(error);
      }
    }
    if (roomId) loadMessage();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const el = chatBoxRef.current;

      if (!el || isLoadingMore) return;

      if (
        el.scrollTop === 0 &&
        !isLoadingMore &&
        totalMessageCount > messages?.length
      ) {
        loadMoreMessages();
      }
    };

    const el = chatBoxRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (el) {
        el.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isLoadingMore, totalMessageCount]);

  const loadMoreMessages = async () => {
    const el = chatBoxRef.current;
    if (!el) return;

    // Save current scroll position from bottom
    const previousScrollHeight = el.scrollHeight;
    const previousScrollTop = el.scrollTop;

    setScrollToBottom(false);
    setIsLoadingMore(true);

    try {
      const olderMessagesData = await getMessages(roomId, page + 1);
      const oldMessages = olderMessagesData?.messages;

      if (oldMessages?.length > 0) {
        setMessages((prev) => [...oldMessages, ...prev]);
        setTotalMessageCount(olderMessagesData?.totalMessages);
        setPage((prev) => prev + 1);

        // Wait for next DOM update to adjust scroll position
        requestAnimationFrame(() => {
          const newScrollHeight = el.scrollHeight;
          el.scrollTop =
            newScrollHeight - previousScrollHeight + previousScrollTop;
        });
      }
    } catch (error) {
      if (error?.response) {
        toast.error(error?.response?.data?.message);
      } else {
        toast.error("Failed to load messages !!!");
      }
      console.error(error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const groupedMessages = useMemo(() => {
    return messages.reduce((acc, msg) => {
      const groupKey = formatMessageDate(msg.sentAt);
      if (!acc[groupKey]) acc[groupKey] = [];
      const normalizedMsg = {
        ...msg,
        sentAt: new Date(msg.sentAt),
      };
      acc[groupKey].push(normalizedMsg);
      return acc;
    }, {});
  }, [messages]);  

  function handleLogOut() {
    setConnected(false);
    setRoomId(null);
    setCurrentUser(null);
    navigate("/");
    stompClient.disconnect();
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full h-16 shadow dark:bg-gray-900 px-3 flex flex-wrap justify-between items-center z-10">
        <h1 className="text-lg sm:text-sm md:text-base font-semibold flex items-center gap-2">
          <img
            src={groupIcon}
            alt="group"
            className="w-10 h-10 rounded-full object-cover"
          />{" "}
          <span>{roomId}</span>
        </h1>
        <button
          onClick={handleLogOut}
          title="Leave Room"
          className="dark:bg-red-500 dark:hover:bg-red-700 p-2 rounded"
        >
          <MdExitToApp size={20} />
        </button>
      </header>

      <main
        ref={chatBoxRef}
        className="pt-14 px-4 pb-16 w-full sm:w-11/12 md:w-4/5 lg:w-2/3 h-screen dark:bg-slate-600 mx-auto overflow-auto"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        {Object.entries(groupedMessages).map(([dateLabel, group]) => (
          <div key={dateLabel}>
            {/* Date separator */}
            <div className="flex justify-center my-4">
              <span className="text-xs dark:bg-gray-700 font-medium text-white py-1 px-3 rounded-full">
                {dateLabel}
              </span>
            </div>

            {/* Messages for this date */}
            {group.map((message, index) => (
              <div
                key={index}
                className={`flex w-full mb-2 ${
                  message.senderId === currentUser
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div className="flex items-start gap-2 max-w-[80%]">
                  {/* Avatar for others */}
                  {message.senderId !== currentUser && (
                    <img
                      src={av2}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover mt-1"
                    />
                  )}

                  <div
                    className={`rounded-xl p-1 px-2 text-sm font-medium relative ${
                      message.senderId === currentUser
                        ? "bg-green-600 rounded-br-none"
                        : "bg-gray-700 rounded-tl-none"
                    } text-white`}
                  >
                    {/* Name (for others only) */}
                    {message.senderId !== currentUser && (
                      <p className="text-xs font-semibold text-[#53bdeb] mb-1">
                        {message.senderId}
                      </p>
                    )}

                    {/* Content */}
                    <p className="break-words">{message.content}</p>

                    {/* Timestamp */}
                    <span className="text-[10px] text-gray-300">
                      {message.sentAt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>

      {/* Typing Input */}
      <div className="fixed bottom-0 left-0 w-full px-2 py-2 bg-transparent">
        <div className="flex items-center gap-2 p-2 rounded dark:bg-gray-900 mx-auto w-full sm:w-11/12 md:w-4/5 lg:w-2/3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            id="input-message"
            placeholder="Type your message..."
            className="flex-grow h-[40px] px-3 py-2 text-sm rounded resize-none dark:bg-gray-800 dark:text-white overflow-y-auto focus:outline-none scrollbar-thin scrollbar-thumb-gray-700"
          />
          {/* <button className="dark:bg-transparent p-1 rounded">
            <MdAttachment size={22} />
          </button> */}
          <button
            onClick={sendMessage}
            className="dark:bg-green-600 px-3 py-2 rounded"
          >
            <MdSend size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
