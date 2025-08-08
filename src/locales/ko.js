// 한국어 언어 파일
export default {
  // TopHeader
  currentLocation: "현재 위치:",
  dealerName: "독일 본사 (Mercedes-Benz Headquarters)",
  toggleLeftSidebar: "좌측 사이드바 토글",
  toggleRightSidebar: "우측 사이드바 토글",
  
  // LeftSidebar
  dealerManagement: "딜러 관리",
  vehicleManagement: "차량 관리", 
  salesStatus: "판매 현황",
  customerManagement: "고객 관리",
  productionAllocation: "생산 배정",
  communication: "커뮤니케이션",
  settings: "설정",
  
  // MainContent
  welcomeMessage: "안녕하세요! 벤츠 글로벌 관리 시스템에 오신 것을 환영합니다.",
  howCanIHelp: "어떤 도움이 필요하신가요?",
  sendMessage: "메시지 전송",
  placeholder: "원하는 Task를 말씀해 보세요.",
  
  // RightSidebar
  vehicleInfo: "차량 정보",
  dealerStatus: "딜러 현황",
  salesStatistics: "판매 통계",
  recentActivities: "최근 활동",
  
  // InteractionPage
  interactionTitle: "상호작용",
  loading: "로딩 중...",
  llmResponseWaiting: "LLM 응답 대기 중...",
  sorryNotUnderstood: "죄송합니다. 요청하신 내용을 이해하지 못했습니다. 다른 방식으로 질문해 주시겠어요.",
  workflowStart: "워크플로우를 시작합니다.",
  workflowNotFound: "죄송합니다. LLM이 요청을 이해했지만, 해당 워크플로우 스텝을 찾을 수 없습니다.",
  llmResponseError: "LLM 응답 처리 중 문제가 발생했습니다.",
  
  // MakePromptsPage
  makePromptsTitle: "프롬프트 생성",
  createNewPrompt: "새 프롬프트 생성",
  promptName: "프롬프트 이름",
  promptDescription: "프롬프트 설명",
  promptContent: "프롬프트 내용",
  savePrompt: "프롬프트 저장",
  cancel: "취소",
  
  // Common
  search: "검색",
  filter: "필터",
  export: "내보내기",
  import: "가져오기",
  delete: "삭제",
  edit: "편집",
  add: "추가",
  save: "저장",
  close: "닫기",
  confirm: "확인",
  yes: "예",
  no: "아니오",
  
  // Language
  language: "언어",
  korean: "한국어",
  english: "English",
  
  // User Profile
  userProfile: "사용자 프로필",
  logout: "로그아웃",
  settings: "설정",
  
  // Error Messages
  errorOccurred: "오류가 발생했습니다.",
  tryAgain: "다시 시도해 주세요.",
  networkError: "네트워크 오류가 발생했습니다.",
  serverError: "서버 오류가 발생했습니다.",
  
  // Success Messages
  success: "성공",
  saved: "저장되었습니다.",
  deleted: "삭제되었습니다.",
  updated: "업데이트되었습니다.",
  
  // Date and Time
  today: "오늘",
  yesterday: "어제",
  thisWeek: "이번 주",
  thisMonth: "이번 달",
  thisYear: "올해",
  
  // Automotive Terms
  dealership: "딜러십",
  vehicle: "차량",
  model: "모델",
  sales: "판매",
  customer: "고객",
  allocation: "배정",
  production: "생산",
  inventory: "재고",
  vin: "VIN",
  price: "가격",
  status: "상태",
  
  // Months
  january: "1월",
  february: "2월", 
  march: "3월",
  april: "4월",
  may: "5월",
  june: "6월",
  july: "7월",
  august: "8월",
  september: "9월",
  october: "10월",
  november: "11월",
  december: "12월",
  
  // Chat History
  chatHistory: "대화 기록",
  noSavedChats: "저장된 대화가 없습니다.",
  
  // Input
  waitingForResponse: "응답을 기다리는 중...",
  
  // RightSidebar
  benzGlobalStatus: "Benz Global Status",
  closeSidebar: "사이드바 닫기",
  noSystemLogs: "벤츠 글로벌 시스템 동작 내역이 없습니다.",
  
  // MakePromptsPage
  salesAnalysis: "판매 분석",
  emailCommunication: "이메일 통신",
  
  // Prompts
  dealerInfoLookup: "딜러 정보 조회",
  dealerContactManagement: "딜러 연락처 관리",
  vehicleModelInfo: "차량 모델 정보",
  vinTracking: "VIN 추적",
  monthlySalesAnalysis: "월별 판매 분석",
  dealerSegmentSales: "딜러별 세그먼트 판매",
  dealerAllocationStatus: "딜러별 배정 현황",
  emailSending: "이메일 전송",
  
  // Prompt Descriptions
  dealerInfoLookupDesc: "한국 내 벤츠 딜러사들의 기본 정보를 조회합니다. [[insert prompt:딜러명]]을 입력해주세요.",
  dealerContactManagementDesc: "딜러사 담당자 연락처 정보를 관리합니다. [[insert prompt:담당자명]]을 입력해주세요.",
  vehicleModelInfoDesc: "벤츠 차량 모델의 상세 정보를 조회합니다. [[insert prompt:모델명]]을 입력해주세요.",
  vinTrackingDesc: "차량 식별 번호(VIN)를 통한 차량 이력 추적입니다. [[insert prompt:VIN번호]]를 입력해주세요.",
  monthlySalesAnalysisDesc: "특정 월의 한국 내 총 판매 대수와 판매 금액을 분석합니다. [[insert prompt:월/년도]]를 입력해주세요.",
  dealerSegmentSalesDesc: "특정 딜러의 특정 세그먼트 차량 판매 현황을 분석합니다. [[insert prompt:딜러명/세그먼트/월]]을 입력해주세요.",
  dealerAllocationStatusDesc: "특정 딜러의 특정 월 SUV 배정 현황을 분석합니다. [[insert prompt:딜러명/월]]을 입력해주세요.",
  emailSendingDesc: "딜러사 담당자에게 이메일을 전송합니다. 원문과 한국어 번역을 함께 제공합니다. [[insert prompt:수신자/이메일내용]]을 입력해주세요.",
  
  // Prompt Titles
  dealerInfoLookupTitle: "딜러 정보 조회",
  dealerContactManagementTitle: "연락처 관리",
  vehicleModelInfoTitle: "차량 모델 조회",
  vinTrackingTitle: "VIN 추적",
  monthlySalesAnalysisTitle: "월별 판매 분석",
  dealerSegmentSalesTitle: "딜러별 세그먼트 판매",
  dealerAllocationStatusTitle: "배정 현황 분석",
  emailSendingTitle: "이메일 전송",
  
  // Prompt Details
  dealerInfoLookupDetail: "딜러사 연락처 및 조직 정보 조회",
  dealerContactManagementDetail: "딜러사 담당자 연락처 정보 관리",
  vehicleModelInfoDetail: "E-Class, C-Class, GLC, EQS, S-Class 등 차량 모델 정보",
  vinTrackingDetail: "차량 식별 번호를 통한 차량 이력 관리",
  monthlySalesAnalysisDetail: "7월 한국 내 총 판매 대수와 판매 금액 분석",
  dealerSegmentSalesDetail: "효성더클래스 7월 세단 판매 분석",
  dealerAllocationStatusDetail: "한성자동차 8월 SUV 배정 현황",
  emailSendingDetail: "Gemini 번역 기능이 포함된 이메일 전송",
  
  // Analysis Results
  salesAnalysisResult: "판매 분석 결과",
  totalSalesVolume: "총 판매 대수",
  totalSalesAmount: "총 판매 금액",
  units: "대",
  won: "원",
  detailedSalesHistory: "상세 판매 내역",
  suvAllocationStatus: "SUV 배정 현황",
  totalSuvAllocation: "총 SUV 배정 수량",
  allocationDetails: "배정 상세 내역",
  dealerSegmentSalesStatus: "판매 현황",
  totalSegmentSales: "총 {segment} 판매 대수",
  noSalesHistory: "해당 기간에 {segment} 판매 내역이 없습니다.",
  cannotDisplayResult: "분석 결과를 표시할 수 없습니다.",
  noDataMessage: "조회된 데이터가 없습니다.",
  patientDataNotFound: "'{patientName}' 환자 관련 데이터를 찾을 수 없습니다.",
  
  // Welcome Messages
  welcomeMessage: "안녕하세요. Banya Agent 이 업무를 도와 드립니다.",
  banyaAgentAnalyzing: "Banya Agent LLM 이 업무 절차를 분석 중입니다.",
  banyaAgentWorking: "Banya Agent 가 파악한 API 를 호출합니다.",
  workflowComplete: "워크플로우가 성공적으로 완료되었습니다.",
  workflowUnexpectedEnd: "워크플로우가 예상치 못하게 종료되었습니다.",
  postRequestComplete: "POST 요청 완료",
  noResponseMessage: "응답 메시지 없음",
  
  // Email Content
  emailSubject: "벤츠 신차 출시 행사 초대",
  defaultEmailContent: "다음 달 11일 독일 본사에서 개최되는 신차 세계 최초 출시 행사에 한국 자동차 전문 기자단과 VIP 여러분을 초대할 예정입니다. 아래 링크를 참고하여 보고서를 작성해 주시기 바랍니다.",
  originalText: "원문",
  koreanTranslation: "한국어 번역",
  
  // System Defaults
  defaultOperator: "작업자_홍길동",
  defaultLLM: "Banya Gemma 27B Tuned",
  
  // Saved Chat Sessions
  dealerInfoLookup: "딜러 정보 조회",
  dealerInfoLookupDesc: "한성자동차, 효성더클래스, KCC오토 등 주요 딜러의 연락처와 담당자 정보를 조회할 수 있습니다.",
  dealerInfoLookupExample: "한성자동차 딜러 정보 보여줘\n효성더클래스 연락처 알려줘\nKCC오토 담당자 정보 조회",
  vehicleSalesStatus: "차량 판매 현황",
  vehicleSalesStatusDesc: "딜러별 차량 판매 실적과 VIN 정보를 조회할 수 있습니다.",
  vehicleSalesStatusExample: "한성자동차 7월 판매 현황 보여줘\nE-Class 판매 통계 조회\nVIN001HANSUNG 차량 정보 찾아줘",
  customerWaitlist: "고객 대기 명단",
  customerWaitlistDesc: "특정 차량 모델을 구매 대기 중인 고객들의 정보를 관리합니다.",
  customerWaitlistExample: "EQS 대기 고객 목록 보여줘\nS-Class 대기 순번 조회\n고객 대기 현황 통계",
  vehicleModelInfo: "차량 모델 정보",
  vehicleModelInfoDesc: "벤츠의 각 차량 모델에 대한 상세 정보를 조회할 수 있습니다.",
  vehicleModelInfoExample: "E-Class (W214) 사양 보여줘\n전기차 모델 목록 조회\nSUV 모델 가격 정보",
  communicationHub: "본사-딜러 커뮤니케이션",
  communicationHubDesc: "독일 본사와 한국 딜러 간의 실시간 소통을 지원합니다.",
  communicationHubExample: "딜러별 판매 실적 보고서 전송\n차량 배정 요청서 작성\n딜러 정보 업데이트",
  
  // Fixed Layout Data
  dealerInformationLookup: "딜러 정보 조회",
  dealerInformationLookupDesc: "한국 내 벤츠 딜러사들의 기본 정보를 조회합니다.",
  vehicleSalesStatus: "차량 판매 현황",
  vehicleSalesStatusDesc: "딜러별 차량 판매 실적을 조회합니다.",
  productionAllocationStatus: "생산 배정 현황",
  productionAllocationStatusDesc: "독일 본사의 차량 생산 현황과 한국 배정 계획을 조회합니다.",
  customerWaitlistManagement: "고객 대기 관리",
  customerWaitlistManagementDesc: "특정 차량 모델을 구매 대기 중인 고객들의 정보를 조회합니다.",
  monthlySalesAnalysis: "월별 판매 분석",
  monthlySalesAnalysisDesc: "7월 한국 내 총 판매 대수와 판매 금액을 분석합니다.",
  dealerSegmentSales: "딜러별 세그먼트 판매",
  dealerSegmentSalesDesc: "효성더클래스를 통해 7월에 주문된 세단의 총 수를 분석합니다.",
  dealerAllocationStatus: "딜러별 배정 현황",
  dealerAllocationStatusDesc: "한성자동차에 8월에 배정될 SUV의 총 수량을 분석합니다.",
  emailSending: "이메일 전송",
  emailSendingDesc: "이메일 전송 폼을 통해 원하는 수신자에게 이메일을 전송할 수 있습니다."
};
