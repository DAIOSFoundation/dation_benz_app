// src/App.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './App.css';
import LeftSidebar from './components/LeftSidebar';
import TopHeader from './components/TopHeader';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import InteractionPage from './components/InteractionPage';
import MakePromptsPage from './components/MakePromptsPage';
import { mockApi } from './api/mockApi';

// 날짜를 동적으로 생성하는 헬퍼 함수
const getRandomDate = () => {
  const start = new Date(2024, 0, 1);
  const end = new Date();
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

function App() {
  // Debug: App 컴포넌트 렌더링 확인 - 초기 진입점
  // console.log('App component initiated.');

  // 1. currentOperator 상태 선언
  const [currentOperator, setCurrentOperator] = useState('작업자_홍길동');

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true); // General 페이지에서 기본적으로 열려있도록 true로 변경
  const [selectedLLM, setSelectedLLM] = useState('Banya Gemma 27B Tuned');
  const [chatHistory, setChatHistory] = useState([]); // MainContent의 현재 대화 내용
  const [currentPromptInput, setCurrentPromptInput] = useState('');
  const [selectedMenu, setSelectedMenu] = useState('Dealer Management');
  const [savedChatSessions, setSavedChatSessions] = useState([]); // <-- 저장된 챗 세션 목록
  const [selectedSavedSessionId, setSelectedSavedSessionId] = useState(null); // <-- 현재 로드된 저장 세션 ID
  const [apiCallLogs, setApiCallLogs] = useState([]); // 새로운 상태: API 호출 로그
  const [lastLlmOutput, setLastLlmOutput] = useState(''); // NEW: 마지막 LLM 출력 내용 저장 (Explanation에서 변경)

  // Debug: selectedMenu 상태 변화 확인
  // useEffect(() => {
  //   console.log('App: selectedMenu changed to:', selectedMenu);
  // }, [selectedMenu]);

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
    // console.log('App: Clearing source logs.');
    setApiCallLogs(prevLogs => prevLogs.filter(log => log.type !== 'Source'));
  }, []);

  // LLM 설명 변경 핸들러 -> LLM 출력 내용 변경 핸들러로 변경
  const handleLlmOutputChange = useCallback((output) => {
    // console.log('App: LLM output changed.');
    setLastLlmOutput(output);
  }, []);

  // --- 챗 세션 저장 함수 ---
  const handleSaveChat = async (currentChatHistoryToSave) => {
    // console.log('App: Attempting to save chat session.');
    if (currentChatHistoryToSave.length === 0) {
      alert("현재 대화 내용이 없습니다. 저장할 내용이 없습니다.");
      return;
    }
    const newSession = {
      id: `session-${Date.now()}`,
      timestamp: new Date().toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      messages: currentChatHistoryToSave, // 현재 MainContent의 chatHistory 통째로 저장
    };

    const response = await mockApi.saveChatSession(newSession); // <-- 이 부분
    if (response.success) {
      setSavedChatSessions(prev => [newSession, ...prev]); // 최신 세션이 맨 위로 오도록 unshift
      alert(response.message);
      setSelectedSavedSessionId(newSession.id); // 저장된 세션이 선택되도록
    } else {
      alert("대화 저장 실패: " + response.message);
    }
  };

  // --- 저장된 챗 세션 불러오기 함수 ---
  const handleLoadChatSession = (sessionToLoad) => {
    // console.log('App: Loading chat session:', sessionToLoad.id);
    setChatHistory(sessionToLoad.messages); // MainContent의 chatHistory를 선택된 세션으로 업데이트
    setCurrentPromptInput(''); // 입력창도 초기화
    setSelectedSavedSessionId(sessionToLoad.id); // 선택된 세션 ID 업데이트
    setSelectedMenu('General'); // General 페이지로 이동
    clearSourceLogs(); // 새 세션 로드 시 출처 로그 초기화
    setLastLlmOutput(''); // NEW: 새 세션 로드 시 LLM 출력 초기화
    alert(`대화 불러오기 완료: ${sessionToLoad.timestamp}`);
  };

  // --- 새 채팅 시작 함수 ---
  const handleNewChat = () => {
    // console.log('App: Starting new chat.');
    if (chatHistory.length > 0 && !confirm("현재 대화 내용을 저장하지 않으면 사라집니다. 새 채팅을 시작하시겠습니까?")) {
      return; // 사용자가 취소하면 아무것도 하지 않음
    }
    setChatHistory([]); // 현재 대화 내용 초기화
    setCurrentPromptInput(''); // 입력창도 초기화
    setSelectedSavedSessionId(null); // 선택된 저장 세션 해제
    setSelectedMenu('General'); // General 페이지로 이동 (확실히 General로 이동)
    setLastLlmOutput(''); // NEW: 새 채팅 시작 시 LLM 출력 초기화
    clearSourceLogs(); // 새 채팅 시작 시 출처 로그 초기화
  };

  // --- Deploy App 함수 ---
  const handleDeployApp = useCallback(() => {
    // console.log('App: Deploying app.');
    const appContent = lastLlmOutput // lastLlmExplanation 대신 lastLlmOutput 사용
      ? `<p><strong>LLM Agent Process:</strong> ${lastLlmOutput}</p><p>This application is now deployed!</p><p>Further interactive elements would appear here in a real deployment.</p>`
      : `<p>No specific application content to deploy yet. Please interact with the LLM first.</p>`;

    // Electron 환경에서 window.electronAPI를 통해 메인 프로세스에 새 윈도우 생성을 요청
    if (window.electronAPI) {
      window.electronAPI.openDeployWindow(appContent, new Date().toLocaleString());
    } else {
      // 웹 브라우저 환경을 위한 폴백 (Electron 앱에서는 이 경로가 실행되지 않음)
      const newWindow = window.open('', '_blank', 'width=800,height=600');
      if (!newWindow) {
        alert('팝업 차단이 활성화되어 있습니다. 팝업을 허용해주세요.');
        return;
      }

      newWindow.document.write(`
        <html>
          <head>
            <title>Deployed App</title>
            <style>
              body { font-family: 'Inter', sans-serif; margin: 20px; background-color: #f0f2f5; color: #333; }
              h1 { color: #007bff; }
              p { line-height: 1.6; }
              strong { color: #0056b3; }
            </style>
          </head>
          <body>
            <h1>App Deployment Simulation</h1>
            ${appContent}
            <p>Deployment Time: ${new Date().toLocaleString()}</p>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  }, [lastLlmOutput]);


  // 메뉴 선택 핸들러: 딜러 관리 메뉴 선택 시 RightSidebar를 엽니다.
  const handleMenuSelect = (menuName) => {
    // console.log('App: Menu selected:', menuName); // Debug: 메뉴 선택 확인
    setSelectedMenu(menuName);
    if (menuName === 'Dealer Management' || menuName === 'Vehicle Management' || menuName === 'Sales Analytics') { // 딜러 관련 페이지에서 사이드바 열림
      setIsRightSidebarOpen(true);
    }
    // 메뉴 변경 시 Source 로그 초기화
    clearSourceLogs();
    setLastLlmOutput(''); // NEW: 메뉴 변경 시 LLM 출력 초기화
  };


  const promptsTemplates = useMemo(() => ([
    {
      id: 'dealer-management',
      title: '딜러 관리 시스템',
      description: '한국 내 벤츠 딜러사들의 정보를 조회하고 관리할 수 있습니다.',
      example: '한성자동차 딜러 정보 보여줘\n효성더클래스 연락처 알려줘\nKCC오토 담당자 정보 조회',
      category: 'Dealer Management',
      author: 'Admin',
      date: getRandomDate(),
    },
    {
      id: 'vehicle-sales',
      title: '차량 판매 현황',
      description: '딜러별 차량 판매 실적과 VIN 정보를 조회할 수 있습니다.',
      example: '한성자동차 7월 판매 현황 보여줘\nE-Class 판매 통계 조회\nVIN001HANSUNG 차량 정보 찾아줘',
      category: 'Sales Analytics',
      author: 'System',
      date: getRandomDate(),
    },
    {
      id: 'production-status',
      title: '생산 및 배정 현황',
      description: '독일 본사의 차량 생산 현황과 한국 배정 계획을 확인할 수 있습니다.',
      example: 'E-Class 생산 현황 보여줘\n한국 배정 계획 조회\nGLC 생산 일정 확인',
      category: 'Production Status',
      author: 'System',
      date: getRandomDate(),
    },
    {
      id: 'customer-waitlist',
      title: '고객 대기 명단',
      description: '특정 차량 모델을 구매 대기 중인 고객들의 정보를 관리합니다.',
      example: 'EQS 대기 고객 목록 보여줘\nS-Class 대기 순번 조회\n고객 대기 현황 통계',
      category: 'Customer Waitlist',
      author: 'System',
      date: getRandomDate(),
    },
    {
      id: 'vehicle-models',
      title: '차량 모델 정보',
      description: '벤츠의 각 차량 모델에 대한 상세 정보를 조회할 수 있습니다.',
      example: 'E-Class (W214) 사양 보여줘\n전기차 모델 목록 조회\nSUV 모델 가격 정보',
      category: 'Vehicle Management',
      author: 'System',
      date: getRandomDate(),
    },
    {
      id: 'communication-hub',
      title: '본사-딜러 커뮤니케이션',
      description: '독일 본사와 한국 딜러 간의 실시간 소통을 지원합니다.',
      example: '본사에 생산 일정 문의\n딜러별 판매 실적 보고서 전송\n차량 배정 요청서 작성',
      category: 'Communication Hub',
      author: 'System',
      date: getRandomDate(),
    }
  ]), []);

  // console.log('App: About to render JSX structure.'); // Debug: JSX 렌더링 직전 확인

  return (
    <div className="app-container">
      {/* {console.log('App: JSX structure is being processed for rendering.')} */}
      <LeftSidebar
        isOpen={isLeftSidebarOpen}
        savedSessions={savedChatSessions}
        onLoadSession={handleLoadChatSession}
        selectedSavedSessionId={selectedSavedSessionId}
        selectedMenu={selectedMenu}
        setSelectedMenu={handleMenuSelect}
      />

      <div className="main-content-area">
        <TopHeader
          selectedLLM={selectedLLM}
          setSelectedLLM={setSelectedLLM}
          toggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          isRightSidebarOpen={isRightSidebarOpen}
          toggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
          isLeftSidebarOpen={isLeftSidebarOpen}
          onNewChat={handleNewChat}
          isInteractionPage={selectedMenu === 'Production Status'} // NEW PROP
          onDeployApp={handleDeployApp} // NEW PROP
          onSaveChat={handleSaveChat}
          chatHistory={chatHistory}
          currentOperator={currentOperator}
        />
        {selectedMenu === 'General' && (
          <>
            {/* {console.log('App: MainContent component selected for rendering.')} */}
            <MainContent
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              currentPromptInput={currentPromptInput}
              setCurrentPromptInput={setCurrentPromptInput}
              promptsTemplates={promptsTemplates}
              handleSaveChat={handleSaveChat}
              addApiCallLog={addApiCallLog} // addApiCallLog prop 추가
              clearSourceLogs={clearSourceLogs} // clearSourceLogs prop 추가
              // updateApiCallLog={updateApiCallLog} // REMOVED: LLM 카드 자동 사라짐 로직으로 인해 필요 없음
              setLastLlmOutput={handleLlmOutputChange} // NEW: LLM 출력 설정 함수 전달
            />
          </>
        )}
        {selectedMenu === 'Interaction' && (
          <>
            {/* {console.log('App: InteractionPage component selected for rendering.')} */}
            <InteractionPage
              addApiCallLog={addApiCallLog}
              clearSourceLogs={clearSourceLogs} // clearSourceLogs prop 추가
              selectedLLM={selectedLLM}
              onLlmExplanationChange={handleLlmOutputChange} // NEW PROP: 이름 변경
              currentOperator={currentOperator}
            />
          </>
        )}
        {selectedMenu === 'Make Prompt' && (
          <>
            {/* {console.log('App: MakePromptsPage component selected for rendering.')} */}
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

export default App;