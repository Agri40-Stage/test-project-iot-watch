import React, { useState } from 'react';

const ExportButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportLimit, setExportLimit] = useState('all');
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      // Construire l'URL avec ou sans limite
      let url = `${apiUrl}/data/export`;
      if (exportLimit !== 'all') {
        url += `?limit=${exportLimit}`;
      }

      console.log('Exporting from:', url);

      // Faire la requête
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de l\'export des données');
      }

      // Obtenir le blob (fichier)
      const blob = await response.blob();
      
      // Créer un lien de téléchargement
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Nom du fichier avec timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `temperature_data_${timestamp}.csv`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      // Message de succès
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      marginBottom: '20px',
      border: '1px solid #e0e0e0'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        gap: '10px'
      }}>
        <span style={{ fontSize: '28px' }}>📥</span>
        <h3 style={{ margin: 0, color: '#333', fontSize: '20px', fontWeight: '600' }}>
          Exporter les données
        </h3>
      </div>
      
      {/* Description */}
      <p style={{
        margin: '0 0 20px 0',
        color: '#666',
        fontSize: '14px',
        lineHeight: '1.6'
      }}>
        Téléchargez l'historique des températures au format CSV pour l'analyser dans Excel, 
        Google Sheets ou tout autre outil d'analyse de données.
      </p>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '15px'
      }}>
        {/* Sélecteur de limite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '200px' }}>
          <label htmlFor="exportLimit" style={{ 
            color: '#555', 
            fontSize: '14px',
            fontWeight: '500',
            whiteSpace: 'nowrap'
          }}>
            📊 Nombre de relevés :
          </label>
          <select
            id="exportLimit"
            value={exportLimit}
            onChange={(e) => setExportLimit(e.target.value)}
            disabled={loading}
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: loading ? '#f5f5f5' : '#fff',
              flex: '1',
              minWidth: '140px',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          >
            <option value="all">Tous les relevés</option>
            <option value="10">10 derniers</option>
            <option value="50">50 derniers</option>
            <option value="100">100 derniers</option>
            <option value="500">500 derniers</option>
            <option value="1000">1000 derniers</option>
          </select>
        </div>

        {/* Bouton d'export */}
        <button
          onClick={handleExport}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#ccc' : success ? '#4CAF50' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.3s',
            boxShadow: loading ? 'none' : '0 2px 6px rgba(0,0,0,0.15)',
            minWidth: '160px',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            if (!loading && !success) {
              e.currentTarget.style.backgroundColor = '#1976D2';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && !success) {
              e.currentTarget.style.backgroundColor = '#2196F3';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
            }
          }}
        >
          {loading ? (
            <>
              <span style={{ 
                display: 'inline-block',
                width: '16px',
                height: '16px',
                border: '2px solid #fff',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Export en cours...
            </>
          ) : success ? (
            <>
              ✅ Export réussi !
            </>
          ) : (
            <>
              📥 Exporter en CSV
            </>
          )}
        </button>
      </div>

      {/* Messages d'état */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#ffebee',
          borderLeft: '4px solid #f44336',
          borderRadius: '4px',
          marginTop: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>❌</span>
            <div>
              <strong style={{ color: '#c62828', fontSize: '14px' }}>Erreur d'export</strong>
              <p style={{ margin: '4px 0 0 0', color: '#d32f2f', fontSize: '13px' }}>
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#e8f5e9',
          borderLeft: '4px solid #4CAF50',
          borderRadius: '4px',
          marginTop: '15px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>✅</span>
            <div>
              <strong style={{ color: '#2e7d32', fontSize: '14px' }}>Export réussi !</strong>
              <p style={{ margin: '4px 0 0 0', color: '#388e3c', fontSize: '13px' }}>
                Le fichier CSV a été téléchargé avec succès.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info box */}
      <div style={{
        marginTop: '20px',
        padding: '14px',
        backgroundColor: '#f5f9ff',
        borderRadius: '8px',
        border: '1px solid #e3f2fd'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '18px', marginTop: '2px' }}>💡</span>
          <div>
            <strong style={{ color: '#1565c0', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
              Contenu du fichier CSV
            </strong>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: '#1976d2',
              lineHeight: '1.5'
            }}>
              Le fichier exporté contiendra : <strong>ID</strong>, <strong>Température (°C)</strong>, 
              <strong> Date/Heure</strong>, <strong>Latitude</strong>, <strong>Longitude</strong>, 
              et <strong>Device ID</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Animation CSS */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ExportButton;