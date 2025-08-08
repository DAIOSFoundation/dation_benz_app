// src/api/mockApi.js
import { calculateSimilarity, preprocessText, getTermFrequency } from '../utils/textSimilarity';

// Import all automotive data JSON files
import benzCrmData from '../../public/data/benz_CRM.json';
import dealerInfoData from '../../public/data/dealer_info.json';

// 벤츠 딜러 수신자 데이터 정의
const recipientData = [
  {
    "이름": "김민준",
    "부서": "영업팀",
    "직책": "팀장",
    "소속": "한성자동차",
    "이메일": "minjun.kim@hansung.co.kr",
    "전화번호": "+82-2-1234-5678",
    "근무장소": "서울 본사 영업팀"
  },
  {
    "이름": "이서연",
    "부서": "마케팅팀",
    "직책": "팀장",
    "소속": "효성더클래스",
    "이메일": "seoyeon.lee@hyosungtheclass.co.kr",
    "전화번호": "+82-2-2345-6789",
    "근무장소": "서울 본사 마케팅팀"
  },
  {
    "이름": "박지훈",
    "부서": "서비스팀",
    "직책": "팀장",
    "소속": "KCC오토",
    "이메일": "jihoon.park@kccauto.co.kr",
    "전화번호": "+82-2-3456-7890",
    "근무장소": "서울 본사 서비스팀"
  },
  {
    "이름": "최은지",
    "부서": "영업팀",
    "직책": "팀장",
    "소속": "더스타모터스",
    "이메일": "eunji.choi@thestarmotors.co.kr",
    "전화번호": "+82-51-1111-2222",
    "근무장소": "부산 지점 영업팀"
  },
  {
    "이름": "정우진",
    "부서": "고객관계팀",
    "직책": "팀장",
    "소속": "신세계모터스",
    "이메일": "woojin.jung@shinsegaemotors.co.kr",
    "전화번호": "+82-53-3333-4444",
    "근무장소": "대구 지점 고객관계팀"
  },
  {
    "이름": "강지혁",
    "부서": "생산관리팀",
    "직책": "팀장",
    "소속": "벤츠 독일 본사",
    "이메일": "jihyeok.kang@mercedes-benz.de",
    "전화번호": "+49-711-17-0",
    "근무장소": "독일 슈투트가르트 본사"
  },
  {
    "이름": "문보람",
    "부서": "품질관리팀",
    "직책": "팀장",
    "소속": "벤츠 독일 본사",
    "이메일": "boram.moon@mercedes-benz.de",
    "전화번호": "+49-711-17-1",
    "근무장소": "독일 슈투트가르트 본사"
  },
  {
    "이름": "윤서준",
    "부서": "배정팀",
    "직책": "팀장",
    "소속": "벤츠 독일 본사",
    "이메일": "seojun.yoon@mercedes-benz.de",
    "전화번호": "+49-711-17-2",
    "근무장소": "독일 슈투트가르트 본사"
  }
];

