// src/api/manufacturingMockApi.js
import { calculateSimilarity, preprocessText, getTermFrequency } from '../utils/textSimilarity';

// 벤츠 차량 생산 데이터 정의
export const productionData = [
  ["차량 모델", "생산 라인", "일일 생산 목표", "현재 생산량", "품질 검사 완료율", "배정 우선순위", "한국 배정 수량"],
  ["E-Class (W214)", "라인 A", "150대", "142대", "98.5%", "1순위", "45대"],
  ["C-Class (W206)", "라인 B", "200대", "195대", "99.2%", "2순위", "60대"],
  ["GLC (X254)", "라인 C", "180대", "175대", "97.8%", "3순위", "50대"],
  ["EQS (V297)", "라인 D", "80대", "78대", "100%", "1순위", "25대"],
  ["S-Class (W223)", "라인 E", "100대", "98대", "99.5%", "1순위", "30대"],
  ["A-Class (W177)", "라인 F", "120대", "118대", "98.9%", "4순위", "35대"],
  ["GLE (V167)", "라인 G", "90대", "88대", "98.2%", "2순위", "25대"],
  ["EQE (V295)", "라인 H", "70대", "68대", "99.8%", "1순위", "20대"]
];

// 벤츠 차량 배정 SOP 데이터 정의
export const allocationSopData = [
    ["SOP No.","BENZ20240101A001","","","",""],
    ["배정 단계","배정 항목","배정 방법","배정 기준","관련 SOP","비고"],
    ["1","생산 완료 검사","차량 품질 검사","전체 시스템 점검 및 시운전","모든 시스템 정상 작동","SOP-QC-001","최종 품질 승인"],
    ["1","생산 완료 검사","외관 검사","도장, 조립 상태, 간격 등 확인","벤츠 품질 기준 100% 충족","SOP-QC-002","육안 및 측정기 확인"],
    ["1","생산 완료 검사","VIN 등록","차량 식별 번호 시스템 등록","고유 VIN 번호 할당","SOP-VIN-001","중복 방지 시스템"],
    ["2","배정 우선순위 결정","딜러별 수요 분석","각 딜러의 주문 현황 및 대기 고객 분석","수요 우선순위 기반","SOP-ALLOC-001","실시간 수요 데이터 반영"],
    ["2","배정 우선순위 결정","모델별 인기도 분석","각 모델의 판매 실적 및 대기 고객 수 분석","인기도 기반 우선순위","SOP-ALLOC-002","월별 판매 데이터 분석"],
    ["2","배정 우선순위 결정","지역별 배정 계획","한국 내 지역별 딜러 분포 및 수요 분석","지역 균형 배정","SOP-ALLOC-003","지역별 공정성 확보"],
    ["3","운송 계획 수립","운송 경로 최적화","독일-한국 최적 운송 경로 선정","비용 및 시간 최적화","SOP-LOG-001","다중 운송 옵션 검토"],
    ["3","운송 계획 수립","컨테이너 적재 계획","차량별 적재 공간 및 무게 최적화","안전적 적재 보장","SOP-LOG-002","적재 안전성 검증"],
    ["3","운송 계획 수립","관세 및 통관 준비","한국 수입 관세 및 통관 서류 준비","법적 요구사항 충족","SOP-CUSTOMS-001","통관 전문가 검토"],
    ["4","딜러 배정 실행","딜러별 배정 통지","각 딜러에 배정된 차량 정보 통지","실시간 배정 정보 전달","SOP-NOTIFY-001","딜러 시스템 연동"],
    ["4","딜러 배정 실행","배정 일정 조율","딜러별 수령 일정 및 장소 조율","딜러 편의성 고려","SOP-SCHEDULE-001","딜러 요청 반영"],
    ["4","딜러 배정 실행","운송 추적 시스템","실시간 운송 현황 추적 및 딜러 공유","투명한 배정 과정","SOP-TRACK-001","GPS 기반 실시간 추적"],
    ["5","수령 및 검수","딜러 수령 검수","딜러에서 차량 수령 시 최종 검수","배송 과정 손상 여부 확인","SOP-RECEIVE-001","딜러 검수 체크리스트"],
    ["5","수령 및 검수","고객 인도 준비","고객 인도 전 최종 점검 및 세정","고객 만족도 극대화","SOP-DELIVERY-001","고객 인도 표준 프로세스"]
];

// 벤츠 독일 본사 수신자 데이터 정의
export const manufacturingRecipientData = [
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
  }
];

// 벤츠 차량 생산 레이아웃 데이터 정의
export const manufacturingLayoutData = [
  {
    "process_name": "생산 현황 조회",
    "step_id": 0,
    "step_name": "일일 생산 현황",
    "description": "독일 본사의 차량 생산 현황을 조회합니다.",
    "question": ["생산 현황", "일일 생산량", "생산 목표", "생산 라인", "E-Class 생산", "GLC 생산"],
    "recipients": ["강지혁", "문보람", "윤서준"],
    "template": "생산 현황 조회 요청"
  },
  {
    "process_name": "품질 검사 현황",
    "step_id": 1,
    "step_name": "품질 검사 완료율",
    "description": "각 차량 모델별 품질 검사 완료율을 조회합니다.",
    "question": ["품질 검사", "검사 완료율", "품질 기준", "불량률", "품질 관리"],
    "recipients": ["문보람", "강지혁"],
    "template": "품질 검사 현황 조회 요청"
  },
  {
    "process_name": "한국 배정 계획",
    "step_id": 2,
    "step_name": "배정 우선순위",
    "description": "한국 딜러별 차량 배정 우선순위 및 계획을 조회합니다.",
    "question": ["한국 배정", "배정 계획", "배정 우선순위", "딜러 배정", "운송 계획"],
    "recipients": ["윤서준", "강지혁"],
    "template": "한국 배정 계획 조회 요청"
  },
  {
    "process_name": "운송 현황 추적",
    "step_id": 3,
    "step_name": "운송 추적",
    "description": "독일에서 한국으로 운송 중인 차량들의 현황을 추적합니다.",
    "question": ["운송 현황", "운송 추적", "배송 일정", "컨테이너", "통관"],
    "recipients": ["윤서준", "김민준", "이서연", "박지훈"],
    "template": "운송 현황 추적 요청"
  }
];

// 벤츠 차량 생산 API 함수들
export const manufacturingMockApi = {
  // 생산 현황 조회
  getProductionStatus: async (modelName = null) => {
    return new Promise(resolve => {
      setTimeout(() => {
        let filteredData = productionData;
        if (modelName) {
          filteredData = productionData.filter(row => 
            row[0] && row[0].toLowerCase().includes(modelName.toLowerCase())
          );
        }
        resolve({ success: true, data: filteredData });
      }, 500);
    });
  },

  // 품질 검사 현황 조회
  getQualityStatus: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const qualityData = productionData.map(row => ({
          model: row[0],
          completionRate: row[4],
          target: row[2],
          current: row[3]
        }));
        resolve({ success: true, data: qualityData });
      }, 500);
    });
  },

  // 한국 배정 계획 조회
  getKoreaAllocation: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const allocationData = productionData.map(row => ({
          model: row[0],
          priority: row[5],
          allocationQuantity: row[6],
          productionLine: row[1]
        }));
        resolve({ success: true, data: allocationData });
      }, 500);
    });
  },

  // 운송 현황 조회
  getTransportStatus: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const transportData = [
          {
            containerId: "CONT-001",
            model: "E-Class (W214)",
            quantity: 45,
            departureDate: "2024-01-15",
            estimatedArrival: "2024-02-15",
            status: "운송 중",
            destination: "한성자동차"
          },
          {
            containerId: "CONT-002",
            model: "C-Class (W206)",
            quantity: 60,
            departureDate: "2024-01-20",
            estimatedArrival: "2024-02-20",
            status: "운송 중",
            destination: "효성더클래스"
          },
          {
            containerId: "CONT-003",
            model: "GLC (X254)",
            quantity: 50,
            departureDate: "2024-01-25",
            estimatedArrival: "2024-02-25",
            status: "출발 준비 중",
            destination: "KCC오토"
          }
        ];
        resolve({ success: true, data: transportData });
      }, 500);
    });
  },

  // SOP 데이터 조회
  getSopData: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true, data: allocationSopData });
      }, 300);
    });
  },

  // 수신자 검색
  searchRecipients: async (query) => {
    return new Promise(resolve => {
      setTimeout(() => {
        if (!query || query.trim() === '') {
          resolve({ success: true, data: [] });
          return;
        }

        const scoredRecipients = manufacturingRecipientData.map(person => {
          const personContent = `${person.이름} ${person.부서} ${person.직책} ${person.소속} ${person.이메일} ${person.근무장소}`;
          const similarity = calculateSimilarity(query, personContent);
          return { ...person, similarity };
        });

        const filteredAndSorted = scoredRecipients
          .filter(person => 
            person.similarity > 0.05 ||
            person.이름.toLowerCase().includes(query.toLowerCase()) ||
            person.부서.toLowerCase().includes(query.toLowerCase()) ||
            person.직책.toLowerCase().includes(query.toLowerCase()) ||
            person.이메일.toLowerCase().includes(query.toLowerCase())
          )
          .sort((a, b) => b.similarity - a.similarity);

        resolve({ success: true, data: filteredAndSorted.slice(0, 5) });
      }, 300);
    });
  },

  // 수신자 데이터 반환
  getRecipientData: () => manufacturingRecipientData
}; 