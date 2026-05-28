import React, { useEffect, useState } from "react";
import chatIcon from "../assets/chat-icon.png";
import { toast } from "react-hot-toast";
import { createRoom as createRoomApi, joinRoom } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import { MdOutlineKey, MdLabel, MdMeetingRoom, MdLogout } from "react-icons/md";

// Preset classes corresponding to registration gradients
const PRESET_AVATARS_MAP = {
  "grad-1": "bg-gradient-to-tr from-purple-600 to-indigo-400",
  "grad-2": "bg-gradient-to-tr from-emerald-600 to-teal-400",
  "grad-3": "bg-gradient-to-tr from-orange-600 to-amber-300",
  "grad-4": "bg-gradient-to-tr from-blue-600 to-cyan-400",
  "grad-5": "bg-gradient-to-tr from-rose-600 to-pink-400"
};

const JoinCreateChat = () => {
  const {
    roomId,
    setRoomId,
    connected,
    setConnected,
    currentUser,
    displayName,
    avatarUrl,
    logout
  } = useChatContext();

  const [activeTab, setActiveTab] = useState("join"); // "join" | "create"
  const [roomDetails, setRoomDetails] = useState({
    roomId: "",
    roomName: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (connected && roomId) {
      navigate("/chat");
    }
  }, [connected, roomId, navigate]);

  function handleInputChange(event) {
    setRoomDetails({
      ...roomDetails,
      [event.target.name]: event.target.value.trim(),
    });
  }

  async function handleJoinChat(e) {
    e.preventDefault();
    if (!roomDetails.roomId) {
      toast.error("Please enter a Room ID");
      return;
    }

    setLoading(true);
    try {
      // Fetch room details from backend to verify it exists
      const room = await joinRoom(roomDetails.roomId);
      toast.success(`Joined room: ${room.roomName}`);
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      console.error(error);
      const errMsg = error?.response?.data?.message || "Room not found. Check the ID and try again.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRoom(e) {
    e.preventDefault();
    if (!roomDetails.roomId || !roomDetails.roomName) {
      toast.error("Room ID and Room Name are required");
      return;
    }

    if (roomDetails.roomId.length < 3 || roomDetails.roomId.length > 50) {
      toast.error("Room ID must be between 3 and 50 characters");
      return;
    }

    if (roomDetails.roomName.length < 3 || roomDetails.roomName.length > 100) {
      toast.error("Room Name must be between 3 and 100 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await createRoomApi({
        roomId: roomDetails.roomId,
        roomName: roomDetails.roomName
      });
      toast.success("Room created successfully!");
      setRoomId(response.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      console.error(error);
      const errMsg = error?.response?.data?.message || "Failed to create room. Room ID might already be taken.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }

  const avatarClass = PRESET_AVATARS_MAP[avatarUrl] || "bg-gradient-to-tr from-gray-600 to-gray-400";
  const userInitials = displayName ? displayName.substring(0, 2).toUpperCase() : (currentUser ? currentUser.substring(0, 2).toUpperCase() : "U");

  return (
    <div className="cosmic-bg flex flex-col items-center justify-center p-4 min-h-screen">
      <div className="glow-spot-1"></div>
      <div className="glow-spot-2"></div>

      {/* Profile Card Header */}
      <div className="fixed top-4 right-4 z-20 flex items-center gap-2 sm:gap-3 bg-slate-900/60 backdrop-blur-md p-1.5 pl-2 pr-3 sm:p-2 sm:pl-3 sm:pr-4 rounded-full border border-white/10 shadow-lg">
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${avatarClass} flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow`}>
          {userInitials}
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-semibold text-white leading-tight">{displayName || currentUser}</span>
          <span className="text-[10px] text-gray-400 leading-none">@{currentUser}</span>
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          className="ml-1 sm:ml-2 text-gray-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-white/5"
        >
          <MdLogout size={16} />
        </button>
      </div>

      <div className="glass-card w-full max-w-md p-8 md:p-10 rounded-2xl shadow-2xl relative z-10 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(99,102,241,0.15)]">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center p-2.5 shadow-lg mb-3">
            <img src={chatIcon} alt="Chatmosphere Logo" className="w-full h-full object-contain filter invert" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">
            Chat<span className="text-gradient-purple font-black">mosphere</span>
          </h1>
          <p className="text-xs text-gray-400 text-center">
            Join a conversation room or spin up a new space
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/5 mb-6">
          <button
            onClick={() => setActiveTab("join")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
              activeTab === "join"
                ? "bg-gradient-primary text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Join Room
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
              activeTab === "create"
                ? "bg-gradient-secondary text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Create Room
          </button>
        </div>

        {/* Form Area */}
        {activeTab === "join" ? (
          <form onSubmit={handleJoinChat} className="space-y-5">
            <div className="space-y-1 relative">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Room ID
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <MdOutlineKey className="text-xl" />
                </span>
                <input
                  type="text"
                  name="roomId"
                  value={roomDetails.roomId}
                  onChange={handleInputChange}
                  placeholder="Enter Room Code (e.g. room-abc)"
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-primary hover:from-indigo-500 hover:to-purple-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Entering Room...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <MdMeetingRoom className="text-lg" />
                  Join Room
                </span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreateRoom} className="space-y-5">
            <div className="space-y-1 relative">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                New Room ID
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <MdOutlineKey className="text-xl" />
                </span>
                <input
                  type="text"
                  name="roomId"
                  value={roomDetails.roomId}
                  onChange={handleInputChange}
                  placeholder="Create Room ID (min 3 chars)"
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1 relative">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Room Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <MdLabel className="text-xl" />
                </span>
                <input
                  type="text"
                  name="roomName"
                  value={roomDetails.roomName}
                  onChange={handleInputChange}
                  placeholder="Enter Friendly Room Name"
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-secondary hover:from-orange-500 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Space...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <MdMeetingRoom className="text-lg" />
                  Create & Launch
                </span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default JoinCreateChat;

