/**
 * Utility functions for determining course unlock status
 * based on completion of previous courses
 */

export interface CourseUnlockStatus {
  isUnlocked: boolean;
  requiredCourseTitle?: string;
}

/**
 * Check if a course is unlocked based on completion of the previous course
 * 
 * @param courseIndex - The index of the course in the ordered list
 * @param previousCourseCompleted - Whether the previous course is completed (100%)
 * @returns Object with unlock status and required course info
 */
export function checkCourseUnlocked(
  courseIndex: number,
  previousCourseCompleted: boolean,
  previousCourseTitle?: string
): CourseUnlockStatus {
  // First course is always unlocked
  if (courseIndex === 0) {
    return { isUnlocked: true };
  }

  // For all other courses, check if previous is completed
  if (previousCourseCompleted) {
    return { isUnlocked: true };
  }

  return {
    isUnlocked: false,
    requiredCourseTitle: previousCourseTitle,
  };
}

/**
 * Check if a course is completed (100% progress)
 * 
 * @param completionPercentage - The completion percentage (0-100)
 * @returns Whether the course is completed
 */
export function isCourseCompleted(completionPercentage: number): boolean {
  return completionPercentage >= 100;
}
