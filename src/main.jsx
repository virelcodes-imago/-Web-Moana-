import { BrowserRouter } from 'react-router-dom';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { seedDatabase } from './data/seed';
import { LanguageProvider } from './i18n/LanguageContext';

function AppInitializer() {
  useEffect(() => {
    // Inicializar la base de datos una sola vez al montar la app
    seedDatabase().catch(console.error);
  }, []);

  return (
    <LanguageProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LanguageProvider>
  );
}

// Sin React.StrictMode para evitar la doble ejecución del seed en desarrollo
ReactDOM.createRoot(document.getElementById('root')).render(
  <AppInitializer />
);
