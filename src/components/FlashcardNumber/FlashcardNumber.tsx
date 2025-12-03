import { useState } from 'react';
import { FlashcardNumberProps } from '@/types';
import './FlashcardNumber.css';

/**
 * Flashcard component for displaying Georgian numbers
 * Features a flip animation to show number details and translation
 * 
 * The component has two sides:
 * 1. Front: Shows only the number
 * 2. Back: Shows the Georgian translation and Latin transliteration
 */

const FlashcardNumber: React.FC<FlashcardNumberProps> = ({ number, onNext, onLearned }) => {
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [showTransliteration, setShowTransliteration] = useState<boolean>(false);

  /**
   * Handles the action when user clicks to reveal the answer
   * Triggers the card flip animation by setting showAnswer state to true
   */
  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  /**
   * Handles showing the Latin transliteration
   * Once shown, it stays visible and the button disappears
   */
  const handleShowTransliteration = () => {
    setShowTransliteration(true);
  };

  return (
    <div className="flashcard">
      <div className={`flashcard-inner ${showAnswer ? 'flipped' : ''}`}>
        <div className="flashcard-front">
          <div className='flashcard-character'>{number.number}</div>
          <button
            className="btn btn-primary w-full"
            onClick={handleShowAnswer}
          >
            Show answer
          </button>
        </div>
        <div className="flashcard-back">
          <div className='flashcard-back-content'>
            <div className='flashcard-name'>{number.translation}</div>
            <div className='flashcard-transliteration-section'>
              {showTransliteration && (
                <div className='flashcard-pronunciation'>
                  Transliteration: <b>{number.translationLatin}</b>
                </div>
              )}
              {!showTransliteration && (
                <button
                  className="btn btn-small btn-secondary"
                  onClick={handleShowTransliteration}
                >
                  Latin
                </button>
              )}
            </div>
          </div>
          <div className="flashcard-actions">
            <button
              className="btn btn-block btn-primary"
              onClick={onNext}
            >
              Next card
            </button>
            <button
              className="btn btn-block btn-secondary"
              onClick={onLearned}
            >
              Mark as learned
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardNumber;