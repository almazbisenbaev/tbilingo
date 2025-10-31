"use client";

import { useState } from 'react';
import { EnhancedFirebaseService } from '@/services/enhancedFirebase';
import { PHRASE_COURSES, COURSE_SAMPLE_DATA } from '@/constants/courseData';
import Link from 'next/link';
import Image from 'next/image';

export default function MigratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleMigration = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');

      let createdCourses = 0;
      let totalItems = 0;

      // Migrate all phrase courses
      for (const course of PHRASE_COURSES) {
        setMessage(`Creating course: ${course.title}...`);
        
        const sampleData = COURSE_SAMPLE_DATA[course.id] || [];
        
        // Create course definition
        const courseDefinition = {
          id: course.id,
          title: course.title,
          description: course.description,
          type: 'phrases' as const,
          difficulty: course.difficulty as 'beginner' | 'intermediate' | 'advanced',
          isActive: true,
          totalItems: sampleData.length,
          estimatedTime: course.estimatedTime,
          prerequisites: course.prerequisites,
          tags: course.tags,
          icon: course.icon,
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

        await EnhancedFirebaseService.createCourse(courseDefinition);

        if (sampleData.length > 0) {
          setMessage(`Adding ${sampleData.length} items to ${course.title}...`);
          
          const courseItems = sampleData.map(phrase => ({
            id: phrase.id,
            english: phrase.english,
            georgian: phrase.georgian
          }));

          await EnhancedFirebaseService.addCourseItems(course.id, courseItems);
          totalItems += sampleData.length;
        }
        
        createdCourses++;
      }

      setMessage(`✅ Successfully migrated ${createdCourses} phrase courses with ${totalItems} total phrases to the database!`);
      setIsLoading(false);

    } catch (error) {
      console.error('Migration error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handleAlphabetClone = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');

      setMessage('Cloning alphabet collection to 1...');

      // Clone alphabet collection to 1
      await EnhancedFirebaseService.cloneCourse('alphabet', '1');

      setMessage('✅ Successfully cloned alphabet collection to 1!');
      setIsLoading(false);

    } catch (error) {
      console.error('Clone error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handleNumbersClone = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');

      setMessage('Cloning numbers collection to 2...');

      // Clone numbers collection to 2
      await EnhancedFirebaseService.cloneCourse('numbers', '2');

      setMessage('✅ Successfully cloned numbers collection to 2!');
      setIsLoading(false);

    } catch (error) {
      console.error('Clone error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handleWordsClone = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');

      setMessage('Cloning phrases-1 collection to 3...');

      // Clone phrases-1 collection to 3
      await EnhancedFirebaseService.cloneCourse('phrases-1', '3');

      setMessage('✅ Successfully cloned phrases-1 collection to 3!');
      setIsLoading(false);

    } catch (error) {
      console.error('Clone error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handlePhrasesAdvancedClone = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');

      setMessage('Cloning phrases-2 collection to 4...');

      // Clone phrases-2 collection to 4
      await EnhancedFirebaseService.cloneCourse('phrases-2', '4');

      setMessage('✅ Successfully cloned phrases-2 collection to 4!');
      setIsLoading(false);

    } catch (error) {
      console.error('Clone error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handleBusinessClone = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');
      setMessage('Cloning phrases-business collection to 5...');
      await EnhancedFirebaseService.cloneCourse('phrases-business', '5');
      setMessage('✅ Successfully cloned phrases-business collection to 5!');
      setIsLoading(false);
    } catch (error) {
      console.error('Clone error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handleTravelClone = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');
      setMessage('Cloning phrases-travel collection to 6...');
      await EnhancedFirebaseService.cloneCourse('phrases-travel', '6');
      setMessage('✅ Successfully cloned phrases-travel collection to 6!');
      setIsLoading(false);
    } catch (error) {
      console.error('Clone error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handleRestaurantClone = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');
      setMessage('Cloning phrases-restaurant collection to 7...');
      await EnhancedFirebaseService.cloneCourse('phrases-restaurant', '7');
      setMessage('✅ Successfully cloned phrases-restaurant collection to 7!');
      setIsLoading(false);
    } catch (error) {
      console.error('Clone error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handleShoppingClone = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');
      setMessage('Cloning phrases-shopping collection to 8...');
      await EnhancedFirebaseService.cloneCourse('phrases-shopping', '8');
      setMessage('✅ Successfully cloned phrases-shopping collection to 8!');
      setIsLoading(false);
    } catch (error) {
      console.error('Clone error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handleFamilyClone = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');
      setMessage('Cloning phrases-family collection to 9...');
      await EnhancedFirebaseService.cloneCourse('phrases-family', '9');
      setMessage('✅ Successfully cloned phrases-family collection to 9!');
      setIsLoading(false);
    } catch (error) {
      console.error('Clone error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handleMedicalClone = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');
      setMessage('Cloning phrases-medical collection to 10...');
      await EnhancedFirebaseService.cloneCourse('phrases-medical', '10');
      setMessage('✅ Successfully cloned phrases-medical collection to 10!');
      setIsLoading(false);
    } catch (error) {
      console.error('Clone error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handleDirectionsClone = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');
      setMessage('Cloning phrases-directions collection to 11...');
      await EnhancedFirebaseService.cloneCourse('phrases-directions', '11');
      setMessage('✅ Successfully cloned phrases-directions collection to 11!');
      setIsLoading(false);
    } catch (error) {
      console.error('Clone error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handleWeatherClone = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');
      setMessage('Cloning phrases-weather collection to 12...');
      await EnhancedFirebaseService.cloneCourse('phrases-weather', '12');
      setMessage('✅ Successfully cloned phrases-weather collection to 12!');
      setIsLoading(false);
    } catch (error) {
      console.error('Clone error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handleCultureClone = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');
      setMessage('Cloning phrases-culture collection to 13...');
      await EnhancedFirebaseService.cloneCourse('phrases-culture', '13');
      setMessage('✅ Successfully cloned phrases-culture collection to 13!');
      setIsLoading(false);
    } catch (error) {
      console.error('Clone error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handleEmergencyClone = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');
      setMessage('Cloning phrases-emergency collection to 14...');
      await EnhancedFirebaseService.cloneCourse('phrases-emergency', '14');
      setMessage('✅ Successfully cloned phrases-emergency collection to 14!');
      setIsLoading(false);
    } catch (error) {
      console.error('Clone error:', error);
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

        {/* Course Collection Clones Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Core Courses Collection Clone</h2>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Clone course collections to numbered IDs to align database structure with course IDs.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> This will copy all course data and items from each collection.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAlphabetClone}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isLoading ? 'Cloning...' : 'Clone Alphabet → 1'}
            </button>

            <button
              onClick={handleNumbersClone}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isLoading ? 'Cloning...' : 'Clone Numbers → 2'}
            </button>

            <button
              onClick={handleWordsClone}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-pink-600 hover:bg-pink-700 text-white'
              }`}
            >
              {isLoading ? 'Cloning...' : 'Clone Words → 3'}
            </button>

            <button
              onClick={handlePhrasesAdvancedClone}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {isLoading ? 'Cloning...' : 'Clone Phrases Advanced → 4'}
            </button>
          </div>
        </div>

        {/* Phrase Courses Collection Clones Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Phrase Courses Collection Clone</h2>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Clone phrase course collections (5-14) to their numbered IDs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleBusinessClone}
              disabled={isLoading}
              className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isLoading ? 'Cloning...' : 'Business → 5'}
            </button>

            <button
              onClick={handleTravelClone}
              disabled={isLoading}
              className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isLoading ? 'Cloning...' : 'Travel → 6'}
            </button>

            <button
              onClick={handleRestaurantClone}
              disabled={isLoading}
              className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isLoading ? 'Cloning...' : 'Restaurant → 7'}
            </button>

            <button
              onClick={handleShoppingClone}
              disabled={isLoading}
              className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              {isLoading ? 'Cloning...' : 'Shopping → 8'}
            </button>

            <button
              onClick={handleFamilyClone}
              disabled={isLoading}
              className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              {isLoading ? 'Cloning...' : 'Family → 9'}
            </button>

            <button
              onClick={handleMedicalClone}
              disabled={isLoading}
              className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-pink-500 hover:bg-pink-600 text-white'
              }`}
            >
              {isLoading ? 'Cloning...' : 'Medical → 10'}
            </button>

            <button
              onClick={handleDirectionsClone}
              disabled={isLoading}
              className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              {isLoading ? 'Cloning...' : 'Directions → 11'}
            </button>

            <button
              onClick={handleWeatherClone}
              disabled={isLoading}
              className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white'
              }`}
            >
              {isLoading ? 'Cloning...' : 'Weather → 12'}
            </button>

            <button
              onClick={handleCultureClone}
              disabled={isLoading}
              className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {isLoading ? 'Cloning...' : 'Culture → 13'}
            </button>

            <button
              onClick={handleEmergencyClone}
              disabled={isLoading}
              className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}
            >
              {isLoading ? 'Cloning...' : 'Emergency → 14'}
            </button>
          </div>
        </div>

        {/* Migration Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">All Phrase Courses Migration</h2>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This will create {PHRASE_COURSES.length} phrase courses with sample Georgian phrases:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
              {PHRASE_COURSES.map(course => (
                <li key={course.id}>{course.title} - {COURSE_SAMPLE_DATA[course.id]?.length || 0} phrases</li>
              ))}
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
            {isLoading ? 'Migrating...' : 'Migrate All Phrase Courses'}
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
          <div className="mt-6 space-y-2">
            <p className="text-gray-600 text-sm">Try the new phrase courses:</p>
            <div className="grid grid-cols-2 gap-2">
              {PHRASE_COURSES.slice(0, 6).map(course => (
                <Link 
                  key={course.id}
                  href={course.route}
                  className="bg-green-600 hover:bg-green-700 text-white text-center py-2 px-3 rounded text-sm font-medium transition-colors"
                >
                  {course.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}