// src/App.jsx
import React from 'react';
import './App.css';
import { LanguageProvider } from './contexts/LanguageContext';
import AppContent from './components/AppContent';

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;