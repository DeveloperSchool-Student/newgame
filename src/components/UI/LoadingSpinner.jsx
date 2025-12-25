export const LoadingSpinner = ({ size = 'md', text = null }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`${sizeClasses[size]} border-4 border-fantasy-purple/30 border-t-fantasy-purple rounded-full animate-spin`}
      ></div>
      {text && <span className="text-sm text-gray-400">{text}</span>}
    </div>
  );
};

