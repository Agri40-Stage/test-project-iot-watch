import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet } from 'lucide-react';
import Card from './Card';

const HumidityCard = ({ time, humidity }) => {
  const formattedHumidity = humidity && !isNaN(humidity) ? parseFloat(humidity).toFixed(1) : 'N/A';
  const lastUpdated = time ? new Date(time).toLocaleTimeString() : '...';

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Current humidity</p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">{formattedHumidity}%</h2>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--accent)]/15 text-[var(--accent)]">
          <Droplet className="h-7 w-7" />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between text-sm text-[var(--text-secondary)]">
        <span>Last updated: {lastUpdated}</span>
        <Link to="/humidity" className="font-semibold text-[var(--accent)] transition hover:text-[var(--accent)]">{'View more ->'}</Link>
      </div>
    </Card>
  );
};

export default HumidityCard;
