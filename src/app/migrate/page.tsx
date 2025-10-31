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
            Populate the database with sample data for phrase courses.
          </p>
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