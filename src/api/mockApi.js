// src/api/mockApi.js
import { calculateSimilarity, preprocessText, getTermFrequency } from '../utils/textSimilarity';

// Import all hospital data JSON files
import appointmentsData from '../../public/data/appointments.json';
import crmLeadsData from '../../public/data/crm_leads.json';
import emrPatientsData from '../../public/data/emr_patients.json';
import emrSurgeriesData from '../../public/data/emr_surgeries.json';
import photoRecordsData from '../../public/data/photo_records.json';
import productsData from '../../public/data/products.json';
import qaDataset from '../../public/data/qa_dataset.json';
import surveysData from '../../public/data/surveys.json';


// 수신자 데이터 정의 (종합병원 직원 정보로 변경)
const recipientData = [
  {
    "이름": "김선우",
    "부서": "성형외과",
    "직책": "과장",
    "소속": "의료진",
    "이메일": "sunwoo.kim@hospital.com",
    "전화번호": "+82-2-1111-2222",
    "근무장소": "본관 3층 진료실"
  },
  {
    "이름": "이지은",
    "부서": "피부과",
    "직책": "의사",
    "소속": "의료진",
    "이메일": "jieun.lee@hospital.com",
    "전화번호": "+82-2-1111-3333",
    "근무장소": "별관 2층 진료실"
  },
  {
    "이름": "박준호",
    "부서": "원무과",
    "직책": "팀장",
    "소속": "행정팀",
    "이메일": "junho.park@hospital.com",
    "전화번호": "+82-2-1111-4444",
    "근무장소": "본관 1층 원무데스크"
  },
  {
    "이름": "최유진",
    "부서": "수술실",
    "직책": "수간호사",
    "소속": "간호부",
    "이메일": "yujin.choi@hospital.com",
    "전화번호": "+82-2-1111-5555",
    "근무장소": "본관 4층 수술실"
  },
  {
    "이름": "정민서",
    "부서": "마케팅팀",
    "직책": "주임",
    "소속": "홍보부",
    "이메일": "minseo.jung@hospital.com",
    "전화번호": "+82-2-1111-6666",
    "근무장소": "별관 5층 사무실"
  },
  {
    "이름": "강지훈",
    "부서": "영상진단과",
    "직책": "방사선사",
    "소속": "진료지원팀",
    "이메일": "jihun.kang@hospital.com",
    "전화번호": "+82-2-1111-7777",
    "근무장소": "본관 지하 1층 영상실"
  },
  {
    "이름": "윤서아",
    "부서": "상담실",
    "직책": "상담실장",
    "소속": "고객지원팀",
    "이메일": "seoa.yoon@hospital.com",
    "전화번호": "+82-2-1111-8888",
    "근무장소": "본관 2층 상담실"
  },
  {
    "이름": "오하준",
    "부서": "약제부",
    "직책": "약사",
    "소속": "의료지원팀",
    "이메일": "hajun.oh@hospital.com",
    "전화번호": "+82-2-1111-9999",
    "근무장소": "본관 1층 약국"
  },
  {
    "이름": "한예림",
    "부서": "회복실",
    "직책": "간호사",
    "소속": "간호부",
    "이메일": "yerim.han@hospital.com",
    "전화번호": "+82-2-1111-0000",
    "근무장소": "본관 4층 회복실"
  },
  {
    "이름": "문성진",
    "부서": "총무과",
    "직책": "대리",
    "소속": "행정팀",
    "이메일": "sungjin.moon@hospital.com",
    "전화번호": "+82-2-1111-1234",
    "근무장소": "본관 5층 총무팀"
  }
];

// Helper to get patient_id from patient_name
const getPatientIdFromName = (name) => {
    const patient = emrPatientsData.find(p => p.name === name);
    return patient ? patient.patient_id : null;
};


