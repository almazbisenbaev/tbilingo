"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TabBar, { TabType } from '@/components/TabBar';
import AuthWrapper from '@/components/screens/AuthWrapper';
import SettingsTab from '@/components/SettingsTab';
import AnimatedTabContent from '@/components/AnimatedTabContent';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function LearnApp() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('learn');

  if (currentUser === undefined) {
    return <LoadingScreen message="Initializing..." />;
  }

  if (!currentUser) {
    return <AuthWrapper />;
  }

  return (
    <div className="app-with-tabs">
      <div className="tab-content">
        <AnimatedTabContent
          activeTab={activeTab}
          tabs={{
            learn: <AuthWrapper />,
            settings: <SettingsTab />,
          }}
        />
      </div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}