import { useOutletContext } from "react-router";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import useChatContext from "../../context/ChatContext";
import { createPersonalRoom } from "../../services/RoomService";
import ChatsTab from "./ChatsTab";

const ChatsPage = () => {
  const { rooms, searchQuery } = useOutletContext();
  const { setRoomId, setConnected } = useChatContext();
  const navigate = useNavigate();

  const handleSelectRoom = (rId, rName) => {
    toast.success(`Entering Space: ${rName}`);
    setRoomId(rId);
    setConnected(true);
    navigate("/chat");
  };

  return <ChatsTab rooms={rooms} searchQuery={searchQuery} onSelectRoom={handleSelectRoom} />;
};

export default ChatsPage;
