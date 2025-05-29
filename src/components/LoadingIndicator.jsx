import React from 'react';

const LoadingIndicator = ({ message = "Laden...", progress = null }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-radio-accent"></div>
        <span className="text-radio-secondary">{message}</span>
      </div>
      {progress && (
        <div className="text-sm text-radio-accent bg-radio-accent/10 px-3 py-1 rounded-full">
          {progress}
        </div>
      )}
    </div>
  );
};

export default LoadingIndicator;
