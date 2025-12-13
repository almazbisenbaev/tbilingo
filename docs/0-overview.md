## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 16 (React 19), TypeScript, Tailwind 4
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
1. User fills signup form (`SignupView` in `src/app/learn/page.tsx`)
2. Calls `signup(email, password, displayName)`
3. Firebase creates account
4. Optional display name is set via `updateProfile()`
5. User automatically logged in
6. `LearnApp` (in `src/app/learn/page.tsx`) re-renders based on `currentUser`

#### Email/Password Login:
1. User fills login form (`LoginView` in `src/app/learn/page.tsx`)
2. Calls `login(email, password)`
3. Firebase validates credentials
4. User logged in
5. `LearnApp` (in `src/app/learn/page.tsx`) re-renders based on `currentUser`

#### Google Sign-In:
1. User clicks Google button (in `AuthView`, `LoginView`, or `SignupView` in `src/app/learn/page.tsx`)
2. Calls `loginWithGoogle()`
3. Opens Google OAuth popup via `signInWithPopup()`
4. User selects Google account
5. Firebase handles authentication
6. User logged in (creates account if new user)
7. `LearnApp` (in `src/app/learn/page.tsx`) re-renders based on `currentUser`

### Components

#### Auth Views (`src/app/learn/page.tsx`)
Auth UI is implemented as in-file components:
- `AuthView` (initial unauthenticated screen)
- `LoginView`
- `SignupView`

The authenticated experience is `LearnApp` which renders tab content (learn/settings) and the tab bar.

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

---

## Course Architecture & Isolation

### Overview
Each course has its own dedicated `page.tsx` file containing the course-specific orchestration, state management, and gameplay flow. This architecture allows each course to evolve independently, while still reusing shared UI building blocks.

### Design Philosophy
- **Independence**: Modify one course without affecting others
- **Clarity**: All course logic in one file
- **Flexibility**: Different courses can have completely different mechanics
- **Minimal shared course logic**: Prefer sharing UI components and small utilities, while keeping course orchestration inside the course page

### Levels

Levels can be of 4 types: 'characters', 'numbers', 'words', 'phrases'

#### characters
Flip cards to learn individual items with "Mark as Learned" confirmation

#### numbers
Flip cards to learn individual items with "Mark as Learned" confirmation

#### words
Flip cards to learn individual items with "Mark as Learned" confirmation

#### phrases
Use sentence construction gameplay where users build Georgian sentences by selecting words in correct order

### Levels
- **Alphabet** (`src/app/learn/1/page.tsx`)
- **Numbers** (`src/app/learn/2/page.tsx`)
- **Basic Words** (`src/app/learn/3/page.tsx`)
- **Essential Phrases** (`src/app/learn/4/page.tsx`)
- **Business Georgian / Business & Work** (`src/app/learn/5/page.tsx`)


### What's Shared vs Isolated

#### ✅ Shared (Acceptable)

**UI Components:**
- `ErrorState` - Error display
- `AppHeader` - Navigation header
- `LoadingScreen` - Full-screen loading state
- `ProgressBar` - Progress indicator
- `ConfirmationDialog` - Confirmation dialogs
- `SuccessModal` - Success messages
- `GoogleSignInButton` - Reusable Google sign-in button
- `TabBar` and `AnimatedTabContent` - Tab navigation
- `LevelLink` - Course/level list item
- Standard Next.js components (`Image`, `Link`)

**Learning UI Components:**
- `FlashcardLetter`, `FlashcardNumber`, `FlashcardWord`
- `SentenceForm`

#### ❌ NOT Shared (Isolated)

- Course gameplay logic (each course manages its own gameplay)
- Course state management (embedded in each course)
- Course business logic functions


### Best Practices

1. **Keep courses self-contained** - All course-specific logic should be in the course's `page.tsx`
2. **Use shared UI components** - Reuse UI components but not course-specific logic
3. **Maintain consistent patterns** - Use similar structure across courses for maintainability
4. **Test independently** - Each course should work independently
5. **Document unique features** - If a course has unique mechanics, document them in the course file


### Code Organization Principles
1. **Feature-first**: Organize by feature, not file type
2. **Component composition**: Build complex UIs from simple components
3. **Isolated styles**: Component-specific CSS in component folders (like GoogleSignInButton)

### Key Files to Understand
- `src/app/layout.tsx` - App root with AuthProvider
- `src/contexts/AuthContext.tsx` - Authentication logic
- `src/app/learn/page.tsx` - Main authenticated app (tabs) + unauthenticated auth UI
- `src/app/learn/<levelId>/page.tsx` - Individual course pages (isolated logic)
- `src/types/index.ts` - Core data interfaces
