import { useState, useEffect } from "react";
import { MdOutlinePersonAdd } from "react-icons/md";
import { toast } from "react-hot-toast";
import { createContact, getContacts, getCountryCodes } from "../../services/RoomService";
import AvatarBadge from "../ui/AvatarBadge";
import EmptyState from "../ui/EmptyState";
import SpinnerButton from "../ui/SpinnerButton";

const DEFAULT_COUNTRY_CODES = [
  { code: "+91", country: "IN", name: "India" },
  { code: "+1", country: "US", name: "USA/Canada" },
  { code: "+44", country: "GB", name: "UK" },
  { code: "+61", country: "AU", name: "Australia" },
  { code: "+49", country: "DE", name: "Germany" },
  { code: "+33", country: "FR", name: "France" },
  { code: "+81", country: "JP", name: "Japan" },
  { code: "+971", country: "AE", name: "UAE" },
  { code: "+65", country: "SG", name: "Singapore" },
];

const AddContactModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ contactName: "" });
  const [countryCodes, setCountryCodes] = useState(DEFAULT_COUNTRY_CODES);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [phoneRest, setPhoneRest] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCountryCodes = async () => {
      try {
        const data = await getCountryCodes();
        if (!data || !Array.isArray(data)) return;
        
        const list = [];
        data.forEach(country => {
          const root = country.idd?.root || "";
          const suffixes = country.idd?.suffixes || [];
          const name = country.name?.common || "";
          const cca2 = country.cca2 || "";
          
          if (root) {
            let dialCode = "";
            if (root === "+1" || root === "+7" || suffixes.length > 10) {
              dialCode = root;
            } else if (suffixes.length > 0) {
              dialCode = root + suffixes[0];
            } else {
              dialCode = root;
            }
            
            list.push({
              code: dialCode,
              country: cca2,
              name: name
            });
          }
        });
        
        const uniqueList = Array.from(new Map(list.map(item => [`${item.country}-${item.code}`, item])).values());
        uniqueList.sort((a, b) => a.name.localeCompare(b.name));
        
        if (uniqueList.length > 0) {
          setCountryCodes(uniqueList);
        }
      } catch (err) {
        console.warn("Failed to fetch country codes, using fallback", err);
      }
    };
    fetchCountryCodes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalMobile = selectedCountryCode + phoneRest.trim();
    if (!finalMobile || !form.contactName.trim()) {
      toast.error("Please fill in all contact fields");
      return;
    }
    setLoading(true);
    try {
      await createContact({ mobileNumber: finalMobile, contactName: form.contactName.trim() });
      toast.success("Contact added successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save contact");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="glass-card border border-white/10 w-full max-w-sm p-6 rounded-2xl shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <MdOutlinePersonAdd className="text-orange-400" /> Add New Contact
        </h3>
        <p className="text-[10px] text-gray-400 mb-5">Save a user to your dashboard directory list.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mobile Number Field */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mobile Number</label>
            <div className="flex gap-2">
              <div className="relative flex-shrink-0 w-36">
                <select
                  value={selectedCountryCode}
                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                  className="glass-input w-full px-2.5 py-2 rounded-xl text-xs focus:outline-none bg-slate-900 border border-white/10 text-white cursor-pointer appearance-none text-center font-bold pr-5"
                >
                  {countryCodes.map((c) => (
                    <option key={`${c.country}-${c.code}`} value={c.code} className="bg-slate-950 text-white">
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-1.5 flex items-center pointer-events-none text-[8px] text-gray-400">▼</span>
              </div>
              <input
                type="text"
                value={phoneRest}
                onChange={(e) => setPhoneRest(e.target.value.replace(/\D/g, ""))}
                placeholder="98765 43210"
                className="glass-input flex-grow px-3.5 py-2 rounded-xl text-xs focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Nickname Field */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Nickname</label>
            <input
              type="text"
              value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              placeholder="e.g. Prajwal Koppad"
              className="glass-input w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none"
              required
            />
          </div>

          <div className="flex gap-2 justify-end pt-3">
            <button type="button" onClick={onClose} className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-xl border border-white/10 transition-all">
              Cancel
            </button>
            <SpinnerButton loading={loading} loadingText="Saving..." className="w-auto px-4 py-2 bg-gradient-secondary text-xs rounded-xl shadow">
              Save Contact
            </SpinnerButton>
          </div>
        </form>
      </div>
    </div>
  );
};

const ContactsTab = ({ contacts, searchQuery, onStartChat, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const filtered = contacts.filter(
    (c) =>
      (c.savedContactName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.contactUsername || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs text-gray-400 font-bold">Your Saved Contacts</span>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600 text-orange-300 hover:text-white text-xs font-bold rounded-lg border border-orange-500/20 hover:border-transparent transition-all active:scale-95"
        >
          <MdOutlinePersonAdd size={16} /> New Contact
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-2">
        {filtered.length === 0 ? (
          <EmptyState message="No contacts saved yet." />
        ) : (
          filtered.map((contact) => {
            const name = contact.savedContactName || contact.defaultDisplayName || contact.contactUsername || "?";
            const uname = contact.contactUsername || "";
            return (
              <div key={contact.id || uname} className="glass-card border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <AvatarBadge name={uname || name} />
                  <div>
                    <h3 className="text-sm font-bold text-white">{name}</h3>
                    {uname && <span className="text-[10px] text-gray-400 font-semibold block">@{uname}</span>}
                    {contact.mobileNumber && <span className="text-[9px] text-indigo-300 font-mono mt-0.5 block">{contact.mobileNumber}</span>}
                  </div>
                </div>
                <button
                  onClick={() => onStartChat(uname)}
                  disabled={!uname}
                  className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold rounded-lg border border-indigo-500/20 hover:border-transparent transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Message
                </button>
              </div>
            );
          })
        )}
      </div>

      {showModal && <AddContactModal onClose={() => setShowModal(false)} onSuccess={onRefresh} />}
    </div>
  );
};

export default ContactsTab;
