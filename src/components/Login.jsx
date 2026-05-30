import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { login as loginApi, verifyOtp as verifyOtpApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { toast } from "react-hot-toast";
import { MdOutlineLock, MdOutlinePerson, MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";
import AuthCard from "./ui/AuthCard";
import SpinnerButton from "./ui/SpinnerButton";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [step, setStep] = useState("credentials");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setToken, setCurrentUser, setDisplayName, setAvatarUrl } = useChatContext();
  const navigate = useNavigate();

  const saveSession = (data) => {
    setToken(data.token);
    setCurrentUser(data.username);
    setDisplayName(data.displayName);
    setAvatarUrl(data.avatarUrl || "");
    navigate("/");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!credentials.username.trim() || !credentials.password.trim()) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const data = await loginApi(credentials);
      if (data?.status === "OTP_SENT") {
        toast.success(data.message || "OTP code sent successfully!");
        setStep("otp");
      } else {
        saveSession(data);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed. Please check your credentials.");
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error("OTP must be exactly 6 digits"); return; }
    setLoading(true);
    try {
      const data = await verifyOtpApi({ username: credentials.username, otp });
      toast.success(`Welcome back, ${data.displayName || data.username}!`);
      saveSession(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid or expired OTP. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <AuthCard>
      {step === "credentials" ? (
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><MdOutlinePerson className="text-xl" /></span>
              <input type="text" name="username" value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="Enter your username"
                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none" required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><MdOutlineLock className="text-xl" /></span>
              <input type={showPassword ? "text" : "password"} name="password" value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Enter your password"
                className="glass-input w-full pl-10 pr-12 py-3 rounded-xl text-sm focus:outline-none" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors">
                {showPassword ? <MdOutlineVisibilityOff className="text-xl" /> : <MdOutlineVisibility className="text-xl" />}
              </button>
            </div>
          </div>
          <SpinnerButton loading={loading} loadingText="Connecting...">Sign In</SpinnerButton>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider text-center">Verification Code (OTP)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><MdOutlineLock className="text-xl" /></span>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="------" maxLength={6}
                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm font-mono tracking-[0.3em] text-center font-bold focus:outline-none" required />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">We sent a 6-digit OTP to your registered email address.</p>
          </div>
          <SpinnerButton loading={loading} loadingText="Verifying OTP...">Verify &amp; Sign In</SpinnerButton>
          <div className="text-center">
            <button type="button" onClick={() => { setStep("credentials"); setOtp(""); }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors underline">
              Go Back to Login Details
            </button>
          </div>
        </form>
      )}
      <div className="mt-8 text-center text-xs text-gray-400">
        New to the atmosphere?{" "}
        <Link to="/register" className="text-purple-400 hover:text-purple-300 font-bold transition-all underline decoration-dotted">Create an account</Link>
      </div>
    </AuthCard>
  );
};

export default Login;
