'use client';

import { useEffect, useState } from 'react';
import CourseLink from '@/components/CourseLink/CourseLink';
import CourseLinkSkeleton from '@/components/CourseLinkSkeleton';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { collection, getDocs, query, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@root/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Image from "next/image";

// Unlocks all courses for testing
const UNLOCK_ALL_COURSES_FOR_TESTING = false;

interface CourseConfig {
  id: string;
  title: string;
  icon: string;
  requiredCourseId?: string; // ID of the course that must be completed first
  requiredCourseTitle?: string; // Title of the course that must be completed first
}

const COURSES: CourseConfig[] = [
  { id: '1', title: 'Alphabet', icon: '/images/icon-alphabet.svg' },
  { id: '2', title: 'Numbers', icon: '/images/icon-numbers.svg', requiredCourseId: '1', requiredCourseTitle: 'Learn Alphabet' },
  { id: '3', title: 'Words & Phrases - Basic', icon: '/images/icon-phrases.svg', requiredCourseId: '2', requiredCourseTitle: 'Learn Numbers' },
  { id: '4', title: 'Phrases Advanced', icon: '/images/icon-phrases.svg', requiredCourseId: '3', requiredCourseTitle: 'Words & Phrases - Basic' },
  { id: '5', title: 'Business Georgian', icon: '/images/icon-phrases.svg', requiredCourseId: '4', requiredCourseTitle: 'Phrases Advanced' },
];

export default function LearnTab() {
  // Unified state for all courses
  const [coursesData, setCoursesData] = useState<Record<string, {
    totalItems: number;
    learnedItems: number;
    isCompleted: boolean;
    loading: boolean;
  }>>({});

  const [globalLoading, setGlobalLoading] = useState(true);

  // Auth state
  const [user, setUser] = useState(auth.currentUser);

  // State for locked course dialog
  const [showLockedDialog, setShowLockedDialog] = useState(false);
  const [requiredCourseTitle, setRequiredCourseTitle] = useState<string>('');

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setGlobalLoading(true);

      const newCoursesData: typeof coursesData = {};

      // 1. Fetch total items for all courses
      await Promise.all(COURSES.map(async (course) => {
        try {
          const itemsRef = collection(db, 'courses', course.id, 'items');
          const q = query(itemsRef);
          const snapshot = await getDocs(q);

          newCoursesData[course.id] = {
            totalItems: snapshot.docs.length,
            learnedItems: 0,
            isCompleted: false,
            loading: false
          };
        } catch (error) {
          console.error(`Error fetching items for course ${course.id}:`, error);
          newCoursesData[course.id] = { totalItems: 0, learnedItems: 0, isCompleted: false, loading: false };
        }
      }));

      // 2. Fetch user progress if logged in
      if (user) {
        await Promise.all(COURSES.map(async (course) => {
          try {
            const progressRef = doc(db, 'users', user.uid, 'progress', course.id);
            const progressSnap = await getDoc(progressRef);

            if (progressSnap.exists()) {
              const data = progressSnap.data();
              const learnedItems = data.learnedItemIds?.length || 0;
              const isFinished = data.isFinished || false;

              // Update data
              if (newCoursesData[course.id]) {
                newCoursesData[course.id].learnedItems = learnedItems;
                newCoursesData[course.id].isCompleted = UNLOCK_ALL_COURSES_FOR_TESTING || isFinished;

                // Auto-fix completion flag
                if (!isFinished && newCoursesData[course.id].totalItems > 0 && learnedItems >= newCoursesData[course.id].totalItems) {
                  console.log(`Auto-fixing completion flag for course ${course.id}`);
                  await setDoc(progressRef, {
                    isFinished: true,
                    lastUpdated: serverTimestamp()
                  }, { merge: true });
                  newCoursesData[course.id].isCompleted = true;
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching progress for course ${course.id}:`, error);
          }
        }));
      }

      setCoursesData(newCoursesData);
      setGlobalLoading(false);
    };

    fetchData();
  }, [user]);

  // Refresh user progress when visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        // Optional: Trigger re-fetch here if needed
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const handleLockedClick = (requiredTitle: string) => {
    setRequiredCourseTitle(requiredTitle);
    setShowLockedDialog(true);
  };

  const getCompletionPercentage = (learned: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((learned / total) * 100);
  };

  if (globalLoading) {
    return (
      <div className="learn-content">

        <div className='flex justify-center'>
          <Image src="/images/logo.svg" alt="Tbilingo" width={120} height={48} className='object-contain' />
        </div>

        <div className="courses-list">
          {COURSES.map(course => (
            <CourseLinkSkeleton key={course.id} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="learn-content">

      <div className='flex justify-center'>
        <Image src="/images/logo.svg" alt="Tbilingo" width={120} height={48} className='object-contain' />
      </div>

      <div className="courses-list">
          {COURSES.map((course) => {
            const data = coursesData[course.id] || { totalItems: 0, learnedItems: 0, isCompleted: false };
            const isLocked = course.requiredCourseId
              ? !(coursesData[course.requiredCourseId]?.isCompleted)
              : false;

            return (
              <div key={course.id} className="course-item-wrapper">
                <CourseLink
                  href={`/learn/${course.id}`}
                  title={course.title}
                  icon={course.icon}
                  disabled={false}
                  locked={isLocked}
                  progress={getCompletionPercentage(data.learnedItems, data.totalItems)}
                  completedItems={data.learnedItems}
                  totalItems={data.totalItems}
                  onLockedClick={() => handleLockedClick(course.requiredCourseTitle || '')}
                />
              </div>
            );
          })}
      </div>

      <PWAInstallPrompt />

      <ConfirmationDialog
        isOpen={showLockedDialog}
        title="Course Locked"
        message={`Please complete "${requiredCourseTitle}" first to unlock this course.`}
        confirmText="Got it"
        cancelText=""
        onConfirm={() => setShowLockedDialog(false)}
        onCancel={() => setShowLockedDialog(false)}
      />
    </div>
  );
}