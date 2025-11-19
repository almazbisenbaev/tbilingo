## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Authentication System](#authentication-system)
3. [Database Structure](#database-structure)
4. [Course System](#course-system)
5. [Course Architecture & Isolation](#course-architecture--isolation)
6. [Development Guide](#development-guide)
7. [Maintenance & Fixes](#maintenance--fixes)

---

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 (React 19), TypeScript, Tailwind 4
- **State**: Zustand 5
- **Backend**: Firebase (Firestore + Auth)
- **PWA**: Custom service worker for offline support

---

## Auth

### Overview
App uses **Firebase Authentication** with support for:
- Email/password authentication
- Google Sign-In (OAuth)

### AuthContext (`src/contexts/AuthContext.tsx`)
Main authentication provider that wraps the entire app.

**Interface:**
```typescript
interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}
```

**Usage:**
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { currentUser, login, loginWithGoogle, logout } = useAuth();
  
  // currentUser is null when not authenticated
  // currentUser is User object when authenticated
}
```

### Authentication Flow

#### Email/Password Signup:
1. User fills signup form (`SignupPage.tsx`)
2. Calls `signup(email, password, displayName)`
3. Firebase creates account
4. Optional display name is set via `updateProfile()`
5. User automatically logged in
6. `AuthWrapper` switches to main app view

#### Email/Password Login:
1. User fills login form (`LoginPage.tsx`)
2. Calls `login(email, password)`
3. Firebase validates credentials
4. User logged in
5. `AuthWrapper` switches to main app view

#### Google Sign-In:
1. User clicks Google button (in `WelcomeScreen`, `LoginPage`, or `SignupPage`)
2. Calls `loginWithGoogle()`
3. Opens Google OAuth popup via `signInWithPopup()`
4. User selects Google account
5. Firebase handles authentication
6. User logged in (creates account if new user)
7. `AuthWrapper` switches to main app view

### Components

#### AuthWrapper (`src/components/AuthWrapper.tsx`)
Orchestrates the authentication flow. Shows:
- `WelcomeScreen` when not authenticated
- `LoginPage` or `SignupPage` when user chooses auth method
- `LearnTab` when authenticated

#### WelcomeScreen (`src/components/auth/WelcomeScreen.tsx`)
Landing page with authentication options:
- **Primary**: "Continue with Google" button
- **Secondary**: "Sign Up with Email" and "Sign In with Email"

#### GoogleSignInButton Component
Isolated, reusable Google sign-in button with its own CSS.

**Location**: `src/components/GoogleSignInButton/`

**Usage:**
```tsx
import GoogleSignInButton from '@/components/GoogleSignInButton/GoogleSignInButton';

<GoogleSignInButton 
  onClick={handleGoogleSignIn}
  disabled={loading}
>
  Continue with Google
</GoogleSignInButton>
```

**Styling**: Self-contained in `GoogleSignInButton.css` (not in global styles)

### Firebase Configuration
Required environment variables in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

**Firebase Console Setup:**
1. Enable Email/Password provider
2. Enable Google provider
3. Add authorized domains

---

## Database Structure

### Firestore Collections

#### `/courses/{courseId}` - Course Definitions
```typescript
interface CourseDefinition {
  id: string;                    // e.g., "1", "2", ...
  title: string;                 // "Georgian Alphabet"
  description: string;
  type: 'flashcards' | 'phrases' | 'words';
  isActive: boolean;
  totalItems: number;
  estimatedTime: number;         // minutes
  prerequisites: string[];       // required course IDs
  icon: string;                  // icon path
  version: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `/courses/{courseId}/items/{itemId}` - Course Content
**Base interface (all items):**
```typescript
interface BaseCourseItem {
  id: string;                    // "1", "2", "3", ...
  order: number;                 // display order
}
```

**Alphabet items:**
```typescript
interface AlphabetItem extends BaseCourseItem {
  character: string;             // "ა"
  name: string;                  // "ani"
  pronunciation: string;         // "/a/"
  audioUrl?: string;
}
```

**Number items:**
```typescript
interface NumberItem extends BaseCourseItem {
  number: number;                // 1, 2, 3
  translation: string;           // "ერთი"
  translationLatin: string;      // "erti"
}
```

**Phrase items:**
```typescript
interface PhraseItem extends BaseCourseItem {
  english: string;               // "hello"
  georgian: string;              // "გამარჯობა"
  latin: string;                 // "gamarjoba"
  category?: string;
  audioUrl?: string;
}
```

#### `/users/{userId}/progress/{courseId}` - User Progress
```typescript
interface UserProgress {
  courseId: string;
  userId: string;
  learnedItems: number[];        // array of learned item IDs
  totalItems: number;
  completionPercentage: number;  // 0-100
  lastUpdated: Timestamp;
  streakDays: number;
  totalTimeSpent: number;        // minutes
  startedAt: Timestamp;
}
```

#### `/users/{userId}/detailed-progress/{courseId}/items/{itemId}` - Detailed Progress
```typescript
interface DetailedItemProgress {
  itemId: string;
  courseId: string;
  userId: string;
  isLearned: boolean;
  attempts: number;
  correctAttempts: number;
  lastReviewed: Timestamp;
  notes?: string;
}
```

### Security Rules
```javascript
// Course content - readable by all, writable by authenticated users
match /courses/{courseId} {
  allow read: if true;
  allow write: if request.auth != null;
  
  match /items/{itemId} {
    allow read: if true;
    allow write: if request.auth != null;
  }
}

// User data - only accessible by the user themselves
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  
  match /{document=**} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
}
```

---

## Course System

### Course Configuration
Courses are defined in `src/constants/courseData.ts`:

```typescript
interface CourseConfig {
  id: string;                    // unique identifier
  title: string;                 // display name
  description: string;
  prerequisites: string[];       // required course IDs
  icon: string;                  // icon path
  estimatedTime: number;         // minutes
  order: number;                 // display order
  route: string;                 // URL route
}
```

### Memory System
The app uses **spaced repetition** for learning:

```typescript
interface PhraseAdvancedMemory {
  correctAnswers: number;        // consecutive correct answers
  isLearned: boolean;            // true when correctAnswers >= 3
}
```

**Learning Rules:**
- **New**: 0 correct answers
- **Learning**: 1-2 correct answers
- **Learned**: 3+ correct answers (marked as mastered)
- **Review**: Wrong answer decrements count

### Progress Store (Zustand)
Global state for user progress across all courses:

```typescript
interface ProgressState {
  courses: Record<string, CourseProgress>;
  getCompletionPercentage: (courseId: string, total: number) => number;
  addLearnedItem: (courseId: string, itemId: string) => void;
  initializeCourse: (courseId: string, totalItems: number) => void;
  getLearnedCount: (courseId: string) => number;
}
```

**Persistence:**
- Local: Zustand with localStorage persistence
- Cloud: Firebase Firestore (synced when authenticated)

### Course Flow
1. User selects course from `LearnTab`
2. Course intro page shows progress and description
3. User clicks "Start Learning"
4. Course gameplay begins with interactive components
5. User interacts with flashcards or phrase construction
6. Memory system tracks answers
7. Progress updates in Zustand store
8. Progress syncs to Firebase
9. Session ends with completion screen

---

## Course Architecture & Isolation

### Overview
**All courses in the application are completely isolated from each other.** Each course has its own dedicated `page.tsx` file containing all course-specific logic, state management, and gameplay mechanics. This architecture allows each course to evolve independently without affecting others.

### Design Philosophy
- **Independence**: Modify one course without affecting others
- **Clarity**: All course logic in one file
- **Flexibility**: Different courses can have completely different mechanics
- **No shared course logic**: Only UI components and utilities are shared

### Course Categories

#### 1. Flashcard-based Courses (3 courses)
- **Alphabet** (`/app/learn/1/page.tsx`)
- **Numbers** (`/app/(courses)/numbers/page.tsx`)
- **Words** (`/app/(courses)/words/page.tsx`)
- **Gameplay**: Flip cards to learn individual items with "Mark as Learned" confirmation

#### 2. Phrase Construction Courses (11 courses)
All phrase courses use sentence construction gameplay where users build Georgian sentences by selecting words in correct order:

- **Restaurant** (`/restaurant`) - `phrases-restaurant`
- **Travel** (`/travel`) - `phrases-travel`
- **Medical** (`/medical`) - `phrases-medical`
- **Emergency** (`/emergency`) - `phrases-emergency`
- **Family** (`/family`) - `phrases-family`
- **Business** (`/business`) - `phrases-business`
- **Directions** (`/directions`) - `phrases-directions`
- **Shopping** (`/shopping`) - `phrases-shopping`
- **Culture** (`/culture`) - `phrases-culture`
- **Weather** (`/weather`) - `phrases-weather`
- **Phrases Advanced** (`/phrases-2`) - `phrases-2`

### Course File Structure

Every course's `page.tsx` contains:

#### 1. Configuration Constants
```typescript
const COURSE_ID = 'phrases-restaurant';      // Unique identifier for Firebase
const COURSE_TITLE = 'Restaurant & Food';    // Display name
const COURSE_DESCRIPTION = 'Georgian phrases for dining...'; // Intro description
```

#### 2. Inline Gameplay Component
Each course defines its own gameplay component (e.g., `PhraseComponent`, `FlashcardLetter`). For phrase courses, this includes:
- Word selection and sentence construction logic
- Answer validation
- Memory progress display (3-dot system)
- Correct/incorrect feedback

#### 3. State Management
```typescript
// Progress tracking
const [learnedItems, setLearnedItems] = useState<number[]>([]);
const [itemsMemory, setItemsMemory] = useState<Record<number, Memory>>({});
const [isInitialized, setIsInitialized] = useState(false);

// Gameplay flow
const [isGameplayActive, setIsGameplayActive] = useState(false);
const [processedItems, setProcessedItems] = useState<number[]>([]);
const [itemsToReview, setItemsToReview] = useState<Item[]>([]);
const [allCardsReviewed, setAllCardsReviewed] = useState(false);
```

#### 4. Business Logic Functions
Each course implements its own:
- `startGameplay()` - Initialize learning session
- `resetGameplay()` - Return to intro screen  
- `handleCorrectAnswer()` - Process correct answers (phrase courses)
- `handleWrongAnswer()` - Process incorrect answers (phrase courses)
- `markAsLearned()` - Mark item as learned (flashcard courses)
- `markAsToReview()` - Mark item as reviewed

#### 5. Three-Screen Flow
All courses follow this pattern:
1. **Intro Screen** - Progress stats, description, "Start learning" button
2. **Gameplay Screen** - Active learning experience
3. **Completion Screen** - Session summary with options to continue or go back

### What's Shared vs Isolated

#### ✅ Shared (Acceptable)

**UI Components:**
- `PageTransition` - Animation wrapper
- `CoursePageLoading` - Loading state
- `ErrorState` - Error display
- `AppHeader` - Navigation header
- `PageLayout` - Page structure
- `ContentContainer` - Content wrapper
- `ProgressBar` - Progress indicator
- `ConfirmationDialog` - Confirmation dialogs
- `SuccessModal` - Success messages
- Standard Next.js components (`Image`, `Link`)

**Utilities & Services:**
- `useBackToHomeNavigation()` - Navigation hook
- `useProgressStore()` - Progress state management
- `useAuth()` - Authentication state
- `usePhrasesCourse(id)` / `useAlphabet()` / `useNumbers()` / `useWords()` - Data fetching
- `MemoryProgressService` - Firebase progress sync
- `shuffleArray()` - Array randomization
- `processGeorgianSentence()` - Text processing for phrases
- `normalizeForComparison()` - Text normalization for validation

**Styles:**
- Shared CSS files like `PhraseAdvancedComponent.css` (imported in each phrase course)
- Global Tailwind styles

#### ❌ NOT Shared (Isolated)

- Course-specific components (each course has its own inline components)
- Course gameplay logic (each course manages its own gameplay)
- Course state management (embedded in each course)
- Course business logic functions


### Best Practices

1. **Keep courses self-contained** - All course-specific logic should be in the course's `page.tsx`
2. **Use shared UI components** - Reuse UI components but not course-specific logic
3. **Maintain consistent patterns** - Use similar structure across courses for maintainability
4. **Test independently** - Each course should work independently
5. **Document unique features** - If a course has unique mechanics, document them in the course file
6. **Import required styles** - For phrase courses, import `PhraseAdvancedComponent.css`



### Adding a New Course

1. **Define course in `constants/courseData.ts`:**
```typescript
{
  id: 'phrases-hobbies',
  title: 'Hobbies & Interests',
  description: 'Talk about hobbies in Georgian',
  prerequisites: ['phrases-1'],
  icon: '/images/icon-hobbies.svg',
  estimatedTime: 25,
  order: 16,
  route: '/hobbies'
}
```

2. **Add sample data (same file):**
```typescript
'phrases-hobbies': [
  { 
    id: "1", 
    english: "What are your hobbies?", 
    georgian: "რა გაქვთ ჰობი?",
    latin: "ra gaqvt hobi?",
    order: 1
  },
  // ... more phrases
]
```

3. **Create route at `app/(courses)/hobbies/page.tsx`:**
```tsx
import { GenericCourse } from '@/features/course/components/GenericCourse';

export default function HobbiesPage() {
  return (
    <GenericCourse 
      courseId="phrases-hobbies"
      courseTitle="Hobbies & Interests"
      courseDescription="Talk about hobbies in Georgian"
    />
  );
}
```

### Adding Google Sign-In to a New Component

```tsx
import { useAuth } from '@/contexts/AuthContext';
import GoogleSignInButton from '@/components/GoogleSignInButton/GoogleSignInButton';

function MyComponent() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      // User is now authenticated
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Pop-up blocked');
      } else {
        setError('Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleSignInButton 
      onClick={handleGoogleSignIn}
      disabled={loading}
    />
  );
}
```

### Code Organization Principles
1. **Feature-first**: Organize by feature, not file type
2. **Component composition**: Build complex UIs from simple components
3. **Custom hooks**: Extract reusable logic
4. **Type safety**: Use TypeScript for everything
5. **Isolated styles**: Component-specific CSS in component folders (like GoogleSignInButton)

### Key Files to Understand
- `src/app/layout.tsx` - App root with AuthProvider
- `src/contexts/AuthContext.tsx` - Authentication logic
- `src/components/AuthWrapper.tsx` - Auth flow orchestration
- `src/components/LearnTab.tsx` - Main course list
- `src/features/course/components/GenericCourse.tsx` - Course container
- `src/hooks/course/useCourseMemory.tsx` - Learning memory system
- `src/stores/progressStore.ts` - Global progress state
- `src/constants/courseData.ts` - All course configurations


---

## Common Patterns

### Fetching User Progress
```tsx
import { useProgressStore } from '@/stores/progressStore';

function MyCourse() {
  const { getCompletionPercentage, addLearnedItem } = useProgressStore();
  
  const completion = getCompletionPercentage('alphabet', 33);
  // Returns 0-100
}
```

### Handling Authentication State
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <WelcomeScreen />;
  
  return <AuthenticatedContent />;
}
```

### Using Course Memory Hook
```tsx
import { useCourseMemory } from '@/hooks/course/useCourseMemory';

function CoursePage() {
  const {
    phrases,              // all course items
    phrasesLoading,       // loading state
    learnedPhrases,       // items user has mastered
    phrasesMemory,        // memory data per item
    handleCorrectAnswer,  // mark answer as correct
    handleWrongAnswer     // mark answer as wrong
  } = useCourseMemory('phrases-family');
}
```