import { useState, useEffect } from "react";
import { MdClose, MdPersonAdd, MdCheckCircle, MdSearch } from "react-icons/md";
import { toast } from "react-hot-toast";
import { getContacts, inviteUsersToRoom } from "../../services/RoomService";
import AvatarBadge from "./AvatarBadge";

const InviteContactsModal = ({ roomId, currentParticipants = [], onClose, onInviteSuccess }) => {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getContacts();
        setContacts(data || []);
      } catch {
        toast.error("Failed to load contacts");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const toggleSelect = (uname) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(uname) ? next.delete(uname) : next.add(uname);
      return next;
    });
  };

  const handleInvite = async () => {
    if (selected.size === 0) {
      toast.error("Select at least one contact to invite");
      return;
    }
    setLoading(true);
    try {
      await inviteUsersToRoom(roomId, Array.from(selected));
      toast.success(`Invited ${selected.size} contact${selected.size > 1 ? "s" : ""} to the room!`);
      if (onInviteSuccess) onInviteSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send invites");
    } finally {
      setLoading(false);
    }
  };

  // Filter out contacts already in the room and apply search
  const invitable = contacts.filter((c) => {
    const uname = c.contactUsername || "";
    if (!uname) return false;
    if (currentParticipants.includes(uname)) return false;
    const name = (c.savedContactName || c.defaultDisplayName || uname).toLowerCase();
    return (
      name.includes(search.toLowerCase()) ||
      uname.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass-card border border-white/10 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
              <MdPersonAdd className="text-indigo-400" size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Invite to Room</h3>
              <p className="text-[10px] text-gray-400">Select contacts to add to this space</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts..."
              className="glass-input w-full pl-8 pr-4 py-2 rounded-xl text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {fetching ? (
            <div className="flex items-center justify-center py-10">
              <svg className="animate-spin h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : invitable.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="text-3xl mb-3">👥</span>
              <p className="text-xs font-bold text-gray-300">
                {contacts.length === 0
                  ? "No saved contacts yet"
                  : "All contacts are already in this room"}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                Add contacts from the Contacts tab first
              </p>
            </div>
          ) : (
            invitable.map((contact) => {
              const uname = contact.contactUsername || "";
              const name = contact.savedContactName || contact.defaultDisplayName || uname;
              const isSelected = selected.has(uname);
              return (
                <div
                  key={uname}
                  onClick={() => toggleSelect(uname)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all duration-200 ${
                    isSelected
                      ? "bg-indigo-500/15 border-indigo-500/40 shadow-sm shadow-indigo-500/10"
                      : "border-white/5 hover:bg-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AvatarBadge name={uname || name} size="sm" />
                    <div>
                      <span className="text-xs font-bold text-white block">{name}</span>
                      <span className="text-[10px] text-gray-400">@{uname}</span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? "border-indigo-400 bg-indigo-500"
                        : "border-white/20 bg-transparent"
                    }`}
                  >
                    {isSelected && <MdCheckCircle className="text-white" size={14} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between gap-3">
          <span className="text-[10px] text-gray-400">
            {selected.size > 0
              ? `${selected.size} contact${selected.size > 1 ? "s" : ""} selected`
              : "No contacts selected"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-xl border border-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={loading || selected.size === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-primary hover:from-indigo-500 hover:to-purple-600 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Inviting...
                </>
              ) : (
                <>Invite {selected.size > 0 ? `(${selected.size})` : ""}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteContactsModal;
