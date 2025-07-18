import { httpClient, createRoomUrl, joinRoomUrl, getMessagesUrl } from "../config/AxiosHelper";

export const createRoom = async (roomDetails) => {
  const response = await httpClient.post(
    createRoomUrl,
    roomDetails
  );
  const data = response.data;
};

export const joinRoom = async (roomId) => {
  const response = await httpClient.get(joinRoomUrl(roomId));
  return response.data;
}

export const getMessages = async (roomId, pageNo) => {
  const response = await httpClient.get(getMessagesUrl(roomId, pageNo));
  return response.data;
}