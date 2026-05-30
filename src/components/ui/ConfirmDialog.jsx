import { MdClose, MdWarning } from "react-icons/md";

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger"
}) => {
  if (!isOpen) return null;

  const confirmBtnCls = variant === "danger"
    ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-500/10 focus:ring-red-500/50"
    : variant === "warning"
      ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-orange-500/10 focus:ring-orange-500/50"
      : "bg-gradient-primary hover:from-indigo-500 hover:to-purple-600 shadow-indigo-500/10 focus:ring-indigo-500/50";

  const iconCls = variant === "danger"
    ? "bg-red-500/10 border-red-500/30 text-red-400"
    : variant === "warning"
      ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
      : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="glass-card border border-white/10 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 gap-4 animate-[scaleIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${iconCls}`}>
              <MdWarning size={20} />
            </div>
            <h3 className="text-sm font-bold text-white leading-tight">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* Content */}
        <p className="text-xs text-gray-300 leading-relaxed pl-1">
          {message}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 border border-white/5 hover:bg-white/10 transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95 shadow-md ${confirmBtnCls}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
