const GRADIENTS = [
  "from-purple-600 to-indigo-400",
  "from-emerald-600 to-teal-400",
  "from-orange-600 to-amber-300",
  "from-blue-600 to-cyan-400",
  "from-rose-600 to-pink-400",
  "from-pink-600 to-purple-400",
  "from-violet-600 to-fuchsia-400",
  "from-cyan-600 to-blue-500",
];

export const getAvatarGradient = (str = "default") => {
  const hash = (str || "default")
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `bg-gradient-to-tr ${GRADIENTS[hash % GRADIENTS.length]}`;
};

const AvatarBadge = ({ name = "?", size = "md", className = "" }) => {
  const initials = (name || "?").substring(0, 2).toUpperCase();
  const sizeClass = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-12 h-12 text-base" : "w-10 h-10 text-xs";
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shadow-md flex-shrink-0 ${getAvatarGradient(name)} ${className}`}
    >
      {initials}
    </div>
  );
};

export default AvatarBadge;
