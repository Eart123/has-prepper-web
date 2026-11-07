import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { Emergency } from './pages/Emergency';
import { Settings } from './pages/Settings';
import { ZIMReader } from './pages/ZIMReader';
import { Maps } from './pages/Maps';
import { AutoZIMDownloader } from './pages/AutoZIMDownloader';
import { Kolibri } from './pages/Kolibri';

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="loading-spinner" />
    <span className="ml-3 text-has-textMuted">Yükleniyor...</span>
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="library" element={<Library />} />
          <Route path="emergency" element={<Emergency />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reader/:zimId" element={<ZIMReader />} />
          <Route path="maps" element={<Maps />} />
          <Route path="kolibri" element={<Kolibri />} />
          <Route path="download" element={<AutoZIMDownloader />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
};

export default App;