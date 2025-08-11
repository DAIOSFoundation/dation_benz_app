// src/api/mockApi.js
import { calculateSimilarity, preprocessText, getTermFrequency } from '../utils/textSimilarity';

// Import all automotive data JSON files
import benzCrmData from '../../public/data/benz_CRM.json';
import dealerInfoData from '../../public/data/dealer_info.json';

// Mercedes-Benz Germany HQ and Korea Dealer Recipient Data
const recipientData = [
  {
    "이름": "Dr. Hans Mueller",
    "부서": "Global Operations Management",
    "직책": "Director",
    "소속": "Mercedes-Benz Germany HQ",
    "이메일": "hans.mueller@mercedes-benz.de",
    "전화번호": "+49-711-17-1000",
    "근무장소": "Stuttgart HQ, Germany"
  },
  {
    "이름": "Dr. Anna Schmidt",
    "부서": "Asia Pacific Region",
    "직책": "Regional Director",
    "소속": "Mercedes-Benz Germany HQ",
    "이메일": "anna.schmidt@mercedes-benz.de",
    "전화번호": "+49-711-17-1001",
    "근무장소": "Stuttgart HQ, Germany"
  },
  {
    "이름": "Michael Weber",
    "부서": "Production Planning",
    "직책": "Team Leader",
    "소속": "Mercedes-Benz Germany HQ",
    "이메일": "michael.weber@mercedes-benz.de",
    "전화번호": "+49-711-17-1002",
    "근무장소": "Stuttgart HQ, Germany"
  },
  {
    "이름": "Sarah Fischer",
    "부서": "Quality Management",
    "직책": "Team Leader",
    "소속": "Mercedes-Benz Germany HQ",
    "이메일": "sarah.fischer@mercedes-benz.de",
    "전화번호": "+49-711-17-1003",
    "근무장소": "Stuttgart HQ, Germany"
  },
  {
    "이름": "Thomas Wagner",
    "부서": "Logistics & Allocation",
    "직책": "Team Leader",
    "소속": "Mercedes-Benz Germany HQ",
    "이메일": "thomas.wagner@mercedes-benz.de",
    "전화번호": "+49-711-17-1004",
    "근무장소": "Stuttgart HQ, Germany"
  },
  {
    "이름": "Minjun Kim",
    "부서": "Sales Team",
    "직책": "Team Leader",
    "소속": "Hansung Motors",
    "이메일": "minjun.kim@hansung.co.kr",
    "전화번호": "+82-2-1234-5678",
    "근무장소": "Seoul HQ Sales Team"
  },
  {
    "이름": "Seoyeon Lee",
    "부서": "Marketing Team",
    "직책": "Team Leader",
    "소속": "Hyosung The Class",
    "이메일": "seoyeon.lee@hyosungtheclass.co.kr",
    "전화번호": "+82-2-2345-6789",
    "근무장소": "Seoul HQ Marketing Team"
  },
  {
    "이름": "Jihoon Park",
    "부서": "Service Team",
    "직책": "Team Leader",
    "소속": "KCC Auto",
    "이메일": "jihoon.park@kccauto.co.kr",
    "전화번호": "+82-2-3456-7890",
    "근무장소": "Seoul HQ Service Team"
  }
];

