import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router";
import AppRoutes from "./config/Routes";
import { Toaster } from "react-hot-toast";
import { ChatProvider } from "./context/ChatContext";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <BrowserRouter>
      <Toaster position="top-center" />
      <ChatProvider>
        <AppRoutes />
      </ChatProvider>
    </BrowserRouter>
  // </StrictMode>
);
