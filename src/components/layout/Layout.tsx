import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ToastContainer } from '../ui/Toast';
import { useApp } from '../../contexts/AppContext';

export const Layout: React.FC = () => {
  const { state } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-has-bg">
      <Header />
      <main className="flex-1 has-wrap py-4">
        <div className="has-bodyline">
          <Outlet />
        </div>
      </main>
      <Footer />
      <ToastContainer toasts={state.toasts} onClose={() => {}} />
    </div>
  );
};