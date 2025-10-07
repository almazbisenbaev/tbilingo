'use client';

import { useState } from 'react';
import { EnhancedFirebaseService } from '@/services/enhancedFirebase';

// Complete alphabet data (starting from ID 3 since 1 and 2 already exist)
const alphabetDataToAdd = [
    { character: 'გ', name: 'gani', pronunciation: 'g', id: 3, audioUrl: '/audio/gani.mp3' },
    { character: 'დ', name: 'doni', pronunciation: 'd', id: 4, audioUrl: '/audio/doni.mp3' },
    { character: 'ე', name: 'eni', pronunciation: 'e', id: 5, audioUrl: '/audio/eni.mp3' },
    { character: 'ვ', name: 'vini', pronunciation: 'v', id: 6, audioUrl: '/audio/vini.mp3' },
    { character: 'ზ', name: 'zeni', pronunciation: 'z', id: 7, audioUrl: '/audio/zeni.mp3' },
    { character: 'თ', name: 'tani', pronunciation: 'tʰ', id: 8, audioUrl: '/audio/tani.mp3' },
    { character: 'ი', name: 'ini', pronunciation: 'i', id: 9, audioUrl: '/audio/ini.mp3' },
    { character: 'კ', name: 'kani', pronunciation: 'kʼ', id: 10, audioUrl: '/audio/kani.mp3' },
    { character: 'ლ', name: 'lasi', pronunciation: 'l', id: 11, audioUrl: '/audio/lasi.mp3' },
    { character: 'მ', name: 'mani', pronunciation: 'm', id: 12, audioUrl: '/audio/mani.mp3' },
    { character: 'ნ', name: 'nari', pronunciation: 'n', id: 13, audioUrl: '/audio/nari.mp3' },
    { character: 'ო', name: 'oni', pronunciation: 'o', id: 14, audioUrl: '/audio/oni.mp3' },
    { character: 'პ', name: 'pari', pronunciation: 'pʼ', id: 15, audioUrl: '/audio/pari.mp3' },
    { character: 'ჟ', name: 'zhani', pronunciation: 'zh', id: 16, audioUrl: '/audio/zhani.mp3' },
    { character: 'რ', name: 'rae', pronunciation: 'r', id: 17, audioUrl: '/audio/rae.mp3' },
    { character: 'ს', name: 'sani', pronunciation: 's', id: 18, audioUrl: '/audio/sani.mp3' },
    { character: 'ტ', name: 'tari', pronunciation: 'tʼ', id: 19, audioUrl: '/audio/tari.mp3' },
    { character: 'უ', name: 'uni', pronunciation: 'u', id: 20, audioUrl: '/audio/uni.mp3' },
    { character: 'ფ', name: 'phari', pronunciation: 'pʰ', id: 21, audioUrl: '/audio/phari.mp3' },
    { character: 'ქ', name: 'kari', pronunciation: 'kʰ', id: 22, audioUrl: '/audio/kari.mp3' },
    { character: 'ღ', name: 'ghani', pronunciation: 'gh', id: 23, audioUrl: '/audio/ghani.mp3' },
    { character: 'ყ', name: 'qari', pronunciation: 'qʼ', id: 24, audioUrl: '/audio/qari.mp3' },
    { character: 'შ', name: 'shini', pronunciation: 'sh', id: 25, audioUrl: '/audio/shini.mp3' },
    { character: 'ჩ', name: 'chini', pronunciation: 'chʰ', id: 26, audioUrl: '/audio/chini.mp3' },
    { character: 'ც', name: 'tsani', pronunciation: 'tsʰ', id: 27, audioUrl: '/audio/tsani.mp3' },
    { character: 'ძ', name: 'dzili', pronunciation: 'dz', id: 28, audioUrl: '/audio/dzili.mp3' },
    { character: 'წ', name: 'tsili', pronunciation: 'tsʼ', id: 29, audioUrl: '/audio/tsili.mp3' },
    { character: 'ჭ', name: 'chari', pronunciation: 'chʼ', id: 30, audioUrl: '/audio/chari.mp3' },
    { character: 'ხ', name: 'khani', pronunciation: 'kh', id: 31, audioUrl: '/audio/khani.mp3' },
    { character: 'ჯ', name: 'jani', pronunciation: 'j', id: 32, audioUrl: '/audio/jani.mp3' },
    { character: 'ჰ', name: 'hae', pronunciation: 'h', id: 33, audioUrl: '/audio/hae.mp3' },
];

