/**
 * Game Engine Module
 * Central orchestrator managing application flow, screen transitions, and user interactions
 */

export class GameEngine {
    constructor(dependencies) {
        this.audioSystem = dependencies.audioSystem;
        this.dragDropHandler = dependencies.dragDropHandler;
        this.timerManager = dependencies.timerManager;
        this.animationEngine = dependencies.animationEngine;
        this.calculatorModule = dependencies.calculatorModule;
        this.dataStorage = dependencies.dataStorage;
        this.uiController = dependencies.uiController;

        this.currentScreen = 'welcome';
        this.gameState = {
            cleaningExpenses: [],
            waterExpenses: null,
            monthlyTotal: 0,
            annualTotal: 0,
            projectionYears: 0,
            totalProjection: 0,
            startTime: null,
            completionTime: null
        };

        this.isInitialized = false;
        this.isGameActive = false;

        // Bind methods
        this.handleScreenTransition = this.handleScreenTransition.bind(this);
        this.handleUserInput = this.handleUserInput.bind(this);
    }

    /**
     * Initialize the game engine
     */
    async init() {
        try {
            console.log('Initializing Game Engine...');
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('Game Engine initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Failed to initialize Game Engine:', error);
            return false;
        }
    }

    /**
     * Set up event listeners for UI interactions
     */
    setupEventListeners() {
        console.log('🔗 Setting up GameEngine event listeners...');
        
        // Wait for DOM to be ready if needed
        const setupListeners = () => {
            // Start button
            const startButton = document.getElementById('start-button');
            if (startButton) {
                // Remove any existing listeners
                const newStartButton = startButton.cloneNode(true);
                startButton.parentNode.replaceChild(newStartButton, startButton);
                
                newStartButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🎮 Start button clicked!');
                    this.startGame();
                });
                console.log('✅ Start button listener attached');
            } else {
                console.warn('⚠️ Start button not found in DOM');
            }

