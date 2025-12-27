/**
 * Timer Manager Module
 * Manages countdown timers for the expense calculator game
 * Provides visual feedback and audio cues for time-sensitive interactions
 */

export class TimerManager {
    constructor(audioSystem = null) {
        this.audioSystem = audioSystem;
        this.onTimerComplete = null;
        this.onTimerTick = null;
        this.onTimerWarning = null;
        
        this.currentTimer = null;
        this.timerInterval = null;
        this.remainingTime = 0;
        this.totalTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        
        // Timer configuration
        this.warningThreshold = 3; // seconds when to show warning
        this.tickInterval = 1000; // milliseconds
        
        // DOM elements
        this.timerDisplay = null;
        this.timerElement = null;
        
        // Bind methods
        this.tick = this.tick.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }

    /**
     * Initialize the timer manager
     */
    init() {
        try {
            console.log('⏱️ Initializing TimerManager...');
            
            // Set up visibility change listener for pause/resume
            document.addEventListener('visibilitychange', this.handleVisibilityChange);
            
            console.log('✅ TimerManager initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize TimerManager:', error);
            return false;
        }
    }

    /**
     * Start a countdown timer
     * @param {number} seconds - Duration in seconds
     * @param {Function} callback - Function to call when timer completes
     * @param {string} displaySelector - CSS selector for timer display element
     */
    startTimer(seconds, callback = null, displaySelector = null) {
        // Stop any existing timer
        this.stopTimer();
        
        this.totalTime = seconds;
        this.remainingTime = seconds;
        this.isRunning = true;
        this.isPaused = false;
        
        // Set callback
        if (callback) {
            this.onTimerComplete = callback;
        }
        
        // Find display element
        if (displaySelector) {
            this.timerDisplay = document.querySelector(displaySelector);
        } else {
            // Try common timer display selectors
            this.timerDisplay = document.querySelector('#timer-seconds') || 
                              document.querySelector('#water-timer-seconds') ||
                              document.querySelector('.timer-display span');
        }
        
        // Update initial display
        this.updateDisplay();
        
        // Start the interval
        this.timerInterval = setInterval(this.tick, this.tickInterval);
        
        console.log(`⏱️ Timer started: ${seconds} seconds`);
        
        // Play initial tick sound
        if (this.audioSystem) {
            this.audioSystem.playTick();
        }
        
        return this;
    }

    /**
     * Timer tick function
     */
    tick() {
        if (!this.isRunning || this.isPaused) return;
        
        this.remainingTime--;
        this.updateDisplay();
        
        // Check for warning threshold
        if (this.remainingTime === this.warningThreshold) {
            this.handleWarning();
        }
        
        // Play tick sound
        if (this.remainingTime > 0) {
            if (this.audioSystem) {
                if (this.remainingTime <= this.warningThreshold) {
                    this.audioSystem.playUrgentTick();
                } else {
                    this.audioSystem.playTick();
                }
            }
            
            // Trigger tick callback
            if (this.onTimerTick) {
                this.onTimerTick(this.remainingTime, this.totalTime);
            }
        }
        
        // Check if timer completed
        if (this.remainingTime <= 0) {
            this.handleTimerComplete();
        }
    }

    /**
     * Update timer display
     */
    updateDisplay() {
        if (this.timerDisplay) {
            this.timerDisplay.textContent = Math.max(0, this.remainingTime);
            
            // Add urgent class when in warning zone
            const timerContainer = this.timerDisplay.closest('.timer-display');
            if (timerContainer) {
                if (this.remainingTime <= this.warningThreshold && this.remainingTime > 0) {
                    timerContainer.classList.add('urgent');
                } else {
                    timerContainer.classList.remove('urgent');
                }
            }
        }
        
        // Update progress if there's a progress element
        this.updateProgress();
    }

    /**
     * Update progress bar if available
     */
    updateProgress() {
        const progressBar = document.querySelector('.timer-progress');
        if (progressBar && this.totalTime > 0) {
            const progress = ((this.totalTime - this.remainingTime) / this.totalTime) * 100;
            progressBar.style.width = `${progress}%`;
            
            // Change color based on remaining time
            if (this.remainingTime <= this.warningThreshold) {
                progressBar.style.backgroundColor = '#f44336';
            } else if (this.remainingTime <= this.totalTime * 0.5) {
                progressBar.style.backgroundColor = '#ff9800';
            } else {
                progressBar.style.backgroundColor = '#4caf50';
            }
        }
    }

    /**
     * Handle warning threshold reached
     */
    handleWarning() {
        console.log('⚠️ Timer warning: ' + this.remainingTime + ' seconds remaining');
        
        // Play alert sound
        if (this.audioSystem) {
            this.audioSystem.playAlert();
        }
        
        // Add visual warning effects
        this.addWarningEffects();
        
        // Trigger warning callback
        if (this.onTimerWarning) {
            this.onTimerWarning(this.remainingTime);
        }
    }