// 고정된 layoutData 구조 정의 (병원 업무에 맞게 재구성)
export const fixedLayoutData = [
  {
    "step_id": 0,
    "process_name": "병원 소개",
    "description": "병원 정보를 외부 url 을 통해서 확인하세요.",
    "question": [
      "병원 소개", "병원 일반 정보", "홈페이지", "업무 안내", "병원 홍보", "진료 과목", "일반 시술 안내"
    ],
    "answer": [
      "안녕하세요! 병원에 대한 기본 정보를 알려드립니다. 홈페이지를 참고 하세요."
    ],
    "data": null, // No direct data or API for this intro step
    "api": {
      "url": "https://www.toxnfill.com/brandToxnfill.php",
      "method": "GET",
      "parameters": [] // Can be extended to include patient_id for specific queries
    },
    "next_step": [] // No explicit next step, LLM guides based on user input
  },
  {
    "step_id": 100, // Patient Information
    "process_name": "환자 정보 조회",
    "description": "환자의 기본 정보(이름, 생년월일, 성별, 혈액형, 알레르기, 등록일)를 조회합니다.",
    "question": [
      "환자 정보", "환자 조회", "환자 리스트", "환자 목록", "P001 정보", "박민지 정보",
      "김지훈 환자 정보", "Sara Lim 환자 정보", "이정은 환자 정보", "정현우 환자 정보",
      "최유리 환자 정보", "Marcus Kim 환자 정보", "박수진 환자 정보", "이서아 환자 정보",
      "장도현 환자 정보", "환자 정보 보여줘", "환자 정보 찾아줘"
    ],
    "answer": [
      "환자 정보를 조회합니다. 특정 환자 ID를 알려주시거나, 전체 환자 목록을 보시겠어요?"
    ],
    "data": null,
    "api": {
      "url": "/api/patients",
      "method": "GET",
      "parameters": [] // Can be extended to include patient_id for specific queries
    },
    "next_step": [{ "step_id": 200 }] // Changed to explicit object for consistency
  },
  {
    "step_id": 200, // Appointment Information
    "process_name": "예약 정보 조회",
    "description": "환자의 예약 내역(예약 ID, 환자 ID, 일시, 시술, 상태, 방)을 조회합니다.",
    "question": [
      "예약 정보", "예약 조회", "예약 리스트", "예약 목록", "A301 예약", "김지훈 예약",
      "박민지 환자 예약 내역", "김지훈 환자 예약 내역", "Sara Lim 환자 예약 내역", "이정은 환자 예약 내역",
      "정현우 환자 예약 내역", "최유리 환자 예약 내역", "Marcus Kim 환자 예약 내역", "박수진 환자 예약 내역",
      "이서아 환자 예약 내역", "장도현 환자 예약 내역", "예약 정보 보여줘", "예약 정보 찾아줘"
    ],
    "answer": [
      "예약 정보를 조회합니다. 특정 예약 ID나 환자 ID를 알려주시거나, 전체 예약 목록을 보시겠어요?"
    ],
    "data": null,
    "api": {
      "url": "/api/appointments",
      "method": "GET",
      "parameters": []
    },
    "next_step": [{ "step_id": 900 }] // Changed to explicit object for consistency
  },
  {
    "step_id": 300, // Surgery Information
    "process_name": "수술 기록 조회",
    "description": "환자의 수술 기록(수술 ID, 환자 ID, 시술명, 일자, 집도의, 마취, 비고)을 조회합니다.",
    "question": [
      "수술 기록", "수술 정보", "수술 내역", "S201 수술", "눈매교정 수술",
      "박민지 환자 수술 기록", "수술 기록 보여줘"
    ],
    "answer": [
      "수술 기록을 조회합니다. 특정 수술 ID나 환자 ID를 알려주시거나, 전체 수술 목록을 보시겠어요?"
    ],
    "data": null,
    "api": {
      "url": "/api/surgeries",
      "method": "GET",
      "parameters": []
    },
    "next_step": [{ "step_id": 800 }] // Changed to explicit object for consistency
  },
  {
    "step_id": 400, // Photo Records
    "process_name": "사진 기록 조회",
    "description": "환자의 시술 전후 사진 기록(사진 ID, 환자 ID, 촬영일, 뷰, 파일 경로, 비고)을 조회합니다.",
    "question": [
      "사진 기록", "전후 사진", "P001 사진", "사진 조회",
      "박민지 환자 사진 기록", "사진 기록 보여줘"
    ],
    "answer": [
      "환자 사진 기록을 조회합니다. 특정 환자 ID를 알려주시거나, 전체 사진 목록을 보시겠어요?"
    ],
    "data": null,
    "api": {
      "url": "/api/photo_records",
      "method": "GET",
      "parameters": []
    },
    "next_step": [{ "step_id": 800 }] // Changed to explicit object for consistency
  },
  {
    "step_id": 500, // Product Information
    "process_name": "제품 정보 조회",
    "description": "판매 중인 제품의 정보(제품 ID, 이름, 카테고리, 가격, 재고, 권장 사용법)를 조회합니다.",
    "question": [
      "제품 정보", "제품 가격", "재생크림 A", "흉터연고 C", "제품 목록", "제품 정보 보여줘"
    ],
    "answer": [
      "제품 정보를 조회합니다. 특정 제품 ID나 제품명을 알려주시거나, 전체 제품 목록을 보시겠어요?"
    ],
    "data": null,
    "api": {
      "url": "/api/products",
      "method": "GET",
      "parameters": []
    },
    "next_step": [{ "step_id": 900 }] // Changed to explicit object for consistency
  },
  {
    "step_id": 600, // Survey Results
    "process_name": "설문조사 결과 조회",
    "description": "환자 만족도 설문조사 결과(설문 ID, 환자 ID, 발송일, 평점, 코멘트)를 조회합니다.",
    "question": [
      "설문 결과", "환자 만족도", "SV601 설문", "설문 목록",
      "박민지 환자 설문 결과", "설문 결과 보여줘"
    ],
    "answer": [
      "설문조사 결과를 조회합니다. 특정 설문 ID나 환자 ID를 알려주시거나, 전체 설문 목록을 보시겠어요?"
    ],
    "data": null,
    "api": {
      "url": "/api/surveys",
      "method": "GET",
      "parameters": []
    },
    "next_step": [{ "step_id": 900 }] // Changed to explicit object for consistency
  },
  {
    "step_id": 700, // CRM Leads
    "process_name": "CRM 리드 정보 조회",
    "description": "잠재 고객(리드)의 정보(리드 ID, 이름, 채널, 연락 방법, 상태, 생성일, 선호 시술, 비고)를 조회합니다.",
    "question": [
      "리드 정보", "잠재 고객", "L001 리드", "리드 목록",
      "박민지 리드 정보", "리드 정보 보여줘"
    ],
    "answer": [
      "CRM 리드 정보를 조회합니다. 특정 리드 ID를 알려주시거나, 전체 리드 목록을 보시겠어요?"
    ],
    "data": null,
    "api": {
      "url": "/api/leads",
      "method": "GET",
      "parameters": []
    },
    "next_step": [{ "step_id": 900 }] // Changed to explicit object for consistency
  },
  {
    "step_id": 750, // Equipment Control
    "process_name": "장비 제어",
    "description": "병원 장비의 수동 제어 및 모니터링을 위한 시스템에 접근합니다.",
    "question": [
      "장비 제어", "장비 모니터링", "장비 상태", "장비 관리", "수동 제어", "장비 제어 시스템",
      "장비 제어 페이지", "장비 제어 시스템 접속", "장비 상태 확인", "장비 제어 패널"
    ],
    "answer": [
      "장비 제어 시스템에 접속합니다. 장비의 상태를 확인하고 수동으로 제어할 수 있습니다."
    ],
    "data": null,
    "api": {
      "url": "http://localhost:3000/manual-override",
      "method": "GET",
      "parameters": []
    },
    "next_step": [{ "step_id": 900 }] // Changed to explicit object for consistency
  },
  {
    "step_id": 760, // Production Monitoring
    "process_name": "생산 모니터링",
    "description": "병원 운영 및 생산성 모니터링을 위한 MES/PLM 시스템에 접근합니다.",
    "question": [
      "생산 모니터링", "생산 현황", "MES 시스템", "PLM 시스템", "생산성 모니터링", "운영 모니터링", "생산 관리",
      "MES PLM", "생산 모니터링 시스템", "운영 효율성", "생산성 분석", "MES PLM 시스템", "현황 모니터링"
    ],
    "answer": [
      "생산 모니터링 시스템(MES/PLM)에 접속합니다. 병원 운영 효율성과 생산성을 분석할 수 있습니다."
    ],
    "data": null,
    "api": {
      "url": "http://localhost:3000/mes-plm",
      "method": "GET",
      "parameters": []
    },
    "next_step": [{ "step_id": 900 }] // Changed to explicit object for consistency
  },
  {
    "step_id": 761,
    "process_name": '모니터링 대시보드',
    "description": 'MES/MOM 시스템의 메인 대시보드를 확인합니다.',
    "question": [
      '모니터링 대시보드', '대시보드', '메인 대시보드', '생산 대시보드', '모니터링 화면', 'MES 대시보드', 'MOM 대시보드', '공장 대시보드', '공정 대시보드', '운영 대시보드', '대시보드 열어줘', '대시보드 보여줘'
    ],
    "answer": [
      'MES/MOM 시스템의 메인 대시보드를 표시합니다.'
    ],
    "data": null,
    "api": {
      "url": 'http://localhost:3000/',
      "method": 'GET',
      "parameters": []
    },
    "next_step": [{ step_id: 900 }]
  },
  {
    "step_id": 800, // Generic Send Information (e.g., consent forms, notices)
    "process_name": "정보 전송",
    "description": "선택된 정보를 특정 수신자에게 전송합니다. (예: 수술 동의서, 안내문)",
    "question": ["정보 전송", "파일 전송", "안내문 전송", "동의서 전송"],
    "answer": ["정보 전송을 위한 폼을 준비했습니다. 양식을 작성하여 제출해주세요."],
    "data": null,
    "api": {
      "url": "/api/send", // Consistent API endpoint
      "method": "POST",
      "parameters": [
        { "name": "date", "type": "date" },
        { "name": "recipient_email", "type": "searchable_recipient" },
        { "name": "description", "type": "description" },
        { "name": "data", "type": "data" } // For sending JSON data, e.g., a form or document
      ]
    },
    "next_step": [
      { "step_id": 900 } // Next step is completion
    ]
  },
  {
    "step_id": 900, // Workflow Completion
    "process_name": "워크플로우 완료",
    "description": "요청하신 작업이 성공적으로 완료되었습니다.",
    "question": [], // No direct question for this step
    "answer": ["워크플로우가 성공적으로 완료되었습니다. 더 궁금한 점이 있으신가요?"],
    "data": null,
    "api": {
      "url": "/api/callback", // A generic callback or completion API
      "method": "GET",
      "parameters": []
    },
    "next_step": [
      { "step_id": null } // Indicates end of workflow
    ]
  }
];