// Complete numbers data
const numbersDataToAdd = [
  { id: 1, number: "0", translation: "ნული", translationLatin: "nuli" },
  { id: 2, number: "1", translation: "ერთი", translationLatin: "erti" },
  { id: 3, number: "2", translation: "ორი", translationLatin: "ori" },
  { id: 4, number: "3", translation: "სამი", translationLatin: "sami" },
  { id: 5, number: "4", translation: "ოთხი", translationLatin: "otkhi" },
  { id: 6, number: "5", translation: "ხუთი", translationLatin: "khuti" },
  { id: 7, number: "6", translation: "ექვსი", translationLatin: "ekvsi" },
  { id: 8, number: "7", translation: "შვიდი", translationLatin: "shvidi" },
  { id: 9, number: "8", translation: "რვა", translationLatin: "rva" },
  { id: 10, number: "9", translation: "ცხრა", translationLatin: "tskhrа" },
  { id: 11, number: "10", translation: "ათი", translationLatin: "ati" },

  // Teens
  { id: 12, number: "11", translation: "თერთმეტი", translationLatin: "tertmeti" },
  { id: 13, number: "12", translation: "თორმეტი", translationLatin: "tormeti" },
  { id: 14, number: "13", translation: "ცამეტი", translationLatin: "tsameti" },
  { id: 15, number: "14", translation: "თოთხმეტი", translationLatin: "totkhmeti" },
  { id: 16, number: "15", translation: "თხუთმეტი", translationLatin: "tkhutmeti" },
  { id: 17, number: "16", translation: "თექვსმეტი", translationLatin: "tekvsmeti" },
  { id: 18, number: "17", translation: "ჩვიდმეტი", translationLatin: "chvidmeti" },
  { id: 19, number: "18", translation: "თვრამეტი", translationLatin: "tvrаmeti" },
  { id: 20, number: "19", translation: "ცხრამეტი", translationLatin: "tskhrаmeti" },
  { id: 21, number: "20", translation: "ოცი", translationLatin: "otsi" },

  // 21–29
  { id: 22, number: "21", translation: "ოცდაერთი", translationLatin: "otsdaerti" },
  { id: 23, number: "25", translation: "ოცდახუთი", translationLatin: "otsdakhuti" },
  { id: 24, number: "29", translation: "ოცდაცხრა", translationLatin: "otsdatskhra" },
  { id: 25, number: "30", translation: "ოცდაათი", translationLatin: "otsdaati" },

  // 31–50
  { id: 26, number: "33", translation: "ოცდასამი", translationLatin: "otsdasami" },
  { id: 27, number: "40", translation: "ორმოცი", translationLatin: "ormotsi" },
  { id: 28, number: "47", translation: "ორმოცდაშვიდი", translationLatin: "ormotsdashvidi" },
  { id: 29, number: "50", translation: "ორმოცდაათი", translationLatin: "ormotsdaati" },

  // Decades
  { id: 30, number: "58", translation: "ორმოცდრვა", translationLatin: "ormotsdrva" },
  { id: 31, number: "60", translation: "სამოცი", translationLatin: "samotsi" },
  { id: 32, number: "70", translation: "სამოცდაათი", translationLatin: "samotsdaati" },
  { id: 33, number: "73", translation: "სამოცდასამი", translationLatin: "samotsdasami" },
  { id: 34, number: "80", translation: "ოთხმოცი", translationLatin: "otkhmotsi" },
  { id: 35, number: "84", translation: "ოთხმოცდოთხი", translationLatin: "otkhmotsdotkhi" },
  { id: 36, number: "90", translation: "ოთხმოცდაათი", translationLatin: "otkhmotsdaati" },
  { id: 37, number: "99", translation: "ოთხმოცდაცხრამეტი", translationLatin: "otkhmotsdatskhrаmeti" },
  { id: 38, number: "100", translation: "ასი", translationLatin: "asi" },

  // Hundreds
  { id: 39, number: "101", translation: "ას ერთი", translationLatin: "as erti" },
  { id: 40, number: "111", translation: "ას თერთმეტი", translationLatin: "as tertmeti" },
  { id: 41, number: "200", translation: "ორასი", translationLatin: "orasi" },
  { id: 42, number: "256", translation: "ორას ორმოცდარვა", translationLatin: "oras ormotstarva" },
  { id: 43, number: "345", translation: "სამას ორმოცდახუთი", translationLatin: "samas ormotdakhuti" },
  { id: 44, number: "500", translation: "ხუთასი", translationLatin: "khutasi" },
  { id: 45, number: "999", translation: "ცხრაას ოთხმოცდაცხრამეტი", translationLatin: "tskhrаas otkhmotsdatskhrаmeti" },
  { id: 46, number: "1000", translation: "ათასი", translationLatin: "atasi" },

  // Thousands
  { id: 47, number: "10,001", translation: "ათი ათას ერთი", translationLatin: "ati atаs erti" },
  { id: 48, number: "25,000", translation: "ოცი ხუთი ათასი", translationLatin: "otsi khuti atasi" },
  { id: 49, number: "100,000", translation: "ასი ათასი", translationLatin: "asi atasi" },

  // Million
  { id: 50, number: "1,000,000", translation: "მილიონი", translationLatin: "milioni" }
];

