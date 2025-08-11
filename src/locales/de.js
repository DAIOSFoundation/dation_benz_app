// Deutsche Sprachdatei
export default {
  // TopHeader
  currentLocation: "Aktueller Standort:",
  dealerName: "Deutsche Zentrale (Mercedes-Benz Zentrale)",
  toggleLeftSidebar: "Linke Seitenleiste umschalten",
  toggleRightSidebar: "Rechte Seitenleiste umschalten",
  
  // LeftSidebar
  dealerManagement: "Händlerverwaltung",
  vehicleManagement: "Fahrzeugverwaltung", 
  salesStatus: "Verkaufsstatus",
  customerManagement: "Kundenverwaltung",
  productionAllocation: "Produktionszuweisung",
  communication: "Kommunikation",
  settings: "Einstellungen",
  
  // MainContent
  welcomeMessage: "Hallo! Willkommen beim Mercedes-Benz Global Management System.",
  howCanIHelp: "Wie kann ich Ihnen helfen?",
  sendMessage: "Nachricht senden",
  placeholder: "Bitte teilen Sie mir mit, welche Aufgabe Sie erledigen möchten.",
  
  // RightSidebar
  vehicleInfo: "Fahrzeuginformationen",
  dealerStatus: "Händlerstatus",
  salesStatistics: "Verkaufsstatistiken",
  recentActivities: "Letzte Aktivitäten",
  
  // InteractionPage
  interactionTitle: "Interaktion",
  loading: "Lädt...",
  llmResponseWaiting: "Warte auf LLM-Antwort...",
  sorryNotUnderstood: "Entschuldigung, ich konnte Ihre Anfrage nicht verstehen. Könnten Sie es bitte anders formulieren?",
  workflowStart: "Workflow wird gestartet.",
  workflowNotFound: "Entschuldigung, das LLM hat die Anfrage verstanden, konnte aber den entsprechenden Workflow-Schritt nicht finden.",
  llmResponseError: "Beim Verarbeiten der LLM-Antwort ist ein Fehler aufgetreten.",
  
  // MakePromptsPage
  makePromptsTitle: "Prompt-Generierung",
  createNewPrompt: "Neuen Prompt erstellen",
  promptName: "Prompt-Name",
  promptDescription: "Prompt-Beschreibung",
  promptContent: "Prompt-Inhalt",
  savePrompt: "Prompt speichern",
  cancel: "Abbrechen",
  
  // Common
  search: "Suchen",
  filter: "Filter",
  export: "Exportieren",
  import: "Importieren",
  delete: "Löschen",
  edit: "Bearbeiten",
  add: "Hinzufügen",
  save: "Speichern",
  close: "Schließen",
  confirm: "Bestätigen",
  yes: "Ja",
  no: "Nein",
  
  // Language
  language: "Sprache",
  korean: "한국어",
  english: "English",
  german: "Deutsch",
  
  // User Profile
  userProfile: "Benutzerprofil",
  logout: "Abmelden",
  settings: "Einstellungen",
  
  // Error Messages
  errorOccurred: "Ein Fehler ist aufgetreten.",
  tryAgain: "Bitte versuchen Sie es erneut.",
  networkError: "Ein Netzwerkfehler ist aufgetreten.",
  serverError: "Ein Serverfehler ist aufgetreten.",
  
  // Success Messages
  success: "Erfolg",
  saved: "Erfolgreich gespeichert.",
  deleted: "Erfolgreich gelöscht.",
  updated: "Erfolgreich aktualisiert.",
  
  // Date and Time
  today: "Heute",
  yesterday: "Gestern",
  thisWeek: "Diese Woche",
  thisMonth: "Dieser Monat",
  thisYear: "Dieses Jahr",
  
  // Automotive Terms
  dealership: "Händler",
  vehicle: "Fahrzeug",
  model: "Modell",
  sales: "Verkauf",
  customer: "Kunde",
  allocation: "Zuweisung",
  production: "Produktion",
  inventory: "Bestand",
  vin: "Fahrgestellnummer",
  price: "Preis",
  status: "Status",
  
  // Months
  january: "Januar",
  february: "Februar", 
  march: "März",
  april: "April",
  may: "Mai",
  june: "Juni",
  july: "Juli",
  august: "August",
  september: "September",
  october: "Oktober",
  november: "November",
  december: "Dezember",
  
  // Chat History
  chatHistory: "Chat-Verlauf",
  noSavedChats: "Keine gespeicherten Chats.",
  
  // Input
  waitingForResponse: "Warte auf Antwort...",
  
  // RightSidebar
  benzGlobalStatus: "Benz Global Status",
  closeSidebar: "Seitenleiste schließen",
  noSystemLogs: "Keine Systemaktivitätsprotokolle verfügbar.",
  
  // MakePromptsPage
  salesAnalysis: "Verkaufsanalyse",
  emailCommunication: "E-Mail-Kommunikation",
  
  // Prompts
  dealerInfoLookup: "Händlerinformationssuche",
  dealerContactManagement: "Händlerkontaktverwaltung",
  vehicleModelInfo: "Fahrzeugmodellinformationen",
  vinTracking: "Fahrgestellnummer-Verfolgung",
  monthlySalesAnalysis: "Monatliche Verkaufsanalyse",
  dealerSegmentSales: "Händler-Segmentverkäufe",
  dealerAllocationStatus: "Händler-Zuweisungsstatus",
  emailSending: "E-Mail-Versand",
  
  // Prompt Descriptions
  dealerInfoLookupDesc: "Rufen Sie grundlegende Informationen von Mercedes-Benz-Händlern in Korea ab. Bitte geben Sie [[insert prompt:Händlername]] ein.",
  dealerContactManagementDesc: "Verwalten Sie Händlerkontaktinformationen. Bitte geben Sie [[insert prompt:Kontaktperson]] ein.",
  vehicleModelInfoDesc: "Rufen Sie detaillierte Informationen zu Mercedes-Benz-Fahrzeugmodellen ab. Bitte geben Sie [[insert prompt:Modellname]] ein.",
  vinTrackingDesc: "Verfolgen Sie die Fahrzeughistorie über die Fahrgestellnummer (VIN). Bitte geben Sie [[insert prompt:VIN-Nummer]] ein.",
  monthlySalesAnalysisDesc: "Analysieren Sie das Gesamtverkaufsvolumen und den Verkaufsbetrag in Korea für einen bestimmten Monat. Bitte geben Sie [[insert prompt:Monat/Jahr]] ein.",
  dealerSegmentSalesDesc: "Analysieren Sie den Verkaufsstatus bestimmter Segmentfahrzeuge für einen bestimmten Händler. Bitte geben Sie [[insert prompt:Händlername/Segment/Monat]] ein.",
  dealerAllocationStatusDesc: "Analysieren Sie den SUV-Zuweisungsstatus für einen bestimmten Händler in einem bestimmten Monat. Bitte geben Sie [[insert prompt:Händlername/Monat]] ein.",
  emailSendingDesc: "Senden Sie E-Mails an Händlervertreter. Bietet Originaltext und deutsche Übersetzung. Bitte geben Sie [[insert prompt:Empfänger/E-Mail-Inhalt]] ein.",
  
  // Prompt Titles
  dealerInfoLookupTitle: "Händlerinformationssuche",
  dealerContactManagementTitle: "Kontaktverwaltung",
  vehicleModelInfoTitle: "Fahrzeugmodell-Suche",
  vinTrackingTitle: "Fahrgestellnummer-Verfolgung",
  monthlySalesAnalysisTitle: "Monatliche Verkaufsanalyse",
  dealerSegmentSalesTitle: "Händler-Segmentverkäufe",
  dealerAllocationStatusTitle: "Zuweisungsstatus-Analyse",
  emailSendingTitle: "E-Mail-Versand",
  
  // Prompt Details
  dealerInfoLookupDetail: "Händlerkontakt- und Organisationsinformationssuche",
  dealerInfoLookupExamples: "Beispiele:\n• Kontaktinformationen für Hansung Motors anzeigen\n• Händlerinformationen für Hyosung The Class abrufen\n• KCC Auto Kontaktdaten nachschlagen",
  dealerContactManagementDetail: "Händlerkontaktpersoneninformationsverwaltung",
  dealerContactManagementExamples: "Beispiele:\n• Kontaktperson für Hansung Motors anzeigen\n• Kontaktinformationen für Hyosung The Class abrufen\n• KCC Auto Kontaktverwaltung nachschlagen",
  vehicleModelInfoDetail: "E-Klasse, C-Klasse, GLC, EQS, S-Klasse und andere Fahrzeugmodellinformationen",
  vehicleModelInfoExamples: "Beispiele:\n• E-Klasse (W214) Spezifikationen anzeigen\n• Elektrofahrzeugmodellliste abrufen\n• SUV-Modellpreisinformationen nachschlagen",
  vinTrackingDetail: "Fahrzeughistorieverwaltung über Fahrgestellnummer",
  vinTrackingExamples: "Beispiele:\n• Fahrzeuginformationen für VIN001HANSUNG finden\n• Fahrzeughistorie für VIN002HYOSUNG nachschlagen\n• Fahrzeug mit spezifischer VIN-Nummer verfolgen",
  monthlySalesAnalysisDetail: "Juli 2025 Gesamtverkaufsvolumen und Verkaufsbetrag-Analyse in Korea",
  monthlySalesAnalysisExamples: "Beispiele:\n• Juli Gesamtverkaufsstatus in Korea anzeigen\n• Juli Verkaufsvolumen und Betrag analysieren\n• Monatliche Verkaufsstatistiken in Korea abrufen",
  dealerSegmentSalesDetail: "Hyosung The Class Juli Limousinenverkaufsanalyse",
  dealerSegmentSalesExamples: "Beispiele:\n• Hyosung The Class Limousinenverkaufsleistung anzeigen\n• Juli Limousinenverkäufe analysieren\n• Händler-Segmentverkaufsstatistiken abrufen",
  dealerAllocationStatusDetail: "Hansung Motors August SUV-Zuweisungsstatus",
  dealerAllocationStatusExamples: "Beispiele:\n• Hansung Motors SUV-Zuweisungsstatus anzeigen\n• August SUV-Zuweisungsmenge analysieren\n• Händler-Zuweisungsstatus nachschlagen",
  emailSendingDetail: "E-Mail-Versand mit Gemini-Übersetzungsfunktion",
  emailSendingExamples: "Beispiele:\n• Einladungs-E-Mail an Hansung Motors Vertreter senden\n• Verkaufsbericht an Hyosung The Class senden\n• Zuweisungsstatus-Benachrichtigung an KCC Auto senden",
  
  // Analysis Results
  salesAnalysisResult: "Verkaufsanalyseergebnis",
  totalSalesVolume: "Gesamtverkaufsvolumen",
  totalSalesAmount: "Gesamtverkaufsbetrag",
  units: "Einheiten",
  won: "Won",
  detailedSalesHistory: "Detaillierte Verkaufsgeschichte",
  suvAllocationStatus: "SUV-Zuweisungsstatus",
  totalSuvAllocation: "Gesamte SUV-Zuweisung",
  allocationDetails: "Zuweisungsdetails",
  dealerSegmentSalesStatus: "Verkaufsstatus",
  totalSegmentSales: "Gesamte {segment}-Verkäufe",
  noSalesHistory: "Keine {segment}-Verkaufsgeschichte für diesen Zeitraum.",
  cannotDisplayResult: "Analyseergebnis kann nicht angezeigt werden.",
  noDataMessage: "Keine Daten gefunden.",
  
  // Date Format
  monthYearFormat: "{month} {year}",
  
  // Month Names
  january: "Januar",
  february: "Februar", 
  march: "März",
  april: "April",
  may: "Mai",
  june: "Juni",
  july: "Juli",
  august: "August",
  september: "September",
  october: "Oktober",
  november: "November",
  december: "Dezember",

  
  // Welcome Messages
  welcomeMessage: "Hallo! Banya Agent ist hier, um Ihnen bei Ihren Aufgaben zu helfen.",
  banyaAgentAnalyzing: "Banya Agent LLM analysiert die Workflow-Verfahren.",
  banyaAgentWorking: "Banya Agent ruft die identifizierte API auf.",
  workflowComplete: "Workflow erfolgreich abgeschlossen.",
  workflowUnexpectedEnd: "Workflow endete unerwartet.",
  postRequestComplete: "POST-Anfrage abgeschlossen",
  noResponseMessage: "Keine Antwortnachricht",
  
  // Email Content
  emailSubject: "Mercedes-Benz Neufahrzeug-Launch-Event Einladung",
  defaultEmailContent: "Wir planen, koreanische Automobiljournalisten und VIPs zur weltweit ersten Neufahrzeug-Launch-Veranstaltung einzuladen, die am 11. des nächsten Monats in der deutschen Zentrale stattfinden wird. Bitte beziehen Sie sich auf den untenstehenden Link, um einen Bericht zu verfassen.",
  originalText: "Originaltext",
  koreanTranslation: "Deutsche Übersetzung",
  translating: "Übersetze",
  processing: "Verarbeite",
  recipientSearchPlaceholder: "Suche nach Empfängername, Abteilung, Position, etc.",
  searching: "Suche",
  noDepartment: "Keine Abteilung",
  noPosition: "Keine Position",
  noSearchResults: "Keine Suchergebnisse gefunden.",
  selected: "Ausgewählt",
  generalQuestionProcessing: "Als allgemeine Frage klassifiziert, wird direkt an Gemini gesendet.",
  intentClassificationExpert: "Automobilindustrie-Managementsystem Intent-Klassifizierungsexperte",
  intentAnalysisGuidance: "Analysieren Sie die Frage des Benutzers, um die am besten geeignete Geschäftsabsicht zu klassifizieren und relevante Informationen zu extrahieren.",
  userMessage: "Benutzernachricht",
  possibleIntents: "Liste möglicher Geschäftsabsichten",
  analysisGuidelines: "Analyse-Richtlinien",
  analysisGuideline1: "Verstehen Sie die Bedeutung der Benutzernachricht genau und wählen Sie die am besten geeignete Absicht.",
  analysisGuideline2: "Verstehen und entsprechen Sie der Automobilindustrie-Terminologie (z.B. Händlernamen, Fahrzeugmodelle, Segmente, etc.).",
  analysisGuideline3: "Extrahieren Sie die folgenden Entitäten:",
  entityDealer: "Händlername (z.B. \"Hyosung The Class\", \"한성자동차\", \"효성더클래스\")",
  entityMonth: "Monat (Zahl, z.B. 7, 8)",
  entityYear: "Jahr (Zahl, z.B. 2025)",
  entitySegment: "Fahrzeugsegment (z.B. \"Limousine\", \"SUV\", \"세단\")",
  entityModel: "Fahrzeugmodellname (z.B. \"E-Klasse\", \"GLC\")",
  analysisGuideline4: "Unterstützen Sie sowohl Englisch als auch Koreanisch.",
  analysisGuideline5: "Wenn die Frage des Benutzers eine allgemeine Frage ist, die nicht mit Automobilindustrie-Managementsystemaufgaben zusammenhängt (z.B. Fahrzeugwartung, technische Beratung, allgemeine Informationen, etc.), klassifizieren Sie sie als \"GENERAL_QUESTION\".",
  jsonResponseFormat: "Antworten Sie nur im JSON-Format:",
  noMatchingIntent: "Wenn keine geeignete Absicht gefunden wird",
  generalQuestionCase: "Für allgemeine Fragen",
  example1: "Beispiele:",
  example1Question: "What were the total sales volume and sales amount in Korea for July?",
  example1Answer: "→ {\"matched_intent\": \"AUTOMOTIVE_VEHICLE_SALES_STATUS_1\", \"extracted_entities\": {\"month\": 7, \"year\": 2025}}",
  example2Question: "효성더클래스에서 7월에 주문한 세단 수량은?",
  example2Answer: "→ {\"matched_intent\": \"AUTOMOTIVE_DEALER_SEGMENT_SALES_5\", \"extracted_entities\": {\"dealer\": \"효성더클래스\", \"month\": 7, \"year\": 2025, \"segment\": \"Sedan\"}}",
  automotiveExpert: "Sie sind ein Automobilexperte. Geben Sie genaue und hilfreiche Antworten auf Benutzerfragen.",
  userQuestion: "Benutzerfrage",
  responseGuidelines: "Berücksichtigen Sie beim Antworten Folgendes",
  responseGuideline1: "Geben Sie genaue und zuverlässige Informationen",
  responseGuideline2: "Nutzen Sie automobilfachliches Wissen",
  responseGuideline3: "Geben Sie sichere und praktische Ratschläge",
  responseGuideline4: "Geben Sie bei Bedarf schrittweise Erklärungen",
  responseGuideline5: "Geben Sie strukturierte Antworten im Markdown-Format (Titel, Listen, Hervorhebungen, etc.)",
  responseGuideline6: "Antworten Sie auf Deutsch",

  detectAndRespondInSameLanguage: "Erkennen Sie die Sprache der Benutzerfrage und antworten Sie in derselben Sprache.",
  generalQuestionError: "Entschuldigung, beim Generieren einer Antwort auf Ihre Frage ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
  response: "Antwort",
  translateToGerman: "Bitte übersetzen Sie den folgenden Text ins natürliche Deutsche.",
  translationGuidelines: "Berücksichtigen Sie beim Übersetzen Folgendes",
  translationGuideline1: "Übersetzen Sie Automobilindustrie-Fachbegriffe angemessen ins Deutsche",
  translationGuideline2: "Behalten Sie den Geschäfts-E-Mail-Ton bei",
  translationGuideline3: "Verwenden Sie natürliche deutsche Ausdrücke",
  translationGuideline4: "Vermitteln Sie die ursprüngliche Bedeutung genau",
  textToTranslate: "Zu übersetzender Text",
  translationResult: "Bitte geben Sie nur das deutsche Übersetzungsergebnis aus.",
  
  // System Defaults
  defaultOperator: "Operator_HongGilDong",
  defaultLLM: "Banya Gemma 27B Tuned",
  
  // Saved Chat Sessions
  dealerInfoLookup: "Händlerinformationssuche",
  dealerInfoLookupDesc: "Sie können Kontaktinformationen und zuständige Personen von wichtigen Händlern wie Hansung Motors, Hyosung The Class und KCC Auto abrufen.",
  dealerInfoLookupExample: "Hansung Motors Händlerinformationen anzeigen\nHyosung The Class Kontakt mitteilen\nKCC Auto zuständige Person suchen",
  vehicleSalesStatus: "Fahrzeugverkaufsstatus",
  vehicleSalesStatusDesc: "Sie können händlerspezifische Fahrzeugverkaufsleistungen und VIN-Informationen abrufen.",
  vehicleSalesStatusExample: "Hansung Motors Juli-Verkaufsstatus anzeigen\nE-Klasse-Verkaufsstatistiken abrufen\nVIN001HANSUNG Fahrzeuginformationen finden",
  customerWaitlist: "Kundenwarteliste",
  customerWaitlistDesc: "Verwalten Sie Informationen von Kunden, die auf den Kauf bestimmter Fahrzeugmodelle warten.",
  customerWaitlistExample: "EQS-Warteliste anzeigen\nS-Klasse-Wartebestellung abrufen\nKundenwartestatus-Statistiken",
  vehicleModelInfo: "Fahrzeugmodellinformationen",
  vehicleModelInfoDesc: "Sie können detaillierte Informationen zu jedem Mercedes-Benz-Fahrzeugmodell abrufen.",
  vehicleModelInfoExample: "E-Klasse (W214) Spezifikationen anzeigen\nElektrofahrzeugmodellliste abrufen\nSUV-Modellpreisinformationen",
  communicationHub: "Zentrale-Händler-Kommunikation",
  communicationHubDesc: "Unterstützt die Echtzeitkommunikation zwischen der deutschen Zentrale und koreanischen Händlern.",
  communicationHubExample: "Händlerspezifische Verkaufsleistungsberichte senden\nFahrzeugzuweisungsanfragen erstellen\nHändlerinformationen aktualisieren",
  
  // Fixed Layout Data
  dealerInformationLookup: "Händlerinformationssuche",
  dealerInformationLookupDesc: "Rufen Sie grundlegende Informationen von Mercedes-Benz-Händlern in Korea ab.",
  vehicleSalesStatus: "Fahrzeugverkaufsstatus",
  vehicleSalesStatusDesc: "Rufen Sie händlerspezifische Fahrzeugverkaufsleistungen ab.",
  productionAllocationStatus: "Produktionszuweisungsstatus",
  productionAllocationStatusDesc: "Rufen Sie den Fahrzeugproduktionsstatus in der deutschen Zentrale und Zuweisungspläne für Korea ab.",
  customerWaitlistManagement: "Kundenwartelistenverwaltung",
  customerWaitlistManagementDesc: "Rufen Sie Informationen von Kunden ab, die auf den Kauf bestimmter Fahrzeugmodelle warten.",
  monthlySalesAnalysis: "Monatliche Verkaufsanalyse",
  monthlySalesAnalysisDesc: "Analysieren Sie das Gesamtverkaufsvolumen und den Verkaufsbetrag in Korea für Juli.",
  dealerSegmentSales: "Händler-Segmentverkäufe",
  dealerSegmentSalesDesc: "Analysieren Sie die Gesamtzahl der über Hyosung The Class im Juli bestellten Limousinen.",
  dealerAllocationStatus: "Händler-Zuweisungsstatus",
  dealerAllocationStatusDesc: "Analysieren Sie die Gesamtmenge der SUVs, die Hansung Motors im August zugewiesen werden sollen.",
  emailSending: "E-Mail-Versand",
  emailSendingDesc: "Senden Sie E-Mails an gewünschte Empfänger über das E-Mail-Versandformular."
};
