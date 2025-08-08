// src/utils/geminiApi.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// .env 파일에 VITE_MAIN_LLM_API_KEY가 설정되어 있어야 합니다.
const API_KEY = import.meta.env.VITE_MAIN_LLM_API_KEY;

if (!API_KEY) {
  console.error("Gemini API Key is not set. Please set VITE_MAIN_LLM_API_KEY in your .env file.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
//const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // 적절한 모델 사용
const model = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' }); // 적절한 모델 사용

/**
 * Converts a File object to a GoogleGenerativeAI.Part object for inline data.
 * @param {File} file - The file to convert.
 * @returns {Promise<import('@google-generative-ai').Part>} A promise that resolves to a Generative Part object.
 */
async function fileToGenerativePart(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1]; // Get base64 string
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                },
            });
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Gemini API를 호출하여 사용자 입력을 분석하여 의도를 분류하고 관련 엔티티를 추출합니다.
 * @param {string} userMessage - 사용자의 입력 메시지
 * @param {Object} intentMapping - 의도 키와 해당 질문 목록을 포함하는 객체
 * @returns {Promise<{matched_intent: string, extracted_entities?: Object}>} - 식별된 의도 키와 추출된 엔티티 객체
 */
export const getGeminiIntent = async (userMessage, intentMapping) => {
    const intentString = JSON.stringify(intentMapping, null, 2);

    const prompt = `당신은 자동차 업계 관리 시스템의 의도 분류 전문가입니다. 
사용자의 질문을 분석하여 가장 적합한 업무 의도를 분류하고, 관련 정보를 추출해주세요.

사용자 메시지: "${userMessage}"

가능한 업무 의도 목록:
${intentString}

분석 지침:
1. 사용자 메시지의 의미를 정확히 파악하여 가장 적합한 의도를 선택하세요.
2. 자동차 업계 관련 용어를 이해하고 매칭하세요 (예: 딜러명, 차량 모델, 세그먼트 등).
3. 다음 엔티티들을 추출하세요:
   - dealer: 딜러명 (예: "Hyosung The Class", "한성자동차", "효성더클래스")
   - month: 월 (숫자, 예: 7, 8)
   - year: 년도 (숫자, 예: 2025)
   - segment: 차량 세그먼트 (예: "Sedan", "SUV", "세단")
   - model: 차량 모델명 (예: "E-Class", "GLC")
   - patient_name: 환자명 (병원 시스템용)

4. 영어와 한국어 모두 지원하세요.

JSON 형식으로만 응답하세요:
{
  "matched_intent": "INTENT_KEY",
  "extracted_entities": {
    "dealer": "딜러명",
    "month": 숫자,
    "year": 숫자,
    "segment": "세그먼트",
    "model": "모델명",
    "patient_name": "환자명"
  }
}

적합한 의도가 없으면: {"matched_intent": "NONE", "extracted_entities": {}}

예시:
- "What were the total sales volume and sales amount in Korea for July?" 
  → {"matched_intent": "AUTOMOTIVE_VEHICLE_SALES_STATUS_1", "extracted_entities": {"month": 7, "year": 2025}}
- "효성더클래스에서 7월에 주문한 세단 수량은?" 
  → {"matched_intent": "AUTOMOTIVE_DEALER_SEGMENT_SALES_5", "extracted_entities": {"dealer": "효성더클래스", "month": 7, "year": 2025, "segment": "Sedan"}}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini raw response for intent matching:", text); // 디버깅용

        // Gemini가 JSON 응답을 markdown 블록으로 감싸는 경우가 있어 제거
        const cleanedText = text.replace(/```json|```/g, '').trim();
        const jsonResponse = JSON.parse(cleanedText);
        
        // Ensure extracted_entities is an object if it exists
        if (jsonResponse.extracted_entities && typeof jsonResponse.extracted_entities !== 'object') {
            jsonResponse.extracted_entities = {}; // Default to empty object if not valid
        }

        return {
            matched_intent: jsonResponse.matched_intent || "NONE",
            extracted_entities: jsonResponse.extracted_entities || {}
        };
    } catch (error) {
        console.error("Error calling Gemini API for intent matching:", error);
        return { matched_intent: "ERROR", extracted_entities: {} }; // API 호출 자체에 문제가 발생한 경우
    }
};

/**
 * Gemini API를 호출하여 텍스트 또는 텍스트와 이미지를 포함한 응답을 생성합니다.
 * @param {string} promptText - 사용자의 텍스트 입력.
 * @param {File | null} imageFile - 사용자가 첨부한 이미지 파일 (선택 사항).
 * @param {string | null} context - LLM에 제공할 추가 문맥 정보 (선택 사항).
 * @returns {Promise<{text: string, imageUrl?: string, imageMimeType?: string}>} - Gemini API의 응답 텍스트와 이미지 URL (있는 경우).
*/
export const getGeminiTextResponse = async (promptText, imageFile = null, context = null) => {
    try {
        let finalPrompt = promptText;
        // context가 null이 아니며, 빈 문자열이 아닐 때만 컨텍스트를 프롬프트에 추가합니다.
        if (context && context.trim() !== '') {
            finalPrompt = `[Context]:\n${context}\n\n[Question]:\n${promptText}`;
        }
        
        const parts = [{ text: finalPrompt }];

        if (imageFile) {
            const imagePart = await fileToGenerativePart(imageFile);
            parts.push(imagePart);
        }

        const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
        const response = await result.response;
        
        let responseText = '';
        let responseImageUrl = null;
        let responseImageMimeType = null;

        // 응답에서 텍스트와 이미지를 파싱
        if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0];
            if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                    if (part.text) {
                        responseText += part.text;
                    } else if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                        // 첫 번째 이미지 데이터만 사용
                        if (!responseImageUrl) {
                            responseImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                            responseImageMimeType = part.inlineData.mimeType;
                            // 이미지 URL이 생성되었는지 로그로 확인
                            console.log("Gemini API Image URL returned:", responseImageUrl.substring(0, 100) + "..."); // 너무 길면 잘라서 출력
                            console.log("Gemini API Image Mime Type:", responseImageMimeType);
                        }
                    }
                }
            }
        }
        
        return { text: responseText, imageUrl: responseImageUrl, imageMimeType: responseImageMimeType };
    } catch (error) {
        console.error("Error calling Gemini API for text response:", error);
        return { text: "An error occurred while getting text response from LLM." };
    }
};

/**
 * Gemini API를 사용하여 텍스트를 한국어로 번역합니다.
 * @param {string} text - 번역할 텍스트 (영어, 독일어 등)
 * @returns {Promise<string>} - 한국어로 번역된 텍스트
 */
export const translateToKorean = async (text) => {
    const prompt = `다음 텍스트를 자연스러운 한국어로 번역해주세요. 
    번역 시 다음 사항을 고려해주세요:
    1. 자동차 업계 전문 용어는 적절한 한국어로 번역
    2. 비즈니스 이메일 톤 유지
    3. 자연스러운 한국어 표현 사용
    4. 원문의 의미를 정확히 전달
    
    번역할 텍스트: "${text}"
    
    번역 결과만 한국어로 출력해주세요.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Error calling Gemini API for translation:", error);
        // 번역 실패 시 원본 텍스트 반환
        return text;
    }
};
