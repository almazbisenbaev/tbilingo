import { useState, useEffect } from 'react';

import './Welcome.css';

import Logo from '../assets/images/logo.png';
import iconReset from '../assets/images/icon-reset-red.svg';

const Welcome = ({onPlay, alphabetLength, onReset}) => {

    const [showSettings, setShowSettings] = useState(false);
    const [learnedCharactersCount, setLearnedCharactersCount] = useState(0); // Store the learned characters from localstorage

    const [selectedFontType, setSelectedFontType] = useState('');

    // When user chooses a font type
    const onFontSettingChange = (event) => {

        const choice = event.target.value;
        setSelectedFontType(choice);
        localStorage.setItem('fontType', choice);

        // console.log(selectedFontType);
        // console.log(localStorage.getItem('fontType'));
    };

    useEffect(() => {

        // Load font type from localstorage and set as checked in settings
        const storedFontSettingFromLocal = localStorage.getItem('fontType');
        if (storedFontSettingFromLocal !== null) {
            setSelectedFontType(storedFontSettingFromLocal);
            // console.log(storedFontSettingFromLocal);
        }

        const savedLearnedCharacters = JSON.parse(localStorage.getItem('learnedLetters') || '[]');
        setLearnedCharactersCount(savedLearnedCharacters.length);

    }, []);


    return (
        <div className="welcome">

            <div className="welcome-body">

                <div className="welcome-header">
                    <img className='welcome-logo' src={Logo} alt="" />
                    <h1 className="welcome-title">Tbilingo</h1>
                    <h2 className='welcome-descr'>Georgian alphabet flashcards</h2>
                </div>

                <div className="welcome-actions">
                    <button onClick={onPlay} className="btn btn-large btn-primary">Learn characters</button>
                    <div className="welcome-progress">Learned: {learnedCharactersCount} / {alphabetLength} letters</div>
                </div>

            </div>

            <div className="welcome-footer">
                <div className="credits">Made by <a target="_blank" href="//almazbisenbaev.github.io">Almaz Bisenbaev</a></div>
            </div>

            <button className="welcome-settings-btn" onClick={() => {setShowSettings(true)}}>Settings</button>

            <div className={`settings-drawer ${showSettings ? 'settings-drawer-shown' : ''}`}>
                <button className='welcome-settings-close' onClick={() => {setShowSettings(false)}}>Close</button>
                <div className="settings-items">

                    <div className="settings-item">
                        <div className="settings-ff">
                            <div>Character font type: </div>
                            <div className='settings-ff-items'>
                                <label className='settings-ff-item settings-ff-item-sans'>
                                    <input name='font-type' 
                                           type="radio" 
                                           value='sans' 
                                           checked={selectedFontType === 'sans'}
                                           onChange={onFontSettingChange}
                                    />
                                    <div className="settings-ff-item-preview">ჯ ფ ტ</div>
                                </label>
                                <label className='settings-ff-item settings-ff-item-serif'>
                                    <input name='font-type' 
                                           type="radio" 
                                           value='serif' 
                                           checked={selectedFontType === 'serif'}
                                           onChange={onFontSettingChange}
                                    />
                                    <div className="settings-ff-item-preview">ჯ ფ ტ</div>
                                </label>
                            </div>
                            <div className="hint">We recommend learning the letters in both font types</div>
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="settings-item">
                        <button className='reset-button' onClick={onReset}>
                            <img src={iconReset} alt="" />
                            <span>Reset progress</span>
                        </button>
                    </div>

                </div>
            </div>

        </div>
    )
}
  
export default Welcome