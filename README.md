# Dation MK Agent

이 프로젝트는 Vite로 빌드된 React 애플리케이션이며, Electron 데스크톱 애플리케이션으로 패키징됩니다.
<br>

## 시작하기

프로젝트를 로컬에서 설정하고 실행하려면 다음 단계를 따르십시오.<br>


### 1. 의존성 설치

애플리케이션을 실행하기 전에 필요한 모든 의존성을 설치해야 합니다.<br>
터미널에서 프로젝트 루트 디렉토리로 이동하여 다음을 실행하십시오.<br>
npm install


### 2. Vite 빌드

웹 애플리케이션으로 테스트 할 수 있는 빌드 입니다.<br>
npm run build<br>
Vite React 실행<br>
npm run dev


### 3. 일렉트론 개발환경 실행

실행 패키지로 빌드하지 않고 바로 개발 버전의 실행 입니다.<br>
npm run electron:dev<br>


### 3. 일렉트론 프로덕션 빌드

타겟 OS 에 맞게 실행 패키지로 빌드 합니다.<br>
빌드 후 release 디렉토리 내 타겟 OS 별 실행 파일이 떨어지게 됩니다.<br>
npm run electron:build


## 프로젝트 분석 결과

현재 **Dation MK Agent** 프로젝트는 **병원 관리 시스템을 위한 AI 에이전트 데스크톱 애플리케이션**입니다. 다음과 같은 특징을 가지고 있습니다:

### 🏗️ **기술 스택**
- **Frontend**: React 18.2.0 + Vite 5.3.0
- **Desktop**: Electron 31.0.2
- **AI**: Google Generative AI (@google/generative-ai)
- **Markdown**: react-markdown + rehype-raw + remark-gfm
- **Build**: electron-builder

###  **주요 기능**

#### 1. **AI 챗봇 시스템**
- Google Gemini AI를 활용한 대화형 인터페이스
- 병원 관련 질의응답 처리
- 대화 세션 저장/불러오기 기능

#### 2. **병원 데이터 관리**
다양한 병원 관련 데이터를 JSON 형태로 관리:
- **환자 정보** (`emr_patients.json`)
- **예약 관리** (`appointments.json`)
- **수술 기록** (`emr_surgeries.json`)
- **사진 기록** (`photo_records.json`)
- **CRM 리드** (`crm_leads.json`)
- **제품 정보** (`products.json`)
- **설문조사** (`surveys.json`)
- **QA 데이터셋** (`qa_dataset.json`)

#### 3. **UI 구성**
- **LeftSidebar**: 메뉴 네비게이션
- **TopHeader**: 상단 헤더
- **MainContent**: 메인 채팅 인터페이스
- **RightSidebar**: 추가 정보 표시
- **InteractionPage**: 상호작용 페이지
- **MakePromptsPage**: 프롬프트 생성 페이지

#### 4. **핵심 기능들**
- **RAG (Retrieval-Augmented Generation)**: 텍스트 유사도 기반 문서 검색
- **API 호출 로그**: 실시간 API 호출 상태 모니터링
- **앱 배포 시뮬레이션**: Electron 윈도우를 통한 앱 배포 기능
- **멀티 플랫폼 지원**: macOS, Windows 빌드 지원

### **개발 환경**
- **개발 모드**: `npm run dev` (Vite React)
- **Electron 개발**: `npm run electron:dev`
- **프로덕션 빌드**: `npm run electron:build`

### **데이터 구조**
프로젝트는 종합병원의 다양한 업무 영역을 커버하는 구조화된 데이터를 포함:
- 환자 관리 (EMR)
- 예약 시스템
- 수술 관리
- 의료 영상 관리
- 고객 관계 관리 (CRM)
- 제품/서비스 관리

### **UI/UX 특징**
- 모던한 인터페이스 디자인
- 사이드바 기반 레이아웃
- 실시간 로그 표시
- 반응형 디자인
- 한국어 지원

이 프로젝트는 **병원 업무 자동화와 AI 기반 의사결정 지원**을 목표로 하는 종합적인 의료 관리 시스템입니다.