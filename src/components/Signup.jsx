import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { signup as signupApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { toast } from "react-hot-toast";
import chatIcon from "../assets/chat-icon.png";
import { MdOutlineLock, MdOutlinePerson, MdOutlineBadge, MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";

// Preset beautiful gradient avatar configurations
const PRESET_AVATARS = [
  { id: "grad-1", name: "Nebula Purple", class: "bg-gradient-to-tr from-purple-600 to-indigo-400" },
  { id: "grad-2", name: "Aurora Green", class: "bg-gradient-to-tr from-emerald-600 to-teal-400" },
  { id: "grad-3", name: "Solar Orange", class: "bg-gradient-to-tr from-orange-600 to-amber-300" },
  { id: "grad-4", name: "Cosmic Blue", class: "bg-gradient-to-tr from-blue-600 to-cyan-400" },
  { id: "grad-5", name: "Supernova Red", class: "bg-gradient-to-tr from-rose-600 to-pink-400" }
];

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    displayName: "",
    avatarUrl: PRESET_AVATARS[0].id // Default to the first gradient ID
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setToken, setCurrentUser, setDisplayName, setAvatarUrl } = useChatContext();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectAvatar = (id) => {
    setFormData({ ...formData, avatarUrl: id });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim() || !formData.displayName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.username.length < 4 || formData.username.length > 20) {
      toast.error("Username must be between 4 and 20 characters");
      return;
    }

    if (formData.password.length < 6 || formData.password.length > 40) {
      toast.error("Password must be between 6 and 40 characters");
      return;
    }

    if (formData.displayName.length < 2 || formData.displayName.length > 50) {
      toast.error("Display name must be between 2 and 50 characters");
      return;
    }

    setLoading(true);
    try {
      const data = await signupApi(formData);
      toast.success("Account created successfully!");
      
      // Save details to context
      setToken(data.token);
      setCurrentUser(data.username);
      setDisplayName(data.displayName);
      setAvatarUrl(data.avatarUrl);

      navigate("/");
    } catch (error) {
      console.error(error);
      const errMsg = error?.response?.data?.message || "Registration failed. Username may already be taken.";
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
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-secondary flex items-center justify-center p-2.5 shadow-lg mb-3">
            <img src={chatIcon} alt="Chatmosphere Logo" className="w-full h-full object-contain filter invert" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">
            Join the <span className="text-gradient-orange font-black">Atmosphere</span>
          </h1>
          <p className="text-xs text-gray-400 text-center">
            Create your account and jump into a room
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1 relative">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Display Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <MdOutlineBadge className="text-xl" />
              </span>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="How should others call you?"
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                required
              />
            </div>
          </div>

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
                value={formData.username}
                onChange={handleInputChange}
                placeholder="At least 4 characters"
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
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
                value={formData.password}
                onChange={handleInputChange}
                placeholder="At least 6 characters"
                className="glass-input w-full pl-10 pr-12 py-2.5 rounded-xl text-sm focus:outline-none"
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


          {/* Avatar selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Choose Avatar Aura
            </label>
            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
              {PRESET_AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => selectAvatar(avatar.id)}
                  title={avatar.name}
                  className={`w-10 h-10 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 ${avatar.class} ${
                    formData.avatarUrl === avatar.id
                      ? "ring-4 ring-indigo-500 scale-110 shadow-lg shadow-indigo-500/50"
                      : "opacity-60 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-secondary hover:from-orange-500 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Space...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Already registered?{" "}
          <Link to="/login" className="text-orange-400 hover:text-orange-300 font-bold transition-all underline decoration-dotted">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
