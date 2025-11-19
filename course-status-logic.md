# Course Status Logic Documentation

This document explains how the Tbilingo app determines whether a course is **finished**, **ongoing**, or **not yet available (locked)**.

## Overview

The app uses a **linear progression system** where courses unlock sequentially based on completion of previous courses. This encourages structured learning and ensures users build foundational knowledge before moving to advanced topics.

---

## Course States

### 1. **Finished** (Completed)
A course is considered **finished** when:
- **Completion percentage = 100%**
- All items in the course have been learned (marked as "learned")

**How it's calculated:**
```typescript
// From: src/utils/course-unlock-utils.ts
function isCourseCompleted(completionPercentage: number): boolean {
  return completionPercentage >= 100;
}

// Completion percentage calculation (from progressStore)
completionPercentage = (learnedItems.size / totalItems) * 100
```

**Visual indicators:**
- Progress bar shows 100%
- All items in the course marked as learned
- Next course in sequence becomes unlocked

---

### 2. **Ongoing** (In Progress)
A course is **ongoing** when:
- **0% < Completion percentage < 100%**
- The course is unlocked (either first course or previous course completed)
- At least one item has been learned, but not all items

**How it's determined:**
- Course is unlocked (see "Unlocking Logic" below)
- Learned items count > 0
- Learned items count < total items

**Visual indicators:**
- Progress bar shows partial completion (e.g., "5/10" or "50%")
- Course is accessible and can be continued

---

### 3. **Not Yet Available** (Locked)
A course is **locked** when:
- **Previous course is not completed (< 100%)**
- Exception: The first course (Alphabet) is always unlocked

**How it's determined:**
```typescript
// From: src/components/course/PhraseCourseItem.tsx
if (isFirstPhraseCourse) {
  // First phrase course checks if words course is completed
  isLocked = !previousCourseUnlocked;
} else if (previousCourse) {
  // Other courses check if previous course is completed
  const previousCourseProgress = getCompletionPercentage(previousCourse.id, previousCourseData.length);
  isLocked = !isCourseCompleted(previousCourseProgress);
}
```

**Visual indicators:**
- Course appears with **50% opacity**
- Lock icon or visual dimming
- Clicking shows dialog: *"Complete [Previous Course] first to unlock this course."*
- Cannot navigate to locked course

---

## Course Unlock Sequence

The app follows this strict sequential order:

1. **Alphabet** → Always unlocked (entry point)
2. **Numbers** → Unlocks after Alphabet is 100% complete
3. **Words & Phrases - Basic** → Unlocks after Numbers is 100% complete
4. **Phrases Advanced** → Unlocks after Words is 100% complete
5. **Business Georgian** → Unlocks after Phrases Advanced is 100% complete
6. **Travel Georgian** → Unlocks after Phrases Advanced is 100% complete
7. **Restaurant & Food** → Unlocks after Phrases Advanced is 100% complete
8. **Shopping & Markets** → Unlocks after Phrases Advanced is 100% complete
9. **Family & Relationships** → Unlocks after Phrases Advanced is 100% complete
10. **Medical & Health** → Unlocks after Business Georgian is 100% complete
11. **Directions & Transportation** → Unlocks after Phrases Advanced is 100% complete
12. **Weather & Seasons** → Unlocks after Phrases Advanced is 100% complete
13. **Culture & Traditions** → Unlocks after Business Georgian is 100% complete
14. **Emergency Situations** → Unlocks after Business Georgian is 100% complete

**Note:** Some phrase courses have branching paths (multiple courses unlock after Phrases Advanced), but each individual course still requires its direct prerequisite to be completed.

---

## Data Flow

### Progress Tracking

**1. Progress Store** (`src/stores/progressStore.ts`):
- Maintains state for all courses
- Tracks learned items per course using a `Set<string>`
- Calculates completion percentage
- Syncs with Firebase for authenticated users

