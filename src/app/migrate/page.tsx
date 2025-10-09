"use client";

import { useState } from 'react';
import { EnhancedFirebaseService } from '@/services/enhancedFirebase';
import Link from 'next/link';
import Image from 'next/image';

// Sample data for phrases-2 course
const samplePhrasesData = [
  {
    id: "1",
    english: "I am hungry",
    georgian: "მე მშია"
  },
  {
    id: "2", 
    english: "Where is the bathroom?",
    georgian: "სად არის ტუალეტი?"
  },
  {
    id: "3",
    english: "How much does this cost?",
    georgian: "რა ღირს ეს?"
  },
  {
    id: "4",
    english: "I don't understand",
    georgian: "არ მესმის"
  },
  {
    id: "5",
    english: "Can you help me?",
    georgian: "შეგიძლია დამეხმარო?"
  },
  {
    id: "6",
    english: "What time is it?",
    georgian: "რომელი საათია?"
  },
  {
    id: "7",
    english: "I am lost",
    georgian: "გზა დამიკარგავს"
  },
  {
    id: "8",
    english: "The weather is nice",
    georgian: "ამინდი კარგია"
  },
  {
    id: "9",
    english: "I need a doctor",
    georgian: "ექიმი მჭირდება"
  },
  {
    id: "10",
    english: "See you tomorrow",
    georgian: "ხვალ ნახვამდის"
  }
];

export default function MigratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleMigration = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');

      // First, create the course definition
      const courseDefinition = {
        id: 'phrases-2',
        title: 'Phrases Advanced',
        description: 'Advanced Georgian phrases with sentence construction gameplay',
        type: 'phrases' as const,
        difficulty: 'intermediate' as const,
        isActive: true,
        totalItems: samplePhrasesData.length,
        estimatedTime: 45,
        prerequisites: ['phrases-1'],
        tags: ['intermediate', 'phrases', 'sentences'],
        icon: '/images/icon-phrases.svg',
        version: 1,
        itemSchema: {
          english: {
            type: 'string' as const,
            required: true,
            description: 'English sentence'
          },
          georgian: {
            type: 'string' as const, 
            required: true,
            description: 'Georgian translation'
          }
        }
      };

      setMessage('Creating course definition...');
      await EnhancedFirebaseService.createCourse(courseDefinition);

      setMessage('Adding course items...');
      // Transform sample data to course items format
      const courseItems = samplePhrasesData.map(phrase => ({
        id: phrase.id,
        english: phrase.english,
        georgian: phrase.georgian
      }));

      await EnhancedFirebaseService.addCourseItems('phrases-2', courseItems);

      setMessage('✅ Successfully migrated 10 sample phrases to the database!');
      setIsLoading(false);

    } catch (error) {
      console.error('Migration error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800">
              <Image
                src="/images/icon-back.svg"
                alt="Back"
                width={20}
                height={20}
                className="mr-2"
              />
              Back to Home
            </Link>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Database Migration
          </h1>
          <p className="text-gray-600">
            Populate the database with sample data for the "Phrases Advanced" course.
          </p>
        </div>

        {/* Migration Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Phrases Advanced Course</h2>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This will create the "Phrases Advanced" course with 10 sample Georgian phrases. 
              Each phrase includes:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
              <li>English sentence</li>
              <li>Georgian translation (words are extracted automatically in the app)</li>
            </ul>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Make sure you have temporarily updated the Firestore rules 
                to allow write access before running this migration.
              </p>
            </div>
          </div>

          {/* Migration Button */}
          <button
            onClick={handleMigration}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? 'Migrating...' : 'Migrate Learning Data'}
          </button>

          {/* Status Messages */}
          {message && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{message}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}
        </div>

        {/* Links */}
        {message.includes('Successfully') && (
          <div className="mt-6 flex gap-4">
            <Link 
              href="/phrases-2"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Try Phrases Advanced Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}