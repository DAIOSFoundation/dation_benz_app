import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './InteractionPage.css';
import { mockApi, fixedLayoutData } from '../api/mockApi';
import { useLanguage } from '../contexts/LanguageContext';

import InputBox from './InputBox';
import LoadingAnimation from './LoadingAnimation';
import LightbulbIcon from '../assets/lightbulb.png';
import { getGeminiIntent, translateToKorean } from '../utils/geminiApi';

// NEW PROP: onLlmExplanationChange, clearSourceLogs
function InteractionPage({ addApiCallLog, clearSourceLogs, selectedLLM, onLlmExplanationChange, currentOperator }) {
  const { t } = useLanguage();
  const [layoutData, setLayoutData] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(null);
  const [currentStepContent, setCurrentStepContent] = useState(null);
  const [isLoadingStep, setIsLoadingStep] = useState(false);
  const [error, setError] = useState(null);

  // Interaction 페이지 최초 로딩 시 표시될 알림 메시지로 llmExplanation을 초기화합니다.
  const [llmExplanation, setLlmExplanation] = useState(t('welcomeMessage'));

  // 언어 변경 시 환영 메시지 업데이트
  useEffect(() => {
    const newWelcomeMessage = t('welcomeMessage');
    console.log('Welcome message updated to:', newWelcomeMessage);
    setLlmExplanation(newWelcomeMessage);
    onLlmExplanationChange(newWelcomeMessage); // 부모 컴포넌트에도 알림
  }, [t, onLlmExplanationChange]);
  const [interactionChatHistory, setInteractionChatHistory] = useState([]);
  const [interactionInput, setInteractionInput] = useState('');
  const [isSendingInteraction, setIsSendingInteraction] = useState(false);
  const interactionInputRef = useRef(null);
  const chatDisplayRef = useRef(null);

  // LLM이 추출한 엔티티(예: 환자 이름)를 저장하는 상태
  const [currentExtractedEntities, setCurrentExtractedEntities] = useState({});

  // 1. lastUserInput 상태 추가
  const [lastUserInput, setLastUserInput] = useState('');

  // Gemini AI가 의도 분류를 위한 간단하고 명확한 키워드 정의
  const geminiIntentKeywords = useMemo(() => {
    const keywords = {};
    
    // 각 워크플로우별로 핵심 키워드만 정의
    const workflows = [
      { 
        intent: "AUTOMOTIVE_DEALER_INFO_LOOKUP_0", 
        keywords: ["딜러 정보", "딜러사 정보", "dealer information", "딜러 목록", "dealer list"] 
      },
      { 
        intent: "AUTOMOTIVE_VEHICLE_SALES_STATUS_1", 
        keywords: ["판매 실적", "판매 현황", "sales volume", "sales amount", "total sales", "매출", "판매 통계"] 
      },
      { 
        intent: "AUTOMOTIVE_PRODUCTION_ALLOCATION_STATUS_2", 
        keywords: ["생산 현황", "배정 계획", "production allocation", "배정 현황", "allocation status"] 
      },
      { 
        intent: "AUTOMOTIVE_CUSTOMER_WAITLIST_MANAGEMENT_3", 
        keywords: ["고객 대기", "대기 명단", "waitlist", "구매 대기", "customer waitlist"] 
      },
      { 
        intent: "AUTOMOTIVE_MONTHLY_SALES_ANALYSIS_4", 
        keywords: ["월별 판매", "monthly sales", "7월 판매", "July sales", "총 판매 대수", "total sales volume"] 
      },
      { 
        intent: "AUTOMOTIVE_DEALER_SEGMENT_SALES_5", 
        keywords: ["딜러별 세그먼트", "dealer segment", "효성더클래스", "Hyosung The Class", "세단", "sedan", "딜러별 판매"] 
      },
      { 
        intent: "AUTOMOTIVE_DEALER_ALLOCATION_STATUS_6", 
        keywords: ["딜러별 배정", "dealer allocation", "한성자동차", "Hansung Motors", "SUV 배정", "SUV allocation"] 
      },
      { 
        intent: "AUTOMOTIVE_EMAIL_SENDING_7", 
        keywords: ["이메일 전송", "email sending", "이메일", "email", "초대 이메일", "invitation email"] 
      }
    ];
    
    // 키워드 매핑 생성
    workflows.forEach(workflow => {
      keywords[workflow.intent] = workflow.keywords;
    });
    
    return keywords;
  }, []);



  // ID-Name 매핑 데이터를 위한 useMemo (자동차 업계)
  const idToNameMaps = useMemo(() => {
    // 벤츠 딜러 데이터에서 매핑 정보 추출
    const dealers = [
      { dealership_id: 1, dealership_name: "Hansung Motors", contact_person: "Kim Min-jun" },
      { dealership_id: 2, dealership_name: "Hyosung The Class", contact_person: "Lee Seo-yeon" },
      { dealership_id: 3, dealership_name: "KCC Auto", contact_person: "Park Ji-hoon" },
      { dealership_id: 4, dealership_name: "The Star Motors", contact_person: "Choi Eun-ji" },
      { dealership_id: 5, dealership_name: "Shinsegae Motors", contact_person: "Jung Woo-jin" }
    ];
    
    const vehicleModels = [
      { model_id: 101, model_name: "E-Class (W214)", segment: "Sedan" },
      { model_id: 102, model_name: "C-Class (W206)", segment: "Sedan" },
      { model_id: 103, model_name: "GLC (X254)", segment: "SUV" },
      { model_id: 104, model_name: "EQS (V297)", segment: "EV Sedan" },
      { model_id: 105, model_name: "S-Class (W223)", segment: "Luxury Sedan" }
    ];

    const dealershipIdToName = new Map(dealers.map(d => [d.dealership_id, d.dealership_name]));
    const modelIdToName = new Map(vehicleModels.map(v => [v.model_id, v.model_name]));
    const dealershipIdToContact = new Map(dealers.map(d => [d.dealership_id, d.contact_person]));

    return {
      dealershipIdToName,
      modelIdToName,
      dealershipIdToContact,
    };
  }, []); // 의존성 배열 비워두어 컴포넌트 마운트 시 한 번만 계산



  useEffect(() => {
    interactionInputRef.current?.focus();
    // 컴포넌트 마운트 시 초기 LLM 설명 메시지를 부모 컴포넌트로 전달하여 App.jsx의 lastLlmExplanation 상태를 업데이트합니다.
    onLlmExplanationChange(t('welcomeMessage'));
  }, [onLlmExplanationChange, t]);

  useEffect(() => {
    chatDisplayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [interactionChatHistory, currentStepContent]);

  // LLM 상호작용 또는 동적 화면(스텝) 로딩이 모두 완료되면 입력창에 포커스를 맞춥니다.
  useEffect(() => {
    if (!isLoadingStep && !isSendingInteraction) {
      interactionInputRef.current?.focus();
    }
  }, [isLoadingStep, isSendingInteraction]);


  const handleWorkflowComplete = useCallback((message) => {
    setCurrentStepIndex(null);
    setLayoutData([]);
    setInteractionChatHistory([]);
    setLlmExplanation(message);
    onLlmExplanationChange(message); // NEW: 워크플로우 완료 시 LLM 설명 업데이트
    setError(null);
    setCurrentExtractedEntities({}); // 워크플로우 완료 시 추출된 엔티티 초기화
    interactionInputRef.current?.focus();
  }, [onLlmExplanationChange]);





  const renderData = useCallback((data) => {
    if (!Array.isArray(data) || data.length === 0) return null;

    // 2차원 배열인지 확인
    const is2DArray = Array.isArray(data[0]) && data[0].length > 0;
    
    if (is2DArray) {
      // 2차원 배열은 바로 TableRenderer에 전달
      return <TableRenderer data={data} header={null} />;
    }

    const { patientIdToName, productIdToName, leadIdToName, hospitalRecipientEmailToName } = idToNameMaps;

    // 원본 데이터의 첫 번째 객체에서 헤더를 먼저 추출
    let originalHeader = typeof data[0] === 'object' && data[0] !== null ? Object.keys(data[0]) : [];

    const transformedData = data.map(row => {
      const newRow = { ...row }; // 원본 객체를 복사

      // 동적으로 ID 필드를 찾아 이름으로 변환
      for (const key in newRow) {
        if (key.endsWith('_id')) { // _id 로 끝나는 필드 찾기
          const idValue = newRow[key];
          let nameKey = key.replace('_id', '_name'); // 예: patient_id -> patient_name

          if (key === 'patient_id' && patientIdToName.has(idValue)) {
            newRow[nameKey] = patientIdToName.get(idValue);
          } else if (key === 'product_id' && productIdToName.has(idValue)) {
            newRow[nameKey] = productIdToName.get(idValue);
          } else if (key === 'lead_id' && leadIdToName.has(idValue)) {
            newRow[nameKey] = leadIdToName.get(idValue);
          }
          // 추가적인 ID-Name 매핑이 필요하다면 여기에 else if 추가
        } else if (key === 'recipient_email') {
            // 병원용 수신자 확인
            if (hospitalRecipientEmailToName.has(newRow[key])) {
                newRow['recipient_name'] = hospitalRecipientEmailToName.get(newRow[key]);
            }
        }
      }
      return newRow;
    });

    // 동적으로 추가된 _name 필드를 기존 _id 필드 바로 뒤에 삽입하여 헤더 순서 조정
    let finalHeader = [];
    const patientNameExistsInTransformed = transformedData.length > 0 && transformedData[0].hasOwnProperty('patient_name');

    originalHeader.forEach(key => {
      // 'name' 필드가 원본 헤더에 있고, 'patient_id' 필드가 존재하며, 'patient_name'이 변환된 데이터에 추가되었다면
      // 원본 'name' 필드를 헤더에 추가하지 않아 중복을 방지합니다.
      if (key === 'name' && originalHeader.includes('patient_id') && patientNameExistsInTransformed) {
        return; // Skip adding 'name' to finalHeader
      }

      finalHeader.push(key);
      if (key.endsWith('_id')) {
        const nameKey = key.replace('_id', '_name');
        // transformedData의 첫 번째 객체에 해당 nameKey가 있는지 확인 (데이터가 비어있지 않다고 가정)
        if (transformedData.length > 0 && transformedData[0].hasOwnProperty(nameKey)) {
          finalHeader.push(nameKey);
        }
      } else if (key === 'recipient_email') {
          if (transformedData.length > 0 && transformedData[0].hasOwnProperty('recipient_name')) {
              finalHeader.push('recipient_name');
          }
      }
    });

    // 최종적으로 TableRenderer에 전달될 데이터는 transformedData
    // header는 finalHeader
    return <TableRenderer data={transformedData} header={finalHeader} />;
  }, [idToNameMaps]);

  // 분석 결과 렌더링 함수
  const renderAnalysisResult = useCallback((data) => {
    if (data.month && data.year && data.totalQuantity !== undefined) {
      // 판매 분석 결과
      if (data.totalAmount !== undefined) {
        return (
          <div className="analysis-result">
            <h3>📊 {data.month}월 {data.year}년 {t('salesAnalysisResult')}</h3>
            <div className="analysis-summary">
              <div className="analysis-item">
                <span className="label">{t('totalSalesVolume')}:</span>
                <span className="value">{data.totalQuantity}{t('units')}</span>
              </div>
              <div className="analysis-item">
                <span className="label">{t('totalSalesAmount')}:</span>
                <span className="value">{data.totalAmount.toLocaleString()}{t('won')}</span>
              </div>
            </div>
            {data.sales && data.sales.length > 0 && (
              <div className="sales-details">
                <h4>{t('detailedSalesHistory')}</h4>
                <TableRenderer data={data.sales} header={Object.keys(data.sales[0])} />
              </div>
            )}
          </div>
        );
      }
      
      // 배정 분석 결과
      if (data.totalQuantity !== undefined && data.segment === 'SUV') {
        return (
          <div className="analysis-result">
            <h3>🚗 {data.dealership} {data.month}월 {data.year}년 {t('suvAllocationStatus')}</h3>
            <div className="analysis-summary">
              <div className="analysis-item">
                <span className="label">{t('totalSuvAllocation')}:</span>
                <span className="value">{data.totalQuantity}{t('units')}</span>
              </div>
            </div>
            {data.allocations && data.allocations.length > 0 && (
              <div className="allocation-details">
                <h4>{t('allocationDetails')}</h4>
                <TableRenderer data={data.allocations} header={Object.keys(data.allocations[0])} />
              </div>
            )}
          </div>
        );
      }
    }
    
    // 딜러별 세그먼트 판매 결과
    if (data.dealership && data.segment && data.totalQuantity !== undefined) {
      return (
        <div className="analysis-result">
          <h3>🏢 {data.dealership} {data.month}월 {data.year}년 {data.segment} {t('dealerSegmentSalesStatus')}</h3>
          <div className="analysis-summary">
            <div className="analysis-item">
              <span className="label">{t('totalSegmentSales', { segment: data.segment })}:</span>
              <span className="value">{data.totalQuantity}{t('units')}</span>
            </div>
            <div className="analysis-item">
              <span className="label">{t('totalSalesAmount')}:</span>
              <span className="value">{data.totalAmount.toLocaleString()}{t('won')}</span>
            </div>
          </div>
          {data.sales && data.sales.length > 0 ? (
            <div className="sales-details">
              <h4>{t('detailedSalesHistory')}</h4>
              <TableRenderer data={data.sales} header={Object.keys(data.sales[0])} />
            </div>
          ) : (
            <div className="no-data-message">
              <p>{t('noSalesHistory', { segment: data.segment })}</p>
            </div>
          )}
        </div>
      );
    }

    return <p className="no-data-message">{t('cannotDisplayResult')}</p>;
  }, [t]);

  const fetchAndRenderStep = useCallback(async (step, extractedEntities = {}) => {
    setIsLoadingStep(true);
    setError(null);

    let contentToRender = null;
    let isIframe = false;

 if (step.api && step.api.url) {
      const urlPath = step.api.url;
      const method = step.api.method;

      if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
        isIframe = true;
        addApiCallLog('External Content', `외부 웹 페이지 (${urlPath}) 로드 중입니다.`);
        contentToRender = (
          <div className="iframe-container">
            <iframe
              src={urlPath}
              title={step.process_name}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              onLoad={() => { setIsLoadingStep(false); addApiCallLog('External Content', `외부 웹 페이지 (${urlPath}) 로드 완료.`); }}
              onError={() => { setError(`외부 웹 페이지 로드 실패: ${urlPath}`); setIsLoadingStep(false); addApiCallLog('External Content', `외부 웹 페이지 (${urlPath}) 로드 실패.`); }}
            ></iframe>
          </div>
        );
      } else {
        try {
          const resource = urlPath.split('/').pop();
          const patientName = extractedEntities?.patient_name;
          
          if (method === 'GET') {
            addApiCallLog('Data', `관련 Data (${resource}) 를 분석 중입니다.`);
            let apiResponse;
            
            switch (resource) {
              case 'patients': apiResponse = await mockApi.getPatients(null, patientName); break;
              case 'appointments': apiResponse = await mockApi.getAppointments(null, null, patientName); break;
              case 'surgeries': apiResponse = await mockApi.getSurgeries(null, patientName); break;
              case 'photo_records': apiResponse = await mockApi.getPhotoRecords(null, patientName); break;
              case 'products': apiResponse = await mockApi.getProducts(); break;
              case 'surveys': apiResponse = await mockApi.getSurveys(); break;
              case 'leads': apiResponse = await mockApi.getLeads(); break;
              case 'callback': apiResponse = await mockApi.getCallback(); addApiCallLog('API', '콜백 수신 완료.'); break;
              case 'sales_analysis': 
                // 월별 판매 분석 - 기본값 7월 2025년
                const salesMonth = extractedEntities?.month || 7;
                const salesYear = extractedEntities?.year || 2025;
                apiResponse = await mockApi.getSalesAnalysis(salesMonth, salesYear); 
                break;
              case 'dealership_sales': 
                // 딜러별 세그먼트 판매 - 추출된 엔티티 사용
                const dealershipName = extractedEntities?.dealer || 'Hyosung The Class';
                const segmentMonth = extractedEntities?.month || 7;
                const segmentYear = extractedEntities?.year || 2025;
                const segment = extractedEntities?.segment || 'Sedan';
                console.log('Dealership sales API call with:', { dealershipName, segmentMonth, segmentYear, segment, extractedEntities });
                apiResponse = await mockApi.getDealershipSalesBySegment(dealershipName, segmentMonth, segmentYear, segment); 
                break;
              case 'allocation_analysis': 
                // 딜러별 배정 현황 - 추출된 엔티티 사용
                const allocationDealership = extractedEntities?.dealer || '한성자동차';
                const allocationMonth = extractedEntities?.month || 8;
                const allocationYear = extractedEntities?.year || 2025;
                console.log('Allocation analysis API call with:', { allocationDealership, allocationMonth, allocationYear, extractedEntities });
                apiResponse = await mockApi.getAllocationByDealership(allocationDealership, allocationMonth, allocationYear); 
                break;
              case 'send_email': 
                // 이메일 전송은 POST로 처리되므로 여기서는 처리하지 않음
                apiResponse = { success: true, data: [], message: '이메일 전송은 POST 요청으로 처리됩니다.' }; 
                break;
              default: throw new Error(`Unsupported GET API: ${urlPath}`);
            }
            
            // 디버깅을 위한 로그 추가
            console.log('API Response:', apiResponse);
            console.log('API Response data type:', typeof apiResponse.data);
            console.log('API Response data is array:', Array.isArray(apiResponse.data));
            
            if (apiResponse.data && apiResponse.data.length > 0) {
                contentToRender = renderData(apiResponse.data || apiResponse.message);
            } else if (apiResponse.data && typeof apiResponse.data === 'object' && !Array.isArray(apiResponse.data)) {
                // 분석 결과 객체인 경우
                console.log('Rendering analysis result with data:', apiResponse.data);
                contentToRender = renderAnalysisResult(apiResponse.data);
            } else {
                console.log('No data found, showing no-data message');
                contentToRender = <p className="no-data-message">{t('noDataMessage')}</p>;
                if (patientName) {
                    contentToRender = <p className="no-data-message">{t('patientDataNotFound', { patientName })}</p>;
                }
            }
          } else if (method === 'POST') {
            contentToRender = (
              <PostForm
                step={step}
                addApiCallLog={addApiCallLog}
                onFormSubmit={async (formData) => {
                  setIsLoadingStep(true);
                  try {
                    addApiCallLog('API', t('banyaAgentWorking'));
                    let json;
                    // 이메일 전송 처리
                    if (step.api.url === '/api/send_email') {
                      // 사용자의 원본 질문에서 이메일 내용 추출
                      const originalQuestion = lastUserInput || '';
                      let emailContent = '';
                      let emailSubject = t('emailSubject');
                      
                      // 원본 질문에서 이메일 내용 추출 시도
                      if (originalQuestion.includes('다음 이메일을') || originalQuestion.includes('이메일을')) {
                        // 사용자가 직접 이메일 내용을 제공한 경우
                        const emailMatch = originalQuestion.match(/다음 이메일을[^:]*:(.*?)(?=\.$|$)/s);
                                                if (emailMatch) {
                          const originalContent = emailMatch[1].trim();
                          try {
                            const translatedContent = await translateToKorean(originalContent);
                            emailContent = `=== ${t('originalText')} ===\n${originalContent}\n\n=== ${t('koreanTranslation')} ===\n${translatedContent}`;
                          } catch (error) {
                            console.error('Translation error:', error);
                            emailContent = originalContent;
                          }
                        } else {
                          // 전체 질문을 이메일 내용으로 사용
                          try {
                            const translatedQuestion = await translateToKorean(originalQuestion);
                            emailContent = `=== ${t('originalText')} ===\n${originalQuestion}\n\n=== ${t('koreanTranslation')} ===\n${translatedQuestion}`;
                          } catch (error) {
                            console.error('Translation error:', error);
                            emailContent = originalQuestion;
                          }
                        }
                      } else {
                        // 기본 이메일 내용
                        const defaultContent = t('defaultEmailContent');
                        emailContent = defaultContent;
                      }
                      
                      json = await mockApi.sendEmail(formData.recipient_email, emailSubject, emailContent);
                    } else {
                      json = await mockApi.postSend(formData);
                    }
                    setInteractionChatHistory((prev) => [...prev, { role: 'model', content: `${t('postRequestComplete')}: ${json.message || t('noResponseMessage')}` }]);
                    const nextStepConfig = step.next_step && step.next_step.length > 0 ? step.next_step[0] : null;
                    if (nextStepConfig && nextStepConfig.step_id !== null) {
                      const nextIdx = layoutData.findIndex(s => s.step_id === nextStepConfig.step_id);
                      if (nextIdx !== -1) { setCurrentStepIndex(nextIdx); }
                      else { setError(`다음 스텝 ID ${nextStepConfig.step_id}를 layoutData에서 찾을 수 없습니다.`); handleWorkflowComplete(t('workflowUnexpectedEnd')); }
                    } else { handleWorkflowComplete(t('workflowComplete')); }
                  } catch (err) {
                    addApiCallLog('API', `POST 데이터 전송 실패: ${err.message}`);
                    setError(`Error sending POST request: ${err.message}`);
                    setInteractionChatHistory((prev) => [...prev, { role: 'model', content: `POST 요청 실패: ${err.message}` }]);
                    handleWorkflowComplete("워크플로우가 실패로 종료되었습니다.");
                  } finally {
                    setIsLoadingStep(false);
                  }
                }}
              />
            );
          }
        } catch (err) {
          addApiCallLog('API', `API 호출 실패: ${err.message}`);
          setError(`API request failed: ${err.message}`);
          contentToRender = <p className="error-message">API 호출 중 오류가 발생했습니다: ${err.message}</p>;
          setInteractionChatHistory((prev) => [...prev, { role: 'model', content: `API 오류: ${err.message}` }]);
          handleWorkflowComplete("워크플로우가 실패로 종료되었습니다.");
        }
      }
    } else if (step.data) {
      contentToRender = renderData(step.data);
      addApiCallLog('Data', `데이터 렌더링 완료: ${step.process_name}`);
    }
    
    // --- 최종 UI 렌더링 로직 분리 ---
    let finalContent;

    if (isIframe) {
      // 외부 페이지(iframe)는 제목/설명 없이 바로 렌더링
      finalContent = (
        <div className="iframe-content-wrapper">
          {contentToRender}

        </div>
      );
    } else {
      // 그 외 모든 내부 페이지는 기존 wrapper 사용
      finalContent = (
        <div className="dynamic-app-wrapper">
          <h2>{step.process_name}</h2>
          <p>{step.description}</p>
          {contentToRender}
          {/* POST 폼이 아닐 때만 Next 버튼 표시 */}
          {!(step.api && step.api.method === 'POST') && 
           step.next_step && step.next_step.length > 0 && step.next_step[0].step_id !== null && (
              <button className="next-btn" onClick={() => {
                  const nextStepConfig = step.next_step[0];
                  const nextIdx = layoutData.findIndex(s => s.step_id === nextStepConfig.step_id);
                  if (nextIdx !== -1) { setCurrentStepIndex(nextIdx); }
                  else { setError(`다음 스텝 ID ${nextStepConfig.step_id}를 layoutData에서 찾을 수 없습니다.`); handleWorkflowComplete("워크플로우가 예상치 못하게 종료되었습니다."); }
              }}>Next</button>
          )}
        </div>
      );
    }
    
    setCurrentStepContent(finalContent);
    
    if (!isIframe) {
      setIsLoadingStep(false);
    }
  }, [layoutData, handleWorkflowComplete, renderData, addApiCallLog, t, lastUserInput]);


  useEffect(() => {
    if (layoutData.length > 0 && currentStepIndex !== null && currentStepIndex < layoutData.length) {
        const stepToRender = layoutData[currentStepIndex];
        fetchAndRenderStep(stepToRender, currentExtractedEntities);
    } else if (layoutData.length === 0 && currentStepIndex === null && !isSendingInteraction) {
        setCurrentStepContent(null); 
    }
  }, [currentStepIndex, layoutData, fetchAndRenderStep, isSendingInteraction]);


  const handleInteractionInputSend = async () => {
    if (interactionInput.trim() === '' || isSendingInteraction || isLoadingStep) return;

    setInteractionChatHistory([]);
    setLlmExplanation("");
    onLlmExplanationChange(""); // NEW: 새 상호작용 시작 시 LLM 설명 초기화
    setLayoutData([]);
    setCurrentStepIndex(null);
    setCurrentStepContent(null);
    setError(null);
    clearSourceLogs(); // 새로운 상호작용 시작 시 출처 로그 초기화
    setCurrentExtractedEntities({}); // 새로운 상호작용 시작 시 엔티티 초기화
    
    const userQuery = interactionInput.trim();
    setInteractionInput('');
    setIsSendingInteraction(true);
    setLastUserInput(userQuery); // <--- 입력 전송 시에만 lastUserInput 갱신
    
    // 전역 변수에 사용자의 원본 질문 저장 (PostForm에서 접근하기 위해)
    window.lastUserInput = userQuery;

    try {
        addApiCallLog('LLM', t('banyaAgentAnalyzing')); // getLayout api 대신 LLM 시작 메시지
        // getGeminiIntent 호출 변경: 객체 반환을 기대
        const { matched_intent: matchedIntentKey, extracted_entities: extractedEntities } = await getGeminiIntent(userQuery, geminiIntentKeywords);
        console.log("Matched Intent Key from Gemini:", matchedIntentKey);
        console.log("Extracted Entities from Gemini:", extractedEntities);
        addApiCallLog('Gemma', `LLM 의도 분석 완료: ${matchedIntentKey}`); // 기존 Gemini 로그는 유지

        let llmResponseExplanation = "";
        let initialStep = null;
        let selectedLayoutData = null;

        if (matchedIntentKey && matchedIntentKey !== "NONE" && matchedIntentKey !== "ERROR") {
            const parts = matchedIntentKey.split('_');
            const stepIdFromIntent = parseInt(parts[parts.length - 1]);
            
            // 자동차 업계 워크플로우 처리
            if (matchedIntentKey.startsWith("AUTOMOTIVE_")) {
                selectedLayoutData = fixedLayoutData;
                initialStep = fixedLayoutData.find(s => s.step_id === stepIdFromIntent);
                if (initialStep) {
                    llmResponseExplanation = initialStep.answer?.[0] || initialStep.description || t('workflowStart');
                } else {
                    llmResponseExplanation = t('workflowNotFound');
                }
            }
            // 병원용 워크플로우 처리
            else if (matchedIntentKey.startsWith("HOSPITAL_")) {
                selectedLayoutData = fixedLayoutData;
                if (matchedIntentKey.startsWith("HOSPITAL_FULL_WORKFLOW_")) {
                    initialStep = fixedLayoutData.find(s => s.step_id === stepIdFromIntent);
                    llmResponseExplanation = initialStep?.answer?.[0] || initialStep?.description || "업무의 전체 워크플로우를 준비했습니다.";
                } else {
                    initialStep = fixedLayoutData.find(s => s.step_id === stepIdFromIntent);
                    if (initialStep) {
                                            llmResponseExplanation = initialStep.answer?.[0] || initialStep.description || t('workflowStart');
                    // 환자 이름이 추출되었다면 설명에 추가
                    if (extractedEntities?.patient_name) {
                        llmResponseExplanation = `'${extractedEntities.patient_name}' 환자 ${initialStep.process_name}을(를) 조회합니다.`;
                    }
                } else {
                    llmResponseExplanation = t('workflowNotFound');
                }
                }
            }
        } else {
            llmResponseExplanation = t('sorryNotUnderstood');
        }

        // 선택된 LLM 모델명을 explanation에 추가
        llmResponseExplanation += ` (LLM: ${selectedLLM})`;

        setLlmExplanation(llmResponseExplanation);
        onLlmExplanationChange(llmResponseExplanation); // NEW: LLM 설명 변경 시 상위 컴포넌트로 전달

        if (initialStep && selectedLayoutData) {
            setLayoutData(selectedLayoutData);
            setCurrentExtractedEntities(extractedEntities); // 추출된 엔티티 상태 저장
            const initialIdx = selectedLayoutData.findIndex(s => s.step_id === initialStep.step_id);
            if (initialIdx !== -1) {
                setCurrentStepIndex(initialIdx); // useEffect가 이 변경을 감지하여 fetchAndRenderStep 호출
            } else {
                setError(`시작 스텝 ID ${initialStep.step_id}를 layoutData에서 찾을 수 없습니다.`);
                handleWorkflowComplete("LLM 응답 오류: 워크플로우를 시작할 수 없습니다.");
            }
        } else {
            setLayoutData([]);
            setCurrentStepIndex(null);
        }

    } catch (err) {
      console.error("Error processing intent or LLM API:", err);
      addApiCallLog('Gemma', `LLM 의도 분석 실패: ${err.message}`);
      setError(`LLM 응답 오류: ${err.message}`);
      setLlmExplanation(t('llmResponseError'));
      onLlmExplanationChange(t('llmResponseError')); // NEW: 오류 시 상위 컴포넌트로 전달
    } finally {
      setIsSendingInteraction(false);
      // interactionInputRef.current?.focus(); // 이 포커스 호출은 이제 새로운 useEffect에서 처리됩니다.
    }
  };


  return (
    <div className="interaction-page-container">
      {/* Main Content Area: flex container for centering content */}
      <div className="interaction-main-content-wrapper">
        {/* Localized loading indicator within the main content area */}
        {(isLoadingStep || isSendingInteraction) && (
            <div className="step-overlay-loading"> {/* Using step-overlay-loading for local overlay */}
                <LoadingAnimation 
                    message={isSendingInteraction ? t('llmResponseWaiting') : t('loading')} 
                />
            </div>
        )}

        {/* LLM Explanation (고정 알림 메시지) */}
        {llmExplanation && !isSendingInteraction && !isLoadingStep && (
            <div className="llm-notification-wrapper">
                <img src={LightbulbIcon} alt="Info" className="llm-notification-icon" />
                <p className="llm-notification-message">{llmExplanation}</p>
            </div>
        )}

        {/* 워크플로우 관련 모델 메시지 표시 영역 (이제 사용자 메시지는 표시 안 함) */}
        {interactionChatHistory.length > 0 && (
            <div className="interaction-chat-history-display">
              {interactionChatHistory.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.role}`}>
                  <div className="message-bubble">
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatDisplayRef} />
            </div>
        )}

        {/* LLM이 워크플로우를 반환하고, 현재 렌더링할 스텝이 있을 때만 동적 UI 표시 */}
        {layoutData.length > 0 && currentStepIndex !== null && currentStepIndex < layoutData.length && (
          <div className="interaction-dynamic-content">
            {currentStepContent}
          </div>
        )}
        {llmExplanation && layoutData.length === 0 && currentStepIndex === null && !isSendingInteraction && !isLoadingStep && (
          <div className="interaction-dynamic-content">
              {/* 이 경우 llmExplanation이 상단에 고정되므로, 여기서는 비워둡니다. */}
          </div>
        )}
      </div> {/* interaction-main-content-wrapper 끝 */}


      {/* InteractionPage 하단에 InputBox 추가 */}
      <InputBox
        value={interactionInput}
        onChange={(e) => setInteractionInput(e.target.value)}
        onSend={handleInteractionInputSend}
        isLoading={isSendingInteraction || isLoadingStep}
        placeholder={t('placeholder')}
        inputRef={interactionInputRef}
      />
    </div>
  );
}

// TableRenderer 컴포넌트 (2차원 배열 지원 추가)
const TableRenderer = ({ data, header }) => {
  if (!Array.isArray(data) || data.length === 0) { // 방어 코드 추가
    return <p className="no-data-message">표시할 데이터가 없거나 형식이 올바르지 않습니다.</p>;
  }

  

      // 2차원 배열인지 확인
    const is2DArray = Array.isArray(data[0]) && data[0].length > 0;
    
    if (is2DArray) {
      // 2차원 배열 처리
    const tableHeader = data[0]; // 첫 번째 행이 헤더
    const tableData = data.slice(1); // 나머지 행이 데이터
    
    return (
      <div className="table-wrapper">
        <table className="styled-table">
          <thead>
            <tr>
              {tableHeader?.map((item, index) => (
                <th key={index}>{item}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData?.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row?.map((cell, colIndex) => (
                  <td key={colIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } else {
    // 기존 객체 배열 처리 (병원 데이터)
    return (
      <div className="table-wrapper">
        <table className="styled-table">
          <thead>
            <tr>
              {header?.map((item, index) => (
                <th key={index}>{item}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {header?.map((col, colIndex) => (
                  <td key={colIndex}>{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
};

// PostForm 컴포넌트 (addApiCallLog prop 추가)
const PostForm = ({ step, onFormSubmit, addApiCallLog }) => {
  const [formData, setFormData] = useState({});
  const [fileContent, setFileContent] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const initialData = {};
    step.api.parameters.forEach(paramConfig => {
      const paramName = typeof paramConfig === 'string' ? paramConfig : paramConfig.type;
      const paramType = typeof paramConfig === 'object' && paramConfig.type ? paramConfig.type : 'text';
      
      let defaultValue = '';
      if (paramType === "date") defaultValue = new Date().toISOString().substring(0, 10);
      else if (paramType === "description") {
        // 이메일 전송의 경우 사용자의 원본 질문에서 이메일 내용 추출하여 원문과 번역 설정
        if (step.api.url === '/api/send_email') {
          const originalQuestion = window.lastUserInput || "정보 전송";
          
          // 사용자의 원본 질문에서 이메일 내용 추출
          if (originalQuestion.includes('다음 이메일을') || originalQuestion.includes('이메일을')) {
            const emailMatch = originalQuestion.match(/다음 이메일을[^:]*:(.*?)(?=\.$|$)/s);
            if (emailMatch) {
              const originalContent = emailMatch[1].trim();
              // 비동기 번역을 위해 기본값으로 원문만 설정하고, useEffect에서 번역 처리
              defaultValue = originalContent;
            } else {
              defaultValue = originalQuestion;
            }
          } else {
            defaultValue = originalQuestion;
          }
        } else {
          defaultValue = "정보 전송";
        }
      }
      initialData[paramName] = defaultValue;
    });
    setFormData(initialData);
    setFormError('');
    setFileContent('');
    
    // 이메일 전송의 경우 자동으로 번역 처리
    if (step.api.url === '/api/send_email' && initialData.description) {
      const handleAutoTranslate = async () => {
        try {
          const originalContent = initialData.description;
          const translatedContent = await translateToKorean(originalContent);
          const emailContent = `=== 원문 ===\n${originalContent}\n\n=== 한국어 번역 ===\n${translatedContent}`;
          setFormData(prev => ({ ...prev, description: emailContent }));
        } catch (error) {
          console.error('Auto translation error:', error);
          // 번역 실패 시 원본 텍스트 유지
        }
      };
      
      handleAutoTranslate();
    }
  }, [step.api.parameters, step.api.url]);

  const handleChange = (e) => {
    setFormError('');
    const { name, value, type, files } = e.target;
    if (type === 'file' && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target.result);
        setFormData(prev => ({ ...prev, [name]: event.target.result }));
      };
      reader.onerror = () => {
        setFormError("파일을 읽는 중 오류가 발생했습니다.");
        setFileContent('');
        setFormData(prev => ({ ...prev, [name]: '' }));
      };
      reader.readAsText(file);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRecipientSelect = useCallback((email) => {
    setFormData(prev => ({ ...prev, recipient_email: email }));
  }, []);



  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('PostForm handleSubmit - formData:', formData);
    console.log('PostForm handleSubmit - step.api.parameters:', step.api.parameters);
    
    for (const paramConfig of step.api.parameters) {
      const paramName = typeof paramConfig === 'string' ? paramConfig : paramConfig.name;
      const paramType = typeof paramConfig === 'object' && paramConfig.type ? paramConfig.type : 'text';

      console.log(`검사 중: ${paramName} = ${formData[paramName]}`);

      if (!formData[paramName] || String(formData[paramName]).trim() === '') {
        setFormError(`모든 필드를 채워주세요: '${paramName}' 필드가 비어있습니다.`);
        return;
      }
    }
    
    console.log('PostForm validation passed, calling onFormSubmit');
    onFormSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="interaction-form">
      {step.api.parameters.map(paramConfig => {
        const paramName = typeof paramConfig === 'string' ? paramConfig : paramConfig.name;
        const paramType = typeof paramConfig === 'object' && paramConfig.type ? paramConfig.type : 'text';

        return (
          <div className="form-group" key={paramName}>
            <label htmlFor={paramName}>{paramName}:</label>
            {paramType === 'date' ? (
              <input type="date" id={paramName} name={paramName} value={formData[paramName] || ''} onChange={handleChange} required />
            ) : paramType === 'description' ? (
              <div className="email-content-display">
                {formData[paramName] && formData[paramName].includes('=== 원문 ===') ? (
                  <div>
                    <div className="email-content-section email-content-original">
                      <p>{formData[paramName].split('=== 원문 ===')[1].split('=== 한국어 번역 ===')[0].trim()}</p>
                    </div>
                    <div className="email-content-section email-content-translation">
                      <p>{formData[paramName].split('=== 한국어 번역 ===')[1].trim()}</p>
                    </div>
                  </div>
                ) : (
                  <textarea id={paramName} name={paramName} rows="3" style={{ height: '50px' }} value={formData[paramName] || ''} onChange={handleChange} required />
                )}
              </div>
            ) : paramType === 'data' ? (
              <>
                <input type="file" id={paramName} name={paramName} onChange={handleChange} accept="*/*" required />
                {fileContent && <p className="file-preview">File content: {fileContent.substring(0, 200)}...</p>}
              </>
            ) : paramType === 'searchable_recipient' ? (
              <RecipientSearchInput
                id={paramName}
                name={paramName}
                value={formData[paramName] || ''}
                onSelectRecipient={handleRecipientSelect}
                addApiCallLog={addApiCallLog}
              />
            ) : (
              <input type="text" id={paramName} name={paramName} value={formData[paramName] || ''} onChange={handleChange} required />
            )}
          </div>
        );
      })}
      {formError && <p className="error-message">{formError}</p>}
      <button type="submit">Send</button>
    </form>
  );
};

// RecipientSearchInput 컴포넌트
const RecipientSearchInput = ({ id, name, value, onSelectRecipient, addApiCallLog }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRecipientName, setSelectedRecipientName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (value) {
        // 병원용 수신자 확인
        const hospitalSelected = (mockApi.getRecipientData() || []).find(r => r.이메일 === value);
        const selected = hospitalSelected;
        
        if (selected) {
            setSelectedRecipientName(`${selected.이름} (${selected.이메일})`);
            setSearchTerm(`${selected.이름} (${selected.이메일})`);
        }
    } else if (value === '') {
        setSelectedRecipientName('');
        setSearchTerm('');
        setSearchResults([]);
    }
  }, [value]);


  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim() === '' || selectedRecipientName === searchTerm) { 
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        addApiCallLog('LLM', `수신자 검색 LLM 이 '${searchTerm}' 에 대한 의미를 분석 중입니다.`);
        // 병원용 수신자 검색
        const hospitalResponse = await mockApi.searchRecipients(searchTerm);
        
        if (hospitalResponse.success) {
          setSearchResults(hospitalResponse.data.slice(0, 5)); // 상위 5개만 표시
          addApiCallLog('Gemma', `LLM 의미 검색 완료: ${hospitalResponse.data.length}명`);
        } else {
          setSearchResults([]);
          addApiCallLog('Gemma', `LLM 의미 검색 실패`);
        }
      } catch (error) {
        console.error("Error searching recipients:", error);
        setSearchResults([]);
        addApiCallLog('Gemma', `LLM 의미 검색 중 오류 발생: ${error.message}`);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  }, [searchTerm, addApiCallLog, selectedRecipientName]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedRecipientName('');
    onSelectRecipient('');
  };

  const handleResultClick = (recipient) => {
    setSelectedRecipientName(`${recipient.이름} (${recipient.이메일})`);
    setSearchTerm(`${recipient.이름} (${recipient.이메일})`);
    onSelectRecipient(recipient.이메일);
    setSearchResults([]);
  };

  return (
    <div className="recipient-search-container">
      <input
        type="text"
        id={id}
        name={name}
        value={searchTerm}
        onChange={handleInputChange}
        placeholder="수신자 이름, 부서, 직책 등으로 검색"
        required
        autoComplete="off"
      />
      {isSearching && <div className="search-loading">검색 중...</div>}
      {searchResults.length > 0 && !selectedRecipientName && (
        <ul className="search-results-list">
          {searchResults.map((recipient, index) => (
            <li key={index} onClick={() => handleResultClick(recipient)}>
              <strong>{recipient.이름}</strong> ({recipient.부서 || '부서 없음'}, {recipient.직책 || '직책 없음'}) - {recipient.이메일}
            </li>
          ))}
        </ul>
      )}
      {searchTerm && !selectedRecipientName && searchResults.length === 0 && !isSearching && (
        <p className="no-results-message">검색 결과가 없습니다.</p>
      )}
      {selectedRecipientName && (
        <p className="selected-recipient-display">
          선택됨: <strong>{selectedRecipientName}</strong>
        </p>
      )}
    </div>
  );
};


export default InteractionPage;