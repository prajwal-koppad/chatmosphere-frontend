import axios from "axios";
import {
  httpClient,
  createRoomUrl,
  joinRoomUrl,
  getMessagesUrl,
  loginUrl,
  signupUrl,
  verifyOtpUrl,
  createPersonalRoomUrl,
  getRoomsUrl,
  getContactsUrl,
  createContactUrl,
  getUsersUrl,
  inviteUsersUrl,
  removeParticipantUrl
} from "../config/AxiosHelper";

export const login = async (credentials) => {
  const response = await httpClient.post(loginUrl, credentials);
  return response.data;
};

export const signup = async (userDetails) => {
  const response = await httpClient.post(signupUrl, userDetails);
  return response.data;
};

export const verifyOtp = async (otpDetails) => {
  const response = await httpClient.post(verifyOtpUrl, otpDetails);
  return response.data;
};

export const createRoom = async (roomDetails) => {
  const response = await httpClient.post(
    createRoomUrl,
    roomDetails
  );
  return response.data;
};

export const createPersonalRoom = async (recipientUsername) => {
  const response = await httpClient.post(createPersonalRoomUrl, { recipientUsername });
  return response.data;
};

export const getRooms = async (search = "") => {
  const response = await httpClient.get(getRoomsUrl(search));
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

export const getContacts = async () => {
  const response = await httpClient.get(getContactsUrl);
  return response.data;
};

export const createContact = async (contactDetails) => {
  const response = await httpClient.post(createContactUrl, contactDetails);
  return response.data;
};

export const getUsers = async () => {
  const response = await httpClient.get(getUsersUrl);
  return response.data;
};

export const inviteUsersToRoom = async (roomId, usernames) => {
  const response = await httpClient.patch(inviteUsersUrl(roomId), { usernames });
  return response.data;
};

export const removeParticipantFromRoom = async (roomId, username) => {
  const response = await httpClient.delete(removeParticipantUrl(roomId, username));
  return response.data;
};

export const getCountryCodes = async () => {
  const response = await axios.get("https://restcountries.com/v3.1/all?fields=name,cca2,idd");
  return response.data;
};