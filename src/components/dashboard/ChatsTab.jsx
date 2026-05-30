import { MdGroup } from "react-icons/md";
import AvatarBadge from "../ui/AvatarBadge";
import EmptyState from "../ui/EmptyState";
import { useNavigate } from "react-router";

const ChatsTab = ({ rooms, searchQuery, onSelectRoom }) => {
  const navigate = useNavigate();
  const filtered = rooms.filter(
    (r) =>
      (r.roomName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.roomId || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0)
    return (
      <EmptyState
        message="No active chats found."
        action={{ label: "Join or create a room to get started", onClick: () => navigate("/rooms/join") }}
      />
    );

  return (
    <div className="space-y-3 overflow-y-auto max-h-[450px] pr-2">
      {filtered.map((room) => {
        const isGroup = room.group;
        const label = room.roomName || room.roomId;
        const recipientName = room.recipient?.displayName || room.recipient?.username || "D";
        const recipientUser = room.recipient?.username || room.roomId;
        return (
          <div
            key={room.roomId}
            onClick={() => onSelectRoom(room.roomId, label)}
            className="glass-card hover:bg-white/5 border border-white/5 hover:border-white/10 p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] group shadow-sm"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {isGroup ? (
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white shadow-md">
                  <MdGroup size={20} />
                </div>
              ) : (
                <AvatarBadge name={recipientUser} />
              )}
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">{label}</h3>
                <span className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                  {isGroup ? (
                    <>
                      <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.5 rounded font-black scale-90">GROUP</span>
                      <span>Code: {room.roomId}</span>
                    </>
                  ) : (
                    <>
                      <span className="bg-orange-500/10 text-orange-300 border border-orange-500/20 px-1.5 py-0.5 rounded font-black scale-90">DIRECT</span>
                      {room.recipient?.username && <span>@{room.recipient.username}</span>}
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-gray-500 font-semibold">Open Chat</div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatsTab;
