'use client';

import { useEffect } from 'react';
import CourseLink from '@/components/CourseLink/CourseLink';
import CourseLinkSkeleton from '@/components/CourseLinkSkeleton';
import { usePhrasesCourse } from '@/hooks/useEnhancedLearningContent';
import { useSafeProgressStore } from '@/stores/progressStore';
import { CourseConfig } from '@/constants/courseData';
import { isCourseCompleted } from '@/utils/course-unlock-utils';

interface PhraseCourseItemProps {
  course: CourseConfig;
  getCompletionPercentage: (courseType: string, totalItems: number) => number;
  initializeCourse: (courseType: string, totalItems: number) => Promise<void>;
  isFirstPhraseCourse?: boolean;
  previousCourseUnlocked?: boolean;
  previousCourse?: CourseConfig;
  onLockedClick?: () => void;
  unlockAllForTesting?: boolean;
}

export default function PhraseCourseItem({ 
  course, 
  getCompletionPercentage, 
  initializeCourse,
  isFirstPhraseCourse = false,
  previousCourseUnlocked,
  previousCourse,
  onLockedClick,
  unlockAllForTesting = false
}: PhraseCourseItemProps) {
  const { items: courseData, loading: courseLoading } = usePhrasesCourse(course.id);
  const learnedCount = useSafeProgressStore(state => state.getLearnedCount(course.id));
  
  // Always call the hook, but only use it if we have a previous course
  const { items: previousCourseData, loading: previousCourseLoading } = usePhrasesCourse(previousCourse?.id || '');
  
  // Initialize course when data is loaded
  useEffect(() => {
    if (!courseLoading && courseData.length > 0) {
      initializeCourse(course.id, courseData.length);
    }
  }, [courseLoading, courseData.length, initializeCourse, course.id]);

  // Calculate if this course is locked (bypass if testing flag is enabled)
  let isLocked = false;
  
  if (!unlockAllForTesting) {
    if (isFirstPhraseCourse) {
      // First phrase course uses previousCourseUnlocked (words course completion)
      isLocked = !previousCourseUnlocked;
    } else if (previousCourse) {
      // Other phrase courses check if previous phrase course is completed
      const previousCourseProgress = getCompletionPercentage(previousCourse.id, previousCourseData.length);
      isLocked = !previousCourseLoading && !isCourseCompleted(previousCourseProgress);
    }
  }

  if (courseLoading) {
    return <CourseLinkSkeleton />;
  }

  return (
    <CourseLink 
      href={course.route}
      title={course.title}
      icon={course.icon}
      disabled={courseData.length === 0}
      locked={isLocked}
      progress={getCompletionPercentage(course.id, courseData.length)}
      completedItems={learnedCount ?? 0}
      totalItems={courseData.length}
      onLockedClick={onLockedClick}
    />
  );
}