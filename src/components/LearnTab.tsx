'use client';

import { useEffect, useState } from 'react';
import CourseLink from '@/components/CourseLink/CourseLink';
import CourseLinkSkeleton from '@/components/CourseLinkSkeleton';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { useProgressStore, useSafeProgressStore, useStoreHydration } from '@/stores/progressStore';
import { useAlphabet, useNumbers, useWords, usePhrasesAdvanced, usePhrasesCourse } from '@/hooks/useEnhancedLearningContent';
import { FirebaseErrorBoundary } from '@/components/FirebaseErrorBoundary';
import { PHRASE_COURSES, CourseConfig } from '@/constants/courseData';
import Brand from './Brand/Brand';
import PhraseCourseItem from '@/components/course/PhraseCourseItem';
import { ConfirmationDialog } from '@/components/ShadcnConfirmationDialog';
import { isCourseCompleted } from '@/utils/course-unlock-utils';



export default function LearnTab() {
  const {
    initializeCourse
  } = useProgressStore();
  
  const isHydrated = useStoreHydration();
  
  // Fetch learning data from Firebase
  const { items: alphabetData, loading: alphabetLoading } = useAlphabet();
  const { items: numbersData, loading: numbersLoading } = useNumbers();
  const { items: wordsData, loading: wordsLoading } = useWords();
  
  // Get all phrase courses sorted by order
  const sortedPhraseCourses = PHRASE_COURSES.sort((a, b) => a.order - b.order);
  
  // State for locked course dialog
  const [showLockedDialog, setShowLockedDialog] = useState(false);
  const [requiredCourseTitle, setRequiredCourseTitle] = useState<string>('');

  

  // Use safe progress store hooks that return undefined during SSR  
  const alphabetLearnedCount = useSafeProgressStore(state => state.getLearnedCount('alphabet'));
  const numbersLearnedCount = useSafeProgressStore(state => state.getLearnedCount('numbers'));
  const wordsLearnedCount = useSafeProgressStore(state => state.getLearnedCount('words'));  const getCompletionPercentage = useProgressStore(state => state.getCompletionPercentage);
  
  // Calculate completion percentages for the main courses
  const alphabetProgress = getCompletionPercentage('alphabet', alphabetData.length);
  const numbersProgress = getCompletionPercentage('numbers', numbersData.length);
  const wordsProgress = getCompletionPercentage('words', wordsData.length);
  
  // Check if each course is completed
  const isAlphabetCompleted = isCourseCompleted(alphabetProgress);
  const isNumbersCompleted = isCourseCompleted(numbersProgress);
  const isWordsCompleted = isCourseCompleted(wordsProgress);
  
  // Handler for locked course click
  const handleLockedClick = (courseTitle: string) => {
    setRequiredCourseTitle(courseTitle);
    setShowLockedDialog(true);
  };

  // Initialize courses with their total item counts when data is loaded
  useEffect(() => {
    if (!alphabetLoading && alphabetData.length > 0) {
      initializeCourse('alphabet', alphabetData.length);
    }
  }, [alphabetLoading, alphabetData.length, initializeCourse]);
  
  useEffect(() => {
    if (!numbersLoading && numbersData.length > 0) {
      initializeCourse('numbers', numbersData.length);
    }
  }, [numbersLoading, numbersData.length, initializeCourse]);
  
  useEffect(() => {
    if (!wordsLoading && wordsData.length > 0) {
      initializeCourse('words', wordsData.length);
    }
  }, [wordsLoading, wordsData.length, initializeCourse]);
  
  // Dynamic course initialization will be handled per course


  


  return (
    <FirebaseErrorBoundary>
      <div className="learn-content">

      <div className="welcome-header">
        <Brand />
      </div>





      <div className="welcome-actions">
        {/* Alphabet Course - Always unlocked */}
        {alphabetLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/alphabet"
            title="Learn Alphabet"
            icon="/images/icon-alphabet.svg"
            disabled={alphabetData.length === 0}
            progress={alphabetProgress}
            completedItems={alphabetLearnedCount ?? 0}
            totalItems={alphabetData.length}
          />
        )}
        
        {/* Numbers Course - Unlocked after alphabet */}
        {numbersLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/numbers"
            title="Learn Numbers"
            icon="/images/icon-numbers.svg"
            disabled={numbersData.length === 0}
            locked={!isAlphabetCompleted}
            progress={numbersProgress}
            completedItems={numbersLearnedCount ?? 0}
            totalItems={numbersData.length}
            onLockedClick={() => handleLockedClick("Learn Alphabet")}
          />
        )}
        
        {/* Words/Phrases Course - Unlocked after numbers */}
        {wordsLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/words"
            title="Words & Phrases - Basic"
            icon="/images/icon-phrases.svg"
            disabled={wordsData.length === 0}
            locked={!isNumbersCompleted}
            progress={wordsProgress}
            completedItems={wordsLearnedCount ?? 0}
            totalItems={wordsData.length}
            onLockedClick={() => handleLockedClick("Learn Numbers")}
          />
        )}
        
        {/* Dynamic Phrase Courses - Each unlocked after previous */}
        {sortedPhraseCourses.map((course, index) => {
          // First phrase course unlocks after words course
          const isFirstPhraseCourse = index === 0;
          const isUnlocked = isFirstPhraseCourse 
            ? isWordsCompleted 
            : true; // Will be calculated in PhraseCourseItem based on previous phrase course
          
          const previousCourseTitle = isFirstPhraseCourse 
            ? "Words & Phrases - Basic" 
            : sortedPhraseCourses[index - 1]?.title;
          
          return (
            <PhraseCourseItem 
              key={course.id}
              course={course}
              getCompletionPercentage={getCompletionPercentage}
              initializeCourse={initializeCourse}
              isFirstPhraseCourse={isFirstPhraseCourse}
              previousCourseUnlocked={isFirstPhraseCourse ? isWordsCompleted : undefined}
              previousCourse={isFirstPhraseCourse ? undefined : sortedPhraseCourses[index - 1]}
              onLockedClick={() => handleLockedClick(previousCourseTitle || '')}
            />
          );
        })}
      </div>
      
      {/* Locked Course Dialog */}
      <ConfirmationDialog
        isOpen={showLockedDialog}
        title={`Complete "${requiredCourseTitle}" first to unlock this course.`}
        confirmText="OK"
        cancelText=""
        onConfirm={() => setShowLockedDialog(false)}
        onCancel={() => setShowLockedDialog(false)}
      />
      
      <PWAInstallPrompt />

    </div>
    </FirebaseErrorBoundary>
  );
}