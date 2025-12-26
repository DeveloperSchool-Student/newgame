import { useState, useEffect } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../UI/Toast';

// Доступні жести
export const GESTURES = {
  wave: { id: 'wave', name: 'Помахати', icon: '👋', command: '/wave' },
  bow: { id: 'bow', name: 'Вклонитися', icon: '🙇', command: '/bow' },
  dance: { id: 'dance', name: 'Танцювати', icon: '💃', command: '/dance' },
  cheer: { id: 'cheer', name: 'Підбадьорити', icon: '🎉', command: '/cheer' },
  clap: { id: 'clap', name: 'Аплодувати', icon: '👏', command: '/clap' },
  laugh: { id: 'laugh', name: 'Сміятися', icon: '😂', command: '/laugh' },
  cry: { id: 'cry', name: 'Плакати', icon: '😢', command: '/cry' },
  angry: { id: 'angry', name: 'Сердитися', icon: '😡', command: '/angry' },
  think: { id: 'think', name: 'Думати', icon: '🤔', command: '/think' },
  sleep: { id: 'sleep', name: 'Спати', icon: '😴', command: '/sleep' },
  eat: { id: 'eat', name: 'Їсти', icon: '🍽️', command: '/eat' },
  drink: { id: 'drink', name: 'Пити', icon: '🍺', command: '/drink' },
  point: { id: 'point', name: 'Вказати', icon: '👉', command: '/point' },
  shrug: { id: 'shrug', name: 'Знизати плечима', icon: '🤷', command: '/shrug' },
  facepalm: { id: 'facepalm', name: 'Фейспалм', icon: '🤦', command: '/facepalm' },
};

// Обробка команд жестів у чаті
export const processGestureCommand = (message, playerName) => {
  const parts = message.trim().split(' ');
  const command = parts[0];
  const target = parts.slice(1).join(' ');

  const gesture = Object.values(GESTURES).find(g => g.command === command);
  if (!gesture) return null;

  let text = '';
  if (target) {
    // Жест до конкретного гравця
    switch (gesture.id) {
      case 'wave':
        text = `${playerName} махає рукою ${target}`;
        break;
      case 'bow':
        text = `${playerName} вклоняється ${target}`;
        break;
      case 'cheer':
        text = `${playerName} підбадьорює ${target}`;
        break;
      case 'point':
        text = `${playerName} вказує на ${target}`;
        break;
      default:
        text = `${playerName} ${gesture.name.toLowerCase()} до ${target}`;
    }
  } else {
    // Загальний жест
    switch (gesture.id) {
      case 'wave':
        text = `${playerName} махає рукою`;
        break;
      case 'bow':
        text = `${playerName} вклоняється`;
        break;
      case 'dance':
        text = `${playerName} танцює`;
        break;
      case 'cheer':
        text = `${playerName} радіє`;
        break;
      case 'clap':
        text = `${playerName} аплодує`;
        break;
      case 'laugh':
        text = `${playerName} сміється`;
        break;
      case 'cry':
        text = `${playerName} плаче`;
        break;
      case 'angry':
        text = `${playerName} сердиться`;
        break;
      case 'think':
        text = `${playerName} замислився`;
        break;
      case 'sleep':
        text = `${playerName} засинає`;
        break;
      case 'eat':
        text = `${playerName} їсть`;
        break;
      case 'drink':
        text = `${playerName} п'є`;
        break;
      case 'shrug':
        text = `${playerName} знизує плечима`;
        break;
      case 'facepalm':
        text = `${playerName} робить фейспалм`;
        break;
      default:
        text = `${playerName} ${gesture.name.toLowerCase()}`;
    }
  }

  return {
    text: `${gesture.icon} ${text}`,
    isGesture: true,
    gestureId: gesture.id,
  };
};

export const GesturePanel = ({ isOpen, onClose, onSelectGesture }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl border-2 border-purple-500 shadow-2xl overflow-hidden">
        {/* Заголовок */}
        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-6 border-b-2 border-purple-400">
          <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
            <span>🎭</span>
            Жести та емоції
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-red-400 text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Список жестів */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.values(GESTURES).map((gesture) => (
              <button
                key={gesture.id}
                onClick={() => {
                  onSelectGesture(gesture.command);
                  onClose();
                }}
                className="bg-slate-800 hover:bg-slate-700 rounded-lg p-4 border-2 border-purple-500/30 hover:border-purple-500 transition-all hover:scale-105"
              >
                <div className="text-4xl text-center mb-2">{gesture.icon}</div>
                <p className="text-white font-semibold text-center text-sm">{gesture.name}</p>
                <p className="text-gray-400 text-xs text-center mt-1">{gesture.command}</p>
              </button>
            ))}
          </div>

          {/* Підказка */}
          <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-purple-500/30">
            <p className="text-white font-semibold mb-2">💡 Як використовувати:</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Натисніть на жест, щоб додати команду в чат</li>
              <li>• Додайте ім'я гравця після команди для жесту до нього</li>
              <li>• Приклад: <span className="text-purple-400">/wave Іван</span></li>
              <li>• Або просто: <span className="text-purple-400">/dance</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент для відображення активних жестів над персонажем
export const ActiveGesture = ({ gesture, playerName }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const gestureInfo = GESTURES[gesture];
  if (!gestureInfo) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
        <span className="text-3xl">{gestureInfo.icon}</span>
        <span className="font-bold">{playerName}</span>
      </div>
    </div>
  );
};

export default GesturePanel;

