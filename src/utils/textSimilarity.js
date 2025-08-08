// src/utils/textSimilarity.js

/**
 * 텍스트를 전처리합니다: 소문자 변환, 특수문자 및 숫자 제거, 공백 기준으로 단어 분리.
 * @param {string} text - 전처리할 원본 텍스트.
 * @returns {string[]} 전처리된 단어 배열.
 */
export function preprocessText(text) {
    // text가 문자열이 아니거나 비어있으면 빈 배열 반환
    if (typeof text !== 'string' || text.trim() === '') {
        return [];
    }
    // 소문자 변환, 알파벳과 한글만 남기고 제거, 여러 공백을 하나의 공백으로 치환 후 단어 분리
    return text
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s]/g, '') // 알파벳, 숫자, 한글, 공백만 남김
        .replace(/\s+/g, ' ') // 여러 공백을 하나의 공백으로
        .trim()
        .split(' ')
        .filter(word => word.length > 0); // 빈 문자열 단어 제거
}

/**
 * 전처리된 단어 배열로부터 각 단어의 빈도수를 계산합니다.
 * @param {string[]} words - 전처리된 단어 배열.
 * @returns {Map<string, number>} 각 단어와 그 빈도수를 매핑한 Map 객체.
 */
export function getTermFrequency(words) {
    const termFrequency = new Map();
    words.forEach(word => {
        termFrequency.set(word, (termFrequency.get(word) || 0) + 1);
    });
    return termFrequency;
}

/**
 * 두 텍스트 간의 코사인 유사도를 계산합니다.
 * @param {string} text1 - 첫 번째 텍스트.
 * @param {string} text2 - 두 번째 텍스트.
 * @param {string} [docType=''] - 문서 타입 (현재 유사도 계산에 직접 사용되지는 않음).
 * @returns {number} 0부터 100 사이의 백분율로 표현된 유사도.
 */
export function calculateSimilarity(text1, text2, docType = '') {
    // calculateSimilarity 함수는 원본 텍스트를 받아서 내부적으로 전처리합니다.
    // text1 또는 text2가 유효한 문자열이 아니면 0을 반환합니다.
    if (typeof text1 !== 'string' || typeof text2 !== 'string') return 0;

    const words1 = preprocessText(text1);
    const words2 = preprocessText(text2);

    if (words1.length === 0 || words2.length === 0) return 0; // 한쪽이라도 단어가 없으면 유사도 0

    const tf1 = getTermFrequency(words1);
    const tf2 = getTermFrequency(words2);

    // 모든 고유한 단어의 집합 (Vocabulary) 생성
    const vocabulary = new Set([...words1, ...words2]);

    // 벡터 생성
    const vector1 = [];
    const vector2 = [];

    vocabulary.forEach(word => {
        vector1.push(tf1.get(word) || 0);
        vector2.push(tf2.get(word) || 0);
    });

    // 코사인 유사도 계산
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vocabulary.size; i++) {
        dotProduct += vector1[i] * vector2[i];
        magnitude1 += vector1[i] * vector1[i];
        magnitude2 += vector2[i] * vector2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
        return 0; // 한쪽 벡터의 크기가 0이면 유사도 0
    }

    const similarity = dotProduct / (magnitude1 * magnitude2);

    // 유사도 결과가 0과 1 사이이므로 0-100%로 변환
    return parseFloat((similarity * 100).toFixed(2));
}
