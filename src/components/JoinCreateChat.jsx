import React, { useEffect, useState } from "react";
import chatIcon from "../assets/chat-icon.png";
import { toast } from "react-hot-toast";
import { createRoom as createRoomApi, joinRoom } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";

const JoinCreateChat = () => {
  const [userDetail, setUserDetail] = useState({
    roomId: "",
    userName: "",
  });

  const {
    roomId,
    currentUser,
    connected,
    setRoomId,
    setCurrentUser,
    setConnected,
  } = useChatContext();

  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setUserDetail({
      ...userDetail,
      [event.target.name]: event.target.value,
    });
  }

  useEffect(() => {
    if (connected) navigate("/chat");
  }, [connected]);

  async function joinChat() {
    if (!validateForm()) return;
    try {
      const room = await joinRoom(userDetail.roomId);
      toast.success("Joined the room successfully");
      setRoomId(room?.roomId);
      setCurrentUser(userDetail.userName);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      if (error?.response) {
        toast.error(error?.response?.data?.message);
      } else {
        toast.error("Failed to join room !!!");
      }
      console.error(error);
    } 
  }

  async function createRoom() {
    if (!validateForm()) return;

    try {
      const response = await createRoomApi(userDetail);
      toast.success("Room create successfully !!!");
      console.log(response)
      setCurrentUser(userDetail.userName);
      setRoomId(response?.roomId);
      setConnected(true);
      navigate('/chat');
    } catch (error) {
      if (error?.response) {
        toast.error(error?.response?.data?.message);
      } else {
        toast.error("Failed to create room !!!");
      }
      console.error(error);
    }
  }

  function validateForm() {
    if (userDetail.roomId === "" || userDetail.userName === "") {
      toast.error("Invalid user name or room ID !!!");
      return false;
    }
    return true;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-10 dark:border-gray-700 border w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-900 shadow">
        <div>
          <img src={chatIcon} className="w-24 mx-auto" />
        </div>
        <h1 className="text-2xl font-semibold text-center">
          Join Room / Create Room
        </h1>

        <div className="">
          <label htmlFor="name" className="block font-medium mb-2">
            Your Name
          </label>
          <input
            onChange={handleFormInputChange}
            value={userDetail.userName}
            type="text"
            id="name"
            name="userName"
            placeholder="Enter your name"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="">
          <label htmlFor="name" className="block font-medium mb-2">
            Room ID / New Room ID
          </label>
          <input
            onChange={handleFormInputChange}
            value={userDetail.roomId}
            type="text"
            id="roomId"
            name="roomId"
            placeholder="Enter your room ID"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-center gap-2 mt-2">
          <button
            onClick={joinChat}
            className="px-3 py-2 dark:bg-blue-500 hover:dark:bg-blue-800 rounded-lg"
          >
            Join Room
          </button>
          <button
            onClick={createRoom}
            className="px-3 py-2 dark:bg-orange-500 hover:dark:bg-orange-800 rounded-lg"
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
