import { httpClient, createRoomUrl, joinRoomUrl, getMessagesUrl, loginUrl, signupUrl } from "../config/AxiosHelper";

export const login = async (credentials) => {
  const response = await httpClient.post(loginUrl, credentials);
  return response.data;
};

export const signup = async (userDetails) => {
  const response = await httpClient.post(signupUrl, userDetails);
  return response.data;
};

export const createRoom = async (roomDetails) => {
  const response = await httpClient.post(
    createRoomUrl,
    roomDetails
  );
  return response.data;
};

export const joinRoom = async (roomId) => {
  const response = await httpClient.get(joinRoomUrl(roomId));
  return response.data;
};

export const getMessages = async (roomId, pageNo) => {
  const response = await httpClient.get(getMessagesUrl(roomId, pageNo));
  return response.data;
};