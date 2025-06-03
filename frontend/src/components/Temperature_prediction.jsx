import React, { useState, useEffect } from 'react';

function TemperaturePrediction() {
  const [prediction, setPrediction] = useState('--');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/predict-temperature');
        const data = await response.json();
        setPrediction(data.predicted_temperature_next_hour.toFixed(1));
      } catch (error) {
        setPrediction('Erreur');
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Rafraîchissement toutes les 5 minutes
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h3>Température prévue dans 1 heure :</h3>
      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {prediction} °C
        </p>
      )}
    </div>
  );
}

export default TemperaturePrediction;