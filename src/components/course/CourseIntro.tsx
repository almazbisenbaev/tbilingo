'use client';

import { useState } from 'react';
import PageTransition from '@/components/PageTransition';
import AppHeader from '@/components/layout/AppHeader';
import PageLayout from '@/components/layout/PageLayout';
import ContentContainer from '@/components/layout/ContentContainer';
import ProgressStats from '@/components/common/ProgressStats';

interface CourseIntroProps {
  title: string;
  description?: string;
  completed: number;
  total: number;
  onStartLearning: () => void;
  onBack?: () => void;
  backHref?: string;
}

export default function CourseIntro({
  title,
  description,
  completed,
  total,
  onStartLearning,
  onBack,
  backHref = '/'
}: CourseIntroProps) {
  return (
    <PageTransition>
      <PageLayout>
        <ContentContainer>
          <AppHeader 
            title={title}
            showBackButton
            backHref={backHref}
            onBackClick={onBack}
          />
        </ContentContainer>

        <ContentContainer>
          {description && (
            <div className="text-center mb-6">
              <p className="text-gray-600">{description}</p>
            </div>
          )}
          
          <ProgressStats 
            completed={completed}
            total={total}
            label="Learned"
          />
        </ContentContainer>

        <ContentContainer>
          <button 
            onClick={onStartLearning} 
            className="btn btn-block btn-primary"
          >
            Start learning
          </button>
        </ContentContainer>
      </PageLayout>
    </PageTransition>
  );
}