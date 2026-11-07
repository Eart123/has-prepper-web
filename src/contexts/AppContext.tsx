import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppSettings, ToastMessage, ZIMFileInfo, ZIMCategory } from '../lib/types';
import { database } from '../lib/database';

interface AppState {
  settings: AppSettings;
  zimFiles: ZIMFileInfo[];
  toasts: ToastMessage[];
  categories: ZIMCategory[];
  isOnline: boolean;
  installPrompt: {
    show: boolean;
    dismissed: boolean;
    platform: 'ios' | 'android' | 'desktop' | 'unknown';
  };
}

type AppAction =
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_ZIM_FILES'; payload: ZIMFileInfo[] }
  | { type: 'ADD_ZIM_FILE'; payload: ZIMFileInfo }
  | { type: 'REMOVE_ZIM_FILE'; payload: string }
  | { type: 'UPDATE_ZIM_FILE'; payload: { id: string; updates: Partial<ZIMFileInfo> } }
  | { type: 'SET_TOASTS'; payload: ToastMessage[] }
  | { type: 'ADD_TOAST'; payload: ToastMessage }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'SET_INSTALL_PROMPT'; payload: Partial<AppState['installPrompt']> }
  | { type: 'SET_CATEGORIES'; payload: ZIMCategory[] };

const initialState: AppState = {
  settings: {
    theme: 'system',
    language: 'tr',
    autoUpdate: true,
    cacheSize: 500,
    showInstallPrompt: true,
  },
  zimFiles: [],
  toasts: [],
  categories: [],
  isOnline: navigator.onLine,
  installPrompt: {
    show: false,
    dismissed: false,
    platform: 'unknown',
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_ZIM_FILES':
      return { ...state, zimFiles: action.payload };
    case 'ADD_ZIM_FILE':
      return { ...state, zimFiles: [action.payload, ...state.zimFiles] };
    case 'REMOVE_ZIM_FILE':
      return { ...state, zimFiles: state.zimFiles.filter((f) => f.id !== action.payload) };
    case 'UPDATE_ZIM_FILE':
      return {
        ...state,
        zimFiles: state.zimFiles.map((f) =>
          f.id === action.payload.id ? { ...f, ...action.payload.updates } : f
        ),
      };
    case 'SET_TOASTS':
      return { ...state, toasts: action.payload };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    case 'SET_INSTALL_PROMPT':
      return { ...state, installPrompt: { ...state.installPrompt, ...action.payload } };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  loadData: () => Promise<void>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15);
    const newToast: ToastMessage = { id, ...toast, duration: toast.duration ?? 5000 };
    dispatch({ type: 'ADD_TOAST', payload: newToast });

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: id });
      }, newToast.duration);
    }
  };

  const createDemoZIM = async () => {
    const demoZIM: ZIMFileInfo = {
      id: 'demo-wikipedia-tr',
      name: 'Wikipedia TR (Demo)',
      size: 50 * 1024 * 1024, // 50MB demo
      path: 'wikipedia_tr_demo.zim',
      zimData: {
        entryCount: 150000,
        mainEntryPath: '/',
        metadata: {
          format: 'OpenZIM',
          creator: 'Kiwix',
          language: 'tr',
        },
      },
      addedAt: Date.now(),
      lastAccessed: Date.now(),
    };
    await database.addZIMFile(demoZIM);
    dispatch({ type: 'ADD_ZIM_FILE', payload: demoZIM });
    return demoZIM;
  };

  const loadData = async () => {
    try {
      const [settings, zimFiles] = await Promise.all([
        database.getSettings(),
        database.getZIMFiles(),
      ]);
      dispatch({ type: 'SET_SETTINGS', payload: settings });
      dispatch({ type: 'SET_ZIM_FILES', payload: zimFiles });

      // Create demo ZIM if none exist
      if (zimFiles.length === 0) {
        await createDemoZIM();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      addToast({ type: 'error', title: 'Veri yüklenemedi', message: 'Veritabanı hatası oluştu' });
    }
  };

  useEffect(() => {
    loadData();

    const handleOnline = () => dispatch({ type: 'SET_ONLINE', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      dispatch({
        type: 'SET_INSTALL_PROMPT',
        payload: { show: true, platform: getPlatform() },
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isInstalled) {
      dispatch({ type: 'SET_INSTALL_PROMPT', payload: { dismissed: true } });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  useEffect(() => {
    const { theme } = state.settings;
    const root = document.documentElement;

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [state.settings.theme]);

  useEffect(() => {
    database.updateSettings(state.settings);
  }, [state.settings]);

  return (
    <AppContext.Provider value={{ state, dispatch, addToast, loadData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function getPlatform(): 'ios' | 'android' | 'desktop' | 'unknown' {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}