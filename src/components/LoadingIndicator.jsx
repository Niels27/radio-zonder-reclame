import React from 'react';

const LoadingIndicator = ({ message = "Laden..." }) => {
  return (
    <div className="flex items-center justify-center space-x-3">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-radio-accent"></div>
      <span className="text-radio-secondary">{message}</span>
    </div>
  );
};

export default LoadingIndicator;
