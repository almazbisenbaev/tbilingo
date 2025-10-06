# Tbilingo Database Structure Documentation

This document provides a comprehensive overview of the Tbilingo Firebase Firestore database structure for developers and collaborators.

## Overview

Tbilingo uses **Firebase Firestore** as its primary database. The database is structured ### Development Guidelines

### Naming Conventions

- **Course IDs**: kebab-case (e.g., `georgian-alphabet`, `basic-phrases`)
- **Item IDs**: Sequential numbers as strings (`"1"`, `"2"`, `"3"`)
- **Field Names**: camelCase (e.g., `translationLatin`, `audioUrl`)

### Data Validation

- Always include required base fields (`id`, `order`)
- Use proper TypeScript interfaces
- Validate data before Firestore writestiple Georgian language learning courses with flexible schemas that can accommodate different content types.

## Database Architecture

### Collections Structure

```
/courses/{courseId}                    # Course definitions (documents)
  ├── /items/{itemId}                 # Course content items (subcollection)
/users/{userId}                       # User-specific data (documents)  
  ├── /progress/{courseId}            # User progress per course (subcollection)
  ├── /detailed-progress/{courseId}/  # Detailed progress tracking (subcollection)
      └── items/{itemId}              # Item-specific progress
  └── /profile/{document}             # User profile data (subcollection)
/global-stats/{document}              # Global statistics (optional)
```

## Course Data Structure

### Course Definition (`/courses/{courseId}`)

Each course is defined by a main document containing metadata and configuration:

```typescript
interface CourseDefinition {
  id: string;                         // Course identifier (matches document ID)
  title: string;                      // Display name (e.g., "Georgian Alphabet")
  description: string;                // Course description for users
  type: 'alphabet' | 'numbers' | 'phrases' | 'words' | 'grammar' | 'listening' | 'custom';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;                  // Whether course appears in app
  totalItems: number;                 // Number of learning items
  estimatedTime: number;              // Completion time in minutes
  prerequisites: string[];            // Required course IDs
  tags: string[];                     // Searchable tags
  icon: string;                       // Icon path for UI
  version: number;                    // Schema version for migrations
  createdAt: Timestamp;               // Creation timestamp
  updatedAt: Timestamp;               // Last modification timestamp
  
  // Schema definition for validation
  itemSchema: {
    [fieldName: string]: {
      type: 'string' | 'number' | 'boolean' | 'url' | 'array';
      required: boolean;
      description: string;
    }
  };
}
```

### Current Courses

| Course ID | Type | Title | Description |
|-----------|------|-------|-------------|
| `alphabet` | alphabet | Georgian Alphabet | Learn the 33 letters of the Georgian alphabet |
| `numbers` | numbers | Georgian Numbers | Learn numbers 1-20 in Georgian |
| `phrases-1` | phrases | Basic Georgian Phrases | Essential Georgian phrases for beginners |

## Course Items Structure

### Base Item Interface (`/courses/{courseId}/items/{itemId}`)

All course items share these common fields:

```typescript
interface BaseCourseItem {
  id: string;                         // Item identifier (matches document ID)
  order: number;                      // Display/learning order (1, 2, 3...)
  [key: string]: any;                 // Additional type-specific fields
}
```

### Alphabet Course Items

For course type `alphabet`:

```typescript
interface AlphabetItem extends BaseCourseItem {
  character: string;                  // Georgian character (e.g., "ა")
  name: string;                       // Character name (e.g., "ani")
  pronunciation: string;              // Pronunciation guide (e.g., "/a/")
  audioUrl?: string;                  // Path to audio file (e.g., "/audio/ani.mp3")
  examples?: string[];                // Usage examples (optional)
}
```

**Example Document:**
```json
{
  "id": "1",
  "character": "ა",
  "name": "ani", 
  "pronunciation": "/a/",
  "audioUrl": "/audio/ani.mp3",
  "order": 1
}
```

### Numbers Course Items

For course type `numbers`:

```typescript
interface NumberItem extends BaseCourseItem {
  number: number;                     // Numeric value (1, 2, 3...)
  translation: string;                // Georgian text (e.g., "ერთი")
  translationLatin: string;           // Latin transliteration (e.g., "erti")
}
```

**Example Document:**
```json
{
  "id": "1",
  "number": 1,
  "translation": "ერთი",
  "translationLatin": "erti",
  "order": 1
}
```

### Phrases Course Items

For course type `phrases`:

```typescript
interface PhraseItem extends BaseCourseItem {
  english: string;                    // English phrase
  georgian: string;                   // Georgian translation
  latin: string;                      // Latin transliteration
  category?: string;                  // Phrase category (e.g., "greetings")
  audioUrl?: string;                  // Audio pronunciation (optional)
}
```

**Example Document:**
```json
{
  "id": "1",
  "english": "hello",
  "georgian": "გამარჯობა",
  "latin": "gamarjoba",
  "category": "greetings",
  "order": 1
}
```

