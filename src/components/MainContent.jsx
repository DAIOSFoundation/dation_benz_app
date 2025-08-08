import React, { useRef, useEffect, useState, useCallback } from 'react';
import './MainContent.css';
import PromptCard from './PromptCard';
import InputBox from './InputBox';
import ReactMarkdown from 'react-markdown'; // ReactMarkdown import
import remarkGfm from 'remark-gfm'; // GitHub Flavored Markdown 지원
import rehypeRaw from 'rehype-raw'; // HTML 렌더링 지원 (필요시)
import { getGeminiTextResponse } from '../utils/geminiApi'; // 변경된 함수 임포트
import { calculateSimilarity } from '../utils/textSimilarity'; // NEW: 유사도 계산 함수 임포트
import PromptExamplesPopup from './PromptExamplesPopup'; // 팝업 컴포넌트 임포트

// Define API constants for RAG
//const BASE_RAG_API_PATH = '/api/v1/rag/retrievers/food'; // The actual path on the banya.ai server
const BASE_RAG_API_PATH = '/api/v1/rags/retriever/2c8d64af-77a0-4abc-949b-06e6f594d17c';
const API_PROXY_PREFIX = '/api'; // The proxy prefix defined in vite.config.js

// getCategoryAndRagContext 함수를 RAG 우선 로직으로 변경
async function getCategoryAndRagContext(question, addApiCallLog) {
  const SIMILARITY_THRESHOLD = 0.8; // 유사도 임계값
  const encodedQuestion = encodeURIComponent(question);

  // 1. RAG API URL 정의
  const foodRagUrl = `https://api.banya.ai/api/v1/rags/retriever/food?question=${encodedQuestion}`;
  let skinRagUrl;
  if (import.meta.env.DEV) {
    skinRagUrl = `${API_PROXY_PREFIX}${BASE_RAG_API_PATH}?question=${encodedQuestion}`;
  } else {
    skinRagUrl = `https://api.banya.ai${BASE_RAG_API_PATH}?question=${encodedQuestion}`;
  }

  addApiCallLog('API', '카테고리 분석을 위해 RAG API 동시 호출 중...');

  // 2. RAG API 병렬 호출
  const [foodResponse, skinResponse] = await Promise.all([
    fetch(foodRagUrl).then(res => res.json()).catch(() => null),
    fetch(skinRagUrl).then(res => res.json()).catch(() => null)
  ]);

  // 3. 최대 유사도 추출 함수
  const getMaxSimilarity = (data) => {
    if (!data?.data?.documents?.length) return 0;
    return Math.max(...data.data.documents.map(doc => doc.similarity || 0));
  };

  const maxFoodSim = getMaxSimilarity(foodResponse);
  const maxSkinSim = getMaxSimilarity(skinResponse);

  let category = '기타';
  let ragContext = null;
  let ragData = null; // 선택된 카테고리의 RAG 데이터 저장

  // 4. 유사도 기반 카테고리 결정
  if (maxFoodSim >= SIMILARITY_THRESHOLD || maxSkinSim >= SIMILARITY_THRESHOLD) {
    if (maxFoodSim >= maxSkinSim) {
      category = '식품';
      ragData = foodResponse;
    } else {
      category = '피부과';
      ragData = skinResponse;
    }
    addApiCallLog('category', `RAG 유사도 기반 카테고리 분석: ${category} (유사도: ${Math.max(maxFoodSim, maxSkinSim).toFixed(2)})`);
  } else {
    // 5. Gemini API로 폴백
    addApiCallLog('LLM', 'RAG 유사도가 낮아 LLM으로 카테고리 분석 중...');
    const prompt = `아래 질문이 '식품', '피부과', '기타' 중 어떤 카테고리에 더 가까운지 한 단어로만 답하세요.\n질문: ${question}`;
    try {
      const response = await getGeminiTextResponse(prompt);
      const answer = response?.text?.trim();
      if (answer?.includes('식품')) {
        category = '식품';
        ragData = foodResponse; // 기존에 호출한 데이터 재사용
      } else if (answer?.includes('피부과')) {
        category = '피부과';
        ragData = skinResponse; // 기존에 호출한 데이터 재사용
      } else {
        category = '기타';
      }
    } catch (e) {
      category = '기타'; // 에러 발생 시 기본값
    }
    addApiCallLog('category', `LLM 기반 카테고리 분석 결과: ${category}`);
  }

  // 6. 컨텍스트 추출 및 출처 로그 기록
  if (ragData?.data?.documents?.length > 0) {
    ragContext = ragData.data.documents.map(doc => doc.page_content).join('\n\n---\n\n');
    ragData.data.documents.forEach(doc => {
      if (doc.metadata?.source) {
        addApiCallLog('Source', '', doc.similarity, `🧇 출처: ${doc.metadata.source}`, doc.page_content, doc.metadata.file_url);
      }
    });
  }
  
  return { category, ragContext };
}

