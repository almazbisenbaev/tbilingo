import { useState } from 'react';
import { FlashcardProps } from '@/types';
import './Flashcard.css';

const Flashcard: React.FC<FlashcardProps> = ({ letter, onNext, onLearned }) => {
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  return (
    <div className="flashcard">
      <div className="flashcard-inner">
        {!showAnswer ? (
          <div className="flashcard-front">
            <div className='flashcard-character'>{letter.character}</div>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAnswer(true)}
            >
              Show answer
            </button>
          </div>
        ) : (
          <div className="flashcard-back">
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
        )}
      </div>
    </div>
  );
};

export default Flashcard; 