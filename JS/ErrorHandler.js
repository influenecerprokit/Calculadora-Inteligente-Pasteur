/**
 * Error Handler Module
 * Centralized error handling, logging, and recovery system
 */

export class ErrorHandler {
    constructor() {
        this.isInitialized = false;
        this.errorQueue = [];
        this.maxErrorQueue = 50;
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.errorNotificationContainer = null;
        
        // Error categories
        this.errorTypes = {
            AUDIO: 'audio',
            NETWORK: 'network',
            STORAGE: 'storage',
            CALCULATION: 'calculation',
            UI: 'ui',
            DRAG_DROP: 'drag_drop',
            TIMER: 'timer',
            ANIMATION: 'animation',
            CRITICAL: 'critical',
            WARNING: 'warning',
            INFO: 'info'
        };

        // Recovery strategies
        this.recoveryStrategies = new Map();
        this.setupRecoveryStrategies();

        // Bind methods
        this.handleError = this.handleError.bind(this);
        this.handleUnhandledRejection = this.handleUnhandledRejection.bind(this);
        this.handleWindowError = this.handleWindowError.bind(this);
    }

    /**
     * Initialize the error handler
     */
    init() {
        try {
            console.log('🛡️ Initializing ErrorHandler...');
            
            // Set up global error listeners
            this.setupGlobalErrorHandling();
            
            // Create error notification container
            this.createErrorNotificationContainer();
            
            // Set up periodic error queue cleanup
            this.setupErrorQueueCleanup();
            
            this.isInitialized = true;
            console.log('✅ ErrorHandler initialized successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize ErrorHandler:', error);
            return false;
        }
    }

    /**
     * Set up global error handling
     */
    setupGlobalErrorHandling() {
        // Handle uncaught JavaScript errors
        window.addEventListener('error', this.handleWindowError);
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
        
        // Override console.error to capture errors
        const originalConsoleError = console.error;
        console.error = (...args) => {
            originalConsoleError.apply(console, args);
            this.logError('CONSOLE_ERROR', args.join(' '), { source: 'console' });
        };
    }

    /**
     * Set up recovery strategies for different error types
     */
    setupRecoveryStrategies() {
        // Audio system recovery
        this.recoveryStrategies.set(this.errorTypes.AUDIO, {
            canRecover: true,
            strategy: async (error, context) => {
                console.log('🔧 Attempting audio system recovery...');
                if (context.audioSystem) {
                    context.audioSystem.setEnabled(false);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    context.audioSystem.setEnabled(true);
                    return true;
                }
                return false;
            },
            fallback: (error, context) => {
                if (context.audioSystem) {
                    context.audioSystem.setEnabled(false);
                }
                this.showUserNotification('Audio deshabilitado temporalmente', 'warning');
            }
        });

        // Storage recovery
        this.recoveryStrategies.set(this.errorTypes.STORAGE, {
            canRecover: true,
            strategy: async (error, context) => {
                console.log('🔧 Attempting storage recovery...');
                try {
                    // Clear corrupted storage
                    localStorage.clear();
                    sessionStorage.clear();
                    return true;
                } catch (e) {
                    return false;
                }
            },
            fallback: (error, context) => {
                this.showUserNotification('Datos temporales limpiados', 'info');
            }
        });

        // UI recovery
        this.recoveryStrategies.set(this.errorTypes.UI, {
            canRecover: true,
            strategy: async (error, context) => {
                console.log('🔧 Attempting UI recovery...');
                try {
                    // Reset UI state
                    const screens = document.querySelectorAll('.screen');
                    screens.forEach(screen => {
                        screen.classList.remove('active');
                    });
                    
                    // Show welcome screen
                    const welcomeScreen = document.getElementById('welcome-screen');
                    if (welcomeScreen) {
                        welcomeScreen.classList.add('active');
                    }
                    
                    return true;
                } catch (e) {
                    return false;
                }
            },
            fallback: (error, context) => {
                this.showUserNotification('Interfaz reiniciada', 'info');
            }
        });

        // Network recovery
        this.recoveryStrategies.set(this.errorTypes.NETWORK, {
            canRecover: true,
            strategy: async (error, context) => {
                console.log('🔧 Attempting network recovery...');
                // Wait and retry
                await new Promise(resolve => setTimeout(resolve, 2000));
                return navigator.onLine;
            },
            fallback: (error, context) => {
                this.showUserNotification('Verifica tu conexión a internet', 'warning');
            }
        });

        // Critical error - no recovery
        this.recoveryStrategies.set(this.errorTypes.CRITICAL, {
            canRecover: false,
            strategy: null,
            fallback: (error, context) => {
                this.showUserNotification('Error crítico. Recarga la página.', 'error', 0);
            }
        });
    }

    /**
     * Handle window errors
     */
    handleWindowError(event) {
        const error = {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error,
            type: this.errorTypes.CRITICAL
        };
        
        this.handleError(error, { source: 'window' });
    }

    /**
     * Handle unhandled promise rejections
     */
    handleUnhandledRejection(event) {
        const error = {
            message: event.reason?.message || 'Unhandled promise rejection',
            stack: event.reason?.stack,
            type: this.errorTypes.WARNING
        };
        
        this.handleError(error, { source: 'promise' });
        event.preventDefault(); // Prevent default browser handling
    }

    /**
     * Main error handling method
     */
    async handleError(error, context = {}) {
        if (!this.isInitialized) {
            console.error('ErrorHandler not initialized:', error);
            return;
        }

        // Create error entry
        const errorEntry = {
            id: this.generateErrorId(),
            timestamp: Date.now(),
            message: error.message || error.toString(),
            stack: error.stack,
            type: error.type || this.errorTypes.WARNING,
            context: { ...context },
            resolved: false,
            retryCount: 0
        };

        // Add to error queue
        this.addToErrorQueue(errorEntry);

        // Log error
        this.logError(errorEntry.type, errorEntry.message, errorEntry);

        // Attempt recovery
        await this.attemptRecovery(errorEntry, context);

        // Show user notification if needed
        this.handleUserNotification(errorEntry);
    }

    /**
     * Attempt error recovery
     */
    async attemptRecovery(errorEntry, context) {
        const strategy = this.recoveryStrategies.get(errorEntry.type);
        
        if (!strategy || !strategy.canRecover) {
            if (strategy?.fallback) {
                strategy.fallback(errorEntry, context);
            }
            return false;
        }

        const retryKey = `${errorEntry.type}_${errorEntry.message}`;
        const currentRetries = this.retryAttempts.get(retryKey) || 0;

        if (currentRetries >= this.maxRetries) {
            console.warn(`Max retries exceeded for error: ${errorEntry.message}`);
            if (strategy.fallback) {
                strategy.fallback(errorEntry, context);
            }
            return false;
        }

        try {
            console.log(`🔄 Attempting recovery for ${errorEntry.type} error (attempt ${currentRetries + 1})`);
            
            const recovered = await strategy.strategy(errorEntry, context);
            
            if (recovered) {
                errorEntry.resolved = true;
                console.log(`✅ Successfully recovered from ${errorEntry.type} error`);
                this.showUserNotification('Problema resuelto automáticamente', 'success', 3000);
                return true;
            } else {
                this.retryAttempts.set(retryKey, currentRetries + 1);
                if (strategy.fallback) {
                    strategy.fallback(errorEntry, context);
                }
                return false;
            }
        } catch (recoveryError) {
            console.error('Recovery attempt failed:', recoveryError);
            this.retryAttempts.set(retryKey, currentRetries + 1);
            if (strategy.fallback) {
                strategy.fallback(errorEntry, context);
            }
            return false;
        }
    }

    /**
     * Handle user notifications based on error type
     */
    handleUserNotification(errorEntry) {
        const userFriendlyMessages = {
            [this.errorTypes.AUDIO]: 'Problema con el audio. Continuando sin sonido.',
            [this.errorTypes.NETWORK]: 'Problema de conexión. Verifica tu internet.',
            [this.errorTypes.STORAGE]: 'Problema guardando datos. Algunos datos pueden perderse.',
            [this.errorTypes.CALCULATION]: 'Error en cálculos. Usando valores aproximados.',
            [this.errorTypes.UI]: 'Problema en la interfaz. Reiniciando vista.',
            [this.errorTypes.DRAG_DROP]: 'Problema con arrastrar y soltar. Intenta de nuevo.',
            [this.errorTypes.TIMER]: 'Problema con el temporizador. Continuando sin límite.',
            [this.errorTypes.ANIMATION]: 'Problema con animaciones. Continuando sin efectos.',
            [this.errorTypes.CRITICAL]: 'Error crítico. Por favor recarga la página.',
            [this.errorTypes.WARNING]: 'Advertencia del sistema.',
            [this.errorTypes.INFO]: 'Información del sistema.'
        };

        const message = userFriendlyMessages[errorEntry.type] || 'Ha ocurrido un problema.';
        const severity = this.getNotificationSeverity(errorEntry.type);
        
        this.showUserNotification(message, severity);
    }

