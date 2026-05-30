const GlassInput = ({ label, icon: Icon, children, ...inputProps }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
          <Icon className="text-xl" />
        </span>
      )}
      {children ?? (
        <input
          className={`glass-input w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 rounded-xl text-sm focus:outline-none`}
          {...inputProps}
        />
      )}
    </div>
  </div>
);

export default GlassInput;
