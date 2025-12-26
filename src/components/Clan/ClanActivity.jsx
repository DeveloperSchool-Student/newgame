import { useState, useEffect, useCallback } from 'react';
import { useClanContext } from '../../contexts/ClanContext';
import { supabase } from '../../lib/supabaseClient';
import { LoadingSpinner } from '../UI/LoadingSpinner';

export const ClanActivity = ({ isOpen, onClose }) => {
  const { clan } = useClanContext();
  const [activities, setActivities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activity'); // activity, announcements
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [userRole, setUserRole] = useState('member');

  // Завантаження активностей
  const loadActivities = useCallback(async () => {
    if (!clan?.id || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('clan_activity_log')
        .select('*')
        .eq('clan_id', clan.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Помилка завантаження активностей:', error);
    }
  }, [clan?.id]);

  // Завантаження оголошень
  const loadAnnouncements = useCallback(async () => {
    if (!clan?.id || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('clan_announcements')
        .select('*')
        .eq('clan_id', clan.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Помилка завантаження оголошень:', error);
    }
  }, [clan?.id]);

  // Завантаження ролі користувача
  const loadUserRole = useCallback(async () => {
    if (!clan?.id || !supabase) return;

    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const telegramId = tgUser?.id;
    if (!telegramId) return;

    try {
      const { data, error } = await supabase
        .from('clan_roles')
        .select('role')
        .eq('clan_id', clan.id)
        .eq('telegram_id', telegramId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserRole(data?.role || 'member');
    } catch (error) {
      console.error('Помилка завантаження ролі:', error);
    }
  }, [clan?.id]);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadActivities(), loadAnnouncements(), loadUserRole()]);
      setIsLoading(false);
    };

    loadData();
  }, [isOpen, loadActivities, loadAnnouncements, loadUserRole]);

  // Realtime підписка
  useEffect(() => {
    if (!isOpen || !clan?.id || !supabase) return;

    const channel = supabase
      .channel(`clan-activity-${clan.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clan_activity_log',
          filter: `clan_id=eq.${clan.id}`,
        },
        () => {
          loadActivities();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clan_announcements',
          filter: `clan_id=eq.${clan.id}`,
        },
        () => {
          loadAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, clan?.id, loadActivities, loadAnnouncements]);

  // Створити оголошення
  const createAnnouncement = async () => {
    if (!['leader', 'officer'].includes(userRole)) return;
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) return;

    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const telegramId = tgUser?.id;

    try {
      const { error } = await supabase.from('clan_announcements').insert({
        clan_id: clan.id,
        author_id: telegramId,
        title: newAnnouncement.title,
        content: newAnnouncement.content,
      });

      if (error) throw error;
      setNewAnnouncement({ title: '', content: '' });
      await loadAnnouncements();
    } catch (error) {
      console.error('Помилка створення оголошення:', error);
    }
  };

  // Форматування активності
  const formatActivity = (activity) => {
    const icons = {
      join: '➕',
      leave: '➖',
      donate: '📥',
      withdraw: '📤',
      promote: '⬆️',
      demote: '⬇️',
      war_start: '⚔️',
      war_end: '🏆',
      upgrade: '⭐',
    };

    const messages = {
      join: 'приєднався до клану',
      leave: 'покинув клан',
      donate: 'додав предмет до складу',
      withdraw: 'взяв предмет зі складу',
      promote: 'отримав підвищення',
      demote: 'отримав пониження',
      war_start: 'розпочав війну',
      war_end: 'завершив війну',
      upgrade: 'покращив клан',
    };

    return {
      icon: icons[activity.action_type] || '📋',
      message: messages[activity.action_type] || activity.action_type,
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 rounded-xl border-2 border-amber-500 shadow-2xl overflow-hidden">
        {/* Заголовок */}
        <div className="relative bg-gradient-to-r from-amber-600 to-orange-600 p-6 border-b-2 border-amber-400">
          <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
            <span>📋</span>
            Активність клану - {clan?.name}
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-red-400 text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Вкладки */}
        <div className="flex bg-slate-800 border-b border-amber-500">
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'activity'
                ? 'bg-amber-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            📋 Лог активностей
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'announcements'
                ? 'bg-amber-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            📢 Оголошення
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Лог активностей */}
            {activeTab === 'activity' && (
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-xl mb-2">📋</p>
                    <p>Поки що немає активностей</p>
                  </div>
                ) : (
                  activities.map((activity) => {
                    const formatted = formatActivity(activity);
                    return (
                      <div
                        key={activity.id}
                        className="bg-slate-800 rounded-lg p-4 border border-amber-500/30"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{formatted.icon}</span>
                          <div className="flex-1">
                            <p className="text-white">
                              <span className="font-bold">{activity.actor_id}</span>{' '}
                              {formatted.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(activity.created_at).toLocaleString('uk-UA')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Оголошення */}
            {activeTab === 'announcements' && (
              <div>
                {/* Форма створення (тільки для лідерів та офіцерів) */}
                {['leader', 'officer'].includes(userRole) && (
                  <div className="mb-6 p-4 bg-slate-800 rounded-lg border-2 border-amber-500">
                    <h3 className="text-lg font-bold text-white mb-3">
                      ✍️ Створити оголошення
                    </h3>
                    <input
                      type="text"
                      value={newAnnouncement.title}
                      onChange={(e) =>
                        setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                      }
                      placeholder="Заголовок..."
                      className="w-full px-4 py-2 mb-3 bg-slate-700 border border-amber-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                    />
                    <textarea
                      value={newAnnouncement.content}
                      onChange={(e) =>
                        setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
                      }
                      placeholder="Текст оголошення..."
                      rows="4"
                      className="w-full px-4 py-2 mb-3 bg-slate-700 border border-amber-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={createAnnouncement}
                      className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      📢 Опублікувати
                    </button>
                  </div>
                )}

                {/* Список оголошень */}
                <div className="space-y-4">
                  {announcements.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-xl mb-2">📢</p>
                      <p>Поки що немає оголошень</p>
                    </div>
                  ) : (
                    announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="bg-slate-800 rounded-lg p-6 border-2 border-amber-500/50"
                      >
                        <h3 className="text-xl font-bold text-white mb-2">
                          {announcement.title}
                        </h3>
                        <p className="text-gray-300 mb-3 whitespace-pre-wrap">
                          {announcement.content}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>Автор: {announcement.author_id}</span>
                          <span>{new Date(announcement.created_at).toLocaleString('uk-UA')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

