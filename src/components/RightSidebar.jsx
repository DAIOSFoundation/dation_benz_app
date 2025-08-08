// src/components/RightSidebar.jsx
import React, { useMemo } from 'react';
import './RightSidebar.css';
import SidebarRightIcon from '../assets/Sidebar Right.png'; // 닫기 아이콘 임포트
import { calculateSimilarity } from '../utils/textSimilarity'; // NEW

// toggleSidebar prop을 추가
// selectedMenu prop을 추가
// lastLlmOutput prop을 추가
function RightSidebar({ isOpen, toggleSidebar, apiCallLogs, selectedMenu, lastLlmOutput }) { // NEW: lastLlmOutput prop
  const processedLogs = useMemo(() => {
    const sourceLogs = []; // Source 타입 로그를 별도로 수집
    const filteredNonSourceLogs = []; // Non-Source 타입 로그를 필터링하여 저장
    let latestDataAnalysisCard = null; // 가장 최신의 "관련 Data 를 분석 중입니다." 로그를 추적
    let dataRenderingCompleteObserved = false; // "데이터 렌더링 완료" 로그가 관찰되었는지 여부

    // apiCallLogs를 역순으로 순회하며 최신 상태를 파악
    for (let i = apiCallLogs.length - 1; i >= 0; i--) {
        const log = apiCallLogs[i];
        if (log.type === 'Source') {
            sourceLogs.unshift(log); // Source 로그는 순서 유지를 위해 unshift
        } else if (log.type === 'Data') {
            if (log.message.includes('렌더링 완료') && log.message.startsWith('데이터 렌더링 완료')) {
                // "렌더링 완료" 로그가 발견되면, 이를 추가하고 데이터 렌더링이 완료되었음을 표시
                filteredNonSourceLogs.unshift(log);
                dataRenderingCompleteObserved = true;
                latestDataAnalysisCard = null; // 현재 분석 중이던 로그는 더 이상 유효하지 않으므로 초기화
            } else if (log.message.includes('분석 중입니다.') && log.message.startsWith('관련 Data')) {
                // "분석 중입니다." 로그가 발견되면, 아직 "렌더링 완료"가 관찰되지 않았고,
                // 이전에 더 최신 "분석 중입니다." 로그를 저장하지 않았다면 이 로그를 저장
                if (!dataRenderingCompleteObserved && !latestDataAnalysisCard) {
                    latestDataAnalysisCard = log;
                }
            } else {
                // 그 외 Data 로그 (현재는 없음)
                filteredNonSourceLogs.unshift(log);
            }
        } else {
            // LLM 및 API 로그는 그대로 추가
            filteredNonSourceLogs.unshift(log);
        }
    }

    // 역순 순회 후, `latestDataAnalysisCard`가 남아있고 `dataRenderingCompleteObserved`가 false라면 (즉, 분석이 아직 완료되지 않았다면)
    // 이 로그를 `filteredNonSourceLogs`의 맨 앞에 추가하여 표시
    if (latestDataAnalysisCard && !dataRenderingCompleteObserved) {
        filteredNonSourceLogs.unshift(latestDataAnalysisCard);
    }
    
    // NEW: Source 로그에 LLM 출력 내용과의 유사도 계산하여 추가
    let updatedSourceLogs = sourceLogs.map(log => {
      if (log.type === 'Source' && lastLlmOutput && log.documentContent) {
        const llmContentSimilarity = calculateSimilarity(lastLlmOutput, log.documentContent);
        return { ...log, llmContentSimilarity: llmContentSimilarity };
      }
      return log;
    });

    // NEW: LLM 연관성(llmContentSimilarity)이 계산된 Source 로그만 필터링 (0% 초과)
    updatedSourceLogs = updatedSourceLogs.filter(log => 
        log.type !== 'Source' || (log.type === 'Source' && log.llmContentSimilarity !== undefined && parseFloat(log.llmContentSimilarity) > 0)
    );

    // 3. Source 로그를 LLM 연관성(llmContentSimilarity) 기준으로 내림차순 정렬
    updatedSourceLogs.sort((a, b) => {
        const scoreA = parseFloat(a.llmContentSimilarity !== undefined ? a.llmContentSimilarity : a.similarity || 0);
        const scoreB = parseFloat(b.llmContentSimilarity !== undefined ? b.llmContentSimilarity : a.similarity || 0);
        return scoreB - scoreA;
    });

    // 4. Source 로그를 먼저 배치하고, 그 뒤에 필터링된 Non-Source 로그를 배치
    return [...updatedSourceLogs, ...filteredNonSourceLogs];
  }, [apiCallLogs, selectedMenu, lastLlmOutput]);

  return (
    <div className={`right-sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* 새로운 사이드바 헤더 추가 */}
      <div className="sidebar-header">
        <h3>Agent Action Status</h3> {/* 스크린샷에 'Right Sidebar' 텍스트 있음 */}
        <img
          src={SidebarRightIcon}
          alt="Close Sidebar"
          className="icon-button" /* App.css에 정의된 icon-button 스타일 재활용 */
          onClick={toggleSidebar} /* 클릭 시 사이드바 닫기 */
          title="Close Right Sidebar"
        />
      </div>
      <div className="sidebar-content">
        {processedLogs.length === 0 ? (
          <p className="no-logs-message">Agent 동작 내역이 없습니다.</p>
        ) : (
          <ul className="api-call-log-list">
            {processedLogs.map((log, index) => (
              <li
                key={log.id}
                // log.type.toLowerCase() 클래스를 li에 추가하여 카드 전체 색상 변경
                // LLM 카드 애니메이션 삭제: fading-out 상태를 제거
                className={`api-call-log-item ${log.type.toLowerCase()} ${log.status === 'fading-out' ? 'fading-out' : ''}`} 
                style={{ animationDelay: `${index * 0.1}s` }} // 순차적 애니메이션
              >
                <div className="log-header">
                  {log.type === 'Source' ? (
                    <>
                      {log.sourceInfo && ( // NEW: Source metadata
                        <span className="log-source-metadata">
                          {log.fileUrl ? ( // file_url이 있으면 링크로 표시
                            <a href={log.fileUrl} target="_blank" rel="noopener noreferrer" className="source-link">
                              {log.sourceInfo}
                            </a>
                          ) : (
                            log.sourceInfo
                          )}
                          {/* log.similarity && ` (유사도: ${parseFloat(log.similarity).toFixed(0)}%)`} */} {/* RAG 유사도 제거 */}
                          {log.llmContentSimilarity !== undefined && ` (LLM 연관성: ${parseFloat(log.llmContentSimilarity).toFixed(0)}%)`} {/* LLM 출력과의 유사도 */}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="log-arrow">▶</span>
                      <span className="log-timestamp">[{log.timestamp}]</span>
                      <span className="log-type">{log.type}:</span>
                    </>
                  )}
                </div>
                {log.type !== 'Source' && ( // Source 타입이 아닐 때만 log.message 렌더링
                  <span className="log-message">
                    {log.message}
                    {log.type === 'LLM' && log.status === 'active' && (
                      <span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>
                    )}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default RightSidebar;