## User Progress Structure

### User Progress (`/users/{userId}/progress/{courseId}`)

Tracks user learning progress per course:

```typescript
interface UserProgress {
  courseId: string;                   // Reference to course
  userId: string;                     // User identifier
  learnedItems: number[];             // Array of completed item IDs
  totalItems: number;                 // Total items in course (cached)
  completionPercentage: number;       // Progress percentage (0-100)
  lastUpdated: Timestamp;             // Last activity
  streakDays: number;                 // Consecutive learning days
  totalTimeSpent: number;             // Total minutes spent
  startedAt: Timestamp;               // First interaction
}
```

### Detailed Progress (`/users/{userId}/detailed-progress/{courseId}/items/{itemId}`)

Granular tracking per item:

```typescript
interface DetailedItemProgress {
  itemId: string;                     // Reference to course item
  courseId: string;                   // Reference to course
  userId: string;                     // User identifier
  isLearned: boolean;                 // Completion status
  attempts: number;                   // Number of review attempts
  correctAttempts: number;            // Successful attempts
  lastReviewed: Timestamp;            // Last interaction
  difficultyRating?: number;          // User-assigned difficulty (1-5)
  notes?: string;                     // User notes
}
```

## Security Rules

Current Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
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
    
    // Global stats - read-only for users
    match /global-stats/{document=**} {
      allow read: if true;
      allow write: if false; // Server-side only
    }
  }
}
```

## Adding New Content

### Adding a New Course

1. **Create Course Document** at `/courses/{newCourseId}`:
   ```javascript
   {
     id: "new-course",
     title: "New Course Title",
     description: "Course description",
     type: "custom", // or appropriate type
     difficulty: "beginner",
     isActive: true,
     totalItems: 0, // Update as items are added
     estimatedTime: 30,
     prerequisites: [],
     tags: ["beginner", "custom"],
     icon: "/images/icon-custom.svg",
     version: 1,
     itemSchema: {
       // Define expected fields for this course type
     }
   }
   ```

2. **Add Items Subcollection** at `/courses/{newCourseId}/items/`:
   - Use sequential IDs: `1`, `2`, `3`...
   - Include required base fields (`id`, `order`)
   - Add course-specific fields based on `itemSchema`

### Adding Items to Existing Course

1. **Navigate to** `/courses/{courseId}/items/`
2. **Create new document** with next sequential ID
3. **Include required fields**: `id`, `order`, plus course-specific fields
4. **Update course `totalItems`** count

## API Integration

### Service Layer

The app uses service layers to interact with Firestore:

- **`EnhancedFirebaseService`** - CRUD operations for courses and items
- **`UserProgressService`** - User progress management
- **Custom Hooks** - React hooks for data fetching (`useAlphabet`, `useNumbers`, `useWords`)

### Data Flow

1. **Client Request** → React Hook → Service Layer → Firestore
2. **Real-time Updates** via Firestore listeners
3. **Local State** managed by Zustand stores
4. **Progress Sync** between local state and Firestore

## Development Guidelines

### Naming Conventions

- **Course IDs**: kebab-case (e.g., `georgian-alphabet`, `basic-phrases`)
- **Item IDs**: Sequential numbers as strings (`"1"`, `"2"`, `"3"`)
- **Field Names**: camelCase (e.g., `translationLatin`, `audioUrl`)

### Data Validation

- Always include required base fields
- Use proper TypeScript interfaces
- Validate data before Firestore writes
- Include timestamps for audit trails

### Performance Considerations

- **Pagination**: Implement for courses with >50 items
- **Indexing**: Create composite indexes for queries
- **Caching**: Use React Query or similar for client-side caching
- **Offline**: Consider Firestore offline persistence

### Testing Data

For development/testing, use:
- **Course ID**: `test-course` (will be filtered out in production)
- **Small datasets**: 3-5 items per test course
- **Clear naming**: Prefix test items with `TEST_`

## Backup and Maintenance

### Data Export

Use Firebase CLI to export data:
```bash
firebase firestore:export gs://your-bucket/backups/$(date +%Y-%m-%d)
```

### Schema Migrations

When updating course schemas:
1. Increment `version` field in course definition
2. Add migration logic in service layer
3. Update TypeScript interfaces
4. Test with small dataset first

---

## Quick Reference

### Common Firestore Paths
- Course definition: `/courses/{courseId}`
- Course items: `/courses/{courseId}/items/{itemId}`
- User progress: `/users/{userId}/progress/{courseId}`
- User profile: `/users/{userId}/profile/main`

### Required Fields by Type
- **All items**: `id`, `order`
- **Alphabet**: + `character`, `name`, `pronunciation`
- **Numbers**: + `number`, `translation`, `translationLatin`
- **Phrases**: + `english`, `georgian`, `latin`

This structure provides flexibility for future course types while maintaining consistency and performance.