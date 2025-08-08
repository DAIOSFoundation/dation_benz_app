# Dation Benz Global Management System

This project is a React application built with Vite and packaged as an Electron desktop application. It is an **AI-based management system for global automotive company (Mercedes-Benz) headquarters and Korean regional dealers for business management and communication**.
<br>

## Getting Started

Follow these steps to set up and run the project locally.<br>

### 1. Install Dependencies

Before running the application, you need to install all required dependencies.<br>
Navigate to the project root directory in your terminal and run:<br>
```bash
npm install
```

### 2. Vite Build

This is a build for testing as a web application.<br>
```bash
npm run build
```
Run Vite React<br>
```bash
npm run dev
```

### 3. Electron Development Environment

Run the development version without building as an execution package.<br>
```bash
npm run electron:dev
```

### 4. Electron Production Build

Build as an execution package for the target OS.<br>
After building, executable files for each target OS will be generated in the release directory.<br>
```bash
npm run electron:build
```

## Project Analysis Results

The current **Dation Benz Global Management System** project is an **AI agent desktop application for business management and communication between global automotive company headquarters and regional dealers**. It has the following characteristics:

### 🏗️ **Technology Stack**
- **Frontend**: React 18.2.0 + Vite 5.3.0
- **Desktop**: Electron 31.0.2
- **AI**: Google Generative AI (@google/generative-ai)
- **Markdown**: react-markdown + rehype-raw + remark-gfm
- **Build**: electron-builder

### 🚗 **Main Features**

#### 1. **AI Chatbot System**
- Interactive interface utilizing Google Gemini AI
- Automotive industry-related Q&A processing
- Headquarters-dealer communication support
- Chat session save/load functionality

#### 2. **Mercedes-Benz Dealer Data Management**
Manages various data in JSON format for the global automotive industry:
- **Dealer Information** (`dealer_info.json`) - Contact and organizational information of major Korean dealers
- **Benz CRM** (`benz_CRM.json`) - Vehicle sales, customer waitlist, production and allocation status
- **Vehicle Model Information** - E-Class, C-Class, GLC, EQS, S-Class, etc.
- **Sales Data** - Dealer-specific vehicle sales status and VIN management
- **Customer Waitlist** - Management of customers waiting to purchase specific models
- **Production and Allocation Status** - German headquarters production status and Korean allocation plans

#### 3. **UI Structure**
- **LeftSidebar**: Menu navigation (dealer management, vehicle management, sales status, etc.)
- **TopHeader**: Top header (current dealer, date, system status)
- **MainContent**: Main chat interface (headquarters-dealer communication)
- **RightSidebar**: Additional information display (vehicle information, dealer status, sales statistics)
- **InteractionPage**: Interaction page (detailed information by dealer)
- **MakePromptsPage**: Prompt generation page (AI prompt management by business)

#### 4. **Core Features**
- **RAG (Retrieval-Augmented Generation)**: Text similarity-based document search
- **API Call Logging**: Real-time API call status monitoring
- **Multi-platform Support**: macOS, Windows build support
- **Real-time Data Synchronization**: Real-time data updates between headquarters and dealers

### 🏢 **Development Environment**
- **Development Mode**: `npm run dev` (Vite React)
- **Electron Development**: `npm run electron:dev`
- **Production Build**: `npm run electron:build`

### 📊 **Data Structure**
The project includes structured data covering various business areas of the global automotive industry:
- **Dealer Management**: Hansung Motors, Hyosung The Class, KCC Auto, The Star Motors, Shinsegae Motors
- **Vehicle Model Management**: Sedan, SUV, electric vehicles, and various segments
- **Sales Status Management**: Dealer-specific sales performance and VIN tracking
- **Customer Relationship Management**: Purchase waitlist customers and customer information management
- **Production and Allocation**: German headquarters production status and Korean allocation plans

### 🎨 **UI/UX Characteristics**
- Modern interface design
- Sidebar-based layout
- Real-time log display
- Responsive design
- Korean/English multilingual support
- Automotive industry-specific icons and colors

### 🌍 **Global Automotive Industry Specialized Features**
- **Headquarters-Dealer Communication**: Real-time communication between German headquarters and Korean dealers
- **Vehicle Allocation Management**: Tracking of vehicle allocation status by dealer for produced vehicles
- **Customer Waitlist Management**: Management of customers waiting to purchase popular models
- **Sales Performance Analysis**: Analysis of sales performance by dealer and model
- **VIN Tracking System**: Vehicle history management through vehicle identification numbers

### 🔄 **Recent Updates (2024)**

#### **Removed Features**
- **Manufacturing Workflow**: Production line management, equipment control, BOM/SOP management features removed
- **System Deployment Button**: Deployment-related buttons and features removed from TopHeader
- **Manufacturing-related Prompts**: Manufacturing knowledge agent folders and related prompts removed from MakePromptsPage

#### **Currently Supported Business**
Businesses that can be called from the Interaction page are focused on **Automotive Industry Workflow**:

1. **Dealer Management System**
   - Dealer information lookup (Hansung Motors, Hyosung The Class, KCC Auto, etc.)
   - Dealer contact management
   - Dealer performance analysis

2. **Vehicle Management System**
   - Vehicle model information (E-Class, C-Class, GLC, EQS, S-Class)
   - Vehicle inventory management
   - VIN tracking

