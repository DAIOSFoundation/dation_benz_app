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
          className={`menu-item ${selectedMenu === 'Dealer Management' ? 'selected' : ''}`}
          onClick={() => setSelectedMenu('Dealer Management')}
        >
          <img src={MessageIcon} alt="Dealer Management" />
          <span>딜러 관리</span>
        </div>
        <div
          className={`menu-item ${selectedMenu === 'Vehicle Management' ? 'selected' : ''}`}
          onClick={() => setSelectedMenu('Vehicle Management')}
        >
          <img src={ElementsIcon} alt="Vehicle Management" />
          <span>차량 관리</span>
        </div>
        <div
          className={`menu-item ${selectedMenu === 'Sales Analytics' ? 'selected' : ''}`}
          onClick={() => setSelectedMenu('Sales Analytics')}
        >
          <img src={ReactIcon} alt="Sales Analytics" />
          <span>판매 현황</span>
        </div>
        <div
          className={`menu-item ${selectedMenu === 'Production Status' ? 'selected' : ''}`}
          onClick={() => setSelectedMenu('Production Status')}
        >
          <img src={MessageIcon} alt="Production Status" />
          <span>생산 현황</span>
        </div>
        <div
          className={`menu-item ${selectedMenu === 'Customer Waitlist' ? 'selected' : ''}`}
          onClick={() => setSelectedMenu('Customer Waitlist')}
        >
          <img src={ElementsIcon} alt="Customer Waitlist" />
          <span>고객 대기</span>
        </div>
        <div
          className={`menu-item ${selectedMenu === 'Communication Hub' ? 'selected' : ''}`}
          onClick={() => setSelectedMenu('Communication Hub')}
        >
          <img src={ReactIcon} alt="Communication Hub" />
          <span>커뮤니케이션</span>
        </div>
      </nav>

      <div className="chat-history-section">
        <div className="chat-history-header">
          <span>대화 기록</span>
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