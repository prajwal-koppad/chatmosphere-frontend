import axios from "axios";

export const baseUrl = localStorage.getItem("chatmosphere_api_url") || "http://localhost:8080";
// export const baseUrl = "http://143.244.132.106:8080";

export const loginUrl = "api/v1/auth/login";
export const signupUrl = "api/v1/auth/signup";
export const createRoomUrl = "api/v1/rooms/create-room";
export const getMessagesUrl = (roomId, pageNo) => `api/v1/rooms/${roomId}/messages?pageNo=${pageNo}&pageSize=15`;
export const joinRoomUrl = (roomId) => `api/v1/rooms/${roomId}`;
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

