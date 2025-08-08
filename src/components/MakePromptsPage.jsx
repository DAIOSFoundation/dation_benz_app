// src/components/MakePromptsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import './MakePromptsPage.css';
import PromptFolderList from './PromptFolderList';
import PromptItemCard from './PromptItemCard';
import PromptForm from './PromptForm';
import CalendarIcon from '../assets/cal icon.png'; // 기존 달력 아이콘 사용
import PersonIcon from '../assets/person.png'; // 인물 아이콘 사용

function MakePromptsPage() {
  // Mock 데이터
  const [promptFolders, setPromptFolders] = useState([
    { id: 'f1', name: '제조 지식 에이전트', prompts: ['p1', 'p2'] },
    { id: 'f2', name: '전자 상거래 에이전트', prompts: ['p3'] },
    { id: 'f3', name: 'F&B 트렌드 분석 에이전트', prompts: [] },
  ]);

  const [allPrompts, setAllPrompts] = useState([
    {
      id: 'p1', folderId: 'f1', title: '그릴리 제품 군의 원재료 구성', date: 'Jan 24, 2024', author: 'You',
      content: '그릴리 햄을 제조하기 위한 원재료를 Bill of Materials 로 정리하는 프롬프트입니다. 재료 검사 절차를 확인하시려면 [[insert prompt:SOP 관련 질문]]을 해주세요.',
      promptTitle: '그릴리 BOM 프롬프트',
      promptDescription: '그릴리 햄 BOM 관련 정보를 요청하는 프롬프트'
    },
    {
      id: 'p2', folderId: 'f1', title: 'SOP 데이터 전송 가이드', date: 'Jan 23, 2024', author: 'Admin',
      content: '변경된 SOP 데이터를 백엔드에 전송하는 절차를 안내합니다. [[insert prompt:JSON 파일 업로드]]를 통해 데이터를 제출해주세요.',
      promptTitle: 'SOP 전송 프롬프트',
      promptDescription: 'SOP 데이터 전송 절차 안내 프롬프트'
    },
    {
      id: 'p3', folderId: 'f2', title: '주문 내역 조회 프롬프트', date: 'Feb 1, 2024', author: 'You',
      content: '최근 주문 내역을 조회하는 프롬프트입니다. [[insert prompt:주문 번호]]를 입력해주세요.',
      promptTitle: '주문 조회',
      promptDescription: '사용자의 주문 내역을 검색하는 프롬프트'
    },
  ]);

  const [selectedFolderId, setSelectedFolderId] = useState('f1'); // 기본 선택 폴더
  const [selectedPromptId, setSelectedPromptId] = useState(null); // 현재 선택된 프롬프트
  const [isCreatingNewPrompt, setIsCreatingNewPrompt] = useState(false); // 새 프롬프트 작성 모드

  // 현재 선택된 폴더의 프롬프트 목록
  const currentFolderPrompts = useMemo(() => {
    if (!selectedFolderId) return [];
    const folder = promptFolders.find(f => f.id === selectedFolderId);
    if (!folder) return [];
    return folder.prompts
      .map(promptId => allPrompts.find(p => p.id === promptId))
      .filter(Boolean); // 유효한 프롬프트만 필터링
  }, [selectedFolderId, promptFolders, allPrompts]);

  // 현재 편집/조회 중인 프롬프트 데이터
  const currentPromptData = useMemo(() => {
    if (isCreatingNewPrompt) return null; // 새 프롬프트 작성 모드면 데이터 없음
    return allPrompts.find(p => p.id === selectedPromptId);
  }, [selectedPromptId, allPrompts, isCreatingNewPrompt]);


  // Add new 버튼 클릭 핸들러
  const handleAddNewPrompt = () => {
    setIsCreatingNewPrompt(true);
    setSelectedFolderId(null); // 새 프롬프트 작성 시 폴더 선택 해제
    setSelectedPromptId(null); // 새 프롬프트 작성 시 프롬프트 선택 해제
  };

  // 프롬프트 저장 (새로 생성 또는 업데이트)
  const handleSavePrompt = (promptData, originalId = null) => {
    setAllPrompts(prevAllPrompts => {
      if (originalId) { // 기존 프롬프트 업데이트
        return prevAllPrompts.map(p => p.id === originalId ? { ...p, ...promptData } : p);
      } else { // 새 프롬프트 생성
        const newPromptId = `p${Date.now()}`;
        const newPrompt = {
          id: newPromptId,
          folderId: selectedFolderId || 'f1', // 기본 폴더 지정 또는 선택된 폴더
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          author: 'You', // 기본 작성자
          ...promptData,
        };

        // 폴더 목록 업데이트 (새 프롬프트를 해당 폴더에 추가)
        setPromptFolders(prevFolders => prevFolders.map(folder =>
          folder.id === newPrompt.folderId ? { ...folder, prompts: [...folder.prompts, newPromptId] } : folder
        ));
        
        setSelectedPromptId(newPromptId); // 새로 저장된 프롬프트 선택
        setIsCreatingNewPrompt(false); // 작성 모드 해제
        return [...prevAllPrompts, newPrompt];
      }
    });
    setIsCreatingNewPrompt(false); // 저장 후 작성 모드 해제
    // selectedPromptId를 업데이트하여 폼이 닫히고 저장된 프롬프트가 선택되도록 함
    // (위 setAllPrompts 콜백에서 처리되므로 여기서는 주석 처리)
  };


  // 폴더 클릭 핸들러
  const handleFolderSelect = (folderId) => {
    setSelectedFolderId(folderId);
    setIsCreatingNewPrompt(false); // 폴더 선택 시 새 프롬프트 작성 모드 해제
    // 폴더 내 첫 번째 프롬프트 자동 선택 (선택 사항)
    const folder = promptFolders.find(f => f.id === folderId);
    if (folder && folder.prompts.length > 0) {
      setSelectedPromptId(folder.prompts[0]);
    } else {
      setSelectedPromptId(null);
    }
  };

  // 프롬프트 아이템 클릭 핸들러 (편집 모드)
  const handlePromptItemSelect = (promptId) => {
    setSelectedPromptId(promptId);
    setIsCreatingNewPrompt(false); // 기존 프롬프트 선택 시 작성 모드 해제
  };


  return (
    <div className="make-prompts-page-container">
      <div className="makeprompts-left-panel">
        <PromptFolderList
          folders={promptFolders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={handleFolderSelect}
          onAddNewPrompt={handleAddNewPrompt}
        />
      </div>

      <div className="makeprompts-right-panel">
        {isCreatingNewPrompt ? (
          <div className="makeprompts-form-section card">
            <h2>New Prompt</h2>
            <PromptForm onSave={handleSavePrompt} />
          </div>
        ) : (
          <>
            {/* 우측 상단 프롬프트 목록 */}
            {currentFolderPrompts.length > 0 && (
              <div className="makeprompts-prompt-list-section">
                <div className="makeprompts-prompt-grid">
                  {currentFolderPrompts.map(prompt => (
                    <PromptItemCard
                      key={prompt.id}
                      prompt={prompt}
                      onSelect={handlePromptItemSelect}
                      isSelected={prompt.id === selectedPromptId}
                      calendarIcon={CalendarIcon}
                      personIcon={PersonIcon}
                    />
                  ))}
                </div>
                <div className="makeprompts-list-divider"></div>
              </div>
            )}
            
            {/* 프롬프트 상세 내용/편집 폼 */}
            {selectedPromptId && currentPromptData && (
              <div className="makeprompts-details-section card">
                <h2>{currentPromptData.title}</h2>
                <div className="makeprompts-details-meta">
                  <img src={CalendarIcon} alt="Date" /> {currentPromptData.date}
                  <img src={PersonIcon} alt="Author" /> {currentPromptData.author}
                </div>
                <h3>Prompt content</h3>
                <p className="makeprompts-content-display">{currentPromptData.content}</p>
                
                {/* 편집 모드를 위한 PromptForm (기존 프롬프트 데이터 전달) */}
                <PromptForm onSave={handleSavePrompt} initialData={currentPromptData} />
              </div>
            )}

            {/* 선택된 폴더에 프롬프트가 없을 때 메시지 */}
            {!isCreatingNewPrompt && !selectedPromptId && currentFolderPrompts.length === 0 && (
              <div className="makeprompts-empty-folder-message">
                <p>선택된 폴더에 프롬프트가 없습니다. 'Add new' 버튼을 클릭하여 새 프롬프트를 만드세요.</p>
              </div>
            )}
             {/* 폴더가 선택되지 않은 경우 메시지 */}
            {!isCreatingNewPrompt && !selectedFolderId && (
                <div className="makeprompts-empty-state-message">
                    <p>프롬프트 폴더를 선택하거나 'Add new' 버튼을 클릭하여 새 프롬프트를 만드세요.</p>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MakePromptsPage;