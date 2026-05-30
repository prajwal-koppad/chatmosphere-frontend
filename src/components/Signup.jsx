import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { signup as signupApi, verifyOtp as verifyOtpApi, getCountryCodes } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { toast } from "react-hot-toast";
import { MdOutlineLock, MdOutlinePerson, MdOutlineBadge, MdOutlineVisibility, MdOutlineVisibilityOff, MdOutlineEmail, MdOutlinePhone } from "react-icons/md";
import AuthCard from "./ui/AuthCard";
import SpinnerButton from "./ui/SpinnerButton";

const DEFAULT_COUNTRY_CODES = [
  { code: "+91", country: "IN", name: "India" },
  { code: "+1", country: "US", name: "USA/Canada" },
  { code: "+44", country: "GB", name: "UK" },
  { code: "+61", country: "AU", name: "Australia" },
  { code: "+49", country: "DE", name: "Germany" },
  { code: "+33", country: "FR", name: "France" },
  { code: "+81", country: "JP", name: "Japan" },
  { code: "+971", country: "AE", name: "UAE" },
  { code: "+65", country: "SG", name: "Singapore" },
];

const PRESET_AVATARS = [
  { id: "grad-1", name: "Nebula Purple", class: "bg-gradient-to-tr from-purple-600 to-indigo-400" },
  { id: "grad-2", name: "Aurora Green",  class: "bg-gradient-to-tr from-emerald-600 to-teal-400" },
  { id: "grad-3", name: "Solar Orange",  class: "bg-gradient-to-tr from-orange-600 to-amber-300" },
  { id: "grad-4", name: "Cosmic Blue",   class: "bg-gradient-to-tr from-blue-600 to-cyan-400" },
  { id: "grad-5", name: "Supernova Red", class: "bg-gradient-to-tr from-rose-600 to-pink-400" },
];

const FIELDS = [
  { name: "displayName",   label: "Display Name",   type: "text",     icon: MdOutlineBadge,   placeholder: "How should others call you?" },
  { name: "username",      label: "Username",        type: "text",     icon: MdOutlinePerson,  placeholder: "At least 4 characters" },
  { name: "email",         label: "Email Address",   type: "email",    icon: MdOutlineEmail,   placeholder: "you@example.com" },
  { name: "mobileNumber",  label: "Mobile Number",   type: "tel",      icon: MdOutlinePhone,   placeholder: "e.g. +1234567890" },
];

