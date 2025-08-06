# Tbilingo - Learn Georgian Alphabet

An interactive web application for learning the Georgian alphabet through flashcards and spaced repetition.

## 🚀 Features

- **Interactive Flashcards**: Learn Georgian letters with audio pronunciation
- **Progress Tracking**: Save your learning progress locally
- **PWA Support**: Install as a mobile app
- **Responsive Design**: Works on all devices
- **Font Options**: Learn letters in different font styles

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **PWA**: Service Worker + Manifest

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (courses)/         # Course-specific pages
│   │   └── alphabet/      # Alphabet learning course
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── ConfirmationDialog.tsx
│   ├── CourseLink.tsx
│   ├── Flashcard.tsx
│   ├── PWAInstallPrompt.tsx
│   ├── ServiceWorkerRegistration.tsx
│   ├── SettingsDrawer.tsx
│   └── SuccessPopup.tsx
├── constants/            # Application constants
│   └── index.ts
├── data/                # Static data
│   └── alphabet.js
├── hooks/               # Custom React hooks
│   └── useLearnedLetters.ts
├── stores/              # State management
│   └── fontStore.ts
├── types/               # TypeScript type definitions
│   └── index.ts
└── utils/               # Utility functions
    ├── shuffle-array.ts
    └── useBackButtonHandler.ts
```

## 🎯 Key Improvements Made

### 1. **TypeScript Migration**
- Converted all JavaScript files to TypeScript
- Added comprehensive type definitions
- Created shared types in `src/types/index.ts`

### 2. **Component Organization**
- Broke down large components into smaller, focused ones
- Created reusable dialog components
- Improved component reusability

### 3. **Data Management**
- Centralized localStorage operations in custom hooks
- Created `useLearnedLetters` hook for progress management
- Improved data consistency and error handling

### 4. **Code Quality**
- Added constants file for magic numbers
- Improved naming conventions
- Enhanced code readability and maintainability

### 5. **Performance Optimizations**
- Added proper TypeScript generics
- Improved array operations with immutable patterns
- Better state management patterns

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow the established component structure
- Use shared types from `src/types/index.ts`
- Implement proper error handling

### Component Structure
- Keep components focused and single-purpose
- Use custom hooks for complex logic
- Implement proper prop typing
- Add JSDoc comments for complex functions

### State Management
- Use Zustand for global state
- Use React hooks for local state
- Implement proper persistence patterns
- Handle loading and error states

## 🔧 Future Improvements

1. **Testing**: Add unit and integration tests
2. **Accessibility**: Improve ARIA labels and keyboard navigation
3. **Performance**: Add React.memo and useMemo optimizations
4. **Analytics**: Track user learning patterns
5. **Offline Support**: Enhance PWA capabilities
6. **Internationalization**: Add support for multiple languages

## 📄 License

Made by [Almaz Bisenbaev](https://almazbisenbaev.github.io)
