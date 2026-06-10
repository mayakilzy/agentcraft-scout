import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LanguageProvider } from './app/contexts/LanguageContext';
import { AppSettingsProvider } from './app/contexts/AppSettingsContext';
import './app/styles/index.css';
import App from './app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <AppSettingsProvider>
        <App />
      </AppSettingsProvider>
    </LanguageProvider>
  </StrictMode>
);
