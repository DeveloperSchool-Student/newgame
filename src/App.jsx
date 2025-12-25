import { useState, useEffect, useCallback } from 'react';
import { Map } from './components/Map/Map';
import { LocationInfo } from './components/LocationInfo/LocationInfo';
import { HUD } from './components/UI/HUD';
import { InventoryGrid } from './components/Inventory/InventoryGrid';
import { LocationChatRealtime } from './components/Chat/LocationChatRealtime';
import { authenticateWithTelegram, saveProgress, loadProgress } from './lib/supabaseClient';
import { supabase } from './lib/supabaseClient';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import { BattleSystem } from './components/Battle/BattleSystem';
import { VictoryScreen } from './components/Battle/VictoryScreen';
import { CharacterModal } from './components/Modals/CharacterModal';
import { ClanManager } from './components/Clan/ClanManager';
import { ReferralSystem, handleReferralStart } from './components/Referral/ReferralSystem';
import { Leaderboard } from './components/Leaderboard/Leaderboard';
import { PremiumShop } from './components/Premium/PremiumShop';
import { AdminPanel } from './components/Admin/AdminPanel';
import { OnlineCounter } from './components/Analytics/OnlineCounter';
import { ShareResults } from './components/Share/ShareResults';
import { GlobalAnnouncement } from './components/Announcements/GlobalAnnouncement';
import { SaveIndicator } from './components/UI/SaveIndicator';
import { RealtimeConnectionIndicator } from './components/UI/RealtimeConnectionIndicator';
import { ToastProvider, useToast } from './components/UI/Toast';
import { PlayerStatistics } from './components/Statistics/PlayerStatistics';
import { EventSystem } from './components/Events/EventSystem';
import { SkillSystem } from './components/Skills/SkillSystem';
import { CraftingSystem } from './components/Crafting/CraftingSystem';
import { TransportSystem } from './components/Transport/TransportSystem';
import { ClanWarSystem } from './components/ClanWars/ClanWarSystem';
import { BattlePassSystem } from './components/BattlePass/BattlePassSystem';
import { SubscriptionSystem } from './components/Subscription/SubscriptionSystem';
import { PlayerMessaging } from './components/Messaging/PlayerMessaging';
import { PlayerProvider, usePlayerContext } from './contexts/PlayerContext';
import { KingdomProvider, useKingdomContext } from './contexts/KingdomContext';
import { ClanProvider, useClanContext } from './contexts/ClanContext';
import { ShopModal } from './components/Shop/ShopModal';
import { QuestSystem } from './components/Quest/QuestSystem';
import { AchievementSystem } from './components/Achievements/AchievementSystem';
import { PvPSystem } from './components/PvP/PvPSystem';
import { ResourceGathering } from './components/ResourceGathering/ResourceGathering';

// Визначення локацій з босами
const locationsData = {
  capital: {
    id: 'capital',
    name: 'Столиця',
    description: 'Величезне місто з замками та баштами. Тут ви знайдете торговців та квести.',
    type: 'місто',
    bossHP: null,
  },
  darkForest: {
    id: 'darkForest',
    name: 'Темний ліс',
    description: 'Таємничий ліс, повний небезпек та пригод. Тут можна знайти рідкісні ресурси та полювати на монстрів.',
    type: 'ліс',
    bossHP: null,
  },
  forgottenMines: {
    id: 'forgottenMines',
    name: 'Забуті шахти',
    description: 'Темні підземні шахти з потужними ворогами. Тільки для досвідчених воїнів! Тут можна полювати на монстрів.',
    type: 'підземелля',
    bossHP: 500, // Початковий HP боса для підземелля
  },
};

// Генерація випадкових предметів для дослідження
const generateRandomItem = () => {
  const items = [
    {
      id: Date.now(),
      name: 'Зілля здоров\'я',
      type: 'potion',
      slot: null,
      rarity: 'common',
      quantity: 1,
      effect: { health: 20 },
    },
    {
      id: Date.now() + 1,
      name: 'Зілля мани',
      type: 'potion',
      slot: null,
      rarity: 'common',
      quantity: 1,
      effect: { mana: 15 },
    },
    {
      id: Date.now() + 2,
      name: 'Меч мандрівника',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'rare',
      quantity: 1,
      stats: { strength: 8 },
    },
    {
      id: Date.now() + 3,
      name: 'Кольчуга',
      type: 'armor',
      slot: 'armor',
      rarity: 'rare',
      quantity: 1,
      stats: { defense: 5 },
    },
    {
      id: Date.now() + 4,
      name: 'Епічний меч',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'epic',
      quantity: 1,
      stats: { strength: 15, agility: 5 },
    },
  ];
  return items[Math.floor(Math.random() * items.length)];
};

