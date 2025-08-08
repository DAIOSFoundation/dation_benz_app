// src/components/TopHeader.jsx
import React from 'react';
import './TopHeader.css';
import SidebarLeftIcon from '../assets/Sidebar Left.png';
import SidebarRightIcon from '../assets/Sidebar Right.png';
import TonyProfileIcon from '../assets/tony_ilsan.png';

// NEW PROPS: isInteractionPage, onDeployApp, onSaveChat, chatHistory
function TopHeader({ selectedLLM, setSelectedLLM, toggleRightSidebar, isRightSidebarOpen, toggleLeftSidebar, isLeftSidebarOpen, onNewChat, isInteractionPage, onDeployApp, onSaveChat, chatHistory }) {
  const llmModels = [
    'Banya Gemma 27B Tuned',
    'Banya Code 8B Tuned',
  ];

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
        <span className="playground-text">Playground</span>
        <select
          value={selectedLLM}
          onChange={(e) => setSelectedLLM(e.target.value)}
          className="llm-select-box"
        >
          {llmModels.map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>

      <div className="header-right">
        {isInteractionPage ? (
          <button className="new-chat-button" onClick={onDeployApp}>Deploy app</button>
        ) : (
          <>
            <button className="save-chat-button" onClick={() => onSaveChat(chatHistory)}>Save Chat</button>
            <button className="new-chat-button" onClick={onNewChat}>+ New chat</button>
          </>
        )}
        <div className="user-profile">
          <img src={TonyProfileIcon} alt="User Profile" className="profile-image" />
          <span className="username">tony</span>
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
