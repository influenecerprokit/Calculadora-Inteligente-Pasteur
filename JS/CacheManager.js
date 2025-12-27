/**
 * Cache Manager Module
 * Manages intelligent caching of calculations, configurations, and frequently accessed data
 * Optimizes performance by avoiding redundant calculations and data processing
 */

export class CacheManager {
    constructor() {
        this.isInitialized = false;
        
        // Cache storage
        this.caches = {
            calculations: new Map(), // Calculation results cache
            configurations: new Map(), // Configuration data cache
            userSelections: new Map(), // User selection combinations cache
            productData: new Map(), // Product data cache
            projections: new Map(), // Long-term projections cache
            recommendations: new Map() // Generated recommendations cache
        };
        
        // Cache configuration
        this.config = {
            maxCacheSize: 100, // Maximum items per cache
            defaultTTL: 30 * 60 * 1000, // 30 minutes default TTL
            cleanupInterval: 5 * 60 * 1000, // 5 minutes cleanup interval
            compressionEnabled: true,
            persistentCaches: ['configurations', 'productData'], // Caches to persist
            enableStatistics: true
        };
        
        // Cache statistics
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            compressions: 0,
            totalRequests: 0,
            cacheEfficiency: 0,
            memoryUsage: 0,
            lastCleanup: null
        };
        
        // Cache policies
        this.policies = {
            calculations: { ttl: 60 * 60 * 1000, maxSize: 50 }, // 1 hour, 50 items
            configurations: { ttl: 24 * 60 * 60 * 1000, maxSize: 20 }, // 24 hours, 20 items
            userSelections: { ttl: 30 * 60 * 1000, maxSize: 30 }, // 30 minutes, 30 items
            productData: { ttl: 12 * 60 * 60 * 1000, maxSize: 10 }, // 12 hours, 10 items
            projections: { ttl: 2 * 60 * 60 * 1000, maxSize: 40 }, // 2 hours, 40 items
            recommendations: { ttl: 15 * 60 * 1000, maxSize: 25 } // 15 minutes, 25 items
        };
        
        // Cleanup timer
        this.cleanupTimer = null;
        
