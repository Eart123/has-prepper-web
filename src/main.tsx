import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Base path for assets (handles GitHub Pages subdirectory deployment)
const basePath = import.meta.env.BASE_URL || '/';

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${basePath}sw.js`, { scope: basePath }).then(
      (registration) => {
        console.log('[SW] Registered:', registration.scope);
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] New version available');
              }
            });
          }
        });
      },
      (error) => {
        console.error('[SW] Registration failed:', error);
      }
    );
  });

  let deferredPrompt: BeforeInstallPromptEvent | null = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt = deferredPrompt;
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed');
    deferredPrompt = null;
    (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt = undefined;
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}