import { useState, useCallback } from 'react';

const initialPlayerState = {
  name: 'Герой',
  level: 1,
  experience: 0,
  experienceToNext: 100,
  health: 100,
  maxHealth: 100,
  mana: 50,
  maxMana: 50,
  gold: 100,
  kingdom: 'northernAlliance', // Початкове королівство
  rank: 'recruit', // Початковий ранг
  race: null, // Раса персонажа
  class: null, // Клас персонажа
  characterCreated: false, // Чи створений персонаж
  position: null, // Посада в королівстві
  reputation: 0, // Репутація гравця
  clanId: null, // ID клану
  clanTag: null, // Тег клану
  vipStatus: false, // VIP статус
  vipExpiresAt: null, // Термін дії VIP
  crystals: 0, // Кристали (преміум валюта)
  bossesKilled: 0, // Кількість вбитих босів
  inventory: [
    {
      id: 1,
      name: 'Меч початківця',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'common',
      quantity: 1,
      basePrice: 100,
      stats: { strength: 5 }
    },
    {
      id: 2,
      name: 'Зілля здоров\'я',
      type: 'potion',
      slot: null,
      rarity: 'common',
      quantity: 3,
      basePrice: 50,
      effect: { health: 20 }
    },
    {
      id: 3,
      name: 'Шкіряна броня',
      type: 'armor',
      slot: 'armor',
      rarity: 'common',
      quantity: 1,
      basePrice: 80,
      stats: { defense: 3 }
    },
  ],
  equippedItems: {
    weapon: null,
    armor: null,
    ring: null,
    amulet: null,
    belt: null,
    boots: null,
    helmet: null,
  },
  stats: {
    strength: 10,
    agility: 8,
    intelligence: 6,
    defense: 5,
  },
  bonuses: {
    goldMultiplier: 1,
    xpMultiplier: 1,
    defenseMultiplier: 1,
    damageMultiplier: 1,
    criticalChance: 0,
    rareItemChance: 0,
    healthRegen: 0,
    magicDamage: 0,
  },
};

