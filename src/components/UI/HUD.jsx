import React from 'react';

/**
 * HUD — адаптивна нижня панель.
 * - на мобільних дозволяє горизонтальний скрол (overflow-x-auto)
 * - приховує текст підписів на дуже вузьких екранах (показує лише іконки)
 * - додає aria-label та фокусні стани для a11y
 * - має помірний z-index (z-30)
 */
export const HUD = ({
  onOpenInventory,
  onOpenCharacter,
  onOpenChat,
  onOpenClan,
  onOpenReferral,
  onOpenLeaderboard,
  onOpenPremium,
  onOpenAdmin,
  onOpenQuest,
  onOpenAchievements,
  onOpenPvP,
  onOpenStatistics,
  onOpenEvents,
  onOpenSkills,
  onOpenCrafting,
  onOpenClanWars,
  onOpenBattlePass,
  onOpenSubscription,
  onOpenMessaging,
  onOpenDungeon,
  onOpenPolitics,
  onOpenFriends,
}) => {
  const btnBase = 'hud-btn min-w-[52px] flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all hover:scale-105 active:scale-95 focus-visible:shadow-outline';
  const labelClass = 'text-[10px] font-bold text-white hidden sm:block uppercase tracking-tighter';

  return (
    <div
      role="toolbar"
      aria-label="Головна панель"
      className="fixed bottom-0 left-0 right-0 z-30 bg-fantasy-dark/95 backdrop-blur-md border-t-2 border-fantasy-purple/50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center gap-2 p-2 sm:p-3 overflow-x-auto no-scrollbar max-w-full">
        {/* Персонаж */}
        <button
          aria-label="Персонаж"
          onClick={onOpenCharacter}
          className={`${btnBase} bg-fantasy-purple/20 hover:bg-fantasy-purple/40 border-fantasy-purple`}
        >
          <svg className="w-5 h-5 text-fantasy-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className={labelClass}>Герой</span>
        </button>

        {/* Інвентар */}
        <button
          aria-label="Відкрити інвентар"
          onClick={onOpenInventory}
          className={`${btnBase} bg-fantasy-purple/20 hover:bg-fantasy-purple/40 border-fantasy-purple`}
        >
          <svg className="w-5 h-5 text-fantasy-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className={labelClass}>Сумка</span>
        </button>

        {/* Чат */}
        <button
          aria-label="Чат"
          onClick={onOpenChat}
          className={`${btnBase} bg-fantasy-purple/20 hover:bg-fantasy-purple/40 border-fantasy-purple`}
        >
          <svg className="w-5 h-5 text-fantasy-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className={labelClass}>Чат</span>
        </button>

        {/* Друзі */}
        <button
          aria-label="Друзі"
          onClick={onOpenFriends}
          className={`${btnBase} bg-lime-600/20 hover:bg-lime-600/40 border-lime-500`}
        >
          <span className="text-xl">🤝</span>
          <span className={labelClass}>Друзі</span>
        </button>

        {/* Повідомлення */}
        <button
          aria-label="Повідомлення"
          onClick={onOpenMessaging}
          className={`${btnBase} bg-gray-600/20 hover:bg-gray-600/40 border-gray-500`}
        >
          <span className="text-xl">✉️</span>
          <span className={labelClass}>Пошта</span>
        </button>

        {/* Клан */}
        <button
          aria-label="Клан"
          onClick={onOpenClan}
          className={`${btnBase} bg-green-600/20 hover:bg-green-600/40 border-green-500`}
        >
          <span className="text-xl">🛡️</span>
          <span className={labelClass}>Клан</span>
        </button>

        {/* Війни кланів */}
        <button
          aria-label="Війни кланів"
          onClick={onOpenClanWars}
          className={`${btnBase} bg-purple-800/20 hover:bg-purple-800/40 border-purple-700`}
        >
          <span className="text-xl">🚩</span>
          <span className={labelClass}>Війна</span>
        </button>

        {/* ПвП */}
        <button
          aria-label="ПвП"
          onClick={onOpenPvP}
          className={`${btnBase} bg-red-700/20 hover:bg-red-700/40 border-red-600`}
        >
          <span className="text-xl">⚔️</span>
          <span className={labelClass}>ПвП</span>
        </button>

        {/* Підземелля */}
        <button
          aria-label="Підземелля"
          onClick={onOpenDungeon}
          className={`${btnBase} bg-emerald-800/20 hover:bg-emerald-800/40 border-emerald-700`}
        >
          <span className="text-xl">🏰</span>
          <span className={labelClass}>Данж</span>
        </button>

        {/* Квести */}
        <button
          aria-label="Квести"
          onClick={onOpenQuest}
          className={`${btnBase} bg-blue-600/20 hover:bg-blue-600/40 border-blue-500`}
        >
          <span className="text-xl">📜</span>
          <span className={labelClass}>Завдання</span>
        </button>

        {/* Навички */}
        <button
          aria-label="Навички"
          onClick={onOpenSkills}
          className={`${btnBase} bg-cyan-600/20 hover:bg-cyan-600/40 border-cyan-500`}
        >
          <span className="text-xl">🎯</span>
          <span className={labelClass}>Скіли</span>
        </button>

        {/* Ремесло */}
        <button
          aria-label="Ремесло"
          onClick={onOpenCrafting}
          className={`${btnBase} bg-orange-600/20 hover:bg-orange-600/40 border-orange-500`}
        >
          <span className="text-xl">🔨</span>
          <span className={labelClass}>Крафт</span>
        </button>

        {/* Події */}
        <button
          aria-label="Події"
          onClick={onOpenEvents}
          className={`${btnBase} bg-pink-600/20 hover:bg-pink-600/40 border-pink-500`}
        >
          <span className="text-xl">🎉</span>
          <span className={labelClass}>Події</span>
        </button>

        {/* Статистика */}
        <button
          aria-label="Статистика"
          onClick={onOpenStatistics}
          className={`${btnBase} bg-indigo-600/20 hover:bg-indigo-600/40 border-indigo-500`}
        >
          <span className="text-xl">📊</span>
          <span className={labelClass}>Стати</span>
        </button>

        {/* Досягнення */}
        <button
          aria-label="Досягнення"
          onClick={onOpenAchievements}
          className={`${btnBase} bg-amber-600/20 hover:bg-amber-600/40 border-amber-500`}
        >
          <span className="text-xl">⭐</span>
          <span className={labelClass}>Ачівки</span>
        </button>

        {/* Політика */}
        <button
          aria-label="Політика"
          onClick={onOpenPolitics}
          className={`${btnBase} bg-sky-600/20 hover:bg-sky-600/40 border-sky-500`}
        >
          <span className="text-xl">🏛️</span>
          <span className={labelClass}>Рада</span>
        </button>

        {/* Топ */}
        <button
          aria-label="Топ"
          onClick={onOpenLeaderboard}
          className={`${btnBase} bg-yellow-600/20 hover:bg-yellow-600/40 border-yellow-500`}
        >
          <span className="text-xl">🏆</span>
          <span className={labelClass}>Топ</span>
        </button>

        {/* Реферали */}
        <button
          aria-label="Реферали"
          onClick={onOpenReferral}
          className={`${btnBase} bg-teal-600/20 hover:bg-teal-600/40 border-teal-500`}
        >
          <span className="text-xl">�</span>
          <span className={labelClass}>Друзі+</span>
        </button>

        {/* Батл Пас */}
        <button
          aria-label="Батл Пас"
          onClick={onOpenBattlePass}
          className={`${btnBase} bg-violet-600/20 hover:bg-violet-600/40 border-violet-500`}
        >
          <span className="text-xl">🎫</span>
          <span className={labelClass}>Перепустка</span>
        </button>

        {/* Підписка */}
        <button
          aria-label="Підписка"
          onClick={onOpenSubscription}
          className={`${btnBase} bg-blue-400/20 hover:bg-blue-400/40 border-blue-300`}
        >
          <span className="text-xl">👑</span>
          <span className={labelClass}>VIP</span>
        </button>

        {/* Преміум */}
        <button
          aria-label="Преміум"
          onClick={onOpenPremium}
          className={`${btnBase} bg-yellow-500/20 hover:bg-yellow-500/40 border-yellow-400`}
        >
          <span className="text-xl">💎</span>
          <span className={labelClass}>Крамниця</span>
        </button>

        {/* Адмін */}
        <button
          aria-label="Адмін"
          onClick={onOpenAdmin}
          className={`${btnBase} bg-red-600/20 hover:bg-red-600/40 border-red-500`}
        >
          <span className="text-xl">⚙️</span>
          <span className={labelClass}>Адмін</span>
        </button>
      </div>
    </div>
  );
};