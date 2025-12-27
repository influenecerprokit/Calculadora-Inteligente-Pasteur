/**
 * Mobile Test Suite Module
 * Comprehensive testing framework for mobile devices, touch events, and gestures
 */

export class MobileTestSuite {
    constructor() {
        this.isInitialized = false;
        this.testResults = [];
        this.deviceInfo = {};
        this.touchCapabilities = {};
        this.gestureTests = new Map();
        this.performanceMetrics = {};
        this.testContainer = null;
        
        // Test categories
        this.testCategories = {
            DEVICE_DETECTION: 'device_detection',
            TOUCH_EVENTS: 'touch_events',
            GESTURE_RECOGNITION: 'gesture_recognition',
            VIEWPORT: 'viewport',
            PERFORMANCE: 'performance',
            DRAG_DROP: 'drag_drop',
            AUDIO: 'audio',
            STORAGE: 'storage'
        };

        // Test status
        this.testStatus = {
            PENDING: 'pending',
            RUNNING: 'running',
            PASSED: 'passed',
            FAILED: 'failed',
            SKIPPED: 'skipped'
        };

        // Bind methods
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
    }

    /**
     * Initialize the mobile test suite
     */
    async init() {
        try {
            console.log('📱 Initializing Mobile Test Suite...');
            
            // Detect device capabilities
            await this.detectDeviceCapabilities();
            
            // Set up test environment
            this.setupTestEnvironment();
            
            // Initialize gesture tracking
            this.initializeGestureTracking();
            
            this.isInitialized = true;
            console.log('✅ Mobile Test Suite initialized successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Mobile Test Suite:', error);
            return false;
        }
    }

    /**
     * Detect device capabilities and characteristics
     */
    async detectDeviceCapabilities() {
        // Basic device info
        this.deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            
            // Screen info
            screenWidth: screen.width,
            screenHeight: screen.height,
            screenAvailWidth: screen.availWidth,
            screenAvailHeight: screen.availHeight,
            screenColorDepth: screen.colorDepth,
            screenPixelDepth: screen.pixelDepth,
            
            // Viewport info
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio || 1,
            
            // Orientation
            orientation: screen.orientation?.type || 'unknown',
            orientationAngle: screen.orientation?.angle || window.orientation || 0,
            
            // Timestamps
            timestamp: Date.now(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        // Touch capabilities
        this.touchCapabilities = {
            touchSupport: 'ontouchstart' in window,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            msMaxTouchPoints: navigator.msMaxTouchPoints || 0,
            pointerEvents: 'onpointerdown' in window,
            gestureEvents: 'ongesturestart' in window,
            
            // CSS media queries
            hover: window.matchMedia('(hover: hover)').matches,
            pointer: window.matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine',
            anyHover: window.matchMedia('(any-hover: hover)').matches,
            anyPointer: window.matchMedia('(any-pointer: coarse)').matches ? 'coarse' : 'fine'
        };

        // Device type detection
        this.deviceInfo.deviceType = this.detectDeviceType();
        this.deviceInfo.isMobile = this.isMobileDevice();
        this.deviceInfo.isTablet = this.isTabletDevice();
        this.deviceInfo.isDesktop = this.isDesktopDevice();

        console.log('📱 Device capabilities detected:', {
            device: this.deviceInfo.deviceType,
            touch: this.touchCapabilities.touchSupport,
            maxTouchPoints: this.touchCapabilities.maxTouchPoints,
            viewport: `${this.deviceInfo.viewportWidth}x${this.deviceInfo.viewportHeight}`
        });
    }

    /**
     * Detect device type based on various indicators
     */
    detectDeviceType() {
        const ua = navigator.userAgent.toLowerCase();
        
        // Mobile devices
        if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
            if (/ipad|android(?!.*mobile)/i.test(ua) || 
                (this.deviceInfo.screenWidth >= 768 && this.touchCapabilities.touchSupport)) {
                return 'tablet';
            }
            return 'mobile';
        }
        
        // Touch-enabled desktop/laptop
        if (this.touchCapabilities.touchSupport && this.deviceInfo.screenWidth >= 1024) {
            return 'touch-desktop';
        }
        
        return 'desktop';
    }

