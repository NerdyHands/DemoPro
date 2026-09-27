import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import * as serviceWorkerRegistration from './serviceWorkerRegistration.jsx';
import reportWebVitals from './reportWebVitals.jsx';

// Suppress browser extension errors (React DevTools, Redux DevTools, etc.)
// These are harmless errors from extensions trying to communicate after disconnection
window.addEventListener('error', (event) => {
  if (
    event.message?.includes('disconnected port') ||
    event.message?.includes('Extension context invalidated') ||
    event.filename?.includes('proxy.js') ||
    event.filename?.includes('chrome-extension://') ||
    event.filename?.includes('moz-extension://')
  ) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// Also catch unhandled promise rejections from extensions
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.message?.includes('disconnected port') ||
    event.reason?.message?.includes('Extension context invalidated') ||
    String(event.reason).includes('proxy.js')
  ) {
    event.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 