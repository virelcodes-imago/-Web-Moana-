import { BrowserRouter } from 'react-router-dom';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { seedDatabase } from './data/seed';
import { LanguageProvider } from './i18n/LanguageContext';

function AppInitializer() {
  useEffect(() => {
    seedDatabase();
  }, []);

  return (
    <LanguageProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LanguageProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppInitializer />
  </React.StrictMode>
);

