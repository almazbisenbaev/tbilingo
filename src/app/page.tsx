'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TabBar, { TabType } from '@/components/TabBar';
import AuthWrapper from '@/components/AuthWrapper';
import SettingsTab from '@/components/SettingsTab';

export default function App() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('learn');

  // Show loading state while auth is initializing
  if (currentUser === undefined) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // If user is not authenticated, show AuthWrapper (which handles login/signup)
  if (!currentUser) {
    return <AuthWrapper />;
  }

  // If user is authenticated, show the main app with tabs
  return (
    <>
      <div className="app-with-tabs">
        <div className="tab-content">
          {activeTab === 'learn' && <AuthWrapper />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      <style jsx>{`
        .loading-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #ff7658;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}