    /**
     * Add visual warning effects
     */
    addWarningEffects() {
        const timerContainer = document.querySelector('.timer-display');
        if (timerContainer) {
            timerContainer.classList.add('urgent');
        }
        
        // Flash the screen container
        const screenContainer = document.querySelector('.screen-container');
        if (screenContainer) {
            screenContainer.style.animation = 'timerWarningFlash 0.5s ease-in-out';
            setTimeout(() => {
                screenContainer.style.animation = '';
            }, 500);
        }
    }

    /**
     * Handle timer completion
     */
    handleTimerComplete() {
        console.log('⏰ Timer completed');
        
        this.stopTimer();
        
        // Trigger completion callback
        if (this.onTimerComplete) {
            this.onTimerComplete();
        }
    }

    /**
     * Stop the current timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.isRunning = false;
        this.isPaused = false;
        
        // Remove urgent styling
        const timerContainers = document.querySelectorAll('.timer-display');
        timerContainers.forEach(container => {
            container.classList.remove('urgent');
        });
        
        console.log('⏱️ Timer stopped');
    }

    /**
     * Pause the current timer
     */
    pauseTimer() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            console.log('⏸️ Timer paused');
        }
    }

    /**
     * Resume the paused timer
     */
    resumeTimer() {
        if (this.isRunning && this.isPaused) {
            this.isPaused = false;
            console.log('▶️ Timer resumed');
        }
    }

    /**
     * Add time to current timer
     * @param {number} seconds - Seconds to add
     */
    addTime(seconds) {
        if (this.isRunning) {
            this.remainingTime += seconds;
            this.totalTime += seconds;
            this.updateDisplay();
            console.log(`⏱️ Added ${seconds} seconds to timer`);
        }
    }

    /**
     * Set timer warning threshold
     * @param {number} seconds - Warning threshold in seconds
     */
    setWarningThreshold(seconds) {
        this.warningThreshold = Math.max(1, seconds);
        console.log(`⚠️ Warning threshold set to ${this.warningThreshold} seconds`);
    }

    /**
     * Get current timer status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            remainingTime: this.remainingTime,
            totalTime: this.totalTime,
            progress: this.totalTime > 0 ? (this.totalTime - this.remainingTime) / this.totalTime : 0
        };
    }

    /**
     * Format time for display
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds}s`;
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Create a visual timer element
     * @param {HTMLElement} container - Container to append timer to
     * @param {Object} options - Timer options
     */
    createTimerDisplay(container, options = {}) {
        const {
            className = 'timer-display',
            showProgress = false,
            position = 'top-right'
        } = options;
        
        // Create timer display
        const timerDisplay = document.createElement('div');
        timerDisplay.className = className;
        timerDisplay.innerHTML = `
            <span class="timer-seconds">${this.remainingTime || 0}</span>s
            ${showProgress ? '<div class="timer-progress"></div>' : ''}
        `;
        
        // Position the timer
        timerDisplay.style.position = 'absolute';
        switch (position) {
            case 'top-right':
                timerDisplay.style.top = '20px';
                timerDisplay.style.right = '20px';
                break;
            case 'top-left':
                timerDisplay.style.top = '20px';
                timerDisplay.style.left = '20px';
                break;
            case 'center':
                timerDisplay.style.top = '50%';
                timerDisplay.style.left = '50%';
                timerDisplay.style.transform = 'translate(-50%, -50%)';
                break;
        }
        
        container.appendChild(timerDisplay);
        this.timerDisplay = timerDisplay.querySelector('.timer-seconds');
        
        return timerDisplay;
    }

    /**
     * Handle page visibility changes (pause/resume on tab switch)
     */
    handleVisibilityChange() {
        if (document.hidden) {
            if (this.isRunning && !this.isPaused) {
                this.pauseTimer();
                this.wasAutoPaused = true;
            }
        } else {
            if (this.wasAutoPaused) {
                this.resumeTimer();
                this.wasAutoPaused = false;
            }
        }
    }

    /**
     * Cleanup and destroy the timer manager
     */
    destroy() {
        this.stopTimer();
        
        // Remove event listeners
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Clear references
        this.onTimerComplete = null;
        this.onTimerTick = null;
        this.onTimerWarning = null;
        this.timerDisplay = null;
        this.audioSystem = null;
        
        console.log('🧹 TimerManager destroyed');
    }
}
// Universal Module Compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TimerManager };
} else if (typeof window !== 'undefined') {
    window.TimerManager = TimerManager;
}