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
 * @param {Function} t - 다국어 번역 함수
 * @returns {Promise<{matched_intent: string, extracted_entities?: Object}>} - 식별된 의도 키와 추출된 엔티티 객체
 */
export const getGeminiIntent = async (userMessage, intentMapping, t) => {
    const intentString = JSON.stringify(intentMapping, null, 2);

    const prompt = `${t('intentClassificationExpert')}. 
${t('intentAnalysisGuidance')}

${t('userMessage')}: "${userMessage}"

${t('possibleIntents')}:
${intentString}

${t('analysisGuidelines')}:
1. ${t('analysisGuideline1')}
2. ${t('analysisGuideline2')}
3. ${t('analysisGuideline3')}
   - dealer: ${t('entityDealer')}
   - month: ${t('entityMonth')}
   - year: ${t('entityYear')}
   - segment: ${t('entitySegment')}
   - model: ${t('entityModel')}

4. ${t('analysisGuideline4')}
5. ${t('analysisGuideline5')}

${t('jsonResponseFormat')}:
{
  "matched_intent": "INTENT_KEY",
  "extracted_entities": {
    "dealer": "딜러명",
    "month": 숫자,
    "year": 숫자,
    "segment": "세그먼트",
    "model": "모델명"
  }
}

${t('noMatchingIntent')}: {"matched_intent": "NONE", "extracted_entities": {}}
${t('generalQuestionCase')}: {"matched_intent": "GENERAL_QUESTION", "extracted_entities": {}}

${t('example1')}:
- "${t('example1Question')}" 
  ${t('example1Answer')}
- "${t('example2Question')}" 
  ${t('example2Answer')}`;

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
export const translateToKorean = async (text, t) => {
    const prompt = `${t('translateToKorean')} 
    ${t('translationGuidelines')}:
    1. ${t('translationGuideline1')}
    2. ${t('translationGuideline2')}
    3. ${t('translationGuideline3')}
    4. ${t('translationGuideline4')}
    
    ${t('textToTranslate')}: "${text}"
    
    ${t('translationResult')}`;

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

/**
 * Gemini API를 사용하여 텍스트를 독일어로 번역합니다.
 * @param {string} text - 번역할 텍스트 (한국어, 영어 등)
 * @returns {Promise<string>} - 독일어로 번역된 텍스트
 */
export const translateToGerman = async (text, t) => {
    const prompt = `${t('translateToGerman')} 
    ${t('translationGuidelines')}:
    1. ${t('translationGuideline1')}
    2. ${t('translationGuideline2')}
    3. ${t('translationGuideline3')}
    4. ${t('translationGuideline4')}
    
    ${t('textToTranslate')}: "${text}"
    
    ${t('translationResult')}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Error calling Gemini API for German translation:", error);
        // 번역 실패 시 원본 텍스트 반환
        return text;
    }
};

export const handleGeneralQuestion = async (question, t) => {
    /**
     * 일반적인 질문에 대해 Gemini에게 직접 답변을 요청합니다.
     * @param {string} question - 사용자의 일반 질문
     * @param {Function} t - 다국어 번역 함수
     * @returns {Promise<string>} - Gemini의 답변
     */
    
    const prompt = `${t('automotiveExpert')}

${t('userQuestion')}: "${question}"

${t('responseGuidelines')}:
1. ${t('responseGuideline1')}
2. ${t('responseGuideline2')}
3. ${t('responseGuideline3')}
4. ${t('responseGuideline4')}
5. ${t('responseGuideline5')}
6. ${t('detectAndRespondInSameLanguage')}

${t('response')}:`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Error calling Gemini API for general question:", error);
        return t('generalQuestionError');
    }
};
