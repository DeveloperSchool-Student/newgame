import { useToast } from './Toast';

export const ToastHistory = ({ isOpen, onClose }) => {
  const { history, clearHistory } = useToast();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-fantasy-dark modal-backdrop flex items-center justify-center">
      <div className="bg-fantasy-dark/95 border-2 border-fantasy-purple rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-fantasy-gold">Історія сповіщень</h2>
          <div className="flex gap-2">
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              >
                Очистити
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>Історія сповіщень порожня</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((toast) => {
              const getIcon = () => {
                switch (toast.type) {
                  case 'success': return '✅';
                  case 'error': return '❌';
                  case 'warning': return '⚠️';
                  default: return 'ℹ️';
                }
              };

              const getColor = () => {
                switch (toast.type) {
                  case 'success': return 'text-green-400';
                  case 'error': return 'text-red-400';
                  case 'warning': return 'text-yellow-400';
                  default: return 'text-blue-400';
                }
              };

              return (
                <div
                  key={toast.id}
                  className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded p-3"
                >
                  <div className="flex items-start gap-2">
                    <span className={getColor()}>{getIcon()}</span>
                    <div className="flex-1">
                      <p className="text-white text-sm">{toast.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {toast.timestamp?.toLocaleTimeString('uk-UA')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

