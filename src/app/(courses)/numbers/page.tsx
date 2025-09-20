"use client";

import { useState, useEffect } from 'react';
import { useBackToHomeNavigation } from '@/utils/useBackButtonHandler';
import { useProgressStore } from '@/stores/progressStore';
import { useFontStore } from '@/stores/fontStore';
import { numbers } from '@/data/numbers';
import { shuffleArray } from '@/utils/shuffle-array';
// import FlashcardNumber from '@/components/FlashcardNumber';
// import ConfirmationDialog from '@/components/ConfirmationDialog';
import SuccessPopup from '@/components/SuccessPopup';

import Image from 'next/image';
import Link from 'next/link';

interface NumberItem {
  id: number;
  number: string;
  translation: string;
  translationLatin: string;
}

export default function NumbersCourse() {
    useBackToHomeNavigation();
    
    const { getCourseProgress, addLearnedItem, initializeCourse } = useProgressStore();
    const { fontType } = useFontStore();
    
    const [isGameplayActive, setIsGameplayActive] = useState(false);
    const [charactersToReview, setCharactersToReview] = useState<NumberItem[]>([]);
    const [processedCharacters, setProcessedCharacters] = useState<number[]>([]);
    const [learnedCharacters, setLearnedCharacters] = useState<number[]>([]);
    const [allCardsReviewed, setAllCardsReviewed] = useState(false);
    const [slideWidth, setSlideWidth] = useState(0);

    // Initialize course progress on component mount
    useEffect(() => {
        
        
        // Initialize course with total items
        initializeCourse('numbers', numbers.length);
        
        // Load current progress
        const numbersProgress = getCourseProgress('numbers');
        setLearnedCharacters(numbersProgress.learnedItems);
    }, [getCourseProgress, initializeCourse]);

    const endGameplay = () => {
        setIsGameplayActive(false);
        setAllCardsReviewed(false);
        setProcessedCharacters([]);
        setCharactersToReview([]);
        // Reload learned characters
        const numbersProgress = getCourseProgress('numbers');
        setLearnedCharacters(numbersProgress.learnedItems);
    };

    const startGameplay = () => {
        // Get previously learned characters from progress store
        const numbersProgress = getCourseProgress('numbers');
        const learnedCharactersInLocal = numbersProgress.learnedItems;
        
        // Filter out characters that have already been learned
        const charactersMissingInLocal = numbers.filter((number: NumberItem) => !learnedCharactersInLocal.includes(number.id));
        
        // Reset session state
        setProcessedCharacters([]);
        setLearnedCharacters(learnedCharactersInLocal);
        setSlideWidth(0);

        // Shuffle remaining characters and select a subset for this session
        const shuffledCharactersMissingInLocal = shuffleArray(charactersMissingInLocal);
        // Limit to 10 characters per session for better learning experience
        const selectedCharacters = shuffledCharactersMissingInLocal.slice(0, 10);

        // Update state to start the gameplay
        setCharactersToReview(selectedCharacters);
        setIsGameplayActive(true);

        // Calculate slide width after component renders for proper animations
        setTimeout(() => {
            const element = document.querySelector('.slider-slide');
            if(element){
                const slideWidth = element.getBoundingClientRect().width;
                setSlideWidth(slideWidth);
            }
        }, 200); // Short delay to ensure DOM is ready
    };

    // Check if all cards have been reviewed
    useEffect(() => {
        if (charactersToReview.length > 0 && processedCharacters.length === charactersToReview.length) {
            setAllCardsReviewed(true);
        }
    }, [processedCharacters, charactersToReview]);

    const switchSlide = (index: number, element: HTMLElement | null) => {
        if (!element) return;
        
        const slideWidth = element.getBoundingClientRect().width;
        const sliderTrack = document.querySelector('.slider-track') as HTMLElement | null;
        
        if(sliderTrack){
            const currentTransform = getComputedStyle(sliderTrack).transform;
            const matrix = new window.DOMMatrix(currentTransform);
            const currentTranslateX = matrix.m41;
            
            sliderTrack.style.transform = `translateX(${currentTranslateX - slideWidth}px)`;
        }
    }

    const saveNumberToLocal = (characterId: number) => {
        // Add the learned character to the progress store
        addLearnedItem('numbers', characterId);
    };

    // Main numbers page
    if (!isGameplayActive) {
        return (
            <div className='h-svh flex flex-col justify-between py-4'>

                <div className='w-full max-w-2xl mx-auto p-4'>
                    <div className="navbar">
                        <div className="navbar-row">
                            <div className="navbar-aside">
                            <Link href="/" className='navbar-button'>
                                <Image
                                src="/images/icon-back.svg"
                                alt="Back"
                                width={24}
                                height={24}
                                />
                            </Link>
                            </div>
                            <h1 className="navbar-title">Learn Numbers</h1>
                            <div className="navbar-aside"></div>
                        </div>
                    </div>
                </div>

                <div className='w-full max-w-2xl mx-auto p-4'>
                    <div className='text-center'>Learned <b>{learnedCharacters.length}</b> out of <b>{numbers.length}</b> numbers</div>
                </div>

                <div className='w-full max-w-2xl mx-auto p-4'>
                    <button onClick={startGameplay} className='btn btn-block btn-primary'>Start learning</button>
                </div>

            </div>
        )
    }

    // Gameplay interface - simplified for now since numbers don't have the same flashcard structure
    return (
        <div className='h-svh flex flex-col justify-between py-4'>
            <div className='w-full max-w-2xl mx-auto p-4'>
                <div className="navbar">
                    <div className="navbar-row">
                        <div className="navbar-aside">
                            <button onClick={endGameplay} className='navbar-button'>
                                <Image
                                src="/images/icon-back.svg"
                                alt="Back"
                                width={24}
                                height={24}
                                />
                            </button>
                        </div>
                        <h1 className="navbar-title">Learn Numbers</h1>
                        <div className="navbar-aside"></div>
                    </div>
                </div>
            </div>

            <div className='w-full max-w-2xl mx-auto p-4'>
                <div className='text-center mb-4'>
                    Progress: {processedCharacters.length} / {charactersToReview.length}
                </div>
                
                <div className="text-center">
                    <p>Numbers learning interface coming soon!</p>
                    <p>Selected {charactersToReview.length} numbers to learn.</p>
                </div>
            </div>

            <div className='w-full max-w-2xl mx-auto p-4'>
                <button onClick={endGameplay} className='btn btn-block btn-primary'>
                    End Session
                </button>
            </div>

            {allCardsReviewed && (
                <SuccessPopup
                    isOpen={allCardsReviewed}
                    title="Session Complete"
                    onClose={endGameplay}
                    message="Great job! You've completed this session."
                />
            )}
        </div>
    );
}
