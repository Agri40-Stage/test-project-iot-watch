import React from 'react';
import PropTypes from 'prop-types';
// i made this component to help the user to choose the best clothing for the weather
// i used the temperature in Celsius degrees to suggest the best clothing
// i used the following temperature ranges:
// 1. very cold weather: temperature < 5
// 2. cold weather: temperature < 10
// 3. cool weather: temperature < 15
// 4. mild weather: temperature < 20

const getClothingSuggestion = (temperature) => {
  if (temperature === null) return null;


  if (temperature < 5) {
    return {
      title: "Very Cold Weather",
      suggestions: [
        "Heavy winter coat",
        "Thermal underwear",
        "Wool sweater",
        "Winter boots",
        "Gloves and scarf",
        "Warm hat"
      ]
    };
  } else if (temperature < 10) {
    return {
      title: "Cold Weather",
      suggestions: [
        "Winter coat or heavy jacket",
        "Sweater or fleece",
        "Long pants",
        "Closed-toe shoes",
        "Light gloves"
      ]
    };
  } else if (temperature < 15) {
    return {
      title: "Cool Weather",
      suggestions: [
        "Light jacket or coat",
        "Long-sleeve shirt",
        "Long pants",
        "Closed-toe shoes",
        "Light scarf (optional)"
      ]
    };
  } else if (temperature < 20) {
    return {
      title: "Mild Weather",
      suggestions: [
        "Light sweater or cardigan",
        "Long-sleeve shirt",
        "Long pants",
        "Comfortable shoes"
      ]
    };
  } else if (temperature < 25) {
    return {
      title: "Pleasant Weather",
      suggestions: [
        "Light long-sleeve shirt",
        "Light pants or jeans",
        "Comfortable shoes",
        "Light jacket (optional)"
      ]
    };
  } else if (temperature < 30) {
    return {
      title: "Warm Weather",
      suggestions: [
        "Short-sleeve shirt",
        "Light pants or shorts",
        "Comfortable shoes",
        "Sunglasses"
      ]
    };
  } else {
    return {
      title: "Hot Weather",
      suggestions: [
        "Light, breathable short-sleeve shirt",
        "Shorts or light pants",
        "Sandals or breathable shoes",
        "Sunglasses",
        "Hat for sun protection"
      ]
    };
  }
};

const ClothingSuggestion = ({ temperature }) => {
  const suggestion = getClothingSuggestion(temperature);

  if (!suggestion) {
    return (
      <div className="flex flex-col gap-6 max-w-96 py-8 px-6 rounded-xl border-[0.5px] border-gray-300">
        <div className="flex flex-col gap-2 text-left">
          <h2 className="text-xl font-medium leading-none">Clothing Suggestions</h2>
          <p className="font-light text-gray-400 text-base leading-none">Waiting for temperature data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-96 py-8 px-6 rounded-xl border-[0.5px] border-gray-300">
      <div className="flex flex-col gap-2 text-left">
        <h2 className="text-xl font-medium leading-none">Clothing Suggestions</h2>
        <p className="font-light text-gray-400 text-base leading-none">{suggestion.title}</p>
      </div>

      <div className="flex flex-col gap-3">
        {suggestion.suggestions.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

ClothingSuggestion.propTypes = {
  temperature: PropTypes.number
};

export default ClothingSuggestion; 