        // Bind methods
        this.performCleanup = this.performCleanup.bind(this);
    }

    /**
     * Initialize the cache manager
     */
    init() {
        try {
            console.log('🗄️ Initializing CacheManager...');
            
            // Load persistent caches from storage
            this.loadPersistentCaches();
            
            // Start cleanup timer
            this.startCleanupTimer();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ CacheManager initialized successfully');
            console.log(`🗄️ Cache policies:`, this.policies);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize CacheManager:', error);
            return false;
        }
    }

    /**
     * Load persistent caches from localStorage
     */
    loadPersistentCaches() {
        this.config.persistentCaches.forEach(cacheName => {
            try {
                const key = `cache_${cacheName}`;
                const stored = localStorage.getItem(key);
                
                if (stored) {
                    const data = JSON.parse(stored);
                    
                    // Restore cache entries with validation
                    data.forEach(([key, entry]) => {
                        if (this.isValidCacheEntry(entry)) {
                            this.caches[cacheName].set(key, entry);
                        }
                    });
                    
                    console.log(`🗄️ Loaded ${this.caches[cacheName].size} items from persistent cache: ${cacheName}`);
                }
            } catch (error) {
                console.warn(`🗄️ Failed to load persistent cache ${cacheName}:`, error);
            }
        });
    }

    /**
     * Save persistent caches to localStorage
     */
    savePersistentCaches() {
        this.config.persistentCaches.forEach(cacheName => {
            try {
                const cache = this.caches[cacheName];
                const data = Array.from(cache.entries());
                const key = `cache_${cacheName}`;
                
                localStorage.setItem(key, JSON.stringify(data));
                console.log(`🗄️ Saved ${cache.size} items to persistent cache: ${cacheName}`);
            } catch (error) {
                console.warn(`🗄️ Failed to save persistent cache ${cacheName}:`, error);
            }
        });
    }

    /**
     * Start cleanup timer
     */
    startCleanupTimer() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        
        this.cleanupTimer = setInterval(this.performCleanup, this.config.cleanupInterval);
        console.log(`🗄️ Cleanup timer started (${this.config.cleanupInterval / 1000}s interval)`);
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Save persistent caches before page unload
        window.addEventListener('beforeunload', () => {
            this.savePersistentCaches();
        });
        
        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.savePersistentCaches();
            }
        });
    }

    /**
     * Generate cache key from parameters
     */
    generateCacheKey(params) {
        if (typeof params === 'string') {
            return params;
        }
        
        // Create deterministic key from object
        const sortedParams = JSON.stringify(params, Object.keys(params).sort());
        return this.hashString(sortedParams);
    }

    /**
     * Simple hash function for cache keys
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Create cache entry with metadata
     */
    createCacheEntry(data, ttl = null) {
        const entry = {
            data: this.config.compressionEnabled ? this.compressData(data) : data,
            timestamp: Date.now(),
            ttl: ttl || this.config.defaultTTL,
            hits: 0,
            compressed: this.config.compressionEnabled,
            size: this.calculateDataSize(data)
        };
        
        if (this.config.compressionEnabled) {
            this.stats.compressions++;
        }
        
        return entry;
    }

    /**
     * Compress data for storage efficiency
     */
    compressData(data) {
        try {
            // Simple compression: remove whitespace from JSON
            const jsonString = JSON.stringify(data);
            return {
                compressed: true,
                data: jsonString,
                originalSize: jsonString.length
            };
        } catch (error) {
            console.warn('🗄️ Failed to compress data:', error);
            return data;
        }
    }

    /**
     * Decompress data
     */
    decompressData(compressedData) {
        try {
            if (compressedData.compressed) {
                return JSON.parse(compressedData.data);
            }
            return compressedData;
        } catch (error) {
            console.warn('🗄️ Failed to decompress data:', error);
            return compressedData;
        }
    }

    /**
     * Calculate data size in bytes (approximate)
     */
    calculateDataSize(data) {
        try {
            return JSON.stringify(data).length * 2; // Approximate UTF-16 size
        } catch (error) {
            return 0;
        }
    }

    /**
     * Check if cache entry is valid (not expired)
     */
    isValidCacheEntry(entry) {
        if (!entry || !entry.timestamp) {
            return false;
        }
        
        const age = Date.now() - entry.timestamp;
        return age < entry.ttl;
    }

    /**
     * Get item from cache
     */
    get(cacheName, key, defaultValue = null) {
        this.stats.totalRequests++;
        
        if (!this.caches[cacheName]) {
            console.warn(`🗄️ Cache '${cacheName}' does not exist`);
            this.stats.misses++;
            return defaultValue;
        }
        
        const cacheKey = this.generateCacheKey(key);
        const entry = this.caches[cacheName].get(cacheKey);
        
        if (!entry || !this.isValidCacheEntry(entry)) {
            this.stats.misses++;
            
            // Remove expired entry
            if (entry) {
                this.caches[cacheName].delete(cacheKey);
            }
            
            return defaultValue;
        }
        
        // Update hit statistics
        entry.hits++;
        this.stats.hits++;
        
        // Return decompressed data
        const data = entry.compressed ? this.decompressData(entry.data) : entry.data;
        
        console.log(`🗄️ Cache HIT: ${cacheName}/${cacheKey} (hits: ${entry.hits})`);
        return data;
    }

    /**
     * Set item in cache
     */
    set(cacheName, key, data, ttl = null) {
        if (!this.caches[cacheName]) {
            console.warn(`🗄️ Cache '${cacheName}' does not exist`);
            return false;
        }
        
        const cacheKey = this.generateCacheKey(key);
        const policy = this.policies[cacheName] || {};
        const entryTTL = ttl || policy.ttl || this.config.defaultTTL;
        
        // Create cache entry
        const entry = this.createCacheEntry(data, entryTTL);
        
        // Check cache size limits
        const maxSize = policy.maxSize || this.config.maxCacheSize;
        if (this.caches[cacheName].size >= maxSize) {
            this.evictLeastRecentlyUsed(cacheName);
        }
        
        // Store in cache
        this.caches[cacheName].set(cacheKey, entry);
        
        console.log(`🗄️ Cache SET: ${cacheName}/${cacheKey} (TTL: ${entryTTL}ms)`);
        return true;
    }

    /**
     * Remove item from cache
     */
    remove(cacheName, key) {
        if (!this.caches[cacheName]) {
            return false;
        }
        
        const cacheKey = this.generateCacheKey(key);
        const removed = this.caches[cacheName].delete(cacheKey);
        
        if (removed) {
            console.log(`🗄️ Cache REMOVE: ${cacheName}/${cacheKey}`);
        }
        
        return removed;
    }

    /**
     * Clear entire cache
     */
    clear(cacheName = null) {
        if (cacheName) {
            if (this.caches[cacheName]) {
                const size = this.caches[cacheName].size;
                this.caches[cacheName].clear();
                console.log(`🗄️ Cache CLEAR: ${cacheName} (${size} items removed)`);
            }
        } else {
            // Clear all caches
            Object.keys(this.caches).forEach(name => {
                const size = this.caches[name].size;
                this.caches[name].clear();
                console.log(`🗄️ Cache CLEAR: ${name} (${size} items removed)`);
            });
        }
    }

    /**
     * Evict least recently used item
     */
    evictLeastRecentlyUsed(cacheName) {
        const cache = this.caches[cacheName];
        let lruKey = null;
        let lruEntry = null;
        let oldestTime = Date.now();
        
        // Find least recently used entry
        for (const [key, entry] of cache.entries()) {
            const lastAccess = entry.timestamp + (entry.hits * 1000); // Approximate last access
            if (lastAccess < oldestTime) {
                oldestTime = lastAccess;
                lruKey = key;
                lruEntry = entry;
            }
        }
        
        if (lruKey) {
            cache.delete(lruKey);
            this.stats.evictions++;
            console.log(`🗄️ Cache EVICT: ${cacheName}/${lruKey} (hits: ${lruEntry.hits})`);
        }
    }

    /**
     * Perform cache cleanup (remove expired entries)
     */
    performCleanup() {
        const startTime = Date.now();
        let totalRemoved = 0;
        
        Object.entries(this.caches).forEach(([cacheName, cache]) => {
            const initialSize = cache.size;
            
            // Remove expired entries
            for (const [key, entry] of cache.entries()) {
                if (!this.isValidCacheEntry(entry)) {
                    cache.delete(key);
                    totalRemoved++;
                }
            }
            
            const removed = initialSize - cache.size;
            if (removed > 0) {
                console.log(`🗄️ Cache CLEANUP: ${cacheName} (${removed} expired items removed)`);
            }
        });
        
        // Update statistics
        this.stats.lastCleanup = Date.now();
        this.updateCacheEfficiency();
        
        const cleanupTime = Date.now() - startTime;
        console.log(`🗄️ Cache cleanup completed (${cleanupTime}ms, ${totalRemoved} items removed)`);
        
        // Save persistent caches after cleanup
        this.savePersistentCaches();
    }

    /**
     * Update cache efficiency statistics
     */
    updateCacheEfficiency() {
        if (this.stats.totalRequests > 0) {
            this.stats.cacheEfficiency = (this.stats.hits / this.stats.totalRequests) * 100;
        }
        
        // Calculate memory usage
        let totalMemory = 0;
        Object.values(this.caches).forEach(cache => {
            for (const entry of cache.values()) {
                totalMemory += entry.size || 0;
            }
        });
        this.stats.memoryUsage = totalMemory;
    }

    /**
     * Get cache statistics
     */
    getStatistics() {
        this.updateCacheEfficiency();
        
        const cacheDetails = {};
        Object.entries(this.caches).forEach(([name, cache]) => {
            cacheDetails[name] = {
                size: cache.size,
                maxSize: this.policies[name]?.maxSize || this.config.maxCacheSize,
                policy: this.policies[name] || {}
            };
        });
        
        return {
            ...this.stats,
            cacheDetails,
            config: this.config,
            uptime: this.isInitialized ? Date.now() - this.stats.lastCleanup : 0
        };
    }

    /**
     * Cache calculation result
     */
    cacheCalculation(selections, result) {
        const key = {
            cleaningProducts: selections.cleaningProducts,
            waterConsumption: selections.waterConsumption
        };
        
        return this.set('calculations', key, result);
    }

    /**
     * Get cached calculation
     */
    getCachedCalculation(selections) {
        const key = {
            cleaningProducts: selections.cleaningProducts,
            waterConsumption: selections.waterConsumption
        };
        
        return this.get('calculations', key);
    }

    /**
     * Cache product configuration
     */
    cacheProductConfig(category, config) {
        return this.set('configurations', `product_${category}`, config);
    }

    /**
     * Get cached product configuration
     */
    getCachedProductConfig(category) {
        return this.get('configurations', `product_${category}`);
    }

    /**
     * Cache user selection combination
     */
    cacheUserSelection(selectionId, data) {
        return this.set('userSelections', selectionId, data);
    }

    /**
     * Get cached user selection
     */
    getCachedUserSelection(selectionId) {
        return this.get('userSelections', selectionId);
    }

    /**
     * Cache projection data
     */
    cacheProjection(params, projection) {
        return this.set('projections', params, projection);
    }

    /**
     * Get cached projection
     */
    getCachedProjection(params) {
        return this.get('projections', params);
    }

    /**
     * Cache recommendation
     */
    cacheRecommendation(calculationHash, recommendation) {
        return this.set('recommendations', calculationHash, recommendation);
    }

    /**
     * Get cached recommendation
     */
    getCachedRecommendation(calculationHash) {
        return this.get('recommendations', calculationHash);
    }

    /**
     * Warm up cache with common calculations
     */
    warmUpCache() {
        console.log('🗄️ Warming up cache with common calculations...');
        
        // Common product/water combinations
        const commonCombinations = [
            { cleaningProducts: 'standard', waterConsumption: 'medium' },
            { cleaningProducts: 'basic', waterConsumption: 'low' },
            { cleaningProducts: 'premium', waterConsumption: 'high' },
            { cleaningProducts: 'standard', waterConsumption: 'low' },
            { cleaningProducts: 'basic', waterConsumption: 'medium' }
        ];
        
        // Pre-cache these combinations if calculator is available
        if (window.calculadoraApp?.calculatorModule) {
            const calculator = window.calculadoraApp.calculatorModule;
            
            commonCombinations.forEach(combination => {
                try {
                    const result = calculator.calculateExpenses(combination);
                    if (result) {
                        this.cacheCalculation(combination, result);
                    }
                } catch (error) {
                    console.warn('🗄️ Failed to warm up cache for combination:', combination, error);
                }
            });
        }
        
        console.log('🗄️ Cache warm-up completed');
    }

    /**
     * Export cache data
     */
    exportCache() {
        const exportData = {};
        
        Object.entries(this.caches).forEach(([name, cache]) => {
            exportData[name] = Array.from(cache.entries());
        });
        
        return {
            caches: exportData,
            statistics: this.getStatistics(),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import cache data
     */
    importCache(data) {
        try {
            if (data.caches) {
                Object.entries(data.caches).forEach(([name, entries]) => {
                    if (this.caches[name]) {
                        this.caches[name].clear();
                        entries.forEach(([key, entry]) => {
                            if (this.isValidCacheEntry(entry)) {
                                this.caches[name].set(key, entry);
                            }
                        });
                    }
                });
            }
            
            console.log('🗄️ Cache data imported successfully');
            return true;
        } catch (error) {
            console.error('🗄️ Failed to import cache data:', error);
            return false;
        }
    }

    /**
     * Cleanup and destroy the cache manager
     */
    destroy() {
        // Save persistent caches
        this.savePersistentCaches();
        
        // Clear cleanup timer
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        
        // Clear all caches
        this.clear();
        
        // Remove event listeners
        window.removeEventListener('beforeunload', this.savePersistentCaches);
        
        this.isInitialized = false;
        console.log('🧹 CacheManager destroyed');
        console.log('🗄️ Final cache statistics:', this.getStatistics());
    }
}
// Universal Module Compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CacheManager };
} else if (typeof window !== 'undefined') {
    window.CacheManager = CacheManager;
}