const Signup = () => {
  const [formData, setFormData] = useState({ username: "", password: "", displayName: "", email: "", mobileNumber: "+91", avatarUrl: PRESET_AVATARS[0].id });
  const [countryCodes, setCountryCodes] = useState(DEFAULT_COUNTRY_CODES);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [phoneRest, setPhoneRest] = useState("");
  const [step, setStep] = useState("details");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setToken, setCurrentUser, setDisplayName, setAvatarUrl } = useChatContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCountryCodes = async () => {
      try {
        const data = await getCountryCodes();
        if (!data || !Array.isArray(data)) return;
        
        const list = [];
        data.forEach(country => {
          const root = country.idd?.root || "";
          const suffixes = country.idd?.suffixes || [];
          const name = country.name?.common || "";
          const cca2 = country.cca2 || "";
          
          if (root) {
            let dialCode = "";
            if (root === "+1" || root === "+7" || suffixes.length > 10) {
              dialCode = root;
            } else if (suffixes.length > 0) {
              dialCode = root + suffixes[0];
            } else {
              dialCode = root;
            }
            
            list.push({
              code: dialCode,
              country: cca2,
              name: name
            });
          }
        });
        
        const uniqueList = Array.from(new Map(list.map(item => [`${item.country}-${item.code}`, item])).values());
        uniqueList.sort((a, b) => a.name.localeCompare(b.name));
        
        if (uniqueList.length > 0) {
          setCountryCodes(uniqueList);
        }
      } catch (err) {
        console.warn("Failed to fetch country codes, using fallback", err);
      }
    };
    fetchCountryCodes();
  }, []);

  const validate = () => {
    const { username, password, displayName, email, mobileNumber } = formData;
    if (!username || !password || !displayName || !email || !mobileNumber) { toast.error("Please fill in all required fields"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Please enter a valid email address"); return false; }
    if (!/^[0-9+\s-]{8,15}$/.test(mobileNumber)) { toast.error("Please enter a valid mobile number"); return false; }
    if (username.length < 4 || username.length > 20) { toast.error("Username must be 4–20 characters"); return false; }
    if (password.length < 6 || password.length > 40) { toast.error("Password must be 6–40 characters"); return false; }
    return true;
  };

  const saveSession = (data) => {
    setToken(data.token);
    setCurrentUser(data.username);
    setDisplayName(data.displayName);
    setAvatarUrl(data.avatarUrl || "");
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await signupApi(formData);
      if (data?.status === "OTP_SENT") {
        toast.success(data.message || "Verification OTP sent to your email!");
        setStep("otp");
      } else {
        toast.success("Account created successfully!");
        saveSession(data);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed. Username, email, or mobile may already be taken.");
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error("OTP must be exactly 6 digits"); return; }
    setLoading(true);
    try {
      const data = await verifyOtpApi({ username: formData.username, otp });
      toast.success(`Account verified! Welcome, ${data.displayName || data.username}!`);
      saveSession(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid or expired OTP. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <AuthCard subtitle={step === "details" ? "Create your account and jump into a room" : "Enter the verification code sent to your email"}>
      {step === "details" ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {FIELDS.map(({ name, label, type, icon: Icon, placeholder }) => {
            if (name === "mobileNumber") {
              return (
                <div key={name} className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">{label}</label>
                  <div className="flex gap-2">
                    <div className="relative flex-shrink-0 w-36">
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => {
                          const code = e.target.value;
                          setSelectedCountryCode(code);
                          setFormData(prev => ({ ...prev, mobileNumber: code + phoneRest }));
                        }}
                        className="glass-input w-full px-2 py-2.5 rounded-xl text-xs focus:outline-none bg-slate-900 border border-white/10 text-white cursor-pointer appearance-none pr-5 text-center font-bold"
                      >
                        {countryCodes.map((c) => (
                          <option key={`${c.country}-${c.code}`} value={c.code} className="bg-slate-950 text-white">
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                      <span className="absolute inset-y-0 right-1.5 flex items-center pointer-events-none text-[8px] text-gray-400">▼</span>
                    </div>
                    <div className="relative flex-grow">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Icon className="text-xl" /></span>
                      <input
                        type="tel"
                        value={phoneRest}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setPhoneRest(val);
                          setFormData(prev => ({ ...prev, mobileNumber: selectedCountryCode + val }));
                        }}
                        placeholder="Rest of phone digits"
                        className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div key={name} className="space-y-1">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">{label}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Icon className="text-xl" /></span>
                  <input type={type} name={name} value={formData[name]}
                    onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                    placeholder={placeholder}
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none" required />
                </div>
              </div>
            );
          })}

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><MdOutlineLock className="text-xl" /></span>
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                className="glass-input w-full pl-10 pr-12 py-2.5 rounded-xl text-sm focus:outline-none" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors">
                {showPassword ? <MdOutlineVisibilityOff className="text-xl" /> : <MdOutlineVisibility className="text-xl" />}
              </button>
            </div>
          </div>

          {/* Avatar */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Choose Avatar Aura</label>
            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
              {PRESET_AVATARS.map((av) => (
                <button key={av.id} type="button" onClick={() => setFormData({ ...formData, avatarUrl: av.id })} title={av.name}
                  className={`w-10 h-10 rounded-full transition-all duration-300 transform hover:scale-110 ${av.class} ${formData.avatarUrl === av.id ? "ring-4 ring-indigo-500 scale-110 shadow-lg shadow-indigo-500/50" : "opacity-60 hover:opacity-100"}`} />
              ))}
            </div>
          </div>

          <SpinnerButton loading={loading} loadingText="Creating Space...">
            Sign Up
          </SpinnerButton>
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
          <SpinnerButton loading={loading} loadingText="Verifying OTP...">Verify &amp; Sign Up</SpinnerButton>
          <div className="text-center">
            <button type="button" onClick={() => { setStep("details"); setOtp(""); }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors underline">
              Go Back to Signup Details
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center text-xs text-gray-400">
        Already registered?{" "}
        <Link to="/login" className="text-orange-400 hover:text-orange-300 font-bold transition-all underline decoration-dotted">Sign In here</Link>
      </div>
    </AuthCard>
  );
};

export default Signup;
