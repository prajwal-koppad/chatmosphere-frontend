import axios from "axios";

export const baseUrl = "http://143.244.132.106:8080";
export const createRoomUrl = "api/v1/rooms/create-room";
export const getMessagesUrl = (roomId, pageNo) => `api/v1/rooms/${roomId}/messages?pageNo=${pageNo}&pageSize=10`;
export const joinRoomUrl = (roomId) => `api/v1/rooms/${roomId}`;
export const chatPath = "/chat";
export const receiveMessagePath = (roomId) => `/topic/room/${roomId}`;
export const sendMessageUrl = (roomId) => `/app/sendMessage/${roomId}`;

export const httpClient = axios.create({
  baseURL: baseUrl,
});
