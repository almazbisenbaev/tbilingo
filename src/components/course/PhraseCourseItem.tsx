'use client';

import { useEffect } from 'react';
import CourseLink from '@/components/CourseLink/CourseLink';
import CourseLinkSkeleton from '@/components/CourseLinkSkeleton';
import { usePhrasesCourse } from '@/hooks/useEnhancedLearningContent';
import { useSafeProgressStore } from '@/stores/progressStore';
import { CourseConfig } from '@/constants/courseData';

interface PhraseCourseItemProps {
  course: CourseConfig;
  getCompletionPercentage: (courseType: string, totalItems: number) => number;
  initializeCourse: (courseType: string, totalItems: number) => Promise<void>;
}

export default function PhraseCourseItem({ 
  course, 
  getCompletionPercentage, 
  initializeCourse 
}: PhraseCourseItemProps) {
  const { items: courseData, loading: courseLoading } = usePhrasesCourse(course.id);
  const learnedCount = useSafeProgressStore(state => state.getLearnedCount(course.id));
  
  // Initialize course when data is loaded
  useEffect(() => {
    if (!courseLoading && courseData.length > 0) {
      initializeCourse(course.id, courseData.length);
    }
  }, [courseLoading, courseData.length, initializeCourse, course.id]);

  if (courseLoading) {
    return <CourseLinkSkeleton />;
  }

  return (
    <CourseLink 
      href={course.route}
      title={course.title}
      icon={course.icon}
      disabled={courseData.length === 0}
      progress={getCompletionPercentage(course.id, courseData.length)}
      completedItems={learnedCount ?? 0}
      totalItems={courseData.length}
    />
  );
}