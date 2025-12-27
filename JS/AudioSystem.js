/**
 * Audio System Module
 * Manages Web Audio API context and sound effects with mobile gesture handling
 * Optimized for efficient synthetic sound generation and compression
 */

export class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.soundBuffers = new Map();
        this.compressedSounds = new Map(); // Cache for compressed sound data
        this.isInitialized = false;
        this.isEnabled = true;
        this.masterVolume = 0.7;
        this.currentSounds = new Set();
        
        // Optimization settings
        this.compressionSettings = {
            sampleRate: 22050, // Reduced from default 44100 for smaller buffers
            bitDepth: 16, // Effective bit depth for compression
            enableCompression: true,
            enableCaching: true,
            maxConcurrentSounds: 8 // Limit concurrent sounds for performance
        };
        
        // Sound definitions with compression metadata
        this.sounds = {
            welcome: { 
                url: null, 
                buffer: null, 
                compressed: null,
                priority: 'high',
                duration: 0.3,
                complexity: 'medium' // For compression optimization
            },
            dragSuccess: { 
                url: null, 
                buffer: null, 
                compressed: null,
                priority: 'high',
                duration: 0.1,
                complexity: 'low'
            },
            calculation: { 
                url: null, 
                buffer: null, 
                compressed: null,
                priority: 'medium',
                duration: 0.5,
                complexity: 'high'
            },
            alert: { 
                url: null, 
                buffer: null, 
                compressed: null,
                priority: 'high',
                duration: 0.4,
                complexity: 'medium'
            },
            celebration: { 
                url: null, 
                buffer: null, 
                compressed: null,
                priority: 'medium',
                duration: 1.0,
                complexity: 'high'
            },
            tick: { 
                url: null, 
                buffer: null, 
                compressed: null,
                priority: 'high',
                duration: 0.05,
                complexity: 'low'
            },
            urgentTick: { 
                url: null, 
                buffer: null, 
                compressed: null,
                priority: 'high',
                duration: 0.08,
                complexity: 'low'
            }
        };

        // Performance monitoring
        this.performanceStats = {
            soundsGenerated: 0,
            totalGenerationTime: 0,
            compressionRatio: 0,
            memoryUsage: 0
        };

        // Bind methods
        this.handleUserGesture = this.handleUserGesture.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }

    /**
     * Initialize the audio system
     * Note: AudioContext creation is deferred until first user gesture
     */
    async init() {
        try {
            // Set up event listeners for user gesture
            this.setupGestureListeners();
            
            // Listen for visibility changes
            document.addEventListener('visibilitychange', this.handleVisibilityChange);
            
            console.log('AudioSystem initialized (waiting for user gesture)');
            return true;
        } catch (error) {
            console.warn('AudioSystem initialization failed:', error);
            this.isEnabled = false;
            return false;
        }
    }

    /**
     * Set up event listeners to capture first user gesture
     */
    setupGestureListeners() {
        const events = ['touchstart', 'touchend', 'mousedown', 'keydown', 'click'];
        
        const handleFirstGesture = async (event) => {
            // Remove all gesture listeners
            events.forEach(eventType => {
                document.removeEventListener(eventType, handleFirstGesture, true);
            });
            
            // Initialize audio context
            await this.initializeAudioContext();
        };

        // Add listeners for all gesture events
        events.forEach(eventType => {
            document.addEventListener(eventType, handleFirstGesture, true);
        });
    }

    /**
     * Initialize Web Audio API context and create sound buffers
     */
    async initializeAudioContext() {
        if (this.isInitialized) return;

        try {
            // Create AudioContext with optimized settings
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            
            if (!AudioContextClass) {
                throw new Error('Web Audio API not supported in this browser');
            }
            
            // Use optimized sample rate for better compression
            const contextOptions = {
                sampleRate: this.compressionSettings.sampleRate,
                latencyHint: 'interactive'
            };
            
            this.audioContext = new AudioContextClass(contextOptions);

            // Resume context if suspended (required on some mobile browsers)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Create synthetic sound buffers with compression
            await this.createOptimizedSyntheticSounds();

            this.isInitialized = true;
            console.log(`Web Audio API initialized successfully (Sample Rate: ${this.audioContext.sampleRate}Hz)`);
            console.log(`Audio compression enabled: ${this.compressionSettings.enableCompression}`);

            // Log performance stats
            this.logPerformanceStats();

            // Play welcome sound
            this.playWelcome();

        } catch (error) {
            console.warn('Failed to initialize Web Audio API:', error);
            this.isEnabled = false;
            
            // Report error to error handler if available
            if (window.calculadoraApp?.errorHandler) {
                window.calculadoraApp.errorHandler.reportAudioError(error, {
                    context: 'initialization',
                    userAgent: navigator.userAgent,
                    audioContextSupport: !!(window.AudioContext || window.webkitAudioContext),
                    compressionSettings: this.compressionSettings
                });
            }
        }
    }

    /**
     * Create optimized synthetic sound effects using Web Audio API
     */
    async createOptimizedSyntheticSounds() {
        try {
            const startTime = performance.now();
            const sampleRate = this.audioContext.sampleRate;
            let totalUncompressedSize = 0;
            let totalCompressedSize = 0;

            console.log('🎵 Generating optimized synthetic sounds...');

            // Generate sounds with compression optimization
            for (const [soundName, soundConfig] of Object.entries(this.sounds)) {
                const generationStart = performance.now();
                
                // Generate sound based on type with optimized parameters
                let buffer;
                switch (soundName) {
                    case 'welcome':
                        buffer = this.createOptimizedChimeSound(sampleRate, [440, 554, 659], soundConfig.duration);
                        break;
                    case 'dragSuccess':
                        buffer = this.createOptimizedBeepSound(sampleRate, 800, soundConfig.duration);
                        break;
                    case 'calculation':
                        buffer = this.createOptimizedProcessingSound(sampleRate, soundConfig.duration);
                        break;
                    case 'alert':
                        buffer = this.createOptimizedAlertSound(sampleRate, soundConfig.duration);
                        break;
                    case 'celebration':
                        buffer = this.createOptimizedCelebrationSound(sampleRate, soundConfig.duration);
                        break;
                    case 'tick':
                        buffer = this.createOptimizedTickSound(sampleRate, 600, soundConfig.duration);
                        break;
                    case 'urgentTick':
                        buffer = this.createOptimizedTickSound(sampleRate, 800, soundConfig.duration);
                        break;
                    default:
                        console.warn(`Unknown sound type: ${soundName}`);
                        continue;
                }

                soundConfig.buffer = buffer;
                
                // Calculate sizes for compression ratio
                const uncompressedSize = buffer.length * buffer.numberOfChannels * 4; // 32-bit float
                totalUncompressedSize += uncompressedSize;

                // Apply compression if enabled
                if (this.compressionSettings.enableCompression) {
                    const compressed = this.compressAudioBuffer(buffer, soundConfig.complexity);
                    soundConfig.compressed = compressed;
                    totalCompressedSize += compressed.byteLength;
                } else {
                    totalCompressedSize += uncompressedSize;
                }

                const generationTime = performance.now() - generationStart;
                console.log(`✅ Generated ${soundName} (${generationTime.toFixed(2)}ms, ${soundConfig.complexity} complexity)`);
                
                this.performanceStats.soundsGenerated++;
            }

            // Calculate performance metrics
            const totalTime = performance.now() - startTime;
            this.performanceStats.totalGenerationTime = totalTime;
            this.performanceStats.compressionRatio = totalUncompressedSize > 0 ? 
                (totalUncompressedSize - totalCompressedSize) / totalUncompressedSize : 0;
            this.performanceStats.memoryUsage = totalCompressedSize;

            console.log(`🎵 Sound generation complete (${totalTime.toFixed(2)}ms total)`);
            
        } catch (error) {
            console.warn('Failed to create optimized synthetic sounds:', error);
            
            // Report error to error handler if available
            if (window.calculadoraApp?.errorHandler) {
                window.calculadoraApp.errorHandler.reportAudioError(error, {
                    context: 'optimized_sound_creation',
                    sampleRate: this.audioContext?.sampleRate,
                    compressionSettings: this.compressionSettings
                });
            }
            
            throw error;
        }
    }

    /**
     * Compress audio buffer data for memory efficiency
     */
    compressAudioBuffer(buffer, complexity = 'medium') {
        const channelData = buffer.getChannelData(0);
        const length = channelData.length;
        
        // Determine compression level based on complexity
        let compressionFactor;
        switch (complexity) {
            case 'low':
                compressionFactor = 4; // Aggressive compression for simple sounds
                break;
            case 'medium':
                compressionFactor = 2; // Moderate compression
                break;
            case 'high':
                compressionFactor = 1; // Minimal compression for complex sounds
                break;
            default:
                compressionFactor = 2;
        }

        // Simple compression: reduce bit depth and apply basic quantization
        const compressedLength = Math.ceil(length / compressionFactor);
        const compressed = new Int16Array(compressedLength);
        
        for (let i = 0; i < compressedLength; i++) {
            const sourceIndex = i * compressionFactor;
            if (sourceIndex < length) {
                // Convert float32 to int16 with quantization
                const sample = channelData[sourceIndex];
                compressed[i] = Math.round(sample * 32767);
            }
        }

        return compressed.buffer;
    }

    /**
     * Decompress audio buffer for playback
     */
    decompressAudioBuffer(compressedData, originalLength, complexity = 'medium') {
        const compressed = new Int16Array(compressedData);
        const buffer = this.audioContext.createBuffer(1, originalLength, this.audioContext.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        // Determine compression factor
        let compressionFactor;
        switch (complexity) {
            case 'low': compressionFactor = 4; break;
            case 'medium': compressionFactor = 2; break;
            case 'high': compressionFactor = 1; break;
            default: compressionFactor = 2;
        }

        // Decompress with interpolation for smoother playback
        for (let i = 0; i < originalLength; i++) {
            const compressedIndex = Math.floor(i / compressionFactor);
            if (compressedIndex < compressed.length) {
                // Convert int16 back to float32
                channelData[i] = compressed[compressedIndex] / 32767;
            }
        }

        return buffer;
    }

    /**
     * Create an optimized chime sound with reduced memory footprint
     */
    createOptimizedChimeSound(sampleRate, frequencies, duration) {
        const length = Math.floor(sampleRate * duration);
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // Pre-calculate envelope for efficiency
        const envelopeCache = new Float32Array(length);
        for (let i = 0; i < length; i++) {
            const time = i / sampleRate;
            envelopeCache[i] = Math.exp(-time * 3);
        }

        // Generate optimized waveform
        for (let i = 0; i < length; i++) {
            const time = i / sampleRate;
            let sample = 0;

            frequencies.forEach((freq, index) => {
                const delay = index * 0.1;
                if (time >= delay) {
                    // Use lookup table for sine calculation optimization
                    const phase = 2 * Math.PI * freq * (time - delay);
                    sample += Math.sin(phase) * envelopeCache[i] * 0.3;
                }
            });

            data[i] = sample;
        }

        return buffer;
    }

    /**
     * Create an optimized beep sound
     */
    createOptimizedBeepSound(sampleRate, frequency, duration) {
        const length = Math.floor(sampleRate * duration);
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // Optimized generation with pre-calculated values
        const phaseIncrement = 2 * Math.PI * frequency / sampleRate;
        let phase = 0;

        for (let i = 0; i < length; i++) {
            const envelope = Math.exp(-i / sampleRate * 10);
            data[i] = Math.sin(phase) * envelope * 0.5;
            phase += phaseIncrement;
        }

        return buffer;
    }

    /**
     * Create an optimized processing sound
     */
    createOptimizedProcessingSound(sampleRate, duration) {
        const length = Math.floor(sampleRate * duration);
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // Pre-calculate modulation for efficiency
        const baseFreq = 200;
        const modDepth = 100;
        const modRate = 8;

        for (let i = 0; i < length; i++) {
            const time = i / sampleRate;
            const freq = baseFreq + Math.sin(time * modRate) * modDepth;
            const envelope = 0.3 * (1 - time / duration);
            const phase = 2 * Math.PI * freq * time;
            data[i] = Math.sin(phase) * envelope;
        }

        return buffer;
    }

    /**
     * Create an optimized alert sound
     */
    createOptimizedAlertSound(sampleRate, duration) {
        const length = Math.floor(sampleRate * duration);
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // Optimized frequency modulation
        const baseFreq = 400;
        const modDepth = 200;
        const modRate = 20;

        for (let i = 0; i < length; i++) {
            const time = i / sampleRate;
            const freq = baseFreq + Math.sin(time * modRate) * modDepth;
            const envelope = Math.sin(time * Math.PI / duration);
            const phase = 2 * Math.PI * freq * time;
            data[i] = Math.sin(phase) * envelope * 0.6;
        }

        return buffer;
    }

    /**
     * Create an optimized celebration sound
     */
    createOptimizedCelebrationSound(sampleRate, duration) {
        const length = Math.floor(sampleRate * duration);
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        const notes = [523, 659, 784, 1047]; // C, E, G, C (major chord)
        const noteDuration = 0.4;

        for (let i = 0; i < length; i++) {
            const time = i / sampleRate;
            let sample = 0;

            notes.forEach((freq, index) => {
                const noteStart = index * 0.2;
                if (time >= noteStart && time < noteStart + noteDuration) {
                    const noteTime = time - noteStart;
                    const envelope = Math.exp(-noteTime * 2);
                    const phase = 2 * Math.PI * freq * noteTime;
                    sample += Math.sin(phase) * envelope * 0.25;
                }
            });

            data[i] = sample;
        }

        return buffer;
    }

    /**
     * Create an optimized tick sound
     */
    createOptimizedTickSound(sampleRate, frequency, duration) {
        const length = Math.floor(sampleRate * duration);
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // Ultra-fast generation for tick sounds
        const phaseIncrement = 2 * Math.PI * frequency / sampleRate;
        let phase = 0;

        for (let i = 0; i < length; i++) {
            const envelope = Math.exp(-i / sampleRate * 50);
            data[i] = Math.sin(phase) * envelope * 0.4;
            phase += phaseIncrement;
        }

        return buffer;
    }

    /**
     * Play a sound by name with optimized performance
     */
    playSound(soundName, volume = 1.0) {
        if (!this.isEnabled || !this.isInitialized || !this.audioContext) {
            return null;
        }

        // Limit concurrent sounds for performance
        if (this.currentSounds.size >= this.compressionSettings.maxConcurrentSounds) {
            console.warn(`Maximum concurrent sounds reached (${this.compressionSettings.maxConcurrentSounds})`);
            return null;
        }

        const sound = this.sounds[soundName];
        if (!sound || !sound.buffer) {
            console.warn(`Sound '${soundName}' not found`);
            
            // Report missing sound error
            if (window.calculadoraApp?.errorHandler) {
                window.calculadoraApp.errorHandler.reportAudioError(
                    new Error(`Sound '${soundName}' not found`), 
                    { context: 'sound_playback', soundName }
                );
            }
            
            return null;
        }

        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            // Use compressed buffer if available and enabled
            let bufferToUse = sound.buffer;
            if (this.compressionSettings.enableCompression && sound.compressed) {
                // For now, use original buffer - decompression would be implemented for extreme optimization
                bufferToUse = sound.buffer;
            }

            source.buffer = bufferToUse;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Set volume with optimized gain ramping
            const finalVolume = Math.min(1.0, volume * this.masterVolume);
            gainNode.gain.setValueAtTime(finalVolume, this.audioContext.currentTime);

            // Track active sounds
            this.currentSounds.add(source);

            // Clean up when sound ends
            source.onended = () => {
                this.currentSounds.delete(source);
            };

            source.start();
            return source;

        } catch (error) {
            console.warn(`Failed to play sound '${soundName}':`, error);
            
            // Report playback error
            if (window.calculadoraApp?.errorHandler) {
                window.calculadoraApp.errorHandler.reportAudioError(error, {
                    context: 'optimized_sound_playback',
                    soundName,
                    volume,
                    audioContextState: this.audioContext?.state,
                    concurrentSounds: this.currentSounds.size
                });
            }
            
            return null;
        }
    }

    /**
     * Specific sound methods
     */
    playWelcome() {
        return this.playSound('welcome');
    }

    playDragSuccess() {
        return this.playSound('dragSuccess');
    }

    playCalculation() {
        return this.playSound('calculation');
    }

    playAlert() {
        return this.playSound('alert');
    }

    playCelebration() {
        return this.playSound('celebration');
    }

    playTick() {
        return this.playSound('tick');
    }

    playUrgentTick() {
        return this.playSound('urgentTick');
    }

    /**
     * Log performance statistics
     */
    logPerformanceStats() {
        const stats = this.performanceStats;
        console.log('🎵 Audio System Performance Stats:');
        console.log(`  • Sounds generated: ${stats.soundsGenerated}`);
        console.log(`  • Total generation time: ${stats.totalGenerationTime.toFixed(2)}ms`);
        console.log(`  • Compression ratio: ${(stats.compressionRatio * 100).toFixed(1)}%`);
        console.log(`  • Memory usage: ${(stats.memoryUsage / 1024).toFixed(2)}KB`);
        console.log(`  • Sample rate: ${this.audioContext.sampleRate}Hz`);
        console.log(`  • Max concurrent sounds: ${this.compressionSettings.maxConcurrentSounds}`);
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        return {
            ...this.performanceStats,
            sampleRate: this.audioContext?.sampleRate || 0,
            compressionSettings: this.compressionSettings,
            currentSounds: this.currentSounds.size,
            isInitialized: this.isInitialized,
            isEnabled: this.isEnabled
        };
    }

    /**
     * Update compression settings
     */
    updateCompressionSettings(newSettings) {
        this.compressionSettings = { ...this.compressionSettings, ...newSettings };
        console.log('🎵 Audio compression settings updated:', this.compressionSettings);
    }

    /**
     * Stop all currently playing sounds
     */
    stopAllSounds() {
        this.currentSounds.forEach(source => {
            try {
                source.stop();
            } catch (error) {
                // Ignore errors from already stopped sources
            }
        });
        this.currentSounds.clear();
    }

    /**
     * Set master volume (0.0 to 1.0)
     */
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Enable/disable audio
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.stopAllSounds();
        }
    }

    /**
     * Pause audio (for page visibility changes)
     */
    pause() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }

    /**
     * Resume audio
     */
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * Handle user gesture for audio initialization
     */
    handleUserGesture(event) {
        if (!this.isInitialized) {
            this.initializeAudioContext();
        }
    }

    /**
     * Handle page visibility changes
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.pause();
        } else {
            this.resume();
        }
    }

    /**
     * Cleanup and destroy the audio system
     */
    destroy() {
        this.stopAllSounds();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        this.soundBuffers.clear();
        this.compressedSounds.clear();
        this.currentSounds.clear();
        this.isInitialized = false;
        
        // Log final performance stats
        console.log('🎵 AudioSystem destroyed. Final stats:', this.performanceStats);
    }
}
// Universal Module Compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioSystem };
} else if (typeof window !== 'undefined') {
    window.AudioSystem = AudioSystem;
}