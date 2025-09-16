import { useState } from 'react';
import { ItemNumberProps } from '@/types';
import './FlashcardNumber.css';

/**
 * Flashcard component for displaying Georgian numbers
 * Features a flip animation to show character details and pronunciation
 * 
 * The component has two sides:
 * 1. Front: Shows only the number
 * 2. Back: Shows the name and spelling
 */

const Flashcard: React.FC<ItemNumberProps> = ({ number }) => {
//   const [showAnswer, setShowAnswer] = useState<boolean>(false);

  /**
   * Handles the action when user clicks to reveal the answer
   * Triggers the card flip animation by setting showAnswer state to true
   */
//   const handleShowAnswer = () => {
//     setShowAnswer(true);
//   };

  return (
    <div className="flashcard">

        <h1>Number: {number}</h1>

      {/* <div className={`flashcard-inner ${showAnswer ? 'flipped' : ''}`}>
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
      </div> */}
    </div>
  );
};

export default Flashcard;