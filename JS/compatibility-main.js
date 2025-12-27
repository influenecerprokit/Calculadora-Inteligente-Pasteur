/**
 * Compatibility Main Application Entry Point
 * Version for browsers that don't support ES6 modules
 */

(function() {
    'use strict';
    
    /**
     * Application class that orchestrates the entire game (Compatibility Version)
     */
    function CalculadoraAppCompat() {
        this.lazyLoader = null;
        this.errorHandler = null;
        this.cacheManager = null;
        this.audioSystem = null;
        this.gameEngine = null;
        this.mobileTestSuite = null;
        this.browserCompatibilityTester = null;
        this.isInitialized = false;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 3;
        
        // Bind methods
        this.handleUnload = this.handleUnload.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }

    /**
     * Initialize the application
     */
    CalculadoraAppCompat.prototype.init = function() {
        var self = this;
        self.initializationAttempts++;
        
        return new Promise(function(resolve, reject) {
            try {
                console.log('🎮 Inicializando Calculadora de Gastos (Compatibility Mode)... (Intento ' + self.initializationAttempts + ')');
                
                // Show loading overlay
                self.showLoading(true);
                
                // Initialize modules in compatibility mode
                self.initializeCompatibilityModules().then(function() {
                    // Set up application event listeners
                    self.setupApplicationEventListeners();
                    
                    self.isInitialized = true;
                    
                    // Hide loading overlay
                    self.showLoading(false);
                    
                    console.log('✅ Aplicación inicializada correctamente (Compatibility Mode)');
                    
                    resolve();
                }).catch(function(error) {
                    console.error('❌ Error inicializando módulos:', error);
                    self.handleInitializationError(error).then(resolve).catch(reject);
                });
                
            } catch (error) {
                console.error('❌ Error inicializando la aplicación:', error);
                self.handleInitializationError(error).then(resolve).catch(reject);
            }
        });
    };

    /**
     * Initialize all application modules in compatibility mode
     */
    CalculadoraAppCompat.prototype.initializeCompatibilityModules = function() {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            try {
                console.log('🔄 Initializing modules in compatibility mode...');
                
                // Initialize ErrorHandler first
                if (window.ErrorHandler) {
                    self.errorHandler = new window.ErrorHandler();
                    if (self.errorHandler.init) {
                        self.errorHandler.init();
                    }
                    console.log('✅ ErrorHandler initialized');
                } else {
                    self.errorHandler = self.createFallbackErrorHandler();
                    console.log('⚠️ Using fallback ErrorHandler');
                }
                
                // Initialize UIController
                if (window.UIController) {
                    self.uiController = new window.UIController();
                    if (self.uiController.init) {
                        self.uiController.init();
                    }
                    console.log('✅ UIController initialized');
                } else {
                    self.uiController = self.createFallbackUIController();
                    console.log('⚠️ Using fallback UIController');
                }
                
                // Initialize CacheManager (optional)
                if (window.CacheManager) {
                    self.cacheManager = new window.CacheManager();
                    if (self.cacheManager.init) {
                        self.cacheManager.init();
                    }
                    console.log('✅ CacheManager initialized');
                }
                
                // Initialize AudioSystem
                if (window.AudioSystem) {
                    self.audioSystem = new window.AudioSystem();
                    if (self.audioSystem.init) {
                        self.audioSystem.init().then(function() {
                            console.log('✅ AudioSystem initialized');
                        }).catch(function(error) {
                            console.warn('⚠️ AudioSystem initialization failed:', error);
                            self.audioSystem = self.createFallbackAudioSystem();
                        });
                    }
                } else {
                    self.audioSystem = self.createFallbackAudioSystem();
                    console.log('⚠️ Using fallback AudioSystem');
                }
                
                // Initialize CalculatorModule
                if (window.CalculatorModule) {
                    self.calculatorModule = new window.CalculatorModule();
                    if (self.calculatorModule.init) {
                        self.calculatorModule.init();
                    }
                    console.log('✅ CalculatorModule initialized');
                } else {
                    self.calculatorModule = self.createFallbackCalculatorModule();
                    console.log('⚠️ Using fallback CalculatorModule');
                }
                
                // Initialize DragDropHandler
                if (window.DragDropHandler) {
                    self.dragDropHandler = new window.DragDropHandler();
                    if (self.dragDropHandler.init) {
                        self.dragDropHandler.init();
                    }
                    console.log('✅ DragDropHandler initialized');
                } else {
                    self.dragDropHandler = self.createFallbackDragDropHandler();
                    console.log('⚠️ Using fallback DragDropHandler');
                }
                
                // Initialize TimerManager
                if (window.TimerManager) {
                    self.timerManager = new window.TimerManager();
                    if (self.timerManager.init) {
                        self.timerManager.init();
                    }
                    console.log('✅ TimerManager initialized');
                } else {
                    self.timerManager = self.createFallbackTimerManager();
                    console.log('⚠️ Using fallback TimerManager');
                }
                
                // Initialize AnimationEngine
                if (window.AnimationEngine) {
                    self.animationEngine = new window.AnimationEngine();
                    if (self.animationEngine.init) {
                        self.animationEngine.init();
                    }
                    console.log('✅ AnimationEngine initialized');
                } else {
                    self.animationEngine = self.createFallbackAnimationEngine();
                    console.log('⚠️ Using fallback AnimationEngine');
                }
                
                // Initialize DataStorage
                if (window.DataStorage) {
                    self.dataStorage = new window.DataStorage();
                    if (self.dataStorage.init) {
                        self.dataStorage.init();
                    }
                    console.log('✅ DataStorage initialized');
                } else {
                    self.dataStorage = self.createFallbackDataStorage();
                    console.log('⚠️ Using fallback DataStorage');
                }
                
                // Initialize GameEngine with all dependencies
                if (window.GameEngine) {
                    var gameEngineDependencies = {
                        audioSystem: self.audioSystem,
                        dragDropHandler: self.dragDropHandler,
                        timerManager: self.timerManager,
                        animationEngine: self.animationEngine,
                        calculatorModule: self.calculatorModule,
                        dataStorage: self.dataStorage,
                        uiController: self.uiController
                    };
                    
                    self.gameEngine = new window.GameEngine(gameEngineDependencies);
                    
                    if (self.gameEngine.init) {
                        self.gameEngine.init().then(function() {
                            console.log('✅ GameEngine initialized');
                            resolve();
                        }).catch(function(error) {
                            console.error('❌ GameEngine initialization failed:', error);
                            reject(error);
                        });
                    } else {
                        console.log('✅ GameEngine initialized (no init method)');
                        resolve();
                    }
                } else {
                    console.error('❌ GameEngine not available');
                    reject(new Error('GameEngine not available'));
                }
                
            } catch (error) {
                console.error('❌ Error initializing compatibility modules:', error);
                reject(error);
            }
        });
    };

    /**
     * Handle initialization errors
     */
    CalculadoraAppCompat.prototype.handleInitializationError = function(error) {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            if (self.initializationAttempts < self.maxInitializationAttempts) {
                console.log('🔄 Reintentando inicialización... (Intento ' + (self.initializationAttempts + 1) + ')');
                
                // Wait before retry
                setTimeout(function() {
                    // Clear any partial initialization
                    self.cleanup();
                    
                    // Retry initialization
                    self.init().then(resolve).catch(reject);
                }, 2000);
            } else {
                // Max attempts reached
                self.handleFatalError(error);
                reject(error);
            }
        });
    };

    /**
     * Handle fatal initialization errors
     */
    CalculadoraAppCompat.prototype.handleFatalError = function(error) {
        console.error('🚨 Error fatal en la inicialización:', error);
        this.showFatalErrorMessage(error);
    };

    /**
     * Show fatal error message to user
     */
    CalculadoraAppCompat.prototype.showFatalErrorMessage = function(error) {
        // Hide loading overlay
        this.showLoading(false);
        
        // Create fatal error overlay
        var errorOverlay = document.createElement('div');
        errorOverlay.id = 'fatal-error-overlay';
        errorOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
            padding: 20px;
        `;
        
        errorOverlay.innerHTML = `
            <div style="max-width: 500px;">
                <h1 style="font-size: 2.5rem; margin-bottom: 20px;">😔</h1>
                <h2 style="font-size: 1.5rem; margin-bottom: 20px;">¡Ups! Algo salió mal</h2>
                <p style="font-size: 1.1rem; margin-bottom: 30px; opacity: 0.9;">
                    No pudimos cargar la aplicación correctamente después de ${this.initializationAttempts} intento(s). 
                    Por favor, recarga la página para intentar de nuevo.
                </p>
                <button onclick="window.location.reload()" style="
                    background: rgba(255, 255, 255, 0.2);
                    border: 2px solid white;
                    color: white;
                    padding: 15px 30px;
                    border-radius: 50px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    Recargar Página
                </button>
                <p style="font-size: 0.9rem; margin-top: 20px; opacity: 0.7;">
                    Si el problema persiste, verifica tu conexión a internet o usa un navegador más reciente.
                </p>
            </div>
        `;
        
        document.body.appendChild(errorOverlay);
    };

    /**
     * Set up application-level event listeners
     */
    CalculadoraAppCompat.prototype.setupApplicationEventListeners = function() {
        // Page unload cleanup
        window.addEventListener('beforeunload', this.handleUnload);
        
        // Visibility change handling
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Online/offline status
        window.addEventListener('online', function() {
            if (this.errorHandler && this.errorHandler.reportInfo) {
                this.errorHandler.reportInfo('Conexión restaurada');
            }
        }.bind(this));
        
        window.addEventListener('offline', function() {
            if (this.errorHandler && this.errorHandler.reportWarning) {
                this.errorHandler.reportWarning('Conexión perdida', { network: false });
            }
        }.bind(this));
    };

    /**
     * Handle page visibility changes
     */
    CalculadoraAppCompat.prototype.handleVisibilityChange = function() {
        if (document.hidden) {
            // Page hidden - pause non-critical operations
            if (this.audioSystem && this.audioSystem.pause) {
                this.audioSystem.pause();
            }
            if (this.animationEngine && this.animationEngine.pause) {
                this.animationEngine.pause();
            }
        } else {
            // Page visible - resume operations
            if (this.audioSystem && this.audioSystem.resume) {
                this.audioSystem.resume();
            }
            if (this.animationEngine && this.animationEngine.resume) {
                this.animationEngine.resume();
            }
        }
    };

    /**
     * Get status of all modules
     */
    CalculadoraAppCompat.prototype.getModuleStatus = function() {
        return {
            errorHandler: !!(this.errorHandler && this.errorHandler.isInitialized),
            audioSystem: !!(this.audioSystem && this.audioSystem.isInitialized),
            dragDropHandler: !!(this.dragDropHandler && this.dragDropHandler.isInitialized),
            timerManager: !!(this.timerManager && this.timerManager.isInitialized),
            uiController: !!(this.uiController && this.uiController.isInitialized),
            calculatorModule: !!(this.calculatorModule && this.calculatorModule.isInitialized),
            animationEngine: !!(this.animationEngine && this.animationEngine.isInitialized),
            dataStorage: !!(this.dataStorage && this.dataStorage.isInitialized),
            gameEngine: !!(this.gameEngine && this.gameEngine.isInitialized)
        };
    };

    /**
     * Create fallback modules for graceful degradation
     */
    CalculadoraAppCompat.prototype.createFallbackErrorHandler = function() {
        return {
            isInitialized: true,
            init: function() { return true; },
            reportError: function(error, context) { console.error('Error:', error, context); },
            reportWarning: function(message, context) { console.warn('Warning:', message, context); },
            reportInfo: function(message, context) { console.info('Info:', message, context); },
            destroy: function() {}
        };
    };
    
    CalculadoraAppCompat.prototype.createFallbackAudioSystem = function() {
        return {
            isInitialized: true,
            isEnabled: false,
            playWelcome: function() {},
            playDragSuccess: function() {},
            playCalculation: function() {},
            playAlert: function() {},
            playCelebration: function() {},
            playTick: function() {},
            playUrgentTick: function() {},
            setEnabled: function() {},
            setVolume: function() {},
            pause: function() {},
            resume: function() {},
            destroy: function() {}
        };
    };
    
    CalculadoraAppCompat.prototype.createFallbackDragDropHandler = function() {
        return {
            isInitialized: true,
            onDropSuccess: null,
            init: function() { return true; },
            createDragOptions: function() {},
            resetDropZones: function() {},
            setEnabled: function() {},
            destroy: function() {}
        };
    };
    
    CalculadoraAppCompat.prototype.createFallbackTimerManager = function() {
        return {
            isInitialized: true,
            onTimerComplete: null,
            init: function() { return true; },
            startTimer: function(duration, callback) {
                setTimeout(callback, duration * 1000);
            },
            stopTimer: function() {},
            pauseTimer: function() {},
            resumeTimer: function() {},
            destroy: function() {}
        };
    };
    
    CalculadoraAppCompat.prototype.createFallbackUIController = function() {
        return {
            isInitialized: true,
            init: function() { return true; },
            showScreen: function(screenName) {
                var screens = document.querySelectorAll('.screen');
                for (var i = 0; i < screens.length; i++) {
                    screens[i].classList.remove('active');
                }
                var screen = document.getElementById(screenName + '-screen');
                if (screen) screen.classList.add('active');
            },
            updateElement: function(selector, content) {
                var element = document.querySelector(selector);
                if (element) element.textContent = content;
            },
            showWarning: function(message) {
                console.warn(message);
            },
            destroy: function() {}
        };
    };
    
    CalculadoraAppCompat.prototype.createFallbackCalculatorModule = function() {
        return {
            isInitialized: true,
            init: function() { return true; },
            getCleaningOptions: function() {
                return [
                    { label: 'Básicos', value: 'basic', price: 25 },
                    { label: 'Estándar', value: 'standard', price: 45 },
                    { label: 'Premium', value: 'premium', price: 75 },
                    { label: 'Lujo', value: 'luxury', price: 120 }
                ];
            },
            getWaterOptions: function() {
                return [
                    { label: 'Bajo', value: 'low', price: 15 },
                    { label: 'Medio', value: 'medium', price: 35 },
                    { label: 'Alto', value: 'high', price: 65 },
                    { label: 'Excesivo', value: 'excessive', price: 95 }
                ];
            },
            calculateExpenses: function() {
                return {
                    costs: { monthly: 60, annual: 720, cleaning: 45, water: 15 },
                    projections: { year10: { total: 7200 } },
                    pasteurAnalysis: { isWorthwhile: true, payback: { years: 3 } }
                };
            },
            destroy: function() {}
        };
    };
    
    CalculadoraAppCompat.prototype.createFallbackAnimationEngine = function() {
        return {
            isInitialized: true,
            init: function() { return true; },
            transitionScreen: function(from, to) {
                return new Promise(function(resolve) {
                    var fromScreen = document.getElementById(from + '-screen');
                    var toScreen = document.getElementById(to + '-screen');
                    if (fromScreen) fromScreen.classList.remove('active');
                    if (toScreen) toScreen.classList.add('active');
                    setTimeout(resolve, 100);
                });
            },
            showThinkingBrain: function(duration) {
                return new Promise(function(resolve) {
                    setTimeout(resolve, duration);
                });
            },
            showConfetti: function() {},
            fadeIn: function() {},
            bounceElement: function() {},
            pause: function() {},
            resume: function() {},
            destroy: function() {}
        };
    };
    
    CalculadoraAppCompat.prototype.createFallbackDataStorage = function() {
        return {
            isInitialized: true,
            init: function() { return true; },
            storeUserInput: function() {},
            storeCalculation: function() {},
            clearAll: function() {},
            destroy: function() {}
        };
    };

    /**
     * Show/hide loading overlay
     */
    CalculadoraAppCompat.prototype.showLoading = function(show) {
        var loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.remove('hidden');
            } else {
                loadingOverlay.classList.add('hidden');
            }
        }
    };

    /**
     * Clean up resources before page unload
     */
    CalculadoraAppCompat.prototype.handleUnload = function() {
        console.log('🧹 Cleaning up application resources...');
        this.cleanup();
    };

    /**
     * Cleanup all modules
     */
    CalculadoraAppCompat.prototype.cleanup = function() {
        var modules = [
            'gameEngine', 'audioSystem', 'dragDropHandler', 'timerManager',
            'uiController', 'calculatorModule', 'animationEngine', 'dataStorage'
        ];

        for (var i = 0; i < modules.length; i++) {
            var moduleName = modules[i];
            try {
                if (this[moduleName] && this[moduleName].destroy) {
                    this[moduleName].destroy();
                }
                this[moduleName] = null;
            } catch (error) {
                console.warn('Error cleaning up ' + moduleName + ':', error);
            }
        }

        this.isInitialized = false;
    };

    /**
     * Get application status
     */
    CalculadoraAppCompat.prototype.getStatus = function() {
        return {
            initialized: this.isInitialized,
            initializationAttempts: this.initializationAttempts,
            modules: this.getModuleStatus(),
            compatibilityMode: true
        };
    };

    // Export the compatibility app class
    window.CalculadoraAppCompat = CalculadoraAppCompat;
    
})();