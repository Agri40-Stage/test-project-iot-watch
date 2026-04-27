import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiSend, FiX } from 'react-icons/fi';
import { queryAssistant } from '../api/assistant';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I am your weather assistant. Ask me a question about temperature, humidity, or forecasts."
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
      const assistantResponse = response.answer || response.error || 'I couldn’t answer that question at the moment.';
      setMessages((prev) => [...prev, { role: 'assistant', text: assistantResponse }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'assistant', text: "Sorry, the service is not available at the moment." }]);
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
        <div className="mb-3 w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] shadow-2xl dark:bg-[var(--bg-primary)]">
          <div className="flex items-center justify-between rounded-t-3xl bg-[var(--accent)] px-4 py-3 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FiMessageSquare size={20} />
              Weather assistant
            </div>
            <button type="button" onClick={toggleOpen} aria-label="Fermer" className="rounded-full p-2 hover:bg-[rgba(77,184,176,0.8)]">
              <FiX size={20} />
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto px-4 py-4 text-sm text-[var(--text-primary)] dark:text-[var(--text-primary)]">
            {messages.map((message, index) => (
              <div key={index} className={`mb-3 flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                <div className={`rounded-3xl px-4 py-3 ${message.role === 'assistant' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] dark:bg-[var(--card-bg)] dark:text-[var(--text-primary)]' : 'bg-[var(--accent)] text-white'}`}>
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
          <div className="border-t border-[var(--border)] p-3 dark:border-[var(--border)]">
            <textarea
              rows={2}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pose une question..."
              className="w-full resize-none rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(77,184,176,0.15)] dark:bg-[var(--bg-primary)] dark:text-[var(--text-primary)] dark:focus:border-[var(--accent)] dark:focus:ring-[rgba(77,184,176,0.25)]"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">Press Enter to send.</span>
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[rgba(77,184,176,0.9)] disabled:cursor-not-allowed disabled:bg-[var(--border)]"
              >
                {loading ? 'Sending...' : 'Send'}
                <FiSend size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
        <button
          type="button"
          onClick={toggleOpen}
          className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-[rgba(77,184,176,0.9)]"
        >
        <FiMessageSquare size={20} />
        <span>Assistant</span>
      </button>
    </div>
  );
};

export default ChatWidget;