function AppContent() {
  const { captureProvince } = useKingdomContext();
  const { showToast } = useToast();
  // Стан для активної локації (об'єкт з назвою, описом та типом)
  const [activeLocation, setActiveLocation] = useState(null);

  // Стан для вибраного регіону на карті
  const [selectedRegion, setSelectedRegion] = useState(null);

  // Стани для модальних вікон
  const [isModalOpen, setIsModalOpen] = useState({
    chat: false,
    inventory: false,
    character: false,
    battle: false,
    victory: false,
    resourceGathering: false,
    shop: false,
    clan: false,
    referral: false,
    leaderboard: false,
    premium: false,
    admin: false,
    quest: false,
    achievements: false,
    pvp: false,
    statistics: false,
    events: false,
    skills: false,
    crafting: false,
    transport: false,
    clanWars: false,
    battlePass: false,
    subscription: false,
    messaging: false,
  });

  // Стан для HP босів (спільний для всіх гравців)
  const [bossesHP, setBossesHP] = useState({
    forgottenMines: 500,
  });

  // Стан для нагород після перемоги
  const [victoryData, setVictoryData] = useState({
    experience: 0,
  });

  const { player, addItem, addGold, updateHealth, addExperience, loadPlayerFromDB } = usePlayerContext();
  const { loadPlayerClan, clan } = useClanContext();
  const [telegramId, setTelegramId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Авторизація та завантаження прогресу
  useEffect(() => {
    const initGame = async () => {
      try {
        // Обробка реферального посилання
        const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
        if (startParam) {
          await handleReferralStart(startParam);
        }

        // Авторизація через Telegram
        const profile = await authenticateWithTelegram();
        if (profile) {
          setTelegramId(profile.telegram_id);

          // Завантаження прогресу
          const savedProgress = await loadProgress(profile.telegram_id);
          if (savedProgress) {
            loadPlayerFromDB({
              level: savedProgress.level || 1,
              experience: savedProgress.experience || 0,
              experienceToNext: savedProgress.experience_to_next || 100,
              health: savedProgress.health || 100,
              maxHealth: savedProgress.max_health || 100,
              mana: savedProgress.mana || 50,
              maxMana: savedProgress.max_mana || 50,
              gold: savedProgress.gold || 100,
              inventory: (() => {
                try {
                  if (!savedProgress.items) return [];
                  return typeof savedProgress.items === 'string' ? JSON.parse(savedProgress.items) : savedProgress.items;
                } catch (e) {
                  console.warn('Помилка парсингу inventory:', e);
                  return [];
                }
              })(),
              equippedItems: (() => {
                try {
                  if (!savedProgress.equipped_items) return { weapon: null, armor: null, ring: null, amulet: null, belt: null, boots: null, helmet: null };
                  const parsed = typeof savedProgress.equipped_items === 'string' ? JSON.parse(savedProgress.equipped_items) : savedProgress.equipped_items;
                  return typeof parsed === 'object' && parsed ? {
                    weapon: parsed.weapon || null,
                    armor: parsed.armor || null,
                    ring: parsed.ring || null,
                    amulet: parsed.amulet || null,
                    belt: parsed.belt || null,
                    boots: parsed.boots || null,
                    helmet: parsed.helmet || null,
                  } : { weapon: null, armor: null, ring: null, amulet: null, belt: null, boots: null, helmet: null };
                } catch (e) {
                  console.warn('Помилка парсингу equipped_items:', e);
                  return { weapon: null, armor: null, ring: null, amulet: null, belt: null, boots: null, helmet: null };
                }
              })(),
              stats: (() => {
                try {
                  if (!savedProgress.stats) return { strength: 10, agility: 8, intelligence: 6, defense: 5 };
                  const parsed = typeof savedProgress.stats === 'string' ? JSON.parse(savedProgress.stats) : savedProgress.stats;
                  return typeof parsed === 'object' && parsed ? parsed : { strength: 10, agility: 8, intelligence: 6, defense: 5 };
                } catch (e) {
                  console.warn('Помилка парсингу stats:', e);
                  return { strength: 10, agility: 8, intelligence: 6, defense: 5 };
                }
              })(),
              kingdom: savedProgress.kingdom || 'northernAlliance',
              rank: savedProgress.rank || 'recruit',
              clanId: savedProgress.clan_id || null,
              clanTag: savedProgress.clanTag || null,
              vipStatus: savedProgress.vip_status || false,
              vipExpiresAt: savedProgress.vip_expires_at || null,
              crystals: savedProgress.crystals || 0,
              bossesKilled: savedProgress.bosses_killed || 0,
            });

            // Завантажуємо клан гравця
            if (savedProgress.clan_id) {
              await loadPlayerClan(profile.telegram_id);
            }
          }
        }
      } catch (error) {
        console.error('Помилка ініціалізації:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initGame();
  }, [loadPlayerFromDB, loadPlayerClan]);

  // Синхронізація з Supabase
  useSupabaseSync(telegramId);

  // Перевірка терміну дії VIP статусу
  useEffect(() => {
    if (!player.vipStatus || !player.vipExpiresAt) return;

    const checkVIPExpiration = () => {
      const now = new Date();
      const expiresAt = new Date(player.vipExpiresAt);

      if (now > expiresAt) {
        // VIP прострочений, деактивуємо
        if (supabase && telegramId) {
          supabase
            .from('profiles')
            .update({ vip_status: false, vip_expires_at: null })
            .eq('telegram_id', telegramId.toString())
            .then(() => {
              // Оновлюємо локальний стан
              loadPlayerFromDB({ ...player, vipStatus: false, vipExpiresAt: null });
            });
        }
      }
    };

    // Перевіряємо одразу
    checkVIPExpiration();

    // Перевіряємо кожну хвилину
    const interval = setInterval(checkVIPExpiration, 60000);

    return () => clearInterval(interval);
  }, [player.vipStatus, player.vipExpiresAt, telegramId, player, loadPlayerFromDB]);

  // Збереження прогресу при важливих діях (не при кожній зміні інвентаря)
  useEffect(() => {
    if (!telegramId || isLoading) return;

    const saveProgressDebounced = async () => {
      setIsSaving(true);
      await saveProgress(telegramId, player);
      setTimeout(() => setIsSaving(false), 500);
    };

    // Зберігаємо прогрес при зміні важливих параметрів
    const timeoutId = setTimeout(saveProgressDebounced, 2000); // Debounce 2 секунди

    return () => clearTimeout(timeoutId);
  }, [telegramId, player.level, player.experience, player.gold, player.equippedItems, player.stats, isLoading]);

  // Ініціалізація Telegram SDK
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@twa-dev/sdk')
        .then((sdk) => {
          sdk.ready();
          sdk.expand();
          sdk.setHeaderColor('#1a1a2e');
          sdk.setBackgroundColor('#0f0f1e');
        })
        .catch(() => {
          // Fallback до window.Telegram якщо SDK недоступний
          if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            tg.setHeaderColor('#1a1a2e');
            tg.setBackgroundColor('#0f0f1e');
          }
        });
    }
  }, []);

  // Функція для виклику тактильного зворотного зв'язку
  const triggerHapticFeedback = useCallback(() => {
    if (typeof window !== 'undefined') {
      import('@twa-dev/sdk')
        .then((sdk) => {
          sdk.HapticFeedback.impactOccurred('light');
        })
        .catch(() => {
          if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
          }
        });
    }
  }, []);

  // Функція для показу popup через Telegram
  const showTelegramPopup = useCallback((title, message, buttons = [{ text: 'OK', type: 'default' }]) => {
    if (typeof window !== 'undefined') {
      import('@twa-dev/sdk')
        .then((sdk) => {
          sdk.showPopup({
            title,
            message,
            buttons,
          });
        })
        .catch(() => {
          if (window.Telegram?.WebApp?.showPopup) {
            window.Telegram.WebApp.showPopup({
              title,
              message,
              buttons,
            });
          } else {
            // Fallback до alert якщо Telegram недоступний
            alert(`${title}\n\n${message}`);
          }
        });
    }
  }, []);

  // Обробник вибору регіону на карті
  const handleSelectRegion = useCallback(
    (regionId) => {
      triggerHapticFeedback();
      setSelectedRegion(regionId);

      // Встановлюємо активну локацію на основі вибраного регіону
      if (locationsData[regionId]) {
        const location = { ...locationsData[regionId] };
        // Додаємо поточний HP боса якщо це підземелля
        if (location.id === 'forgottenMines') {
          location.bossHP = bossesHP.forgottenMines;
        }
        setActiveLocation(location);
      }
    },
    [triggerHapticFeedback, bossesHP]
  );

  // Обробник дослідження локації
  const handleExplore = useCallback(async () => {
    triggerHapticFeedback();
    setIsSaving(true);

    // 50% шанс на успіх
    const isSuccess = Math.random() > 0.5;

    if (isSuccess) {
      // Успіх: знаходимо золото або предмет
      const foundGold = Math.floor(Math.random() * 50) + 10;
      const foundItem = Math.random() > 0.6; // 40% шанс знайти предмет

      if (foundItem) {
        const item = generateRandomItem();
        addItem(item);
        showTelegramPopup(
          '🎉 Знайдено предмет!',
          `Ви знайшли: ${item.name}\n\nРідкість: ${item.rarity === 'common' ? 'Звичайна' :
            item.rarity === 'uncommon' ? 'Постійна' :
              item.rarity === 'combat' ? 'Бойова' :
                item.rarity === 'epic' ? 'Епічна' :
                  item.rarity === 'legendary' ? 'Легендарна' :
                    item.rarity === 'mythic' ? 'Міфічна' :
                      item.rarity === 'divine' ? 'Божественна' : 'Звичайна'
          }`,
          [{ text: 'Чудово!', type: 'default' }]
        );
      } else {
        // Застосування бонусів подій
        const eventGoldMultiplier = window.gameEvents?.getBonus?.('gold') || 1.0;
        const eventXPMultiplier = window.gameEvents?.getBonus?.('xp') || 1.0;

        // Застосування бонусів підписки
        const subscriptionGoldMultiplier = window.gameSubscription?.active ? (window.gameSubscription.bonuses?.goldMultiplier || 1.0) : 1.0;
        const subscriptionXPMultiplier = window.gameSubscription?.active ? (window.gameSubscription.bonuses?.xpMultiplier || 1.0) : 1.0;

        const totalGoldMultiplier = eventGoldMultiplier * subscriptionGoldMultiplier;
        const totalXPMultiplier = eventXPMultiplier * subscriptionXPMultiplier;

        const finalGold = Math.floor(foundGold * totalGoldMultiplier);
        const finalXP = Math.floor((Math.random() * 10 + 5) * totalXPMultiplier);

        addGold(finalGold);
        addExperience(finalXP);

        showTelegramPopup(
          '💰 Знайдено золото!',
          `Ви знайшли ${finalGold} золотих монет!${eventGoldMultiplier > 1 ? ` (x${eventGoldMultiplier} бонус події!)` : ''}`,
          [{ text: 'Чудово!', type: 'default' }]
        );
      }

      // Перевіряємо квести на дослідження
      if (window.questSystem?.checkProgress) {
        window.questSystem.checkProgress('daily', 1);
      }

      // Перевіряємо квести на збір золота
      if (window.questSystem?.checkProgress && foundGold) {
        window.questSystem.checkProgress('gold_collect', foundGold);
      }
    } else {
      // Неуспіх: втрачаємо HP
      const damage = Math.floor(Math.random() * 15) + 5;
      updateHealth(-damage);

      showTelegramPopup(
        '⚠️ Небезпека!',
        `Ви натрапили на небезпеку та втратили ${damage} HP!`,
        [{ text: 'Ой...', type: 'default' }]
      );
    }

    // Зберігаємо прогрес після дослідження
    if (telegramId) {
      await saveProgress(telegramId, player);
    }
    setTimeout(() => setIsSaving(false), 500);
  }, [triggerHapticFeedback, addItem, addGold, updateHealth, addExperience, showTelegramPopup, telegramId, player, saveProgress]);

  // Обробник відкриття чату з LocationInfo
  const handleEnterChat = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, chat: true }));
  }, [triggerHapticFeedback]);

  // Обробник полювання на монстрів / входу в бій
  const handleHuntMonsters = useCallback(() => {
    triggerHapticFeedback();

    // Якщо це підземелля, відкриваємо бойовий екран
    if (activeLocation?.id === 'forgottenMines') {
      setIsModalOpen((prev) => ({ ...prev, battle: true }));
    } else {
      showTelegramPopup(
        '⚔️ Полювання',
        `Початок полювання на монстрів в ${activeLocation?.name}!`,
        [{ text: 'Готовий!', type: 'default' }]
      );
    }
  }, [triggerHapticFeedback, activeLocation, showTelegramPopup]);

  // Обробник шкоди босу (спільний HP)
  const handleBossDamage = useCallback((damage) => {
    if (selectedRegion === 'forgottenMines') {
      setBossesHP((prev) => {
        const newHP = Math.max(0, prev.forgottenMines - damage);
        return { ...prev, forgottenMines: newHP };
      });

      // Оновлюємо activeLocation з новим HP
      setActiveLocation((prev) => {
        if (prev?.id === 'forgottenMines') {
          return { ...prev, bossHP: Math.max(0, (prev.bossHP || 500) - damage) };
        }
        return prev;
      });
    }
  }, [selectedRegion]);

  // Обробник перемоги над босом
  const handleBossDefeat = useCallback(async () => {
    let experienceGained = 100 + Math.floor(Math.random() * 50);

    // Застосування покращення клану "Досвідчені мисливці" (+10% до досвіду за босів)
    if (clan && (clan.upgrades || []).includes('experiencedHunters')) {
      experienceGained = Math.floor(experienceGained * 1.1);
    }

    // Застосування VIP статусу (подвійний досвід) - перевіряємо термін дії
    if (player.vipStatus && player.vipExpiresAt) {
      const now = new Date();
      const expiresAt = new Date(player.vipExpiresAt);
      if (now <= expiresAt) {
        experienceGained = Math.floor(experienceGained * 2);
      }
    }

    // Застосування множника досвіду з серверних налаштувань
    if (supabase) {
      try {
        const { data: settings } = await supabase
          .from('server_settings')
          .select('value')
          .eq('key', 'xp_multiplier')
          .single();

        if (settings && settings.value) {
          experienceGained = Math.floor(experienceGained * settings.value);
        }
      } catch (error) {
        console.error('Помилка завантаження множника досвіду:', error);
      }
    }

    // Застосування бонусів подій
    const eventGoldMultiplier = window.gameEvents?.getBonus?.('gold') || 1.0;
    const eventXPMultiplier = window.gameEvents?.getBonus?.('xp') || 1.0;

    // Застосування бонусів підписки
    const subscriptionGoldMultiplier = window.gameSubscription?.active ? (window.gameSubscription.bonuses?.goldMultiplier || 1.0) : 1.0;
    const subscriptionXPMultiplier = window.gameSubscription?.active ? (window.gameSubscription.bonuses?.xpMultiplier || 1.0) : 1.0;

    const totalGoldMultiplier = eventGoldMultiplier * subscriptionGoldMultiplier;
    const totalXPMultiplier = eventXPMultiplier * subscriptionXPMultiplier;

    experienceGained = Math.floor(experienceGained * totalXPMultiplier);
    const goldGained = Math.floor(experienceGained * 2 * totalGoldMultiplier);

    addExperience(experienceGained);
    addGold(goldGained);

    // Додаємо XP до бойового пропуску
    if (typeof window !== 'undefined' && window.addBattlePassXP) {
      window.addBattlePassXP(experienceGained);
    }

    setVictoryData({ experience: experienceGained });
    setIsModalOpen((prev) => ({ ...prev, battle: false, victory: true }));

    // Скидаємо HP боса для наступного бою
    setBossesHP((prev) => ({ ...prev, forgottenMines: 500 }));

    // Оновлюємо кількість вбитих босів
    if (supabase && telegramId) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('bosses_killed')
          .eq('telegram_id', telegramId.toString())
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ bosses_killed: (profile.bosses_killed || 0) + 1 })
            .eq('telegram_id', telegramId.toString());
        }
      } catch (error) {
        console.error('Помилка оновлення вбитих босів:', error);
      }
    }

    // Перевіряємо квести на вбивство босів
    if (window.questSystem?.checkProgress) {
      window.questSystem.checkProgress('boss_kill', 1);
    }

    // Зберігаємо прогрес після перемоги
    if (telegramId) {
      await saveProgress(telegramId, {
        ...player,
        experience: player.experience + experienceGained,
        gold: player.gold + Math.floor(experienceGained * 2),
        bossesKilled: (player.bossesKilled || 0) + 1,
      });
    }
  }, [addExperience, addGold, telegramId, player, clan, saveProgress]);

  // Обробник отримання луту
  const handleClaimLoot = useCallback(async (loot) => {
    addItem(loot);
    showTelegramPopup(
      '🎁 Лут отримано!',
      `Ви отримали: ${loot.name}`,
      [{ text: 'Чудово!', type: 'default' }]
    );

    // Зберігаємо прогрес після отримання луту
    if (telegramId) {
      setIsSaving(true);
      await saveProgress(telegramId, player);
      setTimeout(() => setIsSaving(false), 500);
    }
  }, [addItem, showTelegramPopup, telegramId, player, saveProgress]);

  // Обробники відкриття модальних вікон
  const handleOpenInventory = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, inventory: true }));
  }, [triggerHapticFeedback]);

  const handleOpenCharacter = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, character: true }));
  }, [triggerHapticFeedback]);

  const handleOpenChat = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, chat: true }));
  }, [triggerHapticFeedback]);

  const handleOpenShop = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, shop: true }));
  }, [triggerHapticFeedback]);

  const handleOpenTransport = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, transport: true }));
  }, [triggerHapticFeedback]);

  const handleOpenResourceGathering = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, resourceGathering: true }));
  }, [triggerHapticFeedback]);

  const handleLocationChange = useCallback((newLocationId) => {
    if (locationsData[newLocationId]) {
      const location = { ...locationsData[newLocationId] };
      if (location.id === 'forgottenMines') {
        location.bossHP = bossesHP.forgottenMines;
      }
      setActiveLocation(location);
      setSelectedRegion(newLocationId);
    }
  }, [bossesHP]);

  const handleCaptureProvince = useCallback((provinceId) => {
    triggerHapticFeedback();
    captureProvince(provinceId, player.kingdom);
    showTelegramPopup(
      '🏰 Провінція захоплена!',
      `Ви захопили ${activeLocation?.name} для ${player.kingdom}!`,
      [{ text: 'Чудово!', type: 'default' }]
    );
    // Оновлюємо activeLocation
    setActiveLocation((prev) => ({
      ...prev,
      ownerKingdom: player.kingdom,
    }));

    // Перевіряємо квести на захоплення провінцій
    if (window.questSystem?.checkProgress) {
      window.questSystem.checkProgress('province_capture', 1, provinceId);
    }
  }, [triggerHapticFeedback, captureProvince, player.kingdom, activeLocation, showTelegramPopup]);

  const handleOpenQuest = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, quest: true }));
  }, [triggerHapticFeedback]);

  const handleOpenAchievements = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, achievements: true }));
  }, [triggerHapticFeedback]);

  const handleOpenPvP = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, pvp: true }));
  }, [triggerHapticFeedback]);

  const handleOpenStatistics = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, statistics: true }));
  }, [triggerHapticFeedback]);

  const handleOpenEvents = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, events: true }));
  }, [triggerHapticFeedback]);

  const handleOpenSkills = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, skills: true }));
  }, [triggerHapticFeedback]);

  const handleOpenCrafting = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, crafting: true }));
  }, [triggerHapticFeedback]);

  const handleOpenClanWars = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, clanWars: true }));
  }, [triggerHapticFeedback]);

  const handleOpenBattlePass = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, battlePass: true }));
  }, [triggerHapticFeedback]);

  const handleOpenSubscription = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, subscription: true }));
  }, [triggerHapticFeedback]);

  const handleOpenMessaging = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, messaging: true }));
  }, [triggerHapticFeedback]);

  const handleOpenClan = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, clan: true }));
  }, [triggerHapticFeedback]);

  const handleOpenReferral = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, referral: true }));
  }, [triggerHapticFeedback]);

  const handleOpenLeaderboard = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, leaderboard: true }));
  }, [triggerHapticFeedback]);

  const handleOpenPremium = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, premium: true }));
  }, [triggerHapticFeedback]);

  const handleOpenAdmin = useCallback(() => {
    triggerHapticFeedback();
    setIsModalOpen((prev) => ({ ...prev, admin: true }));
  }, [triggerHapticFeedback]);

  // Обробник закриття модальних вікон
  const handleCloseModal = useCallback((modalType) => {
    if (modalType) {
      setIsModalOpen((prev) => ({ ...prev, [modalType]: false }));
    } else {
      setIsModalOpen({ chat: false, inventory: false, character: false, battle: false, victory: false });
    }
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-fantasy-purple/30 border-t-fantasy-purple rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-fantasy-gold text-lg font-semibold">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900">
      {/* Глобальний анонс */}
      <GlobalAnnouncement />

      {/* Онлайн лічильник */}
      <OnlineCounter />

      {/* Кнопка поділитися */}
      <ShareResults />

      {/* Індикатор збереження */}
      <SaveIndicator isSaving={isSaving} />

      {/* Індикатор підключення Realtime */}
      <RealtimeConnectionIndicator />

      {/* Головна карта */}
      <Map selectedRegion={selectedRegion} onSelectRegion={handleSelectRegion} />

      {/* Панель інформації про локацію */}
      {activeLocation && !isModalOpen.battle && (
        <LocationInfo
          location={activeLocation}
          onEnterChat={handleEnterChat}
          onHuntMonsters={handleHuntMonsters}
          onExplore={handleExplore}
          onOpenShop={handleOpenShop}
          onCaptureProvince={handleCaptureProvince}
          onOpenTransport={handleOpenTransport}
          onOpenResourceGathering={handleOpenResourceGathering}
        />
      )}

      {/* Статистика гравця (верхній правий кут) */}
      {!isModalOpen.battle && (
        <div className="absolute top-4 right-4 bg-fantasy-dark/90 backdrop-blur-sm border-2 border-fantasy-purple rounded-lg p-3 glow-purple z-10">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-xs text-gray-400">Рівень</div>
              <div className="text-xl font-bold text-fantasy-gold">{player.level}</div>
            </div>
            <div className="h-8 w-px bg-fantasy-purple/50" />
            <div className="text-center">
              <div className="text-xs text-gray-400">Здоров'я</div>
              <div className="text-lg font-bold text-fantasy-red">
                {player.health}/{player.maxHealth}
              </div>
            </div>
            <div className="h-8 w-px bg-fantasy-purple/50" />
            <div className="text-center">
              <div className="text-xs text-gray-400">Золото</div>
              <div className="text-lg font-bold text-fantasy-gold">{player.gold} 🪙</div>
            </div>
          </div>
        </div>
      )}

      {/* HUD (зафіксований внизу) */}
      {!isModalOpen.battle && (
        <HUD
          onOpenInventory={handleOpenInventory}
          onOpenCharacter={handleOpenCharacter}
          onOpenChat={handleOpenChat}
          onOpenClan={handleOpenClan}
          onOpenClanWars={handleOpenClanWars}
          onOpenReferral={handleOpenReferral}
          onOpenLeaderboard={handleOpenLeaderboard}
          onOpenPremium={handleOpenPremium}
          onOpenAdmin={handleOpenAdmin}
          onOpenQuest={handleOpenQuest}
          onOpenAchievements={handleOpenAchievements}
          onOpenPvP={handleOpenPvP}
          onOpenStatistics={handleOpenStatistics}
          onOpenEvents={handleOpenEvents}
          onOpenSkills={handleOpenSkills}
          onOpenCrafting={handleOpenCrafting}
          onOpenBattlePass={handleOpenBattlePass}
          onOpenSubscription={handleOpenSubscription}
          onOpenMessaging={handleOpenMessaging}
        />
      )}

      {/* Модальні вікна */}
      <InventoryGrid
        isOpen={isModalOpen.inventory}
        onClose={() => handleCloseModal('inventory')}
      />
      <CharacterModal
        isOpen={isModalOpen.character}
        onClose={() => handleCloseModal('character')}
      />
      <LocationChatRealtime
        isOpen={isModalOpen.chat}
        onClose={() => handleCloseModal('chat')}
        activeLocation={activeLocation}
      />
      <BattleSystem
        isOpen={isModalOpen.battle}
        onClose={() => handleCloseModal('battle')}
        locationId={selectedRegion}
        bossHP={bossesHP[selectedRegion] || null}
        onBossDamage={handleBossDamage}
        onBossDefeat={handleBossDefeat}
      />
      <VictoryScreen
        isOpen={isModalOpen.victory}
        onClose={() => handleCloseModal('victory')}
        experienceGained={victoryData.experience}
        onClaimLoot={handleClaimLoot}
      />
      <ShopModal
        isOpen={isModalOpen.shop}
        onClose={() => handleCloseModal('shop')}
        locationId={selectedRegion}
        telegramId={telegramId}
      />
      <ClanManager
        isOpen={isModalOpen.clan}
        onClose={() => handleCloseModal('clan')}
        onOpenClanWars={handleOpenClanWars}
      />
      <ReferralSystem
        isOpen={isModalOpen.referral}
        onClose={() => handleCloseModal('referral')}
      />
      <Leaderboard
        isOpen={isModalOpen.leaderboard}
        onClose={() => handleCloseModal('leaderboard')}
      />
      <PremiumShop
        isOpen={isModalOpen.premium}
        onClose={() => handleCloseModal('premium')}
      />
      <AdminPanel
        isOpen={isModalOpen.admin}
        onClose={() => handleCloseModal('admin')}
      />
      <QuestSystem
        isOpen={isModalOpen.quest}
        onClose={() => handleCloseModal('quest')}
        telegramId={telegramId}
        onProvinceCapture={handleCaptureProvince}
      />
      <AchievementSystem
        isOpen={isModalOpen.achievements}
        onClose={() => handleCloseModal('achievements')}
        telegramId={telegramId}
      />
      <PvPSystem
        isOpen={isModalOpen.pvp}
        onClose={() => handleCloseModal('pvp')}
        telegramId={telegramId}
      />
      <PlayerStatistics
        isOpen={isModalOpen.statistics}
        onClose={() => handleCloseModal('statistics')}
        telegramId={telegramId}
      />
      <EventSystem
        isOpen={isModalOpen.events}
        onClose={() => handleCloseModal('events')}
        telegramId={telegramId}
      />
      <SkillSystem
        isOpen={isModalOpen.skills}
        onClose={() => handleCloseModal('skills')}
        telegramId={telegramId}
      />
      <CraftingSystem
        isOpen={isModalOpen.crafting}
        onClose={() => handleCloseModal('crafting')}
        telegramId={telegramId}
      />
      {activeLocation && (
        <TransportSystem
          isOpen={isModalOpen.transport}
          onClose={() => handleCloseModal('transport')}
          currentLocation={activeLocation}
          onLocationChange={handleLocationChange}
        />
      )}
      <ClanWarSystem
        isOpen={isModalOpen.clanWars}
        onClose={() => handleCloseModal('clanWars')}
        telegramId={telegramId}
      />
      <BattlePassSystem
        isOpen={isModalOpen.battlePass}
        onClose={() => handleCloseModal('battlePass')}
        telegramId={telegramId}
      />
      <SubscriptionSystem
        isOpen={isModalOpen.subscription}
        onClose={() => handleCloseModal('subscription')}
        telegramId={telegramId}
      />
      {activeLocation && (
        <ResourceGathering
          isOpen={isModalOpen.resourceGathering}
          onClose={() => handleCloseModal('resourceGathering')}
          locationId={activeLocation.id}
        />
      )}
      <PlayerMessaging
        isOpen={isModalOpen.messaging}
        onClose={() => handleCloseModal('messaging')}
        telegramId={telegramId}
      />
    </div>
  );
}

function App() {
  return (
    <KingdomProvider>
      <ClanProvider>
        <PlayerProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </PlayerProvider>
      </ClanProvider>
    </KingdomProvider>
  );
}

export default App;