// Complete phrases-1 data
const phrasesDataToAdd = [
    // Basic Greetings
    { english: 'Hello', georgian: 'გამარჯობა', latin: 'gamarjoba', id: 1 },
    { english: 'Goodbye', georgian: 'ნახვამდის', latin: 'nakhvamdis', id: 2 },
    { english: 'Thank you', georgian: 'მადლობა', latin: 'madloba', id: 3 },
    { english: 'Please', georgian: 'გთხოვთ', latin: 'gtkhovt', id: 4 },
    { english: 'Yes', georgian: 'კი', latin: 'ki', id: 5 },
    { english: 'No', georgian: 'არა', latin: 'ara', id: 6 },
    { english: 'Excuse me', georgian: 'უკაცრავად', latin: 'ukatsravad', id: 7 },
    { english: 'Sorry', georgian: 'ბოდიში', latin: 'bodishi', id: 8 },

    // Basic Family
    { english: 'Mother', georgian: 'დედა', latin: 'deda', id: 9 },
    { english: 'Father', georgian: 'მამა', latin: 'mama', id: 10 },
    { english: 'Son', georgian: 'ვაჟი', latin: 'vazhi', id: 11 },
    { english: 'Daughter', georgian: 'ქალი', latin: 'qali', id: 12 },
    { english: 'Brother', georgian: 'ძმა', latin: 'dzma', id: 13 },
    { english: 'Sister', georgian: 'და', latin: 'da', id: 14 },

    // Basic Colors
    { english: 'Red', georgian: 'წითელი', latin: 'tsiteli', id: 15 },
    { english: 'Blue', georgian: 'ლურჯი', latin: 'lurji', id: 16 },
    { english: 'Green', georgian: 'მწვანე', latin: 'mtsvane', id: 17 },
    { english: 'White', georgian: 'თეთრი', latin: 'tetri', id: 18 },
    { english: 'Black', georgian: 'შავი', latin: 'shavi', id: 19 },
    { english: 'Yellow', georgian: 'ყვითელი', latin: 'qviteli', id: 20 },

    // Basic Food
    { english: 'Water', georgian: 'წყალი', latin: 'tsqali', id: 21 },
    { english: 'Bread', georgian: 'პური', latin: 'puri', id: 22 },
    { english: 'Milk', georgian: 'რძე', latin: 'rdze', id: 23 },
    { english: 'Tea', georgian: 'ჩაი', latin: 'chai', id: 24 },
    { english: 'Coffee', georgian: 'ყავა', latin: 'qava', id: 25 },
    { english: 'Wine', georgian: 'ღვინო', latin: 'ghvino', id: 26 },

    // Basic Time
    { english: 'Today', georgian: 'დღეს', latin: 'dghes', id: 27 },
    { english: 'Tomorrow', georgian: 'ხვალ', latin: 'khval', id: 28 },
    { english: 'Yesterday', georgian: 'გუშინ', latin: 'gushin', id: 29 },
    { english: 'Morning', georgian: 'დილა', latin: 'dila', id: 30 },
    { english: 'Evening', georgian: 'საღამო', latin: 'saghamo', id: 31 },
    { english: 'Night', georgian: 'ღამე', latin: 'ghame', id: 32 },

    // Basic Places
    { english: 'Home', georgian: 'სახლი', latin: 'sakhli', id: 33 },
    { english: 'Work', georgian: 'სამსახური', latin: 'samsakhuri', id: 34 },
    { english: 'School', georgian: 'სკოლა', latin: 'skola', id: 35 },
    { english: 'Store', georgian: 'მაღაზია', latin: 'maghazia', id: 36 },
    { english: 'Hospital', georgian: 'ჰოსპიტალი', latin: 'hospitali', id: 37 },
    { english: 'Street', georgian: 'ქუჩა', latin: 'qucha', id: 38 },

    // Basic Questions
    { english: 'What?', georgian: 'რა?', latin: 'ra?', id: 39 },
    { english: 'Who?', georgian: 'ვინ?', latin: 'vin?', id: 40 },
    { english: 'Where?', georgian: 'სად?', latin: 'sad?', id: 41 },
    { english: 'When?', georgian: 'როდის?', latin: 'rodis?', id: 42 },
    { english: 'How?', georgian: 'როგორ?', latin: 'rogor?', id: 43 },
    { english: 'Why?', georgian: 'რატომ?', latin: 'ratom?', id: 44 },

    // Basic Verbs
    { english: 'To go', georgian: 'წასვლა', latin: 'tsasvla', id: 45 },
    { english: 'To come', georgian: 'მოსვლა', latin: 'mosvla', id: 46 },
    { english: 'To eat', georgian: 'ჭამა', latin: 'chama', id: 47 },
    { english: 'To drink', georgian: 'სმა', latin: 'sma', id: 48 },
    { english: 'To sleep', georgian: 'ძილი', latin: 'dzili', id: 49 },
    { english: 'To work', georgian: 'მუშაობა', latin: 'mushaoba', id: 50 },

    // Basic Adjectives
    { english: 'Good', georgian: 'კარგი', latin: 'kargi', id: 51 },
    { english: 'Bad', georgian: 'ცუდი', latin: 'tsudi', id: 52 },
    { english: 'Big', georgian: 'დიდი', latin: 'didi', id: 53 },
    { english: 'Small', georgian: 'პატარა', latin: 'patara', id: 54 },
    { english: 'New', georgian: 'ახალი', latin: 'akhali', id: 55 },
    { english: 'Old', georgian: 'ძველი', latin: 'dzveli', id: 56 },

    // Basic Phrases
    { english: 'How are you?', georgian: 'როგორ ხარ?', latin: 'rogor khar?', id: 57 },
    { english: 'I am fine', georgian: 'კარგად ვარ', latin: 'kargad var', id: 58 },
    { english: 'My name is...', georgian: 'მე მქვია...', latin: 'me mqvia...', id: 59 },
    { english: 'I love you', georgian: 'მიყვარხარ', latin: 'miqvarkhar', id: 60 },
    { english: 'I don\'t understand', georgian: 'არ მესმის', latin: 'ar mesmis', id: 61 },
    { english: 'Do you speak English?', georgian: 'ინგლისურად ლაპარაკობ?', latin: 'inglisurad laparakob?', id: 62 },
    { english: 'How much?', georgian: 'რამდენი?', latin: 'ramdeni?', id: 63 },
    { english: 'Help me', georgian: 'დამეხმარე', latin: 'damekhmare', id: 64 },
    { english: 'I am hungry', georgian: 'მშია', latin: 'mshia', id: 65 },
    { english: 'I am thirsty', georgian: 'წყურვილი მაქვს', latin: 'tsqurvili maqvs', id: 66 }
];

