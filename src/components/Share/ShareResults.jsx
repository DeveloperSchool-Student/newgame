import { usePlayerContext } from '../../contexts/PlayerContext';
import { useClanContext } from '../../contexts/ClanContext';

export const ShareResults = () => {
  const { player } = usePlayerContext();
  const { clan } = useClanContext();

  const handleShare = () => {
    const message = `🎮 Мої досягнення в RPG:\n\n` +
      `⚔️ Рівень: ${player.level}\n` +
      `💰 Золото: ${player.gold}\n` +
      `💎 Досвід: ${player.experience}/${player.experienceToNext}\n` +
      `❤️ HP: ${player.health}/${player.maxHealth}\n` +
      (clan ? `🛡️ Клан: [${clan.tag}] ${clan.name}\n` : '') +
      `\nПриєднуйся до гри!`;

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`
      );
    } else {
      // Fallback для копіювання
      if (navigator.clipboard) {
        navigator.clipboard.writeText(message);
        alert('Результати скопійовано!');
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="absolute bottom-20 right-4 bg-fantasy-green hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg z-10 flex items-center gap-2"
    >
      📤 Поділитися
    </button>
  );
};

