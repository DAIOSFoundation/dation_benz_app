// src/components/LeftSidebar.jsx
import React from 'react';
import './LeftSidebar.css';
import MessageIcon from '../assets/Message.png';
import ElementsIcon from '../assets/elements.png';
import ReactIcon from '../assets/React.png';

// savedSessions, onLoadSession, selectedSavedSessionId prop을 받습니다.
function LeftSidebar({ isOpen, savedSessions, onLoadSession, selectedSavedSessionId, selectedMenu, setSelectedMenu }) {
  return (
    <div className={`left-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="main-menu">
        <div
          className={`menu-item ${selectedMenu === 'General' ? 'selected' : ''}`}
          onClick={() => setSelectedMenu('General')}
        >
          <img src={MessageIcon} alt="General" />
          <span>General</span>
        </div>
        <div
          className={`menu-item ${selectedMenu === 'Interaction' ? 'selected' : ''}`}
          onClick={() => setSelectedMenu('Interaction')}
        >
          <img src={ElementsIcon} alt="Interaction" />
          <span>Interaction</span>
        </div>
        <div
          className={`menu-item ${selectedMenu === 'Make Prompt' ? 'selected' : ''}`}
          onClick={() => setSelectedMenu('Make Prompt')}
        >
          <img src={ReactIcon} alt="Make Prompt" />
          <span>Make Prompt</span>
        </div>
      </nav>

      <div className="chat-history-section">
        <div className="chat-history-header">
          <span>CHAT HISTORY</span>
          <span className="dropdown-arrow">▼</span>
        </div>
        <ul className="chat-history-list">
          {/* savedSessions가 유효한 배열인지 확인 후 map 호출 */}
          {Array.isArray(savedSessions) && savedSessions.length > 0 ? (
            savedSessions.map((session) => (
              <li
                key={session.id}
                className={`chat-history-item ${session.id === selectedSavedSessionId ? 'selected' : ''}`}
                onClick={() => onLoadSession(session)}
              >
                {/* <img src={CalIcon} alt="Date" className="chat-history-icon" /> */}
                {session.timestamp}
              </li>
            ))
          ) : (
            <li className="chat-history-item no-sessions">저장된 대화가 없습니다.</li> // 저장된 세션이 없을 때 메시지
          )}
        </ul>
      </div>
    </div>
  );
}

export default LeftSidebar;