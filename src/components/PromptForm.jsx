// src/components/PromptForm.jsx
import React, { useState, useEffect } from 'react';

function PromptForm({ onSave, initialData = null }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [promptDescription, setPromptDescription] = useState('');
  const [originalId, setOriginalId] = useState(null); // 편집 시 기존 ID 저장

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setPromptDescription(initialData.promptDescription || '');
      setOriginalId(initialData.id);
    } else {
      // 새 프롬프트일 경우 필드 초기화
      setTitle('');
      setContent('');
      setPromptDescription('');
      setOriginalId(null);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !promptDescription.trim()) {
      alert('모든 필드를 채워주세요!');
      return;
    }
    onSave({ title, content, promptDescription }, originalId);
    // 저장 후 폼 초기화 (새 프롬프트 모드일 경우)
    if (!originalId) {
      setTitle('');
      setContent('');
      setPromptDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="promptContent">Prompt content</label>
        <textarea
          id="promptContent"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="e.g. 그릴리 햄을 제조하기 위한 원재료를 Bill of Materials 로 정리하는 프롬프트입니다."
          required
        ></textarea>
      </div>

      <div className="form-group">
        <label htmlFor="promptTitle">Prompt title</label>
        <input
          type="text"
          id="promptTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. 그릴리 BOM 프롬프트"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="promptDescription">Prompt description</label>
        <input
          type="text"
          id="promptDescription"
          value={promptDescription}
          onChange={(e) => setPromptDescription(e.target.value)}
          placeholder="e.g. 그릴리 햄 BOM 관련 정보를 요청하는 프롬프트"
          required
        />
      </div>

      <button type="submit" className="makeprompts-save-button">
        Save Prompt
      </button>
    </form>
  );
}

export default PromptForm;