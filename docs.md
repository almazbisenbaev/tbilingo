## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Authentication System](#authentication-system)
3. [Database Structure](#database-structure)
4. [Course System](#course-system)
5. [Development Guide](#development-guide)

---

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 (React 19), TypeScript, Tailwind 4
- **State**: Zustand 5
- **Backend**: Firebase (Firestore + Auth)
- **PWA**: Custom service worker for offline support

### Project Structure
```
src/
├── app/                      # Next.js App Router
│   ├── (courses)/           # Course routes (alphabet, numbers, phrases, etc.)
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── auth/                # Authentication UI
│   ├── course/              # Course-specific components
│   ├── common/              # Shared components
│   └── GoogleSignInButton/  # Google auth button (isolated CSS)
├── contexts/                # React contexts (AuthContext)
├── stores/                  # Zustand stores (progress, settings)
├── services/                # Firebase services
├── hooks/                   # Custom React hooks
├── constants/               # App configuration & course data
└── utils/                   # Helper functions
```

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
  id: string;                    // e.g., "alphabet", "numbers"
  title: string;                 // "Georgian Alphabet"
  description: string;
  type: 'alphabet' | 'numbers' | 'phrases' | 'words';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  totalItems: number;
  estimatedTime: number;         // minutes
  prerequisites: string[];       // required course IDs
  tags: string[];
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
  difficultyRating?: number;     // 1-5
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
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];       // required course IDs
  tags: string[];
  icon: string;                  // icon path
  estimatedTime: number;         // minutes
  order: number;                 // display order
  route: string;                 // URL route
}
```

### Available Courses
- `alphabet` - Georgian Alphabet (33 letters)
- `numbers` - Numbers 1-100+
- `words` - Basic vocabulary
- `phrases-2` - Advanced phrases
- Situational courses: `business`, `culture`, `directions`, `emergency`, `family`, `medical`, `restaurant`, `shopping`, `travel`, `weather`

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
2. `CourseIntro` shows progress and description
3. User clicks "Start Learning"
4. `GenericCourse` component handles learning session
5. User interacts with flashcards
6. `useCourseMemory` hook tracks answers and memory
7. Progress updates in Zustand store
8. Progress syncs to Firebase
9. Session ends with `CourseCompletion` screen

---

## Development Guide

### Setup

1. **Clone & Install:**
```bash
git clone https://github.com/almazbisenbaev/tbilingo.git
cd tbilingo
npm install
```

2. **Environment Setup:**
Create `.env.local` with Firebase config (see Firebase Configuration section above)

3. **Run Development Server:**
```bash
npm run dev       # starts on http://localhost:3000
```

### Commands
```bash
npm run dev            # development server
npm run build          # production build
npm run start          # run production build
npm run lint           # ESLint
npm run update-version # update app version
```

### Adding a New Course

1. **Define course in `constants/courseData.ts`:**
```typescript
{
  id: 'phrases-hobbies',
  title: 'Hobbies & Interests',
  description: 'Talk about hobbies in Georgian',
  difficulty: 'beginner',
  prerequisites: ['phrases-1'],
  tags: ['hobbies', 'conversation'],
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

### Deployment

**Vercel (Recommended):**
1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy (automatic on push to main branch)

**Build Optimization:**
- Automatic code splitting (Next.js)
- Image optimization (Next.js Sharp)
- PWA with service worker for offline support
- Static generation where possible

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

---

## Troubleshooting

### Google Sign-In Issues
- **Popup blocked**: User needs to allow popups in browser settings
- **OAuth error**: Check Firebase Console authorized domains
- **CORS error**: Add domain to Firebase authorized domains

### Progress Not Syncing
- Check if user is authenticated (`currentUser` not null)
- Verify Firestore security rules allow user writes
- Check browser console for Firebase errors

### Course Not Loading
- Verify course exists in `constants/courseData.ts`
- Check if route matches course configuration
- Ensure course items have proper structure (id, order fields)

---

This documentation covers the core systems. For specific implementation details, refer to the source code and inline comments.
