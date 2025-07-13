"use client";

import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/next';

import { alphabet } from '@/data/alphabet';

import Image from 'next/image';
import shuffleArray from '@/utils/shuffle-array';

import Flashcard from '@/components/Flashcard';
import Welcome from '@/components/Welcome';
import IOSInstallPrompt from '@/components/IOSInstallPrompt';

// Type for a single alphabet letter
interface AlphabetLetter {
  character: string;
  name: string;
  pronunciation: string;
  id: number;
  audioUrl: string;
}

export default function App() {

  const [screen, setScreen] = useState<'home' | 'gameplay' | 'all_reviewed'>('home');
  const [learnedCharactersCount, setLearnedCharactersCount] = useState<number>(0); // Store the learned characters from localstorage
  const [charactersToReview, setCharactersToReview] = useState<AlphabetLetter[]>([]); // Store characters that are not in localstorage
  const [processedCharacters, setProcessedCharacters] = useState<number[]>([]); // Store characters that the viewers has seen suring the gameplay
  const [learnedCharacters, setLearnedCharacters] = useState<number[]>([]); // Store characters that the viewers has seen suring the gameplay
  const [fontType, setFontType] = useState<'sans' | 'serif'>('sans');
  const [slideWidth, setSlideWidth] = useState<number>(0);

  // The function that switches the UI stages
  const changeScreen = (screenName: 'home' | 'gameplay' | 'all_reviewed'): void => {
    setScreen(screenName);
    setProcessedCharacters([]);
    setLearnedCharacters([]);
    setSlideWidth(0);
  }

  // The function that moves the slides when a flashcard is processed
  const switchSlide = (index: number, element: HTMLElement | null) => {
    if (!element) return;
    const slideWidth = element.getBoundingClientRect().width;
    const sliderTrack = document.querySelector('.slider-track') as HTMLElement | null;
    if(sliderTrack){
      // Get current translateX value
      const currentTransform = getComputedStyle(sliderTrack).transform;
      const matrix = new window.DOMMatrix(currentTransform);
      const currentTranslateX = matrix.m41; // Get the current translateX value
      // Update the transform by adding the element width
      sliderTrack.style.transform = `translateX(${currentTranslateX - slideWidth}px)`;
    }
  }

  // Add the letter to the list of learned letters in localstorage
  const saveLetterToLocal = (characterId: number) => {
    const savedLearnedCharacters: number[] = JSON.parse(localStorage.getItem('learnedLetters') || '[]');
    localStorage.setItem('learnedLetters', JSON.stringify([...savedLearnedCharacters, characterId]));
  }

  // What happens when user just switches to the next card
  const markAsToReview = (characterId: number, index: number, element: HTMLElement | null) => {
    if (!processedCharacters.includes(characterId)) {
      setTimeout(() => {
        setProcessedCharacters((prevProcessedCharacters) => [...prevProcessedCharacters, characterId]);
        switchSlide(index, element);
      }, 250);
    }
  };

  // What happens when user marks a character as learned
  const markAsLearned = (characterId: number, index: number, element: HTMLElement | null) => {
    if (!processedCharacters.includes(characterId)) {
      setTimeout(() => {
        setProcessedCharacters((prev) => [...prev, characterId]); // Add to processed characters
        setLearnedCharacters((prev) => [...prev, characterId]); // Add to processed characters
        switchSlide(index, element); // Jump to the next slide
        saveLetterToLocal(characterId); // Save letter to localstorage
      }, 450);
    }
  };

  const startGame = () => {
    const savedLearnedCharacters: number[] = JSON.parse(localStorage.getItem('learnedLetters') || '[]');
    setLearnedCharactersCount(savedLearnedCharacters.length);
    const charactersMissingInLocal = alphabet.filter((letter: any) => !savedLearnedCharacters.includes(letter.id)) as AlphabetLetter[];
    setProcessedCharacters([]);
    setLearnedCharacters([]);
    setSlideWidth(0);
    setCharactersToReview(shuffleArray(charactersMissingInLocal));
    changeScreen('gameplay');
    setTimeout(() => {
      const element = document.querySelector('.slider-slide');
      if(element){
        const slideWidth = element.getBoundingClientRect().width;
        setSlideWidth(slideWidth);
      }
    }, 200);
  }

  const resetProgress = () => {
    const confirmReset = window.confirm('Are you sure you want to start over?');
    if(confirmReset){
      localStorage.removeItem('learnedLetters');
      setLearnedCharactersCount(0);
    }
  }

  useEffect(() => {
    // Count the learned characters
    const savedLearnedCharacters: number[] = JSON.parse(localStorage.getItem('learnedLetters') || '[]');
    setLearnedCharactersCount(savedLearnedCharacters.length);
    // Load font setting from local storage
    const storedFontSettingFromLocal = localStorage.getItem('fontType');
    if (storedFontSettingFromLocal !== null) {
      setFontType(storedFontSettingFromLocal as 'sans' | 'serif');
    }
    if(screen == 'gameplay'){
      if (processedCharacters.length >= charactersToReview.length) {
        changeScreen('all_reviewed');
      }
    }
  }, [processedCharacters, charactersToReview.length, screen]);

  return (
    <>
      <IOSInstallPrompt />

      {/* <div className="debugbar">
        <div>Characters in localstorage: {learnedCharactersCount}</div>
        <div>Characters to review: {charactersToReview.length}</div>
        <div>Processed characters: {processedCharacters.length}</div>
      </div> */}

      {screen === 'home' && (
        <>
          <div className="screen-welcome">
            <Welcome 
              onPlay={startGame} 
              alphabetLength={alphabet.length}
              onReset={resetProgress}
            />
          </div>
        </>
      )}

      {screen === 'gameplay' && (
        <>
          <div className={`screen-gameplay font-type-${fontType}`}>

            <div className="navbar">
              <div className="navbar-row">
                <div className="navbar-aside">
                  <button className='navbar-button' onClick={() => {changeScreen('home')}}>
                    <Image
                      src="/images/icon-back.svg"
                      alt="Back"
                      width={24}
                      height={24}
                    />
                  </button>
                </div>
                <div className="navbar-title"></div>
                <div className="navbar-aside"></div>
              </div>
            </div>

            <div className="gameplay-game">
              <div className="slider">
                <div className="slider-wrapper">
                  <div className="slider-track">
                    {charactersToReview.map((item, index) => {
                      const isProcessed = processedCharacters.includes(item.id);
                      const isLearned = learnedCharacters.includes(item.id);
                      return  <div key={item.id} 
                                   className={`slider-slide ${isProcessed ? 'processed' : 'not-processed'} ${isLearned ? 'learned' : 'not-learned'}`}
                                    style={{
                                      '--slide-width': slideWidth + 'px',
                                    } as React.CSSProperties}
                              >
                                <div className='slider-slide-inner'>
                                  <Flashcard 
                                    letter={item} 
                                    onNext={() => markAsToReview(item.id, index, document.querySelectorAll('.slider-slide')[index] as HTMLElement)}
                                    onLearned={() => markAsLearned(item.id, index, document.querySelectorAll('.slider-slide')[index] as HTMLElement)}
                                  />
                                  <div className='slider-slide-actions'>
                                    <button 
                                      className='btn btn-block btn-primary'
                                      onClick={event => {markAsToReview(item.id, index, event.currentTarget.closest('.slider-slide') as HTMLElement)}}
                                    >Next card</button>
                                    <button 
                                      className='btn btn-block'
                                      onClick={event => {markAsLearned(item.id, index, event.currentTarget.closest('.slider-slide') as HTMLElement)}}
                                    >Mark as learned</button>
                                  </div>
                                </div>
                              </div>;
                    })}
                  </div>
                </div>
              </div>
            </div>


          </div>
        </>
      )}

      {screen === 'all_reviewed' && (
        <>
          <div className="screen-finish">

            <div className="finish-message">
              <h2 className='finish-message-title'>All cards reviewed 🙌</h2>
              <div className='finish-message-text'>
                <p>You've looked through all the flashcards. You can go back to the homepage and start over.</p>
                <p>If you're not sure whether you memorized all the letters, you can reset your progress and start from 0.</p>
              </div>
              <div className='finish-message-actions'>
                <button className='btn btn-small btn-secondary' onClick={() => {changeScreen('home')}}>Go back</button>
              </div>
            </div>

          </div>
        </>
      )}


      <Analytics />
    </>
  )
}
