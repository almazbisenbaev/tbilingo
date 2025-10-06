/**
 * User Progress Service for New Firebase Structure
 * Handles user learning progress with simple, well-structured data
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

// Debug logging helper
const debugLog = (operation: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`👤 UserProgress ${operation}:`, data || '');
  }
};

/**
 * Simple, well-structured user progress interface
 * Each user has progress per course with learned item IDs
 */
export interface SimpleUserProgress {
  userId: string;
  courseId: string;
  learnedItemIds: string[];           // Array of learned item IDs (e.g., ["1", "2", "3"])
  totalItems: number;                 // Total items in course
  completionPercentage: number;       // Progress percentage (0-100)
  lastUpdated: any;                   // Firestore timestamp
  createdAt: any;                     // Firestore timestamp
}

/**
 * Individual learned item details for querying
 */
export interface LearnedItemDetail {
  userId: string;
  courseId: string;
  itemId: string;
  learnedAt: any;                     // Firestore timestamp
  reviewCount: number;                // Number of times reviewed
  lastReviewed: any;                  // Last review timestamp
}

export class SimpleUserProgressService {
  
  /**
   * Get user progress for a specific course
   */
  static async getUserProgress(courseId: string): Promise<SimpleUserProgress | null> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      debugLog(`Getting progress for course ${courseId}`);
      
      const docRef = doc(db, 'users', user.uid, 'progress', courseId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as SimpleUserProgress;
        debugLog(`Found progress for ${courseId}:`, data);
        return data;
      }
      
      debugLog(`No progress found for ${courseId}`);
      return null;
      
    } catch (error) {
      console.error(`❌ Error getting progress for ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Add a learned item to user progress
   */
  static async addLearnedItem(courseId: string, itemId: string, totalItems: number): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      debugLog(`Adding learned item ${itemId} to course ${courseId}`);
      
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
      const completionPercentage = totalItems > 0 ? Math.round((updatedLearnedItems.length / totalItems) * 100) : 0;

      // Update progress document
      const progressRef = doc(db, 'users', user.uid, 'progress', courseId);
      const progressUpdate: SimpleUserProgress = {
        userId: user.uid,
        courseId,
        learnedItemIds: updatedLearnedItems,
        totalItems,
        completionPercentage,
        lastUpdated: serverTimestamp(),
        createdAt: currentProgress?.createdAt || serverTimestamp()
      };

      await setDoc(progressRef, progressUpdate);

      // Also create learned item detail for easy querying
      const itemDetailRef = doc(db, 'users', user.uid, 'learned-items', `${courseId}-${itemId}`);
      const itemDetail: LearnedItemDetail = {
        userId: user.uid,
        courseId,
        itemId,
        learnedAt: serverTimestamp(),
        reviewCount: 1,
        lastReviewed: serverTimestamp()
      };

      await setDoc(itemDetailRef, itemDetail);
      
      debugLog(`Successfully added learned item ${itemId} to ${courseId}`);
      
    } catch (error) {
      console.error(`❌ Error adding learned item ${itemId} to ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Remove a learned item from user progress
   */
  static async removeLearnedItem(courseId: string, itemId: string, totalItems: number): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      debugLog(`Removing learned item ${itemId} from course ${courseId}`);
      
      // Get current progress
      const currentProgress = await this.getUserProgress(courseId);
      if (!currentProgress) return;
      
      const updatedLearnedItems = currentProgress.learnedItemIds.filter(id => id !== itemId);
      const completionPercentage = totalItems > 0 ? Math.round((updatedLearnedItems.length / totalItems) * 100) : 0;

      // Update progress document
      const progressRef = doc(db, 'users', user.uid, 'progress', courseId);
      await updateDoc(progressRef, {
        learnedItemIds: updatedLearnedItems,
        totalItems,
        completionPercentage,
        lastUpdated: serverTimestamp()
      });

      // Remove learned item detail
      const itemDetailRef = doc(db, 'users', user.uid, 'learned-items', `${courseId}-${itemId}`);
      await setDoc(itemDetailRef, {}, { merge: false }); // This effectively deletes the document
      
      debugLog(`Successfully removed learned item ${itemId} from ${courseId}`);
      
    } catch (error) {
      console.error(`❌ Error removing learned item ${itemId} from ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Get all learned items for a user (for easy querying)
   */
  static async getAllLearnedItems(): Promise<LearnedItemDetail[]> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      debugLog('Getting all learned items for user');
      
      const learnedItemsRef = collection(db, 'users', user.uid, 'learned-items');
      const snapshot = await getDocs(learnedItemsRef);
      
      const learnedItems: LearnedItemDetail[] = [];
      snapshot.forEach(doc => {
        if (doc.exists()) {
          learnedItems.push(doc.data() as LearnedItemDetail);
        }
      });
      
      debugLog(`Found ${learnedItems.length} learned items`);
      return learnedItems;
      
    } catch (error) {
      console.error('❌ Error getting all learned items:', error);
      throw error;
    }
  }

  /**
   * Get learned items for a specific course
   */
  static async getLearnedItemsForCourse(courseId: string): Promise<LearnedItemDetail[]> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      debugLog(`Getting learned items for course ${courseId}`);
      
      const learnedItemsRef = collection(db, 'users', user.uid, 'learned-items');
      const q = query(learnedItemsRef, where('courseId', '==', courseId));
      const snapshot = await getDocs(q);
      
      const learnedItems: LearnedItemDetail[] = [];
      snapshot.forEach(doc => {
        if (doc.exists()) {
          learnedItems.push(doc.data() as LearnedItemDetail);
        }
      });
      
      debugLog(`Found ${learnedItems.length} learned items for course ${courseId}`);
      return learnedItems;
      
    } catch (error) {
      console.error(`❌ Error getting learned items for course ${courseId}:`, error);
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

      debugLog(`Resetting progress for course ${courseId}`);
      
      // Reset main progress
      const progressRef = doc(db, 'users', user.uid, 'progress', courseId);
      await setDoc(progressRef, {
        userId: user.uid,
        courseId,
        learnedItemIds: [],
        totalItems: 0,
        completionPercentage: 0,
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      // Remove all learned item details for this course
      const learnedItems = await this.getLearnedItemsForCourse(courseId);
      const deletePromises = learnedItems.map(item => {
        const itemRef = doc(db, 'users', user.uid, 'learned-items', `${courseId}-${item.itemId}`);
        return setDoc(itemRef, {}, { merge: false });
      });
      
      await Promise.all(deletePromises);
      
      debugLog(`Successfully reset progress for course ${courseId}`);
      
    } catch (error) {
      console.error(`❌ Error resetting progress for course ${courseId}:`, error);
      throw error;
    }
  }
}