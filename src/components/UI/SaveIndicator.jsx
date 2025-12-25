import { useState, useEffect } from 'react';

export const SaveIndicator = ({ isSaving }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isSaving) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving]);

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-fantasy-green/90 backdrop-blur-sm border border-fantasy-green rounded-lg px-4 py-2 z-50 flex items-center gap-2">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      <span className="text-white text-sm font-semibold">Збереження...</span>
    </div>
  );
};

