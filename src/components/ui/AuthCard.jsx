import chatIcon from "../../assets/chat-icon.png";

const AuthCard = ({ children, subtitle = "Step into the next-gen real-time chat space" }) => (
  <div className="cosmic-bg flex items-center justify-center p-4 min-h-screen">
    <div className="glow-spot-1" />
    <div className="glow-spot-2" />
    <div className="glass-card w-full max-w-md p-8 md:p-10 rounded-2xl shadow-2xl relative z-10 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(99,102,241,0.15)]">
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center p-3 shadow-lg mb-4 animate-pulse">
          <img src={chatIcon} alt="Chatmosphere Logo" className="w-full h-full object-contain filter invert" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Chat<span className="text-gradient-purple font-black">mosphere</span>
        </h1>
        <p className="text-sm text-gray-400 text-center">{subtitle}</p>
      </div>
      {children}
    </div>
  </div>
);

export default AuthCard;
