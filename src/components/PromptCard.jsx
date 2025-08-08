// src/components/PromptCard.jsx
import React from 'react';
import './PromptCard.css'; // CSS 임포트 확인
import CalendarIcon from '../assets/cal icon.png';

const PromptCard = ({ prompt, onClick, isSelected }) => {
  const handleClick = () => {
    onClick(prompt); // id 대신 prompt 객체 전체를 전달
  };

  return (
    <div
      className={`prompt-card ${isSelected ? 'selected' : ''}`} // <-- 'card' 클래스 제거
      onClick={handleClick}
    >
      <div className="prompt-card-header">
        <h3>{prompt.title}</h3>
        {prompt.category && (
          <span className={`prompt-category-label ${prompt.category.toLowerCase()}`}>
            {prompt.category}
          </span>
        )}
      </div>
      <p>{prompt.description}</p>
      <div className="prompt-card-footer">
        <div className="author">
          <div className="author-icon"></div>
          <span>{prompt.author}</span>
        </div>
        <div className="date-info">
          <img src={CalendarIcon} alt="date" className="date-icon" />
          <span>{prompt.date}</span>
        </div>
      </div>
    </div>
  );
}

export default PromptCard;