3. **Sales Status Management**
   - Sales performance lookup
   - Customer waitlist management
   - Production allocation status

4. **Communication System**
   - Headquarters-dealer communication
   - Recipient search
   - Information transmission

### 🎯 **Implemented Feature Call Scenarios**

#### **1. Monthly Sales Analysis Feature**
**Question Example**: "What were the total sales volume and sales amount in Korea for July?"

**System Operation**:
1. User enters question in Interaction page
2. Gemini AI analyzes the question and matches `AUTOMOTIVE_MONTHLY_SALES_ANALYSIS_4` intent
3. `getSalesAnalysis(7, 2025)` API call
4. Filter and aggregate July 2025 sales data
5. Display results in analysis result component:
   - 📊 July 2025 Sales Analysis Results
   - Total Sales Volume: XX units
   - Total Sales Amount: XXX,XXX,XXX won
   - Detailed sales history table

**Supported Keywords**: "July sales", "total sales volume", "sales amount", "Korea sales"

---

#### **2. Dealer Segment Sales Analysis**
**Question Example**: "What was the total number of sedans ordered through Hyosung The Class in July?"

**System Operation**:
1. User enters question
2. Gemini AI matches `AUTOMOTIVE_DEALER_SEGMENT_SALES_5` intent
3. `getDealershipSalesBySegment('Hyosung The Class', 7, 2025, 'Sedan')` API call
4. Filter July sedan sales data for Hyosung The Class
5. Display results:
   - 🏢 Hyosung The Class July 2025 Sedan Sales Status
   - Total Sedan Sales Volume: XX units
   - Total Sales Amount: XXX,XXX,XXX won
   - Detailed sales history

**Supported Keywords**: "Hyosung The Class sedan", "dealer segment", "sedan sales"

---

#### **3. Dealer Allocation Status Analysis**
**Question Example**: "How many SUVs will be allocated to Hansung Motors in August?"

**System Operation**:
1. User enters question
2. Gemini AI matches `AUTOMOTIVE_DEALER_ALLOCATION_STATUS_6` intent
3. `getAllocationByDealership('Hansung Motors', 8, 2025)` API call
4. Filter Hansung Motors August SUV allocation data
5. Display results:
   - 🚗 Hansung Motors August 2025 SUV Allocation Status
   - Total SUV Allocation Quantity: XX units
   - Detailed allocation history table

**Supported Keywords**: "Hansung Motors SUV", "August allocation", "SUV allocation quantity"

---

#### **4. Email Sending Feature**
**Question Example**: "Bitte senden Sie die folgende E-Mail auf Koreanisch an den Hansung Motors-Vertreter. Wir laden koreanische Automobiljournalisten und VIPs zur Weltpremiere des neuen Autos am 11. nächsten Monats in der Unternehmenszentrale in Deutschland ein. Nutzen Sie den unten stehenden Link, um Ihren Bericht vorzubereiten."

**System Operation**:
1. User enters question
2. Gemini AI matches `AUTOMOTIVE_EMAIL_SENDING_7` intent
3. Display email sending form:
   - Recipient search field (Hansung Motors representative auto-search)
   - Auto-generated email content
4. User selects recipient and confirms content
5. `sendEmail()` API call
6. Display completion message

**Supported Keywords**: "email sending", "Hansung Motors representative", "invitation email", "report writing"

---

#### **5. Existing Workflow Features**

**Dealer Information Lookup**:
- Question: "Show me Hansung Motors dealer information"
- Keywords: "dealer information", "dealer company information", "Hansung Motors", "Hyosung The Class", "KCC Auto"

**Vehicle Model Information**:
- Question: "Show me E-Class specifications"
- Keywords: "vehicle model", "E-Class", "C-Class", "GLC", "EQS", "S-Class"

**VIN Tracking**:
- Question: "Find VIN001HANSUNG vehicle information"
- Keywords: "VIN", "vehicle identification", "vehicle history", "VIN tracking"

**Customer Waitlist Management**:
- Question: "Show me EQS waitlist customer list"
- Keywords: "customer waitlist", "waitlist", "purchase waitlist", "waitlist order"

---

### 🔧 **Technical Implementation Details**

#### **API Endpoints**
- `GET /api/sales_analysis` - Monthly sales analysis
- `GET /api/dealership_sales` - Dealer segment sales
- `GET /api/allocation_analysis` - Dealer allocation status
- `POST /api/send_email` - Email sending

#### **Data Sources**
- `benz_CRM.json` - Sales, allocation, customer waitlist data
- `dealer_info.json` - Dealer information and contacts
- `recipientData` - Recipient information

#### **AI Processing Process**
1. **Intent Analysis**: Gemini AI analyzes user questions to match appropriate intents
2. **Entity Extraction**: Extract key information like dealer name, date, segment from questions
3. **API Call**: Call appropriate API functions based on matched intent
4. **Result Rendering**: Display analysis results in user-friendly UI

#### **UI Components**
- **Analysis Result Cards**: Highlight key metrics for display
- **Detailed History Tables**: Detailed information of filtered data
- **Email Sending Form**: Recipient search and content editing features
- **Real-time Logs**: Display API call status and progress

This project is a comprehensive automotive industry management system aimed at **business automation and AI-based decision support between global automotive company headquarters and regional dealers**.
