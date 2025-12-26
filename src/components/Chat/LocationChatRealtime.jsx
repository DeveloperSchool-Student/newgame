import { useState, useRef, useEffect } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { useClanContext } from '../../contexts/ClanContext';
import { RANKS } from '../../data/kingdoms';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../UI/Toast';

export const LocationChatRealtime = ({ isOpen, onClose, activeLocation }) => {
  const { player } = usePlayerContext();
  const { clan } = useClanContext();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'rp', 'normal'
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [reactions, setReactions] = useState({});
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const messagesEndRef = useRef(null);

  const availableReactions = ['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '⭐'];

  // Завантаження повідомлень
  useEffect(() => {
    if (!isOpen || !activeLocation?.id) return;

    const loadMessages = async () => {
      if (!supabase) {
        console.warn('Supabase не налаштовано');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('location_id', activeLocation.id)
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) {
          console.error('Помилка завантаження повідомлень:', error);
        } else {
          setMessages(data || []);
        }
      } catch (error) {
        console.error('Помилка завантаження повідомлень:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
    loadReactions();

    if (!supabase) return;

    // Підписка на нові повідомлення (Realtime) з retry логікою
    let messagesChannel = null;
    let retryCount = 0;
    const maxRetries = 3;

    const setupMessagesSubscription = () => {
      if (!supabase) return;

      try {
        messagesChannel = supabase
          .channel(`messages-${activeLocation.id}-${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `location_id=eq.${activeLocation.id}`,
            },
            (payload) => {
              console.log('Нове повідомлення:', payload);
              setMessages((prev) => [...prev, payload.new]);
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Підписка на повідомлення активна');
              retryCount = 0;
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Помилка підписки на повідомлення');
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(setupMessagesSubscription, 2000 * retryCount);
              }
            }
          });
      } catch (error) {
        console.error('Помилка налаштування підписки на повідомлення:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(setupMessagesSubscription, 2000 * retryCount);
        }
      }
    };

    setupMessagesSubscription();

    return () => {
      if (messagesChannel && supabase) {
        supabase.removeChannel(messagesChannel);
      }
    };
  }, [isOpen, activeLocation]);

  // Завантаження реакцій
  const loadReactions = async () => {
    if (!supabase || !activeLocation?.id) return;

    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .in('message_id', messages.map(m => m.id));

      if (error) throw error;

      // Групуємо реакції по повідомленнях
      const reactionsByMessage = {};
      data?.forEach((reaction) => {
        if (!reactionsByMessage[reaction.message_id]) {
          reactionsByMessage[reaction.message_id] = [];
        }
        reactionsByMessage[reaction.message_id].push(reaction);
      });

      setReactions(reactionsByMessage);
    } catch (error) {
      console.error('Помилка завантаження реакцій:', error);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      loadReactions();
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Додати реакцію
  const addReaction = async (messageId, emoji) => {
    if (!supabase) return;

    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!tgUser) return;

    try {
      // Перевіряємо чи вже є така реакція від цього користувача
      const existingReaction = reactions[messageId]?.find(
        r => r.user_telegram_id === tgUser.id.toString() && r.emoji === emoji
      );

      if (existingReaction) {
        // Видаляємо реакцію
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (error) throw error;
      } else {
        // Додаємо реакцію
        const { error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_telegram_id: tgUser.id.toString(),
            emoji: emoji,
          });

        if (error) throw error;
      }

      await loadReactions();
      setShowReactionPicker(null);
    } catch (error) {
      console.error('Помилка додавання реакції:', error);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !activeLocation?.id) return;

    if (!supabase) {
      showToast('Supabase не налаштовано', 'error');
      return;
    }

    const isRP = inputValue.startsWith('/me ');
    const text = isRP ? inputValue.substring(4) : inputValue;

    // Захист від XSS - видаляємо HTML теги
    const sanitizeText = (str) => {
      const div = document.createElement('div');
      div.textContent = str;
      return div.textContent || div.innerText || '';
    };

    const sanitizedText = sanitizeText(text);

    // Отримуємо Telegram ID
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!tgUser) {
      showToast('Помилка: не вдалося отримати дані користувача', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_telegram_id: tgUser.id.toString(),
          sender_name: player.name,
          sender_level: player.level,
          sender_rank: player.rank,
          sender_kingdom: player.kingdom,
          sender_clan_tag: clan?.tag || null,
          text: sanitizedText,
          location_id: activeLocation.id,
          is_rp: isRP,
        });

      if (error) {
        console.error('Помилка відправки повідомлення:', error);
        showToast('Не вдалося відправити повідомлення', 'error');
        return;
      }

      setInputValue('');
      showToast('Повідомлення відправлено', 'success', 2000);
    } catch (error) {
      console.error('Помилка відправки повідомлення:', error);
      showToast('Не вдалося відправити повідомлення', 'error');
    }
  };

  const handleEditMessage = async (messageId, newText) => {
    if (!supabase || !newText.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ text: newText, edited_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('sender_telegram_id', window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString());

      if (error) {
        showToast('Не вдалося редагувати повідомлення', 'error');
        return;
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, text: newText, edited_at: new Date().toISOString() } : msg
        )
      );
      showToast('Повідомлення відредаговано', 'success', 2000);
    } catch (error) {
      console.error('Помилка редагування повідомлення:', error);
      showToast('Не вдалося редагувати повідомлення', 'error');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!supabase) return;

    if (!window.confirm('Видалити це повідомлення?')) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_telegram_id', window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString());

      if (error) {
        showToast('Не вдалося видалити повідомлення', 'error');
        return;
      }

      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      showToast('Повідомлення видалено', 'success', 2000);
    } catch (error) {
      console.error('Помилка видалення повідомлення:', error);
      showToast('Не вдалося видалити повідомлення', 'error');
    }
  };

  const handleReaction = async (messageId, emoji) => {
    if (!supabase) return;

    try {
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      if (!tgUser) return;

      // Додаємо реакцію (потрібно створити таблицю message_reactions)
      const { error } = await supabase
        .from('message_reactions')
        .upsert({
          message_id: messageId,
          user_telegram_id: tgUser.id.toString(),
          emoji: emoji,
        }, {
          onConflict: 'message_id,user_telegram_id'
        });

      if (error) {
        console.error('Помилка додавання реакції:', error);
      }
    } catch (error) {
      console.error('Помилка реакції:', error);
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
        <div className="bg-fantasy-purple/30 px-6 py-4 border-b border-fantasy-purple">
          <div className="flex justify-between items-center mb-3">
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

          {/* Фільтри */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm font-semibold transition-all ${filter === 'all'
                  ? 'bg-fantasy-purple text-white'
                  : 'bg-fantasy-dark/50 text-gray-400 hover:text-white'
                }`}
            >
              Всі
            </button>
            <button
              onClick={() => setFilter('normal')}
              className={`px-3 py-1 rounded text-sm font-semibold transition-all ${filter === 'normal'
                  ? 'bg-fantasy-purple text-white'
                  : 'bg-fantasy-dark/50 text-gray-400 hover:text-white'
                }`}
            >
              Звичайні
            </button>
            <button
              onClick={() => setFilter('rp')}
              className={`px-3 py-1 rounded text-sm font-semibold transition-all ${filter === 'rp'
                  ? 'bg-fantasy-purple text-white'
                  : 'bg-fantasy-dark/50 text-gray-400 hover:text-white'
                }`}
            >
              RP
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages
            .filter((msg) => {
              if (filter === 'all') return true;
              if (filter === 'rp') return msg.is_rp;
              if (filter === 'normal') return !msg.is_rp;
              return true;
            })
            .map((message) => {
              const isOwnMessage = message.sender_telegram_id === window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString();
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'
                    }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${message.is_rp
                        ? 'bg-fantasy-purple/20 border border-fantasy-purple/50 italic text-fantasy-gold'
                        : isOwnMessage
                          ? 'bg-fantasy-purple/40 text-white'
                          : 'bg-fantasy-dark/50 text-gray-200 border border-fantasy-purple/30'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: message.sender_rank && RANKS[message.sender_rank]
                            ? RANKS[message.sender_rank].color
                            : '#ffffff',
                        }}
                      >
                        {message.sender_name}
                      </span>
                      {message.sender_rank && RANKS[message.sender_rank] && (
                        <span
                          className="text-xs px-1 py-0.5 bg-fantasy-dark/50 rounded"
                          style={{ color: RANKS[message.sender_rank].color }}
                        >
                          {RANKS[message.sender_rank].name}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">Lv.{message.sender_level}</span>
                    </div>
                    <div className={`text-sm ${message.is_rp ? 'text-fantasy-gold' : ''}`}>
                      {editingMessage === message.id ? (
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleEditMessage(message.id, editText);
                              setEditingMessage(null);
                              setEditText('');
                            }
                            if (e.key === 'Escape') {
                              setEditingMessage(null);
                              setEditText('');
                            }
                          }}
                          className="w-full bg-fantasy-dark border border-fantasy-purple rounded px-2 py-1 text-white"
                          autoFocus
                        />
                      ) : (
                        <>
                          {message.is_rp ? `*${message.text}*` : message.text}
                          {message.edited_at && (
                            <span className="text-xs text-gray-500 ml-2">(ред.)</span>
                          )}
                        </>
                      )}
                    </div>
                    {/* Реакції */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {/* Показуємо існуючі реакції з підрахунком */}
                      {reactions[message.id] && (() => {
                        const reactionCounts = {};
                        reactions[message.id].forEach(r => {
                          reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
                        });
                        return Object.entries(reactionCounts).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(message.id, emoji)}
                            className="px-2 py-1 bg-fantasy-dark/50 rounded-full text-sm hover:scale-110 transition-transform flex items-center gap-1"
                          >
                            <span>{emoji}</span>
                            <span className="text-xs text-gray-400">{count}</span>
                          </button>
                        ));
                      })()}
                      {/* Кнопка додавання нової реакції */}
                      <button
                        onClick={() => setShowReactionPicker(showReactionPicker === message.id ? null : message.id)}
                        className="px-2 py-1 bg-fantasy-dark/50 rounded-full text-sm hover:scale-110 transition-transform"
                      >
                        ➕
                      </button>
                      {/* Picker реакцій */}
                      {showReactionPicker === message.id && (
                        <div className="absolute z-10 bg-fantasy-dark border border-fantasy-purple rounded-lg p-2 flex gap-1 shadow-lg">
                          {availableReactions.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => addReaction(message.id, emoji)}
                              className="text-xl hover:scale-125 transition-transform"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleTimeString('uk-UA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {isOwnMessage && editingMessage !== message.id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingMessage(message.id);
                              setEditText(message.text);
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          }
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

