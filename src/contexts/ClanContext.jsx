import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const ClanContext = createContext(null);

export const ClanProvider = ({ children }) => {
  const [clan, setClan] = useState(null);
  const [clanMembers, setClanMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Завантаження клану гравця
  const loadPlayerClan = useCallback(async (telegramId) => {
    if (!supabase || !telegramId) {
      setIsLoading(false);
      return;
    }

    try {
      // Отримуємо профіль гравця з clan_id
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('clan_id')
        .eq('telegram_id', telegramId.toString())
        .single();

      if (error || !profile?.clan_id) {
        setClan(null);
        setClanMembers([]);
        setIsLoading(false);
        return;
      }

      // Завантажуємо дані клану
      const { data: clanData, error: clanError } = await supabase
        .from('clans')
        .select('*')
        .eq('id', profile.clan_id)
        .single();

      if (clanError || !clanData) {
        setClan(null);
        setClanMembers([]);
        setIsLoading(false);
        return;
      }

      setClan(clanData);

      // Завантажуємо учасників клану
      const { data: members, error: membersError } = await supabase
        .from('profiles')
        .select('telegram_id, name, level, rank, kingdom, avatar_url')
        .eq('clan_id', profile.clan_id)
        .order('level', { ascending: false });

      if (!membersError && members) {
        setClanMembers(members);
      }
    } catch (error) {
      console.error('Помилка завантаження клану:', error);
      setClan(null);
      setClanMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Створення клану
  const createClan = useCallback(async (name, tag, description, leaderId, cost) => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('clans')
        .insert({
          name,
          tag: tag.toUpperCase(),
          leader_id: leaderId.toString(),
          description,
        })
        .select()
        .single();

      if (error) {
        console.error('Помилка створення клану:', error);
        return null;
      }

      // Оновлюємо профіль гравця
      await supabase
        .from('profiles')
        .update({ clan_id: data.id })
        .eq('telegram_id', leaderId.toString());

      setClan(data);
      return data;
    } catch (error) {
      console.error('Помилка створення клану:', error);
      return null;
    }
  }, []);

  // Подача заявки на вступ
  const applyToClan = useCallback(async (clanId, playerId) => {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('clan_applications')
        .insert({
          clan_id: clanId,
          player_telegram_id: playerId.toString(),
          status: 'pending',
        });

      return !error;
    } catch (error) {
      console.error('Помилка подачі заявки:', error);
      return false;
    }
  }, []);

  // Вихід з клану
  const leaveClan = useCallback(async (playerId) => {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ clan_id: null })
        .eq('telegram_id', playerId.toString());

      if (!error) {
        setClan(null);
        setClanMembers([]);
      }

      return !error;
    } catch (error) {
      console.error('Помилка виходу з клану:', error);
      return false;
    }
  }, []);

  // Донат золота в банк клану
  const donateGold = useCallback(async (clanId, amount) => {
    if (!supabase) return false;

    try {
      const { data: currentClan, error: fetchError } = await supabase
        .from('clans')
        .select('gold_bank')
        .eq('id', clanId)
        .single();

      if (fetchError) return false;

      const { error } = await supabase
        .from('clans')
        .update({ gold_bank: (currentClan.gold_bank || 0) + amount })
        .eq('id', clanId);

      if (!error && clan) {
        setClan({ ...clan, gold_bank: (clan.gold_bank || 0) + amount });
      }

      return !error;
    } catch (error) {
      console.error('Помилка донату:', error);
      return false;
    }
  }, [clan]);

  // Покупка покращення клану
  const purchaseUpgrade = useCallback(async (clanId, upgradeId, cost) => {
    if (!supabase) return false;

    try {
      const { data: currentClan, error: fetchError } = await supabase
        .from('clans')
        .select('gold_bank, upgrades')
        .eq('id', clanId)
        .single();

      if (fetchError || (currentClan.gold_bank || 0) < cost) return false;

      const upgrades = currentClan.upgrades || [];
      if (upgrades.includes(upgradeId)) return false; // Вже куплено

      const { error } = await supabase
        .from('clans')
        .update({
          gold_bank: (currentClan.gold_bank || 0) - cost,
          upgrades: [...upgrades, upgradeId],
        })
        .eq('id', clanId);

      if (!error && clan) {
        setClan({
          ...clan,
          gold_bank: (clan.gold_bank || 0) - cost,
          upgrades: [...(clan.upgrades || []), upgradeId],
        });
      }

      return !error;
    } catch (error) {
      console.error('Помилка покупки покращення:', error);
      return false;
    }
  }, [clan]);

  return (
    <ClanContext.Provider
      value={{
        clan,
        clanMembers,
        isLoading,
        loadPlayerClan,
        createClan,
        applyToClan,
        leaveClan,
        donateGold,
        purchaseUpgrade,
      }}
    >
      {children}
    </ClanContext.Provider>
  );
};

export const useClanContext = () => {
  const context = useContext(ClanContext);
  if (!context) {
    throw new Error('useClanContext must be used within ClanProvider');
  }
  return context;
};

