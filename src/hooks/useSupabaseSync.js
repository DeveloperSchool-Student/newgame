import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { usePlayerContext } from '../contexts/PlayerContext';
import { useKingdomContext } from '../contexts/KingdomContext';

/**
 * Hook для синхронізації даних з Supabase
 */
export const useSupabaseSync = (telegramId) => {
  const { player } = usePlayerContext();
  const { setProvinces } = useKingdomContext();

  // Завантаження провінцій
  const loadProvinces = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('provinces')
        .select('*');

      if (error) {
        console.error('Помилка завантаження провінцій:', error);
        return;
      }

      if (data) {
        const provincesMap = {};
        data.forEach((province) => {
          provincesMap[province.id] = {
            id: province.id,
            name: province.name,
            ownerKingdom: province.owner_kingdom_id,
            taxRate: province.tax_rate || 0.1,
            canCapture: province.can_capture !== false,
            minLevelToCapture: province.min_level_to_capture || 10,
          };
        });
        setProvinces(provincesMap);
      }
    } catch (error) {
      console.error('Помилка завантаження провінцій:', error);
    }
  }, [setProvinces]);

  // Завантаження стану світу (HP босів)
  const loadWorldState = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('world_state')
        .select('*')
        .eq('key', 'boss_hp');

      if (error) {
        console.error('Помилка завантаження стану світу:', error);
        return;
      }

      if (data && data.length > 0) {
        const bossHP = JSON.parse(data[0].value || '{}');
        // Оновлюємо HP босів в контексті
        // Це буде використано в BattleSystem
        return bossHP;
      }
    } catch (error) {
      console.error('Помилка завантаження стану світу:', error);
    }
  }, []);

  // Підписка на оновлення провінцій (Realtime) з обробкою помилок
  useEffect(() => {
    if (!telegramId || !supabase) return;

    let provincesChannel = null;
    let worldStateChannel = null;
    let retryCount = 0;
    const maxRetries = 3;

    const setupSubscriptions = async () => {
      try {
        loadProvinces();
        loadWorldState();

        // Підписка на зміни провінцій
        provincesChannel = supabase
          .channel(`provinces-changes-${telegramId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'provinces',
            },
            (payload) => {
              console.log('Оновлення провінції:', payload);
              loadProvinces(); // Перезавантажуємо всі провінції
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Підписка на провінції активна');
              retryCount = 0;
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Помилка підписки на провінції');
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(setupSubscriptions, 2000 * retryCount);
              }
            }
          });

        // Підписка на зміни стану світу (HP босів)
        worldStateChannel = supabase
          .channel(`world-state-changes-${telegramId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'world_state',
              filter: 'key=eq.boss_hp',
            },
            (payload) => {
              console.log('Оновлення HP боса:', payload);
              try {
                const bossHP = JSON.parse(payload.new.value || '{}');
                // Оновлюємо HP босів в контексті
                // Це буде використано в BattleSystem
              } catch (error) {
                console.error('Помилка парсингу оновлення HP боса:', error);
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Підписка на стан світу активна');
              retryCount = 0;
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Помилка підписки на стан світу');
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(setupSubscriptions, 2000 * retryCount);
              }
            }
          });
      } catch (error) {
        console.error('Помилка налаштування підписок:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(setupSubscriptions, 2000 * retryCount);
        }
      }
    };

    setupSubscriptions();

    return () => {
      if (provincesChannel && supabase) {
        supabase.removeChannel(provincesChannel);
      }
      if (worldStateChannel && supabase) {
        supabase.removeChannel(worldStateChannel);
      }
    };
  }, [telegramId, loadProvinces, loadWorldState]);

  return {
    loadProvinces,
    loadWorldState,
  };
};