export const usePlayer = () => {
  const [player, setPlayer] = useState(initialPlayerState);

  const addExperience = useCallback((amount) => {
    setPlayer((prev) => {
      let newExp = prev.experience + amount;
      let newLevel = prev.level;
      let expToNext = prev.experienceToNext;

      // Level up logic
      while (newExp >= expToNext) {
        newExp -= expToNext;
        newLevel += 1;
        expToNext = Math.floor(expToNext * 1.5);

        // При підвищенні рівня збільшуємо характеристики
        return {
          ...prev,
          experience: newExp,
          level: newLevel,
          experienceToNext: expToNext,
          maxHealth: prev.maxHealth + 10,
          health: prev.maxHealth + 10,
          maxMana: prev.maxMana + 5,
          mana: prev.maxMana + 5,
          stats: {
            strength: prev.stats.strength + 2,
            agility: prev.stats.agility + 1,
            intelligence: prev.stats.intelligence + 1,
            defense: prev.stats.defense + 1,
          },
        };
      }

      return {
        ...prev,
        experience: newExp,
        level: newLevel,
        experienceToNext: expToNext,
      };
    });
  }, []);

  const updateBonuses = useCallback((newBonuses) => {
    setPlayer((prev) => ({
      ...prev,
      bonuses: { ...prev.bonuses, ...newBonuses },
    }));
  }, []);

  const updateHealth = useCallback((amount) => {
    setPlayer((prev) => ({
      ...prev,
      health: Math.max(0, Math.min(prev.maxHealth, prev.health + amount)),
    }));
  }, []);

  const updateMana = useCallback((amount) => {
    setPlayer((prev) => ({
      ...prev,
      mana: Math.max(0, Math.min(prev.maxMana, prev.mana + amount)),
    }));
  }, []);

  const addGold = useCallback((amount) => {
    setPlayer((prev) => ({
      ...prev,
      gold: Math.max(0, prev.gold + amount),
    }));
  }, []);

  const addItem = useCallback((item) => {
    setPlayer((prev) => {
      // Якщо предмет можна складати (potion, consumable, material)
      if (item.type === 'potion' || item.type === 'consumable' || item.type === 'material' || item.stackable) {
        const existingItem = prev.inventory.find(
          (invItem) => invItem.id === item.id || (invItem.name === item.name && invItem.type === item.type)
        );
        if (existingItem) {
          return {
            ...prev,
            inventory: prev.inventory.map((invItem) =>
              (invItem.id === item.id || (invItem.name === item.name && invItem.type === item.type))
                ? { ...invItem, quantity: invItem.quantity + (item.quantity || 1) }
                : invItem
            ),
          };
        }
      }

      // Додаємо новий предмет
      return {
        ...prev,
        inventory: [...prev.inventory, { ...item, quantity: item.quantity || 1 }],
      };
    });
  }, []);

  const removeItem = useCallback((itemId, quantity = 1) => {
    setPlayer((prev) => ({
      ...prev,
      inventory: prev.inventory
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - quantity }
            : item
        )
        .filter((item) => item.quantity > 0),
    }));
  }, []);

  const equipItem = useCallback((itemId) => {
    setPlayer((prev) => {
      const item = prev.inventory.find((invItem) => invItem.id === itemId);
      if (!item || !item.slot) return prev;

      const currentEquipped = prev.equippedItems[item.slot];
      let newInventory = [...prev.inventory];
      let newEquippedItems = { ...prev.equippedItems };

      // Якщо вже щось одягнено, повертаємо в інвентар
      if (currentEquipped) {
        newInventory = newInventory.map((invItem) =>
          invItem.id === currentEquipped.id
            ? { ...invItem, quantity: invItem.quantity + 1 }
            : invItem
        );
      }

      // Одягаємо новий предмет
      newEquippedItems[item.slot] = item;

      // Видаляємо предмет з інвентаря
      newInventory = newInventory
        .map((invItem) =>
          invItem.id === itemId
            ? { ...invItem, quantity: invItem.quantity - 1 }
            : invItem
        )
        .filter((invItem) => invItem.quantity > 0);

      // Обчислюємо нові стати з урахуванням екіпірування
      let newStats = { ...prev.stats };
      if (currentEquipped?.stats) {
        Object.keys(currentEquipped.stats).forEach((stat) => {
          newStats[stat] = (newStats[stat] || 0) - (currentEquipped.stats[stat] || 0);
        });
      }
      if (item.stats) {
        Object.keys(item.stats).forEach((stat) => {
          newStats[stat] = (newStats[stat] || 0) + (item.stats[stat] || 0);
        });
      }

      return {
        ...prev,
        inventory: newInventory,
        equippedItems: newEquippedItems,
        stats: newStats,
      };
    });
  }, []);

  const unequipItem = useCallback((slot) => {
    setPlayer((prev) => {
      const equipped = prev.equippedItems[slot];
      if (!equipped) return prev;

      return {
        ...prev,
        inventory: [...prev.inventory, { ...equipped, quantity: 1 }],
        equippedItems: { ...prev.equippedItems, [slot]: null },
        stats: (() => {
          let newStats = { ...prev.stats };
          if (equipped.stats) {
            Object.keys(equipped.stats).forEach((stat) => {
              newStats[stat] = (newStats[stat] || 0) - (equipped.stats[stat] || 0);
            });
          }
          return newStats;
        })(),
      };
    });
  }, []);

  const useItem = useCallback((itemId) => {
    setPlayer((prev) => {
      const item = prev.inventory.find((invItem) => invItem.id === itemId);
      if (!item || (item.type !== 'potion' && item.type !== 'consumable')) return prev;

      let updates = { ...prev };

      // Застосовуємо ефект
      if (item.effect) {
        if (item.effect.health) {
          updates.health = Math.min(
            prev.maxHealth,
            prev.health + item.effect.health
          );
        }
        if (item.effect.mana) {
          updates.mana = Math.min(
            prev.maxMana,
            prev.mana + item.effect.mana
          );
        }
        // Обробка бафів (тимчасові бонуси)
        if (item.effect.buff) {
          // Тут можна додати систему бафів, поки що просто застосовуємо стати
          if (item.effect.buff.strength) {
            updates.stats = {
              ...prev.stats,
              strength: prev.stats.strength + item.effect.buff.strength,
            };
          }
        }
      }

      // Видаляємо предмет
      updates.inventory = prev.inventory
        .map((invItem) =>
          invItem.id === itemId
            ? { ...invItem, quantity: invItem.quantity - 1 }
            : invItem
        )
        .filter((invItem) => invItem.quantity > 0);

      return updates;
    });
  }, []);

  const updateStats = useCallback((stats) => {
    setPlayer((prev) => ({
      ...prev,
      stats: { ...prev.stats, ...stats },
    }));
  }, []);

  const loadPlayerFromDB = useCallback((dbData) => {
    setPlayer((prev) => ({
      ...prev,
      ...dbData,
      name: dbData.name || prev.name,
      race: dbData.race || null,
      class: dbData.class || null,
      characterCreated: dbData.characterCreated || false,
      position: dbData.position || null,
      reputation: dbData.reputation || 0,
      clanId: dbData.clanId || null,
      clanTag: dbData.clanTag || null,
      vipStatus: dbData.vipStatus || false,
      vipExpiresAt: dbData.vipExpiresAt || null,
      crystals: dbData.crystals || 0,
      bossesKilled: dbData.bossesKilled || 0,
    }));
  }, []);

  const updateMaxStats = useCallback((updates) => {
    setPlayer((prev) => ({
      ...prev,
      maxHealth: updates.maxHealth ? prev.maxHealth + updates.maxHealth : prev.maxHealth,
      health: updates.maxHealth ? prev.health + updates.maxHealth : prev.health, // Heal for the amount gained
      maxMana: updates.maxMana ? prev.maxMana + updates.maxMana : prev.maxMana,
      mana: updates.maxMana ? prev.mana + updates.maxMana : prev.mana,
    }));
  }, []);

  // Ініціалізація персонажа після створення
  const initializeCharacter = useCallback((characterData) => {
    const { race, kingdom, class: classData, name } = characterData;

    // Базові характеристики з раси
    const raceHealth = race.bonuses.health;
    const raceMana = race.bonuses.mana;
    const raceStats = {
      strength: race.bonuses.strength,
      agility: race.bonuses.agility,
      intelligence: race.bonuses.intelligence,
      defense: race.bonuses.defense,
    };

    // Додаткові бонуси з класу
    const classHealth = classData.bonuses.health || 0;
    const classMana = classData.bonuses.mana || 0;
    const classStats = {
      strength: classData.bonuses.strength || 0,
      agility: classData.bonuses.agility || 0,
      intelligence: classData.bonuses.intelligence || 0,
      defense: classData.bonuses.defense || 0,
    };

    // Підсумкові характеристики
    const maxHealth = raceHealth + classHealth;
    const maxMana = raceMana + classMana;
    const finalStats = {
      strength: raceStats.strength + classStats.strength,
      agility: raceStats.agility + classStats.agility,
      intelligence: raceStats.intelligence + classStats.intelligence,
      defense: raceStats.defense + classStats.defense,
    };

    setPlayer((prev) => ({
      ...prev,
      name,
      kingdom: kingdom.id,
      race: race.id,
      class: classData.id,
      characterCreated: true,
      maxHealth,
      health: maxHealth,
      maxMana,
      mana: maxMana,
      stats: finalStats,
    }));
  }, []);

  return {
    player,
    addExperience,
    updateHealth,
    updateMana,
    addGold,
    addItem,
    removeItem,
    equipItem,
    unequipItem,
    useItem,
    updateStats,
    updateMaxStats,
    updateBonuses,
    loadPlayerFromDB,
    initializeCharacter,
  };
};
