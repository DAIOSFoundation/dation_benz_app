import React from 'react';
import './LoadingAnimation.css';

const LoadingAnimation = ({ message = "Waiting for LLM response" }) => {
  return (
    <div className="loading-animation-container">
      <div className="loading-text">
        {message}
        <span className="loading-dots">
          <span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </span>
      </div>
    </div>
  );
};

export default LoadingAnimation;
