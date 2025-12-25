import { useState, useEffect, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { saveProgress } from '../../lib/supabaseClient';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { useToast } from '../UI/Toast';
import { RESOURCES, WEAPONS, ARMOR, ACCESSORIES, POTIONS, getResourceById } from '../../data/items';

// Рецепти створення предметів
const CRAFTING_RECIPES = [
  {
    id: 'health_potion',
    name: 'Зілля здоров\'я',
    description: 'Відновлює 50 HP',
    result: {
      id: Date.now(),
      name: 'Зілля здоров\'я',
      type: 'potion',
      rarity: 'common',
      quantity: 1,
      effect: { health: 50 },
      basePrice: 100,
    },
    ingredients: [
      { id: 'herb', name: 'Трава', quantity: 3 },
      { id: 'water', name: 'Вода', quantity: 1 },
    ],
    category: 'potion',
    icon: '🧪',
  },
  {
    id: 'mana_potion',
    name: 'Зілля мани',
    description: 'Відновлює 40 MP',
    result: {
      id: Date.now(),
      name: 'Зілля мани',
      type: 'potion',
      rarity: 'common',
      quantity: 1,
      effect: { mana: 40 },
      basePrice: 80,
    },
    ingredients: [
      { id: 'herb', name: 'Трава', quantity: 2 },
      { id: 'crystal', name: 'Кристал', quantity: 1 },
    ],
    category: 'potion',
    icon: '✨',
  },
  {
    id: 'iron_sword',
    name: 'Залізний меч',
    description: 'Меч з +15 сили',
    result: {
      id: Date.now(),
      name: 'Залізний меч',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'rare',
      quantity: 1,
      stats: { strength: 15 },
      basePrice: 500,
    },
    ingredients: [
      { id: 'iron_ore', name: 'Залізна руда', quantity: 5 },
      { id: 'coal', name: 'Вугілля', quantity: 2 },
    ],
    category: 'weapon',
    icon: '⚔️',
  },
  {
    id: 'steel_armor',
    name: 'Сталева броня',
    description: 'Броня з +12 захисту',
    result: {
      id: Date.now(),
      name: 'Сталева броня',
      type: 'armor',
      slot: 'armor',
      rarity: 'rare',
      quantity: 1,
      stats: { defense: 12 },
      basePrice: 400,
    },
    ingredients: [
      { id: 'iron_ore', name: 'Залізна руда', quantity: 8 },
      { id: 'leather', name: 'Шкіра', quantity: 3 },
    ],
    category: 'armor',
    icon: '🛡️',
  },
  {
    id: 'epic_sword',
    name: 'Епічний меч',
    description: 'Потужний меч з +25 сили та +10 спритності',
    result: {
      id: Date.now(),
      name: 'Епічний меч',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'epic',
      quantity: 1,
      stats: { strength: 25, agility: 10 },
      basePrice: 1500,
    },
    ingredients: [
      { id: 'iron_ore', name: 'Залізна руда', quantity: 10 },
      { id: 'crystal', name: 'Кристал', quantity: 3 },
      { id: 'dragon_scale', name: 'Драконяча луска', quantity: 1 },
    ],
    category: 'weapon',
    icon: '🗡️',
  },
];

// Рецепти покращення предметів
const UPGRADE_RECIPES = [
  {
    id: 'upgrade_weapon',
    name: 'Покращення зброї',
    description: 'Покращує зброю на +5 сили',
    ingredients: [
      { id: 'iron_ore', name: 'Залізна руда', quantity: 3 },
      { id: 'crystal', name: 'Кристал', quantity: 1 },
    ],
    effect: { strength: 5 },
    maxUpgrades: 5,
    icon: '⚔️',
  },
  {
    id: 'upgrade_armor',
    name: 'Покращення броні',
    description: 'Покращує броню на +3 захисту',
    ingredients: [
      { id: 'iron_ore', name: 'Залізна руда', quantity: 2 },
      { id: 'leather', name: 'Шкіра', quantity: 2 },
    ],
    effect: { defense: 3 },
    maxUpgrades: 5,
    icon: '🛡️',
  },
];

export const CraftingSystem = ({ isOpen, onClose, telegramId }) => {
  const { player, addItem, removeItem } = usePlayerContext();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('craft'); // 'craft' або 'upgrade'
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Перевірка наявності інгредієнтів
  const hasIngredients = useCallback((recipe) => {
    return recipe.ingredients.every((ingredient) => {
      const item = player.inventory.find((inv) => 
        inv.name === ingredient.name || 
        inv.id === ingredient.id ||
        (getResourceById(ingredient.id) && inv.name === getResourceById(ingredient.id).name)
      );
      return item && item.quantity >= ingredient.quantity;
    });
  }, [player.inventory]);

  // Створення предмета
  const craftItem = useCallback(async (recipe) => {
    if (!hasIngredients(recipe)) {
      showToast('Недостатньо інгредієнтів', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      // Видаляємо інгредієнти
      recipe.ingredients.forEach((ingredient) => {
        const item = player.inventory.find((inv) => 
          inv.name === ingredient.name || 
          inv.id === ingredient.id ||
          (getResourceById(ingredient.id) && inv.name === getResourceById(ingredient.id).name)
        );
        if (item) {
          removeItem(item.id, ingredient.quantity);
        }
      });

      // Додаємо створений предмет
      const craftedItem = {
        ...recipe.result,
        id: Date.now() + Math.random(),
      };
      addItem(craftedItem);

      showToast(`${recipe.name} створено!`, 'success');

      // Зберігаємо прогрес
      if (telegramId) {
        await saveProgress(telegramId, player);
      }
    } catch (error) {
      console.error('Помилка створення предмета:', error);
      showToast('Помилка створення предмета', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [hasIngredients, player, removeItem, addItem, telegramId, showToast]);

  // Покращення предмета
  const upgradeItem = useCallback(async (item, upgradeRecipe) => {
    if (!hasIngredients(upgradeRecipe)) {
      showToast('Недостатньо інгредієнтів', 'error');
      return;
    }

    // Перевірка кількості покращень
    const upgradeCount = item.upgradeCount || 0;
    if (upgradeCount >= upgradeRecipe.maxUpgrades) {
      showToast('Предмет вже покращено до максимуму', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      // Видаляємо інгредієнти
      upgradeRecipe.ingredients.forEach((ingredient) => {
        const invItem = player.inventory.find((inv) => 
          inv.name === ingredient.name || 
          inv.id === ingredient.id ||
          (getResourceById(ingredient.id) && inv.name === getResourceById(ingredient.id).name)
        );
        if (invItem) {
          removeItem(invItem.id, ingredient.quantity);
        }
      });

      // Оновлюємо предмет
      const updatedItem = {
        ...item,
        stats: {
          ...item.stats,
          ...Object.fromEntries(
            Object.entries(upgradeRecipe.effect).map(([stat, value]) => [
              stat,
              (item.stats[stat] || 0) + value,
            ])
          ),
        },
        upgradeCount: (item.upgradeCount || 0) + 1,
      };

      // Замінюємо предмет в інвентарі
      const itemIndex = player.inventory.findIndex((inv) => inv.id === item.id);
      if (itemIndex !== -1) {
        const newInventory = [...player.inventory];
        newInventory[itemIndex] = updatedItem;
        // Оновлюємо інвентар через контекст
        removeItem(item.id, item.quantity);
        addItem(updatedItem);
      }

      showToast(`${item.name} покращено!`, 'success');

      // Зберігаємо прогрес
      if (telegramId) {
        await saveProgress(telegramId, player);
      }
    } catch (error) {
      console.error('Помилка покращення предмета:', error);
      showToast('Помилка покращення предмета', 'error');
    } finally {
      setIsProcessing(false);
      setSelectedItem(null);
    }
  }, [hasIngredients, player, removeItem, addItem, telegramId, showToast]);

  // Отримуємо доступні для покращення предмети
  const getUpgradeableItems = useCallback(() => {
    return player.inventory.filter(
      (item) => (item.type === 'weapon' || item.type === 'armor') && (item.upgradeCount || 0) < 5
    );
  }, [player.inventory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-fantasy-dark modal-backdrop flex items-center justify-center">
      <div className="bg-fantasy-dark/95 border-2 border-fantasy-purple rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-fantasy-gold">🔨 Ремесло</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-fantasy-purple/30 mb-6">
          <button
            onClick={() => setActiveTab('craft')}
            className={`flex-1 px-4 py-3 font-semibold transition-all ${
              activeTab === 'craft'
                ? 'bg-fantasy-purple/20 text-fantasy-gold border-b-2 border-fantasy-gold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Створення
          </button>
          <button
            onClick={() => setActiveTab('upgrade')}
            className={`flex-1 px-4 py-3 font-semibold transition-all ${
              activeTab === 'upgrade'
                ? 'bg-fantasy-purple/20 text-fantasy-gold border-b-2 border-fantasy-gold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Покращення
          </button>
        </div>

        {activeTab === 'craft' ? (
          /* Створення предметів */
          <div className="space-y-4">
            {CRAFTING_RECIPES.map((recipe) => {
              const canCraft = hasIngredients(recipe);
              return (
                <div
                  key={recipe.id}
                  className={`border-2 rounded-lg p-4 ${
                    canCraft
                      ? 'border-fantasy-purple bg-fantasy-dark/50'
                      : 'border-gray-600 bg-gray-900/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{recipe.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{recipe.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{recipe.description}</p>

                      {/* Інгредієнти */}
                      <div className="mb-3">
                        <div className="text-xs text-gray-400 mb-2">Інгредієнти:</div>
                        <div className="flex flex-wrap gap-2">
                          {recipe.ingredients.map((ingredient, idx) => {
                            const hasItem = player.inventory.some(
                              (inv) => (
                                (inv.name === ingredient.name || inv.id === ingredient.id) ||
                                (getResourceById(ingredient.id) && inv.name === getResourceById(ingredient.id).name)
                              ) && inv.quantity >= ingredient.quantity
                            );
                            return (
                              <span
                                key={idx}
                                className={`px-2 py-1 rounded text-xs ${
                                  hasItem
                                    ? 'bg-green-600/20 text-green-300'
                                    : 'bg-red-600/20 text-red-300'
                                }`}
                              >
                                {ingredient.name} x{ingredient.quantity} {hasItem ? '✓' : '✗'}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => craftItem(recipe)}
                        disabled={!canCraft || isProcessing}
                        className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                          canCraft && !isProcessing
                            ? 'bg-fantasy-purple hover:bg-purple-600 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isProcessing ? 'Створення...' : 'Створити'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Покращення предметів */
          <div className="space-y-4">
            {getUpgradeableItems().length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Немає предметів для покращення</p>
              </div>
            ) : (
              getUpgradeableItems().map((item) => {
                const upgradeRecipe = item.type === 'weapon' ? UPGRADE_RECIPES[0] : UPGRADE_RECIPES[1];
                const canUpgrade = hasIngredients(upgradeRecipe);
                const upgradeCount = item.upgradeCount || 0;

                return (
                  <div
                    key={item.id}
                    className={`border-2 rounded-lg p-4 ${
                      canUpgrade
                        ? 'border-fantasy-purple bg-fantasy-dark/50'
                        : 'border-gray-600 bg-gray-900/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{upgradeRecipe.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-400 mb-2">
                          Покращень: {upgradeCount}/{upgradeRecipe.maxUpgrades}
                        </p>

                        {/* Поточні стати */}
                        {item.stats && (
                          <div className="mb-3">
                            <div className="text-xs text-gray-400 mb-1">Поточні стати:</div>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(item.stats).map(([stat, value]) => (
                                <span key={stat} className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
                                  {stat === 'strength' && `Сила: ${value}`}
                                  {stat === 'defense' && `Захист: ${value}`}
                                  {stat === 'agility' && `Спритність: ${value}`}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Інгредієнти */}
                        <div className="mb-3">
                          <div className="text-xs text-gray-400 mb-2">Інгредієнти:</div>
                          <div className="flex flex-wrap gap-2">
                            {upgradeRecipe.ingredients.map((ingredient, idx) => {
                              const hasItem = player.inventory.some(
                                (inv) => (
                                  (inv.name === ingredient.name || inv.id === ingredient.id) ||
                                  (getResourceById(ingredient.id) && inv.name === getResourceById(ingredient.id).name)
                                ) && inv.quantity >= ingredient.quantity
                              );
                              return (
                                <span
                                  key={idx}
                                  className={`px-2 py-1 rounded text-xs ${
                                    hasItem
                                      ? 'bg-green-600/20 text-green-300'
                                      : 'bg-red-600/20 text-red-300'
                                  }`}
                                >
                                  {ingredient.name} x{ingredient.quantity} {hasItem ? '✓' : '✗'}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Ефект покращення */}
                        <div className="mb-3 bg-fantasy-dark/50 rounded p-2">
                          <div className="text-xs text-gray-400 mb-1">Ефект покращення:</div>
                          {Object.entries(upgradeRecipe.effect).map(([stat, value]) => (
                            <div key={stat} className="text-xs text-green-300">
                              +{value} {stat === 'strength' ? 'сили' : stat === 'defense' ? 'захисту' : stat}
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => upgradeItem(item, upgradeRecipe)}
                          disabled={!canUpgrade || isProcessing || upgradeCount >= upgradeRecipe.maxUpgrades}
                          className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                            canUpgrade && !isProcessing && upgradeCount < upgradeRecipe.maxUpgrades
                              ? 'bg-fantasy-purple hover:bg-purple-600 text-white'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isProcessing
                            ? 'Покращення...'
                            : upgradeCount >= upgradeRecipe.maxUpgrades
                            ? 'Максимальне покращення'
                            : 'Покращити'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

