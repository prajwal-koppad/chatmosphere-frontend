import { useState } from "react";
import AvatarBadge from "../ui/AvatarBadge";
import EmptyState from "../ui/EmptyState";

const UsersTab = ({ users, searchQuery, onStartChat }) => {
  const [addForm, setAddForm] = useState(null); // holds { mobileNumber, contactName } prefill

  const filtered = users.filter(
    (u) =>
      (u.displayName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) return <EmptyState message="No other registered users found." />;

  return (
    <div className="space-y-3 overflow-y-auto max-h-[420px] pr-2">
      {filtered.map((user) => {
        const uname = user.username || "";
        const label = user.displayName || uname || "Unknown";
        return (
          <div key={uname || user.email} className="glass-card border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <AvatarBadge name={uname || "default"} />
              <div>
                <h3 className="text-sm font-bold text-white">{label}</h3>
                {uname && <span className="text-[10px] text-gray-400 font-semibold block">@{uname}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onStartChat(uname, { mobileNumber: user.mobileNumber || "", contactName: label })}
                disabled={!uname}
                className="px-3.5 py-1.5 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white text-xs font-bold rounded-lg border border-cyan-500/20 hover:border-transparent transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Chat
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UsersTab;
