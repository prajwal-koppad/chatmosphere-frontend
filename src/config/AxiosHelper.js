import axios from "axios";

export const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const loginUrl = "api/v1/auth/login";
export const signupUrl = "api/v1/auth/signup";
export const verifyOtpUrl = "api/v1/auth/verify-otp";
export const createRoomUrl = "api/v1/rooms/create-room";
export const createPersonalRoomUrl = "api/v1/rooms/personal";
export const getRoomsUrl = (search) => search ? `api/v1/rooms/?search=${search}` : "api/v1/rooms/";
export const getMessagesUrl = (roomId, pageNo) => `api/v1/rooms/${roomId}/messages?pageNo=${pageNo}&pageSize=15`;
export const joinRoomUrl = (roomId) => `api/v1/rooms/${roomId}`;
export const getContactsUrl = "api/v1/contacts";
export const createContactUrl = "api/v1/contacts";
export const getUsersUrl = "api/v1/users";
export const inviteUsersUrl = (roomId) => `api/v1/rooms/${roomId}/invite`;
export const removeParticipantUrl = (roomId, username) => `api/v1/rooms/${roomId}/participants/${username}`;
export const chatPath = "/chat";
export const receiveMessagePath = (roomId) => `/topic/room/${roomId}`;
export const sendMessageUrl = (roomId) => `/app/sendMessage/${roomId}`;

export const httpClient = axios.create({
  baseURL: baseUrl,
});

httpClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

