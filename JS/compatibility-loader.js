/**
 * Compatibility Loader - Universal Browser Support
 * Detects browser capabilities and loads appropriate version
 */

(function() {
    'use strict';
    
    // Browser detection and feature support
    const BrowserDetector = {
        // Detect if ES6 modules are supported
        supportsModules: function() {
            try {
                return 'noModule' in HTMLScriptElement.prototype;
            } catch (e) {
                return false;
            }
        },
        
        // Detect if we're running from file:// protocol
        isFileProtocol: function() {
            return window.location.protocol === 'file:';
        },
        
        // Detect browser type and version
        getBrowserInfo: function() {
            const ua = navigator.userAgent;
            let browser = 'unknown';
            let version = 0;
            
            if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edge') === -1) {
                browser = 'chrome';
                version = parseInt(ua.match(/Chrome\/(\d+)/)[1]);
            } else if (ua.indexOf('Firefox') > -1) {
                browser = 'firefox';
                version = parseInt(ua.match(/Firefox\/(\d+)/)[1]);
            } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
                browser = 'safari';
                version = parseInt(ua.match(/Version\/(\d+)/)[1]);
            } else if (ua.indexOf('Edge') > -1) {
                browser = 'edge';
                version = parseInt(ua.match(/Edge\/(\d+)/)[1]);
            } else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
                browser = 'ie';
                version = parseInt(ua.match(/(?:MSIE |rv:)(\d+)/)[1]);
            }
            
            return { browser, version };
        },
        
        // Check if browser supports required features
        isCompatible: function() {
            const info = this.getBrowserInfo();
            
            // Minimum version requirements
            const minVersions = {
                chrome: 50,
                firefox: 45,
                safari: 10,
                edge: 15,
                ie: 0 // IE not supported
            };
            
            if (info.browser === 'ie') {
                return false;
            }
            
            return info.version >= (minVersions[info.browser] || 0);
        },
        
        // Check for specific features
        hasFeature: function(feature) {
            switch (feature) {
                case 'es6':
                    try {
                        eval('class Test {}; const test = () => {}; `template`;');
                        return true;
                    } catch (e) {
                        return false;
                    }
                case 'webaudio':
                    return !!(window.AudioContext || window.webkitAudioContext);
                case 'localstorage':
                    try {
                        localStorage.setItem('test', 'test');
                        localStorage.removeItem('test');
                        return true;
                    } catch (e) {
                        return false;
                    }
                case 'touch':
                    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
                default:
                    return false;
            }
        }
    };
    
    // Compatibility layer for older browsers
    const CompatibilityLayer = {
        // Add polyfills for missing features
        addPolyfills: function() {
            // Promise polyfill for older browsers
            if (!window.Promise) {
                this.loadScript('https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js');
            }
            
            // Fetch polyfill
            if (!window.fetch) {
                this.loadScript('https://cdn.jsdelivr.net/npm/whatwg-fetch@3/dist/fetch.umd.js');
            }
            
            // Object.assign polyfill
            if (!Object.assign) {
                Object.assign = function(target) {
                    for (var i = 1; i < arguments.length; i++) {
                        var source = arguments[i];
                        for (var key in source) {
                            if (Object.prototype.hasOwnProperty.call(source, key)) {
                                target[key] = source[key];
                            }
                        }
                    }
                    return target;
                };
            }
            
            // Array.from polyfill
            if (!Array.from) {
                Array.from = function(arrayLike) {
                    var result = [];
                    for (var i = 0; i < arrayLike.length; i++) {
                        result.push(arrayLike[i]);
                    }
                    return result;
                };
            }
        },
        
        // Load external script
        loadScript: function(src) {
            return new Promise(function(resolve, reject) {
                var script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        },
        
        // Create fallback for ES6 modules
        createModuleFallback: function() {
            // Simple module system for older browsers
            window.ModuleSystem = {
                modules: {},
                
                define: function(name, dependencies, factory) {
                    var deps = dependencies.map(function(dep) {
                        return this.modules[dep];
                    }.bind(this));
                    
                    this.modules[name] = factory.apply(null, deps);
                },
                
                require: function(name) {
                    return this.modules[name];
                }
            };
        }
    };
    
    // Application loader
    const AppLoader = {
        // Load the appropriate version based on browser capabilities
        load: function() {
            console.log('🔍 Detecting browser capabilities...');
            
            const browserInfo = BrowserDetector.getBrowserInfo();
            const isCompatible = BrowserDetector.isCompatible();
            const supportsModules = BrowserDetector.supportsModules();
            const isFileProtocol = BrowserDetector.isFileProtocol();
            
            console.log('Browser info:', browserInfo);
            console.log('Compatible:', isCompatible);
            console.log('Supports modules:', supportsModules);
            console.log('File protocol:', isFileProtocol);
            
            if (!isCompatible) {
                this.showIncompatibleBrowser(browserInfo);
                return;
            }
            
            // Add polyfills for older browsers
            CompatibilityLayer.addPolyfills();
            
            // Choose loading strategy
            if (supportsModules && !isFileProtocol) {
                // Modern browsers with HTTP server - use ES6 modules
                this.loadModernVersion();
            } else {
                // Older browsers or file:// protocol - use compatibility version
                this.loadCompatibilityVersion();
            }
        },
        
        // Load modern ES6 module version
        loadModernVersion: function() {
            console.log('📦 Loading modern ES6 module version...');
            
            // Load the main module
            var script = document.createElement('script');
            script.type = 'module';
            script.src = 'JS/main.js';
            script.onerror = function() {
                console.warn('⚠️ ES6 modules failed to load, falling back to compatibility version');
                AppLoader.loadCompatibilityVersion();
            };
            document.head.appendChild(script);
        },
        
        // Load compatibility version for older browsers
        loadCompatibilityVersion: function() {
            console.log('🔧 Loading compatibility version...');
            
            // Create module system fallback
            CompatibilityLayer.createModuleFallback();
            
            // Load all modules as regular scripts in dependency order
            this.loadScriptsSequentially([
                'JS/ErrorHandler.js',
                'JS/LazyLoader.js',
                'JS/CacheManager.js',
                'JS/AudioSystem.js',
                'JS/UIController.js',
                'JS/CalculatorModule.js',
                'JS/DragDropHandler.js',
                'JS/TimerManager.js',
                'JS/AnimationEngine.js',
                'JS/DataStorage.js',
                'JS/GameEngine.js',
                'JS/compatibility-main.js' // Compatibility version of main.js
            ]).then(function() {
                console.log('✅ Compatibility version loaded successfully');
                // Initialize the app
                if (window.CalculadoraAppCompat) {
                    window.calculadoraApp = new window.CalculadoraAppCompat();
                    window.calculadoraApp.init();
                }
            }).catch(function(error) {
                console.error('❌ Failed to load compatibility version:', error);
                AppLoader.showLoadError(error);
            });
        },
        
        // Load scripts sequentially
        loadScriptsSequentially: function(scripts) {
            return scripts.reduce(function(promise, script) {
                return promise.then(function() {
                    return AppLoader.loadScript(script);
                });
            }, Promise.resolve());
        },
        
        // Load a single script
        loadScript: function(src) {
            return new Promise(function(resolve, reject) {
                var script = document.createElement('script');
                script.src = src;
                script.onload = function() {
                    console.log('✅ Loaded:', src);
                    resolve();
                };
                script.onerror = function() {
                    console.error('❌ Failed to load:', src);
                    reject(new Error('Failed to load script: ' + src));
                };
                document.head.appendChild(script);
            });
        },
        
        // Show incompatible browser message
        showIncompatibleBrowser: function(browserInfo) {
            console.error('❌ Incompatible browser detected:', browserInfo);
            
            var message = document.createElement('div');
            message.style.cssText = `
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
                z-index: 10000;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                text-align: center;
                padding: 20px;
            `;
            
            message.innerHTML = `
                <div style="max-width: 500px;">
                    <h1 style="font-size: 2.5rem; margin-bottom: 20px;">🌐</h1>
                    <h2 style="font-size: 1.5rem; margin-bottom: 20px;">Navegador No Compatible</h2>
                    <p style="font-size: 1.1rem; margin-bottom: 30px; opacity: 0.9;">
                        Tu navegador (${browserInfo.browser} ${browserInfo.version}) no es compatible con esta aplicación.
                    </p>
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                        <h3 style="margin-bottom: 15px;">Navegadores Recomendados:</h3>
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin: 5px 0;">• Chrome 60+</li>
                            <li style="margin: 5px 0;">• Firefox 55+</li>
                            <li style="margin: 5px 0;">• Safari 11+</li>
                            <li style="margin: 5px 0;">• Edge 79+</li>
                        </ul>
                    </div>
                    <p style="font-size: 0.9rem; opacity: 0.7;">
                        Por favor, actualiza tu navegador o usa uno compatible para acceder a la aplicación.
                    </p>
                </div>
            `;
            
            document.body.appendChild(message);
        },
        
        // Show loading error
        showLoadError: function(error) {
            console.error('❌ Loading error:', error);
            
            var message = document.createElement('div');
            message.style.cssText = `
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
                z-index: 10000;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                text-align: center;
                padding: 20px;
            `;
            
            message.innerHTML = `
                <div style="max-width: 500px;">
                    <h1 style="font-size: 2.5rem; margin-bottom: 20px;">⚠️</h1>
                    <h2 style="font-size: 1.5rem; margin-bottom: 20px;">Error de Carga</h2>
                    <p style="font-size: 1.1rem; margin-bottom: 30px; opacity: 0.9;">
                        No se pudieron cargar los archivos de la aplicación.
                    </p>
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                        <h3 style="margin-bottom: 15px;">Posibles Soluciones:</h3>
                        <ul style="list-style: none; padding: 0; text-align: left;">
                            <li style="margin: 10px 0;">• Usa un servidor HTTP local (no abras el archivo directamente)</li>
                            <li style="margin: 10px 0;">• Verifica tu conexión a internet</li>
                            <li style="margin: 10px 0;">• Recarga la página (F5)</li>
                            <li style="margin: 10px 0;">• Limpia la caché del navegador</li>
                        </ul>
                    </div>
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
                </div>
            `;
            
            document.body.appendChild(message);
        }
    };
    
    // Initialize when DOM is ready
    function initializeApp() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', AppLoader.load);
        } else {
            AppLoader.load();
        }
    }
    
    // Start the loading process
    initializeApp();
    
    // Export for debugging
    window.BrowserDetector = BrowserDetector;
    window.AppLoader = AppLoader;
    
})();