/**
 * Calculator Module
 * Handles expense calculations for the Calculadora de Gastos game
 * Calculates cleaning product and water expenses, projections, and savings
 * Optimized with intelligent caching for better performance
 */

export class CalculatorModule {
    constructor() {
        this.isInitialized = false;
        this.cacheManager = null; // Will be injected by main app
        
        // Product data - prices in USD per month
        this.productData = {
            // Cleaning products
            cleaning: {
                basic: { label: 'Productos Básicos', monthlyPrice: 25.00, description: 'Detergente, jabón, limpiadores básicos' },
                standard: { label: 'Productos Estándar', monthlyPrice: 45.00, description: 'Productos de marca, desinfectantes' },
                premium: { label: 'Productos Premium', monthlyPrice: 75.00, description: 'Productos especializados, orgánicos' },
                luxury: { label: 'Productos de Lujo', monthlyPrice: 120.00, description: 'Marcas premium, productos importados' }
            },
            
            // Water consumption
            water: {
                low: { label: 'Consumo Bajo', monthlyPrice: 15.00, description: '1-2 personas, uso moderado' },
                medium: { label: 'Consumo Medio', monthlyPrice: 35.00, description: '3-4 personas, uso normal' },
                high: { label: 'Consumo Alto', monthlyPrice: 65.00, description: '5+ personas, uso intensivo' },
                excessive: { label: 'Consumo Excesivo', monthlyPrice: 95.00, description: 'Uso comercial o muy alto' }
            }
        };
        
        // Pasteur System data
        this.pasteurSystem = {
            initialCost: 2500.00, // One-time system cost
            monthlyMaintenance: 15.00, // Monthly maintenance
            productSavings: 0.80, // 80% savings on cleaning products
            waterSavings: 0.60, // 60% savings on water costs
            freeProductsYears: 5, // Years of free products included
            systemLifespan: 15, // Years the system lasts
            warrantyYears: 10 // Warranty period
        };
        
        // Calculation history
        this.calculationHistory = [];
        this.currentCalculation = null;
        
        // Cache statistics
        this.cacheStats = {
            calculationCacheHits: 0,
            calculationCacheMisses: 0,
            projectionCacheHits: 0,
            projectionCacheMisses: 0,
            recommendationCacheHits: 0,
            recommendationCacheMisses: 0
        };
    }

    /**
     * Initialize the calculator module
     */
    init() {
        try {
            console.log('🧮 Initializing CalculatorModule...');
            
            // Cache product data for faster access
            if (this.cacheManager) {
                this.cacheProductData();
                console.log('🧮 Product data cached for optimization');
            }
            
            this.isInitialized = true;
            console.log('✅ CalculatorModule initialized successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize CalculatorModule:', error);
            return false;
        }
    }

    /**
     * Set cache manager for optimization
     */
    setCacheManager(cacheManager) {
        this.cacheManager = cacheManager;
        console.log('🧮 CacheManager integrated with CalculatorModule');
        
        // Cache product data if already initialized
        if (this.isInitialized) {
            this.cacheProductData();
        }
    }

    /**
     * Cache product data for faster access
     */
    cacheProductData() {
        if (!this.cacheManager) return;
        
        // Cache cleaning products
        this.cacheManager.cacheProductConfig('cleaning', this.productData.cleaning);
        
        // Cache water consumption data
        this.cacheManager.cacheProductConfig('water', this.productData.water);
        
        // Cache Pasteur system data
        this.cacheManager.cacheProductConfig('pasteur', this.pasteurSystem);
        
        console.log('🧮 Product configurations cached');
    }

