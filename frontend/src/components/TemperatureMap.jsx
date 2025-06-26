import React, { useEffect, useState } from 'react';
import fetchLatestTemperature from '../api/latest';

const TemperatureMap = () => {
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Convert coordinates to location name using reverse geocoding
  const getLocationName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.display_name) {
        const parts = data.display_name.split(', ');
        const city = parts[0];
        const country = parts[parts.length - 1];
        return `${city}, ${country}`;
      }
      return 'Unknown Location';
    } catch (err) {
      return 'Unknown Location';
    }
  };

  // Fetch location data and convert coordinates to location name
  const fetchLocationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get coordinates from backend
      const data = await fetchLatestTemperature();
      const lat = typeof data?.latitude === 'string' ? parseFloat(data.latitude) : data?.latitude;
      const lng = typeof data?.longitude === 'string' ? parseFloat(data.longitude) : data?.longitude;
      
      if (data && lat && lng && !isNaN(lat) && !isNaN(lng)) {
        // Convert coordinates to location name
        const name = await getLocationName(lat, lng);
        setLocationName(name);
      } else {
        setLocationName('');
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLocationName('');
      setLoading(false);
      // Retry after 2 seconds if fetch fails
      setTimeout(fetchLocationData, 2000);
    }
  };

  useEffect(() => {
    // Delay initial fetch to ensure backend is ready
    const timer = setTimeout(fetchLocationData, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[400px] rounded-xl overflow-hidden border border-gray-300 shadow flex items-center justify-center text-gray-500">
        Loading location...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] rounded-xl overflow-hidden border border-gray-300 shadow flex items-center justify-center text-red-500">
        <div className="text-center">
          <div>Error loading location</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!locationName) {
    return (
      <div className="w-full h-[400px] rounded-xl overflow-hidden border border-gray-300 shadow flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div>No location data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-gray-300 shadow bg-white">
      <div className="flex flex-col justify-center items-center h-full p-6">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-12 h-12 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-white">Location</h3>
          </div>
          
          <div className="text-xl font-medium text-white">
            {locationName}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemperatureMap; 