## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 (React 19), TypeScript, Tailwind 4
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
1. User clicks Google button (in `AuthScreen`, `LoginPage`, or `SignupPage`)
2. Calls `loginWithGoogle()`
3. Opens Google OAuth popup via `signInWithPopup()`
4. User selects Google account
5. Firebase handles authentication
6. User logged in (creates account if new user)
7. `AuthWrapper` switches to main app view

### Components

#### AuthWrapper (`src/components/AuthWrapper.tsx`)
Orchestrates the authentication flow. Shows:
- `AuthScreen` when not authenticated
- `LoginPage` or `SignupPage` when user chooses auth method
- `LearnTab` when authenticated

#### AuthScreen (`src/components/welcome-screen/welcome-screen.tsx`)
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
**All courses in the application are completely isolated from each other.** Each course has its own dedicated `page.tsx` file containing all course-specific logic, state management, and gameplay mechanics. This architecture allows each course to evolve independently without affecting others.

### Design Philosophy
- **Independence**: Modify one course without affecting others
- **Clarity**: All course logic in one file
- **Flexibility**: Different courses can have completely different mechanics
- **No shared course logic**: Only UI components and utilities are shared

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
- **Alphabet** (`/app/learn/1/page.tsx`)
- **Numbers** (`/app/learn/2/page.tsx`)
- **Basic Words** (`/app/learn/3/page.tsx`)
- **Essential Phrases** (`/app/learn/4/page.tsx`)


### What's Shared vs Isolated

#### ✅ Shared (Acceptable)

**UI Components:**
- `PageTransition` - Animation wrapper
- `ErrorState` - Error display
- `AppHeader` - Navigation header
- `PageLayout` - Page structure
- `ContentContainer` - Content wrapper
- `ProgressBar` - Progress indicator
- `ConfirmationDialog` - Confirmation dialogs
- `SuccessModal` - Success messages
- Standard Next.js components (`Image`, `Link`)

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


### Code Organization Principles
1. **Feature-first**: Organize by feature, not file type
2. **Component composition**: Build complex UIs from simple components
3. **Isolated styles**: Component-specific CSS in component folders (like GoogleSignInButton)

### Key Files to Understand
- `src/app/layout.tsx` - App root with AuthProvider
- `src/contexts/AuthContext.tsx` - Authentication logic
- `src/components/AuthWrapper.tsx` - Auth flow orchestration
- `src/components/screens/LearnTab.tsx` - Main course list
- `src/app/learn/[id]/page.tsx` - Individual course pages (isolated logic)
- `src/types/index.ts` - Core data interfaces