    /**
     * Calculate total expenses based on user selections with caching
     * @param {Object} selections - User selections for products and water
     * @returns {Object} Calculation results
     */
    calculateExpenses(selections) {
        if (!this.isInitialized) {
            console.error('🧮 CalculatorModule not initialized');
            return null;
        }

        // Check cache first
        if (this.cacheManager) {
            const cached = this.cacheManager.getCachedCalculation(selections);
            if (cached) {
                this.cacheStats.calculationCacheHits++;
                console.log('🧮 Using cached calculation result');
                return cached;
            }
            this.cacheStats.calculationCacheMisses++;
        }

        const { cleaningProducts, waterConsumption } = selections;
        
        // Get base costs
        const cleaningCost = this.getCleaningCost(cleaningProducts);
        const waterCost = this.getWaterCost(waterConsumption);
        
        // Calculate totals
        const monthlyTotal = cleaningCost + waterCost;
        const annualTotal = monthlyTotal * 12;
        
        // Calculate projections with caching
        const projections = this.calculateProjectionsWithCache(monthlyTotal);
        
        // Calculate Pasteur savings
        const pasteurAnalysis = this.calculatePasteurSavings(cleaningCost, waterCost);
        
        // Create calculation result
        const calculation = {
            timestamp: Date.now(),
            selections: { cleaningProducts, waterConsumption },
            costs: {
                cleaning: cleaningCost,
                water: waterCost,
                monthly: monthlyTotal,
                annual: annualTotal
            },
            projections,
            pasteurAnalysis,
            metadata: {
                cleaningLabel: this.getProductLabel('cleaning', cleaningProducts),
                waterLabel: this.getProductLabel('water', waterConsumption),
                cached: false // Mark as fresh calculation
            }
        };
        
        // Cache the result
        if (this.cacheManager) {
            this.cacheManager.cacheCalculation(selections, calculation);
        }
        
        // Store calculation
        this.currentCalculation = calculation;
        this.calculationHistory.push(calculation);
        
        console.log('🧮 Calculation completed and cached:', calculation);
        
        return calculation;
    }

    /**
     * Get cleaning product cost
     */
    getCleaningCost(productType) {
        if (!productType || !this.productData.cleaning[productType]) {
            // Default to standard if not specified
            return this.productData.cleaning.standard.monthlyPrice;
        }
        
        return this.productData.cleaning[productType].monthlyPrice;
    }

    /**
     * Get water consumption cost
     */
    getWaterCost(consumptionType) {
        if (!consumptionType || !this.productData.water[consumptionType]) {
            // Default to medium if not specified
            return this.productData.water.medium.monthlyPrice;
        }
        
        return this.productData.water[consumptionType].monthlyPrice;
    }

    /**
     * Get product label for display
     */
    getProductLabel(category, type) {
        if (!type || !this.productData[category] || !this.productData[category][type]) {
            return 'No especificado';
        }
        
        return this.productData[category][type].label;
    }

    /**
     * Calculate long-term projections with caching
     */
    calculateProjectionsWithCache(monthlyTotal) {
        // Check cache first
        if (this.cacheManager) {
            const cacheKey = { monthlyTotal, inflationRate: 0.03 };
            const cached = this.cacheManager.getCachedProjection(cacheKey);
            if (cached) {
                this.cacheStats.projectionCacheHits++;
                console.log('🧮 Using cached projection data');
                return cached;
            }
            this.cacheStats.projectionCacheMisses++;
        }

        // Calculate projections
        const projections = this.calculateProjections(monthlyTotal);
        
        // Cache the result
        if (this.cacheManager) {
            const cacheKey = { monthlyTotal, inflationRate: 0.03 };
            this.cacheManager.cacheProjection(cacheKey, projections);
        }
        
        return projections;
    }

    /**
     * Calculate long-term projections
     */
    calculateProjections(monthlyTotal) {
        const projectionYears = [1, 5, 10, 15, 20];
        const projections = {};
        
        projectionYears.forEach(years => {
            // Account for inflation (3% annually)
            const inflationRate = 0.03;
            const inflationMultiplier = Math.pow(1 + inflationRate, years);
            
            projections[`year${years}`] = {
                years,
                total: monthlyTotal * 12 * years * inflationMultiplier,
                withInflation: true,
                inflationRate: inflationRate * 100
            };
        });
        
        return projections;
    }

    /**
     * Calculate Pasteur System savings analysis
     */
    calculatePasteurSavings(cleaningCost, waterCost) {
        const system = this.pasteurSystem;
        
        // Monthly savings
        const monthlySavings = {
            cleaning: cleaningCost * system.productSavings,
            water: waterCost * system.waterSavings,
            maintenance: -system.monthlyMaintenance // Cost, so negative
        };
        
        const totalMonthlySavings = monthlySavings.cleaning + monthlySavings.water + monthlySavings.maintenance;
        
        // Calculate payback period
        const paybackMonths = system.initialCost / totalMonthlySavings;
        const paybackYears = paybackMonths / 12;
        
        // Calculate lifetime savings
        const lifetimeSavings = (totalMonthlySavings * 12 * system.systemLifespan) - system.initialCost;
        
        // Calculate free products value
        const freeProductsValue = cleaningCost * 12 * system.freeProductsYears;
        
        // ROI calculation
        const totalInvestment = system.initialCost;
        const totalReturns = lifetimeSavings + totalInvestment;
        const roi = ((totalReturns - totalInvestment) / totalInvestment) * 100;
        
        return {
            initialCost: system.initialCost,
            monthlySavings: {
                cleaning: monthlySavings.cleaning,
                water: monthlySavings.water,
                maintenance: Math.abs(monthlySavings.maintenance),
                total: totalMonthlySavings
            },
            payback: {
                months: Math.ceil(paybackMonths),
                years: Math.round(paybackYears * 10) / 10
            },
            lifetime: {
                totalSavings: lifetimeSavings,
                years: system.systemLifespan
            },
            freeProducts: {
                value: freeProductsValue,
                years: system.freeProductsYears
            },
            roi: Math.round(roi),
            breakEvenMonth: Math.ceil(paybackMonths),
            isWorthwhile: lifetimeSavings > 0 && paybackYears < 5
        };
    }

