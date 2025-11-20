'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TabBar, { TabType } from '@/components/TabBar';
import AuthWrapper from '@/components/screens/AuthWrapper';
import SettingsTab from '@/components/SettingsTab';
import AnimatedTabContent from '@/components/AnimatedTabContent';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function App() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('learn');

  // Show loading state while auth is initializing
  if (currentUser === undefined) {
    return <LoadingScreen message="Initializing..." />;
  }

  // If user is not authenticated, show AuthWrapper (which handles login/signup)
  if (!currentUser) {
    return <AuthWrapper />;
  }

  // If user is authenticated, show the main app with tabs
  return (
    <div className="app-with-tabs">
      <div className="tab-content">
        <AnimatedTabContent 
          activeTab={activeTab}
          tabs={{
            learn: <AuthWrapper />,
            settings: <SettingsTab />
          }}
        />
      </div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}