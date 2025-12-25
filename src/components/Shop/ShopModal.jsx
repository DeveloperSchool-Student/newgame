import { useState } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { useKingdomContext } from '../../contexts/KingdomContext';
import { KINGDOMS } from '../../data/kingdoms';
import { saveProgress } from '../../lib/supabaseClient';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { useToast } from '../UI/Toast';
import { WEAPONS, ARMOR, ACCESSORIES, POTIONS, FOOD, RESOURCES } from '../../data/items';

// Об'єднуємо всі предмети для магазину
const SHOP_ITEMS = [
  // Зілля
  ...POTIONS.filter(p => ['health_potion', 'mana_potion', 'health_potion_large', 'mana_potion_large'].includes(p.id)),
  // Їжа
  ...FOOD,
  // Ресурси
  ...Object.values(RESOURCES).filter(r => ['common', 'rare'].includes(r.rarity)),
  // Зброя (тільки common та rare)
  ...WEAPONS.filter(w => ['common', 'rare'].includes(w.rarity)).slice(0, 5),
  // Броня (тільки common та rare)
  ...ARMOR.filter(a => ['common', 'rare'].includes(a.rarity)).slice(0, 3),
  // Аксесуари (тільки common та rare)
  ...ACCESSORIES.rings.filter(r => ['common', 'rare'].includes(r.rarity)).slice(0, 2),
  ...ACCESSORIES.amulets.filter(a => ['common', 'rare'].includes(a.rarity)).slice(0, 2),
];

export const ShopModal = ({ isOpen, onClose, locationId, telegramId }) => {
  const { player, addItem, addGold, removeItem } = usePlayerContext();
  const { getProvinceOwner, getProvinceTaxRate } = useKingdomContext();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('buy'); // 'buy', 'sell', 'marketplace'
  const [isProcessing, setIsProcessing] = useState(false);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [myListings, setMyListings] = useState([]);

  if (!isOpen) return null;

  const ownerKingdom = getProvinceOwner(locationId);
  const isPlayerKingdom = ownerKingdom === player.kingdom;
  const taxRate = getProvinceTaxRate(locationId);

  // Ціни залежать від того, чи це ваше королівство
  const priceMultiplier = isPlayerKingdom ? 0.8 : 1.2; // Своїм дешевше на 20%, чужим дорожче на 20%

  const calculatePrice = (basePrice) => {
    return Math.floor(basePrice * priceMultiplier);
  };

  const handleBuy = async (item) => {
    const price = calculatePrice(item.basePrice);
    if (player.gold >= price) {
      setIsProcessing(true);
      try {
        addGold(-price);
        addItem({
          ...item,
          id: Date.now(),
          quantity: 1,
        });
        // Зберігаємо прогрес після покупки
        if (telegramId) {
          await saveProgress(telegramId, { ...player, gold: player.gold - price });
        }
      } catch (error) {
        console.error('Помилка покупки:', error);
      } finally {
        setIsProcessing(false);
      }
    } else {
      showToast('Недостатньо золота!', 'error');
    }
  };

  const handleSell = async (item) => {
    setIsProcessing(true);
    try {
      // Ціна продажу = 50% від базової ціни
      const sellPrice = Math.floor((item.basePrice || 100) * 0.5);
      removeItem(item.id, 1);
      addGold(sellPrice);
      // Зберігаємо прогрес після продажу
      if (telegramId) {
        await saveProgress(telegramId, { ...player, gold: player.gold + sellPrice });
      }
    } catch (error) {
      console.error('Помилка продажу:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getSellableItems = () => {
    return player.inventory.filter((item) =>
      item.type === 'weapon' || item.type === 'armor' || item.type === 'potion'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={onClose}>
      <div
        className="bg-fantasy-dark border-2 border-fantasy-purple rounded-lg w-11/12 max-w-md max-h-[85vh] overflow-hidden glow-purple"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600/40 to-yellow-500/40 px-6 py-4 border-b-2 border-yellow-500 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-fantasy-gold">Магазин</h2>
            {isPlayerKingdom && (
              <p className="text-xs text-green-300 mt-1">Ваше королівство - знижка 20%</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-fantasy-gold transition-colors text-3xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-fantasy-purple/30">
          <button
            onClick={() => setActiveTab('buy')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${activeTab === 'buy'
                ? 'bg-fantasy-purple/30 text-fantasy-gold border-b-2 border-fantasy-gold'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            НПС Магазин
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${activeTab === 'sell'
                ? 'bg-fantasy-purple/30 text-fantasy-gold border-b-2 border-fantasy-gold'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            Продати НПС
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${activeTab === 'marketplace'
                ? 'bg-fantasy-purple/30 text-fantasy-gold border-b-2 border-fantasy-gold'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            Маркетплейс
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          {activeTab === 'buy' ? (
            <div className="space-y-3">
              {SHOP_ITEMS.map((item) => {
                const price = calculatePrice(item.basePrice);
                return (
                  <div
                    key={item.id}
                    className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                        <p className="text-sm text-gray-400 capitalize">{item.type}</p>
                        {item.stats && (
                          <div className="text-xs text-gray-300 mt-1">
                            {Object.entries(item.stats).map(([stat, value]) => (
                              <span key={stat} className="mr-2">
                                {stat === 'strength' && `Сила: +${value}`}
                                {stat === 'defense' && `Захист: +${value}`}
                                {stat === 'agility' && `Спритність: +${value}`}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.effect && (
                          <div className="text-xs text-fantasy-green mt-1">
                            Ефект: {item.effect.health && `+${item.effect.health} HP`}
                            {item.effect.mana && ` +${item.effect.mana} MP`}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-fantasy-gold font-bold text-xl">{price} 🪙</div>
                        {!isPlayerKingdom && (
                          <div className="text-xs text-gray-400 line-through">{item.basePrice} 🪙</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={player.gold < price || isProcessing}
                      className={`w-full mt-2 py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${player.gold >= price && !isProcessing
                          ? 'bg-fantasy-purple hover:bg-fantasy-purple/80 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      {isProcessing ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Обробка...</span>
                        </>
                      ) : (
                        'Купити'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : activeTab === 'sell' ? (
            <div className="space-y-3">
              {getSellableItems().length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>Немає предметів для продажу</p>
                </div>
              ) : (
                getSellableItems().map((item) => {
                  const sellPrice = Math.floor((item.basePrice || 100) * 0.5);
                  return (
                    <div
                      key={item.id}
                      className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                          <p className="text-sm text-gray-400">Кількість: x{item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-fantasy-gold font-bold text-xl">{sellPrice} 🪙</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSell(item)}
                        disabled={isProcessing}
                        className={`w-full mt-2 py-2 px-4 bg-fantasy-red hover:bg-red-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        {isProcessing ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span>Обробка...</span>
                          </>
                        ) : (
                          'Продати'
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          ) : activeTab === 'marketplace' ? (
            <div className="space-y-4">
              <div className="text-center text-gray-400 py-8">
                <p className="text-lg mb-2">Маркетплейс</p>
                <p className="text-sm">Торгівля між гравцями</p>
                <p className="text-xs mt-4 text-gray-500">Функція в розробці</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-fantasy-purple/20 px-6 py-4 border-t border-fantasy-purple flex justify-between items-center">
          <span className="text-gray-400">Ваше золото:</span>
          <span className="text-fantasy-gold font-bold text-xl">{player.gold} 🪙</span>
        </div>
      </div>
    </div>
  );
};

