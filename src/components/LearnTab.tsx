'use client';

import { useEffect, useState } from 'react';
import CourseLink from '@/components/CourseLink/CourseLink';
import CourseLinkSkeleton from '@/components/CourseLinkSkeleton';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { useProgressStore, useSafeProgressStore } from '@/stores/progressStore';
import { useAlphabet, useNumbers, useWords, usePhrasesCourse } from '@/hooks/useEnhancedLearningContent';
import { FirebaseErrorBoundary } from '@/components/FirebaseErrorBoundary';
import Brand from './Brand/Brand';
import { ConfirmationDialog } from '@/components/ShadcnConfirmationDialog';
import { isCourseCompleted } from '@/utils/course-unlock-utils';

// Unlocks all courses for testing
const UNLOCK_ALL_COURSES_FOR_TESTING = false;

export default function LearnTab() {
  const { initializeCourse } = useProgressStore();
  
  // Fetch learning data from Firebase
  const { items: alphabetData, loading: alphabetLoading } = useAlphabet();
  const { items: numbersData, loading: numbersLoading } = useNumbers();
  const { items: wordsData, loading: wordsLoading } = useWords();
  
  // Fetch phrase courses data
  const { items: phrasesAdvancedData, loading: phrasesAdvancedLoading } = usePhrasesCourse('phrases-2');
  const { items: businessData, loading: businessLoading } = usePhrasesCourse('phrases-business');
  const { items: travelData, loading: travelLoading } = usePhrasesCourse('phrases-travel');
  const { items: restaurantData, loading: restaurantLoading } = usePhrasesCourse('phrases-restaurant');
  const { items: shoppingData, loading: shoppingLoading } = usePhrasesCourse('phrases-shopping');
  const { items: familyData, loading: familyLoading } = usePhrasesCourse('phrases-family');
  const { items: medicalData, loading: medicalLoading } = usePhrasesCourse('phrases-medical');
  const { items: directionsData, loading: directionsLoading } = usePhrasesCourse('phrases-directions');
  const { items: weatherData, loading: weatherLoading } = usePhrasesCourse('phrases-weather');
  const { items: cultureData, loading: cultureLoading } = usePhrasesCourse('phrases-culture');
  const { items: emergencyData, loading: emergencyLoading } = usePhrasesCourse('phrases-emergency');
  
  // State for locked course dialog
  const [showLockedDialog, setShowLockedDialog] = useState(false);
  const [requiredCourseTitle, setRequiredCourseTitle] = useState<string>('');

  

  // Use safe progress store hooks that return undefined during SSR  
  const alphabetLearnedCount = useSafeProgressStore(state => state.getLearnedCount('alphabet'));
  const numbersLearnedCount = useSafeProgressStore(state => state.getLearnedCount('numbers'));
  const wordsLearnedCount = useSafeProgressStore(state => state.getLearnedCount('words'));
  
  // Phrase courses learned counts
  const phrasesAdvancedLearnedCount = useSafeProgressStore(state => state.getLearnedCount('phrases-2'));
  const businessLearnedCount = useSafeProgressStore(state => state.getLearnedCount('phrases-business'));
  const travelLearnedCount = useSafeProgressStore(state => state.getLearnedCount('phrases-travel'));
  const restaurantLearnedCount = useSafeProgressStore(state => state.getLearnedCount('phrases-restaurant'));
  const shoppingLearnedCount = useSafeProgressStore(state => state.getLearnedCount('phrases-shopping'));
  const familyLearnedCount = useSafeProgressStore(state => state.getLearnedCount('phrases-family'));
  const medicalLearnedCount = useSafeProgressStore(state => state.getLearnedCount('phrases-medical'));
  const directionsLearnedCount = useSafeProgressStore(state => state.getLearnedCount('phrases-directions'));
  const weatherLearnedCount = useSafeProgressStore(state => state.getLearnedCount('phrases-weather'));
  const cultureLearnedCount = useSafeProgressStore(state => state.getLearnedCount('phrases-culture'));
  const emergencyLearnedCount = useSafeProgressStore(state => state.getLearnedCount('phrases-emergency'));
  
  const getCompletionPercentage = useProgressStore(state => state.getCompletionPercentage);
  
  // Calculate completion percentages for the main courses
  const alphabetProgress = getCompletionPercentage('alphabet', alphabetData.length);
  const numbersProgress = getCompletionPercentage('numbers', numbersData.length);
  const wordsProgress = getCompletionPercentage('words', wordsData.length);
  
  // Calculate completion percentages for phrase courses
  const phrasesAdvancedProgress = getCompletionPercentage('phrases-2', phrasesAdvancedData.length);
  const businessProgress = getCompletionPercentage('phrases-business', businessData.length);
  const travelProgress = getCompletionPercentage('phrases-travel', travelData.length);
  const restaurantProgress = getCompletionPercentage('phrases-restaurant', restaurantData.length);
  const shoppingProgress = getCompletionPercentage('phrases-shopping', shoppingData.length);
  const familyProgress = getCompletionPercentage('phrases-family', familyData.length);
  const medicalProgress = getCompletionPercentage('phrases-medical', medicalData.length);
  const directionsProgress = getCompletionPercentage('phrases-directions', directionsData.length);
  const weatherProgress = getCompletionPercentage('phrases-weather', weatherData.length);
  const cultureProgress = getCompletionPercentage('phrases-culture', cultureData.length);
  const emergencyProgress = getCompletionPercentage('phrases-emergency', emergencyData.length);
  
  // Check if each course is completed (or bypass if testing flag is enabled)
  const isAlphabetCompleted = UNLOCK_ALL_COURSES_FOR_TESTING || isCourseCompleted(alphabetProgress);
  const isNumbersCompleted = UNLOCK_ALL_COURSES_FOR_TESTING || isCourseCompleted(numbersProgress);
  const isWordsCompleted = UNLOCK_ALL_COURSES_FOR_TESTING || isCourseCompleted(wordsProgress);
  const isPhrasesAdvancedCompleted = UNLOCK_ALL_COURSES_FOR_TESTING || isCourseCompleted(phrasesAdvancedProgress);
  
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
  
  // Initialize phrase courses
  useEffect(() => {
    if (!phrasesAdvancedLoading && phrasesAdvancedData.length > 0) {
      initializeCourse('phrases-2', phrasesAdvancedData.length);
    }
  }, [phrasesAdvancedLoading, phrasesAdvancedData.length, initializeCourse]);
  
  useEffect(() => {
    if (!businessLoading && businessData.length > 0) {
      initializeCourse('phrases-business', businessData.length);
    }
  }, [businessLoading, businessData.length, initializeCourse]);
  
  useEffect(() => {
    if (!travelLoading && travelData.length > 0) {
      initializeCourse('phrases-travel', travelData.length);
    }
  }, [travelLoading, travelData.length, initializeCourse]);
  
  useEffect(() => {
    if (!restaurantLoading && restaurantData.length > 0) {
      initializeCourse('phrases-restaurant', restaurantData.length);
    }
  }, [restaurantLoading, restaurantData.length, initializeCourse]);
  
  useEffect(() => {
    if (!shoppingLoading && shoppingData.length > 0) {
      initializeCourse('phrases-shopping', shoppingData.length);
    }
  }, [shoppingLoading, shoppingData.length, initializeCourse]);
  
  useEffect(() => {
    if (!familyLoading && familyData.length > 0) {
      initializeCourse('phrases-family', familyData.length);
    }
  }, [familyLoading, familyData.length, initializeCourse]);
  
  useEffect(() => {
    if (!medicalLoading && medicalData.length > 0) {
      initializeCourse('phrases-medical', medicalData.length);
    }
  }, [medicalLoading, medicalData.length, initializeCourse]);
  
  useEffect(() => {
    if (!directionsLoading && directionsData.length > 0) {
      initializeCourse('phrases-directions', directionsData.length);
    }
  }, [directionsLoading, directionsData.length, initializeCourse]);
  
  useEffect(() => {
    if (!weatherLoading && weatherData.length > 0) {
      initializeCourse('phrases-weather', weatherData.length);
    }
  }, [weatherLoading, weatherData.length, initializeCourse]);
  
  useEffect(() => {
    if (!cultureLoading && cultureData.length > 0) {
      initializeCourse('phrases-culture', cultureData.length);
    }
  }, [cultureLoading, cultureData.length, initializeCourse]);
  
  useEffect(() => {
    if (!emergencyLoading && emergencyData.length > 0) {
      initializeCourse('phrases-emergency', emergencyData.length);
    }
  }, [emergencyLoading, emergencyData.length, initializeCourse]);


  


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
            href="/learn/1"
            title="Alphabet"
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
            href="/learn/2"
            title="Numbers"
            icon="/images/icon-numbers.svg"
            disabled={numbersData.length === 0}
            locked={!isAlphabetCompleted}
            progress={numbersProgress}
            completedItems={numbersLearnedCount ?? 0}
            totalItems={numbersData.length}
            // This is for a popup that tells you what you need complete first before this one
            onLockedClick={() => handleLockedClick("Learn Alphabet")}
          />
        )}
        
        {/* Words/Phrases Course - Unlocked after numbers */}
        {wordsLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/learn/3"
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
        
        {/* Phrases Advanced Course - Unlocked after words */}
        {phrasesAdvancedLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/learn/4"
            title="Phrases Advanced"
            icon="/images/icon-phrases.svg"
            disabled={phrasesAdvancedData.length === 0}
            locked={!isWordsCompleted}
            progress={phrasesAdvancedProgress}
            completedItems={phrasesAdvancedLearnedCount ?? 0}
            totalItems={phrasesAdvancedData.length}
            onLockedClick={() => handleLockedClick("Words & Phrases - Basic")}
          />
        )}
        
        {/* Business Georgian Course - Unlocked after phrases advanced */}
        {businessLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/learn/5"
            title="Business Georgian"
            icon="/images/icon-phrases.svg"
            disabled={businessData.length === 0}
            locked={!isPhrasesAdvancedCompleted}
            progress={businessProgress}
            completedItems={businessLearnedCount ?? 0}
            totalItems={businessData.length}
            onLockedClick={() => handleLockedClick("Phrases Advanced")}
          />
        )}
        
        {/* Travel Georgian Course - Unlocked after words */}
        {travelLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/learn/6"
            title="Travel Georgian"
            icon="/images/icon-phrases.svg"
            disabled={travelData.length === 0}
            locked={!isWordsCompleted}
            progress={travelProgress}
            completedItems={travelLearnedCount ?? 0}
            totalItems={travelData.length}
            onLockedClick={() => handleLockedClick("Words & Phrases - Basic")}
          />
        )}
        
        {/* Restaurant & Food Course - Unlocked after words */}
        {restaurantLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/learn/7"
            title="Restaurant & Food"
            icon="/images/icon-phrases.svg"
            disabled={restaurantData.length === 0}
            locked={!isWordsCompleted}
            progress={restaurantProgress}
            completedItems={restaurantLearnedCount ?? 0}
            totalItems={restaurantData.length}
            onLockedClick={() => handleLockedClick("Words & Phrases - Basic")}
          />
        )}
        
        {/* Shopping & Markets Course - Unlocked after words */}
        {shoppingLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/learn/8"
            title="Shopping & Markets"
            icon="/images/icon-phrases.svg"
            disabled={shoppingData.length === 0}
            locked={!isWordsCompleted}
            progress={shoppingProgress}
            completedItems={shoppingLearnedCount ?? 0}
            totalItems={shoppingData.length}
            onLockedClick={() => handleLockedClick("Words & Phrases - Basic")}
          />
        )}
        
        {/* Family & Relationships Course - Unlocked after words */}
        {familyLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/learn/9"
            title="Family & Relationships"
            icon="/images/icon-phrases.svg"
            disabled={familyData.length === 0}
            locked={!isWordsCompleted}
            progress={familyProgress}
            completedItems={familyLearnedCount ?? 0}
            totalItems={familyData.length}
            onLockedClick={() => handleLockedClick("Words & Phrases - Basic")}
          />
        )}
        
        {/* Medical & Health Course - Unlocked after phrases advanced */}
        {medicalLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/learn/10"
            title="Medical & Health"
            icon="/images/icon-phrases.svg"
            disabled={medicalData.length === 0}
            locked={!isPhrasesAdvancedCompleted}
            progress={medicalProgress}
            completedItems={medicalLearnedCount ?? 0}
            totalItems={medicalData.length}
            onLockedClick={() => handleLockedClick("Phrases Advanced")}
          />
        )}
        
        {/* Directions & Transportation Course - Unlocked after words */}
        {directionsLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/learn/11"
            title="Directions & Transportation"
            icon="/images/icon-phrases.svg"
            disabled={directionsData.length === 0}
            locked={!isWordsCompleted}
            progress={directionsProgress}
            completedItems={directionsLearnedCount ?? 0}
            totalItems={directionsData.length}
            onLockedClick={() => handleLockedClick("Words & Phrases - Basic")}
          />
        )}
        
        {/* Weather & Seasons Course - Unlocked after words */}
        {weatherLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/learn/12"
            title="Weather & Seasons"
            icon="/images/icon-phrases.svg"
            disabled={weatherData.length === 0}
            locked={!isWordsCompleted}
            progress={weatherProgress}
            completedItems={weatherLearnedCount ?? 0}
            totalItems={weatherData.length}
            onLockedClick={() => handleLockedClick("Words & Phrases - Basic")}
          />
        )}
        
        {/* Culture & Traditions Course - Unlocked after phrases advanced */}
        {cultureLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/learn/13"
            title="Culture & Traditions"
            icon="/images/icon-phrases.svg"
            disabled={cultureData.length === 0}
            locked={!isPhrasesAdvancedCompleted}
            progress={cultureProgress}
            completedItems={cultureLearnedCount ?? 0}
            totalItems={cultureData.length}
            onLockedClick={() => handleLockedClick("Phrases Advanced")}
          />
        )}
        
        {/* Emergency Situations Course - Unlocked after phrases advanced */}
        {emergencyLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/learn/14"
            title="Emergency Situations"
            icon="/images/icon-phrases.svg"
            disabled={emergencyData.length === 0}
            locked={!isPhrasesAdvancedCompleted}
            progress={emergencyProgress}
            completedItems={emergencyLearnedCount ?? 0}
            totalItems={emergencyData.length}
            onLockedClick={() => handleLockedClick("Phrases Advanced")}
          />
        )}
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