// 고정 레이아웃 데이터 (자동차 업계 워크플로우)
const fixedLayoutData = [
  {
    "process_name": "딜러 정보 조회",
    "step_id": 0,
    "step_name": "딜러 목록 조회",
    "description": "한국 내 벤츠 딜러사들의 기본 정보를 조회합니다.",
    "question": ["딜러 정보", "딜러사 정보", "한성자동차", "효성더클래스", "KCC오토", "연락처", "담당자"],
    "recipients": ["김민준", "이서연", "박지훈", "최은지", "정우진"],
    "template": "딜러 정보 조회 요청"
  },
  {
    "process_name": "차량 판매 현황",
    "step_id": 1,
    "step_name": "판매 실적 조회",
    "description": "딜러별 차량 판매 실적을 조회합니다.",
    "question": ["판매 실적", "판매 현황", "매출", "판매 통계", "E-Class", "C-Class", "GLC"],
    "recipients": ["김민준", "이서연", "박지훈", "최은지", "정우진"],
    "template": "판매 실적 조회 요청"
  },
  {
    "process_name": "생산 배정 현황",
    "step_id": 2,
    "step_name": "생산 현황 조회",
    "description": "독일 본사의 차량 생산 현황과 한국 배정 계획을 조회합니다.",
    "question": ["생산 현황", "배정 계획", "생산 일정", "한국 배정", "E-Class 생산", "GLC 생산"],
    "recipients": ["강지혁", "문보람", "윤서준"],
    "template": "생산 배정 현황 조회 요청"
  },
  {
    "process_name": "고객 대기 관리",
    "step_id": 3,
    "step_name": "대기 고객 조회",
    "description": "특정 차량 모델을 구매 대기 중인 고객들의 정보를 조회합니다.",
    "question": ["고객 대기", "대기 명단", "구매 대기", "대기 순번", "EQS 대기", "S-Class 대기"],
    "recipients": ["김민준", "이서연", "박지훈", "최은지", "정우진"],
    "template": "고객 대기 현황 조회 요청"
  }
];

// 딜러 ID에서 이름을 가져오는 함수
const getDealershipNameFromId = (id) => {
  const dealers = benzCrmData.database_schema.tables.find(table => table.table_name === 'Dealerships');
  if (dealers) {
    const dealer = dealers.data.find(d => d.dealership_id === id);
    return dealer ? dealer.dealership_name : 'Unknown';
  }
  return 'Unknown';
};

// 차량 모델 ID에서 이름을 가져오는 함수
const getVehicleModelNameFromId = (id) => {
  const models = benzCrmData.database_schema.tables.find(table => table.table_name === 'VehicleModels');
  if (models) {
    const model = models.data.find(m => m.model_id === id);
    return model ? model.model_name : 'Unknown';
  }
  return 'Unknown';
};

// 딜러 데이터 매핑을 위한 함수
const getDealershipDataForMapping = () => {
  const dealers = benzCrmData.database_schema.tables.find(table => table.table_name === 'Dealerships');
  return dealers ? dealers.data : [];
};

// 차량 모델 데이터 매핑을 위한 함수
const getVehicleModelDataForMapping = () => {
  const models = benzCrmData.database_schema.tables.find(table => table.table_name === 'VehicleModels');
  return models ? models.data : [];
};

// 판매 데이터 매핑을 위한 함수
const getSalesDataForMapping = () => {
  const sales = benzCrmData.database_schema.tables.find(table => table.table_name === 'VehicleSales');
  return sales ? sales.data : [];
};

// 고객 대기 데이터 매핑을 위한 함수
const getWaitlistDataForMapping = () => {
  const waitlist = benzCrmData.database_schema.tables.find(table => table.table_name === 'CustomerWaitlist');
  return waitlist ? waitlist.data : [];
};

// 수신자 데이터 반환 함수
const getRecipientData = () => {
  return recipientData;
};

