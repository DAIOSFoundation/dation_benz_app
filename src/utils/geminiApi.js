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
 * Gemini API를 호출하여 사용자 입력과 제공된 의도 매핑을 기반으로 가장 유사한 의도를 식별합니다.
 * 또한, 특정 의도와 관련된 엔티티(예: 환자 이름)를 추출합니다.
 * @param {string} userMessage - 사용자의 입력 메시지
 * @param {Object} intentMapping - 의도 키와 해당 질문 목록을 포함하는 객체 (예: {"BOM_STEP_0": ["그릴리 BOM 확인"]})
 * @returns {Promise<{matched_intent: string, extracted_entities?: Object}>} - 식별된 의도 키와 추출된 엔티티 객체
 */
export const getGeminiIntent = async (userMessage, intentMapping) => {
    const intentString = JSON.stringify(intentMapping, null, 2); // 프롬프트에 JSON 형태로 삽입

    const prompt = `주어진 사용자 메시지: '${userMessage}'.
    가능한 의도의 리스트와 관련된 키워드와 문장들 :
    ${intentString}
    제공된 리스트 중에서 의미적으로 가장 유사한 의도를 가진 리스트로 부터 매칭된 것을 선택.
    만약 사용자 메시지에 환자 이름이 포함되어 있고, 해당 환자 정보나 예약 내역 조회와 관련된 의도라면, 환자 이름을 'patient_name' 키로 추출.
    JSON object 포맷으로만 응답 : { "matched_intent": "INTENT_KEY", "extracted_entities": { "patient_name": "환자이름" } }
    만약 적합한 의도가 매칭되지 않으면, 응답은 : { "matched_intent": "NONE" } 으로 출력.
    한국어로만 응답할것`;

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
