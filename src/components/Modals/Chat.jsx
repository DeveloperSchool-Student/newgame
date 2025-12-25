import { useState, useRef, useEffect } from 'react';

const locationMessages = {
  capital: [
    { id: 1, author: 'Торговець', text: 'Ласкаво просимо до Столиці! Що бажаєте придбати?', time: '10:30' },
    { id: 2, author: 'Гвардієць', text: 'Будьте обережні в Темному лісі, там багато небезпек.', time: '10:32' },
    { id: 3, author: 'Міський радник', text: 'У нас найкращі товари в регіоні!', time: '10:35' },
  ],
  darkForest: [
    { id: 1, author: 'Лісовий провідник', text: 'Цей ліс таїть багато секретів. Шукайте приховані скарби!', time: '11:15' },
    { id: 2, author: 'Ельф', text: 'Природа тут дуже сильна. Поважайте її закони.', time: '11:20' },
    { id: 3, author: 'Мисливець', text: 'Тут багато монстрів, будьте готові до битви!', time: '11:25' },
  ],
  forgottenMines: [
    { id: 1, author: 'Досвідчений воїн', text: 'Шахти небезпечні! Підготуйтеся до битви.', time: '12:00' },
    { id: 2, author: 'Чарівник', text: 'Тут можна знайти потужні артефакти, але будьте обережні.', time: '12:05' },
    { id: 3, author: 'Шахтар', text: 'Глибоко в шахтах живуть потужні монстри. Не йдіть туди без підготовки!', time: '12:10' },
  ],
};

export const Chat = ({ isOpen, onClose, currentLocation }) => {
  const [messages, setMessages] = useState(locationMessages[currentLocation] || []);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages(locationMessages[currentLocation] || []);
  }, [currentLocation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        author: 'Ви',
        text: inputValue,
        time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
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
          <h2 className="text-2xl font-bold text-fantasy-gold">Чат локації</h2>
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
                message.author === 'Ви' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.author === 'Ви'
                    ? 'bg-fantasy-purple/40 text-white'
                    : 'bg-fantasy-dark/50 text-gray-200 border border-fantasy-purple/30'
                }`}
              >
                <div className="text-xs text-gray-400 mb-1">{message.author}</div>
                <div className="text-sm">{message.text}</div>
                <div className="text-xs text-gray-500 mt-1">{message.time}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-fantasy-purple p-4 bg-fantasy-dark/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Напишіть повідомлення..."
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

