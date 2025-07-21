"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// import shuffleArray from '@/utils/shuffle-array';

import { alphabet } from '@/data/alphabet';

// Type for a single alphabet letter
interface AlphabetLetter {
  character: string;
  name: string;
  pronunciation: string;
  id: number;
  audioUrl: string;
}

import Flashcard from '@/components/Flashcard';

export default function AlphabetLearn(){

    // IDs of characters that are found in localstorage
    const [learnedCharacters, setLearnedCharacters] = useState<number[]>([]); 

    const [learnedCharactersCount, setLearnedCharactersCount] = useState<number>(0); 
  
    // Characters that the viewers has seen suring the gameplay
    const [processedCharacters, setProcessedCharacters] = useState<number[]>([]); 

     // Characters prepared for gameplay
    const [charactersToReview, setCharactersToReview] = useState<AlphabetLetter[]>([]);

    // Need to calculate the width of flashcards so I can transform them with animation
    const [slideWidth, setSlideWidth] = useState<number>(0);

    // const [fontType, setFontType] = useState<'sans' | 'serif'>('sans');


    useEffect(() => {
    
        // Load learned characters from localstorage
        const learnedCharactersInLocal = JSON.parse(localStorage.getItem('learnedLetters') || '[]');

        setLearnedCharacters(learnedCharactersInLocal);
        // setLearnedCharactersCount(learnedCharactersInLocal.length);

        const charactersMissingInLocal = alphabet.filter((letter: any) => !learnedCharactersInLocal.includes(letter.id)) as AlphabetLetter[];

        console.log('charactersMissingInLocal');
        console.log(charactersMissingInLocal);

        setProcessedCharacters([]);
        setLearnedCharacters([]);
        setSlideWidth(0);
        // setCharactersToReview(shuffleArray(charactersMissingInLocal));
        setCharactersToReview(charactersMissingInLocal);

        setTimeout(() => {
            const element = document.querySelector('.slider-slide');
            if(element){
                const slideWidth = element.getBoundingClientRect().width;
                setSlideWidth(slideWidth);
            }
        }, 200);

    
    }, []);


    // When charactersToReview changes
    useEffect(() => {
        console.log('learnedCharacters state updated:');
        console.log(learnedCharacters);
    }, [learnedCharacters]);

    // When charactersToReview changes
    useEffect(() => {
        console.log('charactersToReview state updated:');
        console.log(charactersToReview);
    }, [charactersToReview]);


    // useEffect(() => {
    //   // Count the learned characters
    //   const learnedCharactersInLocal: number[] = JSON.parse(localStorage.getItem('learnedLetters') || '[]');
    //   setLearnedCharactersCount(learnedCharactersInLocal.length);
    //   // Load font setting from local storage
    //   const storedFontSettingFromLocal = localStorage.getItem('fontType');
    //   if (storedFontSettingFromLocal !== null) {
    //     setFontType(storedFontSettingFromLocal as 'sans' | 'serif');
    //   }
    //   if(screen == 'gameplay'){
    //     if (processedCharacters.length >= charactersToReview.length) {
    //       changeScreen('all_reviewed');
    //     }
    //   }
    // }, [processedCharacters, charactersToReview.length, screen]);


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
        const learnedCharactersInLocal: number[] = JSON.parse(localStorage.getItem('learnedLetters') || '[]');
        localStorage.setItem('learnedLetters', JSON.stringify([...learnedCharactersInLocal, characterId]));
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


    return (
        <div className='h-svh flex flex-col justify-between py-4'>

            {/* <div className={`screen-gameplay font-type-${fontType}`}> */}
            <div className={`screen-gameplay`}>

                <div className='w-full max-w-2xl mx-auto p-4'>
                    <div className="navbar">
                        <div className="navbar-row">
                            <div className="navbar-aside">
                            <Link href="/alphabet" className='navbar-button'>
                                <Image
                                src="/images/icon-back.svg"
                                alt="Back"
                                width={24}
                                height={24}
                                />
                            </Link>
                            </div>
                            <div className="navbar-title"></div>
                            <div className="navbar-aside"></div>
                        </div>
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

            {/* {screen === 'all_reviewed' && (
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
            )} */}

        
        </div>
    )


}