```typescript
interface CourseProgress {
  learnedItems: Set<string>;      // IDs of learned items
  completedLessons: Set<string>;  // (Legacy, not used for unlock logic)
}
```

**2. Key Functions:**

```typescript
// Get number of learned items
getLearnedCount(courseType: string): number

// Get completion percentage
getCompletionPercentage(courseType: string, totalItems: number): number

// Mark item as learned
addLearnedItem(courseType: string, itemId: string): Promise<void>
```

### Unlock Logic Location

**Main Files:**

1. **`src/utils/course-unlock-utils.ts`**
   - Core utility functions
   - `isCourseCompleted(percentage)` - checks if course is 100%
   - `checkCourseUnlocked(index, previousCompleted, title)` - determines unlock status

2. **`src/components/LearnTab.tsx`**
   - Main course list rendering
   - Calculates completion for Alphabet, Numbers, Words
   - Determines which courses are completed
   - Passes unlock status to child components

3. **`src/components/course/PhraseCourseItem.tsx`**
   - Handles phrase course unlock logic
   - Checks previous course completion
   - Renders locked state if applicable

4. **`src/components/CourseLink/CourseLink.tsx`**
   - Visual representation of course status
   - Applies 50% opacity to locked courses
   - Prevents navigation for locked courses

---

## User Interaction Flow

### Accessing a Locked Course:

1. User clicks on a locked course (opacity 50%)
2. Click event is intercepted by `handleClick` in CourseLink
3. Navigation is prevented (`e.preventDefault()`)
4. Dialog appears with message: *"Complete [Previous Course] first to unlock this course."*
5. User clicks "OK" to dismiss dialog

### Completing a Course:

1. User learns items in a course (clicks "I learned" or completes flashcards)
2. `addLearnedItem(courseType, itemId)` is called
3. Progress is updated locally and synced to Firebase
4. Completion percentage recalculated
5. When percentage reaches 100%:
   - Course is marked as complete
   - Next course in sequence becomes unlocked (opacity returns to 100%)
   - User can now access the next course

---

## Testing Mode

For development purposes, there's a bypass flag:

**Location:** `src/components/LearnTab.tsx`

```typescript
const UNLOCK_ALL_COURSES_FOR_TESTING = false;
```

**When set to `true`:**
- All courses immediately become available
- Unlock logic is bypassed
- **⚠️ Must be set back to `false` before production deployment**

**Usage:**
- Useful for testing new courses without completing prerequisites
- Allows quick navigation during development
- Should NEVER be enabled in production

---

## Technical Implementation Details

### Course Configuration

All phrase courses are defined in `src/constants/courseData.ts`:

```typescript
interface CourseConfig {
  id: string;              // e.g., 'phrases-business'
  title: string;           // Display name
  description: string;
  prerequisites: string[]; // Array of prerequisite course IDs
  order: number;           // Display order
  route: string;           // Navigation path
}
```

### Progress Persistence

- **Local State:** Zustand store for immediate UI updates
- **Firebase Sync:** Progress automatically synced for authenticated users
- **Offline Support:** Local state maintained even when offline
- **Hydration:** Store hydrates from Firebase on user authentication

### Why This System?

1. **Structured Learning:** Ensures users build foundational knowledge
2. **Clear Progression:** Visual feedback on learning path
3. **Motivation:** Completing courses unlocks new content
4. **No Database Changes:** All logic is client-side using existing progress data
5. **Simple Implementation:** Only requires completion percentage check

---

## Summary

**Course is FINISHED when:**
- Completion percentage = 100% (all items learned)

**Course is ONGOING when:**
- 0% < Completion < 100%
- Course is unlocked

**Course is LOCKED when:**
- Previous course is not 100% complete
- Exception: First course (Alphabet) is always unlocked

**Key Function:**
```typescript
isCourseCompleted(percentage) → returns true if percentage >= 100
```

**Key Data:**
```typescript
learnedItems.size / totalItems * 100 = completionPercentage
```

---

**Last Updated:** October 30, 2025
