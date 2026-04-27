import React from 'react';
import { Link } from 'react-router-dom';
import { CloudRain } from 'lucide-react';
import Card from './Card';

const ForecastCard = () => {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Forecast</p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">Next 5 days</h2>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--accent)]/15 text-[var(--accent)]">
          <CloudRain className="h-7 w-7" />
        </div>
      </div>
      <p className="mt-6 text-sm leading-6 text-[var(--text-secondary)]">
        Check detailed hourly temperature predictions for the next 5 days.
      </p>
      <div className="mt-8 text-right">
        <Link to="/forecast" className="font-semibold text-[var(--accent)] transition hover:text-[var(--accent)]">{'View forecast ->'}</Link>
      </div>
    </Card>
  );
};

export default ForecastCard;