type CourseType = 'alphabet' | 'numbers' | 'phrases-1';

interface MigrationCourse {
    id: CourseType;
    name: string;
    data: any[];
    description: string;
    skipNote?: string;
}

const courses: MigrationCourse[] = [
    {
        id: 'alphabet',
        name: 'Georgian Alphabet',
        data: alphabetDataToAdd,
        description: 'Add remaining Georgian alphabet characters (3-33)',
        skipNote: 'Since you already have characters 1-2'
    },
    {
        id: 'numbers',
        name: 'Georgian Numbers',
        data: numbersDataToAdd,
        description: 'Add complete Georgian numbers (0-1,000,000)'
    },
    {
        id: 'phrases-1',
        name: 'Basic Georgian Phrases',
        data: phrasesDataToAdd,
        description: 'Add essential Georgian phrases and vocabulary'
    }
];

// Course definitions for Firebase
const courseDefinitions = {
    'alphabet': {
        id: 'alphabet',
        title: 'Georgian Alphabet',
        description: 'Learn the 33 letters of the Georgian alphabet with audio pronunciation',
        type: 'alphabet' as const,
        difficulty: 'beginner' as const,
        isActive: true,
        totalItems: 33,
        estimatedTime: 45,
        prerequisites: [],
        tags: ['beginner', 'alphabet', 'pronunciation'],
        icon: '/images/icon-alphabet.svg',
        version: 1,
        itemSchema: {
            character: { type: 'string' as const, required: true, description: 'Georgian character' },
            name: { type: 'string' as const, required: true, description: 'Character name' },
            pronunciation: { type: 'string' as const, required: true, description: 'IPA pronunciation' },
            audioUrl: { type: 'string' as const, required: false, description: 'Audio file path' }
        }
    },
    'numbers': {
        id: 'numbers',
        title: 'Georgian Numbers',
        description: 'Learn numbers from 0 to 1,000,000 in Georgian with transliteration',
        type: 'numbers' as const,
        difficulty: 'beginner' as const,
        isActive: true,
        totalItems: 50,
        estimatedTime: 30,
        prerequisites: ['alphabet'],
        tags: ['beginner', 'numbers', 'counting'],
        icon: '/images/icon-numbers.svg',
        version: 1,
        itemSchema: {
            number: { type: 'string' as const, required: true, description: 'Numeric value as string' },
            translation: { type: 'string' as const, required: true, description: 'Georgian translation' },
            translationLatin: { type: 'string' as const, required: true, description: 'Latin transliteration' }
        }
    },
    'phrases-1': {
        id: 'phrases-1',
        title: 'Basic Georgian Phrases',
        description: 'Essential Georgian phrases and vocabulary for beginners',
        type: 'phrases' as const,
        difficulty: 'beginner' as const,
        isActive: true,
        totalItems: 66,
        estimatedTime: 60,
        prerequisites: ['alphabet'],
        tags: ['beginner', 'phrases', 'vocabulary', 'conversation'],
        icon: '/images/icon-phrases.svg',
        version: 1,
        itemSchema: {
            english: { type: 'string' as const, required: true, description: 'English phrase/word' },
            georgian: { type: 'string' as const, required: true, description: 'Georgian translation' },
            latin: { type: 'string' as const, required: true, description: 'Latin transliteration' }
        }
    }
};

