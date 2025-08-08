// src/components/InputBox.jsx
import React, { useRef, useEffect } from 'react';
import './InputBox.css';
import PromptBoxIcon from '../assets/Prompt Box.png';
import CloseIcon from '../assets/close.png'; // 닫기 아이콘 추가

// inputRef prop을 추가
// pastedImage, onPasteImage, onClearImage prop 추가
function InputBox({ value, onChange, onSend, isLoading, placeholder, inputRef, pastedImage, onPasteImage, onClearImage }) {
    const textareaRef = useRef(null);

    useEffect(() => {
        // 부모로부터 받은 inputRef를 내부 textareaRef와 연결
        if (inputRef) {
            inputRef.current = textareaRef.current;
        }
    }, [inputRef]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    // 클립보드 이미지 붙여넣기 처리
    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
                const file = items[i].getAsFile();
                if (file) {
                    const imageUrl = URL.createObjectURL(file);
                    onPasteImage(file, imageUrl); // MainContent로 파일과 URL 전달
                    e.preventDefault(); // 기본 붙여넣기 동작 방지 (텍스트로 붙여넣는 것)
                    return;
                }
            }
        }
    };

    return (
        <div className="custom-prompt-input-box card">
            {pastedImage && (
                <div className="image-preview-container">
                    <img src={pastedImage.url} alt="Pasted" className="image-thumbnail" />
                    <button className="clear-image-button" onClick={onClearImage}>
                        <img src={CloseIcon} alt="Clear" />
                    </button>
                </div>
            )}
            <textarea
                ref={textareaRef}
                placeholder={isLoading ? "응답을 기다리는 중..." : placeholder || "메시지를 입력하세요..."}
                value={value}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste} // onPaste 이벤트 핸들러 추가
                rows="1"
                className="custom-prompt-textarea"
                disabled={isLoading}
            ></textarea>
            <button onClick={onSend} className="custom-send-button" disabled={isLoading || (value.trim() === '' && !pastedImage)}>
                <img src={PromptBoxIcon} alt="Send" />
            </button>
        </div>
    );
}

export default InputBox;