    /**
     * Get available product options for UI
     */
    getProductOptions(category) {
        if (!this.productData[category]) {
            console.warn(`🧮 Category '${category}' not found`);
            return [];
        }

        return Object.entries(this.productData[category]).map(([key, data]) => ({
            value: key,
            label: data.label,
            price: data.monthlyPrice,
            description: data.description
        }));
    }

    /**
     * Get cleaning product options
     */
    getCleaningOptions() {
        return this.getProductOptions('cleaning');
    }

    /**
     * Get water consumption options
     */
    getWaterOptions() {
        return this.getProductOptions('water');
    }

    /**
     * Format currency for display
     */
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    /**
     * Format percentage for display
     */
    formatPercentage(value) {
        return `${Math.round(value)}%`;
    }

    /**
     * Get calculation summary for display
     */
    getCalculationSummary(calculation = null) {
        const calc = calculation || this.currentCalculation;
        
        if (!calc) {
            return null;
        }

        return {
            monthly: this.formatCurrency(calc.costs.monthly),
            annual: this.formatCurrency(calc.costs.annual),
            fiveYear: this.formatCurrency(calc.projections.year5.total),
            tenYear: this.formatCurrency(calc.projections.year10.total),
            pasteurSavings: {
                monthly: this.formatCurrency(calc.pasteurAnalysis.monthlySavings.total),
                paybackYears: calc.pasteurAnalysis.payback.years,
                lifetimeSavings: this.formatCurrency(calc.pasteurAnalysis.lifetime.totalSavings),
                roi: this.formatPercentage(calc.pasteurAnalysis.roi),
                isWorthwhile: calc.pasteurAnalysis.isWorthwhile
            }
        };
    }

    /**
     * Generate recommendation based on calculation with caching
     */
    generateRecommendation(calculation = null) {
        const calc = calculation || this.currentCalculation;
        
        if (!calc) {
            return 'No hay datos suficientes para generar una recomendación.';
        }

        // Create cache key from calculation hash
        const calculationHash = this.hashCalculation(calc);
        
        // Check cache first
        if (this.cacheManager) {
            const cached = this.cacheManager.getCachedRecommendation(calculationHash);
            if (cached) {
                this.cacheStats.recommendationCacheHits++;
                console.log('🧮 Using cached recommendation');
                return cached;
            }
            this.cacheStats.recommendationCacheMisses++;
        }

        // Generate recommendation
        const recommendation = this.generateRecommendationLogic(calc);
        
        // Cache the result
        if (this.cacheManager) {
            this.cacheManager.cacheRecommendation(calculationHash, recommendation);
        }
        
        return recommendation;
    }

    /**
     * Generate recommendation logic (extracted for caching)
     */
    generateRecommendationLogic(calc) {
        const pasteur = calc.pasteurAnalysis;
        const monthly = calc.costs.monthly;
        
        if (pasteur.isWorthwhile) {
            if (pasteur.payback.years <= 2) {
                return `¡Excelente oportunidad! Con un gasto mensual de ${this.formatCurrency(monthly)}, el Sistema Pasteur se pagará solo en ${pasteur.payback.years} años y te ahorrará ${this.formatCurrency(pasteur.lifetime.totalSavings)} a largo plazo.`;
            } else if (pasteur.payback.years <= 3) {
                return `Buena inversión. El Sistema Pasteur se amortizará en ${pasteur.payback.years} años y generará ahorros significativos de ${this.formatCurrency(pasteur.lifetime.totalSavings)} durante su vida útil.`;
            } else {
                return `Inversión rentable a largo plazo. Aunque el período de recuperación es de ${pasteur.payback.years} años, los ahorros totales de ${this.formatCurrency(pasteur.lifetime.totalSavings)} hacen que valga la pena.`;
            }
        } else {
            return `Con tu nivel actual de gasto (${this.formatCurrency(monthly)}/mes), el Sistema Pasteur podría no ser la opción más económica. Te recomendamos evaluar aumentar el uso de productos de limpieza o considerar otros factores como la calidad del agua.`;
        }
    }

