'use client';

import { useState, useEffect, ReactNode } from 'react';
import { TabType } from './TabBar';

interface AnimatedTabContentProps {
  activeTab: TabType;
  tabs: Record<TabType, ReactNode>;
}

export default function AnimatedTabContent({ activeTab, tabs }: AnimatedTabContentProps) {
  const [displayedTab, setDisplayedTab] = useState<TabType>(activeTab);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (activeTab !== displayedTab) {
      setIsTransitioning(true);
      
      // Start fade out
      const fadeOutTimer = setTimeout(() => {
        // Switch content after fade out
        setDisplayedTab(activeTab);
        
        // Start fade in after a brief moment
        const fadeInTimer = setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
        
        return () => clearTimeout(fadeInTimer);
      }, 150);
      
      return () => clearTimeout(fadeOutTimer);
    }
  }, [activeTab, displayedTab]);

  return (
    <div className={`animated-tab-content ${isTransitioning ? 'transitioning' : ''}`}>
      {tabs[displayedTab]}
    </div>
  );
}