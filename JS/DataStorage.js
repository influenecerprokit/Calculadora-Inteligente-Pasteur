/**
 * Data Storage Module
 * Manages user input persistence and data storage for the expense calculator game
 * Uses localStorage for persistent data and sessionStorage for temporary data
 */

export class DataStorage {
    constructor() {
        this.isInitialized = false;
        this.storageAvailable = {
            localStorage: false,
            sessionStorage: false
        };
        
        // Storage keys
        this.keys = {
            userSelections: 'calculadora_user_selections',
            gameSession: 'calculadora_game_session',
            calculationHistory: 'calculadora_calculation_history',
            userPreferences: 'calculadora_user_preferences',
            gameProgress: 'calculadora_game_progress'
        };
        
        // Current session data
        this.sessionData = {
            startTime: null,
            currentScreen: 'welcome',
            userSelections: {},
            gameProgress: {},
            temporaryData: {}
        };
        
        // Default preferences
        this.defaultPreferences = {
            audioEnabled: true,
            animationsEnabled: true,
            language: 'es',
            currency: 'USD',
            theme: 'default'
        };
    }

    /**
     * Initialize the data storage system
     */
    init() {
        try {
            console.log('💾 Initializing DataStorage...');
            
            // Check storage availability
            this.checkStorageAvailability();
            
            // Initialize session
            this.initializeSession();
            
            // Load user preferences
            this.loadUserPreferences();
            
            // Set up storage event listeners
            this.setupStorageListeners();
            
            this.isInitialized = true;
            console.log('✅ DataStorage initialized successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize DataStorage:', error);
            return false;
        }
    }

    /**
     * Check if localStorage and sessionStorage are available
     */
    checkStorageAvailability() {
        // Test localStorage
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            this.storageAvailable.localStorage = true;
        } catch (e) {
            console.warn('💾 localStorage not available:', e.message);
            this.storageAvailable.localStorage = false;
        }

        // Test sessionStorage
        try {
            const testKey = '__session_test__';
            sessionStorage.setItem(testKey, 'test');
            sessionStorage.removeItem(testKey);
            this.storageAvailable.sessionStorage = true;
        } catch (e) {
            console.warn('💾 sessionStorage not available:', e.message);
            this.storageAvailable.sessionStorage = false;
        }

        console.log('💾 Storage availability:', this.storageAvailable);
    }

    /**
     * Initialize current session
     */
    initializeSession() {
        this.sessionData.startTime = Date.now();
        this.sessionData.sessionId = this.generateSessionId();
        
        // Try to restore session data
        if (this.storageAvailable.sessionStorage) {
            const savedSession = this.getFromSessionStorage(this.keys.gameSession);
            if (savedSession) {
                this.sessionData = { ...this.sessionData, ...savedSession };
                console.log('💾 Session restored from sessionStorage');
            }
        }
        
        // Save initial session
        this.saveSession();
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Load user preferences
     */
    loadUserPreferences() {
        if (!this.storageAvailable.localStorage) {
            this.userPreferences = { ...this.defaultPreferences };
            return;
        }

        const saved = this.getFromLocalStorage(this.keys.userPreferences);
        this.userPreferences = saved ? { ...this.defaultPreferences, ...saved } : { ...this.defaultPreferences };
        
        console.log('💾 User preferences loaded:', this.userPreferences);
    }

    /**
     * Set up storage event listeners
     */
    setupStorageListeners() {
        // Listen for storage changes in other tabs
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith('calculadora_')) {
                console.log('💾 Storage changed in another tab:', event.key);
                this.handleStorageChange(event);
            }
        });

        // Save session data before page unload
        window.addEventListener('beforeunload', () => {
            this.saveSession();
        });
    }

    /**
     * Handle storage changes from other tabs
     */
    handleStorageChange(event) {
        switch (event.key) {
            case this.keys.userPreferences:
                this.loadUserPreferences();
                break;
            case this.keys.calculationHistory:
                // Could trigger UI update if needed
                console.log('💾 Calculation history updated in another tab');
                break;
        }
    }

    /**
     * Store user input for a specific screen
     * @param {string} screen - Screen name
     * @param {Object} data - User input data
     */
    storeUserInput(screen, data) {
        if (!this.isInitialized) {
            console.warn('💾 DataStorage not initialized');
            return false;
        }

        // Store in session data
        this.sessionData.userSelections[screen] = {
            data,
            timestamp: Date.now()
        };

        // Save to sessionStorage
        this.saveSession();

        // Also save to localStorage for persistence
        if (this.storageAvailable.localStorage) {
            const allSelections = this.getFromLocalStorage(this.keys.userSelections) || {};
            allSelections[screen] = this.sessionData.userSelections[screen];
            this.saveToLocalStorage(this.keys.userSelections, allSelections);
        }

        console.log(`💾 Stored user input for ${screen}:`, data);
        return true;
    }

    /**
     * Get user input for a specific screen
     * @param {string} screen - Screen name
     * @returns {Object|null} User input data
     */
    getUserInput(screen) {
        if (!this.isInitialized) {
            console.warn('💾 DataStorage not initialized');
            return null;
        }

        // Check session data first
        if (this.sessionData.userSelections[screen]) {
            return this.sessionData.userSelections[screen].data;
        }

        // Check localStorage
        if (this.storageAvailable.localStorage) {
            const allSelections = this.getFromLocalStorage(this.keys.userSelections);
            if (allSelections && allSelections[screen]) {
                return allSelections[screen].data;
            }
        }

        return null;
    }

    /**
     * Get all user selections
     */
    getAllUserSelections() {
        const selections = {};
        
        // Merge localStorage and session data
        if (this.storageAvailable.localStorage) {
            const saved = this.getFromLocalStorage(this.keys.userSelections) || {};
            Object.assign(selections, saved);
        }
        
        // Session data takes precedence
        Object.assign(selections, this.sessionData.userSelections);
        
        return selections;
    }

    /**
     * Store calculation result
     * @param {Object} calculation - Calculation result
     */
    storeCalculation(calculation) {
        if (!this.storageAvailable.localStorage) {
            console.warn('💾 localStorage not available, calculation not saved');
            return false;
        }

        const history = this.getCalculationHistory();
        history.push({
            ...calculation,
            sessionId: this.sessionData.sessionId,
            savedAt: Date.now()
        });

        // Keep only last 10 calculations
        if (history.length > 10) {
            history.splice(0, history.length - 10);
        }

        this.saveToLocalStorage(this.keys.calculationHistory, history);
        console.log('💾 Calculation stored in history');
        return true;
    }

    /**
     * Get calculation history
     */
    getCalculationHistory() {
        if (!this.storageAvailable.localStorage) {
            return [];
        }

        return this.getFromLocalStorage(this.keys.calculationHistory) || [];
    }

    /**
     * Clear calculation history
     */
    clearCalculationHistory() {
        if (this.storageAvailable.localStorage) {
            this.removeFromLocalStorage(this.keys.calculationHistory);
            console.log('💾 Calculation history cleared');
        }
    }

    /**
     * Store game progress
     * @param {Object} progress - Game progress data
     */
    storeGameProgress(progress) {
        this.sessionData.gameProgress = {
            ...this.sessionData.gameProgress,
            ...progress,
            lastUpdated: Date.now()
        };

        this.saveSession();

        // Also save to localStorage
        if (this.storageAvailable.localStorage) {
            this.saveToLocalStorage(this.keys.gameProgress, this.sessionData.gameProgress);
        }

        console.log('💾 Game progress stored:', progress);
    }

    /**
     * Get game progress
     */
    getGameProgress() {
        // Check session first
        if (Object.keys(this.sessionData.gameProgress).length > 0) {
            return this.sessionData.gameProgress;
        }

        // Check localStorage
        if (this.storageAvailable.localStorage) {
            return this.getFromLocalStorage(this.keys.gameProgress) || {};
        }

        return {};
    }

    /**
     * Store user preferences
     * @param {Object} preferences - User preferences
     */
    storeUserPreferences(preferences) {
        this.userPreferences = { ...this.userPreferences, ...preferences };

        if (this.storageAvailable.localStorage) {
            this.saveToLocalStorage(this.keys.userPreferences, this.userPreferences);
            console.log('💾 User preferences saved:', preferences);
        }
    }

    /**
     * Get user preferences
     */
    getUserPreferences() {
        return { ...this.userPreferences };
    }

    /**
     * Store temporary data (session only)
     * @param {string} key - Data key
     * @param {*} value - Data value
     */
    storeTemporary(key, value) {
        this.sessionData.temporaryData[key] = {
            value,
            timestamp: Date.now()
        };

        this.saveSession();
        console.log(`💾 Temporary data stored: ${key}`);
    }

    /**
     * Get temporary data
     * @param {string} key - Data key
     */
    getTemporary(key) {
        const data = this.sessionData.temporaryData[key];
        return data ? data.value : null;
    }

    /**
     * Clear temporary data
     * @param {string} key - Data key (optional, clears all if not provided)
     */
    clearTemporary(key = null) {
        if (key) {
            delete this.sessionData.temporaryData[key];
            console.log(`💾 Temporary data cleared: ${key}`);
        } else {
            this.sessionData.temporaryData = {};
            console.log('💾 All temporary data cleared');
        }
        
        this.saveSession();
    }

    /**
     * Save current session to sessionStorage
     */
    saveSession() {
        if (this.storageAvailable.sessionStorage) {
            this.saveToSessionStorage(this.keys.gameSession, this.sessionData);
        }
    }

    /**
     * Clear all user data
     */
    clearAll() {
        // Clear session data
        this.sessionData.userSelections = {};
        this.sessionData.gameProgress = {};
        this.sessionData.temporaryData = {};

        // Clear localStorage
        if (this.storageAvailable.localStorage) {
            Object.values(this.keys).forEach(key => {
                this.removeFromLocalStorage(key);
            });
        }

        // Clear sessionStorage
        if (this.storageAvailable.sessionStorage) {
            this.removeFromSessionStorage(this.keys.gameSession);
        }

        console.log('💾 All data cleared');
    }

    /**
     * Export all data
     */
    exportData() {
        return {
            sessionData: this.sessionData,
            userPreferences: this.userPreferences,
            calculationHistory: this.getCalculationHistory(),
            gameProgress: this.getGameProgress(),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import data
     * @param {Object} data - Data to import
     */
    importData(data) {
        try {
            if (data.userPreferences) {
                this.storeUserPreferences(data.userPreferences);
            }

            if (data.calculationHistory && Array.isArray(data.calculationHistory)) {
                this.saveToLocalStorage(this.keys.calculationHistory, data.calculationHistory);
            }

            if (data.gameProgress) {
                this.storeGameProgress(data.gameProgress);
            }

            console.log('💾 Data imported successfully');
            return true;
        } catch (error) {
            console.error('💾 Failed to import data:', error);
            return false;
        }
    }

    /**
     * Get storage statistics
     */
    getStorageStats() {
        const stats = {
            available: this.storageAvailable,
            sessionId: this.sessionData.sessionId,
            sessionDuration: Date.now() - this.sessionData.startTime,
            userSelectionsCount: Object.keys(this.sessionData.userSelections).length,
            calculationHistoryCount: this.getCalculationHistory().length,
            temporaryDataCount: Object.keys(this.sessionData.temporaryData).length
        };

        // Calculate storage usage if available
        if (this.storageAvailable.localStorage) {
            try {
                const used = JSON.stringify(localStorage).length;
                stats.localStorageUsed = used;
                stats.localStorageUsedKB = Math.round(used / 1024 * 100) / 100;
            } catch (e) {
                stats.localStorageUsed = 'unknown';
            }
        }

        return stats;
    }

    // Storage utility methods
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`💾 Failed to save to localStorage (${key}):`, error);
            return false;
        }
    }

    getFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`💾 Failed to read from localStorage (${key}):`, error);
            return null;
        }
    }

    removeFromLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`💾 Failed to remove from localStorage (${key}):`, error);
            return false;
        }
    }

    saveToSessionStorage(key, data) {
        try {
            sessionStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`💾 Failed to save to sessionStorage (${key}):`, error);
            return false;
        }
    }

    getFromSessionStorage(key) {
        try {
            const data = sessionStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`💾 Failed to read from sessionStorage (${key}):`, error);
            return null;
        }
    }

    removeFromSessionStorage(key) {
        try {
            sessionStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`💾 Failed to remove from sessionStorage (${key}):`, error);
            return false;
        }
    }

    /**
     * Cleanup and destroy the data storage
     */
    destroy() {
        // Save final session state
        this.saveSession();

        // Remove event listeners
        window.removeEventListener('storage', this.handleStorageChange);

        // Clear session data
        this.sessionData = {
            startTime: null,
            currentScreen: 'welcome',
            userSelections: {},
            gameProgress: {},
            temporaryData: {}
        };

        this.isInitialized = false;
        console.log('🧹 DataStorage destroyed');
    }
}
// Universal Module Compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataStorage };
} else if (typeof window !== 'undefined') {
    window.DataStorage = DataStorage;
}