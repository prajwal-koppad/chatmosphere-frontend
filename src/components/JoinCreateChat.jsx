import React, { useEffect, useState } from "react";
import chatIcon from "../assets/chat-icon.png";
import { toast } from "react-hot-toast";
import {
  createRoom as createRoomApi,
  joinRoom,
  getRooms,
  getContacts,
  createContact,
  getUsers,
  createPersonalRoom,
} from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import {
  MdOutlineKey,
  MdLabel,
  MdMeetingRoom,
  MdLogout,
  MdAdd,
  MdChat,
  MdGroup,
  MdPerson,
  MdSearch,
  MdOutlinePersonAdd,
  MdCheckCircle,
  MdFolderShared,
  MdSettings,
} from "react-icons/md";

// Preset classes corresponding to registration gradients
const PRESET_AVATARS_MAP = {
  "grad-1": "bg-gradient-to-tr from-purple-600 to-indigo-400",
  "grad-2": "bg-gradient-to-tr from-emerald-600 to-teal-400",
  "grad-3": "bg-gradient-to-tr from-orange-600 to-amber-300",
  "grad-4": "bg-gradient-to-tr from-blue-600 to-cyan-400",
  "grad-5": "bg-gradient-to-tr from-rose-600 to-pink-400",
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
    logout,
  } = useChatContext();

  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "contacts" | "users" | "actions"
  const [rooms, setRooms] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState(new Set());

  const [roomDetails, setRoomDetails] = useState({ roomId: "", roomName: "" });
  const [contactForm, setContactForm] = useState({
    mobileNumber: "",
    contactName: "",
  });
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lobbyLoading, setLobbyLoading] = useState(false);

  const navigate = useNavigate();

  // Load all rooms, contacts, and users on mount
  const syncDashboardData = async () => {
    setLobbyLoading(true);
    try {
      const [roomsData, contactsData, usersData] = await Promise.all([
        getRooms(),
        getContacts(),
        getUsers(),
      ]);
      setRooms(roomsData || []);
      setContacts(contactsData || []);
      setUsers(usersData || []);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      toast.error("Error loading chat workspace");
    } finally {
      setLobbyLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      syncDashboardData();
    }
  }, [currentUser]);

  // Navigate to active chat if connected
  useEffect(() => {
    if (connected && roomId) {
      navigate("/chat");
    }
  }, [connected, roomId, navigate]);

  function handleInputChange(event) {
    const { name, value } = event.target;
    // Don't allow spaces in the Room ID field at all, keep display name as is
    const processedValue = name === "roomId" ? value.replace(/\s/g, "") : value;

    setRoomDetails({
      ...roomDetails,
      [name]: processedValue,
    });
  }

  const handleSelectRoom = (rId, rName) => {
    toast.success(`Entering Space: ${rName}`);
    setRoomId(rId);
    setConnected(true);
    navigate("/chat");
  };

  const handleStartPersonalChat = async (recipientUsername) => {
    setLoading(true);
    try {
      const room = await createPersonalRoom(recipientUsername);
      toast.success(`DM started with @${recipientUsername}`);
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to start personal chat"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.mobileNumber.trim() || !contactForm.contactName.trim()) {
      toast.error("Please fill in all contact fields");
      return;
    }
    setLoading(true);
    try {
      await createContact({
        mobileNumber: contactForm.mobileNumber.trim(),
        contactName: contactForm.contactName.trim(),
      });
      toast.success(`Contact added successfully!`);
      setContactForm({ mobileNumber: "", contactName: "" });
      setShowAddContactModal(false);
      // Refresh data
      const contactsData = await getContacts();
      setContacts(contactsData || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save contact");
    } finally {
      setLoading(false);
    }
  };

  async function handleJoinChat(e) {
    e.preventDefault();
    if (!roomDetails.roomId) {
      toast.error("Please enter a Room ID");
      return;
    }

    setLoading(true);
    try {
      const room = await joinRoom(roomDetails.roomId);
      toast.success(`Joined room: ${room.roomName}`);
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      console.error(error);
      const errMsg =
        error?.response?.data?.message ||
        "Room not found. Check the ID and try again.";
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

    setLoading(true);
    try {
      const response = await createRoomApi({
        roomId: roomDetails.roomId,
        roomName: roomDetails.roomName,
        participantUsernames: Array.from(selectedParticipants),
      });
      toast.success("Room created successfully!");
      setRoomId(response.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      console.error(error);
      const errMsg =
        error?.response?.data?.message ||
        "Failed to create room. Room ID might already be taken.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }

  const toggleParticipant = (username) => {
    setSelectedParticipants((prev) => {
      const next = new Set(prev);
      if (next.has(username)) {
        next.delete(username);
      } else {
        next.add(username);
      }
      return next;
    });
  };

  const getAvatarGradient = (userStr) => {
    const hash = userStr
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      "from-purple-600 to-indigo-400",
      "from-emerald-600 to-teal-400",
      "from-orange-600 to-amber-300",
      "from-blue-600 to-cyan-400",
      "from-rose-600 to-pink-400",
    ];
    return `bg-gradient-to-tr ${gradients[hash % gradients.length]}`;
  };

  const filteredRooms = rooms.filter(
    (r) =>
      (r.roomName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.roomId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter(
    (c) =>
      (c.savedContactName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (c.contactUsername || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      (u.displayName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avatarClass =
    PRESET_AVATARS_MAP[avatarUrl] ||
    "bg-gradient-to-tr from-gray-600 to-gray-400";
  const userInitials = displayName
    ? displayName.substring(0, 2).toUpperCase()
    : currentUser
    ? currentUser.substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="cosmic-bg flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 md:p-10 relative overflow-x-hidden">
      <div className="glow-spot-1"></div>
      <div className="glow-spot-2"></div>

      {/* Floating profile bar */}
      <div className="fixed top-4 right-4 z-20 flex items-center gap-2 sm:gap-3 bg-slate-900/60 backdrop-blur-md p-1.5 pl-2 pr-3 sm:p-2 sm:pl-3 sm:pr-4 rounded-full border border-white/10 shadow-lg">
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${avatarClass} flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow`}
        >
          {userInitials}
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-semibold text-white leading-tight">
            {displayName || currentUser}
          </span>
          <span className="text-[10px] text-gray-400 leading-none">
            @{currentUser}
          </span>
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          className="ml-1 sm:ml-2 text-gray-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-white/5"
        >
          <MdLogout size={16} />
        </button>
      </div>

      {/* Brand header */}
      <div className="flex flex-col items-center mt-12 mb-8 z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center p-2.5 shadow-lg mb-3">
          <img
            src={chatIcon}
            alt="Chatmosphere Logo"
            className="w-full h-full object-contain filter invert"
          />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Chat<span className="text-gradient-purple font-black">mosphere</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1.5">
          Select an active chat space or connect with new contacts
        </p>
      </div>

      {/* Main dashboard card */}
      <div className="glass-card w-full max-w-5xl rounded-2xl shadow-2xl relative z-10 flex flex-col md:flex-row min-h-[500px] border border-white/10 overflow-hidden">
        {/* Navigation Sidebar inside card */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-5 bg-slate-950/20 flex flex-row md:flex-col justify-between overflow-x-auto md:overflow-x-visible">
          <div className="flex flex-row md:flex-col gap-2 w-full">
            <button
              onClick={() => {
                setActiveTab("chats");
                setSearchQuery("");
              }}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl w-full transition-all ${
                activeTab === "chats"
                  ? "bg-gradient-primary text-white shadow-lg shadow-indigo-500/15"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <MdChat size={18} />
              <span>Active Chats</span>
              {rooms.length > 0 && (
                <span className="ml-auto bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {rooms.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("contacts");
                setSearchQuery("");
              }}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl w-full transition-all ${
                activeTab === "contacts"
                  ? "bg-gradient-secondary text-white shadow-lg shadow-orange-500/15"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <MdPerson size={18} />
              <span>Contacts</span>
              {contacts.length > 0 && (
                <span className="ml-auto bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {contacts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("users");
                setSearchQuery("");
              }}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl w-full transition-all ${
                activeTab === "users"
                  ? "bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-lg shadow-cyan-500/15"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <MdFolderShared size={18} />
              <span>User Directory</span>
            </button>
          </div>

          <div className="hidden md:flex flex-col gap-2 w-full">
            <button
              onClick={() => {
                setActiveTab("actions");
                setSearchQuery("");
              }}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl w-full border border-dashed border-white/20 transition-all ${
                activeTab === "actions"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <MdAdd size={18} />
              <span>Join or Create Room</span>
            </button>
            <button
              onClick={syncDashboardData}
              disabled={lobbyLoading}
              className="text-xs text-gray-500 hover:text-gray-300 py-2 text-center transition-all disabled:opacity-50"
            >
              {lobbyLoading ? "Syncing..." : "Sync workspace"}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8 flex flex-col bg-slate-900/40 relative">
          {/* Search bar (visible for lists) */}
          {activeTab !== "actions" && (
            <div className="relative mb-6">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                <MdSearch size={18} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none"
              />
            </div>
          )}

          {/* Loader */}
          {lobbyLoading && rooms.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <svg
                className="animate-spin h-8 w-8 text-indigo-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-xs text-gray-400 font-semibold">
                Synchronizing space...
              </span>
            </div>
          ) : (
            <>
              {/* TAB 1: ACTIVE CHATS */}
              {activeTab === "chats" && (
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[450px] pr-2">
                  {filteredRooms.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-sm text-gray-400">
                        No active chats found.
                      </p>
                      <button
                        onClick={() => setActiveTab("actions")}
                        className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-bold underline"
                      >
                        Join or create a room to get started
                      </button>
                    </div>
                  ) : (
                    filteredRooms.map((room) => {
                      const isGroup = room.group;
                      const displayName = room.roomName || room.roomId;

                      return (
                        <div
                          key={room.roomId}
                          onClick={() =>
                            handleSelectRoom(room.roomId, displayName)
                          }
                          className="glass-card hover:bg-white/5 border border-white/5 hover:border-white/10 p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] group shadow-sm"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {isGroup ? (
                              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white shadow-md">
                                <MdGroup size={20} />
                              </div>
                            ) : (
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md ${getAvatarGradient(
                                  room.recipient?.username || room.roomId
                                )}`}
                              >
                                {(
                                  room.recipient?.displayName ||
                                  room.recipient?.username ||
                                  "D"
                                )
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                                {displayName}
                              </h3>
                              <span className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                                {isGroup ? (
                                  <>
                                    <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.5 rounded font-black scale-90">
                                      GROUP
                                    </span>
                                    <span>Code: {room.roomId}</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="bg-orange-500/10 text-orange-300 border border-orange-500/20 px-1.5 py-0.5 rounded font-black scale-90">
                                      DIRECT
                                    </span>
                                    <span>@{room.recipient?.username}</span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="text-[10px] text-gray-500 font-semibold">
                            Open Chat
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 2: CONTACTS */}
              {activeTab === "contacts" && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-gray-400 font-bold">
                      Your Saved Contacts
                    </span>
                    <button
                      onClick={() => setShowAddContactModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600 text-orange-300 hover:text-white text-xs font-bold rounded-lg border border-orange-500/20 hover:border-transparent transition-all active:scale-95"
                    >
                      <MdOutlinePersonAdd size={16} />
                      <span>New Contact</span>
                    </button>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-2">
                    {filteredContacts.length === 0 ? (
                      <div className="text-center py-16">
                        <p className="text-sm text-gray-400">
                          No contacts saved yet.
                        </p>
                      </div>
                    ) : (
                      filteredContacts.map((contact) => {
                        const contactKey =
                          contact.id ||
                          contact.contactUsername ||
                          Math.random();
                        const contactDisplayName =
                          contact.savedContactName ||
                          contact.defaultDisplayName ||
                          contact.contactUsername ||
                          "?";
                        const contactUsername = contact.contactUsername || "";
                        return (
                          <div
                            key={contactKey}
                            className="glass-card border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md ${getAvatarGradient(
                                  contactUsername || "default"
                                )}`}
                              >
                                {contactDisplayName
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-white">
                                  {contactDisplayName}
                                </h3>
                                {contactUsername && (
                                  <span className="text-[10px] text-gray-400 font-semibold block">
                                    @{contactUsername}
                                  </span>
                                )}
                                {contact.mobileNumber && (
                                  <span className="text-[9px] text-indigo-300 font-mono mt-0.5 block">
                                    {contact.mobileNumber}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleStartPersonalChat(contactUsername)
                                }
                                disabled={loading || !contactUsername}
                                className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold rounded-lg border border-indigo-500/20 hover:border-transparent transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Message
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: USER DIRECTORY */}
              {activeTab === "users" && (
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[420px] pr-2">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-sm text-gray-400">
                        No other registered users found.
                      </p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => {
                      const userKey =
                        user.username || user.email || Math.random();
                      const userLabel =
                        user.displayName || user.username || "Unknown";
                      const uname = user.username || "";
                      return (
                        <div
                          key={userKey}
                          className="glass-card border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md ${getAvatarGradient(
                                uname || "default"
                              )}`}
                            >
                              {userLabel.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white">
                                {userLabel}
                              </h3>
                              {uname && (
                                <span className="text-[10px] text-gray-400 font-semibold block">
                                  @{uname}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setContactForm({
                                  mobileNumber: user.mobileNumber || "",
                                  contactName: userLabel,
                                });
                                setShowAddContactModal(true);
                              }}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold rounded-lg border border-white/10 transition-all active:scale-95"
                            >
                              Save Contact
                            </button>
                            <button
                              onClick={() => handleStartPersonalChat(uname)}
                              disabled={loading || !uname}
                              className="px-3.5 py-1.5 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white text-xs font-bold rounded-lg border border-cyan-500/20 hover:border-transparent transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Chat
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 4: ACTIONS (JOIN/CREATE) */}
              {activeTab === "actions" && (
                <div className="flex-1 flex flex-col md:flex-row gap-6">
                  {/* Join Card */}
                  <div className="flex-1 bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                        <MdOutlineKey className="text-indigo-400" />
                        <span>Join Space</span>
                      </h3>
                      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                        Enter a unique code key to join an active group space.
                      </p>

                      <form onSubmit={handleJoinChat} className="space-y-4">
                        <input
                          type="text"
                          name="roomId"
                          value={roomDetails.roomId}
                          onChange={handleInputChange}
                          placeholder="e.g. room-abc"
                          className="glass-input w-full px-4 py-2.5 rounded-xl text-xs focus:outline-none"
                          required
                        />
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-primary hover:from-indigo-500 hover:to-purple-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                        >
                          <MdMeetingRoom size={16} />
                          <span>Enter Room</span>
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Create Card */}
                  <div className="flex-1 bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col justify-between max-h-[420px] overflow-y-auto">
                    <div>
                      <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                        <MdLabel className="text-orange-400" />
                        <span>Create Group Space</span>
                      </h3>
                      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                        Spin up a new secure channel. Invite group members
                        below.
                      </p>

                      <form onSubmit={handleCreateRoom} className="space-y-4">
                        <input
                          type="text"
                          name="roomId"
                          value={roomDetails.roomId}
                          onChange={handleInputChange}
                          placeholder="New Room ID Key (e.g. key-123)"
                          className="glass-input w-full px-4 py-2.5 rounded-xl text-xs focus:outline-none"
                          required
                        />
                        <input
                          type="text"
                          name="roomName"
                          value={roomDetails.roomName}
                          onChange={handleInputChange}
                          placeholder="Group display name"
                          className="glass-input w-full px-4 py-2.5 rounded-xl text-xs focus:outline-none"
                          required
                        />

                        {/* Invite list */}
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">
                            Invite Contacts
                          </span>
                          <div className="max-h-28 overflow-y-auto space-y-2 border border-white/5 bg-slate-950/20 p-2.5 rounded-xl">
                            {contacts.length === 0 ? (
                              <span className="text-[10px] text-gray-500 block text-center py-2">
                                No saved contacts
                              </span>
                            ) : (
                              contacts.map((contact) => {
                                const cu = contact.contactUsername || "";
                                const cName =
                                  contact.savedContactName ||
                                  contact.defaultDisplayName ||
                                  cu ||
                                  "?";
                                const isChecked = selectedParticipants.has(cu);
                                if (!cu) return null;
                                return (
                                  <div
                                    key={cu}
                                    onClick={() => toggleParticipant(cu)}
                                    className={`flex items-center justify-between p-1.5 px-2.5 rounded-lg cursor-pointer transition-colors ${
                                      isChecked
                                        ? "bg-indigo-500/10 border border-indigo-500/20"
                                        : "hover:bg-white/5 border border-transparent"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${getAvatarGradient(
                                          cu || "default"
                                        )}`}
                                      >
                                        {cName.substring(0, 1).toUpperCase()}
                                      </div>
                                      <span className="text-[11px] text-gray-200 font-semibold">
                                        {cName}
                                      </span>
                                    </div>
                                    {isChecked && (
                                      <MdCheckCircle
                                        className="text-indigo-400"
                                        size={14}
                                      />
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-secondary hover:from-orange-500 hover:to-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                        >
                          <MdAdd size={18} />
                          <span>Create Space</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Contact Modal Dialog */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="glass-card border border-white/10 w-full max-w-sm p-6 rounded-2xl shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <MdOutlinePersonAdd className="text-orange-400" />
              <span>Add New Contact</span>
            </h3>
            <p className="text-[10px] text-gray-400 mb-5">
              Save a user to your dashboard directory list.
            </p>

            <form onSubmit={handleAddContactSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={contactForm.mobileNumber}
                  onChange={(e) =>
                    setContactForm({
                      ...contactForm,
                      mobileNumber: e.target.value,
                    })
                  }
                  placeholder="e.g. +1234567890"
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Contact Nickname
                </label>
                <input
                  type="text"
                  value={contactForm.contactName}
                  onChange={(e) =>
                    setContactForm({
                      ...contactForm,
                      contactName: e.target.value,
                    })
                  }
                  placeholder="e.g. Prajwal Koppad"
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold rounded-xl border border-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-secondary hover:from-orange-500 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer support */}
      <div className="mt-8 text-center text-[10px] text-gray-500 font-semibold z-10">
        Chatmosphere Space. Crafted with <span className="text-red-400">♥</span>{" "}.
      </div>
    </div>
  );
};

export default JoinCreateChat;
