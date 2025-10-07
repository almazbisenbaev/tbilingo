#!/usr/bin/env node

/**
 * Alphabet Data Migration Script
 * Adds remaining Georgian alphabet characters (ID 3-33) to Firebase
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config (using the same config as your app)
const firebaseConfig = {
  apiKey: "AIzaSyDvK27bcDeiyKIb3p9se7Lh7bAhx7eDifw",
  authDomain: "tbilingo.firebaseapp.com",
  projectId: "tbilingo",
  storageBucket: "tbilingo.firebasestorage.app",
  messagingSenderId: "220834756627",
  appId: "1:220834756627:web:30f5e1f239c837ebc7e7e6",
  measurementId: "G-F75W5FNJH2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Complete alphabet data (starting from ID 3 since 1 and 2 already exist)
const alphabetData = [
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

async function migrateAlphabetData() {
    console.log('🚀 Starting alphabet data migration...');
    console.log(`📝 Adding ${alphabetData.length} alphabet characters (ID 3-33)`);

    try {
        // Add each alphabet item
        for (const item of alphabetData) {
            const itemRef = doc(db, 'courses', 'alphabet', 'items', item.id.toString());
            
            const itemData = {
                id: item.id.toString(),
                character: item.character,
                name: item.name,
                pronunciation: item.pronunciation,
                audioUrl: item.audioUrl,
                order: item.id
            };

            await setDoc(itemRef, itemData);
            console.log(`✅ Added character ${item.id}: ${item.character} (${item.name})`);
        }

        // Update the course definition with correct total count
        const courseRef = doc(db, 'courses', 'alphabet');
        await setDoc(courseRef, {
            totalItems: 33,
            updatedAt: serverTimestamp()
        }, { merge: true });

        console.log('🎉 Migration completed successfully!');
        console.log(`📊 Total alphabet characters in database: 33`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run the migration
migrateAlphabetData()
    .then(() => {
        console.log('✨ All done! Your Georgian alphabet course now has all 33 characters.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });