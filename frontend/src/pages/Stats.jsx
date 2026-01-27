// frontend/src/pages/Stats.jsx
import React from 'react';

/* Components */
import Header from '../components/Header';
import TemperatureStats from '../components/TemperatureStats/TemperatureStats';

function Stats() {
    return (
        <div className="w-screen max-w-screen min-h-screen bg-zinc-50">
            <Header />
            <TemperatureStats />
        </div>
    );
}

export default Stats;