import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ className = '', children }) => {
  return (
    <div className={`rounded-[18px] border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-[0_4px_6px_rgba(0,0,0,0.08)] transition duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.12)] ${className}`}>
      {children}
    </div>
  );
};

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Card;
