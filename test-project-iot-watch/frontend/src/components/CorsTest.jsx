import React, { useState } from 'react';

/**
 * CORS Test Component
 * 
 * Simple component to test if CORS is working properly between
 * frontend and backend. This helps debug any CORS-related issues.
 */
const CorsTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testCors = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      console.log('Testing CORS with /api/test-cors...');
      
      const response = await fetch('/api/test-cors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        setTestResult(data);
        console.log('CORS test successful:', data);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('CORS test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testWeatherApi = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      console.log('Testing weather API...');
      
      const response = await fetch('/api/weather');
      console.log('Weather API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        setTestResult(data);
        console.log('Weather API test successful:', data);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Weather API test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">CORS Test</h3>
      
      <div className="space-y-3">
        <button
          onClick={testCors}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test CORS Endpoint'}
        </button>
        
        <button
          onClick={testWeatherApi}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Weather API'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {testResult && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <strong>Success!</strong>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CorsTest; 