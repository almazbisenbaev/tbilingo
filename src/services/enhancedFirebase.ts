/**
 * Improved Firebase Database Structure
 * Designed for maximum flexibility to support different course types in the future
 */

import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  writeBatch,
  serverTimestamp,
  getDoc,
  addDoc
} from 'firebase/firestore';
import { db } from '@root/firebaseConfig';

// Debug logging helper
const debugLog = (operation: string, data?: any) => {
  console.log(`🔥 Firebase ${operation}:`, data || '');
};

// Collection names - more flexible structure
export const COLLECTIONS = {
  COURSES: 'courses',
  USERS: 'users'
} as const;

// Base interfaces for flexible course structure
export interface BaseCourseItem {
  id: string;
  order: number;
  [key: string]: any; // Allow additional fields for different course types
}

export interface CourseDefinition {
  id: string;
  title: string;
  description: string;
  type: 'alphabet' | 'numbers' | 'words' | 'phrases' | 'grammar' | 'listening' | 'custom';
  isActive: boolean;
  totalItems?: number;
  estimatedTime: number; // minutes
  prerequisites: string[]; // course IDs that should be completed first
  icon: string;
  version: number;
  createdAt: any;
  updatedAt: any;
  
  // Schema definition for this course type
  itemSchema: {
    [fieldName: string]: {
      type: 'string' | 'number' | 'boolean' | 'url' | 'array';
      required: boolean;
      description: string;
    }
  };
}

export interface AlphabetCourseItem extends BaseCourseItem {
  character: string;
  name: string;
  pronunciation: string;
  audioUrl?: string;
  examples?: string[];
}

export interface NumbersCourseItem extends BaseCourseItem {
  number: string;
  translation: string;
  translationLatin: string;
  audioUrl?: string;
  category?: 'basic' | 'teens' | 'decades' | 'hundreds' | 'thousands';
}

export interface WordsCourseItem extends BaseCourseItem {
  english: string;
  georgian: string;
  latin: string;
  category: string;
  audioUrl?: string;
  examples?: Array<{
    english: string;
    georgian: string;
    latin?: string;
  }>;
  relatedWords?: string[]; // IDs of related words
}

// Generic course item type
export type CourseItem = AlphabetCourseItem | NumbersCourseItem | WordsCourseItem | BaseCourseItem;

export interface UserProgress {
  userId: string;
  courseId: string;
  learnedItems: string[];
  completionPercentage: number;
  startedAt: any;
  lastStudiedAt: any;
  streakDays: number;
  totalTimeSpent: number; // minutes
  averageAccuracy: number; // percentage
  
  // Detailed progress tracking
  itemProgress: {
    [itemId: string]: {
      learnedAt: any;
      reviewCount: number;
      lastReviewed: any;
      correctAnswers: number;
      incorrectAnswers: number;
      confidence: 'low' | 'medium' | 'high';
      needsReview: boolean;
    }
  };
}

export interface UserStats {
  userId: string;
  totalCoursesStarted: number;
  totalCoursesCompleted: number;
  totalItemsLearned: number;
  totalStudyTime: number; // minutes
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: any;
  createdAt: any;
  updatedAt: any;
}

/**
 * Enhanced Firebase Service with flexible course structure
 */
export class EnhancedFirebaseService {
  
  /**
   * Course Management
   */
  
