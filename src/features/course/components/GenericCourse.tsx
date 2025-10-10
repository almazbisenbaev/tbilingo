/**
 * Generic Course Container Component
 * Handles the common course flow: intro -> gameplay -> completion
 */

"use client";

import { useBackToHomeNavigation } from '@/utils/useBackButtonHandler';
import { usePhrasesCourse } from '@/hooks/useEnhancedLearningContent';
import { useCourseMemory, useCourseGameplay } from '@/hooks/course/useCourseMemory';

// UI Components
import CoursePageLoading from '@/components/CoursePageLoading';
import PageTransition from '@/components/PageTransition';
import ErrorState from '@/components/common/ErrorState';
import CourseIntro from '@/components/course/CourseIntro';
import CourseCompletion from '@/components/course/CourseCompletion';

// Course-specific components
import PhraseAdvancedComponent from '@/components/PhraseAdvancedComponent/PhraseAdvancedComponent';
import AppHeader from '@/components/layout/AppHeader';
import PageLayout from '@/components/layout/PageLayout';
import ContentContainer from '@/components/layout/ContentContainer';
import ProgressBar from '@/components/ProgressBar/ProgressBar';

interface GenericCourseProps {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
}

export default function GenericCourse({ 
  courseId, 
  courseTitle, 
  courseDescription 
}: GenericCourseProps) {
  useBackToHomeNavigation();
  
  // Use custom hooks for course memory and gameplay
  const {
    phrases,
    phrasesLoading,
    learnedPhrases,
    phrasesMemory,
    handleCorrectAnswer,
    handleWrongAnswer
  } = useCourseMemory(courseId);

  const {
    isGameplayActive,
    processedPhrases,
    phrasesToReview,
    allCardsReviewed,
    startGameplay,
    resetGameplay,
    markAsToReview
  } = useCourseGameplay(courseId, phrases);

  // Handle the usePhrasesCourse hook separately for error handling
  const { error: phrasesError } = usePhrasesCourse(courseId);

  // Show loading state
  if (phrasesLoading) {
    return (
      <PageTransition>
        <CoursePageLoading 
          courseTitle={courseTitle}
          message={`Loading ${courseTitle.toLowerCase()}...`}
        />
      </PageTransition>
    );
  }

  // Show error state
  if (phrasesError) {
    return (
      <ErrorState 
        title="Loading Error"
        message={`Error loading phrases: ${phrasesError}`}
        actionText="Go Home"
        actionHref="/"
        showRetry={true}
      />
    );
  }

  // Show empty state
  if (phrases.length === 0) {
    return (
      <ErrorState 
        title="No Data Found"
        message="No phrases data found. Please use the migration page to add sample data."
        actionText="Go to Migration"
        actionHref="/migrate"
        showRetry={false}
      />
    );
  }

  // Course intro page
  if (!isGameplayActive) {
    return (
      <CourseIntro 
        title={courseTitle}
        description={courseDescription}
        completed={learnedPhrases.length}
        total={phrases.length}
        onStartLearning={startGameplay}
        backHref="/"
      />
    );
  }

  // Course completion page
  if (allCardsReviewed) {
    return (
      <CourseCompletion 
        learnedCount={learnedPhrases.length}
        totalCount={phrases.length}
        sessionLearnedCount={learnedPhrases.filter(id => phrasesToReview.some(phrase => phrase.id === id)).length}
        onContinue={startGameplay}
        onGoBack={resetGameplay}
      />
    );
  }

  // Active gameplay
  return (
    <PageTransition>
      <PageLayout className="phrases-advanced-course">
        <ContentContainer>
          <AppHeader 
            title={
              <ProgressBar 
                current={processedPhrases.length} 
                total={phrasesToReview.length}
                width="200px"
              />
            }
            showBackButton
            onBackClick={resetGameplay}
          />
        </ContentContainer>

        <ContentContainer>
          {phrasesToReview.map((item, index) => {
            // Only show the current unprocessed phrase
            if (index === processedPhrases.length) {
              return (
                <PhraseAdvancedComponent 
                  key={item.id}
                  phrase={item}
                  memory={phrasesMemory[item.id] || { correctAnswers: 0, isLearned: false }}
                  onNext={() => markAsToReview(item.id, index, null)}
                  onCorrectAnswer={() => handleCorrectAnswer(item.id)}
                  onWrongAnswer={() => handleWrongAnswer(item.id)}
                />
              );
            }
            return null;
          })}
        </ContentContainer>
      </PageLayout>
    </PageTransition>
  );
}