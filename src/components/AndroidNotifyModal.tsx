'use client';

import { useState } from 'react';
import Modal from '@/components/common/Modal';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@root/firebaseConfig';
import { Loader2, CheckCircle2, Bell } from 'lucide-react';

interface AndroidNotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalState = 'form' | 'loading' | 'success';

export default function AndroidNotifyModal({ isOpen, onClose }: AndroidNotifyModalProps) {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [error, setError] = useState('');
  const [modalState, setModalState] = useState<ModalState>('form');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setModalState('loading');

    try {
      await addDoc(collection(db, 'app_notify_subscribers'), {
        email: email.trim().toLowerCase(),
        platform: 'android',
        createdAt: serverTimestamp(),
      });

      setSubmittedEmail(email.trim());
      setModalState('success');
    } catch (err) {
      console.error('Error saving email:', err);
      setError('Something went wrong. Please try again.');
      setModalState('form');
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setModalState('form');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={modalState !== 'loading'}>
      {modalState === 'form' && (
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
            <Bell className="h-7 w-7 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">Android App Coming Soon!</h2>
            <p className="text-gray-600 text-sm">
              We&apos;re working hard to bring Tbilingo to Android. Leave your email and we&apos;ll
              notify you the moment it&apos;s available on Play Market.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-3">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="Enter your email"
                className="text-lg font-medium w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                autoComplete="email"
              />
              {error && <p className="text-red-500 text-sm mt-1 text-left">{error}</p>}
            </div>
            <button type="submit" className="btn btn-primary btn-block">Waitlist Me</button>
          </form>
        </div>
      )}

      {modalState === 'loading' && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-10 w-10 text-accent-500 animate-spin" />
          <p className="text-gray-600">Saving your email...</p>
        </div>
      )}

      {modalState === 'success' && (
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">You&apos;re on the list!</h2>
            <p className="text-gray-600 text-sm">
              We&apos;ll send a notification to
              <span className="font-semibold text-gray-800">{submittedEmail}</span> when our Android app launches.
            </p>
          </div>

          <button onClick={handleClose} className="btn btn-primary btn-large btn-block">
            Got it!
          </button>
        </div>
      )}
    </Modal>
  );
}
