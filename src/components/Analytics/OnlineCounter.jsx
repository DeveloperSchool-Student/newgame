import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export const OnlineCounter = () => {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const loadOnlineCount = async () => {
      if (!supabase) return;

      try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('last_seen', fiveMinutesAgo);

        setOnlineCount(count || 0);
      } catch (error) {
        console.error('Помилка завантаження онлайн:', error);
      }
    };

    loadOnlineCount();
    const interval = setInterval(loadOnlineCount, 30000); // Оновлюємо кожні 30 секунд

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-4 left-4 bg-fantasy-dark/90 backdrop-blur-sm border-2 border-fantasy-green rounded-lg px-3 py-2 z-10">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-white">
          <span className="text-fantasy-green font-bold">{onlineCount}</span> онлайн
        </span>
      </div>
    </div>
  );
};

