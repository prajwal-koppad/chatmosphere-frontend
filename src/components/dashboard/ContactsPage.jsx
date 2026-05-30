import { useOutletContext, useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { createPersonalRoom } from "../../services/RoomService";
import useChatContext from "../../context/ChatContext";
import ContactsTab from "./ContactsTab";
import { useState } from "react";

const ContactsPage = () => {
  const { contacts, searchQuery, sync } = useOutletContext();
  const { setRoomId, setConnected } = useChatContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartChat = async (uname) => {
    if (!uname) return;
    setLoading(true);
    try {
      const room = await createPersonalRoom(uname);
      toast.success(`DM started with @${uname}`);
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to start personal chat");
    } finally { setLoading(false); }
  };

  return <ContactsTab contacts={contacts} searchQuery={searchQuery} onStartChat={handleStartChat} onRefresh={sync} />;
};

export default ContactsPage;
