/**
 * Lazy Loader Module
 * Handles dynamic loading of modules on demand to optimize initial load time
 */

export class LazyLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
        this.moduleDefinitions = new Map();
        this.isInitialized = false;
        
        // Define module loading priorities and dependencies
        this.setupModuleDefinitions();
    }

    /**
     * Initialize the lazy loader
     */
    init() {
        try {
            console.log('🚀 Initializing LazyLoader...');
            this.isInitialized = true;
            console.log('✅ LazyLoader initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize LazyLoader:', error);
            return false;
        }
    }

    /**
     * Set up module definitions with loading priorities and dependencies
     */
    setupModuleDefinitions() {
        // Critical modules - loaded immediately
        this.moduleDefinitions.set('ErrorHandler', {
            path: './ErrorHandler.js',
            className: 'ErrorHandler',
            priority: 'critical',
            dependencies: [],
            loadImmediately: true
        });

        this.moduleDefinitions.set('UIController', {
            path: './UIController.js',
            className: 'UIController',
            priority: 'critical',
            dependencies: [],
            loadImmediately: true
        });

        this.moduleDefinitions.set('CacheManager', {
            path: './CacheManager.js',
            className: 'CacheManager',
            priority: 'critical',
            dependencies: [],
            loadImmediately: true
        });

        // High priority modules - loaded on app start
        this.moduleDefinitions.set('AudioSystem', {
            path: './AudioSystem.js',
            className: 'AudioSystem',
            priority: 'high',
            dependencies: [],
            loadImmediately: false
        });

        this.moduleDefinitions.set('GameEngine', {
            path: './GameEngine.js',
            className: 'GameEngine',
            priority: 'high',
            dependencies: ['AudioSystem', 'UIController', 'ErrorHandler'],
            loadImmediately: false
        });

        // Medium priority modules - loaded when needed
        this.moduleDefinitions.set('DragDropHandler', {
            path: './DragDropHandler.js',
            className: 'DragDropHandler',
            priority: 'medium',
            dependencies: [],
            loadImmediately: false
        });

        this.moduleDefinitions.set('TimerManager', {
            path: './TimerManager.js',
            className: 'TimerManager',
            priority: 'medium',
            dependencies: ['AudioSystem'],
            loadImmediately: false
        });

        this.moduleDefinitions.set('CalculatorModule', {
            path: './CalculatorModule.js',
            className: 'CalculatorModule',
            priority: 'medium',
            dependencies: ['CacheManager'],
            loadImmediately: false
        });

        this.moduleDefinitions.set('DataStorage', {
            path: './DataStorage.js',
            className: 'DataStorage',
            priority: 'medium',
            dependencies: ['CacheManager'],
            loadImmediately: false
        });

        // Low priority modules - loaded on demand
        this.moduleDefinitions.set('AnimationEngine', {
            path: './AnimationEngine.js',
            className: 'AnimationEngine',
            priority: 'low',
            dependencies: [],
            loadImmediately: false
        });

        // Optional modules - loaded only when explicitly requested
        this.moduleDefinitions.set('MobileTestSuite', {
            path: './MobileTestSuite.js',
            className: 'MobileTestSuite',
            priority: 'optional',
            dependencies: ['ErrorHandler'],
            loadImmediately: false
        });

        this.moduleDefinitions.set('BrowserCompatibilityTester', {
            path: './BrowserCompatibilityTester.js',
            className: 'BrowserCompatibilityTester',
            priority: 'optional',
            dependencies: ['ErrorHandler'],
            loadImmediately: false
        });
    }

    /**
     * Load a module dynamically
     * @param {string} moduleName - Name of the module to load
     * @returns {Promise<Object>} - Promise that resolves to the module instance
     */
    async loadModule(moduleName) {
        if (!this.isInitialized) {
            throw new Error('LazyLoader not initialized');
        }

        // Return cached module if already loaded
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }

        // Return existing loading promise if module is currently being loaded
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        const moduleDefinition = this.moduleDefinitions.get(moduleName);
        if (!moduleDefinition) {
            throw new Error(`Module '${moduleName}' not found in definitions`);
        }

        console.log(`🔄 Loading module: ${moduleName}`);

        // Create loading promise
        const loadingPromise = this.performModuleLoad(moduleName, moduleDefinition);
        this.loadingPromises.set(moduleName, loadingPromise);

        try {
            const moduleInstance = await loadingPromise;
            
            // Cache the loaded module
            this.loadedModules.set(moduleName, moduleInstance);
            
            // Remove from loading promises
            this.loadingPromises.delete(moduleName);
            
            console.log(`✅ Module loaded successfully: ${moduleName}`);
            return moduleInstance;
            
        } catch (error) {
            // Remove failed loading promise
            this.loadingPromises.delete(moduleName);
            console.error(`❌ Failed to load module '${moduleName}':`, error);
            throw error;
        }
    }

    /**
     * Perform the actual module loading
     * @param {string} moduleName - Name of the module
     * @param {Object} moduleDefinition - Module definition object
     * @returns {Promise<Object>} - Promise that resolves to the module instance
     */
    async performModuleLoad(moduleName, moduleDefinition) {
        try {
            console.log(`📦 Loading module '${moduleName}' from '${moduleDefinition.path}'...`);
            
            // Load dependencies first
            let dependencies = [];
            try {
                dependencies = await this.loadDependencies(moduleDefinition.dependencies);
            } catch (error) {
                console.error(`❌ Failed to load dependencies for '${moduleName}':`, error);
                // For critical modules, throw the error
                if (moduleDefinition.priority === 'critical') {
                    throw new Error(`Failed to load dependencies for critical module '${moduleName}': ${error.message}`);
                }
                // For non-critical modules, continue with empty dependencies
                console.warn(`⚠️ Continuing to load '${moduleName}' without some dependencies`);
            }
            
            // Dynamic import of the module
            let moduleExports;
            try {
                moduleExports = await import(moduleDefinition.path);
            } catch (error) {
                console.error(`❌ Failed to import module file '${moduleDefinition.path}':`, error);
                throw new Error(`Failed to import module '${moduleName}' from '${moduleDefinition.path}': ${error.message}. Check if the file exists and has no syntax errors.`);
            }
            
            const ModuleClass = moduleExports[moduleDefinition.className];
            
            if (!ModuleClass) {
                throw new Error(`Class '${moduleDefinition.className}' not found in module '${moduleName}'. Available exports: ${Object.keys(moduleExports).join(', ')}`);
            }

            // Create module instance
            let moduleInstance;
            try {
                if (dependencies.length > 0) {
                    // Special handling for GameEngine - needs dependencies as object
                    if (moduleName === 'GameEngine') {
                        // Build dependencies object from loaded modules
                        // Note: Some dependencies may be null initially (medium/low priority modules)
                        // They will be set later when all modules are loaded
                        const dependenciesObj = {
                            audioSystem: this.getLoadedModule('AudioSystem') || null,
                            dragDropHandler: this.getLoadedModule('DragDropHandler') || null,
                            timerManager: this.getLoadedModule('TimerManager') || null,
                            animationEngine: this.getLoadedModule('AnimationEngine') || null,
                            calculatorModule: this.getLoadedModule('CalculatorModule') || null,
                            dataStorage: this.getLoadedModule('DataStorage') || null,
                            uiController: this.getLoadedModule('UIController') || null
                        };
                        moduleInstance = new ModuleClass(dependenciesObj);
                    } else {
                        // For other modules, pass dependencies as array (default behavior)
                        moduleInstance = new ModuleClass(dependencies);
                    }
                } else {
                    moduleInstance = new ModuleClass();
                }
            } catch (error) {
                console.error(`❌ Failed to instantiate module '${moduleName}':`, error);
                throw new Error(`Failed to create instance of '${moduleName}': ${error.message}`);
            }

            console.log(`✅ Module '${moduleName}' loaded and instantiated successfully`);
            return moduleInstance;
            
        } catch (error) {
            console.error(`❌ Error loading module '${moduleName}':`, error);
            throw new Error(`Failed to load module '${moduleName}': ${error.message}`);
        }
    }

    /**
     * Load module dependencies
     * @param {string[]} dependencyNames - Array of dependency module names
     * @returns {Promise<Object[]>} - Promise that resolves to array of dependency instances
     */
    async loadDependencies(dependencyNames) {
        if (!dependencyNames || dependencyNames.length === 0) {
            return [];
        }

        const dependencyPromises = dependencyNames.map(depName => this.loadModule(depName));
        return Promise.all(dependencyPromises);
    }

    /**
     * Load modules by priority level
     * @param {string} priority - Priority level ('critical', 'high', 'medium', 'low', 'optional')
     * @returns {Promise<Object[]>} - Promise that resolves to array of loaded modules
     */
    async loadModulesByPriority(priority) {
        const modulesToLoad = [];
        
        for (const [moduleName, definition] of this.moduleDefinitions) {
            if (definition.priority === priority) {
                modulesToLoad.push(moduleName);
            }
        }

        if (modulesToLoad.length === 0) {
            return [];
        }

        console.log(`🔄 Loading ${priority} priority modules:`, modulesToLoad);
        
        const loadingPromises = modulesToLoad.map(async moduleName => {
            try {
                const module = await this.loadModule(moduleName);
                // Initialize module if it has init method
                if (module && typeof module.init === 'function' && !module.isInitialized) {
                    const initResult = await module.init();
                    if (!initResult && initResult !== undefined) {
                        console.warn(`Module '${moduleName}' initialization returned false`);
                    }
                }
                return module;
            } catch (error) {
                console.error(`❌ Failed to load ${priority} priority module '${moduleName}':`, error);
                // For critical modules, throw the error
                if (priority === 'critical') {
                    throw new Error(`Critical module '${moduleName}' failed to load: ${error.message}`);
                }
                return null; // Return null for failed non-critical modules
            }
        });

        const results = await Promise.all(loadingPromises);
        const successfullyLoaded = results.filter(result => result !== null);
        
        console.log(`✅ Loaded ${successfullyLoaded.length}/${modulesToLoad.length} ${priority} priority modules`);
        return successfullyLoaded;
    }

    /**
     * Preload modules that should be loaded immediately
     * @returns {Promise<Object[]>} - Promise that resolves to array of preloaded modules
     */
    async preloadCriticalModules() {
        const criticalModules = [];
        
        for (const [moduleName, definition] of this.moduleDefinitions) {
            if (definition.loadImmediately || definition.priority === 'critical') {
                criticalModules.push(moduleName);
            }
        }

        if (criticalModules.length === 0) {
            return [];
        }

        console.log('🚀 Preloading critical modules:', criticalModules);
        return this.loadModulesByPriority('critical');
    }

    /**
     * Check if a module is loaded
     * @param {string} moduleName - Name of the module to check
     * @returns {boolean} - True if module is loaded
     */
    isModuleLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }

    /**
     * Check if a module is currently loading
     * @param {string} moduleName - Name of the module to check
     * @returns {boolean} - True if module is currently loading
     */
    isModuleLoading(moduleName) {
        return this.loadingPromises.has(moduleName);
    }

    /**
     * Get loaded module instance
     * @param {string} moduleName - Name of the module
     * @returns {Object|null} - Module instance or null if not loaded
     */
    getLoadedModule(moduleName) {
        return this.loadedModules.get(moduleName) || null;
    }

    /**
     * Unload a module (remove from cache)
     * @param {string} moduleName - Name of the module to unload
     */
    unloadModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            const moduleInstance = this.loadedModules.get(moduleName);
            
            // Call destroy method if available
            if (moduleInstance && typeof moduleInstance.destroy === 'function') {
                try {
                    moduleInstance.destroy();
                } catch (error) {
                    console.warn(`Error destroying module '${moduleName}':`, error);
                }
            }
            
            this.loadedModules.delete(moduleName);
            console.log(`🗑️ Module unloaded: ${moduleName}`);
        }
    }

    /**
     * Get loading statistics
     * @returns {Object} - Loading statistics
     */
    getLoadingStats() {
        const totalModules = this.moduleDefinitions.size;
        const loadedModules = this.loadedModules.size;
        const loadingModules = this.loadingPromises.size;
        
        const statsByPriority = {};
        for (const [moduleName, definition] of this.moduleDefinitions) {
            const priority = definition.priority;
            if (!statsByPriority[priority]) {
                statsByPriority[priority] = { total: 0, loaded: 0 };
            }
            statsByPriority[priority].total++;
            if (this.loadedModules.has(moduleName)) {
                statsByPriority[priority].loaded++;
            }
        }

        return {
            totalModules,
            loadedModules,
            loadingModules,
            unloadedModules: totalModules - loadedModules - loadingModules,
            loadingProgress: Math.round((loadedModules / totalModules) * 100),
            statsByPriority
        };
    }

    /**
     * Clear all loaded modules
     */
    clearCache() {
        console.log('🧹 Clearing module cache...');
        
        // Destroy all loaded modules
        for (const [moduleName, moduleInstance] of this.loadedModules) {
            if (moduleInstance && typeof moduleInstance.destroy === 'function') {
                try {
                    moduleInstance.destroy();
                } catch (error) {
                    console.warn(`Error destroying module '${moduleName}':`, error);
                }
            }
        }
        
        this.loadedModules.clear();
        this.loadingPromises.clear();
        
        console.log('✅ Module cache cleared');
    }

    /**
     * Destroy the lazy loader
     */
    destroy() {
        this.clearCache();
        this.moduleDefinitions.clear();
        this.isInitialized = false;
        console.log('🚀 LazyLoader destroyed');
    }
}
// Universal Module Compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LazyLoader };
} else if (typeof window !== 'undefined') {
    window.LazyLoader = LazyLoader;
}