import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, Thermometer } from 'lucide-react';
import Card from './Card';

const TemperatureCrad = ({ time, temperature, trend }) => {
  const isValidTemperature = temperature !== null && temperature !== undefined && !Number.isNaN(Number(temperature));
  const formattedTemperature = isValidTemperature ? parseFloat(temperature).toFixed(1) : 'N/A';

  const parsedTime = time ? new Date(time) : null;
  const lastUpdated = parsedTime && !Number.isNaN(parsedTime.getTime()) ? parsedTime.toLocaleTimeString() : '...';

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Current temperature</p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">
            {isValidTemperature ? `${formattedTemperature}\u00B0C` : formattedTemperature}
          </h2>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--accent)]/15 text-[var(--accent)]">
          <Thermometer className="h-7 w-7" />
        </div>
      </div>

      {trend && trend !== 'stable' && (
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--bg-secondary)] px-4 py-2 text-sm text-[var(--text-secondary)] dark:bg-[var(--bg-primary)]">
          {trend === 'up' ? <ArrowUp className="h-4 w-4 text-[var(--accent)]" /> : <ArrowDown className="h-4 w-4 text-[var(--accent)]" />}
          <span>{trend === 'up' ? 'Rising trend' : 'Falling trend'}</span>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between text-sm text-[var(--text-secondary)]">
        <span>Last updated</span>
        <Link to="/temperature" className="font-semibold text-[var(--accent)] transition hover:text-[var(--accent)]">Voir plus &rarr;</Link>
      </div>
    </Card>
  );
};

TemperatureCrad.propTypes = {
  time: PropTypes.string,
  temperature: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  trend: PropTypes.oneOf(['up', 'down', 'stable']),
};

export default TemperatureCrad;
