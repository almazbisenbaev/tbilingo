import { useState } from 'react';
import { FlashcardWordProps } from '@/types';
import './FlashcardWord.css';

/**
 * Flashcard component for displaying Georgian words
 * Features a flip animation to show word details and translation
 * 
 * The component has two sides:
 * 1. Front: Shows the English word
 * 2. Back: Shows the Georgian translation and Latin transliteration
 */

const FlashcardWord: React.FC<FlashcardWordProps> = ({ word, onNext, onLearned }) => {
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
                    <div className='flashcard-word-english'>{word.english}</div>
                    <button
                        className="btn btn-primary w-full"
                        onClick={handleShowAnswer}
                    >
                        Show answer
                    </button>
                </div>
                <div className="flashcard-back">
                    <div className='flashcard-back-content'>
                        <div className='flashcard-word-english-small'>{word.english}</div>
                        <div className='flashcard-word-georgian'>{word.georgian}</div>
                        <div className='flashcard-transliteration-section'>
                            {showTransliteration && (
                                <div className='flashcard-pronunciation'>
                                    <div className='text-xs text-gray-600'>Transliteration:</div>
                                    <div><b>{word.latin}</b></div>
                                </div>
                            )}
                            {!showTransliteration && (
                                <button
                                    className="btn btn-small btn-secondary"
                                    onClick={handleShowTransliteration}
                                >Latin</button>
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

export default FlashcardWord;
