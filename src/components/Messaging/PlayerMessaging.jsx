import { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { useToast } from '../UI/Toast';

export const PlayerMessaging = ({ isOpen, onClose, telegramId }) => {
  const { player } = usePlayerContext();
  const { showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Завантаження розмов
  useEffect(() => {
    if (!isOpen || !telegramId) return;

    const loadConversations = async () => {
      setIsLoading(true);
      try {
        if (!supabase) {
          setIsLoading(false);
          return;
        }

        // Завантажуємо розмови де гравець є відправником або отримувачем
        const { data: convs } = await supabase
          .from('private_messages')
          .select(`
            *,
            sender:profiles!private_messages_sender_id_fkey(telegram_id, name, avatar_url, level),
            receiver:profiles!private_messages_receiver_id_fkey(telegram_id, name, avatar_url, level)
          `)
          .or(`sender_id.eq.${telegramId},receiver_id.eq.${telegramId}`)
          .order('created_at', { ascending: false });

        if (convs) {
          // Групуємо повідомлення по розмовам
          const convMap = new Map();
          convs.forEach((msg) => {
            const otherUserId = msg.sender_id === telegramId ? msg.receiver_id : msg.sender_id;
            const otherUser = msg.sender_id === telegramId ? msg.receiver : msg.sender;
            
            if (!convMap.has(otherUserId)) {
              convMap.set(otherUserId, {
                userId: otherUserId,
                user: otherUser,
                lastMessage: msg,
                unreadCount: 0,
              });
            } else {
              const conv = convMap.get(otherUserId);
              if (new Date(msg.created_at) > new Date(conv.lastMessage.created_at)) {
                conv.lastMessage = msg;
              }
              if (!msg.is_read && msg.receiver_id === telegramId) {
                conv.unreadCount++;
              }
            }
          });

          setConversations(Array.from(convMap.values()));
        }
      } catch (error) {
        console.error('Помилка завантаження розмов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [isOpen, telegramId]);

  // Завантаження повідомлень розмови
  useEffect(() => {
    if (!selectedConversation || !telegramId) return;

    const loadMessages = async () => {
      try {
        if (!supabase) return;

        const { data: msgs } = await supabase
          .from('private_messages')
          .select(`
            *,
            sender:profiles!private_messages_sender_id_fkey(telegram_id, name, avatar_url, level)
          `)
          .or(`and(sender_id.eq.${telegramId},receiver_id.eq.${selectedConversation.userId}),and(sender_id.eq.${selectedConversation.userId},receiver_id.eq.${telegramId})`)
          .order('created_at', { ascending: true });

        if (msgs) {
          setMessages(msgs);

          // Позначаємо повідомлення як прочитані
          await supabase
            .from('private_messages')
            .update({ is_read: true })
            .eq('receiver_id', telegramId)
            .eq('sender_id', selectedConversation.userId)
            .eq('is_read', false);
        }
      } catch (error) {
        console.error('Помилка завантаження повідомлень:', error);
      }
    };

    loadMessages();

    // Підписка на нові повідомлення
    if (supabase) {
      const messagesChannel = supabase
        .channel(`private-messages-${telegramId}-${selectedConversation.userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'private_messages',
            filter: `or(and(sender_id=eq.${telegramId},receiver_id=eq.${selectedConversation.userId}),and(sender_id=eq.${selectedConversation.userId},receiver_id=eq.${telegramId}))`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messagesChannel);
      };
    }
  }, [selectedConversation, telegramId]);

  // Прокрутка до останнього повідомлення
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Відправка повідомлення
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || !selectedConversation || !telegramId) return;

    if (!supabase) {
      showToast('Supabase не налаштовано', 'error');
      return;
    }

    try {
      // Захист від XSS
      const sanitizeText = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.textContent || div.innerText || '';
      };

      const sanitizedText = sanitizeText(inputValue);

      const { error } = await supabase
        .from('private_messages')
        .insert({
          sender_id: telegramId.toString(),
          receiver_id: selectedConversation.userId,
          message: sanitizedText,
          is_read: false,
        });

      if (error) {
        showToast('Не вдалося відправити повідомлення', 'error');
        return;
      }

      setInputValue('');
      showToast('Повідомлення відправлено', 'success', 2000);
    } catch (error) {
      console.error('Помилка відправки повідомлення:', error);
      showToast('Не вдалося відправити повідомлення', 'error');
    }
  }, [inputValue, selectedConversation, telegramId, showToast]);

  // Фільтрація розмов
  const filteredConversations = conversations.filter((conv) =>
    conv.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-fantasy-dark modal-backdrop flex items-center justify-center">
      <div className="bg-fantasy-dark/95 border-2 border-fantasy-purple rounded-lg w-11/12 max-w-4xl h-[90vh] flex flex-col">
        <div className="flex h-full">
          {/* Список розмов */}
          <div className="w-1/3 border-r border-fantasy-purple/30 flex flex-col">
            <div className="p-4 border-b border-fantasy-purple/30">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-fantasy-gold">Повідомлення</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук..."
                className="w-full bg-fantasy-dark border border-fantasy-purple/50 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>Немає розмов</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.userId}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedConversation?.userId === conv.userId
                          ? 'bg-fantasy-purple/30 border border-fantasy-purple'
                          : 'hover:bg-fantasy-dark/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {conv.user?.avatar_url ? (
                          <img
                            src={conv.user.avatar_url}
                            alt={conv.user.name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-fantasy-purple/30 flex items-center justify-center">
                            <span className="text-lg">{conv.user?.name?.[0] || '?'}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">
                            {conv.user?.name || 'Гравець'}
                          </div>
                          <div className="text-xs text-gray-400">
                            Lv.{conv.user?.level || 1}
                          </div>
                          {conv.unreadCount > 0 && (
                            <div className="mt-1">
                              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                                {conv.unreadCount}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Повідомлення */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-fantasy-purple/30 bg-fantasy-purple/20">
                  <div className="flex items-center gap-3">
                    {selectedConversation.user?.avatar_url ? (
                      <img
                        src={selectedConversation.user.avatar_url}
                        alt={selectedConversation.user.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-fantasy-purple/30 flex items-center justify-center">
                        <span>{selectedConversation.user?.name?.[0] || '?'}</span>
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-white">
                        {selectedConversation.user?.name || 'Гравець'}
                      </div>
                      <div className="text-xs text-gray-400">
                        Lv.{selectedConversation.user?.level || 1}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.sender_id === telegramId;
                    return (
                      <div
                        key={message.id}
                        className={`flex flex-col ${
                          isOwnMessage ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwnMessage
                              ? 'bg-fantasy-purple/40 text-white'
                              : 'bg-fantasy-dark/50 text-gray-200 border border-fantasy-purple/30'
                          }`}
                        >
                          <div className="text-sm">{message.message}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(message.created_at).toLocaleTimeString('uk-UA', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <p>Оберіть розмову</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