// addApiCallLog, clearSourceLogs, updateApiCallLog, setLastLlmOutput prop을 추가
function MainContent({ chatHistory, setChatHistory, currentPromptInput, setCurrentPromptInput, promptsTemplates, handleSaveChat, addApiCallLog, clearSourceLogs, setLastLlmOutput }) { // MODIFIED: updateApiCallLog prop 제거
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pastedImage, setPastedImage] = useState(null); // 추가: 클립보드 이미지 상태

  // 팝업 상태 추가
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupPrompt, setPopupPrompt] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [chatHistory, isLoading]);

  // --- Ctrl+S 저장 단축키 로직 추가 ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S (Windows/Linux) 또는 Cmd+S (macOS) 확인
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); // 브라우저의 기본 저장 대화 상자 방지
        handleSaveChat(chatHistory); // 챗 저장 함수 호출
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSaveChat, chatHistory]); // handleSaveChat과 chatHistory를 의존성 배열에 추가

  // 이미지 붙여넣기 핸들러 (InputBox에서 호출됨)
  const handlePasteImage = useCallback((imageFile, imageUrl) => {
    setPastedImage({ file: imageFile, url: imageUrl });
  }, []);

  // 이미지 제거 핸들러 (InputBox에서 호출됨)
  const handleClearImage = useCallback(() => {
    setPastedImage(null);
  }, []);

  const handleSendMessage = async () => {
    if (currentPromptInput.trim() === '' && !pastedImage || isLoading) return;

    // 새 질의 시 기존 'Source' 타입 로그 초기화
    clearSourceLogs();
    setLastLlmOutput(''); // NEW: 새 질의 시작 시 이전 LLM 출력 초기화

    // 대화 기록에 사용자 메시지 추가 (이미지 포함)
    const userMessage = { 
      role: 'user', 
      text: currentPromptInput.trim(),
      ...(pastedImage && { image: { url: pastedImage.url, file: pastedImage.file } }) // 이미지 데이터 추가
    };
    setChatHistory((prev) => [...prev, userMessage]);
    setCurrentPromptInput('');
    setPastedImage(null); // 이미지 전송 후 초기화
    setIsLoading(true);

    const llmLogId = addApiCallLog('LLM', 'LLM이 사용자 질의를 분석 중입니다.'); // LLM 로그 ID 저장

    let ragContext = null; // RAG API로부터 얻을 context
    // MODIFIED: Use the new getRagApiUrl function to construct the fetch URL
    const { category, ragContext: fetchedRagContext } = await getCategoryAndRagContext(userMessage.text, addApiCallLog);
    ragContext = fetchedRagContext;

    try {
      addApiCallLog('API', '관련 자료 검색 중...');
      // ragContext가 null이면 Gemini에 context 없이 질문만 전달
      const geminiResponse = await getGeminiTextResponse(userMessage.text, userMessage.image?.file, ragContext);
      
      const modelMessage = {
        role: 'model',
        text: geminiResponse.text,
      };

      // LLM 응답에 이미지가 포함되어 있을 경우 메시지 객체에 추가
      if (geminiResponse.imageUrl) {
        modelMessage.image = {
          url: geminiResponse.imageUrl,
          mimeType: geminiResponse.imageMimeType,
        };
      }

      setChatHistory((prev) => [...prev, modelMessage]);
      // LLM 카드는 응답 완료 시 사라지도록 상태 변경 (이제 App.jsx에서 자동 처리되므로 제거)
      // updateApiCallLog(llmLogId, 'fading-out', 'LLM이 응답을 생성했습니다.'); 
      setLastLlmOutput(geminiResponse.text); // NEW: 최종 LLM 응답을 App.jsx로 전달
      // 시뮬레이션된 출처 로그 추가 (기존 시뮬레이션은 RAG에서 처리되므로 제거)
      // addApiCallLog('Source', '🧇 검색 출처: 사내 위키 "그릴리 제품군 BOM 정보"');
      // addApiCallLog('Source', '🧇 답변 출처: "2024년 1월 생산 보고서"');

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setChatHistory((prev) => [...prev, { role: 'model', text: '죄송합니다. 메시지를 처리하는 데 문제가 발생했습니다. 다시 시도해 주세요.' }]);
      // LLM 카드는 에러 발생 시에도 사라지도록 상태 변경 (이제 App.jsx에서 자동 처리되므로 제거)
      // updateApiCallLog(llmLogId, 'fading-out', 'LLM 응답 생성 실패'); 
      setLastLlmOutput('LLM 응답 생성 실패'); // NEW: 에러 발생 시에도 LLM 출력 상태 업데이트
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handlePromptCardClick = (prompt) => {
    setPopupPrompt(prompt);
    setIsPopupOpen(true);
  };

  // promptsTemplates 배열을 수정하여 '식당 예약' 프롬프트를 '톡스앤필 상담' 프롬프트로 교체
  // const updatedPromptsTemplates = promptsTemplates.map(prompt => {
  //   if (prompt.title === '식당 예약') {
  //     return {
  //       ...prompt,
  //       title: '톡스앤필 상담',
  //       description: '톡스앤필 피부과 클리닉의 일반 정보, 시술 정보, 예약을 도와주는 프롬프트 입니다.',
  //       example: '필러 보톡스 상담받고 싶어. 국산이랑 외산 제품이 비용차이가 얼마나 나고 왜 나는지 궁금해. 그리고 필러 보톡스 맞았을지 유지 기간이 얼마나 되는지 궁금해.'
  //     };
  //   }
  //   return prompt;
  // });

  // '식당 예약'이 포함된 프롬프트를 제거하고, '톡스앤필 상담' 프롬프트를 추가
  const filteredPrompts = promptsTemplates.filter(prompt => !(prompt.title && prompt.title.includes('식당 예약')));
  const toksnfillPrompt = {
    id: 'toksnfill-consult',
    title: '톡스앤필 상담',
    description: '톡스앤필 피부과 클리닉의 일반 정보, 시술 정보, 예약을 도와주는 프롬프트 입니다.',
    example: '필러 보톡스 상담받고 싶어. 국산이랑 외산 제품이 비용차이가 얼마나 나고 왜 나는지 궁금해. 그리고 필러 보톡스 맞았을지 유지 기간이 얼마나 되는지 궁금해.',
    category: 'General',
    author: 'You',
    date: new Date().toISOString().split('T')[0] // 오늘 날짜로 설정
  };
  const finalPrompts = [...filteredPrompts, toksnfillPrompt];

  return (
    <div className="main-content-container">
      <div className="chat-messages-display">
        {chatHistory.length === 0 ? (
          <div className="no-messages">
            <p>메시지를 입력하여 대화를 시작해 보세요!</p>
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              <div className="message-bubble">
                {msg.image && ( // 이미지가 있을 경우 썸네일 표시
                  <div className="message-image-container">
                    <img src={msg.image.url} alt={msg.role === 'user' ? "Pasted" : "Generated"} className="message-image-thumbnail" />
                  </div>
                )}
                {/* ReactMarkdown을 사용하여 마크다운 렌더링 */}
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="chat-message model loading">
            <div className="message-bubble loading-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="prompts-section">
        <h2>Prompts</h2>
        <div className="prompts-grid">
          {finalPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onClick={handlePromptCardClick}
              isSelected={false} // 선택 상태 비활성화
            />
          ))}
        </div>
      </div>

      <InputBox
        value={currentPromptInput}
        onChange={(e) => setCurrentPromptInput(e.target.value)}
        onSend={handleSendMessage}
        isLoading={isLoading}
        placeholder="How can I help you?"
        inputRef={inputRef}
        pastedImage={pastedImage} // 추가: pastedImage prop 전달
        onPasteImage={handlePasteImage} // 추가: onPasteImage prop 전달
        onClearImage={handleClearImage} // 추가: onClearImage prop 전달
      />

      {isPopupOpen && popupPrompt && (
        <PromptExamplesPopup
          title={popupPrompt.title}
          examples={popupPrompt.example}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </div>
  );
}

export default MainContent;