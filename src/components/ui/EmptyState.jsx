const EmptyState = ({ message = "Nothing here yet.", action }) => (
  <div className="text-center py-16">
    <p className="text-sm text-gray-400">{message}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-bold underline"
      >
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