    /**
     * Create hash from calculation for caching
     */
    hashCalculation(calculation) {
        const key = {
            cleaning: calculation.costs.cleaning,
            water: calculation.costs.water,
            monthly: calculation.costs.monthly
        };
        return JSON.stringify(key);
    }

    /**
     * Get current calculation
     */
    getCurrentCalculation() {
        return this.currentCalculation;
    }

    /**
     * Get calculation history
     */
    getCalculationHistory() {
        return [...this.calculationHistory];
    }

    /**
     * Clear calculation history
     */
    clearHistory() {
        this.calculationHistory = [];
        this.currentCalculation = null;
        console.log('🧮 Calculation history cleared');
    }

    /**
     * Export calculation data
     */
    exportCalculation(calculation = null) {
        const calc = calculation || this.currentCalculation;
        
        if (!calc) {
            return null;
        }

        return {
            timestamp: new Date(calc.timestamp).toISOString(),
            selections: calc.selections,
            costs: calc.costs,
            projections: calc.projections,
            pasteurAnalysis: calc.pasteurAnalysis,
            summary: this.getCalculationSummary(calc),
            recommendation: this.generateRecommendation(calc)
        };
    }

    /**
     * Validate user selections
     */
    validateSelections(selections) {
        const errors = [];
        
        if (!selections) {
            errors.push('No se proporcionaron selecciones');
            return errors;
        }

        const { cleaningProducts, waterConsumption } = selections;
        
        if (cleaningProducts && !this.productData.cleaning[cleaningProducts]) {
            errors.push(`Producto de limpieza inválido: ${cleaningProducts}`);
        }
        
        if (waterConsumption && !this.productData.water[waterConsumption]) {
            errors.push(`Consumo de agua inválido: ${waterConsumption}`);
        }
        
        return errors;
    }

    /**
     * Get cache statistics
     */
    getCacheStatistics() {
        const totalRequests = this.cacheStats.calculationCacheHits + this.cacheStats.calculationCacheMisses +
                             this.cacheStats.projectionCacheHits + this.cacheStats.projectionCacheMisses +
                             this.cacheStats.recommendationCacheHits + this.cacheStats.recommendationCacheMisses;
        
        const totalHits = this.cacheStats.calculationCacheHits + this.cacheStats.projectionCacheHits + 
                         this.cacheStats.recommendationCacheHits;
        
        return {
            ...this.cacheStats,
            totalRequests,
            totalHits,
            hitRate: totalRequests > 0 ? (totalHits / totalRequests * 100).toFixed(2) + '%' : '0%',
            cacheEnabled: !!this.cacheManager
        };
    }

    /**
     * Clear calculator cache
     */
    clearCache() {
        if (this.cacheManager) {
            this.cacheManager.clear('calculations');
            this.cacheManager.clear('projections');
            this.cacheManager.clear('recommendations');
            console.log('🧮 Calculator cache cleared');
        }
        
        // Reset cache statistics
        this.cacheStats = {
            calculationCacheHits: 0,
            calculationCacheMisses: 0,
            projectionCacheHits: 0,
            projectionCacheMisses: 0,
            recommendationCacheHits: 0,
            recommendationCacheMisses: 0
        };
    }

    /**
     * Update product data (for future customization)
     */
    updateProductData(category, type, data) {
        if (!this.productData[category]) {
            this.productData[category] = {};
        }
        
        this.productData[category][type] = { ...this.productData[category][type], ...data };
        
        // Update cache if available
        if (this.cacheManager) {
            this.cacheManager.cacheProductConfig(category, this.productData[category]);
            // Clear related calculation caches since product data changed
            this.cacheManager.clear('calculations');
            this.cacheManager.clear('projections');
        }
        
        console.log(`🧮 Updated ${category}.${type} data and refreshed cache`);
    }
}
    /**
     * Cleanup and destroy the calculator module
     */
    destroy() {
        // Log final cache statistics
        if (this.cacheManager) {
            console.log('🧮 Final cache statistics:', this.getCacheStatistics());
        }
        
        this.calculationHistory = [];
        this.currentCalculation = null;
        this.cacheManager = null;
        this.isInitialized = false;
        
        console.log('🧹 CalculatorModule destroyed');
    }
}
// Universal Module Compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CalculatorModule };
} else if (typeof window !== 'undefined') {
    window.CalculatorModule = CalculatorModule;
}