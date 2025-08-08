import React from 'react';
import './PromptExamplesPopup.css';
import CloseIcon from '../assets/close.png';

const PromptExamplesPopup = ({ title, examples, onClose }) => {
  if (!examples) return null;

  // ESC 키로 팝업 닫기
  React.useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>{title} - 사용 예시</h2>
          <button onClick={onClose} className="popup-close-btn">
            <img src={CloseIcon} alt="Close" />
          </button>
        </div>
        <div className="popup-body">
          <pre>{examples}</pre>
        </div>
      </div>
    </div>
  );
};

export default PromptExamplesPopup; 