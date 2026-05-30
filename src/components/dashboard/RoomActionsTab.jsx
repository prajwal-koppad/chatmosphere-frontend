import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { toast } from "react-hot-toast";
import { MdOutlineKey, MdLabel, MdMeetingRoom, MdAdd, MdCheckCircle } from "react-icons/md";
import { createRoom as createRoomApi, joinRoom } from "../../services/RoomService";
import useChatContext from "../../context/ChatContext";
import AvatarBadge from "../ui/AvatarBadge";

const RoomActionsTab = ({ contacts }) => {
  const { setRoomId, setConnected } = useChatContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [roomDetails, setRoomDetails] = useState({ roomId: "", roomName: "" });
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const isJoin = location.pathname !== "/rooms/create";

  const handleInput = (e) => {
    const { name, value } = e.target;
    // Strip spaces entirely for roomId, allow spaces for roomName
    const processedValue = name === "roomId" ? value.replace(/\s/g, "") : value;
    setRoomDetails({ ...roomDetails, [name]: processedValue });
  };

  const toggleParticipant = (uname) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(uname) ? next.delete(uname) : next.add(uname);
      return next;
    });
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const cleanRoomId = (roomDetails.roomId || "").trim();
    if (!cleanRoomId) { toast.error("Please enter a Room ID"); return; }
    setLoading(true);
    try {
      const room = await joinRoom(cleanRoomId);
      toast.success(`Joined room: ${room.roomName}`);
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Room not found. Check the ID and try again.");
    } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const cleanRoomId = (roomDetails.roomId || "").trim();
    const cleanRoomName = (roomDetails.roomName || "").trim();
    if (!cleanRoomId || !cleanRoomName) { toast.error("Room ID and Room Name are required"); return; }
    setLoading(true);
    try {
      const room = await createRoomApi({
        roomId: cleanRoomId,
        roomName: cleanRoomName,
        participantUsernames: Array.from(selected)
      });
      toast.success("Room created successfully!");
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create room.");
    } finally { setLoading(false); }
  };

  const inputCls = "glass-input w-full px-4 py-2.5 rounded-xl text-xs focus:outline-none";
  const btnCls = "w-full text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50";

  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Tab Switcher */}
      <div className="flex justify-center mb-6 w-full">
        <div className="relative flex p-1 bg-slate-950/40 backdrop-blur-md rounded-full border border-white/10 w-72">
          {/* Sliding indicator */}
          <div
            className={`absolute top-1 bottom-1 left-1 rounded-full transition-all duration-300 ease-out bg-gradient-to-r ${
              isJoin
                ? "from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/20"
                : "from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20"
            }`}
            style={{
              width: "calc(50% - 4px)",
              transform: isJoin ? "translateX(0)" : "translateX(calc(100% + 4px))",
            }}
          />
          <button
            type="button"
            onClick={() => navigate("/rooms/join")}
            className={`relative z-10 flex-1 py-1.5 text-xs font-bold text-center rounded-full transition-colors duration-300 ${
              isJoin ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Join Space
          </button>
          <button
            type="button"
            onClick={() => navigate("/rooms/create")}
            className={`relative z-10 flex-1 py-1.5 text-xs font-bold text-center rounded-full transition-colors duration-300 ${
              !isJoin ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Create Space
          </button>
        </div>
      </div>

      {/* Render active action card */}
      <div className="w-full flex-1 flex flex-col min-h-[350px]">
        {isJoin ? (
          <div className="flex-1 bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2"><MdOutlineKey className="text-indigo-400" /> Join Space</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Enter a unique code key to join an active group space.</p>
            </div>
            <form onSubmit={handleJoin} className="space-y-4">
              <input type="text" name="roomId" value={roomDetails.roomId} onChange={handleInput} placeholder="e.g. room-abc" className={inputCls} required />
              <button type="submit" disabled={loading} className={`${btnCls} bg-gradient-primary hover:from-indigo-500 hover:to-purple-600`}>
                <MdMeetingRoom size={16} /> Enter Room
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col gap-4 max-h-[420px] overflow-y-auto">
            <div>
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2"><MdLabel className="text-orange-400" /> Create Group Space</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Spin up a new secure channel. Invite group members below.</p>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" name="roomId" value={roomDetails.roomId} onChange={handleInput} placeholder="New Room ID Key" className={inputCls} required />
              <input type="text" name="roomName" value={roomDetails.roomName} onChange={handleInput} placeholder="Group display name" className={inputCls} required />
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Invite Contacts</span>
                <div className="max-h-28 overflow-y-auto space-y-2 border border-white/5 bg-slate-950/20 p-2.5 rounded-xl">
                  {contacts.length === 0 ? (
                    <span className="text-[10px] text-gray-500 block text-center py-2">No saved contacts</span>
                  ) : (
                    contacts.map((c) => {
                      const cu = c.contactUsername || "";
                      const cName = c.savedContactName || c.defaultDisplayName || cu || "?";
                      if (!cu) return null;
                      const checked = selected.has(cu);
                      return (
                        <div key={cu} onClick={() => toggleParticipant(cu)}
                          className={`flex items-center justify-between p-1.5 px-2.5 rounded-lg cursor-pointer transition-colors ${checked ? "bg-indigo-500/10 border border-indigo-500/20" : "hover:bg-white/5 border border-transparent"}`}>
                          <div className="flex items-center gap-2">
                            <AvatarBadge name={cu} size="sm" />
                            <span className="text-[11px] text-gray-200 font-semibold">{cName}</span>
                          </div>
                          {checked && <MdCheckCircle className="text-indigo-400" size={14} />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              <button type="submit" disabled={loading} className={`${btnCls} bg-gradient-secondary hover:from-orange-500 hover:to-orange-600`}>
                <MdAdd size={18} /> Create Space
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomActionsTab;