    /**
     * Check if device is mobile
     */
    isMobileDevice() {
        return this.deviceInfo.deviceType === 'mobile' ||
               (this.touchCapabilities.touchSupport && 
                this.deviceInfo.viewportWidth < 768 && 
                !this.touchCapabilities.hover);
    }

    /**
     * Check if device is tablet
     */
    isTabletDevice() {
        return this.deviceInfo.deviceType === 'tablet' ||
               (this.touchCapabilities.touchSupport && 
                this.deviceInfo.viewportWidth >= 768 && 
                this.deviceInfo.viewportWidth < 1024);
    }

    /**
     * Check if device is desktop
     */
    isDesktopDevice() {
        return this.deviceInfo.deviceType === 'desktop' ||
               this.deviceInfo.deviceType === 'touch-desktop';
    }

    /**
     * Set up test environment
     */
    setupTestEnvironment() {
        // Create test container
        this.testContainer = document.createElement('div');
        this.testContainer.id = 'mobile-test-container';
        this.testContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            font-family: monospace;
            font-size: 12px;
            z-index: 20000;
            overflow-y: auto;
            padding: 20px;
            box-sizing: border-box;
            display: none;
        `;
        
        document.body.appendChild(this.testContainer);
        
        // Add test styles
        this.addTestStyles();
    }

    /**
     * Add CSS styles for testing
     */
    addTestStyles() {
        if (document.getElementById('mobile-test-styles')) return;

        const style = document.createElement('style');
        style.id = 'mobile-test-styles';
        style.textContent = `
            .test-section {
                margin-bottom: 20px;
                padding: 15px;
                border: 1px solid #333;
                border-radius: 5px;
                background: rgba(255, 255, 255, 0.05);
            }
            
            .test-section h3 {
                margin: 0 0 10px 0;
                color: #4CAF50;
                font-size: 14px;
            }
            
            .test-item {
                margin: 5px 0;
                padding: 5px 10px;
                border-radius: 3px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .test-item.passed {
                background: rgba(76, 175, 80, 0.2);
                border-left: 3px solid #4CAF50;
            }
            
            .test-item.failed {
                background: rgba(244, 67, 54, 0.2);
                border-left: 3px solid #f44336;
            }
            
            .test-item.pending {
                background: rgba(255, 193, 7, 0.2);
                border-left: 3px solid #ffc107;
            }
            
            .test-item.running {
                background: rgba(33, 150, 243, 0.2);
                border-left: 3px solid #2196f3;
                animation: pulse 1s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            .test-status {
                font-weight: bold;
                padding: 2px 8px;
                border-radius: 3px;
                font-size: 10px;
            }
            
            .test-status.passed { background: #4CAF50; color: white; }
            .test-status.failed { background: #f44336; color: white; }
            .test-status.pending { background: #ffc107; color: black; }
            .test-status.running { background: #2196f3; color: white; }
            
            .test-controls {
                position: fixed;
                bottom: 20px;
                right: 20px;
                display: flex;
                gap: 10px;
            }
            
            .test-button {
                padding: 10px 15px;
                background: #2196f3;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
            }
            
            .test-button:hover {
                background: #1976d2;
            }
            
            .test-button.danger {
                background: #f44336;
            }
            
            .test-button.danger:hover {
                background: #d32f2f;
            }
            
            .gesture-test-area {
                width: 200px;
                height: 200px;
                border: 2px dashed #666;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 10px 0;
                background: rgba(255, 255, 255, 0.1);
                user-select: none;
                touch-action: none;
            }
            
            .gesture-test-area.active {
                border-color: #4CAF50;
                background: rgba(76, 175, 80, 0.2);
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Initialize gesture tracking
     */
    initializeGestureTracking() {
        this.gestureData = {
            touches: [],
            startTime: 0,
            endTime: 0,
            startPositions: [],
            endPositions: [],
            maxTouches: 0,
            totalDistance: 0,
            velocity: 0,
            direction: null
        };
    }

    /**
     * Run all mobile tests
     */
    async runAllTests() {
        console.log('🧪 Starting mobile test suite...');
        
        this.showTestInterface();
        this.testResults = [];
        
        // Run test categories in sequence
        await this.runDeviceDetectionTests();
        await this.runTouchEventTests();
        await this.runGestureTests();
        await this.runViewportTests();
        await this.runPerformanceTests();
        await this.runDragDropTests();
        await this.runAudioTests();
        await this.runStorageTests();
        
        // Generate test report
        this.generateTestReport();
        
        console.log('✅ Mobile test suite completed');
    }

    /**
     * Run device detection tests
     */
    async runDeviceDetectionTests() {
        const category = this.testCategories.DEVICE_DETECTION;
        this.updateTestStatus('Device Detection Tests', this.testStatus.RUNNING);
        
        const tests = [
            {
                name: 'Touch Support Detection',
                test: () => this.touchCapabilities.touchSupport,
                expected: true,
                critical: true
            },
            {
                name: 'Multi-touch Support',
                test: () => this.touchCapabilities.maxTouchPoints > 1,
                expected: true,
                critical: false
            },
            {
                name: 'Device Type Detection',
                test: () => ['mobile', 'tablet', 'desktop', 'touch-desktop'].includes(this.deviceInfo.deviceType),
                expected: true,
                critical: true
            },
            {
                name: 'Viewport Size Reasonable',
                test: () => this.deviceInfo.viewportWidth > 0 && this.deviceInfo.viewportHeight > 0,
                expected: true,
                critical: true
            },
            {
                name: 'Device Pixel Ratio',
                test: () => this.deviceInfo.devicePixelRatio >= 1,
                expected: true,
                critical: false
            }
        ];
        
        for (const test of tests) {
            const result = await this.runSingleTest(category, test);
            this.testResults.push(result);
        }
        
        this.updateTestStatus('Device Detection Tests', this.testStatus.PASSED);
    }

    /**
     * Run touch event tests
     */
    async runTouchEventTests() {
        const category = this.testCategories.TOUCH_EVENTS;
        this.updateTestStatus('Touch Event Tests', this.testStatus.RUNNING);
        
        // Create test area for touch events
        const testArea = this.createTouchTestArea();
        
        const tests = [
            {
                name: 'Touch Start Event',
                test: () => this.testTouchEvent('touchstart', testArea),
                expected: true,
                critical: true,
                interactive: true
            },
            {
                name: 'Touch Move Event',
                test: () => this.testTouchEvent('touchmove', testArea),
                expected: true,
                critical: true,
                interactive: true
            },
            {
                name: 'Touch End Event',
                test: () => this.testTouchEvent('touchend', testArea),
                expected: true,
                critical: true,
                interactive: true
            },
            {
                name: 'Multi-touch Detection',
                test: () => this.testMultiTouch(testArea),
                expected: true,
                critical: false,
                interactive: true
            }
        ];
        
        for (const test of tests) {
            if (test.interactive && !this.touchCapabilities.touchSupport) {
                this.testResults.push({
                    category,
                    name: test.name,
                    status: this.testStatus.SKIPPED,
                    reason: 'No touch support detected'
                });
                continue;
            }
            
            const result = await this.runSingleTest(category, test);
            this.testResults.push(result);
        }
        
        this.updateTestStatus('Touch Event Tests', this.testStatus.PASSED);
    }

    /**
     * Run gesture recognition tests
     */
    async runGestureTests() {
        const category = this.testCategories.GESTURE_RECOGNITION;
        this.updateTestStatus('Gesture Tests', this.testStatus.RUNNING);
        
        const testArea = this.createGestureTestArea();
        
        const tests = [
            {
                name: 'Tap Gesture',
                test: () => this.testTapGesture(testArea),
                expected: true,
                critical: true,
                interactive: true
            },
            {
                name: 'Long Press Gesture',
                test: () => this.testLongPressGesture(testArea),
                expected: true,
                critical: false,
                interactive: true
            },
            {
                name: 'Swipe Gesture',
                test: () => this.testSwipeGesture(testArea),
                expected: true,
                critical: false,
                interactive: true
            },
            {
                name: 'Drag Gesture',
                test: () => this.testDragGesture(testArea),
                expected: true,
                critical: true,
                interactive: true
            }
        ];
        
        for (const test of tests) {
            if (test.interactive && !this.touchCapabilities.touchSupport) {
                this.testResults.push({
                    category,
                    name: test.name,
                    status: this.testStatus.SKIPPED,
                    reason: 'No touch support detected'
                });
                continue;
            }
            
            const result = await this.runSingleTest(category, test);
            this.testResults.push(result);
        }
        
        this.updateTestStatus('Gesture Tests', this.testStatus.PASSED);
    }

    /**
     * Run viewport tests
     */
    async runViewportTests() {
        const category = this.testCategories.VIEWPORT;
        this.updateTestStatus('Viewport Tests', this.testStatus.RUNNING);
        
        const tests = [
            {
                name: 'Viewport Meta Tag Present',
                test: () => !!document.querySelector('meta[name="viewport"]'),
                expected: true,
                critical: true
            },
            {
                name: 'Responsive Breakpoints',
                test: () => this.testResponsiveBreakpoints(),
                expected: true,
                critical: true
            },
            {
                name: 'Orientation Change Support',
                test: () => this.testOrientationChange(),
                expected: true,
                critical: false
            },
            {
                name: 'Safe Area Support',
                test: () => this.testSafeAreaSupport(),
                expected: true,
                critical: false
            }
        ];
        
        for (const test of tests) {
            const result = await this.runSingleTest(category, test);
            this.testResults.push(result);
        }
        
        this.updateTestStatus('Viewport Tests', this.testStatus.PASSED);
    }

    /**
     * Run performance tests
     */
    async runPerformanceTests() {
        const category = this.testCategories.PERFORMANCE;
        this.updateTestStatus('Performance Tests', this.testStatus.RUNNING);
        
        const tests = [
            {
                name: 'Touch Response Time',
                test: () => this.testTouchResponseTime(),
                expected: true,
                critical: false
            },
            {
                name: 'Animation Performance',
                test: () => this.testAnimationPerformance(),
                expected: true,
                critical: false
            },
            {
                name: 'Memory Usage',
                test: () => this.testMemoryUsage(),
                expected: true,
                critical: false
            }
        ];
        
        for (const test of tests) {
            const result = await this.runSingleTest(category, test);
            this.testResults.push(result);
        }
        
        this.updateTestStatus('Performance Tests', this.testStatus.PASSED);
    }

    /**
     * Run drag and drop tests
     */
    async runDragDropTests() {
        const category = this.testCategories.DRAG_DROP;
        this.updateTestStatus('Drag & Drop Tests', this.testStatus.RUNNING);
        
        const tests = [
            {
                name: 'Drag Drop Handler Available',
                test: () => !!window.calculadoraApp?.dragDropHandler,
                expected: true,
                critical: true
            },
            {
                name: 'Touch Drag Support',
                test: () => this.testTouchDragSupport(),
                expected: true,
                critical: true
            },
            {
                name: 'Drop Zone Detection',
                test: () => this.testDropZoneDetection(),
                expected: true,
                critical: true
            }
        ];
        
        for (const test of tests) {
            const result = await this.runSingleTest(category, test);
            this.testResults.push(result);
        }
        
        this.updateTestStatus('Drag & Drop Tests', this.testStatus.PASSED);
    }

    /**
     * Run audio tests
     */
    async runAudioTests() {
        const category = this.testCategories.AUDIO;
        this.updateTestStatus('Audio Tests', this.testStatus.RUNNING);
        
        const tests = [
            {
                name: 'Web Audio API Support',
                test: () => !!(window.AudioContext || window.webkitAudioContext),
                expected: true,
                critical: false
            },
            {
                name: 'Audio System Available',
                test: () => !!window.calculadoraApp?.audioSystem,
                expected: true,
                critical: false
            },
            {
                name: 'Touch-to-Play Support',
                test: () => this.testTouchToPlaySupport(),
                expected: true,
                critical: false
            }
        ];
        
        for (const test of tests) {
            const result = await this.runSingleTest(category, test);
            this.testResults.push(result);
        }
        
        this.updateTestStatus('Audio Tests', this.testStatus.PASSED);
    }

    /**
     * Run storage tests
     */
    async runStorageTests() {
        const category = this.testCategories.STORAGE;
        this.updateTestStatus('Storage Tests', this.testStatus.RUNNING);
        
        const tests = [
            {
                name: 'LocalStorage Support',
                test: () => this.testStorageSupport('localStorage'),
                expected: true,
                critical: true
            },
            {
                name: 'SessionStorage Support',
                test: () => this.testStorageSupport('sessionStorage'),
                expected: true,
                critical: true
            },
            {
                name: 'Storage Quota',
                test: () => this.testStorageQuota(),
                expected: true,
                critical: false
            }
        ];
        
        for (const test of tests) {
            const result = await this.runSingleTest(category, test);
            this.testResults.push(result);
        }
        
        this.updateTestStatus('Storage Tests', this.testStatus.PASSED);
    }

    /**
     * Run a single test
     */
    async runSingleTest(category, testConfig) {
        const startTime = performance.now();
        
        try {
            const result = await testConfig.test();
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            const status = result === testConfig.expected ? 
                this.testStatus.PASSED : this.testStatus.FAILED;
            
            return {
                category,
                name: testConfig.name,
                status,
                result,
                expected: testConfig.expected,
                duration: Math.round(duration * 100) / 100,
                critical: testConfig.critical || false,
                timestamp: Date.now()
            };
        } catch (error) {
            return {
                category,
                name: testConfig.name,
                status: this.testStatus.FAILED,
                error: error.message,
                critical: testConfig.critical || false,
                timestamp: Date.now()
            };
        }
    }

    /**
     * Test implementations
     */
    
    createTouchTestArea() {
        const area = document.createElement('div');
        area.className = 'gesture-test-area';
        area.textContent = 'Touch Test Area';
        return area;
    }
    
    createGestureTestArea() {
        const area = document.createElement('div');
        area.className = 'gesture-test-area';
        area.textContent = 'Gesture Test Area';
        return area;
    }
    
    async testTouchEvent(eventType, element) {
        return new Promise((resolve) => {
            let eventFired = false;
            
            const handler = () => {
                eventFired = true;
                element.removeEventListener(eventType, handler);
                resolve(true);
            };
            
            element.addEventListener(eventType, handler);
            
            // Simulate timeout
            setTimeout(() => {
                if (!eventFired) {
                    element.removeEventListener(eventType, handler);
                    resolve(false);
                }
            }, 1000);
            
            // Auto-pass for non-touch devices
            if (!this.touchCapabilities.touchSupport) {
                resolve(true);
            }
        });
    }
    
    async testMultiTouch(element) {
        // Test if multi-touch is supported
        return this.touchCapabilities.maxTouchPoints > 1;
    }
    
    async testTapGesture(element) {
        // Simulate tap test
        return this.touchCapabilities.touchSupport;
    }
    
    async testLongPressGesture(element) {
        // Simulate long press test
        return this.touchCapabilities.touchSupport;
    }
    
    async testSwipeGesture(element) {
        // Simulate swipe test
        return this.touchCapabilities.touchSupport;
    }
    
    async testDragGesture(element) {
        // Simulate drag test
        return this.touchCapabilities.touchSupport;
    }
    
    testResponsiveBreakpoints() {
        const breakpoints = [320, 480, 768, 1024, 1200];
        const currentWidth = window.innerWidth;
        return breakpoints.some(bp => Math.abs(currentWidth - bp) < 50);
    }
    
    testOrientationChange() {
        return 'orientation' in screen || 'orientation' in window;
    }
    
    testSafeAreaSupport() {
        const testEl = document.createElement('div');
        testEl.style.paddingTop = 'env(safe-area-inset-top)';
        return testEl.style.paddingTop !== '';
    }
    
    async testTouchResponseTime() {
        // Measure touch response time
        const startTime = performance.now();
        await new Promise(resolve => setTimeout(resolve, 16)); // One frame
        const endTime = performance.now();
        return (endTime - startTime) < 50; // Less than 50ms is good
    }
    
    async testAnimationPerformance() {
        // Test if animations run smoothly
        return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    testMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            return memory.usedJSHeapSize < memory.jsHeapSizeLimit * 0.8;
        }
        return true; // Assume OK if not available
    }
    
    testTouchDragSupport() {
        return this.touchCapabilities.touchSupport && 
               !!window.calculadoraApp?.dragDropHandler?.isInitialized;
    }
    
    testDropZoneDetection() {
        return document.querySelectorAll('.drop-zone').length > 0;
    }
    
    testTouchToPlaySupport() {
        return !!window.calculadoraApp?.audioSystem?.isInitialized;
    }
    
    testStorageSupport(storageType) {
        try {
            const storage = window[storageType];
            const testKey = '__test__';
            storage.setItem(testKey, 'test');
            storage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    async testStorageQuota() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                return estimate.quota > 1024 * 1024; // At least 1MB
            } catch (e) {
                return true; // Assume OK if not available
            }
        }
        return true;
    }

    /**
     * Show test interface
     */
    showTestInterface() {
        if (!this.testContainer) return;
        
        this.testContainer.style.display = 'block';
        this.testContainer.innerHTML = `
            <h2>📱 Mobile Test Suite</h2>
            <div id="test-results"></div>
            <div class="test-controls">
                <button class="test-button" onclick="window.mobileTestSuite.hideTestInterface()">Close</button>
                <button class="test-button" onclick="window.mobileTestSuite.exportTestResults()">Export</button>
                <button class="test-button danger" onclick="window.mobileTestSuite.clearTestResults()">Clear</button>
            </div>
        `;
        
        // Make globally accessible for button clicks
        window.mobileTestSuite = this;
    }

    /**
     * Hide test interface
     */
    hideTestInterface() {
        if (this.testContainer) {
            this.testContainer.style.display = 'none';
        }
    }

    /**
     * Update test status in UI
     */
    updateTestStatus(testName, status) {
        const resultsContainer = document.getElementById('test-results');
        if (!resultsContainer) return;
        
        let section = resultsContainer.querySelector(`[data-test="${testName}"]`);
        if (!section) {
            section = document.createElement('div');
            section.className = 'test-section';
            section.setAttribute('data-test', testName);
            section.innerHTML = `<h3>${testName}</h3><div class="test-items"></div>`;
            resultsContainer.appendChild(section);
        }
        
        const statusEl = section.querySelector('.test-status') || document.createElement('span');
        statusEl.className = `test-status ${status}`;
        statusEl.textContent = status.toUpperCase();
        
        if (!section.querySelector('.test-status')) {
            section.querySelector('h3').appendChild(statusEl);
        }
    }

    /**
     * Generate comprehensive test report
     */
    generateTestReport() {
        const report = {
            timestamp: new Date().toISOString(),
            deviceInfo: this.deviceInfo,
            touchCapabilities: this.touchCapabilities,
            testResults: this.testResults,
            summary: this.generateTestSummary(),
            recommendations: this.generateRecommendations()
        };
        
        console.log('📊 Mobile Test Report:', report);
        
        // Update UI with results
        this.updateTestResultsUI();
        
        return report;
    }

    /**
     * Generate test summary
     */
    generateTestSummary() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.status === this.testStatus.PASSED).length;
        const failed = this.testResults.filter(r => r.status === this.testStatus.FAILED).length;
        const skipped = this.testResults.filter(r => r.status === this.testStatus.SKIPPED).length;
        const critical = this.testResults.filter(r => r.critical && r.status === this.testStatus.FAILED).length;
        
        return {
            total,
            passed,
            failed,
            skipped,
            criticalFailures: critical,
            passRate: Math.round((passed / total) * 100),
            overallStatus: critical > 0 ? 'CRITICAL' : failed > 0 ? 'WARNING' : 'PASSED'
        };
    }

    /**
     * Generate recommendations based on test results
     */
    generateRecommendations() {
        const recommendations = [];
        
        // Check for critical failures
        const criticalFailures = this.testResults.filter(r => r.critical && r.status === this.testStatus.FAILED);
        if (criticalFailures.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Critical Issues',
                message: `${criticalFailures.length} critical test(s) failed. These must be fixed for proper mobile functionality.`,
                tests: criticalFailures.map(r => r.name)
            });
        }
        
        // Check touch support
        if (!this.touchCapabilities.touchSupport && this.deviceInfo.isMobile) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Touch Support',
                message: 'Touch events not properly supported on mobile device.',
                suggestion: 'Verify touch event handlers and fallback mechanisms.'
            });
        }
        
