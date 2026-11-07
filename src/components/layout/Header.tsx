import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Menu, X, Download, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const Header: React.FC = () => {
  const { state, dispatch, addToast } = useApp();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleInstall = async () => {
    const event = (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt;
    if (event) {
      event.prompt();
      const { outcome } = await event.userChoice;
      if (outcome === 'accepted') {
        addToast({ type: 'success', title: 'Uygulama yükleniyor', message: 'HAS Prepper Disk cihazınıza yüklendi' });
        dispatch({ type: 'SET_INSTALL_PROMPT', payload: { dismissed: true, show: false } });
      }
      (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt = undefined;
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Ana Sayfa' },
    { path: '/library', label: 'Kütüphane' },
    { path: '/emergency', label: 'Acil Durum' },
    { path: '/settings', label: 'Ayarlar' },
  ];

  return (
    <header className="has-top">
      <div className="flex items-center gap-4">
        <div className="has-logo">HAS_<span>Prepper</span>Disk</div>
        <div className="has-slogan">Çevrimdışı bilgi arşivi &mdash; internet olmasa da açık</div>
      </div>

      <nav className="has-navlinks" aria-label="Ana navigasyon">
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'px-3 py-2 rounded transition-colors font-medium',
                isActive(item.path)
                  ? 'bg-has-blue text-white'
                  : 'text-has-blue hover:bg-has-lightBlue/50'
              )}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-has-blue hover:bg-has-lightBlue/50 rounded"
            aria-label={mobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <span className={cn('px-2 py-1 text-xs font-medium rounded', state.isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
          {state.isOnline ? (
            <>
              <Wifi className="w-3 h-3 inline-block mr-1" /> Çevrimiçi
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 inline-block mr-1" /> Çevrimdışı
            </>
          )}
        </span>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden w-full border-t border-has-border pt-4 mt-4">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'px-3 py-2 rounded transition-colors font-medium text-center',
                  isActive(item.path)
                    ? 'bg-has-blue text-white'
                    : 'text-has-blue hover:bg-has-lightBlue/50'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {state.installPrompt.show && !state.installPrompt.dismissed && (
        <div className="install-prompt md:hidden fixed bottom-4 right-4 left-4 md:left-auto max-w-sm z-50">
          <div className="bg-white border border-has-border rounded-lg shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-has-blue/10 rounded-lg">
                <Download className="w-6 h-6 text-has-blue" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-has-text">Uygulama olarak yükle</h3>
                <p className="text-sm text-has-textMuted mt-1">
                  HAS Prepper Disk'i cihazınıza kurun ve çevrimdışı erişin.
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleInstall}
                className="flex-1 px-3 py-2 bg-has-blue text-white text-sm font-medium rounded hover:bg-[#00527a] transition-colors"
              >
                Yükle
              </button>
              <button
                onClick={() => {
                  dispatch({ type: 'SET_INSTALL_PROMPT', payload: { dismissed: true } });
                }}
                className="px-3 py-2 text-sm font-medium text-has-text bg-has-cardBg border border-has-border rounded hover:bg-has-cardBg2 transition-colors"
              >
                Daha Sonra
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent;
  }
}