// 챗 세션 저장/로드 함수들
const saveChatSession = async (chatHistory) => {
  try {
    const session = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('ko-KR'),
      messages: chatHistory
    };
    
    const existingSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    existingSessions.push(session);
    localStorage.setItem('chatSessions', JSON.stringify(existingSessions));
    
    return { success: true, data: session };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const loadChatSessions = async () => {
  try {
    const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    return { success: true, data: sessions };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// 유사도 계산 함수 (자동차 업계 데이터 기반)
const calculateMockLLMSimilarity = (question, documentContent, docType = '') => {
  const questionTerms = preprocessText(question);
  const documentTerms = preprocessText(documentContent);
  
  // 자동차 업계 특화 키워드 가중치
  const automotiveKeywords = {
    '딜러': 2.0, '차량': 2.0, '판매': 1.8, '생산': 1.8, '배정': 1.8,
    'E-Class': 2.5, 'C-Class': 2.5, 'GLC': 2.5, 'EQS': 2.5, 'S-Class': 2.5,
    '한성자동차': 2.0, '효성더클래스': 2.0, 'KCC오토': 2.0,
    'VIN': 1.5, '고객': 1.5, '대기': 1.5, '재고': 1.5
  };
  
  let similarity = calculateSimilarity(questionTerms, documentTerms);
  
  // 키워드 가중치 적용
  for (const [keyword, weight] of Object.entries(automotiveKeywords)) {
    if (question.toLowerCase().includes(keyword.toLowerCase()) || 
        documentContent.toLowerCase().includes(keyword.toLowerCase())) {
      similarity *= weight;
    }
  }
  
  return Math.min(similarity, 1.0);
};

// Mock RAG 문서 생성 함수 (자동차 업계 데이터 기반)
const generateMockRAGDocuments = (question) => {
  const documents = [];
  
  // 딜러 정보 관련 문서
  if (question.includes('딜러') || question.includes('한성') || question.includes('효성') || question.includes('KCC')) {
    const dealers = benzCrmData.database_schema.tables.find(table => table.table_name === 'Dealerships');
    if (dealers) {
      dealers.data.forEach(dealer => {
        documents.push({
          page_content: `${dealer.dealership_name} 딜러 정보: 위치 ${dealer.location}, 담당자 ${dealer.contact_person}, 이메일 ${dealer.contact_email}`,
          metadata: { source: 'benz_CRM.json', table: 'Dealerships' },
          similarity: calculateMockLLMSimilarity(question, dealer.dealership_name)
        });
      });
    }
  }
  
  // 차량 모델 관련 문서
  if (question.includes('차량') || question.includes('모델') || question.includes('E-Class') || question.includes('C-Class')) {
    const models = benzCrmData.database_schema.tables.find(table => table.table_name === 'VehicleModels');
    if (models) {
      models.data.forEach(model => {
        documents.push({
          page_content: `${model.model_name} 모델 정보: 세그먼트 ${model.segment}, 기본 가격 ${model.base_price_eur} EUR`,
          metadata: { source: 'benz_CRM.json', table: 'VehicleModels' },
          similarity: calculateMockLLMSimilarity(question, model.model_name)
        });
      });
    }
  }
  
  // 판매 현황 관련 문서
  if (question.includes('판매') || question.includes('실적') || question.includes('매출')) {
    const sales = benzCrmData.database_schema.tables.find(table => table.table_name === 'VehicleSales');
    if (sales) {
      sales.data.slice(0, 5).forEach(sale => {
        const dealerName = getDealershipNameFromId(sale.dealership_id);
        const modelName = getVehicleModelNameFromId(sale.model_id);
        documents.push({
          page_content: `${dealerName}에서 ${modelName} 판매: ${sale.sale_date} 판매가 ${sale.price_krw.toLocaleString()}원, VIN: ${sale.vin}`,
          metadata: { source: 'benz_CRM.json', table: 'VehicleSales' },
          similarity: calculateMockLLMSimilarity(question, `${dealerName} ${modelName} 판매`)
        });
      });
    }
  }
  
  // 유사도 기준으로 정렬
  documents.sort((a, b) => b.similarity - a.similarity);
  
  return documents.slice(0, 5); // 상위 5개 문서만 반환
};

// Mock API 객체
const mockApi = {
  // 데이터 매핑 함수들
  getDealershipDataForMapping,
  getVehicleModelDataForMapping,
  getSalesDataForMapping,
  getWaitlistDataForMapping,
  getRecipientData,
  
  // 챗 세션 관리
  saveChatSession,
  loadChatSessions,
  
  // RAG 관련 함수들
  calculateMockLLMSimilarity,
  generateMockRAGDocuments,
  
  // 고정 레이아웃 데이터
  fixedLayoutData
};

export { mockApi, fixedLayoutData, recipientData };
