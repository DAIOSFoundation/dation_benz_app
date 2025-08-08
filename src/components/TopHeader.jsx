// src/components/TopHeader.jsx
import React from 'react';
import './TopHeader.css';
import SidebarLeftIcon from '../assets/Sidebar Left.png';
import SidebarRightIcon from '../assets/Sidebar Right.png';
import TonyProfileIcon from '../assets/tony_ilsan.png';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';

// PROPS: isInteractionPage
function TopHeader({ toggleRightSidebar, isRightSidebarOpen, toggleLeftSidebar, isLeftSidebarOpen, isInteractionPage }) {
  const { t, currentLanguage } = useLanguage();
  
  // 현재 날짜 표시 (언어에 따라 변경)
  const currentDate = new Date().toLocaleDateString(currentLanguage === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="top-header">
      <div className="header-left">
        <img
          src={SidebarLeftIcon}
          alt={t('toggleLeftSidebar')}
          className={`icon-button ${isLeftSidebarOpen ? 'rotate-open' : 'rotate-closed'}`}
          onClick={toggleLeftSidebar}
          title={t('toggleLeftSidebar')}
        />
        <div className="current-dealer-info">
          <span className="dealer-label">{t('currentLocation')}</span>
          <span className="dealer-name">{t('dealerName')}</span>
          <span className="date-info">{currentDate}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="user-profile">
          <img src={TonyProfileIcon} alt="User Profile" className="profile-image" />
          <span className="username">Dr. Hans Mueller</span>
        </div>
        <LanguageToggle />
        {!isRightSidebarOpen && (
          <img
            src={SidebarRightIcon}
            alt={t('toggleRightSidebar')}
            className="icon-button"
            onClick={toggleRightSidebar}
            title={t('toggleRightSidebar')}
          />
        )}
      </div>
    </header>
  );
}

export default TopHeader;
