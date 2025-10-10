# Tbilingo - Georgian Language Learning App

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [Technology Stack](#technology-stack)
6. [Routes & Navigation](#routes--navigation)
7. [Components Guide](#components-guide)
8. [State Management](#state-management)
9. [Data Flow](#data-flow)
10. [Course System](#course-system)
11. [Authentication](#authentication)
12. [Development Guide](#development-guide)
13. [Deployment](#deployment)

## 🎯 Overview

Tbilingo is a Progressive Web App (PWA) designed to help users learn the Georgian language through interactive flashcards and phrase-based learning. The app focuses on practical Georgian language skills including alphabet, numbers, basic phrases, and situational conversations.

### Key Features
- **Interactive Learning**: Flashcard-based learning system with spaced repetition
- **Progressive Difficulty**: Courses ranging from alphabet to advanced phrases
- **Memory System**: Intelligent tracking of user progress and retention
- **Offline Support**: PWA capabilities for offline learning
- **Mobile-First**: Responsive design optimized for mobile devices
- **User Progress**: Authentication and cloud-based progress tracking

## 🏗️ Architecture

Tbilingo follows a modern React/Next.js architecture with clear separation of concerns:

### Frontend Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Presentation  │ ── │   Business Logic │ ── │   Data Layer    │
│   (Components)  │    │    (Hooks/Store) │    │ (Firebase/API)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Component Architecture
- **Layout Components**: Reusable UI structure (headers, containers, layouts)
- **Feature Components**: Domain-specific components (course, auth)
- **Common Components**: Shared utilities (loading, error states)
- **UI Components**: Basic interactive elements (buttons, dialogs)

### State Architecture
- **Global State**: Zustand for progress tracking and app settings
- **Local State**: React hooks for component-specific state
- **Server State**: Firebase for user data and course content
- **URL State**: Next.js routing for navigation state

## 📁 Project Structure

```
tbilingo/
├── public/                           # Static assets
│   ├── images/                       # Icons, illustrations
│   ├── audio/                        # Pronunciation files
│   ├── manifest.json                 # PWA manifest
│   └── sw.js                         # Service worker
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (courses)/               # Course routes group
│   │   │   ├── alphabet/            # Alphabet course
│   │   │   ├── business/            # Business phrases
│   │   │   ├── culture/             # Cultural phrases
│   │   │   ├── directions/          # Navigation phrases
│   │   │   ├── emergency/           # Emergency phrases
│   │   │   ├── family/              # Family phrases
│   │   │   ├── medical/             # Medical phrases
│   │   │   ├── numbers/             # Numbers course
│   │   │   ├── phrases-2/           # Advanced phrases
│   │   │   ├── restaurant/          # Dining phrases
│   │   │   ├── shopping/            # Shopping phrases
│   │   │   ├── travel/              # Travel phrases
│   │   │   ├── weather/             # Weather phrases
│   │   │   └── words/               # Word course
│   │   ├── migrate/                 # Data migration
│   │   ├── globals.css              # Global styles
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Home page
│   ├── components/                   # React components
│   │   ├── layout/                  # Layout components
│   │   │   ├── AppHeader.tsx        # Navigation header
│   │   │   ├── PageLayout.tsx       # Page wrapper
│   │   │   └── ContentContainer.tsx # Content wrapper
│   │   ├── common/                  # Common UI components
│   │   │   ├── LoadingSpinner.tsx   # Loading indicator
│   │   │   ├── LoadingScreen.tsx    # Full-screen loading
│   │   │   ├── ErrorState.tsx       # Error display
│   │   │   └── ProgressStats.tsx    # Progress information
│   │   ├── course/                  # Course-specific components
│   │   │   ├── PhraseCourseItem.tsx # Course list item
│   │   │   ├── CourseIntro.tsx      # Course introduction
│   │   │   └── CourseCompletion.tsx # Course completion
│   │   ├── auth/                    # Authentication components
│   │   │   └── WelcomeScreen.tsx    # Welcome/auth screen
│   │   ├── ui/                      # Basic UI components
│   │   │   ├── button.tsx           # Button component
│   │   │   └── dialog.tsx           # Modal component
│   │   └── [legacy]/                # Existing components
│   ├── features/                     # Feature-based organization
│   │   └── course/                  # Course feature
│   │       └── components/          # Course components
│   │           └── GenericCourse.tsx # Reusable course container
│   ├── hooks/                       # Custom React hooks
│   │   ├── course/                  # Course-specific hooks
│   │   │   └── useCourseMemory.tsx  # Memory management
│   │   └── useEnhancedLearningContent.ts # Content hooks
│   ├── contexts/                    # React contexts
│   │   └── AuthContext.tsx          # Authentication context
│   ├── stores/                      # State management
│   │   ├── progressStore.ts         # Progress tracking
│   │   └── fontTypeStore.ts         # UI preferences
│   ├── services/                    # External services
│   │   ├── enhancedFirebase.ts      # Firebase operations
│   │   ├── memoryProgressService.ts # Memory tracking
│   │   └── simpleUserProgress.ts    # Progress service
│   ├── constants/                   # App constants
│   │   ├── courseData.ts            # Course configurations
│   │   └── index.ts                 # Shared constants
│   ├── types/                       # TypeScript types
│   │   └── index.ts                 # Type definitions
│   └── utils/                       # Utility functions
│       ├── georgian-text-utils.ts   # Georgian text processing
│       ├── pwa-utils.ts             # PWA utilities
│       ├── shuffle-array.ts         # Array shuffling
│       └── useBackButtonHandler.ts  # Navigation handling
├── scripts/                         # Build scripts
│   └── update-version.js            # Version management
├── components.json                  # Shadcn/ui config
├── DATABASE_STRUCTURE.md            # Database documentation
├── next.config.ts                   # Next.js configuration
├── package.json                     # Dependencies
├── tailwind.config.js               # Tailwind CSS config
└── tsconfig.json                    # TypeScript config
```

## ✨ Features

### Core Learning Features
1. **Alphabet Course**: Learn Georgian script with flashcards
2. **Numbers Course**: Master Georgian numbers 1-100+
3. **Phrase Courses**: Situational conversations and common phrases
4. **Word Learning**: Vocabulary building with translations
5. **Memory System**: Spaced repetition for better retention

### User Experience Features
1. **Progress Tracking**: Visual progress indicators and statistics
2. **Offline Learning**: PWA support for offline access
3. **Responsive Design**: Works on all device sizes
4. **Authentication**: User accounts with cloud sync
5. **Customizable Settings**: Font preferences and display options

### Technical Features
1. **Server-Side Rendering**: Next.js for optimal performance
2. **Type Safety**: Full TypeScript implementation
3. **State Management**: Zustand for efficient state handling
4. **Firebase Integration**: Real-time database and auth
5. **PWA Capabilities**: Install-able app experience

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.3.4 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5.0.6
- **UI Components**: Radix UI, Headless UI
- **Animations**: Framer Motion 12.23.22

### Backend & Services
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Vercel (recommended)
- **Analytics**: Vercel Analytics, Google Analytics

### Development Tools
- **Build Tool**: Next.js built-in
- **Linting**: ESLint 9
- **Package Manager**: npm/yarn
- **Version Control**: Git

### PWA Features
- **Service Worker**: Custom SW for offline caching
- **Manifest**: Web app manifest for installation
- **Caching Strategy**: Static assets and dynamic content caching

## 🗺️ Routes & Navigation

### Public Routes
- `/` - Home page with course selection
- `/alphabet` - Georgian alphabet course
- `/numbers` - Numbers learning course
- `/words` - Basic vocabulary course

### Course Routes (phrases-*)
- `/phrases-2` - Advanced phrases
- `/business` - Business Georgian
- `/culture` - Cultural phrases
- `/directions` - Navigation and directions
- `/emergency` - Emergency situations
- `/family` - Family and relationships
- `/medical` - Health and medical
- `/restaurant` - Dining and food
- `/shopping` - Shopping and markets
- `/travel` - Travel and tourism
- `/weather` - Weather and seasons

### Utility Routes
- `/migrate` - Data migration and setup

### Route Groups
```
app/
├── (courses)/          # Course routes group
│   └── [course]/      # Dynamic course pages
├── migrate/           # Utility routes
└── page.tsx          # Root page
```

## 🧩 Components Guide

### Layout Components

#### AppHeader
Reusable navigation header component.
```tsx
<AppHeader 
  title="Course Title"
  showBackButton={true}
  backHref="/"
  onBackClick={() => {}}
  rightContent={<SomeComponent />}
/>
```

#### PageLayout
Standard page wrapper for consistent layout.
```tsx
<PageLayout className="custom-class">
  {children}
</PageLayout>
```

#### ContentContainer
Content wrapper with responsive max-width.
```tsx
<ContentContainer maxWidth="2xl">
  {content}
</ContentContainer>
```

### Common Components

#### LoadingScreen
Full-screen loading state.
```tsx
<LoadingScreen message="Loading course..." />
```

#### ErrorState
Error display with retry options.
```tsx
<ErrorState 
  title="Something went wrong"
  message="Error details here"
  actionText="Go Home"
  actionHref="/"
  showRetry={true}
/>
```

#### ProgressStats
Display learning progress statistics.
```tsx
<ProgressStats 
  completed={5}
  total={10}
  label="Learned"
/>
```

### Course Components

#### GenericCourse
Main course container handling the complete learning flow.
```tsx
<GenericCourse 
  courseId="phrases-family"
  courseTitle="Family & Relationships"
  courseDescription="Learn family-related Georgian phrases"
/>
```

#### CourseIntro
Course introduction and statistics page.
```tsx
<CourseIntro 
  title="Course Title"
  description="Course description"
  completed={5}
  total={20}
  onStartLearning={() => {}}
/>
```

#### CourseCompletion
Session completion celebration page.
```tsx
<CourseCompletion 
  learnedCount={15}
  totalCount={20}
  sessionLearnedCount={3}
  onContinue={() => {}}
  onGoBack={() => {}}
/>
```

### Feature Components

#### PhraseCourseItem
Individual course item in the course list.
```tsx
<PhraseCourseItem 
  course={courseConfig}
  getCompletionPercentage={getCompletionPercentage}
  initializeCourse={initializeCourse}
/>
```

## 🗃️ State Management

### Global State (Zustand)

#### Progress Store
Manages user learning progress across all courses.

```typescript
interface ProgressState {
  courses: Record<string, CourseProgress>;
  getCompletionPercentage: (courseId: string, total: number) => number;
  addLearnedItem: (courseId: string, itemId: string) => void;
  initializeCourse: (courseId: string, totalItems: number) => void;
  getLearnedCount: (courseId: string) => number;
}
```

Key Methods:
- `getCompletionPercentage(courseId, total)` - Calculate completion percentage
- `addLearnedItem(courseId, itemId)` - Mark item as learned
- `initializeCourse(courseId, totalItems)` - Initialize course progress
- `getLearnedCount(courseId)` - Get number of learned items

#### Font Type Store
Manages UI preferences like font settings.

```typescript
interface FontTypeState {
  fontType: 'georgian' | 'latin';
  setFontType: (type: 'georgian' | 'latin') => void;
}
```

### Local State Patterns

#### Course Memory Management
```typescript
const {
  phrases,
  phrasesLoading,
  learnedPhrases,
  phrasesMemory,
  handleCorrectAnswer,
  handleWrongAnswer
} = useCourseMemory(courseId);
```

#### Gameplay State Management
```typescript
const {
  isGameplayActive,
  processedPhrases,
  phrasesToReview,
  allCardsReviewed,
  startGameplay,
  resetGameplay,
  markAsToReview
} = useCourseGameplay(courseId, phrases);
```

## 🔄 Data Flow

### Learning Session Flow
```
1. User selects course
2. CourseIntro displays progress
3. startGameplay() initializes session
4. GenericCourse renders learning interface
5. User interacts with flashcards
6. Memory system updates progress
7. Session completes or user exits
8. Progress syncs to Firebase
```

### Progress Tracking Flow
```
Local Interaction → Memory Hook → Progress Store → Firebase Sync
                                       ↓
                           UI Updates ← State Change
```

### Authentication Flow
```
App Load → AuthContext → Firebase Auth → User State → UI Update
```

## 🎓 Course System

### Course Types

#### Alphabet Course
- Character-based learning
- Georgian script and pronunciation
- Audio support for proper pronunciation

#### Numbers Course
- Number recognition and pronunciation
- Categories: basic, teens, decades, hundreds
- Progressive difficulty

#### Phrase Courses
- Situational conversations
- Grammar patterns
- Real-world usage examples

#### Words Course
- Vocabulary building
- Translation pairs
- Usage examples and context

### Course Configuration

Each course is defined in `constants/courseData.ts`:

```typescript
interface CourseConfig {
  id: string;                    // Unique identifier
  title: string;                 // Display name
  description: string;           // Course description
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];       // Required courses
  tags: string[];               // Category tags
  icon: string;                 // Icon path
  estimatedTime: number;        // Minutes to complete
  order: number;                // Display order
  route: string;                // URL route
}
```

### Memory System

The app uses a spaced repetition system:

```typescript
interface PhraseAdvancedMemory {
  correctAnswers: number;        // Consecutive correct answers
  isLearned: boolean;           // Mastery status (3+ correct)
}
```

#### Memory Rules
- **New Item**: 0 correct answers
- **Learning**: 1-2 correct answers
- **Learned**: 3+ correct answers
- **Review**: Incorrect answer decrements count

### Progress Persistence

Progress is stored in two places:
1. **Local Storage**: Zustand persistence for offline access
2. **Firebase**: Cloud sync for cross-device access

## 🔐 Authentication

### Auth Provider
The `AuthContext` manages user authentication state:

```typescript
interface AuthContextType {
  currentUser: User | null | undefined;
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  loading: boolean;
}
```

### Auth States
- `undefined`: Loading/initializing
- `null`: Not authenticated
- `User object`: Authenticated

### Protected Features
- Progress sync across devices
- Course completion tracking
- Memory system persistence

## 🔧 Development Guide

### Getting Started

1. **Clone Repository**
```bash
git clone https://github.com/almazbisenbaev/tbilingo.git
cd tbilingo
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
Create `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Run Development Server**
```bash
npm run dev
```

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run update-version # Update app version
```

### Code Organization Principles

1. **Feature-First**: Organize by feature, not by file type
2. **Component Composition**: Build complex UIs from simple components
3. **Hook Extraction**: Extract reusable logic into custom hooks
4. **Type Safety**: Use TypeScript for all components and functions
5. **Performance**: Optimize with React.memo, useMemo, and useCallback

### Adding New Courses

1. **Define Course Config**
```typescript
// constants/courseData.ts
{
  id: 'phrases-sports',
  title: 'Sports & Recreation',
  description: 'Georgian phrases for sports and activities',
  difficulty: 'beginner',
  prerequisites: ['phrases-1'],
  tags: ['sports', 'recreation'],
  icon: '/images/icon-sports.svg',
  estimatedTime: 30,
  order: 15,
  route: '/sports'
}
```

2. **Add Sample Data**
```typescript
// constants/courseData.ts
'phrases-sports': [
  { id: "1", english: "I like football", georgian: "მე ფეხბურთი მომწონს" },
  // ... more phrases
]
```

3. **Create Route**
```tsx
// app/(courses)/sports/page.tsx
export default function SportsPage() {
  return (
    <GenericCourse 
      courseId="phrases-sports"
      courseTitle="Sports & Recreation"
      courseDescription="Georgian phrases for sports and activities"
    />
  );
}
```

### Component Development Guidelines

1. **Use TypeScript interfaces for all props**
2. **Follow the composition pattern**
3. **Extract reusable logic into hooks**
4. **Use semantic HTML elements**
5. **Implement proper error boundaries**
6. **Add loading states for async operations**

### Testing Strategy

While formal tests aren't implemented yet, the app is structured for testing:

1. **Unit Tests**: Individual components and hooks
2. **Integration Tests**: Feature workflows
3. **E2E Tests**: Complete user journeys
4. **Performance Tests**: Loading and interaction speeds

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Link GitHub repository to Vercel
   - Configure build settings (auto-detected)

2. **Environment Variables**
   - Add Firebase config to Vercel dashboard
   - Set production environment variables

3. **Domain Setup**
   - Configure custom domain if needed
   - Set up SSL (automatic with Vercel)

### Build Configuration

The app is optimized for production:

- **Static Generation**: Pre-built pages for better performance
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Analysis**: Built-in bundle analyzer
- **PWA Optimization**: Service worker for offline support

### Performance Optimizations

1. **Code Splitting**: Automatic with Next.js
2. **Image Optimization**: Sharp for image processing
3. **Caching Strategy**: Service worker for offline support
4. **Bundle Optimization**: Tree-shaking and minification

## 📊 Monitoring & Analytics

### Analytics Integration
- **Vercel Analytics**: Performance and usage metrics
- **Google Analytics**: User behavior tracking
- **Firebase Analytics**: User retention and engagement

### Performance Monitoring
- **Core Web Vitals**: Loading, interactivity, visual stability
- **Error Tracking**: Runtime error monitoring
- **User Experience**: Navigation and interaction patterns

## 🔮 Future Improvements

### Planned Features
1. **Audio Pronunciation**: Native speaker recordings
2. **Speech Recognition**: User pronunciation practice
3. **Social Features**: Learning groups and challenges
4. **Advanced Analytics**: Detailed learning insights
5. **Gamification**: Points, badges, and achievements

### Technical Improvements
1. **Test Coverage**: Comprehensive test suite
2. **Performance**: Further optimization and caching
3. **Accessibility**: WCAG compliance improvements
4. **Internationalization**: Multi-language support

---

## 📝 Contributing

This documentation provides a comprehensive overview of the Tbilingo application. For specific implementation details, refer to the source code and inline comments.

### Key Files to Understand
1. `src/app/layout.tsx` - App root and providers
2. `src/components/LearnTab.tsx` - Main course list
3. `src/features/course/components/GenericCourse.tsx` - Course container
4. `src/hooks/course/useCourseMemory.tsx` - Learning logic
5. `src/constants/courseData.ts` - Course definitions

The codebase is designed to be maintainable, extensible, and easy to understand for both humans and LLMs. Each component has a clear responsibility, and the architecture supports adding new features without major restructuring.