// src/components/PromptFolderList.jsx
import React from 'react';
import FolderIcon from '../assets/folder.png'; // 닫힌 폴더 아이콘
import FolderOpenIcon from '../assets/folder open.png'; // 열린 폴더 아이콘

function PromptFolderList({ folders, selectedFolderId, onSelectFolder, onAddNewPrompt }) {
  return (
    <>
      <ul className="makeprompts-folder-list">
        {folders.map(folder => (
          <li
            key={folder.id}
            className={`makeprompts-folder-item ${folder.id === selectedFolderId ? 'selected' : ''}`}
            onClick={() => onSelectFolder(folder.id)}
          >
            <img src={folder.id === selectedFolderId ? FolderOpenIcon : FolderIcon} alt="Folder Icon" />
            <span>{folder.name}</span>
          </li>
        ))}
      </ul>
      <button className="makeprompts-add-new-btn" onClick={onAddNewPrompt}>
        Add new
      </button>
    </>
  );
}

export default PromptFolderList;