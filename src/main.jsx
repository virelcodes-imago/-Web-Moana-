import { BrowserRouter } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { seedDatabase } from './data/seed';
import { LanguageProvider } from './i18n/LanguageContext';

function AppInitializer() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // El seed debe completarse ANTES de que las páginas lean la DB
    // Esto evita el race condition donde la DB está vacía cuando las páginas cargan
    seedDatabase()
      .catch(console.error)
      .finally(() => setDbReady(true));
  }, []);

  if (!dbReady) {
    // Pantalla de carga mientras el seed inicializa la DB
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f9ff',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <img src="/fotos/LOGOS/logo.png" alt="Moana Turismo" style={{ height: '72px', opacity: 0.85 }} />
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e0f2fe',
          borderTop: '4px solid #0ea5e9',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LanguageProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppInitializer />
);