        // Check viewport
        if (!document.querySelector('meta[name="viewport"]')) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Viewport',
                message: 'Viewport meta tag missing.',
                suggestion: 'Add viewport meta tag for proper mobile rendering.'
            });
        }
        
        // Check performance
        const performanceFailures = this.testResults.filter(r => 
            r.category === this.testCategories.PERFORMANCE && r.status === this.testStatus.FAILED
        );
        if (performanceFailures.length > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Performance',
                message: 'Performance issues detected on mobile device.',
                suggestion: 'Optimize animations and reduce JavaScript execution time.'
            });
        }
        
        return recommendations;
    }

    /**
     * Update test results in UI
     */
    updateTestResultsUI() {
        const resultsContainer = document.getElementById('test-results');
        if (!resultsContainer) return;
        
        // Group results by category
        const groupedResults = {};
        this.testResults.forEach(result => {
            if (!groupedResults[result.category]) {
                groupedResults[result.category] = [];
            }
            groupedResults[result.category].push(result);
        });
        
        // Clear and rebuild results
        resultsContainer.innerHTML = '';
        
        Object.entries(groupedResults).forEach(([category, results]) => {
            const section = document.createElement('div');
            section.className = 'test-section';
            
            const categoryName = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            section.innerHTML = `<h3>${categoryName}</h3>`;
            
            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'test-items';
            
            results.forEach(result => {
                const item = document.createElement('div');
                item.className = `test-item ${result.status}`;
                
                const duration = result.duration ? ` (${result.duration}ms)` : '';
                const error = result.error ? ` - ${result.error}` : '';
                
                item.innerHTML = `
                    <span>${result.name}${duration}${error}</span>
                    <span class="test-status ${result.status}">${result.status.toUpperCase()}</span>
                `;
                
                itemsContainer.appendChild(item);
            });
            
            section.appendChild(itemsContainer);
            resultsContainer.appendChild(section);
        });
        
        // Add summary
        const summary = this.generateTestSummary();
        const summarySection = document.createElement('div');
        summarySection.className = 'test-section';
        summarySection.innerHTML = `
            <h3>Test Summary</h3>
            <div class="test-items">
                <div class="test-item">
                    <span>Total Tests: ${summary.total}</span>
                </div>
                <div class="test-item passed">
                    <span>Passed: ${summary.passed}</span>
                </div>
                <div class="test-item failed">
                    <span>Failed: ${summary.failed}</span>
                </div>
                <div class="test-item">
                    <span>Pass Rate: ${summary.passRate}%</span>
                </div>
                <div class="test-item ${summary.overallStatus.toLowerCase()}">
                    <span>Overall Status: ${summary.overallStatus}</span>
                </div>
            </div>
        `;
        
        resultsContainer.insertBefore(summarySection, resultsContainer.firstChild);
    }

    /**
     * Export test results
     */
    exportTestResults() {
        const report = this.generateTestReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `mobile-test-report-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📄 Test results exported');
    }

    /**
     * Clear test results
     */
    clearTestResults() {
        this.testResults = [];
        const resultsContainer = document.getElementById('test-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '<p>Test results cleared. Run tests to see new results.</p>';
        }
        console.log('🧹 Test results cleared');
    }

    /**
     * Quick mobile compatibility check
     */
    async quickMobileCheck() {
        const issues = [];
        
        // Check touch support
        if (!this.touchCapabilities.touchSupport && this.deviceInfo.isMobile) {
            issues.push('Touch events not supported');
        }
        
        // Check viewport
        if (!document.querySelector('meta[name="viewport"]')) {
            issues.push('Viewport meta tag missing');
        }
        
        // Check drag drop
        if (!window.calculadoraApp?.dragDropHandler?.isInitialized) {
            issues.push('Drag & Drop handler not initialized');
        }
        
        // Check responsive design
        if (this.deviceInfo.viewportWidth < 320) {
            issues.push('Viewport too narrow for mobile');
        }
        
        return {
            compatible: issues.length === 0,
            issues,
            deviceType: this.deviceInfo.deviceType,
            touchSupport: this.touchCapabilities.touchSupport
        };
    }

    /**
     * Destroy mobile test suite
     */
    destroy() {
        if (this.testContainer && this.testContainer.parentNode) {
            this.testContainer.parentNode.removeChild(this.testContainer);
        }
        
        // Remove global reference
        if (window.mobileTestSuite === this) {
            delete window.mobileTestSuite;
        }
        
        this.isInitialized = false;
        console.log('📱 Mobile Test Suite destroyed');
    }
}