export default function CourseMigration() {
    const [selectedCourses, setSelectedCourses] = useState<CourseType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<{ [key: string]: number }>({});
    const [currentOperation, setCurrentOperation] = useState('');
    const [completedCourses, setCompletedCourses] = useState<CourseType[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const toggleCourse = (courseId: CourseType) => {
        setSelectedCourses(prev => 
            prev.includes(courseId) 
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };

    const runMigration = async () => {
        if (selectedCourses.length === 0) return;

        setIsLoading(true);
        setProgress({});
        setErrors({});
        setCompletedCourses([]);
        setCurrentOperation('Starting migration...');

        try {
            for (const courseId of selectedCourses) {
                const course = courses.find(c => c.id === courseId)!;
                
                setCurrentOperation(`Migrating ${course.name}...`);
                setProgress(prev => ({ ...prev, [courseId]: 0 }));
                
                try {
                    // Create course definition first
                    const courseDefinition = courseDefinitions[courseId];
                    await EnhancedFirebaseService.createCourse(courseDefinition);
                    
                    setProgress(prev => ({ ...prev, [courseId]: 25 }));
                    
                    // Add course items
                    await EnhancedFirebaseService.addCourseItems(courseId, course.data);
                    
                    setProgress(prev => ({ ...prev, [courseId]: 100 }));
                    setCompletedCourses(prev => [...prev, courseId]);
                    
                    console.log(`✅ Successfully migrated ${course.name} (${course.data.length} items)`);
                    
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    setErrors(prev => ({ ...prev, [courseId]: errorMessage }));
                    console.error(`❌ Failed to migrate ${course.name}:`, error);
                }
            }

            setCurrentOperation('Migration completed!');
            
        } catch (error) {
            console.error('❌ Migration process failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const allCoursesCompleted = selectedCourses.length > 0 && selectedCourses.every(id => completedCourses.includes(id));
    const hasErrors = Object.keys(errors).length > 0;

    return (
        <div style={{ 
            padding: '20px',
            maxWidth: '800px',
            margin: '0 auto',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <h1>🚀 Course Data Migration</h1>
            <p>Select which courses you want to migrate to Firebase:</p>
            
            {/* Course Selection */}
            <div style={{ marginBottom: '30px' }}>
                {courses.map(course => (
                    <div key={course.id} style={{ 
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '12px',
                        backgroundColor: selectedCourses.includes(course.id) ? '#f0f8ff' : '#fff'
                    }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
                            <input 
                                type="checkbox"
                                checked={selectedCourses.includes(course.id)}
                                onChange={() => toggleCourse(course.id)}
                                disabled={isLoading || completedCourses.includes(course.id)}
                                style={{ marginRight: '12px', marginTop: '2px' }}
                            />
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
                                    {course.name}
                                    {completedCourses.includes(course.id) && ' ✅'}
                                </h3>
                                <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                                    {course.description} ({course.data.length} items)
                                    {course.skipNote && ` • ${course.skipNote}`}
                                </p>
                                
                                {/* Progress Bar */}
                                {selectedCourses.includes(course.id) && (
                                    <div style={{ marginTop: '8px' }}>
                                        <div style={{
                                            backgroundColor: '#f0f0f0',
                                            borderRadius: '4px',
                                            height: '6px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                backgroundColor: errors[course.id] ? '#dc3545' : 
                                                              completedCourses.includes(course.id) ? '#28a745' : '#007bff',
                                                height: '100%',
                                                width: `${progress[course.id] || 0}%`,
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                        
                                        {errors[course.id] && (
                                            <p style={{ 
                                                color: '#dc3545', 
                                                fontSize: '12px', 
                                                margin: '4px 0 0 0' 
                                            }}>
                                                Error: {errors[course.id]}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>
                ))}
            </div>

            {/* Migration Controls */}
            <div style={{ marginBottom: '20px' }}>
                {!allCoursesCompleted && !isLoading && (
                    <button 
                        onClick={runMigration}
                        disabled={selectedCourses.length === 0}
                        style={{
                            backgroundColor: selectedCourses.length === 0 ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            fontSize: '16px',
                            cursor: selectedCourses.length === 0 ? 'not-allowed' : 'pointer',
                            marginRight: '12px'
                        }}
                    >
                        🚀 Migrate Selected Courses ({selectedCourses.length})
                    </button>
                )}

                {isLoading && (
                    <div style={{ 
                        padding: '12px 20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        display: 'inline-block'
                    }}>
                        🔄 {currentOperation}
                    </div>
                )}

                {hasErrors && !isLoading && (
                    <button 
                        onClick={runMigration}
                        style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Retry Failed Courses
                    </button>
                )}
            </div>

            {/* Success Message */}
            {allCoursesCompleted && !hasErrors && (
                <div style={{ 
                    backgroundColor: '#d4edda', 
                    border: '1px solid #c3e6cb',
                    borderRadius: '6px',
                    padding: '20px',
                    marginTop: '20px'
                }}>
                    <h3 style={{ color: '#155724', margin: '0 0 12px 0' }}>🎉 Migration Successful!</h3>
                    <p style={{ color: '#155724', margin: '0 0 12px 0' }}>
                        Successfully migrated {completedCourses.length} course(s):
                    </p>
                    <ul style={{ color: '#155724', margin: '0', paddingLeft: '20px' }}>
                        {completedCourses.map(courseId => {
                            const course = courses.find(c => c.id === courseId)!;
                            return (
                                <li key={courseId}>
                                    <strong>{course.name}</strong> - {course.data.length} items
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* Info Section */}
            <div style={{ 
                marginTop: '30px',
                fontSize: '14px',
                color: '#666',
                borderTop: '1px solid #eee',
                paddingTop: '20px'
            }}>
                <h4>📋 Migration Details:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div>
                        <h5>📚 Alphabet Course</h5>
                        <ul>
                            <li>31 characters (გ through ჰ)</li>
                            <li>Skips existing ani & bani</li>
                            <li>Includes audio URLs</li>
                            <li>Total: 33 characters</li>
                        </ul>
                    </div>
                    <div>
                        <h5>🔢 Numbers Course</h5>
                        <ul>
                            <li>50 number items (0-1M)</li>
                            <li>Includes basic & complex</li>
                            <li>Georgian + Latin script</li>
                            <li>Complete number system</li>
                        </ul>
                    </div>
                    <div>
                        <h5>💬 Phrases-1 Course</h5>
                        <ul>
                            <li>66 essential phrases</li>
                            <li>Greetings, family, colors</li>
                            <li>Food, time, places</li>
                            <li>Questions, verbs, adjectives</li>
                        </ul>
                    </div>
                </div>
                
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                    <strong>⚠️ Note:</strong> This migration is safe to run multiple times. 
                    Existing data won't be duplicated, but will be overwritten if you re-run.
                </div>
            </div>
        </div>
    );
}