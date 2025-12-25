export const HUD = ({ onOpenInventory, onOpenCharacter, onOpenChat, onOpenClan, onOpenReferral, onOpenLeaderboard, onOpenPremium, onOpenAdmin, onOpenQuest, onOpenAchievements, onOpenPvP, onOpenStatistics, onOpenEvents, onOpenSkills, onOpenCrafting, onOpenClanWars, onOpenBattlePass, onOpenSubscription, onOpenMessaging }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-fantasy-dark/95 backdrop-blur-md border-t-2 border-fantasy-purple z-20">
      <div className="flex justify-around items-center p-4">
        <button
          onClick={onOpenInventory}
          className="btn-fantasy flex flex-col items-center gap-2 px-6 py-3 bg-fantasy-purple/20 hover:bg-fantasy-purple/40 rounded-lg border border-fantasy-purple glow-purple"
        >
          <svg
            className="w-6 h-6 text-fantasy-gold"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <span className="text-sm font-semibold text-white">Інвентар</span>
        </button>

        <button
          onClick={onOpenCharacter}
          className="btn-fantasy flex flex-col items-center gap-2 px-6 py-3 bg-fantasy-purple/20 hover:bg-fantasy-purple/40 rounded-lg border border-fantasy-purple glow-purple"
        >
          <svg
            className="w-6 h-6 text-fantasy-gold"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-sm font-semibold text-white">Персонаж</span>
        </button>

        <button
          onClick={onOpenStatistics}
          className="btn-fantasy flex flex-col items-center gap-2 px-6 py-3 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-lg border border-indigo-500"
        >
          <span className="text-2xl">📊</span>
          <span className="text-sm font-semibold text-white">Статистика</span>
        </button>

        <button
          onClick={onOpenEvents}
          className="btn-fantasy flex flex-col items-center gap-2 px-6 py-3 bg-pink-600/20 hover:bg-pink-600/40 rounded-lg border border-pink-500"
        >
          <span className="text-2xl">🎉</span>
          <span className="text-sm font-semibold text-white">Події</span>
        </button>

        <button
          onClick={onOpenSkills}
          className="btn-fantasy flex flex-col items-center gap-2 px-6 py-3 bg-cyan-600/20 hover:bg-cyan-600/40 rounded-lg border border-cyan-500"
        >
          <span className="text-2xl">🎯</span>
          <span className="text-sm font-semibold text-white">Навички</span>
        </button>

        <button
          onClick={onOpenCrafting}
          className="btn-fantasy flex flex-col items-center gap-2 px-6 py-3 bg-orange-600/20 hover:bg-orange-600/40 rounded-lg border border-orange-500"
        >
          <span className="text-2xl">🔨</span>
          <span className="text-sm font-semibold text-white">Ремесло</span>
        </button>

        <button
          onClick={onOpenChat}
          className="btn-fantasy flex flex-col items-center gap-2 px-6 py-3 bg-fantasy-purple/20 hover:bg-fantasy-purple/40 rounded-lg border border-fantasy-purple glow-purple"
        >
          <svg
            className="w-6 h-6 text-fantasy-gold"
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
          <span className="text-sm font-semibold text-white">Чат</span>
        </button>

        <button
          onClick={onOpenQuest}
          className="btn-fantasy flex flex-col items-center gap-2 px-6 py-3 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg border border-blue-500"
        >
          <span className="text-2xl">📜</span>
          <span className="text-sm font-semibold text-white">Квести</span>
        </button>

        <button
          onClick={onOpenAchievements}
          className="btn-fantasy flex flex-col items-center gap-2 px-6 py-3 bg-yellow-600/20 hover:bg-yellow-600/40 rounded-lg border border-yellow-500"
        >
          <span className="text-2xl">🏆</span>
          <span className="text-sm font-semibold text-white">Досягнення</span>
        </button>

        <button
          onClick={onOpenPvP}
          className="btn-fantasy flex flex-col items-center gap-2 px-6 py-3 bg-red-600/20 hover:bg-red-600/40 rounded-lg border border-red-500"
        >
          <span className="text-2xl">⚔️</span>
          <span className="text-sm font-semibold text-white">PvP</span>
        </button>

        <button
          onClick={onOpenClan}
          className="btn-fantasy flex flex-col items-center gap-2 px-6 py-3 bg-amber-600/20 hover:bg-amber-600/40 rounded-lg border border-amber-500"
        >
          <svg
            className="w-6 h-6 text-amber-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <span className="text-sm font-semibold text-white">Клан</span>
        </button>

        <button
          onClick={onOpenReferral}
          className="btn-fantasy flex flex-col items-center gap-2 px-6 py-3 bg-fantasy-green/20 hover:bg-fantasy-green/40 rounded-lg border border-fantasy-green"
        >
          <svg
            className="w-6 h-6 text-fantasy-green"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <span className="text-sm font-semibold text-white">Реферали</span>
        </button>

        <button
          onClick={onOpenLeaderboard}
          className="btn-fantasy flex flex-col items-center gap-2 px-6 py-3 bg-yellow-600/20 hover:bg-yellow-600/40 rounded-lg border border-yellow-500"
        >
          <span className="text-2xl">🏆</span>
          <span className="text-sm font-semibold text-white">Топ</span>
        </button>

        <button
          onClick={onOpenPremium}
          className="btn-fantasy flex flex-col items-center gap-2 px-6 py-3 bg-yellow-500/20 hover:bg-yellow-500/40 rounded-lg border border-yellow-400"
        >
          <span className="text-2xl">💎</span>
          <span className="text-sm font-semibold text-white">Преміум</span>
        </button>

        <button
          onClick={onOpenAdmin}
          className="btn-fantasy flex flex-col items-center gap-2 px-6 py-3 bg-red-600/20 hover:bg-red-600/40 rounded-lg border border-red-500"
        >
          <span className="text-xl">⚙️</span>
          <span className="text-sm font-semibold text-white">Адмін</span>
        </button>
      </div>
    </div>
  );
};

