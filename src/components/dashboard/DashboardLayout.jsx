import { useEffect, useState, useCallback, useRef } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router";
import { toast } from "react-hot-toast";
import { MdChat, MdPerson, MdAdd, MdLogout, MdSearch } from "react-icons/md";
import useChatContext from "../../context/ChatContext";
import { getRooms, getContacts } from "../../services/RoomService";
import chatIcon from "../../assets/chat-icon.png";

const PRESET_AVATARS = {
  "grad-1": "bg-gradient-to-tr from-purple-600 to-indigo-400",
  "grad-2": "bg-gradient-to-tr from-emerald-600 to-teal-400",
  "grad-3": "bg-gradient-to-tr from-orange-600 to-amber-300",
  "grad-4": "bg-gradient-to-tr from-blue-600 to-cyan-400",
  "grad-5": "bg-gradient-to-tr from-rose-600 to-pink-400",
};

const NAV_ITEMS = [
  { to: "/active-chats", label: "Active Chats", icon: MdChat,   matchExact: true },
  { to: "/contacts",     label: "Contacts",     icon: MdPerson, matchExact: false },
];

const ACTIVE_CLASSES = {
  "/active-chats": "bg-gradient-primary text-white shadow-lg shadow-indigo-500/15",
  "/contacts":     "bg-gradient-secondary text-white shadow-lg shadow-orange-500/15",
  "/rooms/join":    "bg-white/10 text-white",
  "/rooms/create":  "bg-white/10 text-white",
};

const DashboardLayout = () => {
  const { currentUser, displayName, avatarUrl, logout, connected, roomId } = useChatContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [rooms, setRooms] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // Initial full data sync (contacts + users don't support server-side search)
  const syncAll = useCallback(async () => {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([getRooms(""), getContacts()]);
      setRooms(r || []);
      setContacts(c || []);
    } catch {
      toast.error("Error loading workspace");
    } finally {
      setLoading(false);
    }
  }, []);

  // Rooms support server-side search — debounce the API call
  const searchRooms = useCallback(async (query) => {
    try {
      const r = await getRooms(query);
      setRooms(r || []);
    } catch {
      /* silent — don't toast on search errors */
    }
  }, []);

  useEffect(() => {
    if (currentUser) syncAll();
  }, [currentUser, syncAll]);

  // Redirect if already in an active room
  useEffect(() => {
    if (connected && roomId) navigate("/chat");
  }, [connected, roomId, navigate]);

  // Debounced rooms search (500ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchRooms(searchQuery);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, searchRooms]);

  // Determine active nav from current pathname
  const activePath = location.pathname;
  const isNavActive = (to, exact) =>
    exact ? activePath === to : activePath.startsWith(to);
  const isActions = activePath.startsWith("/rooms");

  const avatarClass = PRESET_AVATARS[avatarUrl] || "bg-gradient-to-tr from-gray-600 to-gray-400";
  const initials = (displayName || currentUser || "U").substring(0, 2).toUpperCase();

  const navLinkClass = (to, exact = false) => {
    const active = isNavActive(to, exact);
    const activeClass = ACTIVE_CLASSES[to] || "bg-white/10 text-white";
    return `flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl w-full transition-all ${
      active ? activeClass : "text-gray-400 hover:text-white hover:bg-white/5"
    }`;
  };

  return (
    <div className="cosmic-bg flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 md:p-10 relative overflow-x-hidden">
      <div className="glow-spot-1" /><div className="glow-spot-2" />

      {/* Profile bar */}
      <div className="fixed top-4 right-4 z-20 flex items-center gap-2 sm:gap-3 bg-slate-900/60 backdrop-blur-md p-1.5 pl-2 pr-3 sm:p-2 sm:pl-3 sm:pr-4 rounded-full border border-white/10 shadow-lg">
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${avatarClass} flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow`}>{initials}</div>
        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-semibold text-white leading-tight">{displayName || currentUser}</span>
          <span className="text-[10px] text-gray-400 leading-none">@{currentUser}</span>
        </div>
        <button onClick={logout} title="Sign Out" className="ml-1 sm:ml-2 text-gray-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-white/5">
          <MdLogout size={16} />
        </button>
      </div>

      {/* Brand */}
      <div className="flex flex-col items-center mt-12 mb-8 z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center p-2.5 shadow-lg mb-3">
          <img src={chatIcon} alt="Chatmosphere" className="w-full h-full object-contain filter invert" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Chat<span className="text-gradient-purple font-black">mosphere</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1.5">Select an active chat space or connect with new contacts</p>
      </div>

      {/* Main card */}
      <div className="glass-card w-full max-w-5xl rounded-2xl shadow-2xl relative z-10 flex flex-col md:flex-row min-h-[500px] border border-white/10 overflow-hidden">

        {/* Sidebar Nav */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-5 bg-slate-950/20 flex flex-row md:flex-col justify-between overflow-x-auto md:overflow-x-visible">
          <div className="flex flex-row md:flex-col gap-2 w-full">
            {NAV_ITEMS.map(({ to, label, icon: Icon, matchExact }) => (
              <Link key={to} to={to} className={navLinkClass(to, matchExact)} onClick={() => setSearchQuery("")}>
                <Icon size={18} />
                <span>{label}</span>
                {label === "Active Chats" && rooms.length > 0 && (
                  <span className="ml-auto bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">{rooms.length}</span>
                )}
                {label === "Contacts" && contacts.length > 0 && (
                  <span className="ml-auto bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">{contacts.length}</span>
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex flex-col gap-2 w-full mt-2">
            <Link to="/rooms/join" className={navLinkClass("/rooms/join") + " border border-dashed border-white/20"}>
              <MdAdd size={18} /><span>Join or Create Room</span>
            </Link>
            <button onClick={syncAll} disabled={loading} className="text-xs text-gray-500 hover:text-gray-300 py-2 text-center transition-all disabled:opacity-50">
              {loading ? "Syncing..." : "Sync workspace"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8 flex flex-col bg-slate-900/40 relative">
          {!isActions && (
            <div className="relative mb-6">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none"><MdSearch size={18} /></span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activePath === "/contacts" ? "Search contacts..." :
                  activePath === "/users" ? "Search users..." :
                  "Search chats..."
                }
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none"
              />
            </div>
          )}

          {loading && rooms.length === 0 && contacts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-indigo-400 mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs text-gray-400 font-semibold">Synchronizing space...</span>
            </div>
          ) : (
            <Outlet context={{ rooms, contacts, searchQuery, sync: syncAll }} />
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-[10px] text-gray-500 font-semibold z-10">
        Chatmosphere Space. Crafted with <span className="text-red-400">♥</span>.
      </div>
    </div>
  );
};

export default DashboardLayout;