// 고정 레이아웃 데이터 (자동차 업계 워크플로우) - 다국어 지원을 위해 함수로 변경
// 다국어 지원을 위한 고정 레이아웃 데이터 함수
const getFixedLayoutData = (t) => [
  {
    "process_name": t('dealerInformationLookup'),
    "step_id": 0,
    "step_name": "Dealer Information Lookup",
    "description": t('dealerInformationLookupDesc'),
    "question": ["딜러 정보", "딜러 연락처", "담당자 정보", "contact information", "연락처 정보", "딜러 회사", "딜러 조직"],
    "recipients": ["김민준", "이서연", "박지훈", "최은지", "정우진"],
    "template": "딜러 정보 조회 요청",
    "api": {
      "url": "/api/dealer_info",
      "method": "GET"
    },
    "answer": [t('dealerInformationLookupDesc')]
  },
  {
    "process_name": t('vehicleSalesStatus'),
    "step_id": 1,
    "step_name": "Sales Performance Lookup",
    "description": t('vehicleSalesStatusDesc'),
    "question": ["판매 실적", "판매 현황", "매출", "판매 통계", "E-Class", "C-Class", "GLC"],
    "recipients": ["김민준", "이서연", "박지훈", "최은지", "정우진"],
    "template": "판매 실적 조회 요청",
    "api": {
      "url": "/api/sales_analysis",
      "method": "GET"
    },
    "answer": [t('vehicleSalesStatusDesc')]
  },
  {
    "process_name": t('productionAllocationStatus'),
    "step_id": 2,
    "step_name": "Production Status Lookup",
    "description": t('productionAllocationStatusDesc'),
    "question": ["생산 현황", "배정 계획", "생산 일정", "한국 배정", "E-Class 생산", "GLC 생산"],
    "recipients": ["강지혁", "문보람", "윤서준"],
    "template": "생산 배정 현황 조회 요청"
  },
  {
    "process_name": t('customerWaitlistManagement'),
    "step_id": 3,
    "step_name": "Waitlist Customer Lookup",
    "description": t('customerWaitlistManagementDesc'),
    "question": ["고객 대기", "대기 명단", "구매 대기", "대기 순번", "EQS 대기", "S-Class 대기"],
    "recipients": ["김민준", "이서연", "박지훈", "최은지", "정우진"],
    "template": "고객 대기 현황 조회 요청"
  },
  {
    "process_name": t('monthlySalesAnalysis'),
    "step_id": 4,
    "step_name": "July Sales Status Analysis",
    "description": t('monthlySalesAnalysisDesc'),
    "question": ["7월 판매", "총 판매 대수", "판매 금액", "한국 내 판매"],
    "api": {
      "url": "/api/sales_analysis",
      "method": "GET"
    },
    "answer": [t('monthlySalesAnalysisDesc')]
  },
  {
    "process_name": t('dealerSegmentSales'),
    "step_id": 5,
    "step_name": "Hyosung The Class Sedan Sales Analysis",
    "description": t('dealerSegmentSalesDesc'),
    "question": ["효성더클래스 세단", "딜러별 세그먼트", "세단 판매"],
    "api": {
      "url": "/api/dealership_sales",
      "method": "GET"
    },
    "answer": [t('dealerSegmentSalesDesc')]
  },
  {
    "process_name": t('dealerAllocationStatus'),
    "step_id": 6,
    "step_name": "Hansung Motors SUV Allocation Analysis",
    "description": t('dealerAllocationStatusDesc'),
    "question": ["한성자동차 SUV", "8월 배정", "SUV 배정 수량"],
    "api": {
      "url": "/api/allocation_analysis",
      "method": "GET"
    },
    "answer": [t('dealerAllocationStatusDesc')]
  },
  {
    "process_name": t('emailSending'),
    "step_id": 7,
    "step_name": "Email Sending",
    "description": t('emailSendingDesc'),
    "question": ["email sending", "representative", "invitation email", "report writing"],
    "api": {
      "url": "/api/send_email",
      "method": "POST",
      "parameters": [
        {
          "name": "recipient_email",
          "type": "searchable_recipient"
        },
        {
          "name": "description",
          "type": "description"
        }
      ]
    },
    "answer": [t('emailSendingDesc')]
  }
];

