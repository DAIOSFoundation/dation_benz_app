// src/components/PromptItemCard.jsx
import React from 'react';

function PromptItemCard({ prompt, onSelect, isSelected, calendarIcon, personIcon }) {
  return (
    <div
      className={`makeprompts-prompt-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(prompt.id)}
    >
      <h3>{prompt.title}</h3>
      <p>{prompt.promptDescription}</p> {/* 프롬프트 설명 표시 */}
      <div className="makeprompts-prompt-card-meta">
        <img src={calendarIcon} alt="Date" />
        <span>{prompt.date}</span>
        <img src={personIcon} alt="Author" />
        <span>{prompt.author}</span>
      </div>
    </div>
  );
}

export default PromptItemCard;