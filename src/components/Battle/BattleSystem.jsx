import { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { useClanContext } from '../../contexts/ClanContext';
import { supabase } from '../../lib/supabaseClient';

const BOSS_DATA = {
  forgottenMines: {
    name: 'Король Гоблінів',
    maxHP: 500,
    attack: 25,
    defense: 10,
    emoji: '👹',
  },
};

export const BattleSystem = ({ isOpen, onClose, locationId, bossHP, onBossDamage, onBossDefeat }) => {
  const { player, updateHealth, updateMana, addExperience, addItem, addGold } = usePlayerContext();
  const { clan } = useClanContext();
  const [currentBossHP, setCurrentBossHP] = useState(bossHP || BOSS_DATA[locationId]?.maxHP || 500);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleLog, setBattleLog] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [clanComboCount, setClanComboCount] = useState(0); // Кількість гравців клану в бою
  const handleBossAttackRef = useRef(null);
  const [damageNumbers, setDamageNumbers] = useState([]);
  const [isBossHit, setIsBossHit] = useState(false);
  const [isPlayerHit, setIsPlayerHit] = useState(false);
  const [magicParticles, setMagicParticles] = useState([]);
  const [criticalFlash, setCriticalFlash] = useState(false);

  // Перевірка скільки гравців клану в бою
  useEffect(() => {
    if (!isOpen || !locationId || !clan) return;

    const checkClanMembers = async () => {
      if (!supabase) return;

      try {
        // Отримуємо всіх гравців у цій локації з того ж клану
        const { data, error } = await supabase
          .from('player_locations')
          .select(`
            profiles!inner (
              clan_id
            )
          `)
          .eq('location_id', locationId)
          .eq('profiles.clan_id', clan.id);

        if (!error && data) {
          setClanComboCount(data.length);
        }
      } catch (error) {
        console.error('Помилка перевірки кланових гравців:', error);
      }
    };

    checkClanMembers();

    // Підписка на зміни локацій гравців
    const checkChannel = supabase
      .channel(`clan-check-${locationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'player_locations',
          filter: `location_id=eq.${locationId}`,
        },
        () => {
          checkClanMembers();
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(checkChannel);
      }
    };
  }, [isOpen, locationId, clan]);

  // Завантаження та підписка на HP боса з Supabase
  useEffect(() => {
    if (!isOpen || !locationId) return;

    const loadBossHP = async () => {
      if (!supabase) {
        setCurrentBossHP(BOSS_DATA[locationId]?.maxHP || 500);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('world_state')
          .select('value')
          .eq('key', 'boss_hp')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Помилка завантаження HP боса:', error);
          setCurrentBossHP(BOSS_DATA[locationId]?.maxHP || 500);
          return;
        }

        if (data) {
          try {
            const bossHPData = JSON.parse(data.value || '{}');
            const hp = bossHPData[locationId];
            if (hp !== undefined && hp >= 0) {
              setCurrentBossHP(hp);
            } else {
              setCurrentBossHP(BOSS_DATA[locationId]?.maxHP || 500);
            }
          } catch (parseError) {
            console.error('Помилка парсингу HP боса:', parseError);
            setCurrentBossHP(BOSS_DATA[locationId]?.maxHP || 500);
          }
        } else {
          // Якщо запису немає, створюємо початковий
          const initialHP = BOSS_DATA[locationId]?.maxHP || 500;
          await supabase
            .from('world_state')
            .upsert({
              key: 'boss_hp',
              value: JSON.stringify({ [locationId]: initialHP }),
            });
          setCurrentBossHP(initialHP);
        }
      } catch (error) {
        console.error('Помилка завантаження HP боса:', error);
        setCurrentBossHP(BOSS_DATA[locationId]?.maxHP || 500);
      }
    };

    let bossHPChannel = null;
    let retryCount = 0;
    const maxRetries = 3;

    const setupRealtime = () => {
      if (!supabase) return;

      try {
        // Підписка на оновлення HP боса (Realtime)
        bossHPChannel = supabase
          .channel(`boss-hp-${locationId}-${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'world_state',
              filter: 'key=eq.boss_hp',
            },
            (payload) => {
              try {
                const bossHPData = JSON.parse(payload.new.value || '{}');
                const hp = bossHPData[locationId];
                if (hp !== undefined && hp >= 0) {
                  setCurrentBossHP(hp);
                }
              } catch (error) {
                console.error('Помилка парсингу оновлення HP боса:', error);
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Підписка на HP боса активна');
              retryCount = 0;
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Помилка підписки на HP боса');
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(setupRealtime, 2000 * retryCount);
              }
            }
          });
      } catch (error) {
        console.error('Помилка налаштування Realtime для HP боса:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(setupRealtime, 2000 * retryCount);
        }
      }
    };

    loadBossHP();
    setupRealtime();

    return () => {
      if (bossHPChannel && supabase) {
        supabase.removeChannel(bossHPChannel);
      }
    };
  }, [isOpen, locationId]);

  // Функція для оновлення HP боса в Supabase з atomic операцією та optimistic locking
  const updateBossHPInDB = useCallback(async (damage) => {
    if (!supabase) {
      console.warn('Supabase не налаштовано');
      return;
    }

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // Використовуємо atomic операцію для зменшення HP з optimistic locking
        const { data: currentData, error: fetchError } = await supabase
          .from('world_state')
          .select('value, updated_at')
          .eq('key', 'boss_hp')
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Помилка отримання HP боса:', fetchError);
          return;
        }

        let bossHPData = {};
        let originalUpdatedAt = currentData?.updated_at;
        
        if (currentData?.value) {
          try {
            bossHPData = JSON.parse(currentData.value);
          } catch (e) {
            console.error('Помилка парсингу HP боса:', e);
            bossHPData = {};
          }
        }

        const currentHP = bossHPData[locationId] || BOSS_DATA[locationId]?.maxHP || 500;
        const newHP = Math.max(0, currentHP - damage);
        bossHPData[locationId] = newHP;

        // Використовуємо optimistic locking - перевіряємо, чи не змінився updated_at
        const { error: updateError, data: updatedData } = await supabase
          .from('world_state')
          .update({
            value: JSON.stringify(bossHPData),
            updated_at: new Date().toISOString(),
          })
          .eq('key', 'boss_hp')
          .eq('updated_at', originalUpdatedAt || new Date().toISOString())
          .select()
          .single();

        if (updateError) {
          // Якщо помилка через конфлікт (updated_at змінився), повторюємо спробу
          if (updateError.code === 'PGRST116' || retryCount < maxRetries - 1) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 100 * retryCount)); // Невелика затримка
            continue;
          }
          console.error('Помилка оновлення HP боса:', updateError);
          return;
        }

        // Успішне оновлення
        if (updatedData) {
          setCurrentBossHP(newHP);
          return;
        }
      } catch (error) {
        console.error('Помилка оновлення HP боса:', error);
        if (retryCount < maxRetries - 1) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
          continue;
        }
        return;
      }
    }
  }, [locationId]);

  const boss = BOSS_DATA[locationId] || BOSS_DATA.forgottenMines;
  const bossHPPercentage = (currentBossHP / boss.maxHP) * 100;

  const triggerHaptic = useCallback((type) => {
    if (typeof window !== 'undefined') {
      import('@twa-dev/sdk')
        .then((sdk) => {
          if (type === 'success') {
            sdk.HapticFeedback.notificationOccurred('success');
          } else if (type === 'error') {
            sdk.HapticFeedback.notificationOccurred('error');
          } else {
            sdk.HapticFeedback.impactOccurred('medium');
          }
        })
        .catch(() => {
          if (window.Telegram?.WebApp?.HapticFeedback) {
            if (type === 'success') {
              window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            } else if (type === 'error') {
              window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            } else {
              window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            }
          }
        });
    }
  }, []);

  const addLog = useCallback((message) => {
    setBattleLog((prev) => [...prev, { id: Date.now(), message, time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) }]);
  }, []);

  const calculateDamage = useCallback((attack, defense) => {
    const baseDamage = attack - defense;
    const randomFactor = 0.8 + Math.random() * 0.4; // 80-120% від базової шкоди
    const isCritical = Math.random() < 0.15; // 15% шанс критичного удару
    
    // Клановий бонус Combo Damage: +5% шкоди за кожного гравця клану в бою
    const clanBonus = clan && clanComboCount > 1 ? 1 + (clanComboCount - 1) * 0.05 : 1;
    
    const damage = Math.max(1, Math.floor(baseDamage * randomFactor * (isCritical ? 2 : 1) * clanBonus));
    return { damage, isCritical, clanBonus: clanBonus > 1 };
  }, [clan, clanComboCount]);

  const handlePlayerAttack = useCallback(() => {
    if (!isPlayerTurn || player.health <= 0) return;

    setIsAttacking(true);
    setIsBossHit(true);
    triggerHaptic('medium');

    const { damage, isCritical, clanBonus } = calculateDamage(
      player.stats.strength + (player.equippedItems.weapon?.stats?.strength || 0),
      boss.defense
    );

    // Додаємо анімацію шкоди
    const damageId = Date.now();
    setDamageNumbers((prev) => [
      ...prev,
      {
        id: damageId,
        value: damage,
        isCritical,
        isBoss: true,
        x: Math.random() * 100,
        y: 30,
      },
    ]);

    // Критичний удар - ефект блимання
    if (isCritical) {
      setCriticalFlash(true);
      setTimeout(() => setCriticalFlash(false), 300);
    }

    // Оновлюємо HP через atomic операцію
    const newHP = Math.max(0, currentBossHP - damage);
    updateBossHPInDB(damage); // Оновлюємо в Supabase (atomic операція)
    onBossDamage?.(damage);

    addLog(
      `${isCritical ? '💥 КРИТИЧНИЙ УДАР! ' : ''}${clanBonus ? '⚔️ КЛАНОВИЙ КОМБО! ' : ''}Ви завдали ${damage} шкоди! ${boss.name} втратив ${damage} HP.`
    );

    // Видаляємо анімацію шкоди через 1 секунду
    setTimeout(() => {
      setDamageNumbers((prev) => prev.filter((d) => d.id !== damageId));
    }, 1000);

    setTimeout(() => {
      setIsBossHit(false);
      setIsAttacking(false);
      setIsPlayerTurn(false);
    }, 600);

    // Перевірка на перемогу
    if (newHP <= 0) {
      triggerHaptic('success');
      addLog(`🎉 ${boss.name} переможений!`);
      setTimeout(() => {
        onBossDefeat?.();
      }, 1500);
      return;
    }

    // Хід боса через 1.5 секунди
    setTimeout(() => {
      handleBossAttackRef.current?.();
    }, 1500);
  }, [isPlayerTurn, player, currentBossHP, boss, calculateDamage, addLog, triggerHaptic, onBossDamage, onBossDefeat, updateBossHPInDB, clanComboCount]);

  const handleBossAttack = useCallback(() => {
    if (player.health <= 0) return;

    // Застосування покращення клану "Міцна броня" (+5% захисту)
    const baseDefense = player.stats.defense + (player.equippedItems.armor?.stats?.defense || 0);
    const clanDefenseBonus = clan && (clan.upgrades || []).includes('strongArmor') ? baseDefense * 0.05 : 0;
    const totalDefense = baseDefense + clanDefenseBonus;

    const { damage, isCritical } = calculateDamage(boss.attack, totalDefense);
    
    setIsShaking(true);
    setIsPlayerHit(true);
    triggerHaptic(isCritical ? 'error' : 'medium');

    // Додаємо анімацію шкоди
    const damageId = Date.now();
    setDamageNumbers((prev) => [
      ...prev,
      {
        id: damageId,
        value: damage,
        isCritical,
        isBoss: false,
        x: Math.random() * 100,
        y: 70,
      },
    ]);

    // Критичний удар - ефект блимання
    if (isCritical) {
      setCriticalFlash(true);
      setTimeout(() => setCriticalFlash(false), 300);
    }

    updateHealth(-damage);
    addLog(
      `${isCritical ? '💥 КРИТИЧНИЙ УДАР! ' : ''}${boss.name} завдав вам ${damage} шкоди! ${isCritical ? 'Це критичний удар!' : ''}`
    );

    // Видаляємо анімацію шкоди через 1 секунду
    setTimeout(() => {
      setDamageNumbers((prev) => prev.filter((d) => d.id !== damageId));
    }, 1000);

    setTimeout(() => {
      setIsShaking(false);
      setIsPlayerHit(false);
      setIsPlayerTurn(true);
    }, 800);

    // Перевірка на поразку
    if (player.health - damage <= 0) {
      setTimeout(() => {
        addLog('💀 Ви зазнали поразки...');
        triggerHaptic('error');
      }, 800);
    }
  }, [player, boss, calculateDamage, updateHealth, addLog, triggerHaptic]);

  // Зберігаємо посилання на функцію
  handleBossAttackRef.current = handleBossAttack;

  const handleMagic = useCallback(() => {
    if (!isPlayerTurn || player.mana < 20 || player.health <= 0) return;

    setIsAttacking(true);
    setIsBossHit(true);
    triggerHaptic('medium');

    const magicDamage = Math.floor((player.stats.intelligence + 10) * 1.5);
    
    // Створюємо частинки магії
    const particles = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() - 0.5) * 40,
      y: 50 + (Math.random() - 0.5) * 40,
      delay: i * 50,
    }));
    setMagicParticles(particles);

    // Додаємо анімацію шкоди
    const damageId = Date.now();
    setDamageNumbers((prev) => [
      ...prev,
      {
        id: damageId,
        value: magicDamage,
        isCritical: false,
        isBoss: true,
        isMagic: true,
        x: Math.random() * 100,
        y: 30,
      },
    ]);

    // Оновлюємо HP через atomic операцію
    const newHP = Math.max(0, currentBossHP - magicDamage);
    updateBossHPInDB(magicDamage); // Оновлюємо в Supabase (atomic операція)
    onBossDamage?.(magicDamage);

    // Витрачаємо ману
    updateMana(-20);

    addLog(`✨ Ви використали магію та завдали ${magicDamage} шкоди!`);

    // Видаляємо анімацію шкоди через 1 секунду
    setTimeout(() => {
      setDamageNumbers((prev) => prev.filter((d) => d.id !== damageId));
      setMagicParticles([]);
    }, 1000);

    setTimeout(() => {
      setIsBossHit(false);
      setIsAttacking(false);
      setIsPlayerTurn(false);
    }, 800);

    // Перевірка на перемогу
    if (newHP <= 0) {
      triggerHaptic('success');
      addLog(`🎉 ${boss.name} переможений!`);
      setTimeout(() => {
        onBossDefeat?.();
      }, 1500);
      return;
    }

    setTimeout(() => {
      handleBossAttackRef.current?.();
    }, 1500);
  }, [isPlayerTurn, player, currentBossHP, boss, updateMana, addLog, triggerHaptic, onBossDamage, onBossDefeat, updateBossHPInDB]);

  const handleHeal = useCallback(() => {
    if (!isPlayerTurn || player.health <= 0) return;

    const healAmount = 30;
    updateHealth(healAmount);
    addLog(`💚 Ви відновили ${healAmount} HP!`);
    setIsPlayerTurn(false);

    setTimeout(() => {
      handleBossAttackRef.current?.();
    }, 1000);
  }, [isPlayerTurn, player, updateHealth, addLog]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-fantasy-dark modal-backdrop">
      <div className={`w-full h-full flex flex-col ${isShaking ? 'animate-shake' : ''}`}>
        {/* Бос */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-red-900/30 to-transparent relative">
          <div className={`text-8xl mb-4 transition-all duration-300 ${isBossHit ? 'scale-125 animate-pulse' : ''} ${criticalFlash ? 'brightness-150' : ''}`}>
            {boss.emoji}
          </div>
          <h2 className="text-3xl font-bold text-fantasy-red mb-2">{boss.name}</h2>
          
          {/* Анімації шкоди */}
          {damageNumbers
            .filter((d) => d.isBoss)
            .map((damage) => (
              <div
                key={damage.id}
                className={`absolute text-4xl font-bold pointer-events-none transition-all duration-1000 ${
                  damage.isCritical
                    ? 'text-yellow-400 animate-bounce'
                    : damage.isMagic
                    ? 'text-purple-400'
                    : 'text-red-400'
                }`}
                style={{
                  left: `${damage.x}%`,
                  top: `${damage.y}%`,
                  transform: 'translate(-50%, -50%)',
                  animation: 'damageFloat 1s ease-out forwards',
                }}
              >
                {damage.isCritical && '💥 '}
                {damage.isMagic && '✨ '}
                -{damage.value}
              </div>
            ))}
          
          {/* Частинки магії */}
          {magicParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute text-2xl pointer-events-none"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                transform: 'translate(-50%, -50%)',
                animation: 'magicParticle 1s ease-out forwards',
                animationDelay: `${particle.delay}ms`,
              }}
            >
              ✨
            </div>
          ))}
          
          {/* HP Bar боса */}
          <div className="w-full max-w-md mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-fantasy-red font-semibold">HP Боса</span>
              <span className="text-white">
                {currentBossHP} / {boss.maxHP}
              </span>
            </div>
            <div className="w-full bg-fantasy-dark/50 rounded-full h-4 border-2 border-fantasy-red">
              <div
                className="bg-gradient-to-r from-red-600 to-fantasy-red h-4 rounded-full transition-all duration-500"
                style={{ width: `${bossHPPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Лог битви */}
        <div className="h-32 bg-fantasy-dark/80 border-t border-fantasy-purple/30 overflow-y-auto p-4">
          <div className="space-y-1">
            {battleLog.slice(-5).map((log) => (
              <div key={log.id} className="text-sm text-gray-300">
                <span className="text-gray-500 text-xs">{log.time}</span> - {log.message}
              </div>
            ))}
          </div>
        </div>

        {/* Персонаж */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-blue-900/30 to-transparent relative">
          <div className={`text-6xl mb-4 transition-all duration-300 ${isPlayerHit ? 'scale-110 animate-pulse' : ''} ${criticalFlash ? 'brightness-150' : ''}`}>
            ⚔️
          </div>
          <h3 className="text-2xl font-bold text-fantasy-gold mb-2">{player.name}</h3>
          
          {/* Анімації шкоди */}
          {damageNumbers
            .filter((d) => !d.isBoss)
            .map((damage) => (
              <div
                key={damage.id}
                className={`absolute text-4xl font-bold pointer-events-none transition-all duration-1000 ${
                  damage.isCritical
                    ? 'text-yellow-400 animate-bounce'
                    : 'text-red-400'
                }`}
                style={{
                  left: `${damage.x}%`,
                  top: `${damage.y}%`,
                  transform: 'translate(-50%, -50%)',
                  animation: 'damageFloat 1s ease-out forwards',
                }}
              >
                {damage.isCritical && '💥 '}
                -{damage.value}
              </div>
            ))}
          
          {/* HP Bar гравця */}
          <div className="w-full max-w-md mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-fantasy-red font-semibold">Ваше HP</span>
              <span className="text-white">
                {player.health} / {player.maxHealth}
              </span>
            </div>
            <div className="w-full bg-fantasy-dark/50 rounded-full h-4 border-2 border-fantasy-red">
              <div
                className="bg-gradient-to-r from-fantasy-red to-red-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
              />
            </div>
          </div>

          {/* MP Bar */}
          <div className="w-full max-w-md mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-fantasy-purple font-semibold">MP</span>
              <span className="text-white">
                {player.mana} / {player.maxMana}
              </span>
            </div>
            <div className="w-full bg-fantasy-dark/50 rounded-full h-3 border border-fantasy-purple">
              <div
                className="bg-fantasy-purple h-3 rounded-full transition-all duration-500"
                style={{ width: `${(player.mana / player.maxMana) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Кнопки дій */}
        <div className="bg-fantasy-dark/95 border-t-2 border-fantasy-purple p-4">
          <div className="flex gap-3 justify-center">
            <button
              onClick={handlePlayerAttack}
              disabled={!isPlayerTurn || player.health <= 0}
              className={`btn-fantasy px-6 py-3 bg-fantasy-red hover:bg-red-600 text-white font-semibold rounded-lg transition-all ${
                !isPlayerTurn || player.health <= 0 ? 'opacity-50 cursor-not-allowed' : ''
              } ${isAttacking ? 'animate-pulse' : ''}`}
            >
              ⚔️ Атака
            </button>
            <button
              onClick={handleMagic}
              disabled={!isPlayerTurn || player.mana < 20 || player.health <= 0}
              className={`btn-fantasy px-6 py-3 bg-fantasy-purple hover:bg-purple-600 text-white font-semibold rounded-lg transition-all ${
                !isPlayerTurn || player.mana < 20 || player.health <= 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              ✨ Магія (20 MP)
            </button>
            <button
              onClick={handleHeal}
              disabled={!isPlayerTurn || player.health <= 0}
              className={`btn-fantasy px-6 py-3 bg-fantasy-green hover:bg-green-600 text-white font-semibold rounded-lg transition-all ${
                !isPlayerTurn || player.health <= 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              💚 Лікуватися
            </button>
          </div>
          {!isPlayerTurn && (
            <div className="text-center mt-2 text-sm text-gray-400">
              Хід {boss.name}...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

