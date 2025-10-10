import { useState, useEffect } from 'react';
import { PhraseAdvancedItem, PhraseAdvancedMemory } from '@/types';
import { processGeorgianSentence, normalizeForComparison } from '@/utils/georgian-text-utils';
import './PhraseAdvancedComponent.css';

interface PhraseAdvancedComponentProps {
  phrase: PhraseAdvancedItem;
  memory: PhraseAdvancedMemory;
  onNext: () => void;
  onCorrectAnswer: () => void;
  onWrongAnswer: () => void;
}

/**
 * Component for advanced phrase learning gameplay
 * Shows English sentence, user constructs Georgian translation by clicking word buttons
 */
const PhraseAdvancedComponent: React.FC<PhraseAdvancedComponentProps> = ({ 
  phrase, 
  memory,
  onNext, 
  onCorrectAnswer,
  onWrongAnswer
}) => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [georgianWords, setGeorgianWords] = useState<string[]>([]);

  // Extract words from Georgian sentence when phrase changes
  useEffect(() => {
    const words = processGeorgianSentence(phrase.georgian);
    setGeorgianWords(words);
    setSelectedWords([]);
    setIsSubmitted(false);
    setIsCorrect(false);
  }, [phrase.id, phrase.georgian]);

  /**
   * Handles clicking a word button
   */
  const handleWordClick = (word: string) => {
    if (isSubmitted) return; // Don't allow changes after submission
    
    setSelectedWords(prev => [...prev, word]);
  };

  /**
   * Handles removing a word from the selected sequence
   */
  const handleRemoveWord = (index: number) => {
    if (isSubmitted) return; // Don't allow changes after submission
    
    setSelectedWords(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Handles submission and validation
   */
  const handleSubmit = () => {
    if (selectedWords.length === 0) return;
    
    // Check if the constructed sentence matches the correct Georgian translation
    const constructedSentence = selectedWords.join(' ');
    const normalizedConstructed = normalizeForComparison(constructedSentence);
    const normalizedCorrect = normalizeForComparison(phrase.georgian);
    
    const isAnswerCorrect = normalizedConstructed === normalizedCorrect;
    
    setIsCorrect(isAnswerCorrect);
    setIsSubmitted(true);
    
    // Notify parent based on answer correctness
    if (isAnswerCorrect) {
      onCorrectAnswer();
    } else {
      onWrongAnswer();
    }
  };

  /**
   * Handles the "Next" button click
   */
  const handleNext = () => {
    onNext();
  };

  return (
    <div className="phrase-advanced-component">
      <div className="phrase-content">


        {/* Memory progress indicator */}
        <div className="phrase-memory-indicator">
          <span className="memory-dots">
            {[...Array(3)].map((_, i) => (
              <span 
                key={i} 
                className={`memory-dot ${i < memory.correctAnswers ? 'filled' : ''}`}
              />
            ))}
          </span>
          <span className="memory-text">
            {memory.correctAnswers}/3 correct
          </span>
        </div>


        {/* English phrase to translate */}
        <div className="phrase-english">
          {phrase.english}
        </div>



        {/* Available Georgian words */}
        <div className="phrase-word-bank">
          <div className="word-bank-title">Build the Georgian translation:</div>
          <div className="word-buttons">
            {georgianWords.map((word, index) => (
              <button 
                key={`${word}-${index}`}
                onClick={() => handleWordClick(word)}
                disabled={isSubmitted}
                className="word-button"
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {/* User's construction */}
        <div className="phrase-construction">
          <div className="construction-title">Your answer:</div>
          <div className="construction-area">
            {selectedWords.length === 0 ? (
              <span className="construction-placeholder">
                Click words above to build the sentence
              </span>
            ) : (
              <div className="constructed-sentence">
                {selectedWords.map((word, index) => (
                  <span 
                    key={index}
                    onClick={() => handleRemoveWord(index)}
                    className={`constructed-word ${isSubmitted ? 'readonly' : ''}`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="phrase-actions">
          {!isSubmitted ? (
            <button 
              onClick={handleSubmit}
              disabled={selectedWords.length === 0}
              className="btn btn-primary btn-block"
            >
              Check Answer
            </button>
          ) : (
            <div className="result-section">
              <div className={`result-message ${isCorrect ? 'correct' : 'wrong'}`}>
                {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
              </div>
              {!isCorrect && (
                <div className="correct-answer">
                  <span className="label">Correct answer:</span>
                  <span className="answer">{phrase.georgian}</span>
                </div>
              )}
              <button 
                onClick={handleNext}
                className="btn btn-primary btn-block"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhraseAdvancedComponent;