/**
 * Animation Engine Module
 * Manages screen transitions, visual effects, and animations for the expense calculator game
 * Provides smooth transitions, thinking brain animation, and confetti effects
 */

export class AnimationEngine {
    constructor() {
        this.isInitialized = false;
        this.activeAnimations = new Set();
        this.animationSettings = {
            defaultDuration: 400,
            defaultEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            reducedMotion: false
        };
        
        // Animation state
        this.isAnimating = false;
        this.currentTransition = null;
        
        // Confetti particles
        this.confettiParticles = [];
        this.confettiAnimationFrame = null;
        
        // Bind methods
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.updateConfetti = this.updateConfetti.bind(this);
    }

    /**
     * Initialize the animation engine
     */
    init() {
        try {
            console.log('🎬 Initializing AnimationEngine...');
            
            // Check for reduced motion preference
            this.checkReducedMotionPreference();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Preload animation resources
            this.preloadAnimationResources();
            
            this.isInitialized = true;
            console.log('✅ AnimationEngine initialized successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize AnimationEngine:', error);
            return false;
        }
    }

    /**
     * Check for reduced motion preference
     */
    checkReducedMotionPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.animationSettings.reducedMotion = true;
            this.animationSettings.defaultDuration = 100; // Much faster animations
            console.log('🎬 Reduced motion preference detected');
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for visibility changes to pause animations
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Listen for reduced motion changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            mediaQuery.addEventListener('change', () => {
                this.checkReducedMotionPreference();
            });
        }
    }

    /**
     * Preload animation resources
     */
    preloadAnimationResources() {
        // Create CSS animations if they don't exist
        this.ensureAnimationStyles();
    }

    /**
     * Ensure required CSS animations exist
     */
    ensureAnimationStyles() {
        const styleId = 'animation-engine-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .ae-fade-in {
                animation: aeFadeIn ${this.animationSettings.defaultDuration}ms ${this.animationSettings.defaultEasing} forwards;
            }
            
            .ae-fade-out {
                animation: aeFadeOut ${this.animationSettings.defaultDuration}ms ${this.animationSettings.defaultEasing} forwards;
            }
            
            .ae-slide-in-right {
                animation: aeSlideInRight ${this.animationSettings.defaultDuration}ms ${this.animationSettings.defaultEasing} forwards;
            }
            
            .ae-slide-out-left {
                animation: aeSlideOutLeft ${this.animationSettings.defaultDuration}ms ${this.animationSettings.defaultEasing} forwards;
            }
            
            .ae-bounce {
                animation: aeBounce 0.6s ease-in-out;
            }
            
            .ae-pulse {
                animation: aePulse 1s ease-in-out infinite;
            }
            
            .ae-confetti-particle {
                position: absolute;
                width: 8px;
                height: 8px;
                pointer-events: none;
            }
            
            @keyframes aeFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes aeFadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes aeSlideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes aeSlideOutLeft {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(-100%); opacity: 0; }
            }
            
            @keyframes aeBounce {
                0%, 20%, 53%, 80%, 100% { transform: scale(1); }
                40%, 43% { transform: scale(1.1); }
                70% { transform: scale(1.05); }
            }
            
            @keyframes aePulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.8; }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Transition between screens with animation
     * @param {string} fromScreen - Current screen name
     * @param {string} toScreen - Target screen name
     * @param {Object} options - Animation options
     */
    async transitionScreen(fromScreen, toScreen, options = {}) {
        if (this.isAnimating) {
            console.warn('🎬 Animation already in progress');
            return false;
        }

        const {
            direction = 'forward',
            duration = this.animationSettings.defaultDuration,
            easing = this.animationSettings.defaultEasing
        } = options;

        console.log(`🎬 Screen transition: ${fromScreen} → ${toScreen}`);

        this.isAnimating = true;
        this.currentTransition = { fromScreen, toScreen, direction };

        try {
            // Get screen elements
            const fromElement = document.querySelector(`[data-screen="${fromScreen}"]`);
            const toElement = document.querySelector(`[data-screen="${toScreen}"]`);

            if (!toElement) {
                throw new Error(`Target screen '${toScreen}' not found`);
            }

            // Perform the transition
            await this.performScreenTransition(fromElement, toElement, { direction, duration, easing });

            this.isAnimating = false;
            this.currentTransition = null;
            return true;

        } catch (error) {
            console.error('🎬 Screen transition failed:', error);
            this.isAnimating = false;
            this.currentTransition = null;
            return false;
        }
    }

    /**
     * Perform the actual screen transition
     */
    async performScreenTransition(fromElement, toElement, options) {
        const { direction, duration, easing } = options;

        // Skip animation if reduced motion is preferred
        if (this.animationSettings.reducedMotion) {
            if (fromElement) fromElement.classList.remove('active');
            toElement.classList.add('active');
            return;
        }

        // Prepare elements
        toElement.style.transition = `all ${duration}ms ${easing}`;
        if (fromElement) {
            fromElement.style.transition = `all ${duration}ms ${easing}`;
        }

        // Set initial states
        const slideDirection = direction === 'backward' ? -100 : 100;
        
        // Position new screen off-screen
        toElement.style.transform = `translateX(${slideDirection}%)`;
        toElement.style.opacity = '0';
        toElement.classList.add('active');

        // Force reflow
        toElement.offsetHeight;

        // Start animation
        if (fromElement) {
            fromElement.style.transform = `translateX(${-slideDirection}%)`;
            fromElement.style.opacity = '0';
        }

        toElement.style.transform = 'translateX(0)';
        toElement.style.opacity = '1';

        // Wait for animation to complete
        await this.waitForTransition(duration);

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
     * Show thinking brain animation
     * @param {number} duration - Duration in milliseconds
     */
    async showThinkingBrain(duration = 3000) {
        console.log(`🧠 Thinking animation: ${duration}ms`);

        const brainIcon = document.querySelector('.brain-icon');
        const thinkingDots = document.querySelector('.thinking-dots');

        if (!brainIcon) {
            console.warn('🧠 Brain icon not found');
            await this.wait(duration);
            return;
        }

        // Add pulsing animation to brain
        brainIcon.classList.add('ae-pulse');

        // Animate thinking dots
        if (thinkingDots) {
            const dots = thinkingDots.querySelectorAll('span');
            this.animateThinkingDots(dots, duration);
        }

        // Wait for duration
        await this.wait(duration);

        // Clean up
        brainIcon.classList.remove('ae-pulse');
    }

    /**
     * Animate thinking dots
     */
    animateThinkingDots(dots, totalDuration) {
        if (!dots.length) return;

        const dotAnimationDuration = 1400; // ms per cycle
        const cycles = Math.ceil(totalDuration / dotAnimationDuration);
        let currentCycle = 0;

        const animateCycle = () => {
            if (currentCycle >= cycles) return;

            dots.forEach((dot, index) => {
                setTimeout(() => {
                    dot.style.transform = 'scale(1.2)';
                    dot.style.opacity = '1';
                    
                    setTimeout(() => {
                        dot.style.transform = 'scale(1)';
                        dot.style.opacity = '0.3';
                    }, 200);
                }, index * 160);
            });

            currentCycle++;
            setTimeout(animateCycle, dotAnimationDuration);
        };

        animateCycle();
    }

    /**
     * Show confetti animation
     * @param {Object} options - Confetti options
     */
    showConfetti(options = {}) {
        const {
            duration = 3000,
            particleCount = 50,
            colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd']
        } = options;

        console.log('🎉 Confetti animation started');

        const container = document.getElementById('confetti-container');
        if (!container) {
            console.warn('🎉 Confetti container not found');
            return;
        }

        // Clear existing confetti
        this.clearConfetti();

        // Create particles
        this.createConfettiParticles(container, particleCount, colors);

        // Start animation
        this.startConfettiAnimation();

        // Auto-stop after duration
        setTimeout(() => {
            this.stopConfetti();
        }, duration);
    }

    /**
     * Create confetti particles
     */
    createConfettiParticles(container, count, colors) {
        const containerRect = container.getBoundingClientRect();
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'ae-confetti-particle';
            
            // Random properties
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 6 + 4; // 4-10px
            const x = Math.random() * containerRect.width;
            const y = -10; // Start above container
            
            // Physics properties
            const velocity = {
                x: (Math.random() - 0.5) * 4, // -2 to 2
                y: Math.random() * 3 + 2, // 2 to 5
                rotation: Math.random() * 360
            };
            
            const gravity = 0.1;
            const drag = 0.99;
            
            // Style particle
            particle.style.backgroundColor = color;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            
            // Store physics data
            particle._physics = {
                x, y, velocity, gravity, drag,
                rotation: velocity.rotation,
                rotationSpeed: (Math.random() - 0.5) * 10
            };
            
            container.appendChild(particle);
            this.confettiParticles.push(particle);
        }
    }

    /**
     * Start confetti animation loop
     */
    startConfettiAnimation() {
        if (this.confettiAnimationFrame) return;

        this.confettiAnimationFrame = requestAnimationFrame(this.updateConfetti);
    }

    /**
     * Update confetti particles
     */
    updateConfetti() {
        const container = document.getElementById('confetti-container');
        if (!container) {
            this.stopConfetti();
            return;
        }

        const containerRect = container.getBoundingClientRect();
        const particlesToRemove = [];

        this.confettiParticles.forEach((particle, index) => {
            const physics = particle._physics;
            
            // Update physics
            physics.velocity.y += physics.gravity;
            physics.velocity.x *= physics.drag;
            physics.velocity.y *= physics.drag;
            
            physics.x += physics.velocity.x;
            physics.y += physics.velocity.y;
            physics.rotation += physics.rotationSpeed;
            
            // Update DOM
            particle.style.left = `${physics.x}px`;
            particle.style.top = `${physics.y}px`;
            particle.style.transform = `rotate(${physics.rotation}deg)`;
            
            // Remove if out of bounds
            if (physics.y > containerRect.height + 50 || 
                physics.x < -50 || 
                physics.x > containerRect.width + 50) {
                particlesToRemove.push(index);
            }
        });

        // Remove out-of-bounds particles
        particlesToRemove.reverse().forEach(index => {
            const particle = this.confettiParticles[index];
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
            this.confettiParticles.splice(index, 1);
        });

        // Continue animation if particles remain
        if (this.confettiParticles.length > 0) {
            this.confettiAnimationFrame = requestAnimationFrame(this.updateConfetti);
        } else {
            this.confettiAnimationFrame = null;
        }
    }

    /**
     * Stop confetti animation
     */
    stopConfetti() {
        if (this.confettiAnimationFrame) {
            cancelAnimationFrame(this.confettiAnimationFrame);
            this.confettiAnimationFrame = null;
        }
        
        this.clearConfetti();
        console.log('🎉 Confetti animation stopped');
    }

    /**
     * Clear all confetti particles
     */
    clearConfetti() {
        this.confettiParticles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        this.confettiParticles = [];
    }

    /**
     * Animate element with bounce effect
     */
    bounceElement(selector) {
        const element = document.querySelector(selector);
        if (!element) return;

        element.classList.remove('ae-bounce');
        // Force reflow
        element.offsetHeight;
        element.classList.add('ae-bounce');

        setTimeout(() => {
            element.classList.remove('ae-bounce');
        }, 600);
    }

    /**
     * Fade in element
     */
    fadeIn(selector, duration = null) {
        const element = document.querySelector(selector);
        if (!element) return;

        if (duration) {
            element.style.animationDuration = `${duration}ms`;
        }

        element.classList.add('ae-fade-in');
        
        setTimeout(() => {
            element.classList.remove('ae-fade-in');
            if (duration) {
                element.style.animationDuration = '';
            }
        }, duration || this.animationSettings.defaultDuration);
    }

    /**
     * Fade out element
     */
    fadeOut(selector, duration = null) {
        const element = document.querySelector(selector);
        if (!element) return;

        if (duration) {
            element.style.animationDuration = `${duration}ms`;
        }

        element.classList.add('ae-fade-out');
        
        setTimeout(() => {
            element.classList.remove('ae-fade-out');
            if (duration) {
                element.style.animationDuration = '';
            }
        }, duration || this.animationSettings.defaultDuration);
    }

    /**
     * Wait for specified duration
     */
    wait(duration) {
        return new Promise(resolve => setTimeout(resolve, duration));
    }

    /**
     * Wait for CSS transition to complete
     */
    waitForTransition(duration) {
        return new Promise(resolve => {
            setTimeout(resolve, duration + 50); // Add small buffer
        });
    }

    /**
     * Handle page visibility changes
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause animations when page is hidden
            if (this.confettiAnimationFrame) {
                cancelAnimationFrame(this.confettiAnimationFrame);
                this.confettiAnimationFrame = null;
            }
        } else {
            // Resume confetti if particles exist
            if (this.confettiParticles.length > 0 && !this.confettiAnimationFrame) {
                this.startConfettiAnimation();
            }
        }
    }

    /**
     * Get animation status
     */
    getStatus() {
        return {
            isAnimating: this.isAnimating,
            currentTransition: this.currentTransition,
            confettiActive: this.confettiParticles.length > 0,
            reducedMotion: this.animationSettings.reducedMotion
        };
    }

    /**
     * Set animation settings
     */
    setSettings(settings) {
        this.animationSettings = { ...this.animationSettings, ...settings };
        console.log('🎬 Animation settings updated:', this.animationSettings);
    }

    /**
     * Cleanup and destroy the animation engine
     */
    destroy() {
        // Stop all animations
        this.stopConfetti();
        
        // Remove event listeners
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Clear active animations
        this.activeAnimations.clear();
        
        // Remove injected styles
        const styleElement = document.getElementById('animation-engine-styles');
        if (styleElement) {
            styleElement.remove();
        }
        
        // Reset state
        this.isAnimating = false;
        this.currentTransition = null;
        this.isInitialized = false;
        
        console.log('🧹 AnimationEngine destroyed');
    }
}
// Universal Module Compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnimationEngine };
} else if (typeof window !== 'undefined') {
    window.AnimationEngine = AnimationEngine;
}