// 기존 호환성을 위한 고정 레이아웃 데이터 (한국어 기본값)
const fixedLayoutData = [
  {
    "process_name": "딜러 정보 조회",
    "step_id": 0,
    "step_name": "Dealer List Lookup",
    "description": "한국 내 벤츠 딜러사들의 기본 정보를 조회합니다.",
    "question": ["딜러 정보", "딜러사 정보", "한성자동차", "효성더클래스", "KCC오토", "연락처", "담당자"],
    "recipients": ["김민준", "이서연", "박지훈", "최은지", "정우진"],
    "template": "딜러 정보 조회 요청",
    "answer": ["한국 내 벤츠 딜러사들의 기본 정보를 조회합니다."]
  },
  {
    "process_name": "차량 판매 현황",
    "step_id": 1,
    "step_name": "Sales Performance Lookup",
    "description": "딜러별 차량 판매 실적을 조회합니다.",
    "question": ["판매 실적", "판매 현황", "매출", "판매 통계", "E-Class", "C-Class", "GLC"],
    "recipients": ["김민준", "이서연", "박지훈", "최은지", "정우진"],
    "template": "판매 실적 조회 요청",
    "api": {
      "url": "/api/sales_analysis",
      "method": "GET"
    },
    "answer": ["딜러별 차량 판매 실적을 조회합니다."]
  },
  {
    "process_name": "생산 배정 현황",
    "step_id": 2,
    "step_name": "Production Status Lookup",
    "description": "독일 본사의 차량 생산 현황과 한국 배정 계획을 조회합니다.",
    "question": ["생산 현황", "배정 계획", "생산 일정", "한국 배정", "E-Class 생산", "GLC 생산"],
    "recipients": ["강지혁", "문보람", "윤서준"],
    "template": "생산 배정 현황 조회 요청"
  },
  {
    "process_name": "고객 대기 관리",
    "step_id": 3,
    "step_name": "Waitlist Customer Lookup",
    "description": "특정 차량 모델을 구매 대기 중인 고객들의 정보를 조회합니다.",
    "question": ["고객 대기", "대기 명단", "구매 대기", "대기 순번", "EQS 대기", "S-Class 대기"],
    "recipients": ["김민준", "이서연", "박지훈", "최은지", "정우진"],
    "template": "고객 대기 현황 조회 요청"
  },
  {
    "process_name": "월별 판매 분석",
    "step_id": 4,
    "step_name": "July Sales Status Analysis",
    "description": "7월 한국 내 총 판매 대수와 판매 금액을 분석합니다.",
    "question": ["7월 판매", "총 판매 대수", "판매 금액", "한국 내 판매"],
    "api": {
      "url": "/api/sales_analysis",
      "method": "GET"
    },
    "answer": ["7월 한국 내 총 판매 현황을 분석하여 총 판매 대수와 판매 금액을 조회합니다."]
  },
  {
    "process_name": "딜러별 세그먼트 판매",
    "step_id": 5,
    "step_name": "Hyosung The Class Sedan Sales Analysis",
    "description": "효성더클래스를 통해 7월에 주문된 세단의 총 수를 분석합니다.",
    "question": ["효성더클래스 세단", "딜러별 세그먼트", "세단 판매"],
    "api": {
      "url": "/api/dealership_sales",
      "method": "GET"
    },
    "answer": ["효성더클래스를 통해 7월에 주문된 세단의 총 수를 분석합니다."]
  },
  {
    "process_name": "딜러별 배정 현황",
    "step_id": 6,
    "step_name": "Hansung Motors SUV Allocation Analysis",
    "description": "한성자동차에 8월에 배정될 SUV의 총 수량을 분석합니다.",
    "question": ["한성자동차 SUV", "8월 배정", "SUV 배정 수량"],
    "api": {
      "url": "/api/allocation_analysis",
      "method": "GET"
    },
    "answer": ["한성자동차에 8월에 배정될 SUV의 총 수량을 분석합니다."]
  },
  {
    "process_name": "이메일 전송",
    "step_id": 7,
    "step_name": "Email Sending",
    "description": "이메일 전송 폼을 통해 원하는 수신자에게 이메일을 전송할 수 있습니다.",
    "question": ["이메일 전송", "담당자", "초대 이메일", "보고서 작성"],
    "api": {
      "url": "/api/send_email",
      "method": "POST",
      "parameters": [
        {
          "name": "recipient_email",
          "type": "searchable_recipient"
        },
        {
          "name": "description",
          "type": "description"
        }
      ]
    },
    "answer": ["이메일 전송 폼을 준비했습니다."]
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

// 한글 딜러명을 지원하는 함수
const getDealershipNameKrFromId = (id) => {
  const dealers = benzCrmData.database_schema.tables.find(table => table.table_name === 'Dealerships');
  if (dealers) {
    const dealer = dealers.data.find(d => d.dealership_id === id);
    return dealer ? dealer.dealership_name_kr : 'Unknown';
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
  fixedLayoutData,

  // 새로운 분석 함수들
  getSalesAnalysis: async (month, year) => {
    const sales = benzCrmData.database_schema.tables.find(table => table.table_name === 'VehicleSales');
    if (!sales) return { success: false, message: '판매 데이터를 찾을 수 없습니다.' };

    const targetMonth = month || 7;
    const targetYear = year || 2025;
    
    const monthlySales = sales.data.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() + 1 === targetMonth && saleDate.getFullYear() === targetYear;
    });

    const totalQuantity = monthlySales.length;
    const totalAmount = monthlySales.reduce((sum, sale) => sum + sale.price_krw, 0);

    return {
      success: true,
      data: {
        month: targetMonth,
        year: targetYear,
        totalQuantity,
        totalAmount,
        sales: monthlySales.map(sale => ({
          ...sale,
          dealership_name: getDealershipNameFromId(sale.dealership_id),
          model_name: getVehicleModelNameFromId(sale.model_id)
        }))
      }
    };
  },

  getDealershipSalesBySegment: async (dealershipName, month, year, segment) => {
    console.log('getDealershipSalesBySegment called with:', { dealershipName, month, year, segment });
    
    const sales = benzCrmData.database_schema.tables.find(table => table.table_name === 'VehicleSales');
    const models = benzCrmData.database_schema.tables.find(table => table.table_name === 'VehicleModels');
    const dealerships = benzCrmData.database_schema.tables.find(table => table.table_name === 'Dealerships');
    
    if (!sales || !models || !dealerships) {
      console.log('Required tables not found');
      return { success: false, message: '데이터를 찾을 수 없습니다.' };
    }

    // 딜러 ID 찾기
    console.log('Available dealerships:', dealerships.data.map(d => d.dealership_name));
    
    // 딜러명 매칭 로직 개선
    const dealership = dealerships.data.find(d => {
      const searchName = dealershipName.toLowerCase();
      const actualName = d.dealership_name.toLowerCase();
      
      // 정확한 매칭
      if (actualName === searchName) return true;
      
      // 부분 매칭
      if (actualName.includes(searchName) || searchName.includes(actualName)) return true;
      
      // 한국어-영어 매칭
      const koreanToEnglish = {
        '효성더클래스': 'hyosung the class',
        '한성자동차': 'hansung motors',
        'kcc오토': 'kcc auto',
        '더스타모터스': 'the star motors',
        '신세계모터스': 'shinsegae motors'
      };
      
      const englishName = koreanToEnglish[searchName];
      if (englishName && actualName.includes(englishName)) return true;
      
      return false;
    });
    
    if (!dealership) {
      console.log('Dealership not found for:', dealershipName);
      return { success: false, message: '딜러를 찾을 수 없습니다.' };
    }
    
    console.log('Found dealership:', dealership);

    // 세그먼트에 해당하는 모델 ID들 찾기
    console.log('Available models:', models.data.map(m => ({ name: m.model_name, segment: m.segment })));
    console.log('Searching for segment:', segment);
    
    const segmentModels = models.data.filter(model => {
      const modelSegment = model.segment.toLowerCase();
      const searchSegment = segment.toLowerCase();
      
      // "Sedan" 검색 시 "Sedan", "EV Sedan", "Luxury Sedan" 등 모두 포함
      if (searchSegment === 'sedan') {
        return modelSegment.includes('sedan');
      }
      // "SUV" 검색 시 "SUV", "Large SUV" 등 모두 포함
      if (searchSegment === 'suv') {
        return modelSegment.includes('suv');
      }
      // 기타 세그먼트는 정확히 매칭
      return modelSegment.includes(searchSegment);
    });
    
    console.log('Found segment models:', segmentModels.map(m => ({ name: m.model_name, segment: m.segment })));
    const segmentModelIds = segmentModels.map(model => model.model_id);
    console.log('Segment model IDs:', segmentModelIds);

    const targetMonth = month || 7;
    const targetYear = year || 2025;
    
    console.log('Filtering sales for:', { dealership_id: dealership.dealership_id, targetMonth, targetYear, segmentModelIds });

    const filteredSales = sales.data.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      const matches = sale.dealership_id === dealership.dealership_id &&
             saleDate.getMonth() + 1 === targetMonth &&
             saleDate.getFullYear() === targetYear &&
             segmentModelIds.includes(sale.model_id);
      
      if (sale.dealership_id === dealership.dealership_id) {
        console.log('Sale match check:', { 
          sale_id: sale.sale_id, 
          sale_date: sale.sale_date, 
          model_id: sale.model_id, 
          matches 
        });
      }
      
      return matches;
    });

    console.log('Filtered sales:', filteredSales);
    const totalQuantity = filteredSales.length;
    const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.price_krw, 0);

    return {
      success: true,
      data: {
        dealership: dealership.dealership_name,
        month: targetMonth,
        year: targetYear,
        segment,
        totalQuantity,
        totalAmount,
        sales: filteredSales.map(sale => ({
          ...sale,
          dealership_name: getDealershipNameFromId(sale.dealership_id),
          model_name: getVehicleModelNameFromId(sale.model_id),
          segment: segmentModels.find(m => m.model_id === sale.model_id)?.segment
        }))
      }
    };
  },

  getAllocationByDealership: async (dealershipName, month, year) => {
    const allocations = benzCrmData.database_schema.tables.find(table => table.table_name === 'ProductionAllocation');
    const dealerships = benzCrmData.database_schema.tables.find(table => table.table_name === 'Dealerships');
    const models = benzCrmData.database_schema.tables.find(table => table.table_name === 'VehicleModels');
    
    if (!allocations || !dealerships || !models) {
      return { success: false, message: '배정 데이터를 찾을 수 없습니다.' };
    }

    // 딜러 ID 찾기
    const dealership = dealerships.data.find(d => {
      const searchName = dealershipName.toLowerCase();
      const actualName = d.dealership_name.toLowerCase();
      
      // 정확한 매칭
      if (actualName === searchName) return true;
      
      // 부분 매칭
      if (actualName.includes(searchName) || searchName.includes(actualName)) return true;
      
      // 한국어-영어 매칭
      const koreanToEnglish = {
        '효성더클래스': 'hyosung the class',
        '한성자동차': 'hansung motors',
        'kcc오토': 'kcc auto',
        '더스타모터스': 'the star motors',
        '신세계모터스': 'shinsegae motors'
      };
      
      const englishName = koreanToEnglish[searchName];
      if (englishName && actualName.includes(englishName)) return true;
      
      return false;
    });
    
    if (!dealership) {
      return { success: false, message: '딜러를 찾을 수 없습니다.' };
    }

    const targetMonth = month || 8;
    const targetYear = year || 2025;

    const monthlyAllocations = allocations.data.filter(allocation => {
      const arrivalDate = new Date(allocation.estimated_arrival);
      return allocation.dealership_id === dealership.dealership_id &&
             arrivalDate.getMonth() + 1 === targetMonth &&
             arrivalDate.getFullYear() === targetYear;
    });

    // SUV 세그먼트만 필터링
    const suvModels = models.data.filter(model => 
      model.segment.toLowerCase().includes('suv')
    );
    const suvModelIds = suvModels.map(model => model.model_id);

    const suvAllocations = monthlyAllocations.filter(allocation => 
      suvModelIds.includes(allocation.model_id)
    );

    const totalQuantity = suvAllocations.reduce((sum, allocation) => sum + allocation.allocation_quantity, 0);

    return {
      success: true,
      data: {
        dealership: dealership.dealership_name,
        month: targetMonth,
        year: targetYear,
        segment: 'SUV',
        totalQuantity,
        allocations: suvAllocations.map(allocation => ({
          ...allocation,
          dealership_name: getDealershipNameFromId(allocation.dealership_id),
          model_name: getVehicleModelNameFromId(allocation.model_id),
          segment: suvModels.find(m => m.model_id === allocation.model_id)?.segment
        }))
      }
    };
  },

  sendEmail: async (recipientEmail, subject, content) => {
    // 이메일 전송 시뮬레이션
    const recipients = recipientData;
    const recipient = recipients.find(r => r.이메일 === recipientEmail);
    
    if (!recipient) {
      return { success: false, message: 'Recipient not found.' };
    }

    return {
      success: true,
      data: {
        recipient: recipient.이름,
        email: recipientEmail,
        subject,
        content,
        sentAt: new Date().toISOString(),
        status: '전송완료'
      },
      message: `Email successfully sent to ${recipient.이름}.`
    };
  },


  getProducts: async () => {
    const models = benzCrmData.database_schema.tables.find(table => table.table_name === 'VehicleModels');
    return { success: true, data: models ? models.data : [] };
  },
  getSurveys: async () => {
    return { success: true, data: [], message: 'Survey data is not provided in the automotive industry system.' };
  },
  getLeads: async () => {
    const waitlist = benzCrmData.database_schema.tables.find(table => table.table_name === 'CustomerWaitlist');
    return { success: true, data: waitlist ? waitlist.data : [] };
  },
  getCallback: async () => {
    return { success: true, data: [], message: 'No callback data available.' };
  },
  postSend: async (formData) => {
    // 이메일 전송 처리
    if (formData.recipient_email && formData.description) {
      return await mockApi.sendEmail(formData.recipient_email, 'Mercedes-Benz HQ Notice', formData.description);
    }
    return { success: false, message: 'Required data is missing.' };
  },
  searchRecipients: async (searchTerm) => {
    const results = recipientData.filter(recipient => 
      recipient.이름.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.부서.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.직책.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.이메일.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { success: true, data: results };
  },

  getDealerInfo: async (dealershipName = 'Hansung Motors', queryType = 'all') => {
    console.log('getDealerInfo called with dealershipName:', dealershipName, 'queryType:', queryType);
    
    // dealer_info.json에서 데이터 가져오기
    const dealerInfo = await import('/public/data/dealer_info.json');
    console.log('dealerInfo loaded:', dealerInfo.default);
    
    const contactsTable = dealerInfo.default.tables.find(table => table.table_name === 'Contacts');
    console.log('contactsTable found:', contactsTable);
    
    if (!contactsTable || !contactsTable.data) {
      console.log('No contacts table or data found');
      return { success: false, message: 'Dealer information data not found.' };
    }

    // 딜러 ID 매핑 (영어명과 한글명 모두 지원)
    const dealershipMap = {
      'Hansung Motors': 1,
      '한성자동차': 1,
      'Hyosung The Class': 2,
      '효성더클래스': 2,
      'KCC Auto': 3,
      'KCC오토': 3,
      'The Star Motors': 4,
      '더스타모터스': 4,
      'Shinsegae Motors': 5,
      '신세계모터스': 5
    };
    
    const targetDealershipId = dealershipMap[dealershipName];
    
    // 질문 유형에 따라 다른 데이터 반환
    if (queryType === 'contact' || queryType.includes('contact') || queryType.includes('연락처') || queryType.includes('담당자')) {
      // 연락처 정보만 반환
      let filteredContacts = contactsTable.data;
      if (targetDealershipId) {
        filteredContacts = contactsTable.data.filter(contact => 
          contact.dealership_id === targetDealershipId
        );
      }
      
      const contactsWithDealership = filteredContacts.map(contact => ({
        ...contact,
        dealership_name: getDealershipNameFromId(contact.dealership_id),
        dealership_name_kr: getDealershipNameKrFromId(contact.dealership_id)
      }));

      return {
        success: true,
        data: contactsWithDealership,
        message: `Found ${contactsWithDealership.length} contacts for ${dealershipName}.`,
        type: 'contact'
      };
    } else {
      // 전체 딜러 정보 반환 (기본 정보 + 연락처)
      const allContacts = contactsTable.data.map(contact => ({
        ...contact,
        dealership_name: getDealershipNameFromId(contact.dealership_id)
      }));

      return {
        success: true,
        data: allContacts,
        message: `Found complete dealer information for ${dealershipName}.`,
        type: 'complete'
      };
    }
  },

  getDealerContacts: async (dealershipName = 'Hansung Motors') => {
    // 기존 함수는 호환성을 위해 유지
    return await mockApi.getDealerInfo(dealershipName, 'contact');
  }
};

export { mockApi, fixedLayoutData, getFixedLayoutData, recipientData };
