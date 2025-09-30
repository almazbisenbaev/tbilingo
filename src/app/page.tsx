'use client';

import { useState } from 'react';
import TabBar, { TabType } from '@/components/TabBar';
import LearnTab from '@/components/LearnTab';
import SettingsTab from '@/components/SettingsTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('learn');

  return (
    <>
      <div className="app-with-tabs">
        <div className="tab-content">
          {activeTab === 'learn' && <LearnTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </>
  );
}