  // Create a new course definition
  static async createCourse(courseData: Omit<CourseDefinition, 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      debugLog(`Creating course: ${courseData.id}`);
      
      const courseRef = doc(db, COLLECTIONS.COURSES, courseData.id);
      const { totalItems: _omitTotalItems, ...rest } = courseData as any;
      await setDoc(courseRef, {
        ...rest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      debugLog(`Successfully created course: ${courseData.id}`);
    } catch (error) {
      console.error(`❌ Error creating course ${courseData.id}:`, error);
      throw error;
    }
  }

  // Get course definition
  static async getCourse(courseId: string): Promise<CourseDefinition | null> {
    try {
      debugLog(`Getting course: ${courseId}`);
      
      const courseRef = doc(db, COLLECTIONS.COURSES, courseId);
      const courseSnap = await getDoc(courseRef);
      
      if (courseSnap.exists()) {
        const course = { id: courseSnap.id, ...courseSnap.data() } as CourseDefinition;
        debugLog(`Retrieved course: ${courseId}`, course);
        return course;
      }
      
      debugLog(`Course not found: ${courseId}`);
      return null;
    } catch (error) {
      console.error(`❌ Error getting course ${courseId}:`, error);
      throw error;
    }
  }

  // Get all active courses
  static async getAllCourses(): Promise<CourseDefinition[]> {
    try {
      debugLog('Getting all courses');
      
      const coursesRef = collection(db, COLLECTIONS.COURSES);
      const q = query(coursesRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      
      const courses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CourseDefinition[];
      
      debugLog(`Retrieved ${courses.length} courses`, courses);
      return courses.filter(course => course.isActive);
    } catch (error) {
      console.error('❌ Error getting all courses:', error);
      throw error;
    }
  }

  /**
   * Course Items Management
   */
  
  // Add items to a course
  static async addCourseItems(courseId: string, items: any[]): Promise<void> {
    try {
      debugLog(`Adding ${items.length} items to course: ${courseId}`);
      
      const batch = writeBatch(db);
      const itemsRef = collection(db, COLLECTIONS.COURSES, courseId, 'items');

      items.forEach((item, index) => {
        const itemId = item.id?.toString() || `item_${index + 1}`;
        const itemRef = doc(itemsRef, itemId);
        
        const itemData = {
          ...item,
          id: itemId,
          order: item.order || index + 1
        };
        
        batch.set(itemRef, itemData);
      });

      await batch.commit();
      
      // Update course total items count
      await this.updateCourseItemCount(courseId, items.length);
      
      debugLog(`Successfully added ${items.length} items to course: ${courseId}`);
    } catch (error) {
      console.error(`❌ Error adding items to course ${courseId}:`, error);
      throw error;
    }
  }

  // Get course items
  static async getCourseItems(courseId: string): Promise<CourseItem[]> {
    try {
      debugLog(`Getting items for course: ${courseId}`);
      
      const itemsRef = collection(db, COLLECTIONS.COURSES, courseId, 'items');
      const q = query(itemsRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CourseItem[];
      
      debugLog(`Retrieved ${items.length} items for course: ${courseId}`, items);
      return items;
    } catch (error) {
      console.error(`❌ Error getting items for course ${courseId}:`, error);
      throw error;
    }
  }

  // Update course item count
  private static async updateCourseItemCount(courseId: string, totalItems: number): Promise<void> {
    try {
      const courseRef = doc(db, COLLECTIONS.COURSES, courseId);
      await updateDoc(courseRef, {
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`❌ Error updating course item count for ${courseId}:`, error);
    }
  }

  /**
   * User Progress Management
   */
  
  // Get user progress for a course
  static async getUserProgress(userId: string, courseId: string): Promise<UserProgress | null> {
    try {
      debugLog(`Getting progress for user ${userId} in course ${courseId}`);
      
      const progressRef = doc(db, COLLECTIONS.USERS, userId, 'progress', courseId);
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        const progress = progressSnap.data() as UserProgress;
        debugLog(`Retrieved progress for user ${userId} in course ${courseId}`, progress);
        return progress;
      }
      
      debugLog(`No progress found for user ${userId} in course ${courseId}`);
      return null;
    } catch (error) {
      console.error(`❌ Error getting progress for user ${userId} in course ${courseId}:`, error);
      throw error;
    }
  }

  // Update user progress
  static async updateUserProgress(userId: string, courseId: string, progress: Partial<UserProgress>): Promise<void> {
    try {
      debugLog(`Updating progress for user ${userId} in course ${courseId}`, progress);
      
      const progressRef = doc(db, COLLECTIONS.USERS, userId, 'progress', courseId);
      await setDoc(progressRef, {
        ...progress,
        userId,
        courseId,
        lastStudiedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      debugLog(`Successfully updated progress for user ${userId} in course ${courseId}`);
    } catch (error) {
      console.error(`❌ Error updating progress for user ${userId} in course ${courseId}:`, error);
      throw error;
    }
  }

  // Mark item as learned
  static async markItemAsLearned(userId: string, courseId: string, itemId: string): Promise<void> {
    try {
      debugLog(`Marking item ${itemId} as learned for user ${userId} in course ${courseId}`);
      
      // Get current progress
      const currentProgress = await this.getUserProgress(userId, courseId);
      const learnedItems = currentProgress?.learnedItems || [];
      
      // Don't add if already learned
      if (learnedItems.includes(itemId)) {
        debugLog(`Item ${itemId} already learned`);
        return;
      }

      // Add to learned items
      const updatedLearnedItems = [...learnedItems, itemId];
      
      // Compute total items dynamically from items collection
      const courseItems = await this.getCourseItems(courseId);
      const totalItems = courseItems.length;
      const completionPercentage = totalItems > 0 ? Math.round((updatedLearnedItems.length / totalItems) * 100) : 0;

      // Update progress
      const progressUpdate: Partial<UserProgress> = {
        learnedItems: updatedLearnedItems,
        completionPercentage,
        itemProgress: {
          ...currentProgress?.itemProgress,
          [itemId]: {
            learnedAt: serverTimestamp(),
            reviewCount: 1,
            lastReviewed: serverTimestamp(),
            correctAnswers: 1,
            incorrectAnswers: 0,
            confidence: 'medium' as const,
            needsReview: false
          }
        }
      };

      await this.updateUserProgress(userId, courseId, progressUpdate);
      
      debugLog(`Successfully marked item ${itemId} as learned`);
    } catch (error) {
      console.error(`❌ Error marking item ${itemId} as learned:`, error);
      throw error;
    }
  }

  // Get user stats
  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      debugLog(`Getting stats for user ${userId}`);
      
      const statsRef = doc(db, COLLECTIONS.USERS, userId, 'profile', 'stats');
      const statsSnap = await getDoc(statsRef);
      
      if (statsSnap.exists()) {
        const stats = statsSnap.data() as UserStats;
        debugLog(`Retrieved stats for user ${userId}`, stats);
        return stats;
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Error getting stats for user ${userId}:`, error);
      throw error;
    }
  }
}