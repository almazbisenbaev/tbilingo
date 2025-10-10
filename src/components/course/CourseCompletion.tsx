'use client';

import PageTransition from '@/components/PageTransition';
import PageLayout from '@/components/layout/PageLayout';
import ContentContainer from '@/components/layout/ContentContainer';

interface CourseCompletionProps {
  learnedCount: number;
  totalCount: number;
  sessionLearnedCount: number;
  onContinue: () => void;
  onGoBack: () => void;
}

export default function CourseCompletion({
  learnedCount,
  totalCount,
  sessionLearnedCount,
  onContinue,
  onGoBack
}: CourseCompletionProps) {
  return (
    <PageTransition>
      <PageLayout>
        <ContentContainer className="flex-1 flex items-center justify-center">
          <div className="screen-finish">
            <div className="finish-message">
              <div className="text-center text-4xl mb-4">🎉</div>
              <h2 className="font-semibold text-2xl mb-4">Great work!</h2>
              <div className="text-lg finish-message-text space-y-2">
                <p>
                  You've reviewed all the items for this session. 
                  You learned <strong>{sessionLearnedCount}</strong> new items!
                </p>
                <p>
                  Total progress: <strong>{learnedCount}</strong> out of <strong>{totalCount}</strong> items learned.
                </p>
              </div>
              <div className="finish-message-actions mt-6 space-x-4">
                <button onClick={onGoBack} className="btn btn-small btn-secondary">
                  Go back
                </button>
                <button onClick={onContinue} className="btn btn-small btn-primary">
                  Continue
                </button>
              </div>
            </div>
          </div>
        </ContentContainer>
      </PageLayout>
    </PageTransition>
  );
}