import { ITEM_SETS } from '../data/items';

// Перевірка наявності набору предметів
export const checkItemSet = (equippedItems, inventory) => {
  const equippedItemIds = Object.values(equippedItems)
    .filter(item => item !== null)
    .map(item => item.id);

  const results = [];

  ITEM_SETS.forEach((set) => {
    const equippedCount = set.items.filter(itemId => 
      equippedItemIds.includes(itemId) || 
      equippedItemIds.some(eqId => {
        const eqItem = Object.values(equippedItems).find(eq => eq && eq.id === eqId);
        return eqItem && (eqItem.name === itemId || eqItem.id === itemId);
      })
    ).length;

    if (equippedCount > 0) {
      const bonus = set.bonuses[equippedCount] || null;
      results.push({
        setId: set.id,
        setName: set.name,
        equippedCount,
        totalCount: set.items.length,
        bonus,
      });
    }
  });

  return results;
};

// Отримання активних бонусів від наборів
export const getActiveSetBonuses = (equippedItems, inventory) => {
  const sets = checkItemSet(equippedItems, inventory);
  const bonuses = {
    strength: 0,
    agility: 0,
    intelligence: 0,
    defense: 0,
    health: 0,
    mana: 0,
  };

  sets.forEach((set) => {
    if (set.bonus) {
      Object.keys(set.bonus).forEach((stat) => {
        if (bonuses[stat] !== undefined) {
          bonuses[stat] += set.bonus[stat];
        }
      });
    }
  });

  return bonuses;
};

// Перевірка чи предмет належить до набору
export const getItemSetInfo = (itemId) => {
  return ITEM_SETS.find(set => set.items.includes(itemId));
};

