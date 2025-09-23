import { useState } from 'react';
import './WordsComponent.css';

interface WordsComponentProps {
  word: {
    english: string;
    georgian: string;
    latin: string;
    id: number;
  };
  onNext: () => void;
  onLearned: () => void;
}

/**
 * Component for displaying Georgian words and phrases
 * Shows English text with a "Show answer" button to reveal Georgian translation
 * No flip animation - just toggles visibility
 */
const WordsComponent: React.FC<WordsComponentProps> = ({ word, onNext, onLearned }) => {
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [showLatin, setShowLatin] = useState<boolean>(false);

  /**
   * Handles the action when user clicks to reveal the Georgian translation
   */
  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  /**
   * Handles showing the Latin transliteration
   * Once shown, it stays visible and the button disappears
   */
  const handleShowLatin = () => {
    setShowLatin(true);
  };

  return (
    <div className="words-component">
      <div className="words-content">
        {/* English word/phrase display */}
        <div className="words-english">
          {word.english}
        </div>

        {/* Show answer button or Georgian translation */}
        {!showAnswer ? (
          <button 
            className="btn btn-primary w-full words-show-answer-btn"
            onClick={handleShowAnswer}
          >
            Show answer
          </button>
        ) : (
          <div className="words-answer-section">
            <div className="words-georgian">
              {word.georgian}
            </div>
            <div className="words-latin-section">
              {showLatin && (
                <div className="words-latin">
                  <b>{word.latin}</b>
                </div>
              )}
              {!showLatin && (
                <button 
                  className="btn btn-small btn-secondary"
                  onClick={handleShowLatin}
                >
                  View latin
                </button>
              )}
            </div>
            <div className="words-actions">
              <button 
                className="btn btn-block btn-primary"
                onClick={onNext}
              >
                Next item
              </button>
              <button 
                className="btn btn-block"
                onClick={onLearned}
              >
                Mark as learned
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordsComponent;