/**
 * Enhanced User Progress Service for Memory-Based Learning
 * Handles phrases-2 course with memory tracking (correct answers count)
 * Uses the existing /users/{userId}/progress/{courseId} structure
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '@root/firebaseConfig';
import { PhraseAdvancedMemory } from '@/types';

// Debug logging helper
const debugLog = (operation: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🧠 MemoryProgress ${operation}:`, data || '');
  }
};

/**
 * Memory-based progress interface for phrases-2 course
 * Uses the same structure as other courses but with enhanced items array
 */
export interface MemoryBasedProgress {
  userId: string;
  courseId: string;
  items: Array<{
    id: string;
    memory: PhraseAdvancedMemory;
    isLearned: boolean;
  }>;
  learnedItemIds: string[]; // For compatibility - derived from items array
  lastUpdated: any;
  createdAt: any;
}

export class MemoryProgressService {
  // Map to numeric progress doc id
  private static toProgressDocId(courseId: string): string {
    const mapping: Record<string, string> = {
      'phrases-2': '4',
      '4': '4',
      'phrases-business': '5',
      '5': '5'
    };
    return mapping[courseId] || courseId;
  }
  
  /**
   * Get memory-based progress for phrases-2 course from existing progress collection
   */
  static async getMemoryProgress(courseId: string): Promise<MemoryBasedProgress | null> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const progressDocId = this.toProgressDocId(courseId);
      debugLog(`Getting memory progress for course ${courseId} (doc ${progressDocId})`);
      
      const docRef = doc(db, 'users', user.uid, 'progress', progressDocId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as MemoryBasedProgress;
        debugLog(`Found memory progress for ${progressDocId}:`, data);
        return data;
      }
      
      debugLog(`No memory progress found for ${progressDocId}`);
      return null;
      
    } catch (error) {
      console.error(`❌ Error getting memory progress for ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Update memory for a specific item using items array structure
   */
  static async updateItemMemory(
    courseId: string, 
    itemId: string, 
    memory: PhraseAdvancedMemory
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const progressDocId = this.toProgressDocId(courseId);
      debugLog(`Updating memory for item ${itemId} in course ${courseId} (doc ${progressDocId}):`, memory);
      
      // Get current progress
      const currentProgress = await this.getMemoryProgress(courseId);
      const currentItems = currentProgress?.items || [];
      
      // Update or add the item
      const updatedItems = [...currentItems];
      const existingIndex = updatedItems.findIndex(item => item.id === itemId);
      
      const newItem = {
        id: itemId,
        memory: memory,
        isLearned: memory.isLearned
      };
      
      if (existingIndex >= 0) {
        updatedItems[existingIndex] = newItem;
      } else {
        updatedItems.push(newItem);
      }

      // Update learned items list for compatibility
      const updatedLearnedItems = updatedItems
        .filter(item => item.isLearned)
        .map(item => item.id);

      // Create or update progress document in existing progress collection
      const progressRef = doc(db, 'users', user.uid, 'progress', progressDocId);
      const progressUpdate: MemoryBasedProgress = {
        userId: user.uid,
        courseId: progressDocId,
        items: updatedItems,
        learnedItemIds: updatedLearnedItems,
        lastUpdated: serverTimestamp(),
        createdAt: currentProgress?.createdAt || serverTimestamp()
      };

      await setDoc(progressRef, progressUpdate);
      
      debugLog(`Successfully updated memory for item ${itemId} in ${courseId}`);
      
    } catch (error) {
      console.error(`❌ Error updating memory for item ${itemId} in ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Increment correct answers for an item
   */
  static async incrementCorrectAnswers(courseId: string, itemId: string): Promise<PhraseAdvancedMemory> {
    try {
      const currentProgress = await this.getMemoryProgress(courseId);
      const currentItem = currentProgress?.items?.find(item => item.id === itemId);
      const currentMemory = currentItem?.memory || { correctAnswers: 0, isLearned: false };
      
      const newCorrectAnswers = Math.min(currentMemory.correctAnswers + 1, 3);
      const isLearned = newCorrectAnswers >= 3;
      
      const updatedMemory: PhraseAdvancedMemory = {
        correctAnswers: newCorrectAnswers,
        isLearned
      };

      await this.updateItemMemory(courseId, itemId, updatedMemory);
      
      return updatedMemory;
      
    } catch (error) {
      console.error(`❌ Error incrementing correct answers for item ${itemId} in ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Decrement correct answers for an item (when user makes a wrong guess)
   */
  static async decrementCorrectAnswers(courseId: string, itemId: string): Promise<PhraseAdvancedMemory> {
    try {
      const currentProgress = await this.getMemoryProgress(courseId);
      const currentItem = currentProgress?.items?.find(item => item.id === itemId);
      const currentMemory = currentItem?.memory || { correctAnswers: 0, isLearned: false };
      
      const newCorrectAnswers = Math.max(currentMemory.correctAnswers - 1, 0);
      const isLearned = newCorrectAnswers >= 3; // Will be false since max is now 2
      
      const updatedMemory: PhraseAdvancedMemory = {
        correctAnswers: newCorrectAnswers,
        isLearned
      };

      await this.updateItemMemory(courseId, itemId, updatedMemory);
      
      debugLog(`Decremented correct answers for ${itemId} in ${courseId}. New count: ${newCorrectAnswers}`);
      return updatedMemory;
      
    } catch (error) {
      console.error(`❌ Error decrementing correct answers for item ${itemId} in ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Get memory for a specific item
   */
  static async getItemMemory(courseId: string, itemId: string): Promise<PhraseAdvancedMemory> {
    try {
      const progress = await this.getMemoryProgress(courseId);
      const item = progress?.items?.find(item => item.id === itemId);
      return item?.memory || { correctAnswers: 0, isLearned: false };
    } catch (error) {
      console.error(`❌ Error getting memory for item ${itemId} in ${courseId}:`, error);
      return { correctAnswers: 0, isLearned: false };
    }
  }

  /**
   * Initialize memory progress for all items in a course
   */
  static async initializeMemoryProgress(courseId: string, itemIds: string[]): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Check if progress already exists
      const existingProgress = await this.getMemoryProgress(courseId);
      if (existingProgress) {
        debugLog(`Memory progress already exists for ${courseId}`);
        return;
      }

      const progressDocId = this.toProgressDocId(courseId);
      debugLog(`Initializing memory progress for course ${courseId} (doc ${progressDocId}) with ${itemIds.length} items`);
      
      // Initialize items array with memory data
      const initialItems = itemIds.map(itemId => ({
        id: itemId,
        memory: { correctAnswers: 0, isLearned: false },
        isLearned: false
      }));

      const progressRef = doc(db, 'users', user.uid, 'progress', progressDocId);
      const initialProgress: MemoryBasedProgress = {
        userId: user.uid,
        courseId: progressDocId,
        items: initialItems,
        learnedItemIds: [],
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      await setDoc(progressRef, initialProgress);
      
      debugLog(`Successfully initialized memory progress for ${courseId}`);
      
    } catch (error) {
      console.error(`❌ Error initializing memory progress for ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Reset memory progress for a course
   */
  static async resetMemoryProgress(courseId: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const progressDocId = this.toProgressDocId(courseId);
      debugLog(`Resetting memory progress for course ${courseId} (doc ${progressDocId})`);
      
      const progressRef = doc(db, 'users', user.uid, 'progress', progressDocId);
      await setDoc(progressRef, {
        userId: user.uid,
        courseId: progressDocId,
        items: [],
        learnedItemIds: [],
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      
      debugLog(`Successfully reset memory progress for course ${progressDocId}`);
      
    } catch (error) {
      console.error(`❌ Error resetting memory progress for course ${courseId}:`, error);
      throw error;
    }
  }
}