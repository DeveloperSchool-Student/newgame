import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export const RealtimeConnectionIndicator = () => {
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connected', 'disconnected', 'connecting'

  useEffect(() => {
    if (!supabase) {
      setConnectionStatus('disconnected');
      return;
    }

    // Перевірка статусу підключення
    const checkConnection = () => {
      const channel = supabase.channel('connection-check');
      
      channel
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected');
            supabase.removeChannel(channel);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setConnectionStatus('disconnected');
          } else if (status === 'CLOSED') {
            setConnectionStatus('disconnected');
          }
        });

      // Таймаут для перевірки
      setTimeout(() => {
        if (connectionStatus === 'connecting') {
          setConnectionStatus('disconnected');
        }
        supabase.removeChannel(channel);
      }, 3000);
    };

    checkConnection();

    // Перевіряємо кожні 30 секунд
    const interval = setInterval(checkConnection, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (connectionStatus === 'connected') return null; // Не показуємо, якщо підключено

  return (
    <div className="fixed top-16 right-4 z-30 bg-fantasy-dark/90 border-2 border-fantasy-purple rounded-lg p-2 flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${
        connectionStatus === 'connected' ? 'bg-green-500' :
        connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
        'bg-red-500 animate-pulse'
      }`} />
      <span className="text-xs text-white">
        {connectionStatus === 'connecting' ? 'Підключення...' : 'Відключено'}
      </span>
    </div>
  );
};

