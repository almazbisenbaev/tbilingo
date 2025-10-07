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

export default function AlphabetMigration() {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentItem, setCurrentItem] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [error, setError] = useState('');

    const runMigration = async () => {
        setIsLoading(true);
        setProgress(0);
        setError('');
        setIsComplete(false);

        try {
            console.log('🚀 Starting alphabet data migration...');
            
            // Use the existing Firebase service to add items
            await EnhancedFirebaseService.addCourseItems('alphabet', alphabetDataToAdd);

            setProgress(100);
            setCurrentItem('Migration completed! 🎉');
            setIsComplete(true);
            
            console.log('✨ All done! Added 31 Georgian alphabet characters (ID 3-33)');
            
        } catch (error) {
            console.error('❌ Migration failed:', error);
            setError(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ 
            padding: '20px',
            maxWidth: '600px',
            margin: '0 auto',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <h1>📝 Alphabet Data Migration</h1>
            <p>This will add Georgian alphabet characters 3-33 to your Firebase database.</p>
            
            <div style={{ marginBottom: '20px' }}>
                <p><strong>Items to add:</strong> {alphabetDataToAdd.length} characters (გ, დ, ე, ვ... through ჰ)</p>
                <p><strong>ID range:</strong> 3-33</p>
            </div>

            {!isComplete && !error && (
                <button 
                    onClick={runMigration}
                    disabled={isLoading}
                    style={{
                        backgroundColor: isLoading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        fontSize: '16px',
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isLoading ? '🔄 Migrating...' : '🚀 Start Migration'}
                </button>
            )}

            {isLoading && (
                <div style={{ marginTop: '20px' }}>
                    <div style={{
                        backgroundColor: '#f0f0f0',
                        borderRadius: '10px',
                        height: '20px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            backgroundColor: '#007bff',
                            height: '100%',
                            width: `${progress}%`,
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                    <p style={{ marginTop: '10px', fontSize: '14px' }}>
                        {currentItem || 'Processing...'}
                    </p>
                </div>
            )}

            {isComplete && (
                <div style={{ 
                    backgroundColor: '#d4edda', 
                    border: '1px solid #c3e6cb',
                    borderRadius: '6px',
                    padding: '15px',
                    marginTop: '20px'
                }}>
                    <h3 style={{ color: '#155724', margin: '0 0 10px 0' }}>✅ Migration Successful!</h3>
                    <p style={{ color: '#155724', margin: 0 }}>
                        All 31 remaining alphabet characters have been added to Firebase. 
                        Your alphabet course now has all 33 Georgian letters!
                    </p>
                </div>
            )}

            {error && (
                <div style={{ 
                    backgroundColor: '#f8d7da', 
                    border: '1px solid #f5c6cb',
                    borderRadius: '6px',
                    padding: '15px',
                    marginTop: '20px'
                }}>
                    <h3 style={{ color: '#721c24', margin: '0 0 10px 0' }}>❌ Migration Failed</h3>
                    <p style={{ color: '#721c24', margin: 0 }}>{error}</p>
                    <button 
                        onClick={runMigration}
                        style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        🔄 Retry Migration
                    </button>
                </div>
            )}

            <div style={{ 
                marginTop: '30px',
                fontSize: '14px',
                color: '#666',
                borderTop: '1px solid #eee',
                paddingTop: '15px'
            }}>
                <p><strong>What this does:</strong></p>
                <ul>
                    <li>Adds characters 3-33 to your alphabet course</li>
                    <li>Uses your existing Firebase authentication</li>
                    <li>Updates the course total count to 33</li>
                    <li>Preserves your existing data (characters 1-2)</li>
                </ul>
            </div>
        </div>
    );
}