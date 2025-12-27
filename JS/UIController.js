/**
 * UI Controller Module
 * Manages DOM manipulation and screen management for the expense calculator game
 * Handles screen transitions, element updates, and UI state management
 */

export class UIController {
    constructor() {
        this.currentScreen = 'welcome';
        this.screenHistory = [];
        this.isTransitioning = false;
        this.transitionDuration = 400; // milliseconds
        
        // Screen elements cache
        this.screens = new Map();
        this.elements = new Map();
        
        // Animation settings
        this.animationSettings = {
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            duration: this.transitionDuration
        };
        
        // Bind methods
        this.handleResize = this.handleResize.bind(this);
        this.handleKeyboard = this.handleKeyboard.bind(this);
    }

    /**
     * Initialize the UI controller
     */
    init() {
        try {
            console.log('🖥️ Initializing UIController...');
            
            // Cache screen elements
            this.cacheScreenElements();
            
            // Cache common elements
            this.cacheCommonElements();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize screen states
            this.initializeScreenStates();
            
            console.log('✅ UIController initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize UIController:', error);
            return false;
        }
    }

    /**
     * Cache screen elements for faster access
     */
    cacheScreenElements() {
        try {
            const screenElements = document.querySelectorAll('.screen[data-screen]');
            
            if (screenElements.length === 0) {
                const errorMsg = 'No screen elements found in DOM. Make sure HTML is loaded correctly and contains elements with class "screen" and attribute "data-screen".';
                console.error('❌', errorMsg);
                throw new Error(errorMsg);
            }
            
            screenElements.forEach(screen => {
                const screenName = screen.dataset.screen;
                if (screenName) {
                    this.screens.set(screenName, screen);
                } else {
                    console.warn('⚠️ Screen element found without data-screen attribute:', screen);
                }
            });
            
            if (this.screens.size === 0) {
                throw new Error('No valid screen elements found. All screen elements must have a data-screen attribute.');
            }
            
            console.log(`🖥️ Cached ${this.screens.size} screen elements`);
        } catch (error) {
            console.error('❌ Error caching screen elements:', error);
            throw error;
        }
    }

    /**
     * Cache common elements
     */
    cacheCommonElements() {
        const commonSelectors = {
            gameContainer: '#game-container',
            screenContainer: '#screen-container',
            loadingOverlay: '#loading-overlay',
            audioContainer: '#audio-container',
            
            // Timer elements
            timerDisplay: '#timer-display',
            timerSeconds: '#timer-seconds',
            waterTimerSeconds: '#water-timer-seconds',
            
            // Drag & drop elements
            dragOptions: '#drag-options',
            dropZone: '#drop-zone',
            waterOptions: '#water-options',
            waterDropZone: '#water-drop-zone',
            
            // Result elements
            thinkingAnimation: '#thinking-animation',
            calculationResult: '#calculation-result',
            totalAmount: '#total-amount',
            
            // Warning elements
            waterWarning: '#water-warning',
            warningText: '#warning-text',
            
            // Confetti
            confettiContainer: '#confetti-container'
        };

        Object.entries(commonSelectors).forEach(([key, selector]) => {
            const element = document.querySelector(selector);
            if (element) {
                this.elements.set(key, element);
            }
        });
        
        console.log(`🖥️ Cached ${this.elements.size} common elements`);
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', this.handleResize);
        
        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyboard);
        
