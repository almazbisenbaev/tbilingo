import { useState } from 'react';
import { FlashcardProps } from '@/types';
import './Flashcard.css';

const Flashcard: React.FC<FlashcardProps> = ({ letter, onNext, onLearned }) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const classNames: string[] = ['flashcard'];

  if (isFlipped) {
    classNames.push('flashcard-flipped');
  }

  return (
    <div 
      className={classNames.join(' ')} 
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <div className='flashcard-character'>{letter.character}</div>
          <div className='flashcard-tap-hint'>Tap to flip card</div>
        </div>

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
        </div>
      </div>
    </div>
  );
};

export default Flashcard; 