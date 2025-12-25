import { usePlayerContext } from '../../contexts/PlayerContext';

export const Inventory = ({ isOpen, onClose }) => {
  const { player } = usePlayerContext();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={onClose}>
      <div
        className="bg-fantasy-dark border-2 border-fantasy-purple rounded-lg w-11/12 max-w-md max-h-[80vh] overflow-hidden glow-purple"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-fantasy-purple/30 px-6 py-4 border-b border-fantasy-purple flex justify-between items-center">
          <h2 className="text-2xl font-bold text-fantasy-gold">Інвентар</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-fantasy-gold transition-colors text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {player.inventory.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>Інвентар порожній</p>
            </div>
          ) : (
            <div className="space-y-3">
              {player.inventory.map((item) => (
                <div
                  key={item.id}
                  className="bg-fantasy-dark/50 border border-fantasy-purple/50 rounded-lg p-4 hover:bg-fantasy-purple/10 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{item.type}</p>
                    </div>
                    <div className="text-fantasy-gold font-bold">
                      x{item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-fantasy-purple/20 px-6 py-4 border-t border-fantasy-purple">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Золото:</span>
            <span className="text-fantasy-gold font-bold text-xl">{player.gold} 🪙</span>
          </div>
        </div>
      </div>
    </div>
  );
};

