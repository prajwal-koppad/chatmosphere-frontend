import React, { useEffect, useRef, useState, useMemo } from "react";
import { MdExitToApp, MdSend, MdContentCopy, MdOutlineChatBubble, MdMenu, MdClose, MdPerson, MdLogout } from "react-icons/md";
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
import { getMessages, joinRoom } from "../services/RoomService";
import { formatMessageDate, parseUTCDate } from "../utilities/Utility";

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [page, setPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalMessageCount, setTotalMessageCount] = useState(0);
  const [scrollToBottom, setScrollToBottom] = useState(true);
  const [roomName, setRoomName] = useState("");
  const [typingUsers, setTypingUsers] = useState({}); // { username: true }
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [isTypingLocal, setIsTypingLocal] = useState(false);

  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const {
    roomId,
    currentUser,
    displayName,
    avatarUrl,
    token,
    connected,
    setRoomId,
    setConnected,
    logout
  } = useChatContext();

  // Redirect to login if not connected or authenticated
  useEffect(() => {
    if (!connected || !token) {
      navigate("/login");
    }
  }, [connected, token, navigate]);

  // Handle sidebar responsive toggle on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load room name and metadata
  useEffect(() => {
    async function fetchRoomDetails() {
      try {
        const room = await joinRoom(roomId);
        setRoomName(room.roomName || room.roomId);
      } catch (err) {
        console.error("Failed to load room details", err);
        setRoomName(roomId);
      }
    }
    if (roomId && token) {
      fetchRoomDetails();
    }
  }, [roomId, token]);


  // STOMP WebSocket Connection
  useEffect(() => {
    let clientInstance = null;

    const connectWebSocket = () => {
      const socketFactory = () => new SockJS(`${baseUrl}${chatPath}`);
      const client = Stomp.over(socketFactory);

      // Disable logging to console to keep clean output
      client.debug = () => {};

      // Crucial: Pass token in connect headers for WebSocketAuthInterceptor
      client.connectHeaders = {
        token: token,
      };

      client.onConnect = (frame) => {
        setStompClient(client);
        toast.success("Joined stream successfully!");

        // Subscribe to presence/online user updates
        client.subscribe(`/topic/room/${roomId}/presence`, (message) => {
          const usersList = JSON.parse(message?.body);
          setOnlineUsers(usersList || []);
        });

        // Subscribe to typing notifications
        client.subscribe(`/topic/room/${roomId}/typing`, (message) => {
          const typingRequest = JSON.parse(message?.body);
          if (typingRequest.username !== currentUser) {
            setTypingUsers((prev) => {
              const copy = { ...prev };
              if (typingRequest.typing) {
                copy[typingRequest.username] = true;
              } else {
                delete copy[typingRequest.username];
              }
              return copy;
            });
          }
        });

        // Subscribe to standard messages
        client.subscribe(receiveMessagePath(roomId), (message) => {
          const newMessage = JSON.parse(message?.body);
          setMessages((prev) => [...prev, newMessage]);
          setScrollToBottom(true);
        });
      };

      client.onStompError = (frame) => {
        console.error("Broker reported error:", frame.headers["message"]);
        console.error("Additional details:", frame.body);
        toast.error("WebSocket Connection Error");
      };

      client.onWebSocketClose = () => {
        console.warn("WebSocket closed");
      };

      client.activate();
      clientInstance = client;
    };

    if (connected && roomId && token) {
      connectWebSocket();
    }

    return () => {
      if (clientInstance) {
        clientInstance.deactivate();
      }
    };
  }, [roomId, token, connected]);

  const prevOnlineUsersRef = useRef([]);

  // Track joins and leaves for Toast notifications and System messages
  useEffect(() => {
    const prev = prevOnlineUsersRef.current;
    const joined = onlineUsers.filter((u) => !prev.includes(u));
    const left = prev.filter((u) => !onlineUsers.includes(u));

    if (prev.length > 0) {
      joined.forEach((user) => {
        if (user !== currentUser) {
          toast.success(`@${user} joined the room`);
          setMessages((prevMsgs) => [
            ...prevMsgs,
            {
              id: `sys-join-${Date.now()}-${user}`,
              roomId: roomId,
              senderId: "system",
              content: `@${user} joined the space`,
              sentAt: new Date().toISOString(),
              isSystem: true,
            },
          ]);
          setScrollToBottom(true);
        }
      });

      left.forEach((user) => {
        if (user !== currentUser) {
          toast.error(`@${user} left the room`);
          setMessages((prevMsgs) => [
            ...prevMsgs,
            {
              id: `sys-leave-${Date.now()}-${user}`,
              roomId: roomId,
              senderId: "system",
              content: `@${user} left the space`,
              sentAt: new Date().toISOString(),
              isSystem: true,
            },
          ]);
          setScrollToBottom(true);
        }
      });
    }

    prevOnlineUsersRef.current = onlineUsers;
  }, [onlineUsers, currentUser, roomId]);

  // Auto Scroll
  useEffect(() => {
    if (chatBoxRef.current && scrollToBottom) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, typingUsers]);

  // Send Message API
  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      // Clear typing status immediately
      sendTypingStatus(false);
      
      const message = {
        senderId: currentUser,
        messageContent: input.trim(),
        roomId: roomId,
      };

      try {
        stompClient.send(sendMessageUrl(roomId), {}, JSON.stringify(message));
        setInput("");
      } catch (err) {
        toast.error("Failed to deliver message");
      }
    }
  };

  // Broadcast typing status
  const sendTypingStatus = (typing) => {
    if (stompClient && connected) {
      try {
        stompClient.send(
          `/app/typing/${roomId}`,
          {},
          JSON.stringify({ username: currentUser, typing: typing })
        );
        setIsTypingLocal(typing);
      } catch (err) {
        console.warn("Could not broadcast typing status", err);
      }
    }
  };

  // Handle local text inputs
  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (!isTypingLocal) {
      sendTypingStatus(true);
    }

    // Debounce resetting typing status
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 2000);
  };

  // Load message logs from history
  useEffect(() => {
    async function loadMessage() {
      try {
        const data = await getMessages(roomId, 0);
        setMessages(data.messages || []);
        setTotalMessageCount(data?.totalMessages || 0);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load conversation history");
      }
    }
    if (roomId && token) {
      loadMessage();
    }
  }, [roomId, token]);

  // Handle scroll to load more (pagination)
  useEffect(() => {
    const handleScroll = () => {
      const el = chatBoxRef.current;
      if (!el || isLoadingMore) return;

      if (el.scrollTop === 0 && totalMessageCount > messages?.length) {
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
  }, [isLoadingMore, totalMessageCount, messages, page]);

  const loadMoreMessages = async () => {
    const el = chatBoxRef.current;
    if (!el) return;

    const previousScrollHeight = el.scrollHeight;
    const previousScrollTop = el.scrollTop;

    setScrollToBottom(false);
    setIsLoadingMore(true);

    try {
      const olderMessagesData = await getMessages(roomId, page + 1);
      const oldMessages = olderMessagesData?.messages || [];

      if (oldMessages.length > 0) {
        setMessages((prev) => [...oldMessages, ...prev]);
        setTotalMessageCount(olderMessagesData?.totalMessages || 0);
        setPage((prev) => prev + 1);

        requestAnimationFrame(() => {
          const newScrollHeight = el.scrollHeight;
          el.scrollTop = newScrollHeight - previousScrollHeight + previousScrollTop;
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not fetch older messages");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Group messages by Date
  const groupedMessages = useMemo(() => {
    return messages.reduce((acc, msg) => {
      const groupKey = formatMessageDate(msg.sentAt);
      if (!acc[groupKey]) acc[groupKey] = [];
      
      acc[groupKey].push({
        ...msg,
        sentAtDate: parseUTCDate(msg.sentAt)
      });
      return acc;
    }, {});
  }, [messages]);

  // Copy Room ID
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied to clipboard!");
  };

  // Exit Room
  function handleLogOut() {
    sendTypingStatus(false);
    setConnected(false);
    setRoomId(null);
    navigate("/");
    if (stompClient) {
      stompClient.deactivate();
    }
  }

  // Choose / Generate dynamic gradient avatar for any user
  const getAvatarGradient = (userStr) => {
    const hash = userStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      "from-purple-600 to-indigo-400",
      "from-emerald-600 to-teal-400",
      "from-orange-600 to-amber-300",
      "from-blue-600 to-cyan-400",
      "from-rose-600 to-pink-400",
      "from-pink-600 to-purple-400",
      "from-violet-600 to-fuchsia-400",
      "from-cyan-600 to-blue-500",
    ];
    return `bg-gradient-to-tr ${gradients[hash % gradients.length]}`;
  };

  // Render typing indicators
  const renderTypingText = () => {
    const active = Object.keys(typingUsers);
    if (active.length === 0) return null;
    if (active.length === 1) return `${active[0]} is typing...`;
    if (active.length === 2) return `${active[0]} and ${active[1]} are typing...`;
    return "Multiple users are typing...";
  };

  return (
    <div className="cosmic-bg flex h-screen overflow-hidden">
      <div className="glow-spot-1"></div>
      <div className="glow-spot-2"></div>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 glass-card border-r border-white/10 flex flex-col transition-all duration-300 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-slate-950/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center p-1.5 shadow">
              <MdOutlineChatBubble className="text-white text-lg" />
            </div>
            <span className="text-lg font-extrabold text-white tracking-wider">
              Chat<span className="text-gradient-purple">mosphere</span>
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-400 hover:text-white md:hidden"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Room Info */}
        <div className="p-6 border-b border-white/5 space-y-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 block mb-1">
              Active Room
            </span>
            <h2 className="text-xl font-bold text-white truncate" title={roomName}>
              {roomName || roomId}
            </h2>
          </div>

          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
            <div className="overflow-hidden mr-2">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold block">
                Room Access Code
              </span>
              <span className="text-xs font-mono font-bold text-indigo-300 block select-all truncate">
                {roomId}
              </span>
            </div>
            <button
              onClick={copyRoomId}
              title="Copy Access Code"
              className="p-2 bg-white/5 hover:bg-indigo-500 hover:text-white rounded-lg text-gray-300 transition-all active:scale-95"
            >
              <MdContentCopy size={16} />
            </button>
          </div>
        </div>

        {/* Online Users List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 block mb-2">
            Online Users ({onlineUsers.length})
          </span>
          <div className="space-y-2.5">
            {onlineUsers.map((user) => (
              <div key={user} className="flex items-center gap-2.5 animate-[slideInLeft_0.2s_ease-out]">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm flex-shrink-0 ${getAvatarGradient(user)}`}>
                  {user.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-gray-200 truncate" title={user}>@{user}</span>
                {user === currentUser && (
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/35 font-bold scale-90">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* User Card */}
        <div className="mt-auto p-4 border-t border-white/5 bg-slate-950/30 flex items-center gap-3 flex-shrink-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow ${getAvatarGradient(currentUser)}`}>
            {displayName ? displayName.substring(0, 2).toUpperCase() : currentUser.substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <span className="text-xs font-bold text-white truncate block">{displayName || currentUser}</span>
            <span className="text-[10px] text-gray-400 truncate block">@{currentUser}</span>
          </div>
          <button
            onClick={() => {
              if (stompClient) stompClient.deactivate();
              logout();
            }}
            title="Sign Out"
            className="text-gray-400 hover:text-red-400 transition-colors p-1.5 rounded-full hover:bg-white/5"
          >
            <MdLogout size={18} />
          </button>
        </div>
      </aside>

      {/* Main Chat Panel */}
      <main className="flex-1 flex flex-col relative h-full min-w-0">
        {/* Navigation Bar */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 sm:px-6 bg-slate-950/40 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-lg bg-white/5 md:hidden transition-colors"
            >
              <MdMenu size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-bold text-white truncate max-w-[150px] sm:max-w-md flex items-center gap-2">
                <span>{roomName || roomId}</span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold select-none flex-shrink-0">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  <span>{onlineUsers.length}</span>
                </span>
              </h1>
              <span className="text-[10px] sm:text-xs text-gray-400">
                Logged in as <span className="text-indigo-300 font-semibold">{currentUser}</span>
              </span>
            </div>
          </div>

          <button
            onClick={handleLogOut}
            title="Leave Atmosphere"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold rounded-lg border border-rose-500/20 hover:border-transparent transition-all duration-300"
          >
            <MdExitToApp size={16} />
            <span>Leave Space</span>
          </button>
        </header>

        {/* Message Logs */}
        <div
          ref={chatBoxRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 relative"
        >
          {isLoadingMore && (
            <div className="flex justify-center py-2">
              <span className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                <svg className="animate-spin h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Syncing older messages...
              </span>
            </div>
          )}

          {messages.length === 0 && !isLoadingMore && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-slate-900/60 border border-white/10 flex items-center justify-center text-3xl mb-4 animate-bounce">
                🌌
              </div>
              <h3 className="text-lg font-bold text-white">Silence in the Atmosphere</h3>
              <p className="text-xs text-gray-400 max-w-xs mt-1">
                There are no message logs in this space yet. Send a whisper below to begin the discussion!
              </p>
            </div>
          )}

          {Object.entries(groupedMessages).map(([dateLabel, group]) => (
            <div key={dateLabel} className="space-y-4">
              {/* Date divider */}
              <div className="flex justify-center">
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/15 py-1 px-3.5 rounded-full backdrop-blur-sm shadow-sm uppercase tracking-wider">
                  {dateLabel}
                </span>
              </div>

              {/* Messages */}
              {group.map((message, index) => {
                if (message.isSystem) {
                  return (
                    <div
                      key={message.id || index}
                      className="flex w-full justify-center my-3.5 animate-[fadeIn_0.3s_ease-out] select-none"
                    >
                      <span className="text-[11px] font-bold text-gray-400 bg-slate-950/40 border border-white/5 py-1.5 px-4.5 rounded-full backdrop-blur-sm shadow-inner tracking-wide">
                        {message.content}
                      </span>
                    </div>
                  );
                }
                const isOwn = message.senderId === currentUser;
                return (
                  <div
                    key={message.id || index}
                    className={`flex w-full ${isOwn ? "justify-end animate-[slideInRight_0.2s_ease-out]" : "justify-start animate-[slideInLeft_0.2s_ease-out]"}`}
                  >
                    <div className={`flex items-start gap-3 max-w-[80%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0 mt-0.5 ${getAvatarGradient(message.senderId)}`}>
                        {message.senderId.substring(0, 2).toUpperCase()}
                      </div>

                      <div className="flex flex-col">
                        {/* Bubble */}
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm relative border ${
                            isOwn
                              ? "bg-indigo-600/70 border-indigo-500/40 text-white rounded-tr-none shadow-[0_4px_15px_rgba(99,102,241,0.15)]"
                              : "bg-slate-900/65 border-white/5 text-gray-100 rounded-tl-none"
                          }`}
                        >
                          {/* Sender name for other users */}
                          {!isOwn && (
                            <span className="text-[10px] font-black text-indigo-300 tracking-wider block mb-1">
                              @{message.senderId}
                            </span>
                          )}

                          <p className="break-words leading-relaxed whitespace-pre-wrap select-text">{message.content}</p>
                        </div>
                        
                        {/* Timestamp */}
                        <span className={`text-[9px] text-gray-400 mt-1 select-none font-semibold ${isOwn ? "text-right" : "text-left"}`}>
                          {message.sentAtDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Input Bar Section */}
        <div className="p-4 bg-gradient-to-t from-slate-950/80 to-transparent border-t border-transparent z-20">
          <div className="max-w-4xl mx-auto space-y-2 relative">
            {/* Real-time Typing Status */}
            {Object.keys(typingUsers).length > 0 && (
              <div className="absolute -top-7 left-3 flex items-center gap-1.5 text-xs text-indigo-300 font-semibold select-none bg-slate-950/80 backdrop-blur-md py-1 px-3 rounded-full border border-indigo-500/20">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
                <span>{renderTypingText()}</span>
              </div>
            )}

            <div className="flex items-end gap-2 bg-slate-900/75 border border-white/10 rounded-2xl p-2 pl-3 focus-within:border-indigo-500/60 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                placeholder="Message the atmosphere..."
                className="flex-1 max-h-32 bg-transparent text-white text-sm py-2 focus:outline-none resize-none overflow-y-auto leading-relaxed"
                style={{ height: "36px" }}
              />

              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="p-2.5 bg-gradient-primary hover:from-indigo-500 hover:to-purple-600 disabled:from-indigo-500/20 disabled:to-purple-500/20 text-white disabled:text-gray-500 rounded-xl transition-all duration-300 transform active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-md shadow-indigo-500/10 flex-shrink-0"
                title="Send Message"
              >
                <MdSend size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;

