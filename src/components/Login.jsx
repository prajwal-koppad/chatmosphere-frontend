import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { login as loginApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { toast } from "react-hot-toast";
import chatIcon from "../assets/chat-icon.png";
import { MdOutlineLock, MdOutlinePerson, MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setToken, setCurrentUser, setDisplayName, setAvatarUrl } = useChatContext();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!credentials.username.trim() || !credentials.password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const data = await loginApi(credentials);
      toast.success(`Welcome back, ${data.displayName || data.username}!`);
      
      // Save details to context
      setToken(data.token);
      setCurrentUser(data.username);
      setDisplayName(data.displayName);
      setAvatarUrl(data.avatarUrl || "");

      navigate("/");
    } catch (error) {
      console.error(error);
      const errMsg = error?.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cosmic-bg flex items-center justify-center p-4 min-h-screen">
      <div className="glow-spot-1"></div>
      <div className="glow-spot-2"></div>

      <div className="glass-card w-full max-w-md p-8 md:p-10 rounded-2xl shadow-2xl relative z-10 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(99,102,241,0.15)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center p-3 shadow-lg mb-4 animate-pulse">
            <img src={chatIcon} alt="Chatmosphere Logo" className="w-full h-full object-contain filter invert" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Chat<span className="text-gradient-purple font-black">mosphere</span>
          </h1>
          <p className="text-sm text-gray-400 text-center">
            Step into the next-gen real-time chat space
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1 relative">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <MdOutlinePerson className="text-xl" />
              </span>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1 relative">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <MdOutlineLock className="text-xl" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="glass-input w-full pl-10 pr-12 py-3 rounded-xl text-sm focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <MdOutlineVisibilityOff className="text-xl" />
                ) : (
                  <MdOutlineVisibility className="text-xl" />
                )}
              </button>
            </div>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-primary hover:from-indigo-500 hover:to-purple-600 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          New to the atmosphere?{" "}
          <Link to="/register" className="text-purple-400 hover:text-purple-300 font-bold transition-all underline decoration-dotted">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
