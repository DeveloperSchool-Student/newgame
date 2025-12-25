export const SkeletonLoader = ({ type = 'text', width = '100%', height = '1rem', className = '' }) => {
  const baseClasses = 'animate-pulse bg-gray-700 rounded';
  
  if (type === 'text') {
    return (
      <div
        className={`${baseClasses} ${className}`}
        style={{ width, height }}
      />
    );
  }
  
  if (type === 'circle') {
    return (
      <div
        className={`${baseClasses} rounded-full ${className}`}
        style={{ width, height }}
      />
    );
  }
  
  if (type === 'rect') {
    return (
      <div
        className={`${baseClasses} ${className}`}
        style={{ width, height }}
      />
    );
  }
  
  return null;
};

export const SkeletonCard = () => {
  return (
    <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-700 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-700 rounded w-1/2" />
          <div className="h-3 bg-gray-700 rounded w-full" />
        </div>
      </div>
    </div>
  );
};

