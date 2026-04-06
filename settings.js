// Settings Panel Controller with Custom Music Upload and Click-Outside-to-Close
class SettingsManager {
    constructor() {
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.closeBtn = document.getElementById('closeSettings');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeValue = document.getElementById('volumeValue');
        this.musicBtns = document.querySelectorAll('.music-btn:not(.stop-music)');
        this.stopMusicBtn = document.getElementById('stopMusic');
        this.themeBtns = document.querySelectorAll('.theme-btn');
        this.requestForm = document.getElementById('gameRequestForm');
        this.requestMessage = document.getElementById('requestMessage');
        
        // Custom music elements
        this.uploadMusicBtn = document.getElementById('uploadMusicBtn');
        this.customMusicUpload = document.getElementById('customMusicUpload');
        this.customPlaylist = document.getElementById('customPlaylist');
        this.customAudio = new Audio();
        this.customMusicFiles = [];
        this.currentCustomTrack = null;
        
        this.audioContext = null;
        this.isPlaying = false;
        this.currentTrack = null;
        this.isCustomMusic = false;
        this.scheduledNotes = [];
        this.nextNoteTime = 0;
        this.scheduleAheadTime = 0.1;
        this.timerID = null;
        
        this.init();
    }

    init() {
        // Settings panel toggle
        this.settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent immediate close
            this.openSettings();
        });
        
        this.closeBtn.addEventListener('click', () => this.closeSettings());
        
        // Click outside to close - IMPORTANT!
        document.addEventListener('click', (e) => {
            // Check if settings panel is open
            if (this.settingsPanel.classList.contains('active')) {
                // If click is outside settings panel and settings button
                if (!this.settingsPanel.contains(e.target) && !this.settingsBtn.contains(e.target)) {
                    this.closeSettings();
                }
            }
        });

        // Prevent clicks inside panel from closing it
        this.settingsPanel.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Music controls
        this.musicBtns.forEach(btn => {
            btn.addEventListener('click', () => this.playTrack(btn.dataset.track));
        });
        
        this.stopMusicBtn.addEventListener('click', () => this.stopMusic());
        
        // Custom music upload
        if (this.uploadMusicBtn) {
            this.uploadMusicBtn.addEventListener('click', () => {
                this.customMusicUpload.click();
            });
        }

        if (this.customMusicUpload) {
            this.customMusicUpload.addEventListener('change', (e) => this.handleMusicUpload(e));
        }

        // Custom audio events
        this.customAudio.addEventListener('ended', () => this.playNextCustomTrack());
        this.customAudio.addEventListener('play', () => {
            this.isPlaying = true;
            this.isCustomMusic = true;
        });
        
        // Volume control
        this.volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            this.customAudio.volume = volume;
            this.volumeValue.textContent = `${e.target.value}%`;
            localStorage.setItem('musicVolume', e.target.value);
        });

        // Load saved volume
        const savedVolume = localStorage.getItem('musicVolume') || '50';
        this.volumeSlider.value = savedVolume;
        this.volumeValue.textContent = `${savedVolume}%`;
        this.customAudio.volume = savedVolume / 100;

        // Theme toggle
        this.themeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.toggleTheme(btn.dataset.theme));
        });

        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.applyTheme(savedTheme);

        // Handle form submission
        if (this.requestForm) {
            this.requestForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Auto-start music after user interaction
        this.setupAutoPlay();
    }

    handleMusicUpload(e) {
        const files = Array.from(e.target.files);
        
        if (files.length === 0) return;

        // Store files
        this.customMusicFiles = files;

        // Clear existing playlist UI
        this.customPlaylist.innerHTML = '';

        // Create playlist items
        files.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            item.dataset.index = index;

            const name = document.createElement('span');
            name.className = 'playlist-item-name';
            name.textContent = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
            name.title = file.name;

            const controls = document.createElement('div');
            controls.className = 'playlist-item-controls';

            const playBtn = document.createElement('button');
            playBtn.className = 'playlist-btn play-btn';
            playBtn.innerHTML = '▶️';
            playBtn.onclick = (e) => {
                e.stopPropagation();
                this.playCustomTrack(index);
            };

            const removeBtn = document.createElement('button');
            removeBtn.className = 'playlist-btn remove-btn';
            removeBtn.innerHTML = '🗑️';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                this.removeCustomTrack(index);
            };

            controls.appendChild(playBtn);
            controls.appendChild(removeBtn);
            item.appendChild(name);
            item.appendChild(controls);

            // Click on item to play
            item.onclick = () => this.playCustomTrack(index);

            this.customPlaylist.appendChild(item);
        });

        // Auto-play first track
        if (files.length > 0) {
            this.playCustomTrack(0);
            this.showNotification(`🎵 ${files.length} song${files.length > 1 ? 's' : ''} loaded!`);
        }
    }

    playCustomTrack(index) {
        if (!this.customMusicFiles[index]) return;

        // Stop any generated music
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = null;
        }

        // Update UI
        this.musicBtns.forEach(btn => btn.classList.remove('active'));
        
        // Update playlist UI
        const items = this.customPlaylist.querySelectorAll('.playlist-item');
        items.forEach(item => item.classList.remove('playing'));
        if (items[index]) {
            items[index].classList.add('playing');
        }

        // Play track
        const file = this.customMusicFiles[index];
        const url = URL.createObjectURL(file);
        this.customAudio.src = url;
        this.customAudio.play();

        this.currentCustomTrack = index;
        this.isPlaying = true;
        this.isCustomMusic = true;
        this.currentTrack = null;

        // Save state
        localStorage.setItem('musicPlaying', 'true');
    }

    playNextCustomTrack() {
        if (this.customMusicFiles.length === 0) return;

        const nextIndex = (this.currentCustomTrack + 1) % this.customMusicFiles.length;
        this.playCustomTrack(nextIndex);
    }

    removeCustomTrack(index) {
        // Stop if currently playing
        if (this.currentCustomTrack === index) {
            this.customAudio.pause();
            this.customAudio.src = '';
        }

        // Remove from array
        this.customMusicFiles.splice(index, 1);

        // Rebuild playlist UI
        this.customPlaylist.innerHTML = '';
        this.customMusicFiles.forEach((file, i) => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            item.dataset.index = i;

            const name = document.createElement('span');
            name.className = 'playlist-item-name';
            name.textContent = file.name.replace(/\.[^/.]+$/, '');
            name.title = file.name;

            const controls = document.createElement('div');
            controls.className = 'playlist-item-controls';

            const playBtn = document.createElement('button');
            playBtn.className = 'playlist-btn play-btn';
            playBtn.innerHTML = '▶️';
            playBtn.onclick = (e) => {
                e.stopPropagation();
                this.playCustomTrack(i);
            };

            const removeBtn = document.createElement('button');
            removeBtn.className = 'playlist-btn remove-btn';
            removeBtn.innerHTML = '🗑️';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                this.removeCustomTrack(i);
            };

            controls.appendChild(playBtn);
            controls.appendChild(removeBtn);
            item.appendChild(name);
            item.appendChild(controls);
            item.onclick = () => this.playCustomTrack(i);

            this.customPlaylist.appendChild(item);
        });

        // Update current track index
        if (this.currentCustomTrack > index) {
            this.currentCustomTrack--;
        }
    }

    setupAutoPlay() {
        const startMusic = () => {
            const savedTrack = localStorage.getItem('currentMusicTrack');
            const musicWasPlaying = localStorage.getItem('musicPlaying') === 'true';

            if (musicWasPlaying && savedTrack) {
                this.playTrack(savedTrack, true);
            } else {
                // Auto-start Track 1
                this.playTrack('1', true);
            }
        };

        // Wait for user interaction
        document.addEventListener('click', startMusic, { once: true });
        document.addEventListener('keydown', startMusic, { once: true });
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.requestForm);
        const gameName = formData.get('Game Name');
        
        // Show success message
        this.showMessage('success', `🎉 Thanks for suggesting "${gameName}"! Your request has been sent!`);
        
        // Actually submit the form in the background
        fetch(this.requestForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                console.log('Form submitted successfully');
            }
        }).catch(error => {
            console.log('Form submission:', error);
        });
        
        // Clear form
        this.requestForm.reset();
    }

    showMessage(type, text) {
        this.requestMessage.className = `request-message ${type}`;
        this.requestMessage.textContent = text;
        this.requestMessage.style.display = 'block';

        setTimeout(() => {
            this.requestMessage.style.display = 'none';
            this.requestMessage.className = 'request-message';
        }, 5000);
    }

    openSettings() {
        this.settingsPanel.classList.add('active');
    }

    closeSettings() {
        this.settingsPanel.classList.remove('active');
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        return this.audioContext;
    }

    playTrack(trackNumber, isAutoStart = false) {
        // Stop custom music if playing
        if (this.isCustomMusic) {
            this.customAudio.pause();
            this.isCustomMusic = false;
            const items = this.customPlaylist.querySelectorAll('.playlist-item');
            items.forEach(item => item.classList.remove('playing'));
        }

        // Stop current track
        this.stopMusic(true);

        // Initialize audio
        const audioCtx = this.initAudio();
        
        // Update UI
        this.musicBtns.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-track="${trackNumber}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Start playing
        this.isPlaying = true;
        this.currentTrack = trackNumber;
        this.nextNoteTime = audioCtx.currentTime;

        // Save state
        localStorage.setItem('currentMusicTrack', trackNumber);
        localStorage.setItem('musicPlaying', 'true');

        // Start scheduler
        this.scheduler(trackNumber);

        if (!isAutoStart) {
            this.showNotification('🎵 Music playing!');
        }
    }

    scheduler(trackNumber) {
        if (!this.isPlaying) return;

        const audioCtx = this.audioContext;
        
        while (this.nextNoteTime < audioCtx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(trackNumber, this.nextNoteTime);
            this.nextNoteTime += this.getNoteDuration(trackNumber);
        }

        this.timerID = setTimeout(() => this.scheduler(trackNumber), 25);
    }

    getNoteDuration(trackNumber) {
        if (trackNumber === '1') return 0.4;
        if (trackNumber === '2') return 0.6;
        return 0.3;
    }

    scheduleNote(trackNumber, time) {
        const audioCtx = this.audioContext;
        const volume = this.volumeSlider.value / 100;

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        const frequency = this.getFrequency(trackNumber);
        osc.frequency.value = frequency;

        if (trackNumber === '1') osc.type = 'square';
        else if (trackNumber === '2') osc.type = 'sine';
        else osc.type = 'sawtooth';

        gainNode.gain.setValueAtTime(volume * 0.3, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + this.getNoteDuration(trackNumber) * 0.8);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start(time);
        osc.stop(time + this.getNoteDuration(trackNumber));
    }

    getFrequency(trackNumber) {
        const now = this.audioContext.currentTime;
        const noteIndex = Math.floor(now * 2) % 8;

        if (trackNumber === '1') {
            const notes = [523.25, 659.25, 783.99, 659.25, 523.25, 392.00, 523.25, 659.25];
            return notes[noteIndex];
        } else if (trackNumber === '2') {
            const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 196.00];
            return notes[noteIndex];
        } else {
            const notes = [440.00, 554.37, 659.25, 880.00, 659.25, 554.37, 440.00, 349.23];
            return notes[noteIndex];
        }
    }

    stopMusic(keepState = false) {
        // Stop generated music
        this.isPlaying = false;

        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = null;
        }

        // Stop custom music
        if (this.isCustomMusic) {
            this.customAudio.pause();
            this.isCustomMusic = false;
            const items = this.customPlaylist.querySelectorAll('.playlist-item');
            items.forEach(item => item.classList.remove('playing'));
        }

        this.musicBtns.forEach(btn => btn.classList.remove('active'));

        if (!keepState) {
            this.currentTrack = null;
            localStorage.setItem('musicPlaying', 'false');
            localStorage.removeItem('currentMusicTrack');
            this.showNotification('🔇 Music stopped');
        }
    }

    toggleTheme(theme) {
        this.applyTheme(theme);
        localStorage.setItem('theme', theme);
    }

    applyTheme(theme) {
        const body = document.body;
        
        this.themeBtns.forEach(btn => {
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        if (theme === 'light') {
            body.classList.add('light-theme');
        } else {
            body.classList.remove('light-theme');
        }
    }

    showNotification(message) {
        const existing = document.querySelector('.audio-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'audio-notification';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 255, 255, 0.95);
            color: #000;
            padding: 1rem 2rem;
            border-radius: 10px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
            font-family: 'Orbitron', sans-serif;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => notification.remove(), 500);
        }, 2000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const settingsManager = new SettingsManager();
});
