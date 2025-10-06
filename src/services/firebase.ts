/**
 * Firebase Service Layer
 * Handles all Firestore operations for learning content and user progress
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
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { AlphabetItem, NumberItem, WordItem } from '@/types';

// Debug logging helper
const debugLog = (operation: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔥 Firebase ${operation}:`, data || '');
  }
};

// Collection names
export const COLLECTIONS = {
  LEARNING_CONTENT: 'learning-content',
  COURSE_METADATA: 'course-metadata',
  USERS: 'users'
} as const;

// Course types
export type CourseType = 'alphabet' | 'numbers' | 'words';

// Firebase data interfaces
export interface FirebaseAlphabetItem extends AlphabetItem {
  order: number;
  createdAt: any;
  updatedAt: any;
}

export interface FirebaseNumberItem extends NumberItem {
  order: number;
  createdAt: any;
  updatedAt: any;
}

export interface FirebaseWordItem extends WordItem {
  order: number;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  createdAt: any;
  updatedAt: any;
}

export interface CourseMetadata {
  totalItems: number;
  isActive: boolean;
  lastUpdated: any;
  version: number;
}

export interface UserProgress {
  learnedItems: number[];
  totalItems: number;
  completionPercentage: number;
  lastUpdated: any;
  streakDays?: number;
  totalTimeSpent?: number;
}

export interface DetailedProgress {
  learnedAt: any;
  reviewCount: number;
  lastReviewed: any;
  confidence?: 'high' | 'medium' | 'low';
  mistakeCount: number;
}

/**
 * Learning Content Operations
 */
export class LearningContentService {
  
