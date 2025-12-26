import { useState, useEffect, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../UI/Toast';
import { LoadingSpinner } from '../UI/LoadingSpinner';

export const MentorSystem = ({ isOpen, onClose, telegramId }) => {
  const { player, addGold } = usePlayerContext();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview'); // overview, mentors, students, rewards
  const [myMentorship, setMyMentorship] = useState(null);
  const [availableMentors, setAvailableMentors] = useState([]);
  const [myStudents, setMyStudents] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [myRewardClaims, setMyRewardClaims] = useState([]);
  const [mentorPoints, setMentorPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const canBeMentor = player.level >= 50;
  const canHaveMentor = player.level < 20;

  // Завантаження даних
  const loadData = useCallback(async () => {
    if (!telegramId || !supabase) return;

    try {
      // Перевіряємо чи є у гравця ментор
      const { data: studentData, error: studentError } = await supabase
        .from('mentorships')
        .select(`
          *,
          mentor:profiles!mentorships_mentor_id_fkey(telegram_id, name, level, avatar_url)
        `)
        .eq('student_id', telegramId)
        .eq('status', 'active')
        .single();

      if (studentError && studentError.code !== 'PGRST116') throw studentError;
      setMyMentorship(studentData);

      // Завантажуємо доступних менторів (якщо гравець може мати ментора)
      if (canHaveMentor && !studentData) {
        const { data: mentorsData, error: mentorsError } = await supabase
          .from('profiles')
          .select('telegram_id, name, level, avatar_url')
          .gte('level', 50)
          .neq('telegram_id', telegramId)
          .order('level', { ascending: false })
          .limit(20);

        if (mentorsError) throw mentorsError;
        setAvailableMentors(mentorsData || []);
      }

      // Завантажуємо учнів (якщо гравець може бути ментором)
      if (canBeMentor) {
        const { data: studentsData, error: studentsError } = await supabase
          .from('mentorships')
          .select(`
            *,
            student:profiles!mentorships_student_id_fkey(telegram_id, name, level, avatar_url)
          `)
          .eq('mentor_id', telegramId)
          .in('status', ['active', 'completed'])
          .order('started_at', { ascending: false });

        if (studentsError) throw studentsError;
        setMyStudents(studentsData || []);

        // Підраховуємо очки ментора
        const totalPoints = studentsData?.reduce((sum, s) => sum + (s.mentor_points || 0), 0) || 0;
        setMentorPoints(totalPoints);
      }

      // Завантажуємо винагороди
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('mentor_rewards')
        .select('*')
        .order('cost_points', { ascending: true });

      if (rewardsError) throw rewardsError;
      setRewards(rewardsData || []);

      // Завантажуємо отримані винагороди
      const { data: claimsData, error: claimsError } = await supabase
        .from('mentor_reward_claims')
        .select('*')
        .eq('mentor_id', telegramId);

      if (claimsError) throw claimsError;
      setMyRewardClaims(claimsData || []);
    } catch (error) {
      console.error('Помилка завантаження даних:', error);
    }
  }, [telegramId, canBeMentor, canHaveMentor]);

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      setIsLoading(true);
      await loadData();
      setIsLoading(false);
    };

    load();
  }, [isOpen, loadData]);

  // Запросити ментора
  const requestMentor = async (mentorId) => {
    if (!supabase) return;

    try {
      const { error } = await supabase.from('mentorships').insert({
        mentor_id: mentorId,
        student_id: telegramId,
      });

      if (error) throw error;
      showToast('Запит на наставництво відправлено', 'success');
      await loadData();
    } catch (error) {
      console.error('Помилка запиту:', error);
      showToast('Не вдалося відправити запит', 'error');
    }
  };

  // Завершити наставництво
  const completeMentorship = async () => {
    if (!myMentorship || !supabase) return;

    if (!window.confirm('Завершити наставництво?')) return;

    try {
      const { error } = await supabase
        .from('mentorships')
        .update({ status: 'cancelled' })
        .eq('id', myMentorship.id);

      if (error) throw error;
      showToast('Наставництво завершено', 'info');
      await loadData();
    } catch (error) {
      console.error('Помилка завершення:', error);
      showToast('Не вдалося завершити наставництво', 'error');
    }
  };

  // Отримати винагороду
  const claimReward = async (reward) => {
    if (!supabase || mentorPoints < reward.cost_points) {
      showToast('Недостатньо очок наставництва', 'error');
      return;
    }

    // Перевіряємо чи вже отримана винагорода
    const alreadyClaimed = myRewardClaims.some(c => c.reward_id === reward.id);
    if (alreadyClaimed) {
      showToast('Ви вже отримали цю винагороду', 'error');
      return;
    }

    try {
      // Записуємо отримання винагороди
      const { error: claimError } = await supabase.from('mentor_reward_claims').insert({
        mentor_id: telegramId,
        reward_id: reward.id,
      });

      if (claimError) throw claimError;

      // Видаємо винагороду
      if (reward.reward_type === 'gold') {
        const amount = reward.reward_data.amount;
        addGold(amount);
        showToast(`Отримано ${amount} золота!`, 'success');
      } else if (reward.reward_type === 'title') {
        showToast(`Отримано титул: ${reward.reward_data.title}!`, 'success');
      } else {
        showToast('Винагороду отримано!', 'success');
      }

      await loadData();
    } catch (error) {
      console.error('Помилка отримання винагороди:', error);
      showToast('Не вдалося отримати винагороду', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-xl border-2 border-indigo-500 shadow-2xl overflow-hidden">
        {/* Заголовок */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-6 border-b-2 border-indigo-400">
          <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
            <span>🎓</span>
            Система наставництва
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-red-400 text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Вкладки */}
        <div className="flex bg-slate-800 border-b border-indigo-500">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            📊 Огляд
          </button>
          {canHaveMentor && (
            <button
              onClick={() => setActiveTab('mentors')}
              className={`flex-1 py-3 px-4 font-semibold transition-colors ${
                activeTab === 'mentors'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-slate-700'
              }`}
            >
              👨‍🏫 Ментори
            </button>
          )}
          {canBeMentor && (
            <button
              onClick={() => setActiveTab('students')}
              className={`flex-1 py-3 px-4 font-semibold transition-colors ${
                activeTab === 'students'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-slate-700'
              }`}
            >
              🎓 Мої учні ({myStudents.length})
            </button>
          )}
          {canBeMentor && (
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 py-3 px-4 font-semibold transition-colors ${
                activeTab === 'rewards'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-slate-700'
              }`}
            >
              🎁 Винагороди
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Огляд */}
            {activeTab === 'overview' && (
              <div>
                <div className="bg-slate-800 rounded-lg p-6 border-2 border-indigo-500 mb-6">
                  <h3 className="text-2xl font-bold text-white mb-4">Про систему наставництва</h3>
                  <div className="space-y-3 text-gray-300">
                    <p>🎓 <strong>Для новачків (рівень &lt; 20):</strong></p>
                    <ul className="ml-6 space-y-1">
                      <li>• Виберіть ментора (гравець рівня 50+)</li>
                      <li>• Отримуйте +20% досвіду у групі з ментором</li>
                      <li>• Доступ до спеціальних квестів</li>
                    </ul>
                    <p>👨‍🏫 <strong>Для менторів (рівень 50+):</strong></p>
                    <ul className="ml-6 space-y-1">
                      <li>• Допомагайте новачкам досягти рівня 20</li>
                      <li>• Отримуйте очки наставництва</li>
                      <li>• Обмінюйте очки на винагороди</li>
                    </ul>
                  </div>
                </div>

                {/* Статус гравця */}
                <div className="bg-slate-800 rounded-lg p-6 border border-indigo-500/30">
                  <h3 className="text-xl font-bold text-white mb-4">Ваш статус</h3>
                  {canBeMentor && (
                    <div className="mb-4">
                      <p className="text-white font-semibold">👨‍🏫 Ви можете бути ментором</p>
                      <p className="text-sm text-gray-400">Очків наставництва: <span className="text-indigo-400 font-bold">{mentorPoints}</span></p>
                      <p className="text-sm text-gray-400">Учнів навчено: {myStudents.filter(s => s.status === 'completed').length}</p>
                    </div>
                  )}
                  {canHaveMentor && !myMentorship && (
                    <div>
                      <p className="text-white font-semibold">🎓 Ви можете вибрати ментора</p>
                      <p className="text-sm text-gray-400">Перейдіть на вкладку "Ментори" щоб вибрати</p>
                    </div>
                  )}
                  {myMentorship && (
                    <div>
                      <p className="text-white font-semibold">✅ У вас є ментор</p>
                      <p className="text-sm text-gray-400">Ментор: {myMentorship.mentor.name} (рівень {myMentorship.mentor.level})</p>
                      <button
                        onClick={completeMentorship}
                        className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                      >
                        Завершити наставництво
                      </button>
                    </div>
                  )}
                  {!canBeMentor && !canHaveMentor && (
                    <p className="text-gray-400">Ви не можете брати участь у системі наставництва (рівень 20-49)</p>
                  )}
                </div>
              </div>
            )}

            {/* Список менторів */}
            {activeTab === 'mentors' && canHaveMentor && (
              <div className="space-y-3">
                {myMentorship ? (
                  <div className="bg-slate-800 rounded-lg p-6 border-2 border-indigo-500">
                    <p className="text-white font-bold mb-2">Ваш ментор:</p>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl">
                        {myMentorship.mentor.avatar_url || '👨‍🏫'}
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{myMentorship.mentor.name}</p>
                        <p className="text-sm text-gray-400">Рівень {myMentorship.mentor.level}</p>
                      </div>
                    </div>
                  </div>
                ) : availableMentors.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-xl mb-2">👨‍🏫</p>
                    <p>Немає доступних менторів</p>
                  </div>
                ) : (
                  availableMentors.map((mentor) => (
                    <div
                      key={mentor.telegram_id}
                      className="bg-slate-800 rounded-lg p-4 border border-indigo-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl">
                            {mentor.avatar_url || '👨‍🏫'}
                          </div>
                          <div>
                            <p className="font-bold text-white">{mentor.name}</p>
                            <p className="text-sm text-gray-400">Рівень {mentor.level}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => requestMentor(mentor.telegram_id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                          Вибрати ментора
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Мої учні */}
            {activeTab === 'students' && canBeMentor && (
              <div className="space-y-3">
                {myStudents.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-xl mb-2">🎓</p>
                    <p>У вас ще немає учнів</p>
                  </div>
                ) : (
                  myStudents.map((mentorship) => (
                    <div
                      key={mentorship.id}
                      className="bg-slate-800 rounded-lg p-4 border border-indigo-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl">
                            {mentorship.student.avatar_url || '🎓'}
                          </div>
                          <div>
                            <p className="font-bold text-white">{mentorship.student.name}</p>
                            <p className="text-sm text-gray-400">
                              Рівень {mentorship.student.level} • 
                              {mentorship.status === 'active' ? ' 🟢 Активний' : ' ✅ Завершено'}
                            </p>
                            <p className="text-xs text-indigo-400">
                              Очків отримано: {mentorship.mentor_points || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Винагороди */}
            {activeTab === 'rewards' && canBeMentor && (
              <div>
                <div className="mb-4 p-4 bg-slate-800 rounded-lg border border-indigo-500">
                  <p className="text-white font-bold">
                    Ваші очки наставництва: <span className="text-indigo-400 text-2xl">{mentorPoints}</span>
                  </p>
                </div>
                <div className="space-y-3">
                  {rewards.map((reward) => {
                    const claimed = myRewardClaims.some(c => c.reward_id === reward.id);
                    const canClaim = mentorPoints >= reward.cost_points && !claimed;

                    return (
                      <div
                        key={reward.id}
                        className={`bg-slate-800 rounded-lg p-4 border-2 ${
                          claimed ? 'border-green-500/50' : canClaim ? 'border-indigo-500' : 'border-gray-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white">{reward.name}</p>
                            <p className="text-sm text-gray-400">{reward.description}</p>
                            <p className="text-sm text-indigo-400 mt-1">
                              Вартість: {reward.cost_points} очків
                            </p>
                          </div>
                          {claimed ? (
                            <span className="text-green-400 font-semibold">✅ Отримано</span>
                          ) : (
                            <button
                              onClick={() => claimReward(reward)}
                              disabled={!canClaim}
                              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                canClaim
                                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              Отримати
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

