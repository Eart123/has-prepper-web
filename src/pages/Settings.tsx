import React, { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, Globe, Database, Trash2, RefreshCw, Info, Shield, Wifi } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';
import { database } from '../lib/database';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/Modal';
import { formatBytes } from '../lib/utils';

export const Settings: React.FC = () => {
  const { state, dispatch, addToast } = useApp();
  const [settings, setSettings] = useState(state.settings);
  const [storageInfo, setStorageInfo] = useState<{ used: number; available: number } | null>(null);
  const [swRegistered, setSwRegistered] = useState(false);
  const [showClearData, setShowClearData] = useState(false);
  const [showResetSettings, setShowResetSettings] = useState(false);
  const [checkingUpdates, setCheckingUpdates] = useState(false);

  useEffect(() => {
    setSettings(state.settings);
    checkStorage();
    checkServiceWorker();
  }, [state.settings]);

  const checkStorage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        setStorageInfo({
          used: estimate.usage || 0,
          available: estimate.quota || 0,
        });
      } catch {
        // Ignore
      }
    }
  };

  const checkServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      setSwRegistered(!!registration);
    }
  };

  const handleSettingChange = (key: keyof typeof settings, value: unknown) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
  };

  const handleClearData = async () => {
    try {
      await database.zimFiles.clear();
      await database.toasts.clear();

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      addToast({ type: 'success', title: 'Veriler temizlendi', message: 'Tüm önbellek ve yerel veriler silindi' });
      dispatch({ type: 'SET_ZIM_FILES', payload: [] });
      checkStorage();
      checkServiceWorker();
    } catch (error) {
      console.error('Failed to clear data:', error);
      addToast({ type: 'error', title: 'Hata', message: 'Veriler temizlenemedi' });
    }
    setShowClearData(false);
  };

  const handleResetSettings = async () => {
    const defaultSettings = {
      theme: 'system' as const,
      language: 'tr' as const,
      autoUpdate: true,
      cacheSize: 500,
      showInstallPrompt: true,
    };
    setSettings(defaultSettings);
    dispatch({ type: 'SET_SETTINGS', payload: defaultSettings });
    addToast({ type: 'success', title: 'Ayarlar sıfırlandı', message: 'Varsayılan ayarlar geri yüklendi' });
    setShowResetSettings(false);
  };

  const handleCheckUpdates = async () => {
    setCheckingUpdates(true);
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          addToast({ type: 'success', title: 'Güncelleme kontrolü', message: 'Yeni sürüm varsa arka planda indirilecek' });
        }
      }
      addToast({ type: 'info', title: 'Güncelleme kontrolü', message: 'Uygulama güncel' });
    } catch {
      addToast({ type: 'error', title: 'Hata', message: 'Güncelleme kontrolü başarısız' });
    } finally {
      setCheckingUpdates(false);
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Açık', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Koyu', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'Sistem', icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="font-heading text-has-blue text-2xl font-bold">Ayarlar</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Görünüm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-has-text mb-2">Tema</label>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSettingChange('theme', option.value)}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2',
                    settings.theme === option.value
                      ? 'border-has-blue bg-has-blue/5'
                      : 'border-has-border hover:border-has-blue/50'
                  )}
                >
                  {option.icon}
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-has-text mb-2">Dil</label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value as 'tr' | 'en')}
              className="w-full px-3 py-2 bg-white border border-has-border rounded text-has-text focus:outline-none focus:ring-2 focus:ring-has-blue"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Veri ve Depolama
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {storageInfo && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-has-textMuted">Kullanılan</span>
                <span className="font-medium">{formatBytes(storageInfo.used)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-has-textMuted">Kullanılabilir</span>
                <span className="font-medium">{formatBytes(storageInfo.available)}</span>
              </div>
              <div className="w-full bg-has-cardBg rounded-full h-2">
                <div
                  className="bg-has-blue h-2 rounded-full transition-all"
                  style={{ width: `${storageInfo.available > 0 ? (storageInfo.used / storageInfo.available) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 p-3 bg-has-cardBg rounded-lg cursor-pointer hover:bg-has-cardBg2 transition-colors">
              <input
                type="checkbox"
                checked={settings.autoUpdate}
                onChange={(e) => handleSettingChange('autoUpdate', e.target.checked)}
                className="w-4 h-4 text-has-blue border-has-border rounded focus:ring-has-blue"
              />
              <div>
                <p className="font-medium text-has-text">Otomatik güncellemeler</p>
                <p className="text-sm text-has-textMuted">Yeni içerik ve uygulama güncellemelerini otomatik kontrol et</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-has-cardBg rounded-lg cursor-pointer hover:bg-has-cardBg2 transition-colors">
              <input
                type="checkbox"
                checked={settings.showInstallPrompt}
                onChange={(e) => handleSettingChange('showInstallPrompt', e.target.checked)}
                className="w-4 h-4 text-has-blue border-has-border rounded focus:ring-has-blue"
              />
              <div>
                <p className="font-medium text-has-text">Kurulum isteği göster</p>
                <p className="text-sm text-has-textMuted">Uygulama olarak yükleme teklifini göster</p>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-has-text mb-2">Önbellek boyutu limiti (MB)</label>
            <input
              type="number"
              min="100"
              max="2000"
              step="50"
              value={settings.cacheSize}
              onChange={(e) => handleSettingChange('cacheSize', parseInt(e.target.value) || 500)}
              className="w-full max-w-xs px-3 py-2 bg-white border border-has-border rounded text-has-text focus:outline-none focus:ring-2 focus:ring-has-blue"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            PWA ve Çevrimdışı
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-has-text">Service Worker</p>
              <p className="text-sm text-has-textMuted">Çevrimdışı çalışma ve önbellekleme</p>
            </div>
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-medium',
              swRegistered ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            )}>
              {swRegistered ? 'Etkin' : 'Etkin değil'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-has-text">Çevrimdışı mod</p>
              <p className="text-sm text-has-textMuted">Uygulama internet olmadan çalışabilir</p>
            </div>
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-medium',
              navigator.onLine ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            )}>
              {navigator.onLine ? 'Çevrimiçi' : 'Çevrimdışı'}
            </span>
          </div>

          <Button variant="secondary" onClick={handleCheckUpdates} loading={checkingUpdates}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Güncellemeleri Kontrol Et
          </Button>
        </CardContent>
      </Card>

      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-has-red">
            <Shield className="w-5 h-5" />
            Tehlikeli Bölge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Uyarı:</strong> Bu işlemler geri alınamaz. Tüm ZIM dosyalarınız, önbellekler ve ayarlarınız silinecektir.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={() => setShowClearData(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Tüm Verileri Temizle
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowResetSettings(true)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Ayarları Sıfırla
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Hakkında
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-has-textMuted">Sürüm</span>
            <span className="font-mono">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-has-textMuted">Platform</span>
            <span>Progressive Web App</span>
          </div>
          <div className="flex justify-between">
            <span className="text-has-textMuted">Taban</span>
            <span>Internet-in-a-Box, Kiwix</span>
          </div>
          <div className="flex justify-between">
            <span className="text-has-textMuted">Lisans</span>
            <span>MIT</span>
          </div>
          <div className="pt-3 border-t border-has-border">
            <a
              href="https://github.com/schematrix/HAS_Prepper_Disk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-has-blue hover:text-has-orange flex items-center gap-1"
            >
              <Globe className="w-4 h-4" />
              GitHub Deposu
            </a>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={showClearData}
        onClose={() => setShowClearData(false)}
        onConfirm={handleClearData}
        title="Tüm Verileri Temizle"
        message="Bu işlem tüm ZIM dosyalarınızı, önbellekleri ve yerel verileri silecektir. Ayarlarınız korunacak. Devam etmek istediğinizden emin misiniz?"
        confirmText="Temizle"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showResetSettings}
        onClose={() => setShowResetSettings(false)}
        onConfirm={handleResetSettings}
        title="Ayarları Sıfırla"
        message="Tüm ayarlar varsayılan değerlerine döndürülecek. ZIM dosyalarınız etkilenmeyecek. Devam etmek istediğinizden emin misiniz?"
        confirmText="Sıfırla"
        variant="danger"
      />
    </div>
  );
};