  // Get all items for a specific course
  static async getCourseItems<T>(courseType: CourseType): Promise<T[]> {
    try {
      debugLog(`Getting ${courseType} items`);
      
      const q = query(
        collection(db, COLLECTIONS.LEARNING_CONTENT, courseType, 'items'),
        orderBy('order', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      })) as T[];
      
      debugLog(`Retrieved ${items.length} ${courseType} items`, items);
      return items;
      
    } catch (error) {
      console.error(`❌ Error getting ${courseType} items:`, error);
      throw error;
    }
  }

  // Add multiple items to a course
  static async addCourseItems(courseType: CourseType, items: any[]): Promise<void> {
    try {
      debugLog(`Adding ${items.length} items to ${courseType}`);
      
      const batch = writeBatch(db);
      const collectionRef = collection(db, COLLECTIONS.LEARNING_CONTENT, courseType, 'items');

      items.forEach((item, index) => {
        const docRef = doc(collectionRef, item.id.toString());
        const firebaseItem = {
          ...item,
          order: index + 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(docRef, firebaseItem);
      });

      await batch.commit();
      debugLog(`Successfully added ${items.length} items to ${courseType}`);
      
    } catch (error) {
      console.error(`❌ Error adding items to ${courseType}:`, error);
      throw error;
    }
  }

  // Update course metadata
  static async updateCourseMetadata(courseType: CourseType, metadata: Partial<CourseMetadata>): Promise<void> {
    try {
      debugLog(`Updating ${courseType} metadata`, metadata);
      
      const docRef = doc(db, COLLECTIONS.COURSE_METADATA, courseType);
      await setDoc(docRef, {
        ...metadata,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      
      debugLog(`Successfully updated ${courseType} metadata`);
      
    } catch (error) {
      console.error(`❌ Error updating ${courseType} metadata:`, error);
      throw error;
    }
  }

  // Get course metadata
  static async getCourseMetadata(courseType: CourseType): Promise<CourseMetadata | null> {
    try {
      debugLog(`Getting ${courseType} metadata`);
      
      const docRef = doc(db, COLLECTIONS.COURSE_METADATA, courseType);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const metadata = docSnap.data() as CourseMetadata;
        debugLog(`Retrieved ${courseType} metadata`, metadata);
        return metadata;
      } else {
        debugLog(`No metadata found for ${courseType}`);
        return null;
      }
      
    } catch (error) {
      console.error(`❌ Error getting ${courseType} metadata:`, error);
      throw error;
    }
  }
}

/**
 * User Progress Operations
 */
export class UserProgressService {
  
  // Get current user's progress for a course
  static async getUserProgress(courseType: CourseType): Promise<UserProgress | null> {
    try {
      const user = auth.currentUser;
      if (!user) {
        debugLog('No authenticated user found');
        return null;
      }

      debugLog(`Getting user progress for ${courseType}`, user.uid);
      
      const docRef = doc(db, COLLECTIONS.USERS, user.uid, 'progress', courseType);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const progress = docSnap.data() as UserProgress;
        debugLog(`Retrieved user progress for ${courseType}`, progress);
        return progress;
      } else {
        debugLog(`No progress found for ${courseType}`);
        return null;
      }
      
    } catch (error) {
      console.error(`❌ Error getting user progress for ${courseType}:`, error);
      throw error;
    }
  }

  // Update user's progress for a course
  static async updateUserProgress(courseType: CourseType, progress: Partial<UserProgress>): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      debugLog(`Updating user progress for ${courseType}`, progress);
      
      const docRef = doc(db, COLLECTIONS.USERS, user.uid, 'progress', courseType);
      await setDoc(docRef, {
        ...progress,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      
      debugLog(`Successfully updated user progress for ${courseType}`);
      
    } catch (error) {
      console.error(`❌ Error updating user progress for ${courseType}:`, error);
      throw error;
    }
  }

  // Add learned item to user's progress
  static async addLearnedItem(courseType: CourseType, itemId: number): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      debugLog(`Adding learned item ${itemId} to ${courseType}`);
      
      // Get current progress
      const currentProgress = await this.getUserProgress(courseType);
      const learnedItems = currentProgress?.learnedItems || [];
      
      // Don't add if already learned
      if (learnedItems.includes(itemId)) {
        debugLog(`Item ${itemId} already learned for ${courseType}`);
        return;
      }

      // Add new item
      const updatedLearnedItems = [...learnedItems, itemId];
      
      // Get course metadata to calculate completion
      const metadata = await LearningContentService.getCourseMetadata(courseType);
      const totalItems = metadata?.totalItems || 0;
      const completionPercentage = totalItems > 0 ? Math.round((updatedLearnedItems.length / totalItems) * 100) : 0;

      await this.updateUserProgress(courseType, {
        learnedItems: updatedLearnedItems,
        totalItems,
        completionPercentage
      });

      // Also add detailed progress
      await this.updateDetailedProgress(courseType, itemId, {
        learnedAt: serverTimestamp(),
        reviewCount: 1,
        lastReviewed: serverTimestamp(),
        mistakeCount: 0
      });
      
      debugLog(`Successfully added learned item ${itemId} to ${courseType}`);
      
    } catch (error) {
      console.error(`❌ Error adding learned item ${itemId} to ${courseType}:`, error);
      throw error;
    }
  }

  // Remove learned item from user's progress
  static async removeLearnedItem(courseType: CourseType, itemId: number): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      debugLog(`Removing learned item ${itemId} from ${courseType}`);
      
      // Get current progress
      const currentProgress = await this.getUserProgress(courseType);
      if (!currentProgress) return;
      
      const updatedLearnedItems = currentProgress.learnedItems.filter(id => id !== itemId);
      
      // Get course metadata to calculate completion
      const metadata = await LearningContentService.getCourseMetadata(courseType);
      const totalItems = metadata?.totalItems || 0;
      const completionPercentage = totalItems > 0 ? Math.round((updatedLearnedItems.length / totalItems) * 100) : 0;

      await this.updateUserProgress(courseType, {
        learnedItems: updatedLearnedItems,
        totalItems,
        completionPercentage
      });

      // Remove detailed progress
      const detailedRef = doc(db, COLLECTIONS.USERS, user.uid, 'detailed-progress', courseType, 'items', itemId.toString());
      await deleteDoc(detailedRef);
      
      debugLog(`Successfully removed learned item ${itemId} from ${courseType}`);
      
    } catch (error) {
      console.error(`❌ Error removing learned item ${itemId} from ${courseType}:`, error);
      throw error;
    }
  }

  // Check if item is learned
  static async isItemLearned(courseType: CourseType, itemId: number): Promise<boolean> {
    try {
      const progress = await this.getUserProgress(courseType);
      const isLearned = progress?.learnedItems?.includes(itemId) || false;
      
      debugLog(`Item ${itemId} learned status for ${courseType}:`, isLearned);
      return isLearned;
      
    } catch (error) {
      console.error(`❌ Error checking if item ${itemId} is learned for ${courseType}:`, error);
      return false;
    }
  }

  // Update detailed progress for an item
  static async updateDetailedProgress(courseType: CourseType, itemId: number, progress: Partial<DetailedProgress>): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      debugLog(`Updating detailed progress for ${courseType} item ${itemId}`, progress);
      
      const docRef = doc(db, COLLECTIONS.USERS, user.uid, 'detailed-progress', courseType, 'items', itemId.toString());
      await setDoc(docRef, progress, { merge: true });
      
      debugLog(`Successfully updated detailed progress for ${courseType} item ${itemId}`);
      
    } catch (error) {
      console.error(`❌ Error updating detailed progress for ${courseType} item ${itemId}:`, error);
      throw error;
    }
  }

  // Reset course progress
  static async resetCourseProgress(courseType: CourseType): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      debugLog(`Resetting progress for ${courseType}`);
      
      // Reset main progress
      await this.updateUserProgress(courseType, {
        learnedItems: [],
        totalItems: 0,
        completionPercentage: 0
      });

      // Remove all detailed progress
      const detailedRef = collection(db, COLLECTIONS.USERS, user.uid, 'detailed-progress', courseType, 'items');
      const snapshot = await getDocs(detailedRef);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      debugLog(`Successfully reset progress for ${courseType}`);
      
    } catch (error) {
      console.error(`❌ Error resetting progress for ${courseType}:`, error);
      throw error;
    }
  }

  // Listen to real-time progress updates
  static subscribeToUserProgress(
    courseType: CourseType, 
    callback: (progress: UserProgress | null) => void
  ): (() => void) | null {
    try {
      const user = auth.currentUser;
      if (!user) {
        debugLog('No authenticated user for progress subscription');
        callback(null);
        return null;
      }

      debugLog(`Setting up real-time listener for ${courseType} progress`);
      
      const docRef = doc(db, COLLECTIONS.USERS, user.uid, 'progress', courseType);
      
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const progress = docSnap.data() as UserProgress;
          debugLog(`Real-time progress update for ${courseType}`, progress);
          callback(progress);
        } else {
          debugLog(`No progress data found for ${courseType}`);
          callback(null);
        }
      }, (error) => {
        console.error(`❌ Error in progress listener for ${courseType}:`, error);
        callback(null);
      });

      return unsubscribe;
      
    } catch (error) {
      console.error(`❌ Error setting up progress listener for ${courseType}:`, error);
      return null;
    }
  }
}