            // Rules continue button
            const rulesContinue = document.getElementById('rules-continue');
            if (rulesContinue) {
                rulesContinue.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('📋 Rules continue button clicked!');
                    this.nextScreen();
                });
                console.log('✅ Rules continue button listener attached');
            }

            // Validation buttons
            const validationYes = document.getElementById('validation-yes');
            const validationNo = document.getElementById('validation-no');
            
            if (validationYes) {
                validationYes.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleValidation(true);
                });
            }
            
            if (validationNo) {
                validationNo.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleValidation(false);
                });
            }

            // Prize continue button
            const prizeContinue = document.getElementById('prize-continue');
            if (prizeContinue) {
                prizeContinue.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.endGame();
                });
            }

            // Listen for drag-drop events
            if (this.dragDropHandler) {
                this.dragDropHandler.onDropSuccess = (data) => this.handleUserInput(data);
            }

            // Listen for timer events
            if (this.timerManager) {
                this.timerManager.onTimerComplete = () => this.handleTimerExpired();
            }
            
            console.log('✅ All event listeners set up');
        };
        
        // Setup immediately if DOM is ready, otherwise wait
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupListeners);
        } else {
            // DOM is already ready, but wait a bit to ensure all elements are rendered
            setTimeout(setupListeners, 100);
        }
    }

    /**
     * Start the game
     */
    async startGame() {
        console.log('🎮 Starting game...');
        
        try {
            this.gameState.startTime = Date.now();
            this.isGameActive = true;
            
            // Reset game state
            this.resetGameState();
            
            // Play welcome sound (optional)
            if (this.audioSystem && typeof this.audioSystem.playWelcome === 'function') {
                try {
                    this.audioSystem.playWelcome();
                } catch (error) {
                    console.warn('⚠️ Could not play welcome sound:', error);
                }
            }
            
            // Transition to rules screen
            console.log('🔄 Transitioning to rules screen...');
            await this.transitionToScreen('rules');
            console.log('✅ Game started successfully');
        } catch (error) {
            console.error('❌ Error starting game:', error);
            // Try to show rules screen anyway as fallback
            if (this.uiController) {
                try {
                    await this.uiController.showScreen('rules');
                    this.currentScreen = 'rules';
                } catch (fallbackError) {
                    console.error('❌ Fallback also failed:', fallbackError);
                }
            }
        }
    }

    /**
     * Reset game state to initial values
     */
    resetGameState() {
        this.gameState = {
            cleaningExpenses: [],
            waterExpenses: null,
            monthlyTotal: 0,
            annualTotal: 0,
            projectionYears: 0,
            totalProjection: 0,
            startTime: this.gameState.startTime,
            completionTime: null
        };

        // Clear data storage
        if (this.dataStorage) {
            this.dataStorage.clearAll();
        }
    }

    /**
     * Transition to next screen in sequence
     */
    nextScreen() {
        const screenSequence = [
            'welcome',
            'rules', 
            'countdown',
            'product',
            'water',
            'results',
            'validation',
            'prize'
        ];

        const currentIndex = screenSequence.indexOf(this.currentScreen);
        if (currentIndex < screenSequence.length - 1) {
            const nextScreen = screenSequence[currentIndex + 1];
            this.transitionToScreen(nextScreen);
        }
    }

    /**
     * Transition to a specific screen
     */
    async transitionToScreen(screenName) {
        if (!this.isInitialized) {
            console.warn('⚠️ Game Engine not initialized, attempting to initialize...');
            await this.init();
        }

        console.log(`🔄 Transitioning to screen: ${this.currentScreen} → ${screenName}`);

        try {
            // Stop any active timers
            if (this.timerManager) {
                this.timerManager.stopTimer();
            }

            // Perform screen transition animation
            if (this.animationEngine && this.animationEngine.isInitialized) {
                await this.animationEngine.transitionScreen(this.currentScreen, screenName);
            } else {
                // Fallback without animation - use UIController directly
                if (this.uiController) {
                    const success = await this.uiController.showScreen(screenName);
                    if (!success) {
                        console.error(`❌ Failed to show screen: ${screenName}`);
                        return;
                    }
                } else {
                    console.error('❌ UIController not available');
                    return;
                }
            }

            this.currentScreen = screenName;
            console.log(`✅ Successfully transitioned to screen: ${screenName}`);

            // Handle screen-specific logic
            await this.handleScreenEnter(screenName);

        } catch (error) {
            console.error(`❌ Failed to transition to screen ${screenName}:`, error);
            console.error('Error details:', error.stack);
        }
    }

    /**
     * Handle logic when entering a specific screen
     */
    async handleScreenEnter(screenName) {
        switch (screenName) {
            case 'countdown':
                await this.handleCountdownScreen();
                break;
            case 'product':
                this.handleProductScreen();
                break;
            case 'water':
                this.handleWaterScreen();
                break;
            case 'results':
                await this.handleResultsScreen();
                break;
            case 'validation':
                this.handleValidationScreen();
                break;
            case 'prize':
                this.handlePrizeScreen();
                break;
        }
    }

    /**
     * Handle countdown screen
     */
    async handleCountdownScreen() {
        const countdownNumbers = [3, 2, 1];
        
        for (const number of countdownNumbers) {
            // Update countdown display
            const countdownElement = document.getElementById('countdown-number');
            if (countdownElement) {
                countdownElement.textContent = number;
            }

            // Play tick sound
            if (this.audioSystem) {
                this.audioSystem.playTick();
            }

            // Wait 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Proceed to first product screen
        this.transitionToScreen('product');
    }

    /**
     * Handle product configuration screen
     */
    handleProductScreen() {
        // Start 10-second timer
        if (this.timerManager) {
            this.timerManager.startTimer(10, () => this.handleTimerExpired());
        }

        // Set up product options using CalculatorModule data
        this.setupProductOptions();
        
        console.log('Product screen active with real options');
    }

    /**
     * Set up product options from CalculatorModule
     */
    setupProductOptions() {
        if (!this.calculatorModule) {
            console.warn('CalculatorModule not available');
            return;
        }

        // Get product options from calculator
        const productOptions = this.calculatorModule.getCleaningOptions();
        
        // Create drag options using DragDropHandler
        if (this.dragDropHandler) {
            const dragContainer = document.getElementById('drag-options');
            if (dragContainer) {
                this.dragDropHandler.createDragOptions(dragContainer, productOptions);
                console.log('Created product drag options:', productOptions.length);
            }
        }

        // Update screen title with more specific text
        if (this.uiController) {
            this.uiController.updateElement('#product-title', 'Productos de Limpieza');
        }
    }

    /**
     * Handle water configuration screen
     */
    handleWaterScreen() {
        // Start 10-second timer
        if (this.timerManager) {
            this.timerManager.startTimer(10, () => this.handleTimerExpired());
        }

        // Set up water options using CalculatorModule data
        this.setupWaterOptions();
        
        console.log('Water screen active with real options');
    }

    /**
     * Set up water consumption options from CalculatorModule
     */
    setupWaterOptions() {
        if (!this.calculatorModule) {
            console.warn('CalculatorModule not available');
            return;
        }

        // Get water options from calculator
        const waterOptions = this.calculatorModule.getWaterOptions();
        
        // Create drag options using DragDropHandler
        if (this.dragDropHandler) {
            const dragContainer = document.getElementById('water-options');
            if (dragContainer) {
                this.dragDropHandler.createDragOptions(dragContainer, waterOptions);
                console.log('Created water drag options:', waterOptions.length);
            }
        }

        // Update screen title with more specific text
        if (this.uiController) {
            this.uiController.updateElement('#water-title', 'Consumo de Agua');
        }

        // Show helpful tip for water selection
        this.showWaterSelectionTip();
    }

    /**
     * Show helpful tip for water selection
     */
    showWaterSelectionTip() {
        if (!this.uiController) return;

        const tipMessage = 'Selecciona el nivel que mejor represente tu consumo mensual de agua';
        
        // Show tip for 3 seconds
        setTimeout(() => {
            this.uiController.showWarning(tipMessage, 3000);
        }, 500);
    }

    /**
     * Handle results/calculation screen
     */
    async handleResultsScreen() {
        // Play calculation sound
        if (this.audioSystem) {
            this.audioSystem.playCalculation();
        }

        // Show thinking animation for 3 seconds
        if (this.animationEngine) {
            await this.animationEngine.showThinkingBrain(3000);
        } else {
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Calculate results
        this.calculateResults();

        // Show results
        this.displayResults();

        // Auto-proceed after showing results
        setTimeout(() => {
            this.transitionToScreen('validation');
        }, 2000);
    }

    /**
     * Handle validation screen
     */
    handleValidationScreen() {
        console.log('Validation screen active');
    }

    /**
     * Handle prize screen
     */
    handlePrizeScreen() {
        // Play celebration sound
        if (this.audioSystem) {
            this.audioSystem.playCelebration();
        }

        // Show confetti animation
        if (this.animationEngine) {
            this.animationEngine.showConfetti();
        }

        // Record completion time
        this.gameState.completionTime = Date.now();
        const duration = (this.gameState.completionTime - this.gameState.startTime) / 1000;
        console.log(`Game completed in ${duration.toFixed(1)} seconds`);
    }

    /**
     * Handle user input from drag-drop or other interactions
     */
    handleUserInput(inputData) {
        console.log('User input received:', inputData);

        // Store input data
        if (this.dataStorage) {
            this.dataStorage.storeUserInput(this.currentScreen, inputData);
        }

        // Play success sound
        if (this.audioSystem) {
            this.audioSystem.playDragSuccess();
        }

        // Proceed to next screen or handle input
        this.processUserInput(inputData);
    }

    /**
     * Process user input based on current screen
     */
    processUserInput(inputData) {
        switch (this.currentScreen) {
            case 'product':
                this.handleProductInput(inputData);
                break;
            case 'water':
                this.handleWaterInput(inputData);
                break;
            default:
                console.log('Input processed for screen:', this.currentScreen);
        }
    }

    /**
     * Handle product input
     */
    handleProductInput(inputData) {
        console.log('Product input received:', inputData);
        
        // Store the selection in game state
        this.gameState.cleaningExpenses = {
            type: inputData.value,
            label: inputData.label,
            price: inputData.price || 0,
            timestamp: Date.now()
        };

        // Store in data storage
        if (this.dataStorage) {
            this.dataStorage.storeUserInput('product', {
                selection: inputData.value,
                label: inputData.label,
                price: inputData.price,
                selectionTime: Date.now() - this.gameState.startTime
            });
        }

        // Play success sound
        if (this.audioSystem) {
            this.audioSystem.playDragSuccess();
        }

        // Show selection feedback
        this.showProductSelectionFeedback(inputData);
        
        // Proceed to next screen after brief delay
        setTimeout(() => {
            this.nextScreen();
        }, 800);
    }

    /**
     * Show feedback for product selection
     */
    showProductSelectionFeedback(inputData) {
        if (!this.uiController) return;

        // Update drop zone to show selection
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            dropZone.classList.add('has-selection');
            const dropText = dropZone.querySelector('.drop-zone-text');
            if (dropText) {
                dropText.textContent = `Seleccionado: ${inputData.label}`;
            }
        }

        // Add bounce animation to the drop zone
        if (this.animationEngine) {
            this.animationEngine.bounceElement('#drop-zone');
        }

        console.log(`Product selected: ${inputData.label} (${inputData.value})`);
    }

    /**
     * Handle water input
     */
    handleWaterInput(inputData) {
        console.log('Water input received:', inputData);
        
        // Store the selection in game state
        this.gameState.waterExpenses = {
            type: inputData.value,
            label: inputData.label,
            price: inputData.price || 0,
            timestamp: Date.now()
        };

        // Store in data storage
        if (this.dataStorage) {
            this.dataStorage.storeUserInput('water', {
                selection: inputData.value,
                label: inputData.label,
                price: inputData.price,
                selectionTime: Date.now() - this.gameState.startTime
            });
        }

        // Play success sound
        if (this.audioSystem) {
            this.audioSystem.playDragSuccess();
        }

        // Show selection feedback
        this.showWaterSelectionFeedback(inputData);
        
        // Check if selection seems unusually high and show warning
        this.checkWaterConsumptionWarning(inputData);
        
        // Proceed to results screen after brief delay
        setTimeout(() => {
            this.transitionToScreen('results');
        }, 1200); // Slightly longer delay to show any warnings
    }

    /**
     * Show feedback for water selection
     */
    showWaterSelectionFeedback(inputData) {
        if (!this.uiController) return;

        // Update drop zone to show selection
        const waterDropZone = document.getElementById('water-drop-zone');
        if (waterDropZone) {
            waterDropZone.classList.add('has-selection');
            const dropText = waterDropZone.querySelector('.drop-zone-text');
            if (dropText) {
                dropText.textContent = `Seleccionado: ${inputData.label}`;
            }
        }

        // Add bounce animation to the drop zone
        if (this.animationEngine) {
            this.animationEngine.bounceElement('#water-drop-zone');
        }

        console.log(`Water consumption selected: ${inputData.label} (${inputData.value})`);
    }

    /**
     * Check if water consumption is unusually high and show warning
     */
    checkWaterConsumptionWarning(inputData) {
        if (!this.uiController) return;

        // Show warning for high consumption levels
        if (inputData.value === 'excessive') {
            const warningMessage = '⚠️ Consumo muy alto detectado. El Sistema Pasteur puede generar ahorros significativos.';
            this.uiController.showWarning(warningMessage, 3000);
        } else if (inputData.value === 'high') {
            const warningMessage = '💡 Con tu nivel de consumo, el Sistema Pasteur puede ser muy beneficioso.';
            this.uiController.showWarning(warningMessage, 2500);
        }
    }

    /**
     * Handle timer expiration
     */
    handleTimerExpired() {
        console.log('Timer expired on screen:', this.currentScreen);
        
        // Auto-proceed with default selection based on current screen
        switch (this.currentScreen) {
            case 'product':
                this.handleDefaultProductSelection();
                break;
            case 'water':
                this.handleDefaultWaterSelection();
                break;
            default:
                // Generic timeout handling
                this.handleUserInput({ type: 'timeout', screen: this.currentScreen });
        }
    }

    /**
     * Handle default product selection when timer expires
     */
    handleDefaultProductSelection() {
        if (!this.calculatorModule) {
            this.nextScreen();
            return;
        }

        // Select the "standard" option as default
        const productOptions = this.calculatorModule.getCleaningOptions();
        const defaultOption = productOptions.find(opt => opt.value === 'standard') || productOptions[1] || productOptions[0];
        
        if (defaultOption) {
            console.log('Auto-selecting default product:', defaultOption.label);
            
            // Show warning about auto-selection
            if (this.uiController) {
                this.uiController.showWarning(`Tiempo agotado. Seleccionado automáticamente: ${defaultOption.label}`, 2000);
            }
            
            // Process the default selection
            this.handleProductInput(defaultOption);
        } else {
            this.nextScreen();
        }
    }

    /**
     * Handle default water selection when timer expires
     */
    handleDefaultWaterSelection() {
        if (!this.calculatorModule) {
            this.transitionToScreen('results');
            return;
        }

        // Select the "medium" option as default
        const waterOptions = this.calculatorModule.getWaterOptions();
        const defaultOption = waterOptions.find(opt => opt.value === 'medium') || waterOptions[1] || waterOptions[0];
        
        if (defaultOption) {
            console.log('Auto-selecting default water consumption:', defaultOption.label);
            
            // Show warning about auto-selection
            if (this.uiController) {
                this.uiController.showWarning(`Tiempo agotado. Seleccionado automáticamente: ${defaultOption.label}`, 2000);
            }
            
            // Process the default selection
            this.handleWaterInput(defaultOption);
        } else {
            this.transitionToScreen('results');
        }
    }

    /**
     * Handle validation response
     */
    handleValidation(isCorrect) {
        console.log('Validation response:', isCorrect);
        
        // Store validation result
        if (this.dataStorage) {
            this.dataStorage.storeUserInput('validation', { isCorrect });
        }

        // Proceed to prize screen
        this.transitionToScreen('prize');
    }

    /**
     * Calculate final results using CalculatorModule
     */
    calculateResults() {
        if (!this.calculatorModule) {
            console.error('CalculatorModule not available for calculations');
            // Fallback to placeholder values
            this.gameState.monthlyTotal = 150.75;
            this.gameState.annualTotal = this.gameState.monthlyTotal * 12;
            this.gameState.projectionYears = 10;
            this.gameState.totalProjection = this.gameState.annualTotal * this.gameState.projectionYears;
            return;
        }

        // Prepare selections for calculator
        const selections = {
            cleaningProducts: this.gameState.cleaningExpenses?.type || 'standard',
            waterConsumption: this.gameState.waterExpenses?.type || 'medium'
        };

        console.log('Calculating with selections:', selections);

        // Perform real calculation
        const calculation = this.calculatorModule.calculateExpenses(selections);
        
        if (calculation) {
            // Update game state with real calculated values
            this.gameState.monthlyTotal = calculation.costs.monthly;
            this.gameState.annualTotal = calculation.costs.annual;
            this.gameState.projectionYears = 10; // Default projection period
            this.gameState.totalProjection = calculation.projections.year10.total;
            
            // Store complete calculation result
            this.gameState.fullCalculation = calculation;
            
            // Store calculation in data storage
            if (this.dataStorage) {
                this.dataStorage.storeCalculation(calculation);
            }

            console.log('Real calculation completed:', {
                monthly: this.gameState.monthlyTotal,
                annual: this.gameState.annualTotal,
                projection10Years: this.gameState.totalProjection,
                pasteurSavings: calculation.pasteurAnalysis.monthlySavings.total,
                roi: calculation.pasteurAnalysis.roi
            });
        } else {
            console.error('Calculation failed, using fallback values');
            // Fallback values
            this.gameState.monthlyTotal = 80.00;
            this.gameState.annualTotal = 960.00;
            this.gameState.projectionYears = 10;
            this.gameState.totalProjection = 12000.00;
        }
    }

    /**
     * Display calculation results with enhanced information
     */
    displayResults() {
        // Update main amount display
        const amountElement = document.getElementById('total-amount');
        if (amountElement) {
            amountElement.textContent = this.gameState.monthlyTotal.toFixed(2);
        }

        // Add additional result information if full calculation is available
        this.displayEnhancedResults();

        // Hide thinking animation and show results with animation
        const thinkingAnimation = document.getElementById('thinking-animation');
        const calculationResult = document.getElementById('calculation-result');
        
        if (thinkingAnimation) {
            thinkingAnimation.classList.add('hidden');
        }
        
        if (calculationResult) {
            calculationResult.classList.remove('hidden');
            
            // Add fade-in animation
            if (this.animationEngine) {
                this.animationEngine.fadeIn('#calculation-result', 600);
            }
        }

        // Update screen header with personalized message
        this.updateResultsHeader();
    }

    /**
     * Display enhanced results with breakdown information
     */
    displayEnhancedResults() {
        if (!this.gameState.fullCalculation) return;

        const calculation = this.gameState.fullCalculation;
        
        // Try to add breakdown information to the results
        const resultContainer = document.getElementById('calculation-result');
        if (resultContainer && !resultContainer.querySelector('.expense-breakdown')) {
            
            // Create breakdown element
            const breakdown = document.createElement('div');
            breakdown.className = 'expense-breakdown';
            breakdown.innerHTML = `
                <div class="breakdown-item">
                    <span class="breakdown-label">Productos de limpieza:</span>
                    <span class="breakdown-value">$${calculation.costs.cleaning.toFixed(2)}/mes</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">Consumo de agua:</span>
                    <span class="breakdown-value">$${calculation.costs.water.toFixed(2)}/mes</span>
                </div>
                <div class="breakdown-total">
                    <span class="breakdown-label">Total anual:</span>
                    <span class="breakdown-value">$${calculation.costs.annual.toFixed(2)}</span>
                </div>
            `;
            
            // Insert breakdown after the main total
            const expenseTotal = resultContainer.querySelector('.expense-total');
            if (expenseTotal) {
                expenseTotal.parentNode.insertBefore(breakdown, expenseTotal.nextSibling);
            }
        }
    }

    /**
     * Update results header with personalized message
     */
    updateResultsHeader() {
        const header = document.querySelector('#results-screen .screen-header h2');
        if (header && this.gameState.fullCalculation) {
            const calculation = this.gameState.fullCalculation;
            
            // Personalized message based on calculation
            if (calculation.pasteurAnalysis.isWorthwhile) {
                if (calculation.pasteurAnalysis.payback.years <= 2) {
                    header.textContent = '¡Excelente oportunidad de ahorro!';
                } else if (calculation.pasteurAnalysis.payback.years <= 3) {
                    header.textContent = '¡Buena inversión detectada!';
                } else {
                    header.textContent = 'Ahorros a largo plazo disponibles';
                }
            } else {
                header.textContent = 'Tus gastos actuales';
            }
        } else if (header) {
            header.textContent = 'Tus gastos mensuales';
        }
    }

    /**
     * End the game
     */
    endGame() {
        console.log('Game ended');
        
        this.isGameActive = false;
        
        // Could transition back to welcome or show final screen
        // For now, just log completion
        const duration = (Date.now() - this.gameState.startTime) / 1000;
        console.log(`Total game duration: ${duration.toFixed(1)} seconds`);
    }

    /**
     * Get current game state
     */
    getGameState() {
        return { ...this.gameState };
    }

    /**
     * Check if game is currently active
     */
    isActive() {
        return this.isGameActive;
    }

    /**
     * Cleanup and destroy the game engine
     */
    destroy() {
        this.isGameActive = false;
        this.isInitialized = false;
        
        // Stop any active timers
        if (this.timerManager) {
            this.timerManager.stopTimer();
        }

        console.log('Game Engine destroyed');
    }
}

// Universal Module Compatibility
// Support both ES6 modules and global script loading
if (typeof module !== 'undefined' && module.exports) {
    // CommonJS
    module.exports = { GameEngine };
} else if (typeof window !== 'undefined') {
    // Browser global
    window.GameEngine = GameEngine;
}