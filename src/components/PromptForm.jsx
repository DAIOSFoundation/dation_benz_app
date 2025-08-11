// src/components/PromptForm.jsx
import React, { useState, useEffect } from 'react';

function PromptForm({ onSave, initialData = null }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [promptDescription, setPromptDescription] = useState('');
  const [examples, setExamples] = useState('');
  const [originalId, setOriginalId] = useState(null); // 편집 시 기존 ID 저장

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setPromptDescription(initialData.promptDescription || '');
      setExamples(initialData.examples || '');
      setOriginalId(initialData.id);
    } else {
      // 새 프롬프트일 경우 필드 초기화
      setTitle('');
      setContent('');
      setPromptDescription('');
      setExamples('');
      setOriginalId(null);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !promptDescription.trim()) {
      alert('모든 필드를 채워주세요!');
      return;
    }
    onSave({ title, content, promptDescription, examples }, originalId);
    // 저장 후 폼 초기화 (새 프롬프트 모드일 경우)
    if (!originalId) {
      setTitle('');
      setContent('');
      setPromptDescription('');
      setExamples('');
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
          placeholder="e.g. 한국 내 벤츠 딜러사들의 기본 정보를 조회합니다."
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
          placeholder="e.g. 딜러 정보 조회"
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
          placeholder="e.g. 딜러사 연락처 및 조직 정보 조회"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="examples">Examples</label>
        <textarea
          id="examples"
          value={examples}
          onChange={(e) => setExamples(e.target.value)}
          placeholder="e.g. • 한성자동차 연락처 정보 보여줘&#10;• 효성더클래스 담당자 정보 조회&#10;• KCC오토 회사 정보 알려줘"
          rows="4"
        />
      </div>

      <button type="submit" className="makeprompts-save-button">
        Save Prompt
      </button>
    </form>
  );
}

export default PromptForm;