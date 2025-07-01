import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [temperatures, setTemperatures] = useState([]);
  const [message, setMessage] = useState('');

  const fetchTemperatures = () => {
    axios.get('http://localhost:5000/api/latest')
      .then(response => setTemperatures(response.data))
      .catch(error => console.error('Erreur API /api/latest:', error));
  };

  useEffect(() => {
    fetchTemperatures();
  }, []);

  const handleFetchAndSave = () => {
    axios.get('http://localhost:5000/api/fetch-and-save')
      .then(() => {
        setMessage('✅ Température récupérée et enregistrée !');
        fetchTemperatures();
      })
      .catch(() => setMessage('❌ Erreur pendant l’enregistrement.'));
  };

  return (
    <div style={{
      maxWidth: '700px',
      margin: '0 auto',
      padding: '30px',
      backgroundColor: '#f0f8ff',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '32px',
        color: '#1e90ff',
        marginBottom: '20px'
      }}>
        🌡️ IoT Temp Watch Dashboard
      </h1>

      {/* Bouton */}
      <button
        onClick={handleFetchAndSave}
        style={{
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          padding: '12px 25px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          marginBottom: '20px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
        }}
      >
        📡 Récupérer Température
      </button>

      {/* Message */}
      {message && (
        <p style={{
          color: message.startsWith('✅') ? '#28a745' : '#dc3545',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          {message}
        </p>
      )}

      {/* Liste des températures */}
      <h2 style={{ color: '#333', marginBottom: '10px' }}>📈 Dernières températures :</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {temperatures.map((item) => (
          <li key={item.id} style={{
            backgroundColor: '#ffffff',
            marginBottom: '12px',
            padding: '12px',
            borderRadius: '6px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '12px', color: '#666' }}><strong>{item.temperature}°C</strong></span>
            <span style={{ fontSize: '12px', color: '#666' }}>{new Date(item.timestamp).toLocaleString()}</span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <footer style={{
        marginTop: '30px',
        fontSize: '12px',
        color: '#888'
      }}>
        🚀 Powered by Flask + React
      </footer>
    </div>
  );
}

export default App;
