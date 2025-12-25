import { createClient } from '@supabase/supabase-js';

// Конфігурація Supabase (в реальному проєкті використовуйте змінні оточення)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Перевірка чи налаштовано Supabase
const isSupabaseConfigured = supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Авторизація через Telegram WebApp InitData
 * Використовує Telegram ID як унікальний ідентифікатор
 */
export const authenticateWithTelegram = async () => {
  if (!supabase) {
    console.warn('Supabase не налаштовано');
    return null;
  }

  try {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      console.warn('Telegram WebApp не доступний');
      return null;
    }

    const initData = tg.initData;
    const initDataUnsafe = tg.initDataUnsafe;
    const user = initDataUnsafe?.user;

    if (!user) {
      console.warn('Дані користувача Telegram не знайдені');
      return null;
    }

    // Створюємо або оновлюємо профіль користувача
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          telegram_id: user.id.toString(),
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Гравець',
          avatar_url: user.photo_url || null,
          last_seen: new Date().toISOString(),
        },
        {
          onConflict: 'telegram_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Помилка авторизації:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Помилка авторизації з Telegram:', error);
    return null;
  }
};

/**
 * Збереження прогресу гравця
 */
export const saveProgress = async (telegramId, playerData) => {
  if (!supabase) {
    console.warn('Supabase не налаштовано, прогрес не збережено');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        level: playerData.level,
        experience: playerData.experience,
        experience_to_next: playerData.experienceToNext,
        health: playerData.health,
        max_health: playerData.maxHealth,
        mana: playerData.mana,
        max_mana: playerData.maxMana,
        gold: playerData.gold,
        items: JSON.stringify(playerData.inventory),
        equipped_items: JSON.stringify(playerData.equippedItems),
        stats: JSON.stringify(playerData.stats),
        kingdom: playerData.kingdom,
        rank: playerData.rank,
        clan_id: playerData.clanId || null,
        vip_status: playerData.vipStatus || false,
        vip_expires_at: playerData.vipExpiresAt || null,
        crystals: playerData.crystals || 0,
        bosses_killed: playerData.bossesKilled || 0,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('telegram_id', telegramId.toString())
      .select()
      .single();

    if (error) {
      console.error('Помилка збереження прогресу:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Помилка збереження прогресу:', error);
    return null;
  }
};

/**
 * Завантаження прогресу гравця
 */
export const loadProgress = async (telegramId) => {
  if (!supabase) {
    console.warn('Supabase не налаштовано, прогрес не завантажено');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        clans!left (
          tag
        )
      `)
      .eq('telegram_id', telegramId.toString())
      .single();

    if (error) {
      console.error('Помилка завантаження прогресу:', error);
      return null;
    }

    // Валідація та обробка даних
    if (data) {
      try {
        // Додаємо тег клану до даних
        if (data.clan_id && data.clans) {
          if (Array.isArray(data.clans) && data.clans.length > 0) {
            data.clanTag = data.clans[0].tag;
          } else if (data.clans.tag) {
            data.clanTag = data.clans.tag;
          }
        }

        // Валідація та парсинг JSON полів
        if (data.items) {
          try {
            data.items = typeof data.items === 'string' ? JSON.parse(data.items) : data.items;
            if (!Array.isArray(data.items)) data.items = [];
          } catch (e) {
            console.warn('Помилка парсингу items:', e);
            data.items = [];
          }
        }

        if (data.equipped_items) {
          try {
            data.equipped_items = typeof data.equipped_items === 'string' 
              ? JSON.parse(data.equipped_items) 
              : data.equipped_items;
            if (typeof data.equipped_items !== 'object' || !data.equipped_items) {
              data.equipped_items = { weapon: null, armor: null };
            }
          } catch (e) {
            console.warn('Помилка парсингу equipped_items:', e);
            data.equipped_items = { weapon: null, armor: null };
          }
        }

        if (data.stats) {
          try {
            data.stats = typeof data.stats === 'string' ? JSON.parse(data.stats) : data.stats;
            if (typeof data.stats !== 'object' || !data.stats) {
              data.stats = { strength: 10, agility: 8, intelligence: 6, defense: 5 };
            }
          } catch (e) {
            console.warn('Помилка парсингу stats:', e);
            data.stats = { strength: 10, agility: 8, intelligence: 6, defense: 5 };
          }
        }

        // Перевірка терміну дії VIP
        if (data.vip_status && data.vip_expires_at) {
          const now = new Date();
          const expiresAt = new Date(data.vip_expires_at);
          if (now > expiresAt) {
            data.vip_status = false;
            data.vip_expires_at = null;
          }
        }
      } catch (error) {
        console.error('Помилка валідації даних:', error);
      }
    }

    return data;
  } catch (error) {
    console.error('Помилка завантаження прогресу:', error);
    return null;
  }
};

/**
 * Отримання списку гравців у локації
 */
export const getPlayersInLocation = async (locationId) => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('player_locations')
      .select(`
        profiles (
          telegram_id,
          name,
          level,
          kingdom,
          rank,
          avatar_url,
          clan_id
        )
      `)
      .eq('location_id', locationId);

    if (error) {
      console.error('Помилка отримання гравців:', error);
      return [];
    }

    const players = data.map((item) => item.profiles).filter(Boolean);

    // Завантажуємо теги кланів для гравців
    const playersWithClans = await Promise.all(
      players.map(async (player) => {
        if (!player.clan_id) return { ...player, clanTag: null };

        const { data: clanData } = await supabase
          .from('clans')
          .select('tag')
          .eq('id', player.clan_id)
          .single();

        return { ...player, clanTag: clanData?.tag || null };
      })
    );

    return playersWithClans;
  } catch (error) {
    console.error('Помилка отримання гравців:', error);
    return [];
  }
};

/**
 * Оновлення локації гравця
 */
export const updatePlayerLocation = async (telegramId, locationId) => {
  try {
    const { error } = await supabase
      .from('player_locations')
      .upsert(
        {
          telegram_id: telegramId.toString(),
          location_id: locationId,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'telegram_id',
        }
      );

    if (error) {
      console.error('Помилка оновлення локації:', error);
    }
  } catch (error) {
    console.error('Помилка оновлення локації:', error);
  }
};

