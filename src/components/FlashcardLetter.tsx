import { useState, useRef } from 'react';
import { IconPlayerPause, IconVolume } from '@tabler/icons-react';
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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);

  /**
   * Handles the action when user clicks to reveal the answer
   * Triggers the card flip animation by setting showAnswer state to true
   */
  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  /**
   * Handles audio playback when the play button is clicked
   */
  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setAudioError(''); // Clear any previous errors
        audioRef.current.play().catch((error) => {
          setIsPlaying(false);
          setAudioError(`Audio playback failed: ${error.message}`);
        });
        setIsPlaying(true);
      }
    }
  };

  /**
   * Handle audio events to update the playing state
   */
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    setIsPlaying(false);
    setAudioError('Audio file could not be loaded or played');
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
            <div className='flashcard-character-small'>{letter.character}</div>
            <div className='flashcard-name'>{letter.name}</div>
            <div className='flashcard-pronunciation'>
              Pronunciation: <b>{letter.pronunciation}</b>
            </div>
            <div className="flashcard-audio-container">
              <button 
                className="btn btn-audio"
                onClick={handlePlayAudio}
                disabled={!letter.audioUrl}
              >
                {isPlaying ? (
                  <IconPlayerPause size={20} />
                ) : (
                  <IconVolume size={20} />
                )}
              </button>
              {audioError && (
                <pre className="audio-error">{audioError}</pre>
              )}
              <audio
                ref={audioRef}
                src={letter.audioUrl}
                preload="auto"
                onEnded={handleAudioEnded}
                onError={handleAudioError}
              />
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