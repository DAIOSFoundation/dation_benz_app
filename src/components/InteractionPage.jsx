import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './InteractionPage.css';
import { mockApi, fixedLayoutData } from '../api/mockApi';
import { manufacturingMockApi, manufacturingLayoutData, manufacturingRecipientData } from '../api/manufacturingMockApi';
import InputBox from './InputBox';
import LightbulbIcon from '../assets/lightbulb.png';
import { getGeminiIntent } from '../utils/geminiApi';

// NEW PROP: onLlmExplanationChange, clearSourceLogs
function InteractionPage({ addApiCallLog, clearSourceLogs, selectedLLM, onLlmExplanationChange, currentOperator }) {
  const [layoutData, setLayoutData] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(null);
  const [currentStepContent, setCurrentStepContent] = useState(null);
  const [isLoadingStep, setIsLoadingStep] = useState(false);
  const [error, setError] = useState(null);

  // Interaction 페이지 최초 로딩 시 표시될 알림 메시지로 llmExplanation을 초기화합니다.
  const [llmExplanation, setLlmExplanation] = useState("안녕하세요. Banya Agent 이 업무를 도와 드립니다.");
  const [interactionChatHistory, setInteractionChatHistory] = useState([]);
  const [interactionInput, setInteractionInput] = useState('');
  const [isSendingInteraction, setIsSendingInteraction] = useState(false);
  const interactionInputRef = useRef(null);
  const chatDisplayRef = useRef(null);

  // LLM이 추출한 엔티티(예: 환자 이름)를 저장하는 상태
  const [currentExtractedEntities, setCurrentExtractedEntities] = useState({});

  // 1. lastUserInput 상태 추가
  const [lastUserInput, setLastUserInput] = useState('');

  // 병원용과 제조용 fixedLayoutData의 question들을 Gemini가 이해할 수 있는 매핑으로 변환
  const geminiIntentKeywords = useMemo(() => {
    const keywords = {};
    
    // 병원용 워크플로우
    fixedLayoutData.forEach(step => {
        if (step.question && step.question.length > 0) {
            const intentKey = `HOSPITAL_${step.process_name.replace(/ /g, '_').toUpperCase()}_${step.step_id}`;
            keywords[intentKey] = step.question;
        }
        if (step.step_id === 0) { // Assuming step_id 0 is the full workflow overview
            keywords["HOSPITAL_FULL_WORKFLOW_0"] = ["병원 소개", "병원 일반 정보", "홈페이지", "업무 안내", "병원 홍보", "진료 과목", "일반 시술 안내"];
        }
    });
    
    // 제조용 워크플로우
    manufacturingLayoutData.forEach(step => {
        if (step.question && step.question.length > 0) {
            const intentKey = `MANUFACTURING_${step.process_name.replace(/ /g, '_').toUpperCase()}_${step.step_id}`;
            keywords[intentKey] = step.question;
        }
    });
    
    return keywords;
  }, []);

  // ID-Name 매핑 데이터를 위한 useMemo (병원용과 제조용 통합)
  const idToNameMaps = useMemo(() => {
    const patients = mockApi.getPatientDataForMapping();
    const products = mockApi.getProductDataForMapping();
    const leads = mockApi.getLeadDataForMapping();
    const hospitalRecipients = mockApi.getRecipientData();
    const manufacturingRecipients = manufacturingRecipientData;

    const patientIdToName = new Map(patients.map(p => [p.patient_id, p.name]));
    const productIdToName = new Map(products.map(p => [p.product_id, p.name]));
    const leadIdToName = new Map(leads.map(l => [l.lead_id, l.name]));
    const hospitalRecipientEmailToName = new Map(hospitalRecipients.map(r => [r.이메일, r.이름]));
    const manufacturingRecipientEmailToName = new Map(manufacturingRecipients.map(r => [r.이메일, r.이름]));

    return {
      patientIdToName,
      productIdToName,
      leadIdToName,
      hospitalRecipientEmailToName,
      manufacturingRecipientEmailToName,
    };
  }, []); // 의존성 배열 비워두어 컴포넌트 마운트 시 한 번만 계산

  // 장비 제어 파라미터 데이터 (명령어 딕셔너리)
  const controlParameters = [
      { equipment: '압출기 1', parameter: '온도 설정값 (1구간)', unit: '°C', min: 200, max: 300 },
      { equipment: '압출기 1', parameter: '온도 설정값 (3구간)', unit: '°C', min: 250, max: 300 },
      { equipment: '압출기 1', parameter: '스크류 속도', unit: 'RPM', min: 10, max: 150 },
      { equipment: '연신 라인 1', parameter: '장력 목표값', unit: 'N', min: 1000, max: 2000 },
      { equipment: '화학 반응기 2', parameter: '온도 설정값', unit: '°C', min: 150, max: 250 },
      { equipment: '화학 반응기 2', parameter: '교반기 속도', unit: 'RPM', min: 50, max: 200 },
      { equipment: '건조 오븐 1', parameter: '온도 설정값', unit: '°C', min: 80, max: 180 },
      { equipment: '건조 오븐 1', parameter: '팬 속도', unit: 'RPM', min: 500, max: 1500 },
  ];

  // 입력문에서 장비/파라미터/값/사유 추출 함수 (데이터 딕셔너리 기반으로 개선)
  function extractManualOverrideParams(input) {
      // 1. Extract numerical value and reason from the input.
      const valueMatches = input.match(/([0-9]+(\.[0-9]+)?)/g);
      const value = valueMatches ? parseFloat(valueMatches[valueMatches.length - 1]) : null;

      const reasonMatch = input.match(/(?:이유|사유)[는: ]+([^\.]+)[\. ]?/);
      const reason = reasonMatch ? reasonMatch[1].trim() : null;

      if (value === null) {
          return { equipment: null, parameter: null, value: null, reason };
      }

      // 2. Find the best matching parameter from the dictionary based on a scoring system.
      let bestMatch = null;
      let maxScore = -1;

      controlParameters.forEach(p => {
          // Rule: The value must be within the valid range for the parameter.
          if (value < p.min || value > p.max) {
              return; // Skip this parameter if the value is out of bounds.
          }
          
          let currentScore = 0;

          // Rule: The equipment name must be present in the input.
          if (!input.includes(p.equipment)) {
              return; // Skip if the equipment isn't mentioned.
          }
          currentScore += 10; // Give a high score for matching the equipment.

          // Rule: Score based on how many parameter keywords are present.
          const parameterKeywords = p.parameter.replace(/[()]/g, ' ').split(' ').filter(k => k);
          parameterKeywords.forEach(keyword => {
              if (input.includes(keyword)) {
                  currentScore++;
              }
          });

          // Update the best match if the current parameter has a higher score.
          if (currentScore > maxScore) {
              maxScore = currentScore;
              bestMatch = p;
          }
      });

      if (bestMatch) {
          return {
              equipment: bestMatch.equipment,
              parameter: bestMatch.parameter,
              value: String(value),
              reason,
          };
      }

      // Return null if no suitable match is found.
      return { equipment: null, parameter: null, value: null, reason };
  }

  useEffect(() => {
    interactionInputRef.current?.focus();
    // 컴포넌트 마운트 시 초기 LLM 설명 메시지를 부모 컴포넌트로 전달하여 App.jsx의 lastLlmExplanation 상태를 업데이트합니다.
    onLlmExplanationChange("안녕하세요. Banya Agent 이 업무를 도와 드립니다.");
  }, []);

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


  const renderSopData = useCallback((data) => {
    // This render function is kept but will likely not be used for hospital data unless formatted similarly
    if (!Array.isArray(data) || data.length < 2) return null;

    const sopNoRow = data[0];
    const headerRow = data[1];
    const dataRows = data.slice(2);

    return (
      <div>
        <div className="sop-no-display">
          <span>{sopNoRow[0]}: </span>
          <strong>{sopNoRow[1]}</strong>
        </div>
        <TableRenderer data={dataRows} header={headerRow} />
      </div>
    );
  }, []);


  const renderData = useCallback((data) => {
    if (!Array.isArray(data) || data.length === 0) return null;

    // 2차원 배열인지 확인 (BOM, SOP 데이터)
    const is2DArray = Array.isArray(data[0]) && data[0].length > 0;
    
    if (is2DArray) {
      // 2차원 배열은 바로 TableRenderer에 전달
      return <TableRenderer data={data} header={null} />;
    }

    const { patientIdToName, productIdToName, leadIdToName, hospitalRecipientEmailToName, manufacturingRecipientEmailToName } = idToNameMaps;

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
            // 병원용과 제조용 수신자 모두 확인
            if (hospitalRecipientEmailToName.has(newRow[key])) {
                newRow['recipient_name'] = hospitalRecipientEmailToName.get(newRow[key]);
            } else if (manufacturingRecipientEmailToName.has(newRow[key])) {
                newRow['recipient_name'] = manufacturingRecipientEmailToName.get(newRow[key]);
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


  const fetchAndRenderStep = useCallback(async (step, extractedEntities = {}) => {
    setIsLoadingStep(true);
    setError(null);

    let contentToRender = null;
    let isIframe = false;

    // Special handling for step 750: Manual Equipment Control URL generation
    if (step.step_id === 750) {
      const parameterlessKeywords = ['장비 제어', '수동 제어', '장비 제어 현황'];
      let fullUrl = null;

      if (parameterlessKeywords.includes(lastUserInput.trim())) {
        fullUrl = "http://localhost:3000/manual-override";
      } else if (lastUserInput) {
        const params = extractManualOverrideParams(lastUserInput);
        if (params.equipment && params.parameter && params.value) {
          const baseUrl = "http://localhost:3000/manual-override";
          const urlParams = new URLSearchParams({
            equipment: params.equipment,
            parameter: params.parameter,
            value: params.value,
            reason: params.reason || '',
            operator: currentOperator || ''
          });
          fullUrl = `${baseUrl}?${urlParams.toString()}`;
        }
      }

      if (fullUrl) {
          isIframe = true;
          contentToRender = (
            <div className="iframe-container">
              <iframe
                src={fullUrl}
                title={step.process_name}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                onLoad={() => { setIsLoadingStep(false); addApiCallLog('External Content', `외부 웹 페이지 (${fullUrl}) 로드 완료.`); }}
                onError={() => { setError(`외부 웹 페이지 로드 실패: ${fullUrl}`); setIsLoadingStep(false); addApiCallLog('External Content', `외부 웹 페이지 (${fullUrl}) 로드 실패.`); }}
              ></iframe>
            </div>
          );
      } else {
        const errorMessage = '장비 제어 명령을 위한 파라미터(장비, 항목, 값)를 찾을 수 없거나, 명령어가 올바르지 않습니다. "장비 제어" 또는 "압출기 1 온도 250도로 설정"과 같이 입력해주세요.';
        setError(errorMessage);
        setIsLoadingStep(false);
        setCurrentStepContent(
          <div className="dynamic-app-wrapper">
              <h2>{step.process_name}</h2>
              <p>{step.description}</p>
              <p className="error-message">{errorMessage}</p>
          </div>
        );
        return;
      }
    } else if (step.api && step.api.url) {
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
              case 'bom': apiResponse = await manufacturingMockApi.getBom(); break;
              case 'sop': apiResponse = await manufacturingMockApi.getSop(); break;
              case 'callback':
                if (step.step_id === 701) { 
                  apiResponse = await manufacturingMockApi.getCallback();
                } else {
                  apiResponse = await mockApi.getCallback();
                }
                addApiCallLog('API', '콜백 수신 완료.');
                break;
              default: throw new Error(`Unsupported GET API: ${urlPath}`);
            }
            
            if (apiResponse.data && apiResponse.data.length > 0) {
                contentToRender = renderData(apiResponse.data || apiResponse.message);
            } else {
                contentToRender = <p className="no-data-message">조회된 데이터가 없습니다.</p>;
                if (patientName) {
                    contentToRender = <p className="no-data-message">'{patientName}' 환자 관련 데이터를 찾을 수 없습니다.</p>;
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
                    addApiCallLog('API', 'Agent 가 파악한 API 를 호출합니다.');
                    let json;
                    // Check if the step belongs to the manufacturing workflow
                    if (step.step_id === 701) { 
                      json = await manufacturingMockApi.postSend(formData);
                    } else {
                      json = await mockApi.postSend(formData);
                    }
                    setInteractionChatHistory((prev) => [...prev, { role: 'model', content: `POST 요청 완료: ${json.message || '응답 메시지 없음'}` }]);
                    const nextStepConfig = step.next_step && step.next_step.length > 0 ? step.next_step[0] : null;
                    if (nextStepConfig && nextStepConfig.step_id !== null) {
                      const nextIdx = layoutData.findIndex(s => s.step_id === nextStepConfig.step_id);
                      if (nextIdx !== -1) { setCurrentStepIndex(nextIdx); }
                      else { setError(`다음 스텝 ID ${nextStepConfig.step_id}를 layoutData에서 찾을 수 없습니다.`); handleWorkflowComplete("워크플로우가 예상치 못하게 종료되었습니다."); }
                    } else { handleWorkflowComplete("워크플로우가 성공적으로 완료되었습니다."); }
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
          {/* 장비 제어(750) 단계에만 Next 버튼 추가 */}
          {step.step_id === 750 && (
            <button
              className="next-btn"
              onClick={() => {
                const nextIdx = layoutData.findIndex(s => s.step_id === 761);
                if (nextIdx !== -1) setCurrentStepIndex(nextIdx);
              }}
            >
              Next
            </button>
          )}
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
  }, [layoutData, handleWorkflowComplete, renderData, addApiCallLog, lastUserInput, currentOperator]);


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

    try {
        addApiCallLog('LLM', 'Banya Agent LLM 이 업무 절차를 분석 중입니다.'); // getLayout api 대신 LLM 시작 메시지
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
            
            // 병원용과 제조용 워크플로우 구분
            if (matchedIntentKey.startsWith("HOSPITAL_")) {
                selectedLayoutData = fixedLayoutData;
                if (matchedIntentKey.startsWith("HOSPITAL_FULL_WORKFLOW_")) {
                    initialStep = fixedLayoutData.find(s => s.step_id === stepIdFromIntent);
                    llmResponseExplanation = initialStep?.answer[0] || "업무의 전체 워크플로우를 준비했습니다.";
                } else {
                    initialStep = fixedLayoutData.find(s => s.step_id === stepIdFromIntent);
                    if (initialStep) {
                        llmResponseExplanation = initialStep.answer[0];
                        // 환자 이름이 추출되었다면 설명에 추가
                        if (extractedEntities?.patient_name) {
                            llmResponseExplanation = `'${extractedEntities.patient_name}' 환자 ${initialStep.process_name}을(를) 조회합니다.`;
                        }
                    } else {
                        llmResponseExplanation = "죄송합니다. LLM이 요청을 이해했지만, 해당 워크플로우 스텝을 찾을 수 없습니다.";
                    }
                }
            } else if (matchedIntentKey.startsWith("MANUFACTURING_")) {
                selectedLayoutData = manufacturingLayoutData;
                initialStep = manufacturingLayoutData.find(s => s.step_id === stepIdFromIntent);
                if (initialStep) {
                    llmResponseExplanation = initialStep.answer[0];
                } else {
                    llmResponseExplanation = "죄송합니다. LLM이 요청을 이해했지만, 해당 제조 워크플로우 스텝을 찾을 수 없습니다.";
                }
            }
        } else {
            llmResponseExplanation = "죄송합니다. 요청하신 내용을 이해하지 못했습니다. 다른 방식으로 질문해 주시겠어요.";
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
      setLlmExplanation('죄송합니다. LLM 응답 처리 중 문제가 발생했습니다.');
      onLlmExplanationChange('죄송합니다. LLM 응답 처리 중 문제가 발생했습니다.'); // NEW: 오류 시 상위 컴포넌트로 전달
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
                {isSendingInteraction ? 'LLM 응답 대기 중...' : '로딩 중...'}
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
        placeholder="원하는 Task를 말씀해 보세요."
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

  // SOP 데이터인지 판별 (두 번째 행에 '비고'가 2개)
  const isSopTable = Array.isArray(data[0]) && data[1] && Array.isArray(data[1]) && data[1].filter(x => x === "비고").length === 2;

  if (isSopTable) {
    // SopManager 컴포넌트 정의 (내부)
    const SopManager = ({ initialSopData }) => {
      const STORAGE_KEY = "sopRows";
      // localStorage에서 불러오기, 없으면 initialSopData 사용
      const getInitialRows = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try { return JSON.parse(saved); } catch { return initialSopData.slice(2); }
        }
        return initialSopData.slice(2);
      };
      const [sopRows, setSopRows] = React.useState(getInitialRows);

      // sopRows가 바뀔 때마다 localStorage에 저장
      React.useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sopRows));
      }, [sopRows]);

      const [form, setForm] = React.useState({ 단계: '', 항목: '', 방법: '', 방법상세: '', 기준: '', sop: '', 비고: '' });
      const [editIdx, setEditIdx] = React.useState(null);

      // 입력 변경 핸들러
      const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

      // 추가/수정
      const handleSubmit = e => {
        e.preventDefault();
        if (editIdx === null) {
          setSopRows([...sopRows, Object.values(form)]);
        } else {
          setSopRows(sopRows.map((row, idx) => idx === editIdx ? Object.values(form) : row));
          setEditIdx(null);
        }
        setForm({ 단계: '', 항목: '', 방법: '', 방법상세: '', 기준: '', sop: '', 비고: '' });
      };

      // 행 클릭(수정)
      const handleRowClick = idx => {
        setEditIdx(idx);
        const [단계, 항목, 방법, 방법상세, 기준, sop, 비고] = sopRows[idx];
        setForm({ 단계, 항목, 방법, 방법상세, 기준, sop, 비고 });
      };

      // 삭제
      const handleDelete = idx => setSopRows(sopRows.filter((_, i) => i !== idx));

      const fixedHeader = [
        "검사 단계", "검사 항목", "검사 방법", "검사 방법 상세", "합격 기준", "관련 SOP", "비고"
      ];
      const sopNoRow = initialSopData[0];

      return (
        <div style={{ width: '100%' }}>
          <form onSubmit={handleSubmit} className="sop-form-row">
            {["단계", "항목", "방법", "방법상세", "기준", "sop", "비고"].map((key, i) => (
              <input
                key={key}
                name={key}
                value={form[key]}
                onChange={handleChange}
                placeholder={["검사 단계", "검사 항목", "검사 방법", "검사 방법 상세", "합격 기준", "관련 SOP", "비고"][i]}
              />
            ))}
            <button type="submit">{editIdx === null ? "추가" : "수정"}</button>
            {editIdx !== null && <button type="button" onClick={() => { setEditIdx(null); setForm({ 단계: '', 항목: '', 방법: '', 방법상세: '', 기준: '', sop: '', 비고: '' }); }}>취소</button>}
          </form>
          <div className="table-wrapper">
            <table className="styled-table">
              <thead>
                <tr>
                  <th colSpan={fixedHeader.length + 1} style={{ textAlign: "left" }}>
                    {sopNoRow[0]}: <strong>{sopNoRow[1]}</strong>
                  </th>
                </tr>
                <tr>
                  {fixedHeader.map((item, idx) => (
                    <th key={idx}>{item}</th>
                  ))}
                  <th>삭제</th>
                </tr>
              </thead>
              <tbody>
                {sopRows.map((row, idx) => (
                  <tr key={idx} onClick={() => handleRowClick(idx)} style={{ background: editIdx === idx ? '#eef' : undefined }}>
                    {row.map((cell, i) => <td key={i}>{cell}</td>)}
                    <td><button onClick={e => { e.stopPropagation(); handleDelete(idx); }}>삭제</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    };
    // SopManager 렌더링
    return <SopManager initialSopData={data} />;
  }

  // 2차원 배열인지 확인 (BOM, SOP 데이터)
  const is2DArray = Array.isArray(data[0]) && data[0].length > 0;
  
  if (is2DArray) {
    // 2차원 배열 처리 (BOM, SOP 데이터)
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
      else if (paramType === "description") defaultValue = "정보 전송";
      initialData[paramName] = defaultValue;
    });
    setFormData(initialData);
    setFormError('');
    setFileContent('');
  }, [step.api.parameters]);

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
              <textarea id={paramName} name={paramName} rows="3" style={{ height: '50px' }} value={formData[paramName] || ''} onChange={handleChange} required />
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
        // 병원용과 제조용 수신자 모두 확인
        const hospitalSelected = (mockApi.getRecipientData() || []).find(r => r.이메일 === value);
        const manufacturingSelected = (manufacturingRecipientData || []).find(r => r.이메일 === value);
        const selected = hospitalSelected || manufacturingSelected;
        
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
        // 병원용과 제조용 수신자 검색 모두 시도
        const hospitalResponse = await mockApi.searchRecipients(searchTerm);
        const manufacturingResponse = await manufacturingMockApi.searchRecipients(searchTerm);
        
        // 두 결과를 합쳐서 정렬
        const allResults = [...(hospitalResponse.data || []), ...(manufacturingResponse.data || [])];
        const uniqueResults = allResults.filter((item, index, self) => 
          index === self.findIndex(t => t.이메일 === item.이메일)
        );
        
        if (hospitalResponse.success || manufacturingResponse.success) {
          setSearchResults(uniqueResults.slice(0, 5)); // 상위 5개만 표시
          addApiCallLog('Gemma', `LLM 의미 검색 완료: ${uniqueResults.length}명`);
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