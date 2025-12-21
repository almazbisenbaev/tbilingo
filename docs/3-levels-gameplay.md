# Levels Gameplay Mechanics

## Levels 1-3: Flashcards System
**Courses:** Alphabet (1), Numbers (2), Basic Words (3)

These levels use a self-assessment flashcard system to introduce foundational knowledge.

*   **Gameplay:** Users are presented with flashcards containing a character, number, or word along with its pronunciation and translation.
*   **Learning Process:**
    *   Users review the card.
    *   **"Next Card"**: Skips the item for the current session. It will reappear in future sessions.
    *   **"Mark as Learned"**: User explicitly confirms they know the item.
*   **Progress Saving:**
    *   When an item is marked as "Learned", it is immediately saved to the database.
    *   Learned items are filtered out and will not appear in future gameplay sessions.

## Levels 4-5: Phrases System
**Courses:** Essential Phrases (4), Business & Work (5)

These levels focus on sentence construction and utilize a repetition-based memory system to ensure mastery.

*   **Gameplay:** Users must construct the correct Georgian sentence from a bank of words to match the English phrase.
*   **Memory System (3-Step Iteration):**
    *   Items are not marked as learned immediately.
    *   Each item has a progress counter (0 to 3).
    *   **Correct Answer:** Increases progress by 1.
    *   **Wrong Answer:** Decreases progress by 1.
*   **Completion:**
    *   An item is considered "Learned" only when it reaches **3/3** correct answers.
    *   Partial progress (e.g., 1/3 or 2/3) is saved to the database, allowing users to resume their progress between sessions.