    /**
     * Get notification severity based on error type
     */
    getNotificationSeverity(errorType) {
        const severityMap = {
            [this.errorTypes.CRITICAL]: 'error',
            [this.errorTypes.NETWORK]: 'warning',
            [this.errorTypes.STORAGE]: 'warning',
            [this.errorTypes.CALCULATION]: 'warning',
            [this.errorTypes.AUDIO]: 'info',
            [this.errorTypes.UI]: 'warning',
            [this.errorTypes.DRAG_DROP]: 'info',
            [this.errorTypes.TIMER]: 'info',
            [this.errorTypes.ANIMATION]: 'info',
            [this.errorTypes.WARNING]: 'warning',
            [this.errorTypes.INFO]: 'info'
        };
        
        return severityMap[errorType] || 'info';
    }

    /**
     * Show user notification
     */
    showUserNotification(message, severity = 'info', duration = 5000) {
        if (!this.errorNotificationContainer) {
            this.createErrorNotificationContainer();
        }

        const notification = document.createElement('div');
        notification.className = `error-notification ${severity}`;
        
        const severityIcons = {
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            success: '✅'
        };
        
        notification.innerHTML = `
            <span class="notification-icon">${severityIcons[severity] || 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        notification.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            margin-bottom: 8px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease-out;
            background: ${this.getNotificationColor(severity)};
            color: white;
            border-left: 4px solid ${this.getNotificationBorderColor(severity)};
        `;

        this.errorNotificationContainer.appendChild(notification);

        // Auto-remove notification
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideOutRight 0.3s ease-in';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                        }
                    }, 300);
                }
            }, duration);
        }
    }

    /**
     * Get notification background color
     */
    getNotificationColor(severity) {
        const colors = {
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3',
            success: '#4caf50'
        };
        return colors[severity] || colors.info;
    }

    /**
     * Get notification border color
     */
    getNotificationBorderColor(severity) {
        const colors = {
            error: '#d32f2f',
            warning: '#f57c00',
            info: '#1976d2',
            success: '#388e3c'
        };
        return colors[severity] || colors.info;
    }

    /**
     * Create error notification container
     */
    createErrorNotificationContainer() {
        if (this.errorNotificationContainer) return;

        this.errorNotificationContainer = document.createElement('div');
        this.errorNotificationContainer.id = 'error-notifications';
        this.errorNotificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            pointer-events: none;
        `;

        // Make notifications clickable
        this.errorNotificationContainer.addEventListener('click', (e) => {
            e.target.style.pointerEvents = 'auto';
        });

        document.body.appendChild(this.errorNotificationContainer);

        // Add CSS animations
        this.addNotificationStyles();
    }

    /**
     * Add notification CSS animations
     */
    addNotificationStyles() {
        if (document.getElementById('error-notification-styles')) return;

        const style = document.createElement('style');
        style.id = 'error-notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .error-notification {
                pointer-events: auto;
                cursor: pointer;
                transition: transform 0.2s ease;
            }
            
            .error-notification:hover {
                transform: translateX(-5px);
            }
            
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s ease;
            }
            
            .notification-close:hover {
                background-color: rgba(255, 255, 255, 0.2);
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Log error with structured format
     */
    logError(type, message, details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type,
            message,
            details,
            userAgent: navigator.userAgent,
            url: window.location.href,
            sessionId: this.getSessionId()
        };

        // Console logging with appropriate level
        const logLevel = this.getLogLevel(type);
        console[logLevel](`[${type}] ${message}`, logEntry);

        // Store in session storage for debugging
        this.storeErrorLog(logEntry);
    }

    /**
     * Get appropriate console log level
     */
    getLogLevel(errorType) {
        const levelMap = {
            [this.errorTypes.CRITICAL]: 'error',
            [this.errorTypes.WARNING]: 'warn',
            [this.errorTypes.INFO]: 'info'
        };
        
        return levelMap[errorType] || 'warn';
    }

    /**
     * Store error log in session storage
     */
    storeErrorLog(logEntry) {
        try {
            const logs = JSON.parse(sessionStorage.getItem('errorLogs') || '[]');
            logs.push(logEntry);
            
            // Keep only last 100 logs
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            
            sessionStorage.setItem('errorLogs', JSON.stringify(logs));
        } catch (e) {
            // Ignore storage errors
        }
    }

    /**
     * Add error to queue
     */
    addToErrorQueue(errorEntry) {
        this.errorQueue.push(errorEntry);
        
        // Limit queue size
        if (this.errorQueue.length > this.maxErrorQueue) {
            this.errorQueue.shift();
        }
    }

    /**
     * Set up periodic error queue cleanup
     */
    setupErrorQueueCleanup() {
        setInterval(() => {
            const now = Date.now();
            const maxAge = 5 * 60 * 1000; // 5 minutes
            
            this.errorQueue = this.errorQueue.filter(error => {
                return (now - error.timestamp) < maxAge;
            });
            
            // Clean up retry attempts
            this.retryAttempts.clear();
        }, 60000); // Run every minute
    }

    /**
     * Generate unique error ID
     */
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get session ID for tracking
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }

    /**
     * Get error statistics
     */
    getErrorStats() {
        const stats = {
            totalErrors: this.errorQueue.length,
            resolvedErrors: this.errorQueue.filter(e => e.resolved).length,
            errorsByType: {},
            recentErrors: this.errorQueue.slice(-10)
        };

        // Count errors by type
        this.errorQueue.forEach(error => {
            stats.errorsByType[error.type] = (stats.errorsByType[error.type] || 0) + 1;
        });

        return stats;
    }

    /**
     * Export error logs for debugging
     */
    exportErrorLogs() {
        const logs = {
            errorQueue: this.errorQueue,
            sessionLogs: JSON.parse(sessionStorage.getItem('errorLogs') || '[]'),
            stats: this.getErrorStats(),
            timestamp: new Date().toISOString()
        };

        return JSON.stringify(logs, null, 2);
    }

    /**
     * Clear all error data
     */
    clearErrorData() {
        this.errorQueue = [];
        this.retryAttempts.clear();
        sessionStorage.removeItem('errorLogs');
        
        // Clear notifications
        if (this.errorNotificationContainer) {
            this.errorNotificationContainer.innerHTML = '';
        }
        
        console.log('🧹 Error data cleared');
    }

    /**
     * Destroy error handler
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('error', this.handleWindowError);
        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
        
        // Clear data
        this.clearErrorData();
        
        // Remove notification container
        if (this.errorNotificationContainer && this.errorNotificationContainer.parentNode) {
            this.errorNotificationContainer.parentNode.removeChild(this.errorNotificationContainer);
        }
        
        this.isInitialized = false;
        console.log('🛡️ ErrorHandler destroyed');
    }

    /**
     * Public API methods for modules to report errors
     */
    
    reportAudioError(error, context = {}) {
        this.handleError({ ...error, type: this.errorTypes.AUDIO }, context);
    }
    
    reportNetworkError(error, context = {}) {
        this.handleError({ ...error, type: this.errorTypes.NETWORK }, context);
    }
    
    reportStorageError(error, context = {}) {
        this.handleError({ ...error, type: this.errorTypes.STORAGE }, context);
    }
    
    reportCalculationError(error, context = {}) {
        this.handleError({ ...error, type: this.errorTypes.CALCULATION }, context);
    }
    
    reportUIError(error, context = {}) {
        this.handleError({ ...error, type: this.errorTypes.UI }, context);
    }
    
    reportDragDropError(error, context = {}) {
        this.handleError({ ...error, type: this.errorTypes.DRAG_DROP }, context);
    }
    
    reportTimerError(error, context = {}) {
        this.handleError({ ...error, type: this.errorTypes.TIMER }, context);
    }
    
    reportAnimationError(error, context = {}) {
        this.handleError({ ...error, type: this.errorTypes.ANIMATION }, context);
    }
    
    reportCriticalError(error, context = {}) {
        this.handleError({ ...error, type: this.errorTypes.CRITICAL }, context);
    }
    
    reportWarning(message, context = {}) {
        this.handleError({ message, type: this.errorTypes.WARNING }, context);
    }
    
    reportInfo(message, context = {}) {
        this.handleError({ message, type: this.errorTypes.INFO }, context);
    }
}
// Universal Module Compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ErrorHandler };
} else if (typeof window !== 'undefined') {
    window.ErrorHandler = ErrorHandler;
}