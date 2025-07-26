import { useState, useEffect } from 'react';

import './Flashcard.css';

const Flashcard = ({letter, onNext, onLearned}) => {

    const [isFlipped, setIsFlipped] = useState(false);

    const classNames = ['flashcard'];
    
    // if(processedState === 'processed'){
    //     classNames.push('flashcard-processed');
    // } else {
    //     classNames.push('flashcard-not-processed');
    // }

    if (isFlipped) {
        classNames.push('flashcard-flipped');
    }

    return (
        <div className={classNames.join(' ')} onClick={() => {setIsFlipped(!isFlipped)}}>
            <div className="flashcard-inner">

                <div className="flashcard-front">
                    <div className='flashcard-character'>{letter.character}</div>
                    <div className='flashcard-tap-hint'>Tap to flip card</div>
                </div>

                <div className="flashcard-back">
                    <div className='flashcard-name'>{letter.name}</div>
                    <div className='flashcard-pronunciation'>Pronounciation: <b>{letter.pronunciation}</b></div>
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
    )
}
  
export default Flashcard