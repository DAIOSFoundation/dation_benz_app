// src/api/mockApi.js
import { calculateSimilarity, preprocessText, getTermFrequency } from '../utils/textSimilarity';

// Import all automotive data JSON files
import benzCrmData from '../../public/data/benz_CRM.json';
import dealerInfoData from '../../public/data/dealer_info.json';

// 벤츠 독일 본사 및 한국 딜러 수신자 데이터 정의
const recipientData = [
  {
    "이름": "Dr. Hans Mueller",
    "부서": "글로벌 운영 총괄",
    "직책": "이사",
    "소속": "벤츠 독일 본사",
    "이메일": "hans.mueller@mercedes-benz.de",
    "전화번호": "+49-711-17-1000",
    "근무장소": "독일 슈투트가르트 본사"
  },
  {
    "이름": "Dr. Anna Schmidt",
    "부서": "아시아 태평양 지역",
    "직책": "지역 총괄",
    "소속": "벤츠 독일 본사",
    "이메일": "anna.schmidt@mercedes-benz.de",
    "전화번호": "+49-711-17-1001",
    "근무장소": "독일 슈투트가르트 본사"
  },
  {
    "이름": "Michael Weber",
    "부서": "생산 계획",
    "직책": "팀장",
    "소속": "벤츠 독일 본사",
    "이메일": "michael.weber@mercedes-benz.de",
    "전화번호": "+49-711-17-1002",
    "근무장소": "독일 슈투트가르트 본사"
  },
  {
    "이름": "Sarah Fischer",
    "부서": "품질 관리",
    "직책": "팀장",
    "소속": "벤츠 독일 본사",
    "이메일": "sarah.fischer@mercedes-benz.de",
    "전화번호": "+49-711-17-1003",
    "근무장소": "독일 슈투트가르트 본사"
  },
  {
    "이름": "Thomas Wagner",
    "부서": "물류 및 배정",
    "직책": "팀장",
    "소속": "벤츠 독일 본사",
    "이메일": "thomas.wagner@mercedes-benz.de",
    "전화번호": "+49-711-17-1004",
    "근무장소": "독일 슈투트가르트 본사"
  },
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
    "template": "딜러 정보 조회 요청",
    "answer": ["한국 내 벤츠 딜러사들의 기본 정보를 조회합니다."]
  },
  {
    "process_name": "차량 판매 현황",
    "step_id": 1,
    "step_name": "판매 실적 조회",
    "description": "딜러별 차량 판매 실적을 조회합니다.",
    "question": ["판매 실적", "판매 현황", "매출", "판매 통계", "E-Class", "C-Class", "GLC"],
    "recipients": ["김민준", "이서연", "박지훈", "최은지", "정우진"],
    "template": "판매 실적 조회 요청",
    "answer": ["딜러별 차량 판매 실적을 조회합니다."]
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
  },
  {
    "process_name": "월별 판매 분석",
    "step_id": 4,
    "step_name": "7월 판매 현황 분석",
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
    "step_name": "효성더클래스 세단 판매 분석",
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
    "step_name": "한성자동차 SUV 배정 분석",
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
    "step_name": "이메일 전송",
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
      return { success: false, message: '수신자를 찾을 수 없습니다.' };
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
      message: `${recipient.이름}님에게 이메일이 성공적으로 전송되었습니다.`
    };
  },

  // 기존 API 함수들 (호환성 유지)
  getPatients: async (patientId, patientName) => {
    return { success: true, data: [], message: '자동차 업계 시스템에서는 환자 데이터를 제공하지 않습니다.' };
  },
  getAppointments: async (appointmentId, date, patientName) => {
    return { success: true, data: [], message: '자동차 업계 시스템에서는 예약 데이터를 제공하지 않습니다.' };
  },
  getSurgeries: async (surgeryId, patientName) => {
    return { success: true, data: [], message: '자동차 업계 시스템에서는 수술 데이터를 제공하지 않습니다.' };
  },
  getPhotoRecords: async (recordId, patientName) => {
    return { success: true, data: [], message: '자동차 업계 시스템에서는 사진 기록을 제공하지 않습니다.' };
  },
  getProducts: async () => {
    const models = benzCrmData.database_schema.tables.find(table => table.table_name === 'VehicleModels');
    return { success: true, data: models ? models.data : [] };
  },
  getSurveys: async () => {
    return { success: true, data: [], message: '자동차 업계 시스템에서는 설문 데이터를 제공하지 않습니다.' };
  },
  getLeads: async () => {
    const waitlist = benzCrmData.database_schema.tables.find(table => table.table_name === 'CustomerWaitlist');
    return { success: true, data: waitlist ? waitlist.data : [] };
  },
  getCallback: async () => {
    return { success: true, data: [], message: '콜백 데이터가 없습니다.' };
  },
  postSend: async (formData) => {
    // 이메일 전송 처리
    if (formData.recipient_email && formData.description) {
      return await mockApi.sendEmail(formData.recipient_email, '벤츠 본사 공지사항', formData.description);
    }
    return { success: false, message: '필수 데이터가 누락되었습니다.' };
  },
  searchRecipients: async (searchTerm) => {
    const results = recipientData.filter(recipient => 
      recipient.이름.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.부서.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.직책.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.이메일.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { success: true, data: results };
  }
};

export { mockApi, fixedLayoutData, recipientData };
