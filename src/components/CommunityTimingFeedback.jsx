// components/CommunityTimingFeedback.jsx - Feedback popup for community timing accuracy

import React, { useState, useEffect } from 'react';
import CommunityTimings from '../utils/communityTimings';

const CommunityTimingFeedback = ({ 
  isVisible, 
  onClose, 
  stationName, 
  timingType = 'auto-switch' 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setHasSubmitted(false);
      setIsSubmitting(false);
    }
  }, [isVisible]);

  const handleFeedback = async (rating) => {
    if (isSubmitting || hasSubmitted) return;
    
    setIsSubmitting(true);
    
    try {
      await CommunityTimings.submitFeedback(stationName, timingType, rating);
      setHasSubmitted(true);
      
      // Auto-close after 1.5 seconds
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-600">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Timing Feedback
          </h3>
          
          <p className="text-gray-300 mb-4">
            Hoe accuraat was de automatische wissel voor <strong>{stationName}</strong>?
          </p>
          
          {hasSubmitted ? (
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <span>Bedankt voor je feedback!</span>
            </div>
          ) : (
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => handleFeedback('too_early')}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
                <span>Te vroeg</span>
              </button>
              
              <button
                onClick={() => handleFeedback('perfect')}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Perfect</span>
              </button>
              
              <button
                onClick={() => handleFeedback('too_late')}
                disabled={isSubmitting}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
                <span>Te laat</span>
              </button>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityTimingFeedback;