// LLM이 문서 유사도를 계산하는 것을 시뮬레이션하는 헬퍼 함수 (단어 벡터 유사도 개념 반영)
const calculateMockLLMSimilarity = (question, documentContent, docType = '') => {
    return calculateSimilarity(question, documentContent, docType);
};


// RAG 문서의 메타데이터 및 유사도를 시뮬레이션하기 위한 함수
const generateMockRAGDocuments = (question) => {
    const documents = [];
    
    // fixedLayoutData의 각 스텝에서 RAG 문서 생성
    fixedLayoutData.forEach(step => {
        let content = step.description;
        let source = `워크플로우: ${step.process_name}`;
        let docType = '';

        // Add step descriptions as RAG documents
        if (step.description && step.description.length > 0) {
            docType = 'workflow_description';
            documents.push({
                page_content: step.description,
                metadata: { source: source },
                similarity: calculateMockLLMSimilarity(question, step.description, docType)
            });
        }
    });

    // Add specific data sources to RAG documents for more relevant answers
    // Patients data
    const patientsContent = emrPatientsData.map(p => `${p.name} ${p.dob} ${p.gender} ${p.allergies}`).join('\n');
    documents.push({
        page_content: patientsContent.substring(0, Math.min(patientsContent.length, 1000)),
        metadata: { source: "EMR: 환자 정보" },
        similarity: calculateMockLLMSimilarity(question, patientsContent, 'emr_patients')
    });

    // Appointments data
    const appointmentsContent = appointmentsData.map(a => `${a.patient_id} ${a.datetime} ${a.procedure} ${a.status}`).join('\n');
    documents.push({
        page_content: appointmentsContent.substring(0, Math.min(appointmentsContent.length, 1000)),
        metadata: { source: "예약 시스템: 예약 정보" },
        similarity: calculateMockLLMSimilarity(question, appointmentsContent, 'appointments')
    });

    // Surgeries data
    const surgeriesContent = emrSurgeriesData.map(s => `${s.patient_id} ${s.procedure} ${s.date} ${s.surgeon}`).join('\n');
    documents.push({
        page_content: surgeriesContent.substring(0, Math.min(surgeriesContent.length, 1000)),
        metadata: { source: "EMR: 수술 기록" },
        similarity: calculateMockLLMSimilarity(question, surgeriesContent, 'emr_surgeries')
    });

    // Products data
    const productsContent = productsData.map(p => `${p.name} ${p.category} ${p.price_krw} ${p.recommended_use}`).join('\n');
    documents.push({
        page_content: productsContent.substring(0, Math.min(productsContent.length, 1000)),
        metadata: { source: "재고 관리: 제품 정보" },
        similarity: calculateMockLLMSimilarity(question, productsContent, 'products')
    });

    // QA Dataset
    qaDataset.forEach(qa => {
        const content = `${qa.question} ${qa.answer} (출처: ${qa.source})`;
        documents.push({
            page_content: content.substring(0, Math.min(content.length, 1000)),
            metadata: { source: `QA_Dataset: ${qa.no} (${qa.source})` },
            similarity: calculateMockLLMSimilarity(question, content, 'qa_dataset')
        });
    });

    // Sort by similarity and return top N
    documents.sort((a, b) => parseFloat(b.similarity) - parseFloat(a.similarity));

    return documents.slice(0, Math.floor(Math.random() * 3) + 3); // 3~5개 문서 반환
};


