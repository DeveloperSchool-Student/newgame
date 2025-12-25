import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export const GlobalAnnouncement = () => {
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    if (!supabase) return;

    const loadAnnouncement = async () => {
      try {
        const { data } = await supabase
          .from('global_announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          setAnnouncement(data);
        }
      } catch (error) {
        // Немає активних анонсів
      }
    };

    loadAnnouncement();

    // Підписка на нові анонси з обробкою помилок
    let channel = null;
    let retryCount = 0;
    const maxRetries = 3;

    const setupRealtime = () => {
      if (!supabase) return;

      try {
        channel = supabase
          .channel(`global_announcements_${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'global_announcements',
            },
            () => {
              loadAnnouncement();
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Підписка на анонси активна');
              retryCount = 0;
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Помилка підписки на анонси');
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(setupRealtime, 2000 * retryCount);
              }
            }
          });
      } catch (error) {
        console.error('Помилка налаштування Realtime для анонсів:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(setupRealtime, 2000 * retryCount);
        }
      }
    };

    setupRealtime();

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  if (!announcement) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-fantasy-purple/90 backdrop-blur-sm border-2 border-fantasy-gold rounded-lg px-6 py-3 z-50 max-w-md animate-pulse">
      <div className="flex items-center gap-2">
        <span className="text-2xl">📢</span>
        <div>
          <div className="text-xs text-gray-300 mb-1">Системне повідомлення</div>
          <div className="text-white font-semibold">{announcement.message}</div>
        </div>
      </div>
    </div>
  );
};

