// src/components/TopHeader.jsx
import React from 'react';
import './TopHeader.css';
import SidebarLeftIcon from '../assets/Sidebar Left.png';
import SidebarRightIcon from '../assets/Sidebar Right.png';
import TonyProfileIcon from '../assets/tony_ilsan.png';

// NEW PROPS: isInteractionPage, onDeployApp, onSaveChat, chatHistory
function TopHeader({ toggleRightSidebar, isRightSidebarOpen, toggleLeftSidebar, isLeftSidebarOpen, onNewChat, isInteractionPage, onDeployApp, onSaveChat, chatHistory }) {
  // 현재 날짜 표시
  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="top-header">
      <div className="header-left">
        <img
          src={SidebarLeftIcon}
          alt="Toggle Left Sidebar"
          className={`icon-button ${isLeftSidebarOpen ? 'rotate-open' : 'rotate-closed'}`}
          onClick={toggleLeftSidebar}
          title="Toggle Left Sidebar"
        />
        <span className="playground-text">Benz Global Management</span>
      </div>

      <div className="header-center">
        <div className="current-dealer-info">
          <span className="dealer-label">현재 위치:</span>
          <span className="dealer-name">독일 본사 (Mercedes-Benz Headquarters)</span>
          <span className="date-info">{currentDate}</span>
        </div>
      </div>

      <div className="header-right">
        {isInteractionPage ? (
          <button className="new-chat-button" onClick={onDeployApp}>시스템 배포</button>
        ) : (
          <>
            <button className="save-chat-button" onClick={() => onSaveChat(chatHistory)}>대화 저장</button>
            <button className="new-chat-button" onClick={onNewChat}>+ 새 대화</button>
          </>
        )}
        <div className="user-profile">
          <img src={TonyProfileIcon} alt="User Profile" className="profile-image" />
          <span className="username">Dr. Hans Mueller</span>
        </div>
        {!isRightSidebarOpen && (
          <img
            src={SidebarRightIcon}
            alt="Toggle Right Sidebar"
            className="icon-button"
            onClick={toggleRightSidebar}
            title="Toggle Right Sidebar"
          />
        )}
      </div>
    </header>
  );
}

export default TopHeader;
