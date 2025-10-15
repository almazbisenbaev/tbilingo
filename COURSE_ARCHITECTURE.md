# Course Architecture - Post Refactoring

## Overview

All courses in the application are now **completely isolated** from each other. Each course has its own dedicated `page.tsx` file containing all course-specific logic, state management, and gameplay mechanics.

## Course Structure

### Course Categories

1. **Flashcard-based Courses** (3 courses)
   - Alphabet (`/alphabet`)
   - Numbers (`/numbers`)
   - Words (`/words`)
   - ✨ **Unique gameplay**: Flip cards to learn individual items

2. **Phrase Construction Courses** (11 courses)
   - Restaurant (`/restaurant`)
   - Travel (`/travel`)
   - Medical (`/medical`)
   - Emergency (`/emergency`)
   - Family (`/family`)
   - Business (`/business`)
   - Directions (`/directions`)
   - Shopping (`/shopping`)
   - Culture (`/culture`)
   - Weather (`/weather`)
   - Phrases Advanced (`/phrases-2`)
   - ✨ **Unique gameplay**: Build sentences by selecting words in correct order

## File Locations

```
src/app/(courses)/
├── alphabet/
│   └── page.tsx           (Isolated implementation)
├── numbers/
│   └── page.tsx           (Isolated implementation)
├── words/
│   └── page.tsx           (Isolated implementation)
├── restaurant/
│   └── page.tsx           (Isolated implementation)
├── travel/
│   └── page.tsx           (Isolated implementation)
├── medical/
│   └── page.tsx           (Isolated implementation)
├── emergency/
│   └── page.tsx           (Isolated implementation)
├── family/
│   └── page.tsx           (Isolated implementation)
├── business/
│   └── page.tsx           (Isolated implementation)
├── directions/
│   └── page.tsx           (Isolated implementation)
├── shopping/
│   └── page.tsx           (Isolated implementation)
├── culture/
│   └── page.tsx           (Isolated implementation)
├── weather/
│   └── page.tsx           (Isolated implementation)
└── phrases-2/
    └── page.tsx           (Isolated implementation)
```

## What Each Course Contains

Every course's `page.tsx` file includes:

### 1. **Configuration Constants**
```typescript
const COURSE_ID = 'phrases-{name}';      // Unique identifier
const COURSE_TITLE = 'Display Name';     // Shown in UI
const COURSE_DESCRIPTION = 'Description'; // Shown on intro screen
```

### 2. **Component Definitions**
- Inline gameplay component (e.g., `PhraseComponent`, `FlashcardLetter`, etc.)
- All course-specific UI logic

### 3. **State Management**
```typescript
// Progress tracking
const [learnedItems, setLearnedItems] = useState<number[]>([]);
const [itemsMemory, setItemsMemory] = useState<Record<number, Memory>>({});

// Gameplay flow
const [isGameplayActive, setIsGameplayActive] = useState(false);
const [processedItems, setProcessedItems] = useState<number[]>([]);
const [itemsToReview, setItemsToReview] = useState<Item[]>([]);
const [allCardsReviewed, setAllCardsReviewed] = useState(false);
```

### 4. **Business Logic Functions**
- `startGameplay()` - Initialize learning session
- `resetGameplay()` - Return to intro screen
- `handleCorrectAnswer()` - Process correct answers
- `handleWrongAnswer()` - Process incorrect answers
- `markAsToReview()` - Mark item as reviewed

### 5. **Three-Screen Flow**
1. **Intro Screen** - Shows progress, description, and start button
2. **Gameplay Screen** - Active learning experience
3. **Completion Screen** - Session summary and next actions

## Shared vs Isolated

### ✅ Shared (Acceptable)

#### UI Components
- `PageTransition` - Animation wrapper
- `CoursePageLoading` - Loading state
- `ErrorState` - Error display
- `AppHeader` - Navigation header
- `PageLayout` - Page structure
- `ContentContainer` - Content wrapper
- `ProgressBar` - Progress indicator
- `ConfirmationDialog` - Confirmation dialogs
- `SuccessModal` - Success messages

#### Utilities & Services
- `useBackToHomeNavigation()` - Navigation
- `useProgressStore()` - Progress management
- `useAuth()` - Authentication
- `usePhrasesCourse(id)` / `useAlphabet()` / `useNumbers()` / `useWords()` - Data fetching
- `MemoryProgressService` - Firebase progress sync
- `shuffleArray()` - Array randomization
- `processGeorgianSentence()` - Text processing
- `normalizeForComparison()` - Text normalization

### ❌ No Longer Shared (Isolated)

- Course-specific components (each course has its own)
- Course gameplay logic (each course manages its own)
- Course state management hooks (embedded in each course)
- Generic course containers (removed)

## Benefits of Isolation

### 1. **Independent Development**
- Modify one course without affecting others
- Experiment with new features on specific courses
- Test changes in isolation

### 2. **Clear Code Ownership**
- All course logic in one file
- Easy to understand course behavior
- No hidden dependencies

### 3. **Flexible Evolution**
- Can completely change gameplay for one course
- Different courses can have different mechanics
- No need to maintain backwards compatibility across courses

### 4. **Easier Debugging**
- All relevant code in one place
- No need to trace through shared components
- Simpler mental model

## Adding a New Course

To add a new isolated course:

1. **Create course folder**: `src/app/(courses)/your-course/`
2. **Copy an existing course's `page.tsx`** (choose similar gameplay type)
3. **Update constants**:
   ```typescript
   const COURSE_ID = 'phrases-your-course';
   const COURSE_TITLE = 'Your Course Title';
   const COURSE_DESCRIPTION = 'Your description';
   ```
4. **Customize gameplay component** if needed
5. **Add course data** to Firebase/Firestore
6. **Add course link** to home page

## Modifying an Existing Course

To modify a course:

1. Navigate to the course's `page.tsx`
2. Make your changes (all logic is in this file)
3. Test only this course
4. No other courses will be affected

## Course Data Flow

```
Firebase/Firestore (Course Data)
        ↓
useEnhancedLearningContent Hook
        ↓
Course Page Component
        ↓
Local State Management
        ↓
MemoryProgressService (Progress Sync)
        ↓
Firebase/Firestore (User Progress)
```

## Best Practices

1. **Keep courses self-contained** - All course logic should be in the course's `page.tsx`
2. **Use shared UI components** - Reuse UI components but not course-specific logic
3. **Maintain consistent patterns** - Use similar structure across courses for maintainability
4. **Test independently** - Each course should work independently
5. **Document unique features** - If a course has unique mechanics, document them in the course file

## Migration Notes

- Previous shared components are no longer used but remain in codebase
- Can be safely removed: `GenericCourse`, `useCourseMemory`, `useCourseGameplay`, `PhrasesCourse`
- No user data migration needed - same data structure
- No user impact - same UI and behavior

---

**Last Updated**: October 15, 2025
**Status**: ✅ All courses isolated and functioning independently
