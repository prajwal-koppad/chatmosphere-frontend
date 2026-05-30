import React from "react";
import { Route, Routes, Navigate } from "react-router";
import useChatContext from "../context/ChatContext";
import ChatPage from "../components/ChatPage";
import AboutPage from "../components/AboutPage";
import Login from "../components/Login";
import Signup from "../components/Signup";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import ChatsPage from "../components/dashboard/ChatsPage";
import ContactsPage from "../components/dashboard/ContactsPage";
import RoomActionsPage from "../components/dashboard/RoomActionsPage";

/** Redirect unauthenticated users to /login */
const ProtectedRoute = ({ children }) => {
  const { token } = useChatContext();
  return token ? children : <Navigate to="/login" replace />;
};

/** Redirect authenticated users away from login/register */
const PublicRoute = ({ children }) => {
  const { token } = useChatContext();
  return !token ? children : <Navigate to="/" replace />;
};

/** /chat requires both auth AND an active roomId */
const ChatRoute = () => {
  const { token, roomId } = useChatContext();
  if (!token) return <Navigate to="/login" replace />;
  if (!roomId) return <Navigate to="/" replace />;
  return <ChatPage />;
};

const AppRoutes = () => (
  <Routes>
    {/* Public auth pages */}
    <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Signup /></PublicRoute>} />

    {/* Protected dashboard — nested routed tabs via Outlet */}
    <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
      <Route index          element={<Navigate to="/active-chats" replace />} />
      <Route path="active-chats" element={<ChatsPage />} />
      <Route path="contacts" element={<ContactsPage />} />
      <Route path="rooms/join"   element={<RoomActionsPage />} />
      <Route path="rooms/create" element={<RoomActionsPage />} />
    </Route>

    {/* Chat room — needs active session + roomId */}
    <Route path="/chat" element={<ChatRoute />} />

    <Route path="/about" element={<AboutPage />} />

    {/* Catch-all: send to dashboard (which redirects to login if unauth) */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
