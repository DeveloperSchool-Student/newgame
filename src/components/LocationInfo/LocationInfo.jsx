import { useState, useEffect } from 'react';
import { useKingdomContext } from '../../contexts/KingdomContext';
import { KINGDOMS } from '../../data/kingdoms';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { getPlayersInLocation, updatePlayerLocation } from '../../lib/supabaseClient';

export const LocationInfo = ({ location, onEnterChat, onHuntMonsters, onExplore, onOpenShop, onCaptureProvince, onOpenTransport, onOpenResourceGathering }) => {
  const { getProvinceOwner, provinces } = useKingdomContext();
  const { player } = usePlayerContext();
  const [nearbyPlayers, setNearbyPlayers] = useState([]);

  // Завантаження списку гравців поруч з Supabase
  useEffect(() => {
    if (!location?.id) return;

    const loadPlayers = async () => {
      try {
        const { supabase } = await import('../../lib/supabaseClient');
        if (!supabase) {
          console.warn('Supabase не налаштовано');
          return;
        }

        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!tgUser) return;

        // Оновлюємо локацію поточного гравця
        await updatePlayerLocation(tgUser.id, location.id);

        // Завантажуємо список гравців у локації
        const players = await getPlayersInLocation(location.id);
        setNearbyPlayers(players.map((p) => ({
          id: p.telegram_id,
          firstName: p.name?.split(' ')[0] || 'Гравець',
          lastName: p.name?.split(' ').slice(1).join(' ') || '',
          avatar: p.avatar_url || null,
          level: p.level || 1,
          kingdom: p.kingdom || 'northernAlliance',
          rank: p.rank || 'recruit',
          clanTag: p.clanTag || null,
        })));
      } catch (error) {
        console.error('Помилка завантаження гравців:', error);
      }
    };

    loadPlayers();

    // Підписка на зміни гравців у локації (Realtime) з обробкою помилок
    let playersChannel = null;
    let retryCount = 0;
    const maxRetries = 3;

    const setupRealtime = async () => {
      const { supabase } = await import('../../lib/supabaseClient');
      if (!supabase) return;

      try {
        playersChannel = supabase
          .channel(`players-${location.id}-${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'player_locations',
              filter: `location_id=eq.${location.id}`,
            },
            () => {
              loadPlayers(); // Перезавантажуємо список
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Підписка на гравців активна');
              retryCount = 0;
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Помилка підписки на гравців');
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(setupRealtime, 2000 * retryCount);
              }
            }
          });
      } catch (error) {
        console.error('Помилка налаштування Realtime для гравців:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(setupRealtime, 2000 * retryCount);
        }
      }
    };

    setupRealtime();

    return () => {
      if (playersChannel) {
        import('../../lib/supabaseClient').then(({ supabase }) => {
          if (supabase && playersChannel) {
            supabase.removeChannel(playersChannel);
          }
        });
      }
    };
  }, [location]);

  if (!location) return null;

  const canHunt = location.type === 'ліс' || location.type === 'підземелля';
  const province = provinces[location.id];
  const ownerKingdom = getProvinceOwner(location.id);
  const kingdom = ownerKingdom ? KINGDOMS[ownerKingdom] : null;
  const isPlayerKingdom = ownerKingdom === player.kingdom;
  const canCapture = province?.canCapture && player.level >= (province?.minLevelToCapture || 10);

  return (
    <div className="absolute top-4 left-4 right-4 bg-gradient-to-br from-fantasy-dark/95 via-purple-900/95 to-fantasy-dark/95 backdrop-blur-md border-2 border-fantasy-purple rounded-xl p-5 shadow-2xl glow-purple z-10 max-h-[80vh] overflow-y-auto">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-2xl font-bold text-fantasy-gold mb-1">
            {location.name}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-1 bg-fantasy-purple/30 border border-fantasy-purple rounded text-fantasy-gold capitalize">
              {location.type}
            </span>
            {kingdom && (
              <span 
                className="text-xs px-2 py-1 border rounded text-white"
                style={{ 
                  backgroundColor: `${kingdom.color}40`,
                  borderColor: kingdom.color,
                }}
              >
                {kingdom.flagEmoji} {kingdom.name}
              </span>
            )}
            {isPlayerKingdom && (
              <span className="text-xs px-2 py-1 bg-green-500/30 border border-green-500 rounded text-green-300">
                Ваше королівство
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Опис */}
      <p className="text-sm text-gray-300 mb-4 leading-relaxed">
        {location.description}
      </p>

      {/* Гравці поруч */}
      <div className="mb-4 bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-fantasy-gold mb-2">Гравці поруч ({nearbyPlayers.length})</h3>
        <div className="space-y-2">
          {nearbyPlayers.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-sm">
              {p.avatar ? (
                <img src={p.avatar} alt={p.firstName} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-fantasy-purple/30 flex items-center justify-center">
                  <span className="text-xs">{p.firstName[0]}</span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {p.clanTag && (
                    <span className="text-xs px-1.5 py-0.5 bg-amber-600/30 border border-amber-500 rounded text-amber-200 font-semibold">
                      [{p.clanTag}]
                    </span>
                  )}
                  <span className="font-semibold" style={{ color: p.id === player.id ? '#fdcb6e' : '#ffffff' }}>
                    {p.firstName} {p.lastName}
                  </span>
                  <span className="text-gray-400">Lv.{p.level}</span>
                </div>
              </div>
              {KINGDOMS[p.kingdom] && (
                <span className="text-xs">{KINGDOMS[p.kingdom].flagEmoji}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Кнопки дій */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onExplore}
          className="btn-fantasy w-full bg-gradient-to-r from-fantasy-green/60 to-green-600/60 hover:from-fantasy-green/80 hover:to-green-600/80 border border-fantasy-green text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          style={{ boxShadow: '0 0 10px rgba(0, 184, 148, 0.5)' }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Досліджувати
        </button>

        <button
          onClick={onOpenShop}
          className="btn-fantasy w-full bg-gradient-to-r from-yellow-600/60 to-yellow-500/60 hover:from-yellow-500/80 hover:to-yellow-400/80 border border-yellow-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          Маркетплейс
        </button>

        <button
          onClick={onOpenTransport}
          className="btn-fantasy w-full bg-gradient-to-r from-blue-600/60 to-blue-500/60 hover:from-blue-500/80 hover:to-blue-400/80 border border-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span className="text-xl">🚗</span>
          Транспорт
        </button>

        <button
          onClick={onOpenResourceGathering}
          className="btn-fantasy w-full bg-gradient-to-r from-green-600/60 to-green-500/60 hover:from-green-500/80 hover:to-green-400/80 border border-green-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span className="text-xl">🌿</span>
          Збір ресурсів
        </button>

        <button
          onClick={onEnterChat}
          className="btn-fantasy w-full bg-gradient-to-r from-fantasy-purple/60 to-purple-600/60 hover:from-fantasy-purple/80 hover:to-purple-600/80 border border-fantasy-purple text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 glow-purple"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Увійти в чат
        </button>

        {canHunt && (
          <button
            onClick={onHuntMonsters}
            className="btn-fantasy w-full bg-gradient-to-r from-fantasy-red/60 to-red-600/60 hover:from-fantasy-red/80 hover:to-red-600/80 border border-fantasy-red text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            style={{ boxShadow: '0 0 10px rgba(225, 112, 85, 0.5)' }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            Полювати на монстрів
          </button>
        )}

        {canCapture && !isPlayerKingdom && (
          <button
            onClick={() => onCaptureProvince(location.id)}
            className="btn-fantasy w-full bg-gradient-to-r from-red-600/60 to-red-500/60 hover:from-red-500/80 hover:to-red-400/80 border border-red-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Захопити провінцію
          </button>
        )}
      </div>
    </div>
  );
};
