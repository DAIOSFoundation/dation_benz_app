import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import LeftSidebar from './LeftSidebar';
import TopHeader from './TopHeader';
import RightSidebar from './RightSidebar';
import InteractionPage from './InteractionPage';
import MakePromptsPage from './MakePromptsPage';
import { mockApi } from '../api/mockApi';
import { useLanguage } from '../contexts/LanguageContext';

// 날짜를 동적으로 생성하는 헬퍼 함수
const getRandomDate = () => {
  const start = new Date(2024, 0, 1);
  const end = new Date();
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

function AppContent() {
  // 다국어 지원
  const { t } = useLanguage();

  // 1. currentOperator 상태 선언
  const [currentOperator, setCurrentOperator] = useState(t('defaultOperator'));

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false); // 최초 로딩 시 닫힌 상태로 시작
  const [selectedLLM, setSelectedLLM] = useState(t('defaultLLM'));

  const [selectedMenu, setSelectedMenu] = useState('Interaction');
  const [savedChatSessions, setSavedChatSessions] = useState([]); // <-- 저장된 챗 세션 목록
  const [selectedSavedSessionId, setSelectedSavedSessionId] = useState(null); // <-- 현재 로드된 저장 세션 ID
  const [apiCallLogs, setApiCallLogs] = useState([]); // 새로운 상태: API 호출 로그
  const [lastLlmOutput, setLastLlmOutput] = useState(''); // NEW: 마지막 LLM 출력 내용 저장 (Explanation에서 변경)

  // 언어 변경 시 기본값들 업데이트
  useEffect(() => {
    setCurrentOperator(t('defaultOperator'));
    setSelectedLLM(t('defaultLLM'));
  }, [t]);

  // 앱 로드 시 localStorage에서 저장된 세션 불러오기
  useEffect(() => {
    // console.log('App: Attempting to load chat sessions on mount...');
    const loadSessions = async () => {
      // console.log('App: Calling mockApi.loadChatSessions...');
      const response = await mockApi.loadChatSessions(); // <-- 이 부분
      if (response.success) {
        setSavedChatSessions(response.data);
        // console.log('App: Successfully loaded chat sessions:', response.data.length, 'sessions.');
      } else {
        // console.error('App: Failed to load chat sessions:', response.message);
      }
    };
    loadSessions();
  }, []);

  // API 호출 로그를 추가하는 함수 (로그 ID 반환)
  const addApiCallLog = useCallback((type, message, similarity = null, sourceInfo = null, documentContent = null, fileUrl = null) => { // similarity, sourceInfo, documentContent, fileUrl 인자 추가
    // console.log(`App: Adding API call log - Type: ${type}, Message: ${message}`);
    let newLogId;
    setApiCallLogs(prevLogs => {
      newLogId = prevLogs.length > 0 ? Math.max(...prevLogs.map(log => log.id)) + 1 : 1;
      const newLog = {
        id: newLogId,
        type,
        message,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: 'active', // 새 로그는 'active' 상태로 시작
        ...(similarity !== null && { similarity }), // similarity가 제공되면 추가
        ...(sourceInfo && { sourceInfo }), // sourceInfo가 제공되면 추가
        ...(documentContent && { documentContent }), // NEW: documentContent가 제공되면 추가
        ...(fileUrl && { fileUrl }) // NEW: fileUrl이 제공되면 추가
      };

      const updatedLogs = [...prevLogs, newLog];

      // 'Source' 타입이 아닌 모든 로그는 3초 후 사라지도록 처리 (LLM 포함)
      if (type !== 'Source') { // MODIFIED: LLM 타입에 대한 예외 조건 제거
        setTimeout(() => {
          setApiCallLogs(currentLogs =>
            currentLogs.map(log =>
              log.id === newLogId ? { ...log, status: 'fading-out' } : log
            )
          );
          setTimeout(() => {
            setApiCallLogs(finalLogs =>
              finalLogs.filter(log => log.id !== newLogId)
            );
          }, 500); // CSS transition duration (0.5s)
        }, 3000); // 3초 지연 후 fade-out 시작
      }

      return updatedLogs;
    });
    return newLogId; // 생성된 로그의 ID 반환
  }, []);

  // 'Source' 타입 로그만 초기화하는 함수
  const clearSourceLogs = useCallback(() => {
    setApiCallLogs(prevLogs => prevLogs.filter(log => log.type !== 'Source'));
  }, []);

  // LLM 출력 변경 핸들러 (Explanation에서 변경)
  const handleLlmOutputChange = useCallback((newOutput) => {
    setLastLlmOutput(newOutput);
  }, []);

  // 메뉴 선택 핸들러
  const handleMenuSelect = (menuName) => {
    setSelectedMenu(menuName);
  };

  // 저장된 세션 선택 핸들러
  const handleSavedSessionSelect = (sessionId) => {
    setSelectedSavedSessionId(sessionId);
  };

  // 저장된 세션 삭제 핸들러
  const handleSavedSessionDelete = async (sessionId) => {
    const response = await mockApi.deleteChatSession(sessionId);
    if (response.success) {
      setSavedChatSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
      if (selectedSavedSessionId === sessionId) {
        setSelectedSavedSessionId(null);
      }
    }
  };

  // 저장된 세션 목록 (다국어 지원)
  const savedChatSessionsData = useMemo(() => ([
    {
      id: 'dealer-info',
      title: t('dealerInfoLookup'),
      description: t('dealerInfoLookupDesc'),
      example: t('dealerInfoLookupExample'),
      category: 'Dealer Management',
      author: 'Admin',
      date: getRandomDate(),
    },
    {
      id: 'vehicle-sales',
      title: t('vehicleSalesStatus'),
      description: t('vehicleSalesStatusDesc'),
      example: t('vehicleSalesStatusExample'),
      category: 'Sales Analytics',
      author: 'System',
      date: getRandomDate(),
    },

    {
      id: 'customer-waitlist',
      title: t('customerWaitlist'),
      description: t('customerWaitlistDesc'),
      example: t('customerWaitlistExample'),
      category: 'Customer Waitlist',
      author: 'System',
      date: getRandomDate(),
    },
    {
      id: 'vehicle-models',
      title: t('vehicleModelInfo'),
      description: t('vehicleModelInfoDesc'),
      example: t('vehicleModelInfoExample'),
      category: 'Vehicle Management',
      author: 'System',
      date: getRandomDate(),
    },
    {
      id: 'communication-hub',
      title: t('communicationHub'),
      description: t('communicationHubDesc'),
      example: t('communicationHubExample'),
      category: 'Communication Hub',
      author: 'System',
      date: getRandomDate(),
    }
  ]), [t]);

  return (
    <div className="app-container">
      <LeftSidebar
        isOpen={isLeftSidebarOpen}
        savedSessions={savedChatSessions}
        selectedSavedSessionId={selectedSavedSessionId}
        selectedMenu={selectedMenu}
        setSelectedMenu={handleMenuSelect}
      />

      <div className="main-content-area">
        <TopHeader
          toggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          isRightSidebarOpen={isRightSidebarOpen}
          toggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
          isLeftSidebarOpen={isLeftSidebarOpen}
          isInteractionPage={selectedMenu === 'Interaction'} // Interaction 페이지일 때
        />

        {selectedMenu === 'Interaction' && (
          <>
            <InteractionPage
              addApiCallLog={addApiCallLog}
              clearSourceLogs={clearSourceLogs} // clearSourceLogs prop 추가
              selectedLLM={selectedLLM}
              onLlmExplanationChange={handleLlmOutputChange} // NEW PROP: 이름 변경
              currentOperator={currentOperator}
            />
          </>
        )}
        {selectedMenu === 'Prompt Setting' && (
          <>
            <MakePromptsPage />
          </>
        )}
      </div>

      <RightSidebar
        isOpen={isRightSidebarOpen}
        toggleSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        apiCallLogs={apiCallLogs} // API 호출 로그 전달
        selectedMenu={selectedMenu} // selectedMenu prop 전달
        lastLlmOutput={lastLlmOutput} // NEW: 마지막 LLM 출력 내용 전달
      />
    </div>
  );
}

export default AppContent;
