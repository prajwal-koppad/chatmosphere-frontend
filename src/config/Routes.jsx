import React from "react";
import { Route, Routes, Navigate } from "react-router";
import App from "../App";
import ChatPage from "../components/ChatPage";
import AboutPage from "../components/AboutPage";
import Login from "../components/Login";
import Signup from "../components/Signup";
import useChatContext from "../context/ChatContext";

const ProtectedRoute = ({ children }) => {
  const { token } = useChatContext();
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { token } = useChatContext();
  return !token ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><App /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

