/**
 * User Progress Service for New Firebase Structure
 * Handles user learning progress with simple, well-structured data
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '@root/firebaseConfig';

// Debug logging helper
const debugLog = (operation: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`👤 UserProgress ${operation}:`, data || '');
  }
};

/**
 * Simple, well-structured user progress interface
 * Each user has progress per course with learned item IDs
 * Note: totalItems and completionPercentage are calculated dynamically, not stored
 */
export interface SimpleUserProgress {
  userId: string;
  courseId: string;
  learnedItemIds: string[];           // Array of learned item IDs (e.g., ["1", "2", "3"])
  isFinished?: boolean;
  lastUpdated: any;                   // Firestore timestamp
  createdAt: any;                     // Firestore timestamp
}



export class SimpleUserProgressService {
  // Map any course key to numeric progress doc id
  private static toProgressDocId(courseId: string): string {
    const mapping: Record<string, string> = {
      '1': '1',
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
    };
    return mapping[courseId] || courseId;
  }
  
  /**
   * Get user progress for a specific course
   */
  static async getUserProgress(courseId: string): Promise<SimpleUserProgress | null> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const progressDocId = this.toProgressDocId(courseId);
      debugLog(`Getting progress for course ${courseId} (doc ${progressDocId})`);
      
      const docRef = doc(db, 'users', user.uid, 'progress', progressDocId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as SimpleUserProgress;
        debugLog(`Found progress for ${progressDocId}:`, data);
        return data;
      }
      
      debugLog(`No progress found for ${progressDocId}`);
      return null;
      
    } catch (error) {
      console.error(`❌ Error getting progress for ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Add a learned item to user progress
   */
  static async addLearnedItem(courseId: string, itemId: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const progressDocId = this.toProgressDocId(courseId);
      debugLog(`Adding learned item ${itemId} to course ${courseId} (doc ${progressDocId})`);
      
      // Get current progress
      const currentProgress = await this.getUserProgress(courseId);
      const currentLearnedItems = currentProgress?.learnedItemIds || [];
      
      // Don't add if already learned
      if (currentLearnedItems.includes(itemId)) {
        debugLog(`Item ${itemId} already learned`);
        return;
      }

      // Add to learned items
      const updatedLearnedItems = [...currentLearnedItems, itemId];

      // Update progress document (no longer storing totalItems or completionPercentage)
      const progressRef = doc(db, 'users', user.uid, 'progress', progressDocId);
      const progressUpdate: SimpleUserProgress = {
        userId: user.uid,
        courseId: progressDocId,
        learnedItemIds: updatedLearnedItems,
        isFinished: currentProgress?.isFinished || false,
        lastUpdated: serverTimestamp(),
        createdAt: currentProgress?.createdAt || serverTimestamp()
      };

      await setDoc(progressRef, progressUpdate);
      
      debugLog(`Successfully added learned item ${itemId} to ${progressDocId}`);
      
    } catch (error) {
      console.error(`❌ Error adding learned item ${itemId} to ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Remove a learned item from user progress
   */
  static async removeLearnedItem(courseId: string, itemId: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const progressDocId = this.toProgressDocId(courseId);
      debugLog(`Removing learned item ${itemId} from course ${courseId} (doc ${progressDocId})`);
      
      // Get current progress
      const currentProgress = await this.getUserProgress(courseId);
      if (!currentProgress) return;
      
      const updatedLearnedItems = currentProgress.learnedItemIds.filter(id => id !== itemId);

      // Update progress document (no longer storing totalItems or completionPercentage)
      const progressRef = doc(db, 'users', user.uid, 'progress', progressDocId);
      await updateDoc(progressRef, {
        learnedItemIds: updatedLearnedItems,
        isFinished: false,
        lastUpdated: serverTimestamp()
      });
      
      debugLog(`Successfully removed learned item ${itemId} from ${progressDocId}`);
      
    } catch (error) {
      console.error(`❌ Error removing learned item ${itemId} from ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Check if an item is learned
   */
  static async isItemLearned(courseId: string, itemId: string): Promise<boolean> {
    try {
      const progress = await this.getUserProgress(courseId);
      const isLearned = progress?.learnedItemIds.includes(itemId) || false;
      
      debugLog(`Item ${itemId} learned status for ${courseId}:`, isLearned);
      return isLearned;
      
    } catch (error) {
      console.error(`❌ Error checking if item ${itemId} is learned for ${courseId}:`, error);
      return false;
    }
  }

  /**
   * Reset progress for a course
   */
  static async resetCourseProgress(courseId: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const progressDocId = this.toProgressDocId(courseId);
      debugLog(`Resetting progress for course ${courseId} (doc ${progressDocId})`);
      
      // Reset main progress
      const progressRef = doc(db, 'users', user.uid, 'progress', progressDocId);
      await setDoc(progressRef, {
        userId: user.uid,
        courseId: progressDocId,
        learnedItemIds: [],
        isFinished: false,
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      
      debugLog(`Successfully reset progress for course ${progressDocId}`);
      
    } catch (error) {
      console.error(`❌ Error resetting progress for course ${courseId}:`, error);
      throw error;
    }
  }

  
}