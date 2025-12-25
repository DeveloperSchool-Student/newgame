import { useState, useRef, useEffect } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { RANKS } from '../../data/kingdoms';

const locationMessages = {
  capital: [
    { id: 1, author: 'Торговець', level: 5, text: 'Ласкаво просимо до Столиці! Що бажаєте придбати?', time: '10:30', isRP: false },
    { id: 2, author: 'Гвардієць', level: 10, text: 'Будьте обережні в Темному лісі, там багато небезпек.', time: '10:32', isRP: false },
  ],
  darkForest: [
    { id: 1, author: 'Лісовий провідник', level: 8, text: 'Цей ліс таїть багато секретів. Шукайте приховані скарби!', time: '11:15', isRP: false },
    { id: 2, author: 'Ельф', level: 15, text: 'Природа тут дуже сильна. Поважайте її закони.', time: '11:20', isRP: false },
  ],
  forgottenMines: [
    { id: 1, author: 'Досвідчений воїн', level: 20, text: 'Шахти небезпечні! Підготуйтеся до битви.', time: '12:00', isRP: false },
    { id: 2, author: 'Чарівник', level: 18, text: 'Тут можна знайти потужні артефакти, але будьте обережні.', time: '12:05', isRP: false },
  ],
};

export const LocationChat = ({ isOpen, onClose, activeLocation }) => {
  const { player } = usePlayerContext();
  const [messages, setMessages] = useState(locationMessages[activeLocation?.id] || []);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages(locationMessages[activeLocation?.id] || []);
  }, [activeLocation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      const isRP = inputValue.startsWith('/me ');
      const text = isRP ? inputValue.substring(4) : inputValue;
      
      const newMessage = {
        id: Date.now(),
        author: player.name,
        level: player.level,
        rank: player.rank,
        kingdom: player.kingdom,
        text: text,
        time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
        isRP: isRP,
      };
      setMessages([...messages, newMessage]);
      setInputValue('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={onClose}>
      <div
        className="bg-fantasy-dark border-2 border-fantasy-purple rounded-lg w-11/12 max-w-md h-[80vh] flex flex-col glow-purple"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-fantasy-purple/30 px-6 py-4 border-b border-fantasy-purple flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-fantasy-gold">Чат локації</h2>
            <p className="text-xs text-gray-400">{activeLocation?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-fantasy-gold transition-colors text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.author === player.name ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.isRP
                    ? 'bg-fantasy-purple/20 border border-fantasy-purple/50 italic text-fantasy-gold'
                    : message.author === player.name
                    ? 'bg-fantasy-purple/40 text-white'
                    : 'bg-fantasy-dark/50 text-gray-200 border border-fantasy-purple/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="text-xs font-semibold"
                    style={{ 
                      color: message.rank && RANKS[message.rank] 
                        ? RANKS[message.rank].color 
                        : '#ffffff' 
                    }}
                  >
                    {message.author}
                  </span>
                  {message.rank && RANKS[message.rank] && (
                    <span className="text-xs px-1 py-0.5 bg-fantasy-dark/50 rounded" style={{ color: RANKS[message.rank].color }}>
                      {RANKS[message.rank].name}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">Lv.{message.level}</span>
                </div>
                <div className={`text-sm ${message.isRP ? 'text-fantasy-gold' : ''}`}>
                  {message.isRP ? `*${message.text}*` : message.text}
                </div>
                <div className="text-xs text-gray-500 mt-1">{message.time}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-fantasy-purple p-4 bg-fantasy-dark/50">
          <div className="mb-2 text-xs text-gray-400">
            Використайте /me для RP-повідомлень
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Напишіть повідомлення або /me для RP..."
              className="flex-1 bg-fantasy-dark border border-fantasy-purple/50 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-fantasy-purple"
            />
            <button
              onClick={handleSend}
              className="btn-fantasy bg-fantasy-purple hover:bg-fantasy-purple/80 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Відправити
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

