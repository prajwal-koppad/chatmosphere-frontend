import { useOutletContext, useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { createPersonalRoom } from "../../services/RoomService";
import useChatContext from "../../context/ChatContext";
import UsersTab from "./UsersTab";

const UsersPage = () => {
  const { users, searchQuery } = useOutletContext();
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

  return <UsersTab users={users} searchQuery={searchQuery} onStartChat={handleStartChat} />;
};

export default UsersPage;
