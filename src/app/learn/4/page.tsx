// Level: Basic Phrases

"use client";

const level_id = 'phrases-essential';
// console.log(level_id);

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { PhraseItem, PhraseMemory } from '@/types';
import { shuffleArray } from '@/utils/shuffle-array';
import { collection, doc, getDocs, setDoc, getDoc, query, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@root/firebaseConfig';

import AppHeader from '@/components/layout/AppHeader';


import ProgressBar from '@/components/ProgressBar/ProgressBar';
import SentenceForm from '@/components/SentenceForm/SentenceForm';

import Image from 'next/image';
import Link from 'next/link';

const LEVEL_TITLE = 'Essential Phrases';
const LEVEL_DESCRIPTION = 'Advanced Georgian phrases with sentence construction gameplay';

function PhrasesProgressCard({
  course,
  phrases,
  onLoading,
  onLoaded,
}: {
  course: { title: string; description: string; icon: string };
  phrases: PhraseItem[];
  onLoading: () => void;
  onLoaded: (learnedIds: number[], itemProgress: Record<string, number>) => void;
}) {
  const [learnedCount, setLearnedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      onLoading();
      setLearnedCount(0);

      try {
        const user = auth.currentUser;
        let learnedIds: number[] = [];
        let itemProgress: Record<string, number> = {};

        if (user) {
          const progressRef = doc(db, 'users', user.uid, 'progress', String(level_id));
          const progressSnap = await getDoc(progressRef);
          const learnedItemIds: string[] = progressSnap.exists()
            ? (((progressSnap.data() as any).learnedItemIds as string[]) || [])
            : [];
          itemProgress = progressSnap.exists() ? ((progressSnap.data() as any).itemProgress || {}) : {};
          learnedIds = learnedItemIds.map((id) => parseInt(id));
        }

        if (cancelled) return;

        setLearnedCount(learnedIds.length);
        onLoaded(learnedIds, itemProgress);
      } catch (e) {
        console.error('Error loading progress:', e);
        if (!cancelled) {
          setLearnedCount(0);
          onLoaded([], {});
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
    // Intentionally mount-only: the parent toggles this card on/off.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-480 level-intro-content">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="mb-4 relative w-24 h-24">
          <Image src={course.icon} alt={course.title} fill className="object-contain" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
        <p className="text-gray-500">{course.description}</p>
      </div>

      <div className=" w-full bg-white/50 rounded-2xl p-6 mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-gray-500">Progress</span>
          <span className="text-2xl font-bold text-primary">
            {phrases.length > 0 ? Math.round((learnedCount / phrases.length) * 100) : 0}%
          </span>
        </div>
        <ProgressBar current={learnedCount} total={phrases.length} width="100%" />
        <div className="mt-2 text-center text-sm text-gray-400">
          {learnedCount} / {phrases.length} phrases learned
        </div>
      </div>
    </div>
  );
}

export default function PhrasesPage() {




  // State for phrases data fetching
  const [phrases, setPhrases] = useState<PhraseItem[]>([]);
  const [phrasesLoading, setPhrasesLoading] = useState<boolean>(true);
  const [phrasesError, setPhrasesError] = useState<string | null>(null);

  const [learnedPhrases, setLearnedPhrases] = useState<number[]>([]);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [phrasesMemory, setPhrasesMemory] = useState<Record<number, PhraseMemory>>({});

  const [isGameplayActive, setIsGameplayActive] = useState<boolean>(false);
  const [processedPhrases, setProcessedPhrases] = useState<number[]>([]);
  const [phrasesToReview, setPhrasesToReview] = useState<PhraseItem[]>([]);
  const [allCardsReviewed, setAllCardsReviewed] = useState<boolean>(false);

  const [courseInfo, setCourseInfo] = useState<{title: string, description: string, icon: string} | null>(null);

  // Fetch course info
  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        const courseRef = doc(db, 'courses', String(level_id));
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
          const data = courseSnap.data();
          setCourseInfo({
            title: data.title || LEVEL_TITLE,
            description: data.description || LEVEL_DESCRIPTION,
            icon: data.icon || '/images/icon-phrases.svg'
          });
        } else {
           setCourseInfo({
            title: LEVEL_TITLE,
            description: LEVEL_DESCRIPTION,
            icon: '/images/icon-phrases.svg'
          });
        }
      } catch (e) {
        console.error('Error fetching course info:', e);
         setCourseInfo({
            title: LEVEL_TITLE,
            description: LEVEL_DESCRIPTION,
            icon: '/images/icon-phrases.svg'
          });
      }
    };
    fetchCourseInfo();
  }, []);

  // Fetch phrases data from Firebase
  useEffect(() => {
    const fetchPhrasesData = async () => {
      try {
        setPhrasesLoading(true);
        setPhrasesError(null);

        const itemsRef = collection(db, 'courses', String(level_id), 'items');
        const qItems = query(itemsRef);
        const snapshot = await getDocs(qItems);
        const phraseItems: PhraseItem[] = snapshot.docs.map(docSnap => ({
          id: typeof docSnap.id === 'string' ? parseInt(docSnap.id) : (docSnap.id as unknown as number),
          english: (docSnap.data() as any).english,
          georgian: (docSnap.data() as any).georgian,
          latin: typeof (docSnap.data() as any).latin === 'string' ? (docSnap.data() as any).latin : '',
          fakeWords: Array.isArray((docSnap.data() as any).fakeWords) ? (docSnap.data() as any).fakeWords : [],
        })).sort((a, b) => a.id - b.id);
        setPhrases(phraseItems);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error fetching phrases data:', error);
        setPhrasesError(errorMessage);
      } finally {
        setPhrasesLoading(false);
      }
    };

    fetchPhrasesData();
  }, []);

  const handleProgressLoading = () => {
    setProgressLoaded(false);
    setLearnedPhrases([]);
    const emptyMemory: Record<number, PhraseMemory> = {};
    phrases.forEach((phrase) => {
      emptyMemory[phrase.id] = { correctAnswers: 0, isLearned: false };
    });
    setPhrasesMemory(emptyMemory);
  };

  const handleProgressLoaded = (learnedIds: number[], itemProgress: Record<string, number>) => {
    const nextMemory: Record<number, PhraseMemory> = {};
    phrases.forEach((phrase) => {
      const isLearned = learnedIds.includes(phrase.id);
      let correct = itemProgress[String(phrase.id)] || 0;
      if (isLearned) correct = 3; // Enforce 3 if in learned list
      nextMemory[phrase.id] = { correctAnswers: correct, isLearned };
    });
    setPhrasesMemory(nextMemory);
    setLearnedPhrases(learnedIds);
    setProgressLoaded(true);
  };

  // Check if all cards reviewed
  useEffect(() => {
    if (phrasesToReview.length > 0 && processedPhrases.length === phrasesToReview.length) {
      setAllCardsReviewed(true);
    } else {
      setAllCardsReviewed(false);
    }
  }, [processedPhrases, phrasesToReview]);

  useEffect(() => {
    if (allCardsReviewed) {
      (async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;
          const progressRef = doc(db, 'users', user.uid, 'progress', String(level_id));
          const snap = await getDoc(progressRef);
          const learnedItemIds: string[] = snap.exists() ? ((snap.data() as any).learnedItemIds || []) : [];
          const totalItems = phrases.length;
          if (totalItems > 0 && learnedItemIds.length >= totalItems) {
            await setDoc(
              progressRef,
              {
                userId: user.uid,
                courseId: String(level_id),
                isFinished: true,
                lastUpdated: serverTimestamp(),
                createdAt: snap.exists() ? ((snap.data() as any).createdAt || serverTimestamp()) : serverTimestamp()
              },
              { merge: true }
            );
          }
        } catch (e) {
          console.error('❌ Error marking level finished:', e);
        }
      })();
    }
  }, [allCardsReviewed, phrases.length]);

  const handleCorrectAnswer = async (phraseId: number) => {
    setPhrasesMemory(prev => {
      const current = prev[phraseId] || { correctAnswers: 0, isLearned: false };
      const nextCorrect = Math.min(3, current.correctAnswers + 1);
      const nextLearned = nextCorrect >= 3;
      const updated = { correctAnswers: nextCorrect, isLearned: nextLearned };
      
      if (nextLearned && !learnedPhrases.includes(phraseId)) {
        setLearnedPhrases(lp => lp.includes(phraseId) ? lp : [...lp, phraseId]);
      }
      
      const user = auth.currentUser;
      if (user) {
        (async () => {
          try {
            const progressRef = doc(db, 'users', user.uid, 'progress', String(level_id));
            const snap = await getDoc(progressRef);
            const currentDoc = snap.exists() ? (snap.data() as any) : null;
            const currentIds: string[] = currentDoc?.learnedItemIds || [];
            const currentItemProgress = currentDoc?.itemProgress || {};

            let updatedIds = [...currentIds];
            if (nextLearned) {
              if (!updatedIds.includes(String(phraseId))) {
                updatedIds.push(String(phraseId));
              }
            }

            const updatedItemProgress = { ...currentItemProgress, [String(phraseId)]: nextCorrect };

            const isFinished = currentDoc?.isFinished === true || (phrases.length > 0 && updatedIds.length >= phrases.length);
            
            await setDoc(progressRef, {
              userId: user.uid,
              courseId: String(level_id),
              learnedItemIds: updatedIds,
              itemProgress: updatedItemProgress,
              isFinished,
              lastUpdated: serverTimestamp(),
              createdAt: currentDoc?.createdAt || serverTimestamp()
            }, { merge: true });
            
          } catch (e) {
            console.error('❌ Error saving learned phrase:', e);
          }
        })();
      }
      
      return { ...prev, [phraseId]: updated };
    });
  };

  const handleWrongAnswer = async (phraseId: number) => {
    setPhrasesMemory(prev => {
      const current = prev[phraseId] || { correctAnswers: 0, isLearned: false };
      const nextCorrect = Math.max(0, current.correctAnswers - 1);
      const nextLearned = nextCorrect >= 3;
      const updated = { correctAnswers: nextCorrect, isLearned: nextLearned };
      if (!nextLearned) {
        setLearnedPhrases(prevLearned => prevLearned.filter(id => id !== phraseId));
      }

      // Persist "unlearn" and updated count so Firestore matches in-memory state.
      const user = auth.currentUser;
      if (user) {
        (async () => {
          try {
            const progressRef = doc(db, 'users', user.uid, 'progress', String(level_id));
            const snap = await getDoc(progressRef);
            const currentDoc = snap.exists() ? (snap.data() as any) : null;
            const currentIds: string[] = currentDoc?.learnedItemIds || [];
            const currentItemProgress = currentDoc?.itemProgress || {};

            let updatedIds = [...currentIds];
            if (!nextLearned) {
               updatedIds = updatedIds.filter((id) => id !== String(phraseId));
            }
            
            const updatedItemProgress = { ...currentItemProgress, [String(phraseId)]: nextCorrect };

            const isFinished = currentDoc?.isFinished === true || (phrases.length > 0 && updatedIds.length >= phrases.length);
            
            await setDoc(
              progressRef,
              {
                userId: user.uid,
                courseId: String(level_id),
                learnedItemIds: updatedIds,
                itemProgress: updatedItemProgress,
                isFinished,
                lastUpdated: serverTimestamp(),
                createdAt: currentDoc?.createdAt || serverTimestamp(),
              },
              { merge: true }
            );
          } catch (e) {
            console.error('❌ Error persisting unlearned phrase:', e);
          }
        })();
      }
      return { ...prev, [phraseId]: updated };
    });
  };

  const startGameplay = () => {
    setProcessedPhrases([]);
    setAllCardsReviewed(false);

    const learnedPhrasesInLocal = learnedPhrases;

    let phrasesMissingInLocal = phrases.filter((phrase) => !learnedPhrasesInLocal.includes(phrase.id));

    if (phrasesMissingInLocal.length === 0) {
      phrasesMissingInLocal = [...phrases];
    }

    const shuffledPhrasesMissingInLocal = shuffleArray(phrasesMissingInLocal);
    const selectedPhrases = shuffledPhrasesMissingInLocal.slice(0, 5);

    setPhrasesToReview(selectedPhrases);
    setIsGameplayActive(true);
  };

  const resetGameplay = () => {
    // Ensure intro screen mounts with 0 progress (no stale flash)
    setProgressLoaded(false);
    setLearnedPhrases([]);
    setPhrasesMemory({});
    setIsGameplayActive(false);
    setAllCardsReviewed(false);
    setProcessedPhrases([]);
    setPhrasesToReview([]);
  };

  const markAsToReview = (phraseId: number) => {
    if (!processedPhrases.includes(phraseId)) {
      setTimeout(() => {
        setProcessedPhrases((prev) => [...prev, phraseId]);
      }, 250);
    }
  };

  // Show loading state
  if (phrasesLoading) {
    return (
      <div className="fullscreen-center">Loading...</div>
    );
  }

  // Show error state
  if (phrasesError) {
    return (
      <div className="fullscreen-center">
        Error loading phrases: {phrasesError}
      </div>
    );
  }

  // Show empty state
  if (phrases.length === 0) {
    return (
      <div className="fullscreen-center">
        No phrases data found. Please use the migration page to add sample data.
      </div>
    );
  }

  // Level intro page
  if (!isGameplayActive) {
    const isFinished = phrases.length > 0 && learnedPhrases.length >= phrases.length;

    return (
      <div className="app app-screen">

        <div className="navbar">
          <div className="navbar-row">
            <div className="navbar-aside">
              <Link href="/learn" className='navbar-button'>
                <Image src="/images/icon-back.svg" alt="Back" width={24} height={24} />
              </Link>
            </div>
            {/* Previously hardcoded: LEVEL_TITLE = "Essential Phrases" */}
            <h1 className="navbar-title">{courseInfo?.title || LEVEL_TITLE}</h1>
            <div className="navbar-aside"></div>
          </div>
        </div>

        {courseInfo && (
          <PhrasesProgressCard
            course={courseInfo}
            phrases={phrases}
            onLoading={handleProgressLoading}
            onLoaded={handleProgressLoaded}
          />
        )}

        {progressLoaded && (
          <div className="levelscreen-footer">
            {isFinished ? (
              <div className='text-center p-6 bg-green-50 rounded-xl'>
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="font-bold text-lg text-green-800">Course Completed!</h3>
                <p className="text-green-600">You've learned all phrases</p>
              </div>
            ) : (
              <button onClick={startGameplay} className='btn btn-block btn-primary btn-large mb-2'>
                Start Session
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Level completion page
  if (allCardsReviewed) {
    const sessionLearnedCount = learnedPhrases.filter(id =>
      phrasesToReview.some(phrase => phrase.id === id)
    ).length;

    return (
      <motion.div
        className="app app-screen"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1]
        }}
      >
        
        <div className="navbar">
          <div className="navbar-row">
            <div className="navbar-aside">
              <button onClick={resetGameplay} className='navbar-button'>
                <Image src="/images/icon-back.svg" alt="Back" width={24} height={24} />
              </button>
            </div>
            {/* Previously hardcoded: LEVEL_TITLE = "Essential Phrases" */}
            <h1 className="navbar-title">{courseInfo?.title || LEVEL_TITLE}</h1>
            <div className="navbar-aside"></div>
          </div>
        </div>

        <div className="container-480">
          <div className="text-center">
            <div className='text-4xl mb-4'>🎉</div>
            <h2 className='font-semibold text-2xl mb-4'>Great work!</h2>
            <div className='text-lg'>
              <p className='mb-2'>You completed this session!</p>
              <p className='mb-2'>Session progress: <b>{sessionLearnedCount}</b> phrases mastered</p>
              <p>Total progress: <b>{learnedPhrases.length}</b> / <b>{phrases.length}</b> learned</p>
            </div>
          </div>
        </div>

        <div className="levelscreen-footer">
          <button onClick={startGameplay} className='btn btn-block btn-primary mb-2'>
            Continue Learning
          </button>
          <button onClick={resetGameplay} className='btn btn-block btn-secondary'>
            Go Back
          </button>
        </div>
      </motion.div>
    );
  }

  // Active gameplay
  return (
    <div className="app app-screen level-phrases-advanced">
      <div className="container-480">
        <AppHeader
          title={
            <ProgressBar
              current={processedPhrases.length}
              total={phrasesToReview.length}
              width="200px"
              height={12}
            />
          }
          showBackButton
          onBackClick={resetGameplay}
          customBackIcon={<X size={24} />}
        />
      </div>
      <div className="container-480">
        {phrasesToReview.map((item, index) => {
          if (index === processedPhrases.length) {
            return (
              <SentenceForm
                key={item.id}
                phrase={item}
                memory={phrasesMemory[item.id] || { correctAnswers: 0, isLearned: false }}
                onNext={() => markAsToReview(item.id)}
                onCorrectAnswer={() => handleCorrectAnswer(item.id)}
                onWrongAnswer={() => handleWrongAnswer(item.id)}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
