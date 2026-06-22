import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import './styles/theme.css';

import App from './App.jsx';
import { AuthContextProvider } from './context/AuthContext.jsx';

const savedTheme = localStorage.getItem('theme') || 'dark';

document.documentElement.setAttribute('data-theme', savedTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  </StrictMode>,
);
