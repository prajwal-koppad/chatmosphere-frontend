import { useOutletContext } from "react-router";
import RoomActionsTab from "./RoomActionsTab";

const RoomActionsPage = () => {
  const { contacts } = useOutletContext();
  return <RoomActionsTab contacts={contacts} />;
};

export default RoomActionsPage;
