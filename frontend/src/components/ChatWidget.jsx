import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiSend, FiX } from 'react-icons/fi';
import { queryAssistant } from '../api/assistant';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Bonjour ! Je suis votre assistant météo. Posez-moi une question sur la température, l'humidité ou les prévisions.",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef(null);

  const toggleOpen = () => setOpen((prev) => !prev);

  const sendMessage = async () => {
    const question = inputValue.trim();
    if (!question) return;

    const userMessage = { role: 'user', text: question };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await queryAssistant(question);
      const assistantResponse = response.answer || response.error || 'Je n’ai pas pu répondre à cette question pour le moment.';
      setMessages((prev) => [...prev, { role: 'assistant', text: assistantResponse }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'assistant', text: "Désolé, le service n'est pas disponible pour le moment." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between rounded-t-3xl bg-green-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FiMessageSquare size={20} />
              Assistant météo
            </div>
            <button type="button" onClick={toggleOpen} aria-label="Fermer" className="rounded-full p-2 hover:bg-green-500/80">
              <FiX size={20} />
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto px-4 py-4 text-sm text-gray-800 dark:text-gray-100">
            {messages.map((message, index) => (
              <div key={index} className={`mb-3 flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                <div className={`rounded-3xl px-4 py-3 ${message.role === 'assistant' ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100' : 'bg-green-600 text-white'}`}>
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
          <div className="border-t border-gray-200 p-3 dark:border-gray-700">
            <textarea
              rows={2}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pose une question..."
              className="w-full resize-none rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-green-400 dark:focus:ring-green-900"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">Appuie sur Entrée pour envoyer.</span>
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {loading ? 'Envoi...' : 'Envoyer'}
                <FiSend size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={toggleOpen}
        className="flex items-center gap-2 rounded-full bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-green-700"
      >
        <FiMessageSquare size={20} />
        <span>Assistant</span>
      </button>
    </div>
  );
};

export default ChatWidget;
