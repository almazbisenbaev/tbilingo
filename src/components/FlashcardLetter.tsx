import { useState } from 'react';
import { FlashcardProps } from '@/types';
import './FlashcardLetter.css';

/**
 * Flashcard component for displaying Georgian alphabet characters
 * Features a flip animation to show character details and pronunciation
 * 
 * The component has two sides:
 * 1. Front: Shows only the Georgian character
 * 2. Back: Shows the name, pronunciation, and audio playback
 */

const Flashcard: React.FC<FlashcardProps> = ({ letter, onNext, onLearned }) => {
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  /**
   * Handles the action when user clicks to reveal the answer
   * Triggers the card flip animation by setting showAnswer state to true
   */
  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  return (
    <div className="flashcard">
      <div className={`flashcard-inner ${showAnswer ? 'flipped' : ''}`}>
        <div className="flashcard-front">
          <div className='flashcard-character'>{letter.character}</div>
          <button 
            className="btn btn-primary w-full"
            onClick={handleShowAnswer}
          >
            Show answer
          </button>
        </div>
        <div className="flashcard-back">
          <div className='flashcard-back-content'>
            <div className='flashcard-name'>{letter.name}</div>
            <div className='flashcard-pronunciation'>
              Pronunciation: <b>{letter.pronunciation}</b>
            </div>
            <div>
              <audio
                controls
                className="flashcard-audio"
                src={letter.audioUrl}
                preload="auto"
              >
                Your browser does not support the audio element.
              </audio>
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
              className="btn btn-block"
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

export default Flashcard;