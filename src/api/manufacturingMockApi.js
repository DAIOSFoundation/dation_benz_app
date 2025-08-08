// src/api/manufacturingMockApi.js
import { calculateSimilarity, preprocessText, getTermFrequency } from '../utils/textSimilarity';

// BOM 데이터 정의
export const bomData = [
  ["제품명", "돼지고기", "돈지방", "정제수", "설탕", "복합스파이스DWP", "정제소금", "시트러스화이버", "콜라겐제", "혼합전분", "블렌드믹스-D", "대두단백", "자일로스", "포도당", "L-글루탐산나트륨제", "직화구이인헨서-D", "락색소", "아질산나트륨", "소맥전분", "분말전분", "트랜스글루타미나아제", "구운마늘분말", "콜라겐케이싱"],
  ["그릴리멜리햄(500g)", "87.64%(아일랜드,스페인,미국 등)", "", "O", "O", "O(알파미분쌀,에이취브이아이큐)", "O(국내산)", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O(발색제)", "O", "O", "O", "O", "O"],
  ["그릴리직화후랑크(250g)", "87.43%(아일랜드,스페인,미국 등)", "O(캐나다,스페인,미국 등)", "O", "O", "", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O(발색제)", "O", "O", "O", "O", "O"]
];

// SOP 데이터 정의
export const sopData = [
    ["SOP No.","DEPF20201123P001","","","",""],
    ["검사 단계","검사 항목","검사 방법","합격 기준","관련 SOP","비고","비고"],
    ["1","입고 검사","수량 확인","포장 단위 및 실제 수량 비교","주문 수량과 일치","SOP-IN-001","육안 확인"],
    ["1","입고 검사","포장 상태 확인","포장재 손상 여부, 밀봉 상태 확인","손상 및 파손 없음","SOP-IN-002","파손 시 즉시 반품"],
    ["1","입고 검사","유통기한 확인","유통기한 표시 확인","유통기한 유효","SOP-IN-003","유통기한 임박 시 품질 부서 협의"],
    ["2","원재료 검사 (돼지고기)","외관 검사","색상, 냄새, 탄력 등 확인","변색, 악취, 변질 없음","SOP-RM-001","육안 및 후각 확인"],
    ["2","원재료 검사 (돼지고기)","pH 측정","pH 측정기 사용","5.5 ~ 6.0","SOP-RM-002","교정된 pH 측정기 사용"],
    ["2","원재료 검사 (돼지고기)","미생물 검사","총균수, 대장균군, 살모넬라 등 검사","각 항목별 기준치 이하","SOP-RM-003","외부 전문 기관 의뢰"],
    ["2","원재료 검사 (돼지고기)","중금속 검사","납, 카드뮴, 수은 등 검사","각 항목별 기준치 이하","SOP-RM-004","외부 전문 기관 의뢰"],
    ["2","원재료 검사 (돈지방)","外관 검사","색상, 냄새, 상태 확인","변색, 악취, 변질 없음","SOP-RM-005","육안 및 후각 확인"],
    ["2","원재료 검사 (돈지방)","산패도 검사","산패도 측정 장비 사용","기준치 이하","SOP-RM-006","정기적인 장비 교정"],
    ["2","원재료 검사 (첨가물)","성분 분석","HPLC, GC 등 분석 장비 사용","COA와 일치","SOP-RM-007","외부 전문 기관 의뢰"],
    ["2","원재료 검사 (첨가물)","중금속 검사","납, 카드뮴, 수은 등 검사","각 항목별 기준치 이하","SOP-RM-008","외부 전문 기관 의뢰"],
    ["3","보관 검사","보관 온도 확인","온도 기록 장치 확인","적정 온도 유지","SOP-ST-001","정기적인 온도 기록 확인"],
    ["3","보관 검사","습도 확인","습도 기록 장치 확인","적정 습도 유지","SOP-ST-002","정기적인 습도 기록 확인"],
    ["3","보관 검사","유해충 확인","보관 장소 유해충 발생 여부 확인","유해충 발생 없음","SOP-ST-003","정기적인 방역 실시"],
    ["4","불량 처리","불량 재료 격리","불량 재료 별도 보관","오염 방지","SOP-QC-001","불량 재료 식별 태그 부착"],
    ["4","불량 처리","불량 보고","불량 발생 보고서 작성","원인 분석 및 재발 방지 대책 수립","SOP-QC-002","품질 부서 보고"]
];

// 제조용 수신자 데이터 정의
export const manufacturingRecipientData = [
  {
    "이름": "김민준",
    "부서": "스마트 팩토리 개발",
    "직책": "시니어 자동화 엔지니어",
    "소속": "로보틱스 제어팀",
    "이메일": "minjun.kim@amtech.com",
    "전화번호": "+82-2-1234-5678",
    "근무장소": "서울, 대한민국"
  },
  {
    "이름": "이서연",
    "부서": "제품 설계",
    "직책": "메카트로닉스 설계자",
    "소속": "정밀기계 설계팀",
    "이메일": "seoyeon.lee@amtech.com",
    "전화번호": "+82-2-2345-6789",
    "근무장소": "수원, 대한민국"
  },
  {
    "이름": "박지훈",
    "부서": "공정 기술",
    "직책": "공정 최적화 엔지니어",
    "소속": "반도체 공정팀",
    "이메일": "jihoon.park@amtech.com",
    "전화번호": "+82-2-3456-7890",
    "근무장소": "용인, 대한민국"
  },
  {
    "이름": "최수아",
    "부서": "데이터 분석",
    "직책": "제조 데이터 분석가",
    "소속": "생산품질 분석팀",
    "이메일": "sua.choi@amtech.com",
    "전화번호": "+82-2-4567-8901",
    "근무장소": "대전, 대한민국"
  },
  {
    "이름": "정우진",
    "부서": "R&D",
    "직책": "소재 개발 연구원",
    "소속": "차세대 합금 연구팀",
    "이메일": "woojin.jung@amtech.com",
    "전화번호": "+82-2-5678-9012",
    "근무장소": "대구, 대한민국"
  },
  {
    "이름": "한지민",
    "부서": "품질관리",
    "직책": "QC 매니저",
    "소속": "정밀검사팀",
    "이메일": "jimin.han@amtech.com",
    "전화번호": "+82-2-6789-0123",
    "근무장소": "창원, 대한민국"
  },
  {
    "이름": "윤도현",
    "부서": "생산관리",
    "직책": "공장 운영 매니저",
    "소속": "생산 일정관리팀",
    "이메일": "dohyun.yoon@amtech.com",
    "전화번호": "+82-2-7890-1234",
    "근무장소": "울산, 대한민국"
  },
  {
    "이름": "배수지",
    "부서": "HR (인사)",
    "직책": "인사 기획 담당자",
    "소속": "채용 전략팀",
    "이메일": "suji.bae@amtech.com",
    "전화번호": "+82-2-8901-2345",
    "근무장소": "서울, 대한민국"
  },
  {
    "이름": "오세훈",
    "부서": "설비 엔지니어링",
    "직책": "설비 자동화 리드",
    "소속": "센서 및 제어팀",
    "이메일": "sehun.oh@amtech.com",
    "전화번호": "+82-2-9012-3456",
    "근무장소": "광주, 대한민국"
  },
  {
    "이름": "장미영",
    "부서": "고객 기술 지원",
    "직책": "FAE (Field Application Engineer)",
    "소속": "B2B 고객 대응팀",
    "이메일": "miyeong.jang@amtech.com",
    "전화번호": "+82-2-0123-4567",
    "근무장소": "부산, 대한민국"
  }
];

// 제조용 고정된 layoutData 구조 정의
export const manufacturingLayoutData = [
  {
    "step_id": 0,
    "process_name": "그릴리 햄 BOM",
    "description": "그릴리 햄을 제조하기 위한 원재료를 Bill of Materials 로 정리. 재료의 유무를 O 와 빈칸으로 표시",
    "question": [
      "그릴리 BOM", "BOM", "원재료", "구성", "그릴리 BOM 을 확인해줘", "그릴리 원재료", "그릴리 구성"
    ],
    "answer": [
      "그릴리 제품 군의 원재료 구성입니다. 재료 검사 절차를 확인하시려면 'SOP' 관련 질문을 해주세요."
    ],
    "data": bomData,
    "api": {
      "url": "/api/bom",
      "method": "GET",
      "parameters": []
    },
    "next_step": [{ "step_id": 1 }]
  },
  {
    "step_id": 1,
    "process_name": "그릴리 햄 SOP",
    "description": "재료 검사 절차, 검사 항목, 합격 기준 등을 명시",
    "question": [
      "그릴리 SOP", "SOP", "검사 절차", "그릴리의 SOP를 보여줘", "SOP 조회", "검사 방법", "품질 검사"
    ],
    "answer": [
      "가장 최신에 승인된 SOP를 보여드릴게요. 원하시는 제품명을 입력하시면 해당 제품의 SOP를 검색할 수 있습니다. (예: 그릴리 델리햄)"
    ],
    "data": sopData,
    "api": {
      "url": "/api/sop",
      "method": "GET",
      "parameters": []
    },
    "next_step": [{ "step_id": 2 }]
  },
  {
    "step_id": 2,
    "process_name": "SOP 전송",
    "description": "변경된 SOP를 특정인에게 전송합니다.",
    "question": [
      "SOP 전송", "파일 전송", "SOP 업로드", "SOP 보내기", "SOP 전달"
    ],
    "answer": [
      "SOP 전송을 위한 폼을 준비했습니다. 양식을 작성하여 제출해주세요."
    ],
    "data": ["DEPF20201123P001"],
    "api": {
      "url": "/api/send",
      "method": "POST",
      "parameters": [
        { "name": "date", "type": "date" },
        { "name": "recipient_email", "type": "searchable_recipient" },
        { "name": "description", "type": "description" },
        { "name": "data", "type": "data" }
      ]
    },
    "next_step": [{ "step_id": 3 }]
  },
  {
    "step_id": 3,
    "process_name": "종료",
    "description": "SOP 전송이 완료되었습니다.",
    "question": [],
    "answer": [
      "워크플로우가 성공적으로 완료되었습니다. 더 궁금한 점이 있으신가요?"
    ],
    "data": ["DEPF20201123P001"],
    "api": {
      "url": "/api/callback",
      "method": "GET",
      "parameters": []
    },
    "next_step": [{ "step_id": null }]
  }
];

// 제조용 mockApi 함수들
export const manufacturingMockApi = {
  getBom: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true, data: bomData });
      }, 500);
    });
  },
  
  getSop: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true, data: sopData });
      }, 500);
    });
  },
  
  postSend: async (formData) => {
    return new Promise((resolve, reject) => {
      try {
        console.log("Manufacturing Mock API received POST data:", formData);
        
        // formData 유효성 검사
        if (!formData) {
          throw new Error("formData가 없습니다.");
        }
        
        // 필수 필드 검사
        const requiredFields = ['date', 'recipient_email', 'description'];
        for (const field of requiredFields) {
          if (!formData[field] || formData[field].trim() === '') {
            throw new Error(`필수 필드가 누락되었습니다: ${field}`);
          }
        }
        
        setTimeout(() => {
          console.log("Manufacturing Mock API processing completed");
          resolve({ 
            success: true, 
            message: "SOP가 성공적으로 전송되었습니다.", 
            receivedData: formData 
          });
        }, 1500);
      } catch (error) {
        console.error("Manufacturing Mock API error:", error);
        reject(error);
      }
    });
  },
  
  getCallback: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true, message: "SOP 전송이 완료되었습니다." });
      }, 2000);
    });
  },
  
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
  
  getRecipientData: () => manufacturingRecipientData
}; 