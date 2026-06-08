import React, { useState } from 'react';

const ChatInterface = () => {
  const [crop, setCrop] = useState('tomato');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const previousMessages = [...messages];
    setMessages([...previousMessages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/agent/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: crop,
          question: input,
          history: previousMessages,
        }),
      });
      const data = await response.json();
      const assistantMessage = { role: 'assistant', content: data.answer };
      setMessages([...previousMessages, userMessage, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages([...previousMessages, userMessage, { role: 'assistant', content: 'Error: Could not reach agent.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', border: '1px solid #ccc', borderRadius: '8px', padding: '16px' }}>
      <h3>🌾 Agri Advisor Chat</h3>
      <div style={{ marginBottom: '12px' }}>
        <label>Crop: </label>
        <select value={crop} onChange={(e) => setCrop(e.target.value)}>
          <option value="tomato">Tomato</option>
          <option value="citrus">Citrus</option>
          <option value="wheat">Wheat</option>
          <option value="potato">Potato</option>
        </select>
      </div>
      <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #eee', padding: '8px', marginBottom: '12px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', margin: '8px 0' }}>
            <strong>{msg.role === 'user' ? 'You' : 'Advisor'}:</strong> {msg.content}
          </div>
        ))}
        {loading && <div><em>Thinking...</em></div>}
      </div>
      <div style={{ display: 'flex' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about irrigation, frost, heat stress..."
          style={{ flex: 1, padding: '8px' }}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading} style={{ marginLeft: '8px' }}>Send</button>
      </div>
    </div>
  );
};

export default ChatInterface;