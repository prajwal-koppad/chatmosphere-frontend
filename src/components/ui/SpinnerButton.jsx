const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const SpinnerButton = ({ loading, loadingText = "Loading...", children, className = "", ...props }) => (
  <button
    disabled={loading}
    className={`w-full bg-gradient-primary hover:from-indigo-500 hover:to-purple-600 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    {...props}
  >
    {loading ? <><Spinner />{loadingText}</> : children}
  </button>
);

export default SpinnerButton;