        // Prevent context menu on long press (mobile)
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.drag-option') || e.target.closest('.drop-zone')) {
                e.preventDefault();
            }
        });
    }

    /**
     * Initialize screen states
     */
    initializeScreenStates() {
        // Hide all screens except welcome
        this.screens.forEach((screen, screenName) => {
            if (screenName === 'welcome') {
                screen.classList.add('active');
            } else {
                screen.classList.remove('active');
            }
        });
        
        this.currentScreen = 'welcome';
    }

    /**
     * Show a specific screen
     * @param {string} screenName - Name of the screen to show
     * @param {Object} options - Transition options
     */
    async showScreen(screenName, options = {}) {
        if (this.isTransitioning) {
            console.warn('🖥️ Screen transition already in progress');
            return false;
        }

        const targetScreen = this.screens.get(screenName);
        if (!targetScreen) {
            console.error(`🖥️ Screen '${screenName}' not found`);
            return false;
        }

        if (this.currentScreen === screenName) {
            console.log(`🖥️ Already on screen '${screenName}'`);
            return true;
        }

        console.log(`🖥️ Transitioning to screen: ${this.currentScreen} → ${screenName}`);

        this.isTransitioning = true;
        
        try {
            // Get current screen element
            const currentScreenElement = this.screens.get(this.currentScreen);
            
            // Add to history
            if (this.currentScreen) {
                this.screenHistory.push(this.currentScreen);
            }

            // Hide current screen
            if (currentScreenElement) {
                currentScreenElement.classList.remove('active');
            }
            
            // Show target screen
            targetScreen.classList.add('active');
            
            // Perform transition animation if needed
            await this.performScreenTransition(this.currentScreen, screenName, options);
            
            // Update current screen
            this.currentScreen = screenName;
            
            // Handle screen-specific setup
            this.handleScreenEnter(screenName);
            
            this.isTransitioning = false;
            console.log(`✅ Successfully showed screen: ${screenName}`);
            return true;
            
        } catch (error) {
            console.error('🖥️ Screen transition failed:', error);
            console.error('Error stack:', error.stack);
            this.isTransitioning = false;
            
            // Fallback: try simple class toggle
            try {
                const currentScreenElement = this.screens.get(this.currentScreen);
                if (currentScreenElement) {
                    currentScreenElement.classList.remove('active');
                }
                targetScreen.classList.add('active');
                this.currentScreen = screenName;
                console.log(`✅ Fallback: Screen ${screenName} shown using simple class toggle`);
                return true;
            } catch (fallbackError) {
                console.error('❌ Fallback also failed:', fallbackError);
                return false;
            }
        }
    }

    /**
     * Perform screen transition animation
     */
    async performScreenTransition(fromScreen, toScreen, options = {}) {
        const {
            direction = 'forward',
            duration = this.transitionDuration,
            easing = this.animationSettings.easing
        } = options;

        const fromElement = this.screens.get(fromScreen);
        const toElement = this.screens.get(toScreen);

        if (!toElement) return;

        // Set up initial states
        if (fromElement) {
            fromElement.style.transition = `all ${duration}ms ${easing}`;
        }
        toElement.style.transition = `all ${duration}ms ${easing}`;
        
        // Determine animation direction
        const slideDirection = direction === 'backward' ? -100 : 100;
        
        // Start transition
        if (fromElement) {
            fromElement.style.transform = `translateX(${-slideDirection}%)`;
            fromElement.style.opacity = '0';
        }
        
        toElement.style.transform = `translateX(${slideDirection}%)`;
        toElement.style.opacity = '0';
        toElement.classList.add('active');
        
        // Force reflow
        toElement.offsetHeight;
        
        // Animate to final position
        toElement.style.transform = 'translateX(0)';
        toElement.style.opacity = '1';
        
        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, duration));
        
        // Clean up
        if (fromElement) {
            fromElement.classList.remove('active');
            fromElement.style.transition = '';
            fromElement.style.transform = '';
            fromElement.style.opacity = '';
        }
        
        toElement.style.transition = '';
        toElement.style.transform = '';
        toElement.style.opacity = '';
    }

    /**
     * Handle screen enter logic
     */
    handleScreenEnter(screenName) {
        switch (screenName) {
            case 'product':
                this.setupProductScreen();
                break;
            case 'water':
                this.setupWaterScreen();
                break;
            case 'results':
                this.setupResultsScreen();
                break;
            case 'validation':
                this.setupValidationScreen();
                break;
            case 'prize':
                this.setupPrizeScreen();
                break;
        }
    }

    /**
     * Set up product screen
     */
    setupProductScreen() {
        // Update title if needed
        this.updateElement('#product-title', 'Productos de Limpieza');
        
        // Reset timer display
        this.updateElement('#timer-seconds', '10');
        
        // Clear any previous selections
        const dropZone = this.elements.get('dropZone');
        if (dropZone) {
            dropZone.classList.remove('has-selection');
            this.updateElement('.drop-zone-text', 'Arrastra tu selección aquí');
        }
    }

    /**
     * Set up water screen
     */
    setupWaterScreen() {
        // Update title
        this.updateElement('#water-title', 'Consumo de Agua');
        
        // Reset timer display
        this.updateElement('#water-timer-seconds', '10');
        
        // Hide warning initially
        const warning = this.elements.get('waterWarning');
        if (warning) {
            warning.classList.add('hidden');
        }
        
        // Clear water drop zone
        const waterDropZone = this.elements.get('waterDropZone');
        if (waterDropZone) {
            waterDropZone.classList.remove('has-selection');
            const dropText = waterDropZone.querySelector('.drop-zone-text');
            if (dropText) {
                dropText.textContent = 'Arrastra tu selección aquí';
            }
        }
    }

    /**
     * Set up results screen
     */
    setupResultsScreen() {
        // Show thinking animation
        const thinkingAnimation = this.elements.get('thinkingAnimation');
        const calculationResult = this.elements.get('calculationResult');
        
        if (thinkingAnimation) {
            thinkingAnimation.classList.remove('hidden');
        }
        
        if (calculationResult) {
            calculationResult.classList.add('hidden');
        }
        
        // Reset amount display
        this.updateElement('#total-amount', '0.00');
    }

    /**
     * Set up validation screen
     */
    setupValidationScreen() {
        // No specific setup needed, buttons are already in HTML
        console.log('🖥️ Validation screen ready');
    }

    /**
     * Set up prize screen
     */
    setupPrizeScreen() {
        // Clear confetti container
        const confettiContainer = this.elements.get('confettiContainer');
        if (confettiContainer) {
            confettiContainer.innerHTML = '';
        }
    }

    /**
     * Go back to previous screen
     */
    async goBack() {
        if (this.screenHistory.length === 0) {
            console.log('🖥️ No previous screen in history');
            return false;
        }

        const previousScreen = this.screenHistory.pop();
        return await this.showScreen(previousScreen, { direction: 'backward' });
    }

    /**
     * Update element content
     * @param {string} selector - CSS selector or element key
     * @param {string} content - New content
     * @param {string} property - Property to update ('textContent', 'innerHTML', 'value')
     */
    updateElement(selector, content, property = 'textContent') {
        let element;
        
        // Check if it's a cached element key
        if (this.elements.has(selector)) {
            element = this.elements.get(selector);
        } else {
            // Query selector
            element = document.querySelector(selector);
        }

        if (element) {
            element[property] = content;
            return true;
        } else {
            console.warn(`🖥️ Element not found: ${selector}`);
            return false;
        }
    }

    /**
     * Show/hide element
     * @param {string} selector - CSS selector or element key
     * @param {boolean} show - Whether to show or hide
     */
    toggleElement(selector, show) {
        let element;
        
        if (this.elements.has(selector)) {
            element = this.elements.get(selector);
        } else {
            element = document.querySelector(selector);
        }

        if (element) {
            if (show) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
            return true;
        }
        return false;
    }

    /**
     * Add CSS class to element
     */
    addClass(selector, className) {
        const element = this.getElement(selector);
        if (element) {
            element.classList.add(className);
            return true;
        }
        return false;
    }

    /**
     * Remove CSS class from element
     */
    removeClass(selector, className) {
        const element = this.getElement(selector);
        if (element) {
            element.classList.remove(className);
            return true;
        }
        return false;
    }

    /**
     * Toggle CSS class on element
     */
    toggleClass(selector, className) {
        const element = this.getElement(selector);
        if (element) {
            element.classList.toggle(className);
            return true;
        }
        return false;
    }

    /**
     * Get element by selector or key
     */
    getElement(selector) {
        if (this.elements.has(selector)) {
            return this.elements.get(selector);
        }
        return document.querySelector(selector);
    }

    /**
     * Show warning message
     * @param {string} message - Warning message
     * @param {number} duration - Auto-hide duration (0 = no auto-hide)
     */
    showWarning(message, duration = 5000) {
        const warningElement = this.elements.get('waterWarning');
        const warningText = this.elements.get('warningText');
        
        if (warningElement && warningText) {
            warningText.textContent = message;
            warningElement.classList.remove('hidden');
            
            if (duration > 0) {
                setTimeout(() => {
                    warningElement.classList.add('hidden');
                }, duration);
            }
        }
    }

    /**
     * Hide warning message
     */
    hideWarning() {
        const warningElement = this.elements.get('waterWarning');
        if (warningElement) {
            warningElement.classList.add('hidden');
        }
    }

    /**
     * Show loading overlay
     */
    showLoading(show = true) {
        this.toggleElement('loadingOverlay', show);
    }

    /**
     * Update progress indicator
     * @param {number} progress - Progress percentage (0-100)
     */
    updateProgress(progress) {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Update any size-dependent elements
        const screenContainer = this.elements.get('screenContainer');
        if (screenContainer) {
            // Trigger reflow for responsive elements
            screenContainer.style.height = `${window.innerHeight}px`;
            setTimeout(() => {
                screenContainer.style.height = '';
            }, 100);
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboard(event) {
        // ESC key - go back
        if (event.key === 'Escape' && this.screenHistory.length > 0) {
            event.preventDefault();
            this.goBack();
        }
        
        // Enter key on buttons
        if (event.key === 'Enter' && event.target.tagName === 'BUTTON') {
            event.target.click();
        }
    }

    /**
     * Get current screen info
     */
    getCurrentScreen() {
        return {
            current: this.currentScreen,
            history: [...this.screenHistory],
            isTransitioning: this.isTransitioning
        };
    }

    /**
     * Clear screen history
     */
    clearHistory() {
        this.screenHistory = [];
        console.log('🖥️ Screen history cleared');
    }

    /**
     * Cleanup and destroy the UI controller
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeyboard);
        
        // Clear caches
        this.screens.clear();
        this.elements.clear();
        this.screenHistory = [];
        
        // Reset state
        this.currentScreen = null;
        this.isTransitioning = false;
        
        console.log('🧹 UIController destroyed');
    }
}

// Universal Module Compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIController };
} else if (typeof window !== 'undefined') {
    window.UIController = UIController;
}