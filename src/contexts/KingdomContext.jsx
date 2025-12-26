import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { initialProvinces } from '../data/kingdoms';

const KingdomContext = createContext(null);

export const KingdomProvider = ({ children }) => {
  const [provinces, setProvinces] = useState(initialProvinces);
  const [kingdomIncome, setKingdomIncome] = useState({
    northernAlliance: 0,
    desertHorde: 0,
    forestBrotherhood: 0,
  });

  // Пасивний дохід кожні 60 секунд (для тестування, в продакшені буде через API)
  useEffect(() => {
    const interval = setInterval(() => {
      setKingdomIncome((prev) => {
        const newIncome = { ...prev };
        Object.values(provinces).forEach((province) => {
          if (province.ownerKingdom) {
            const income = Math.floor(province.taxRate * 100); // Базова сума
            newIncome[province.ownerKingdom] = (newIncome[province.ownerKingdom] || 0) + income;
          }
        });
        return newIncome;
      });
    }, 60000); // Кожну хвилину

    return () => clearInterval(interval);
  }, [provinces]);

  const captureProvince = useCallback(async (provinceId, kingdomId) => {
    // Оновлюємо локально
    setProvinces((prev) => ({
      ...prev,
      [provinceId]: {
        ...prev[provinceId],
        ownerKingdom: kingdomId,
      },
    }));

    // Зберігаємо в Supabase
    try {
      const { supabase } = await import('../lib/supabaseClient');
      const { error } = await supabase
        .from('provinces')
        .update({ owner_kingdom_id: kingdomId })
        .eq('id', provinceId);

      if (error) {
        console.error('Помилка захоплення провінції:', error);
      }
    } catch (error) {
      console.error('Помилка захоплення провінції:', error);
    }
  }, []);

  const getProvinceOwner = useCallback((provinceId) => {
    return provinces[provinceId]?.ownerKingdom || null;
  }, [provinces]);

  const getProvinceTaxRate = useCallback((provinceId) => {
    return provinces[provinceId]?.taxRate || 0;
  }, [provinces]);

  // Функція для рестарту світу - повертає всі провінції до початкового стану
  const resetWorld = useCallback(async () => {
    // Оновлюємо локально
    setProvinces(initialProvinces);

    // Скидаємо дохід королівств
    setKingdomIncome({
      northernAlliance: 0,
      desertHorde: 0,
      forestBrotherhood: 0,
      mountainKingdom: 0,
      seaEmpire: 0,
      shadowClan: 0,
      firelands: 0,
      iceKingdom: 0,
      lightOrder: 0,
      darkEmpire: 0,
      dragonLands: 0,
      elfKingdom: 0,
      dwarfHalls: 0,
      orcTribes: 0,
      celestialRealm: 0,
      underworld: 0,
      technocracy: 0,
      wildlands: 0,
      crystalDomain: 0,
      stormlands: 0,
      neutralCity: 0,
    });

    // Зберігаємо в Supabase
    try {
      const { supabase } = await import('../lib/supabaseClient');
      
      // Видаляємо всі записи провінцій та створюємо знову з початковими значеннями
      await supabase.from('provinces').delete().neq('id', '');
      
      const provincesToInsert = Object.values(initialProvinces).map(province => ({
        id: province.id,
        name: province.name,
        owner_kingdom_id: province.ownerKingdom,
        tax_rate: province.taxRate,
        can_capture: province.canCapture,
        min_level_to_capture: province.minLevelToCapture || 0,
      }));

      const { error } = await supabase.from('provinces').insert(provincesToInsert);

      if (error) {
        console.error('Помилка рестарту світу:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Помилка рестарту світу:', error);
      return false;
    }
  }, []);

  return (
    <KingdomContext.Provider
      value={{
        provinces,
        setProvinces,
        kingdomIncome,
        setKingdomIncome,
        captureProvince,
        getProvinceOwner,
        getProvinceTaxRate,
        resetWorld,
      }}
    >
      {children}
    </KingdomContext.Provider>
  );
};

export const useKingdomContext = () => {
  const context = useContext(KingdomContext);
  if (!context) {
    throw new Error('useKingdomContext must be used within KingdomProvider');
  }
  return context;
};