export const mockApi = {
    getLayout: async () => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true, data: fixedLayoutData });
            }, 500);
        });
    },
    // New API functions for hospital data
    getPatients: async (patientId = null, patientName = null) => {
        return new Promise(resolve => {
            setTimeout(() => {
                let filteredData = emrPatientsData;
                if (patientId) {
                    filteredData = filteredData.filter(p => p.patient_id === patientId);
                } else if (patientName) {
                    filteredData = filteredData.filter(p => p.name === patientName);
                }
                resolve({ success: true, data: filteredData });
            }, 500);
        });
    },
    getAppointments: async (apptId = null, patientId = null, patientName = null) => {
        return new Promise(resolve => {
            setTimeout(() => {
                let filteredData = appointmentsData;
                if (apptId) {
                    filteredData = filteredData.filter(a => a.appt_id === apptId);
                } else if (patientId) {
                    filteredData = filteredData.filter(a => a.patient_id === patientId);
                } else if (patientName) {
                    const id = getPatientIdFromName(patientName); // Use helper
                    if (id) {
                        filteredData = filteredData.filter(a => a.patient_id === id);
                    } else {
                        filteredData = []; // No patient found with that name
                    }
                }
                resolve({ success: true, data: filteredData });
            }, 500);
        });
    },
    getSurgeries: async (surgeryId = null, patientName = null) => {
        return new Promise(resolve => {
            setTimeout(() => {
                let filteredData = emrSurgeriesData;
                if (surgeryId) {
                    filteredData = filteredData.filter(s => s.surgery_id === surgeryId);
                } else if (patientName) {
                    const id = getPatientIdFromName(patientName);
                    if (id) {
                        filteredData = filteredData.filter(s => s.patient_id === id);
                    } else {
                        filteredData = [];
                    }
                }
                resolve({ success: true, data: filteredData });
            }, 500);
        });
    },
    getPhotoRecords: async (photoId = null, patientName = null) => {
        return new Promise(resolve => {
            setTimeout(() => {
                let filteredData = photoRecordsData;
                if (photoId) {
                    filteredData = filteredData.filter(p => p.photo_id === photoId);
                } else if (patientName) {
                    const id = getPatientIdFromName(patientName);
                    if (id) {
                        filteredData = filteredData.filter(p => p.patient_id === id);
                    } else {
                        filteredData = [];
                    }
                }
                resolve({ success: true, data: filteredData });
            }, 500);
        });
    },
    getProducts: async (id = null) => {
        return new Promise(resolve => {
            setTimeout(() => {
                if (id) {
                    const product = productsData.find(p => p.product_id === id || p.name.includes(id));
                    resolve({ success: true, data: product ? [product] : [] });
                } else {
                    resolve({ success: true, data: productsData });
                }
            }, 500);
        });
    },
    getSurveys: async (surveyId = null, patientName = null) => {
        return new Promise(resolve => {
            setTimeout(() => {
                let filteredData = surveysData;
                if (surveyId) {
                    filteredData = filteredData.filter(s => s.survey_id === surveyId);
                } else if (patientName) {
                    const id = getPatientIdFromName(patientName);
                    if (id) {
                        filteredData = filteredData.filter(s => s.patient_id === id);
                    } else {
                        filteredData = [];
                    }
                }
                resolve({ success: true, data: filteredData });
            }, 500);
        });
    },
    getLeads: async (id = null) => {
        return new Promise(resolve => {
            setTimeout(() => {
                if (id) {
                    const lead = crmLeadsData.find(l => l.lead_id === id);
                    resolve({ success: true, data: lead ? [lead] : [] });
                } else {
                    resolve({ success: true, data: crmLeadsData });
                }
            }, 500);
        });
    },

    postSend: async (formData) => {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log("Mock API received POST data:", formData);
                resolve({ success: true, message: "정보가 성공적으로 전송되었습니다.", receivedData: formData });
            }, 1500);
        });
    },
    getCallback: async () => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true, message: "콜백 메시지를 성공적으로 수신했습니다." });
            }, 2000);
        });
    },

    getFineTunedLLMResponse: async (userInput) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
            explanation: "LLM이 사용자 질의를 분석하고, RAG 시스템을 통해 관련 문서를 검색하여 답변을 생성합니다. 필요한 경우 외부 API를 호출하여 추가 정보를 얻거나 작업을 수행합니다.",
            layout: fixedLayoutData,
            initialStepId: null
        };
    },

    getRAGDocuments: async (question) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const documents = generateMockRAGDocuments(question);
                resolve({ success: true, data: { documents: documents } });
            }, 800); // RAG 검색 시간 시뮬레이션
        });
    },

    // 새로운 API 함수 추가: 수신자 검색
    searchRecipients: async (query) => {
        return new Promise(resolve => {
            setTimeout(() => {
                if (!query || query.trim() === '') {
                    resolve({ success: true, data: [] });
                    return;
                }

                // calculateSimilarity 함수는 이제 원본 텍스트를 받도록 변경되었으므로,
                // 여기서 미리 preprocessText를 호출할 필요가 없습니다.
                // const processedQuery = preprocessText(query); // 이 줄 삭제

                const scoredRecipients = recipientData.map(person => {
                    // 각 필드를 하나의 문자열로 합쳐서 유사도 계산
                    const personContent = `${person.이름} ${person.부서} ${person.직책} ${person.소속} ${person.이메일} ${person.근무장소}`;
                    // calculateSimilarity에 원본 query와 personContent를 전달
                    const similarity = calculateSimilarity(query, personContent);
                    return { ...person, similarity };
                });

                // 유사도 점수가 높은 순으로 정렬하고, 일정 점수 이상만 필터링
                // 이름, 부서, 직책, 이메일에 대한 부분 문자열 매칭도 함께 고려 (유사도 0인 경우도 포함)
                const filteredAndSorted = scoredRecipients
                    .filter(person => 
                        person.similarity > 0.05 || // 최소 유사도 임계값
                        person.이름.toLowerCase().includes(query.toLowerCase()) ||
                        person.부서.toLowerCase().includes(query.toLowerCase()) ||
                        person.직책.toLowerCase().includes(query.toLowerCase()) ||
                        person.이메일.toLowerCase().includes(query.toLowerCase())
                    )
                    .sort((a, b) => b.similarity - a.similarity);

                // 상위 5개까지만 반환
                resolve({ success: true, data: filteredAndSorted.slice(0, 5) });
            }, 300); // 검색 지연 시뮬레이션
        });
    },

    // RecipientSearchInput에서 recipientData를 직접 참조할 수 있도록 추가 (옵션)
    getRecipientData: () => recipientData,

    // NEW: 전체 데이터셋을 반환하는 헬퍼 함수들 (ID-Name 매핑용)
    getPatientDataForMapping: () => emrPatientsData,
    getProductDataForMapping: () => productsData,
    getLeadDataForMapping: () => crmLeadsData,

    // --- 새로운 API 함수 추가: 챗 세션 저장 및 불러오기 ---
    saveChatSession: async (sessionData) => {
        return new Promise(resolve => {
            setTimeout(() => {
                let sessions = JSON.parse(localStorage.getItem('savedChatSessions') || '[]');
                sessions.unshift(sessionData); // 최신 세션을 리스트 맨 앞에 추가
                localStorage.setItem('savedChatSessions', JSON.stringify(sessions));
                resolve({ success: true, message: "대화 세션이 저장되었습니다." });
            }, 300);
        });
    },

    loadChatSessions: async () => {
        return new Promise(resolve => {
            setTimeout(() => {
                let sessions = JSON.parse(localStorage.getItem('savedChatSessions') || '[]');
                resolve({ success: true, data: sessions });
            }, 200);
        });
    },
};
