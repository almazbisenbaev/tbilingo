"use client";

import { useState, useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { alphabet } from '@/data/alphabet';



export default function AlphabetCourse() {

  const [learnedCharacters, setLearnedCharacters] = useState<number[]>([]); // Store characters that the viewers has seen suring the gameplay
  const [learnedCharactersCount, setLearnedCharactersCount] = useState<number>(0); // Store the learned characters from localstorage


  useEffect(() => {
    
    // Load learned characters from localstorage
    const learnedCharactersInLocal = JSON.parse(localStorage.getItem('learnedLetters') || '[]');
    setLearnedCharacters(learnedCharactersInLocal);
    setLearnedCharactersCount(learnedCharactersInLocal.length);

  }, []);




  return (
    <div className='h-screen flex flex-col justify-between py-4'>

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
                <h1 className="navbar-title">Learn alphabet</h1>
                <div className="navbar-aside"></div>
            </div>
        </div>
      </div>

      <div className='w-full max-w-2xl mx-auto p-4'>
        <div className='text-center'>Learned <b>{learnedCharactersCount}</b> out of <b>{alphabet.length}</b> characters</div>
      </div>


      <div className='w-full max-w-2xl mx-auto p-4'>
        <Link href="/alphabet/learn" className='btn btn-block btn-primary'>Start learning</Link>
      </div>

    </div>
  )
}
