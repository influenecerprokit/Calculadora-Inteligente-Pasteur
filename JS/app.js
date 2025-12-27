/**
 * Calculadora de Gastos - Aplicación Simplificada y Funcional
 * Versión limpia que funciona correctamente
 */

// ===== CONFIGURACIÓN DE DATOS =====
const PRODUCT_DATA = {
    products: [
        { name: 'Detergente para ropa', emoji: '🧴', prices: [0, 2, 6.99, 9.99, 19.99, 29.99] },
        { name: 'Desinfectante de pisos', emoji: '🧹', prices: [0, 2, 6.99, 9.99, 19.99, 29.99] },
        { name: 'Jabón lavaplatos', emoji: '🍽️', prices: [0, 2, 6.99, 9.99, 19.99, 29.99] },
        { name: 'Desengrasante', emoji: '🧽', prices: [0, 2, 6.99, 9.99, 19.99, 29.99] },
        { name: 'Limpiador de cristales', emoji: '🪟', prices: [0, 2, 6.99, 9.99, 19.99, 29.99] },
        { name: 'Shampoo', emoji: '🧴', prices: [0, 2, 6.99, 9.99, 19.99, 29.99] },
        { name: 'Gel de baño', emoji: '🧴', prices: [0, 2, 6.99, 9.99, 19.99, 29.99] },
        { name: 'Jabón en barra corporal', emoji: '🧼', prices: [0, 2, 6.99, 9.99, 19.99, 29.99] },
        { name: 'Jabón especial para el rostro', emoji: '🧴', prices: [0, 2, 6.99, 9.99, 19.99, 29.99] }
    ],
    quantities: [0, 1, 2, 3], // 0 = Ninguno
    waterTypes: [
        { name: 'Agua del grifo', emoji: '🚰', value: 'tap' },
        { name: 'Botellón / Galón', emoji: '🛢️', value: 'gallon' },
        { name: 'Botellas individuales', emoji: '📦', value: 'bottles' },
        { name: 'Agua especial Alcalina', emoji: '💎', value: 'alkaline' }
    ],
    waterFrequencies: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    waterPrices: [4.25, 7.25, 9.25, 12.25, 20]
};

// ===== CLASE PRINCIPAL DE LA APLICACIÓN =====
class CalculadoraApp {
    constructor() {
        this.currentScreen = 'initial-welcome';
        this.gameState = {
            userName: '', // Nombre del usuario
            gender: '', // Género seleccionado: 'hombre', 'mujer', 'familia'
            isPlural: false, // Indica si el nombre es plural (familia o múltiples nombres)
            products: [], // Array de {product, price, quantity, total}
            currentProductIndex: 0,
            monthlyTotal: 0,
            waterType: null,
            waterFrequency: null,
            waterPrice: null,
            waterMonthlyTotal: 0,
            multiplier: 1,
            totalAccumulated: 0,
            yearsMultiplier: 1,
            yearsTotalAccumulated: 0
        };
        this.timers = {};
        this.isPriceScreen = true; // Alterna entre precio y cantidad
        this.speechSynthesis = null; // Para la narración de bienvenida
        this.currentUtterance = null; // Para controlar la lectura actual
        this.isNarrating = false; // Bandera para evitar narraciones duplicadas
        this.rulesNarrationPlayed = false; // Bandera para evitar que se repita la narración de reglas
        this.selectedVoice = null; // Voz seleccionada una sola vez para toda la aplicación
        this.voiceSelectionAttempted = false; // Bandera para saber si ya intentamos seleccionar la voz
        this.reflectivePhrasePlayed = false; // Bandera para que la frase reflexiva se diga solo una vez
        this.yearsAlarmInterval = null; // Intervalo para la alarma repetitiva de años
        this.warningInterval = null; // Intervalo para la advertencia de agua
        this.waterDropInterval = null; // Intervalo para el sonido de gota en pantalla principal
        this.audioContext = null; // AudioContext compartido para sonidos
        this.clockTickCounter = 0; // Contador para alternar tick-tock
    }

    // Inicializar la aplicación
    init() {
        console.log('🎮 Inicializando Calculadora de Gastos...');
        
        // Verificar que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            console.log('⏳ DOM aún cargando, esperando...');
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeApp();
            });
        } else {
            this.initializeApp();
        }
    }
    
    // Inicializar la aplicación (método auxiliar)
    initializeApp() {
        console.log('🔧 Iniciando configuración de la aplicación...');
        
        // Configurar event listeners inmediatamente
        this.setupEventListeners();
        
        // Verificar que la pantalla inicial existe
        const initialScreen = document.querySelector('.screen[data-screen="initial-welcome"]');
        if (initialScreen) {
            console.log('✅ Pantalla inicial encontrada');
        // Mostrar pantalla inicial de bienvenida
        this.showScreen('initial-welcome');
        } else {
            console.error('❌ ERROR: No se encontró la pantalla inicial initial-welcome');
        }
        
        // Verificar que el botón existe
        const welcomeBtn = document.getElementById('initial-welcome-button');
        if (welcomeBtn) {
            console.log('✅ Botón BIENVENIDOS encontrado en el DOM');
        } else {
            console.error('❌ ERROR: No se encontró el botón initial-welcome-button en el DOM');
        }
        
        // Reproducir sonido suave de inicio
        this.playWelcomeSound();
        
        // Configurar activación de audio en primera interacción del usuario
        this.setupAudioActivation();
        
        // Reproducir sonido de agua cuando aparece el logo (después de interacción)
        setTimeout(() => {
            this.setupLogoWaterSound();
        }, 1000);
        
        console.log('✅ Aplicación inicializada');
    }

    // Configurar activación de audio en primera interacción
    setupAudioActivation() {
        // Activar audio en primera interacción del usuario (requerido por navegadores)
        const activateAudio = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('✅ Audio activado por interacción del usuario');
                }).catch(err => {
                    console.error('❌ Error al activar audio:', err);
                });
            }
        };
        
        // Escuchar cualquier interacción del usuario
        document.addEventListener('click', activateAudio, { once: true });
        document.addEventListener('touchstart', activateAudio, { once: true });
        document.addEventListener('keydown', activateAudio, { once: true });
    }

    // Configurar sonido de gota cuando aparece el logo y repetir cada 3 segundos
    setupLogoWaterSound() {
        console.log('💧 Configurando sonido de gota...');
        
        // Limpiar intervalo anterior si existe
        if (this.waterDropInterval) {
            clearInterval(this.waterDropInterval);
            this.waterDropInterval = null;
        }
        
        // Inicializar AudioContext compartido si no existe
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('✅ AudioContext creado para sonido de gota');
            } catch (error) {
                console.error('❌ Error al crear AudioContext:', error);
                return;
            }
        }
        
        // Si el AudioContext está suspendido, intentar reanudarlo
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('✅ AudioContext reanudado');
                this.startWaterDropInterval();
            }).catch(error => {
                console.error('❌ Error al reanudar AudioContext:', error);
            });
        } else {
            this.startWaterDropInterval();
        }
    }

    // Iniciar el intervalo de gotas
    startWaterDropInterval() {
        // Reproducir primera gota después de un pequeño delay
        setTimeout(() => {
            console.log('💧 Reproduciendo primera gota...');
            this.playWaterDropSound();
        }, 500);
        
        // Configurar intervalo para repetir cada 3 segundos
        this.waterDropInterval = setInterval(() => {
            // Solo reproducir si estamos en la pantalla principal
            const initialScreen = document.querySelector('.screen[data-screen="initial-welcome"]');
            if (initialScreen && initialScreen.classList.contains('active')) {
                console.log('💧 Reproduciendo gota (intervalo)...');
                this.playWaterDropSound();
            } else {
                // Si no estamos en la pantalla principal, limpiar el intervalo
                console.log('🔕 Deteniendo intervalo de gota (pantalla cambiada)');
                this.stopWaterDropSound();
            }
        }, 3000); // Cada 3 segundos
        
        console.log('✅ Intervalo de gota iniciado (cada 3 segundos)');
    }

    // Detener el sonido de gota
    stopWaterDropSound() {
        if (this.waterDropInterval) {
            clearInterval(this.waterDropInterval);
            this.waterDropInterval = null;
            console.log('🔕 Sonido de gota detenido');
        }
    }

    // Reproducir sonido suave de gota cayendo
    playWaterDropSound() {
        try {
            // Usar AudioContext compartido o crear uno nuevo
            let audioContext = this.audioContext;
            if (!audioContext || audioContext.state === 'closed') {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.audioContext = audioContext;
            }
            
            // Si está suspendido, intentar reanudarlo
            if (audioContext.state === 'suspended') {
                audioContext.resume().catch(err => {
                    console.error('❌ No se pudo reanudar AudioContext:', err);
                    return;
                });
            }
            
            // Duración más corta para simular una gota
            const duration = 0.35; // Duración corta para una gota
            const baseTime = audioContext.currentTime;
            
            // Crear oscilador para el "plop" de la gota
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            // Conectar oscilador -> ganancia -> salida
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Configurar oscilador para sonido de gota (frecuencia que cae rápidamente)
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, baseTime); // Frecuencia inicial más alta
            oscillator.frequency.exponentialRampToValueAtTime(300, baseTime + 0.08); // Caída rápida
            oscillator.frequency.exponentialRampToValueAtTime(150, baseTime + duration); // Frecuencia final baja
            
            // Configurar volumen suave con fade rápido (como una gota)
            gainNode.gain.setValueAtTime(0, baseTime);
            gainNode.gain.linearRampToValueAtTime(0.15, baseTime + 0.01); // Ataque muy rápido
            gainNode.gain.exponentialRampToValueAtTime(0.001, baseTime + duration); // Decaimiento rápido
            
            // Reproducir
            oscillator.start(baseTime);
            oscillator.stop(baseTime + duration);
            
            console.log('💧 Sonido de gota reproducido');
        } catch (error) {
            console.error('❌ Error al reproducir sonido de gota:', error);
        }
    }

    // Reproducir sonido suave de inicio
    playWelcomeSound() {
        try {
            // Esperar un momento para que el usuario interactúe primero (requerido por algunos navegadores)
            setTimeout(() => {
                try {
                    // Crear contexto de audio
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    
                    // Crear un sonido suave y agradable (tono ascendente tipo "ding")
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    // Configurar el sonido - tono suave ascendente
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // Nota C5
                    oscillator.frequency.exponentialRampToValueAtTime(659.25, audioContext.currentTime + 0.2); // Nota E5
                    
                    // Configurar volumen (muy suave)
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
                    
                    // Reproducir
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.25);
                } catch (error) {
                    // Silenciosamente fallar si el audio no está disponible
                    console.log('Audio no disponible (esto es normal en algunos navegadores)');
                }
            }, 300);
        } catch (error) {
            // Silenciosamente fallar si el audio no está disponible
        }
    }

    // Analizar el nombre del usuario para determinar si es singular o plural
    analyzeUserName(userName) {
        const gender = this.gameState.gender || '';
        const trimmedName = userName ? userName.trim() : '';
        
        // Si se seleccionó "Familia", siempre es plural
        if (gender === 'familia') {
            return {
                isPlural: true,
                displayName: trimmedName || 'Familia',
                greeting: trimmedName ? `¡Hola, ${trimmedName}!` : '¡Hola!',
                treatment: 'ustedes',
                treatmentVerb: 'están',
                treatmentPossessive: 'su',
                treatmentPronoun: 'les',
                gender: 'familia'
            };
        }
        
        // Si no hay nombre ni género, valores por defecto
        if (!trimmedName && !gender) {
            return {
                isPlural: false,
                displayName: '',
                greeting: '¡Hola!',
                treatment: 'tú',
                treatmentVerb: 'estás',
                treatmentPossessive: 'tu',
                treatmentPronoun: 'te',
                gender: ''
            };
        }
        
        // Si hay nombre pero no género, analizar el nombre
        if (trimmedName && !gender) {
            const lowerName = trimmedName.toLowerCase();
            
            // Detectar si contiene "familia" (plural)
            if (lowerName.includes('familia')) {
                return {
                    isPlural: true,
                    displayName: trimmedName,
                    greeting: `¡Hola, ${trimmedName}!`,
                    treatment: 'ustedes',
                    treatmentVerb: 'están',
                    treatmentPossessive: 'su',
                    treatmentPronoun: 'les',
                    gender: 'familia'
                };
            }
            
            // Detectar si contiene "y" (conjunción) entre nombres
            if (lowerName.includes(' y ') || lowerName.includes(' Y ')) {
                return {
                    isPlural: true,
                    displayName: trimmedName,
                    greeting: `¡Hola, ${trimmedName}!`,
                    treatment: 'ustedes',
                    treatmentVerb: 'están',
                    treatmentPossessive: 'su',
                    treatmentPronoun: 'les',
                    gender: 'familia'
                };
            }
        }
        
        // Singular: Hombre o Mujer (o sin género especificado)
        const isMasculine = gender === 'hombre';
        const isFeminine = gender === 'mujer';
        
        return {
            isPlural: false,
            displayName: trimmedName,
            greeting: trimmedName ? `¡Hola, ${trimmedName}!` : '¡Hola!',
            treatment: 'tú',
            treatmentVerb: 'estás',
            treatmentPossessive: 'tu',
            treatmentPronoun: 'te',
            gender: gender || '',
            isMasculine: isMasculine,
            isFeminine: isFeminine,
            // Para textos que requieren concordancia de género
            readyText: isFeminine ? 'lista' : 'listo', // "estás lista" vs "estás listo"
            readyTextPlural: 'listos' // "están listos"
        };
    }

    // Obtener información del nombre del usuario (método helper)
    getUserNameInfo() {
        return this.analyzeUserName(this.gameState.userName);
    }

    // Función centralizada para crear utterances con voz humanizada
    createHumanizedUtterance(text, rate = 0.88, pitch = 1.2) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = rate; // Velocidad más lenta y natural (0.88 es más humanizado que 0.95)
        utterance.pitch = pitch; // Pitch más natural (1.2 es más humanizado que 1.5-1.6)
        utterance.volume = 1.0;
        
        // Usar la voz centralizada
        const spanishVoice = this.selectVoice();
        const voices = speechSynthesis.getVoices();
        
        if (spanishVoice) {
            utterance.voice = spanishVoice;
        } else if (voices.length > 0) {
            utterance.voice = voices[0];
        }
        
        return utterance;
    }

    // Crear utterance con voz masculina humanizada (solo para advertencias)
    createMaleHumanizedUtterance(text, rate = 0.85, pitch = 1.1) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = rate; // Velocidad más lenta para seriedad
        utterance.pitch = pitch; // Pitch más bajo para voz masculina
        utterance.volume = 1.0;
        
        // Seleccionar voz masculina específica
        const maleVoice = this.selectMaleVoice();
        const voices = speechSynthesis.getVoices();
        
        if (maleVoice) {
            utterance.voice = maleVoice;
            console.log('✅ Usando voz masculina para advertencia:', maleVoice.name);
        } else if (voices.length > 0) {
            // Fallback: usar cualquier voz disponible
            utterance.voice = voices[0];
            console.log('⚠️ Usando voz predeterminada (fallback):', voices[0].name);
        }
        
        return utterance;
    }

    // Seleccionar voz masculina específica para advertencias
    selectMaleVoice() {
        const voices = speechSynthesis.getVoices();
        
        if (voices.length === 0) {
            return null;
        }
        
        // ESTRATEGIA 1: Buscar voces masculinas explícitas por nombre
        const explicitMaleVoices = voices.filter(voice => 
            voice.lang.startsWith('es') && (
                voice.name.toLowerCase().includes('hombre') ||
                voice.name.toLowerCase().includes('male') ||
                voice.name.toLowerCase().includes('masculino') ||
                voice.name.toLowerCase().includes('diego') ||
                voice.name.toLowerCase().includes('pablo') ||
                voice.name.toLowerCase().includes('jorge') ||
                voice.name.toLowerCase().includes('carlos') ||
                voice.name.toLowerCase().includes('javier') ||
                voice.name.toLowerCase().includes('david')
            )
        );
        
        if (explicitMaleVoices.length > 0) {
            console.log('✅ Voz masculina explícita encontrada:', explicitMaleVoices[0].name);
            return explicitMaleVoices[0];
        }
        
        // ESTRATEGIA 2: Buscar voces que NO sean femeninas conocidas
        const nonFemaleVoices = voices.filter(voice => 
            voice.lang.startsWith('es') && 
            !voice.name.toLowerCase().includes('mujer') &&
            !voice.name.toLowerCase().includes('female') &&
            !voice.name.toLowerCase().includes('femenina') &&
            !voice.name.toLowerCase().includes('zira') &&
            !voice.name.toLowerCase().includes('helena') &&
            !voice.name.toLowerCase().includes('sabina') &&
            !voice.name.toLowerCase().includes('maria') &&
            !voice.name.toLowerCase().includes('maría')
        );
        
        if (nonFemaleVoices.length > 0) {
            console.log('✅ Voz no-femenina encontrada (probablemente masculina):', nonFemaleVoices[0].name);
            return nonFemaleVoices[0];
        }
        
        // ESTRATEGIA 3: Buscar cualquier voz en español
        const spanishVoices = voices.filter(voice => voice.lang.startsWith('es'));
        if (spanishVoices.length > 0) {
            console.log('⚠️ Usando cualquier voz en español disponible:', spanishVoices[0].name);
            return spanishVoices[0];
        }
        
        // Fallback: primera voz disponible
        if (voices.length > 0) {
            console.log('⚠️ Usando primera voz disponible como fallback:', voices[0].name);
            return voices[0];
        }
        
        return null;
    }

    // Función centralizada para seleccionar la voz UNA VEZ para toda la aplicación
    selectVoice() {
        // Si ya seleccionamos la voz, retornarla
        if (this.selectedVoice !== null) {
            return this.selectedVoice;
        }

                const voices = speechSynthesis.getVoices();
        console.log(`📊 Seleccionando voz para toda la aplicación. Voces disponibles: ${voices.length}`);

        if (voices.length === 0) {
            console.warn('⚠️ No hay voces disponibles aún, se reintentará cuando estén disponibles');
            return null;
        }

        // Marcar que intentamos seleccionar (solo si hay voces disponibles)
        this.voiceSelectionAttempted = true;
                
                let spanishVoice = null;
                    
                    // ESTRATEGIA 1: Buscar voces femeninas explícitas por nombre
                    const explicitFemaleVoices = voices.filter(voice => 
                        voice.lang.startsWith('es') && (
                            voice.name.toLowerCase().includes('mujer') ||
                            voice.name.toLowerCase().includes('female') ||
                            voice.name.toLowerCase().includes('femenina') ||
                voice.name.toLowerCase().includes('zira') ||
                voice.name.toLowerCase().includes('helena') ||
                voice.name.toLowerCase().includes('sabina') ||
                            voice.name.toLowerCase().includes('maria') ||
                            voice.name.toLowerCase().includes('maría') ||
                            voice.name.toLowerCase().includes('sofia') ||
                            voice.name.toLowerCase().includes('sofía') ||
                            voice.name.toLowerCase().includes('lucia') ||
                            voice.name.toLowerCase().includes('lucía')
                        )
                    );
                    
                    if (explicitFemaleVoices.length > 0) {
                        spanishVoice = explicitFemaleVoices[0];
            console.log('✅ Voz femenina explícita seleccionada para toda la app:', spanishVoice.name);
                    } else {
                        // ESTRATEGIA 2: Filtrar voces masculinas y usar las restantes
                        const allSpanishVoices = voices.filter(voice => voice.lang.startsWith('es'));
                        const nonMaleVoices = allSpanishVoices.filter(voice => {
                            const name = voice.name.toLowerCase();
                            return !name.includes('hombre') &&
                                   !name.includes('male') &&
                                   !name.includes('masculino') &&
                                   !name.includes('david') &&
                                   !name.includes('jorge') &&
                                   !name.includes('pablo') &&
                                   !name.includes('carlos') &&
                                   !name.includes('juan') &&
                                   !name.includes('luis') &&
                                   !name.includes('antonio');
                        });
                        
                        if (nonMaleVoices.length > 0) {
                            spanishVoice = nonMaleVoices[0];
                console.log('✅ Voz no masculina seleccionada para toda la app:', spanishVoice.name);
                        } else if (allSpanishVoices.length > 0) {
                            spanishVoice = allSpanishVoices[0];
                console.log('⚠️ Usando voz en español (ajustando pitch para sonar femenina):', spanishVoice.name);
            }
        }

        // Guardar la voz seleccionada
        this.selectedVoice = spanishVoice;
        
        if (this.selectedVoice) {
            console.log('🎯 Voz final seleccionada para toda la aplicación:', this.selectedVoice.name, '| Lang:', this.selectedVoice.lang);
        } else {
            console.warn('⚠️ No se encontró voz en español, se usará voz predeterminada');
        }

        return this.selectedVoice;
    }

    // Iniciar narración de bienvenida con SpeechSynthesis
    startWelcomeNarration() {
        console.log('🎤 Iniciando proceso de narración...');
        
        // Verificar si SpeechSynthesis está disponible
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible en este navegador');
            // Reproducir campanilla de todas formas después de 3 segundos
            setTimeout(() => this.playBellSound(), 3000);
            return;
        }

        console.log('✅ SpeechSynthesis está disponible');

        // Prevenir múltiples llamadas simultáneas
        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            // Detener cualquier narración previa y cancelar todo
            this.stopWelcomeNarration();
            // Esperar un momento para asegurar que todo se canceló
            speechSynthesis.cancel();
            
            // Marcar que estamos narrando
            this.isNarrating = true;

            // Función para iniciar la narración (se llama cuando las voces estén listas)
            const startSpeaking = () => {
                console.log('🗣️ Preparando para hablar...');
                
                // Verificar que speechSynthesis siga disponible
                if (!('speechSynthesis' in window)) {
                    console.error('❌ SpeechSynthesis ya no está disponible');
                    this.playBellSound();
                    return;
                }

                // Crear utterance para "¡Hola!" con voz humanizada
                // Incluir el nombre del usuario si está disponible
                const nameInfo = this.getUserNameInfo();
                const helloUtterance = this.createHumanizedUtterance(nameInfo.greeting, 0.88, 1.25);
                
                // Crear utterance para el texto principal con tratamiento correcto según género y plural
                let mainText;
                if (nameInfo.isPlural) {
                    // Plural: "¿Están listos para descubrir cuánto dinero están gastando..."
                    mainText = `¿Están listos para descubrir cuánto dinero están gastando realmente en productos de limpieza y agua poco saludable? Solo les tomará unos segundos. Presiona: SÍ, QUIERO SABER, y comencemos.`;
                } else {
                    // Singular: usar "lista" para mujer, "listo" para hombre
                    const readyText = nameInfo.readyText || 'listo';
                    mainText = `¿Estás ${readyText} para descubrir cuánto dinero estás gastando realmente en productos de limpieza y agua poco saludable? Solo te tomará unos segundos. Presiona: SÍ, QUIERO SABER, y comencemos.`;
                }
                const utterance = this.createHumanizedUtterance(mainText, 0.88, 1.2);
                
                console.log('✅ Usando voz humanizada con parámetros: rate=0.88, pitch=1.2-1.25');

                // Guardar referencia para poder detenerla
                this.currentUtterance = helloUtterance;

                // Evento cuando termine "¡Hola!"
                helloUtterance.onend = () => {
                    console.log('✅ "¡Hola!" completado, esperando 1 segundo en silencio...');
                    // Pausa de 1 segundo en silencio después de "¡Hola!"
                    setTimeout(() => {
                        // Verificar que no se haya cancelado
                        if (this.isNarrating) {
                            // Continuar con el texto principal
                            this.currentUtterance = utterance;
                            speechSynthesis.speak(utterance);
                            console.log('🎤 Continuando con texto principal...');
                        }
                    }, 1000);
                };

                // Evento cuando termine el texto principal
                utterance.onend = () => {
                    console.log('✅ Narración de bienvenida completada');
                    this.currentUtterance = null;
                    this.isNarrating = false; // Permitir nuevas narraciones
                    // Reproducir sonido de campanilla al finalizar
                    this.playBellSound();
                };

                // Evento de error para "¡Hola!"
                helloUtterance.onerror = (event) => {
                    console.error('❌ Error en "¡Hola!":', event.error);
                    // Continuar con el texto principal de todas formas
                    setTimeout(() => {
                        this.currentUtterance = utterance;
                        speechSynthesis.speak(utterance);
                    }, 1000);
                };

                // Evento de error para texto principal
                utterance.onerror = (event) => {
                    console.error('❌ Error en la narración:', event.error, '| Tipo:', event.type);
                    this.currentUtterance = null;
                    // Reproducir campanilla de todas formas
                    this.playBellSound();
                };

                // Evento cuando comienza a hablar "¡Hola!"
                helloUtterance.onstart = () => {
                    console.log('🔊 "¡Hola!" iniciado correctamente');
                };

                // Evento cuando comienza el texto principal
                utterance.onstart = () => {
                    console.log('🔊 Texto principal iniciado correctamente');
                };

                // Intentar iniciar la narración con "¡Hola!" primero (solo una vez)
                try {
                    // Asegurarse de que no haya nada hablando antes de iniciar
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        // Esperar un momento antes de iniciar
                        setTimeout(() => {
                            speechSynthesis.speak(helloUtterance);
                            console.log('🎤 Comando speak() ejecutado para "¡Hola!" (después de cancelar)');
                        }, 100);
                    } else {
                        speechSynthesis.speak(helloUtterance);
                        console.log('🎤 Comando speak() ejecutado para "¡Hola!"');
                    }
                    
                    // Verificar si realmente está hablando después de un momento
                    setTimeout(() => {
                        if (speechSynthesis.speaking) {
                            console.log('✅ SpeechSynthesis está hablando "¡Hola!"');
                        } else {
                            console.warn('⚠️ SpeechSynthesis no está hablando, puede requerir interacción del usuario');
                            this.isNarrating = false;
                            // Reproducir campanilla como fallback
                            this.playBellSound();
                        }
                    }, 500);
                } catch (speakError) {
                    console.error('❌ Error al ejecutar speak():', speakError);
                    this.isNarrating = false;
                    this.playBellSound();
                }
            };

            // Verificar si las voces ya están cargadas
            // NOTA: Ya esperamos 3 segundos en init(), así que iniciamos inmediatamente aquí
            const voices = speechSynthesis.getVoices();
            console.log(`📊 Voces iniciales: ${voices.length}`);
            
            if (voices.length > 0) {
                // Las voces ya están disponibles - iniciar inmediatamente
                console.log('✅ Voces disponibles, iniciando narración inmediatamente');
                startSpeaking();
            } else {
                console.log('⏳ Esperando a que las voces se carguen...');
                // Esperar a que las voces se carguen
                speechSynthesis.onvoiceschanged = () => {
                    const loadedVoices = speechSynthesis.getVoices();
                    console.log(`📊 Voces cargadas: ${loadedVoices.length}`);
                    // Iniciar inmediatamente después de cargar las voces
                    startSpeaking();
                };
                // Timeout de seguridad por si onvoiceschanged no se dispara
                setTimeout(() => {
                    const loadedVoices = speechSynthesis.getVoices();
                    if (loadedVoices.length > 0) {
                        console.log('✅ Timeout de seguridad: voces encontradas, iniciando...');
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces, intentando de todas formas...');
                        // Intentar de todas formas
                        startSpeaking();
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error al iniciar la narración:', error);
            // Reproducir campanilla de todas formas después de 3 segundos
            setTimeout(() => this.playBellSound(), 3000);
        }
    }

    // Detener la narración de bienvenida
    stopWelcomeNarration() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            this.currentUtterance = null;
            this.isNarrating = false; // Resetear bandera
            console.log('🛑 Narración detenida');
        }
    }

    // Iniciar narración de reglas con voz femenina
    startRulesNarration() {
        console.log('🎤 Iniciando proceso de narración de reglas...');
        
        // Verificar si SpeechSynthesis está disponible
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible en este navegador');
            return;
        }

        // Prevenir múltiples llamadas
        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        // Marcar que ya se reprodujo para que no se repita
        this.rulesNarrationPlayed = true;

        try {
            // Detener cualquier narración previa
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
            
            // Marcar que estamos narrando
            this.isNarrating = true;

            // Función para iniciar la narración (se llama cuando las voces estén listas)
            const startSpeaking = () => {
                console.log('🗣️ Preparando para hablar (reglas)...');
                
                // Verificar que speechSynthesis siga disponible
                if (!('speechSynthesis' in window)) {
                    console.error('❌ SpeechSynthesis ya no está disponible');
                    this.isNarrating = false;
                    return;
                }

                // Texto completo a leer con lógica de género y plural
                const nameInfo = this.getUserNameInfo();
                let rulesText;
                if (nameInfo.isPlural) {
                    rulesText = `El reto comienza. Tendrán 15 segundos para elegir el precio aproximado de los productos que usan actualmente. Recuerda: No tiene que ser exacto. Solo elijan la opción que más se acerque a su realidad. ¿Preparados? Empecemos.`;
                } else {
                    // Aplicar género: "Preparada" para mujer, "Preparado" para hombre
                    const preparedText = nameInfo.isFeminine ? 'Preparada' : 'Preparado';
                    rulesText = `El reto comienza. Tendrás 15 segundos para elegir el precio aproximado de los productos que usas actualmente. Recuerda: No tiene que ser exacto. Solo elige la opción que más se acerque a tu realidad. ¿${preparedText}? Empecemos.`;
                }
                
                // Crear utterance con voz humanizada
                const utterance = this.createHumanizedUtterance(rulesText, 0.88, 1.2);

                // Guardar referencia
                this.currentUtterance = utterance;

                // Evento cuando termine la lectura
                utterance.onend = () => {
                    console.log('✅ Narración de reglas completada');
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                // Evento de error
                utterance.onerror = (event) => {
                    console.error('❌ Error en la narración de reglas:', event.error);
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                // Evento cuando comienza
                utterance.onstart = () => {
                    console.log('🔊 Narración de reglas iniciada correctamente');
                };

                // Iniciar la narración
                try {
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        setTimeout(() => {
                            speechSynthesis.speak(utterance);
                            console.log('🎤 Comando speak() ejecutado para reglas (después de cancelar)');
                        }, 100);
                    } else {
                        speechSynthesis.speak(utterance);
                        console.log('🎤 Comando speak() ejecutado para reglas');
                    }
                } catch (speakError) {
                    console.error('❌ Error al ejecutar speak() para reglas:', speakError);
                    this.isNarrating = false;
                }
            };

            // Verificar si las voces ya están cargadas
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                startSpeaking();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                };
                setTimeout(() => {
                    if (speechSynthesis.getVoices().length > 0) {
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces para reglas');
                        this.isNarrating = false;
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error al iniciar la narración de reglas:', error);
            this.isNarrating = false;
            this.rulesNarrationPlayed = false; // Permitir reintentar
        }
    }

    // Reproducir sonido de campanilla (ding)
    playBellSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Crear sonido de campanilla (ding) - tono claro y agradable
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Tono de campanilla (nota alta y clara)
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
            oscillator.frequency.exponentialRampToValueAtTime(1108.73, audioContext.currentTime + 0.15); // C#6
            
            // Volumen con fade out suave
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            
            console.log('🔔 Sonido de campanilla reproducido');
        } catch (error) {
            console.log('⚠️ No se pudo reproducir el sonido de campanilla:', error);
        }
    }

    // Función auxiliar para manejar eventos táctiles y clics de forma unificada
    addUniversalButtonListener(element, handler) {
        if (!element) return;
        
        // Handler unificado que previene doble ejecución
        let isHandling = false;
        const unifiedHandler = (e) => {
            if (isHandling) return;
            isHandling = true;
            
            e.preventDefault();
            e.stopPropagation();
            handler(e);
            
            // Reset después de un breve delay
            setTimeout(() => {
                isHandling = false;
            }, 300);
        };
        
        // Agregar ambos listeners
        element.addEventListener('click', unifiedHandler, { passive: false });
        element.addEventListener('touchend', unifiedHandler, { passive: false });
    }

    // Configurar event listeners
    setupEventListeners() {
        // Configurar botones de retroceso (back-button con data-back-to)
        document.addEventListener('click', (e) => {
            const backButton = e.target.closest('.back-button');
            if (backButton && backButton.dataset.backTo) {
                e.preventDefault();
                e.stopPropagation();
                const targetScreen = backButton.dataset.backTo;
                console.log(`⬅️ Botón de retroceso presionado, volviendo a: ${targetScreen}`);
                this.transitionToScreen(targetScreen);
            }
        });

        // También agregar listener táctil para botones de retroceso
        document.addEventListener('touchend', (e) => {
            const backButton = e.target.closest('.back-button');
            if (backButton && backButton.dataset.backTo) {
                e.preventDefault();
                e.stopPropagation();
                const targetScreen = backButton.dataset.backTo;
                console.log(`⬅️ Botón de retroceso presionado (táctil), volviendo a: ${targetScreen}`);
                this.transitionToScreen(targetScreen);
            }
        });

        // Función para manejar el clic en el botón de bienvenidos (usar arrow function para mantener 'this')
        const handleWelcomeButtonClick = (e) => {
            try {
                console.log('🖱️ Botón BIENVENIDOS presionado - INICIANDO TRANSICIÓN');
                e.preventDefault();
                e.stopPropagation();
                
                // Verificar que 'this' esté disponible
                if (!this || !this.gameState) {
                    console.error('❌ ERROR: Contexto perdido en handleWelcomeButtonClick');
                    // Intentar recuperar el contexto desde window.app
                    if (window.app && window.app.gameState) {
                        console.log('🔄 Recuperando contexto desde window.app');
                        window.app.transitionToScreen('welcome');
                        return;
                    } else {
                        alert('Error: No se pudo avanzar. Por favor, recarga la página.');
                        return;
                    }
                }
                
                // Obtener el nombre del usuario del input
                const nameInput = document.getElementById('user-name-input');
                if (nameInput) {
                    const userName = nameInput.value.trim();
                    this.gameState.userName = userName || '';
                }
                
                // Obtener el género seleccionado
                const selectedGender = document.querySelector('.gender-option.selected');
                if (selectedGender) {
                    this.gameState.gender = selectedGender.dataset.gender || '';
                    console.log(`✅ Género seleccionado: ${this.gameState.gender}`);
                } else {
                    // Si no se seleccionó género, usar el nombre para determinar
                    console.warn('⚠️ No se seleccionó género, analizando desde el nombre');
                }
                
                // Analizar el nombre y género para determinar tratamiento
                try {
                    if (typeof this.analyzeUserName === 'function') {
                        const nameInfo = this.analyzeUserName(this.gameState.userName);
                        this.gameState.isPlural = nameInfo && nameInfo.isPlural ? true : false;
                        this.updateUserNameDisplay();
                        console.log(`✅ Nombre: ${this.gameState.userName} | Género: ${this.gameState.gender} | Plural: ${this.gameState.isPlural}`);
                    } else {
                        console.warn('⚠️ analyzeUserName no está disponible, usando valor por defecto');
                        this.gameState.isPlural = false;
                    }
                } catch (nameError) {
                    console.error('❌ Error al analizar el nombre:', nameError);
                    console.error('Stack:', nameError.stack);
                    // Continuar sin análisis si hay error
                    this.gameState.isPlural = false;
                    try {
                        this.updateUserNameDisplay();
                    } catch (displayError) {
                        console.error('❌ Error al actualizar display:', displayError);
                    }
                }
                
                // Ir a la segunda pantalla de bienvenida
                console.log('🔄 Llamando a transitionToScreen("welcome")...');
                console.log('🔍 Estado antes de transición:', {
                    currentScreen: this.currentScreen,
                    userName: this.gameState.userName
                });
                
                // Verificar que transitionToScreen existe
                if (typeof this.transitionToScreen === 'function') {
                this.transitionToScreen('welcome');
                    console.log('✅ transitionToScreen("welcome") ejecutado sin errores');
                } else {
                    console.error('❌ transitionToScreen no es una función');
                    // Intentar método alternativo
                    if (typeof this.showScreen === 'function') {
                        console.log('🔄 Usando showScreen como alternativa...');
                        this.showScreen('welcome');
                    } else {
                        throw new Error('Ni transitionToScreen ni showScreen están disponibles');
                    }
                }
            } catch (error) {
                console.error('❌ ERROR en handleWelcomeButtonClick:', error);
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                console.error('Stack trace:', error.stack);
                
                // Intentar método alternativo usando window.app
                try {
                    console.log('🔄 Intentando método alternativo con window.app...');
                    if (window.app && typeof window.app.transitionToScreen === 'function') {
                        window.app.transitionToScreen('welcome');
                    } else if (window.app && typeof window.app.showScreen === 'function') {
                        window.app.showScreen('welcome');
                    } else {
                        throw new Error('window.app no está disponible');
                    }
                } catch (fallbackError) {
                    console.error('❌ ERROR en método alternativo:', fallbackError);
                    alert('Error al avanzar. Por favor, recarga la página e inténtalo de nuevo.\n\nError: ' + error.message);
                }
            }
        };

        // Función auxiliar para configurar el botón
        const setupWelcomeButton = () => {
            const initialWelcomeBtn = document.getElementById('initial-welcome-button');
            if (initialWelcomeBtn) {
                console.log('✅ Botón initial-welcome-button encontrado en el DOM');
                
                // Limpiar cualquier listener previo
                const newBtn = initialWelcomeBtn.cloneNode(true);
                initialWelcomeBtn.parentNode.replaceChild(newBtn, initialWelcomeBtn);
                
                // Agregar listeners al nuevo botón
                newBtn.addEventListener('click', handleWelcomeButtonClick, { capture: false, passive: false });
                newBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleWelcomeButtonClick(e);
                }, { capture: false, passive: false });
                
                // Hacer el botón accesible para testing
                window.testWelcomeButton = () => {
                    console.log('🧪 Test: Simulando clic en botón BIENVENIDOS');
                    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
                    newBtn.dispatchEvent(event);
                };
                
                console.log('✅ Listeners agregados al botón inicial de bienvenida');
                return true;
            } else {
                console.error('❌ ERROR: No se encontró el botón initial-welcome-button');
                return false;
            }
        };

        // Intentar configurar inmediatamente
        if (!setupWelcomeButton()) {
            // Si no se encuentra, intentar después de un breve delay
            setTimeout(() => {
                if (!setupWelcomeButton()) {
                    console.error('❌ ERROR CRÍTICO: No se pudo encontrar el botón después de múltiples intentos');
                }
            }, 200);
        }
        
        // Configurar botones de género
        const setupGenderButtons = () => {
            const genderButtons = document.querySelectorAll('.gender-option');
            if (genderButtons.length === 0) {
                console.warn('⚠️ No se encontraron botones de género');
                return false;
            }
            
            genderButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Remover selección de todos los botones
                    genderButtons.forEach(btn => btn.classList.remove('selected'));
                    
                    // Agregar selección al botón clickeado
                    button.classList.add('selected');
                    
                    console.log(`✅ Género seleccionado: ${button.dataset.gender}`);
                });
                
                // Soporte táctil
                button.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                    
                    genderButtons.forEach(btn => btn.classList.remove('selected'));
                    button.classList.add('selected');
                    
                    console.log(`✅ Género seleccionado (táctil): ${button.dataset.gender}`);
                });
            });
            
            console.log('✅ Botones de género configurados');
            return true;
        };
        
        // Configurar botones de género
        setupGenderButtons();
        
        // También agregar delegación de eventos como respaldo adicional (con prioridad alta)
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target && (target.id === 'initial-welcome-button' || target.closest('#initial-welcome-button'))) {
                console.log('🔄 Botón detectado por delegación de eventos');
                handleWelcomeButtonClick(e);
            }
        }, { capture: true, passive: false });

        // Botón comenzar (pantalla 2) - usar delegación de eventos para mayor confiabilidad
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'start-button') {
                console.log('🖱️ Botón comenzar presionado');
                e.preventDefault();
                e.stopPropagation();
                // Detener narración si está activa
                this.stopWelcomeNarration();
                this.startGame();
            }
        });
        
        // También agregar listener directo como respaldo
        const startBtn = document.getElementById('start-button');
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                console.log('🖱️ Botón comenzar presionado (listener directo)');
                e.preventDefault();
                e.stopPropagation();
                // Detener narración si está activa
                this.stopWelcomeNarration();
                this.startGame();
            });
            
            // Soporte para gestos táctiles en el botón
            startBtn.addEventListener('touchend', (e) => {
                console.log('👆 Botón comenzar presionado (táctil)');
                e.preventDefault();
                e.stopPropagation();
                // Detener narración si está activa
                this.stopWelcomeNarration();
                this.startGame();
            });
            
            console.log('✅ Listener agregado al botón comenzar');
        } else {
            console.warn('⚠️ Botón start-button no encontrado, usando delegación de eventos');
        }

        // Botón entendido (reglas)
        // Botón de reglas
        const rulesBtn = document.getElementById('rules-continue');
        if (rulesBtn) {
            rulesBtn.addEventListener('click', () => {
                console.log('➡️ Botón continuar de reglas presionado, avanzando a pantalla de countdown');
                this.nextScreen();
            });
            // Soporte táctil
            rulesBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón continuar de reglas presionado (táctil), avanzando a pantalla de countdown');
                this.nextScreen();
            });
        }

        // Botones de validación (ambos llevan al mismo cierre)
        const validationYes = document.getElementById('validation-yes');
        const validationNo = document.getElementById('validation-no');
        if (validationYes) {
            validationYes.addEventListener('click', () => this.handleValidation(true));
            validationYes.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleValidation(true);
            });
        }
        if (validationNo) {
            validationNo.addEventListener('click', () => this.handleValidation(false));
            validationNo.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleValidation(false);
            });
        }

        // Botón premio
        const prizeBtn = document.getElementById('prize-continue');
        if (prizeBtn) {
            prizeBtn.addEventListener('click', () => {
                console.log('➡️ Botón "Quiero mejorar mi agua" presionado, mostrando pantalla de especialista');
                this.transitionToScreen('specialist');
            });
            // Soporte táctil
            prizeBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón "Quiero mejorar mi agua" presionado (táctil), mostrando pantalla de especialista');
                this.transitionToScreen('specialist');
            });
        }

        // Botón ver resumen
        const viewSummaryBtn = document.getElementById('view-summary-button');
        if (viewSummaryBtn) {
            viewSummaryBtn.addEventListener('click', () => {
                console.log('➡️ Botón "Ver Resumen de Gastos" presionado');
                this.transitionToScreen('summary');
            });
            viewSummaryBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón "Ver Resumen de Gastos" presionado (táctil)');
                this.transitionToScreen('summary');
            });
        }

        // Botón descargar PDF
        const downloadPdfBtn = document.getElementById('download-pdf-button');
        if (downloadPdfBtn) {
            console.log('✅ Botón de descarga PDF encontrado y configurado');
            downloadPdfBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón "Descargar PDF" presionado');
                this.downloadSummaryPDF();
            });
            downloadPdfBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón "Descargar PDF" presionado (táctil)');
                this.downloadSummaryPDF();
            });
        } else {
            console.warn('⚠️ Botón de descarga PDF no encontrado');
        }

        // Botones de beneficios (Ahorro, Salud, Tranquilidad)
        const benefitAhorro = document.getElementById('benefit-ahorro');
        const benefitSalud = document.getElementById('benefit-salud');
        const benefitTranquilidad = document.getElementById('benefit-tranquilidad');

        if (benefitAhorro) {
            benefitAhorro.addEventListener('click', () => {
                console.log('➡️ Botón Ahorro presionado, mostrando detalle');
                this.transitionToScreen('benefit-ahorro');
            });
            benefitAhorro.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón Ahorro presionado (táctil), mostrando detalle');
                this.transitionToScreen('benefit-ahorro');
            });
        }

        if (benefitSalud) {
            benefitSalud.addEventListener('click', () => {
                console.log('➡️ Botón Salud presionado, mostrando detalle');
                this.transitionToScreen('benefit-salud');
            });
            benefitSalud.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón Salud presionado (táctil), mostrando detalle');
                this.transitionToScreen('benefit-salud');
            });
        }

        if (benefitTranquilidad) {
            benefitTranquilidad.addEventListener('click', () => {
                console.log('➡️ Botón Tranquilidad presionado, mostrando detalle');
                this.transitionToScreen('benefit-tranquilidad');
            });
            benefitTranquilidad.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón Tranquilidad presionado (táctil), mostrando detalle');
                this.transitionToScreen('benefit-tranquilidad');
            });
        }

        // Botones de regreso desde detalles de beneficios
        const benefitAhorroBack = document.getElementById('benefit-ahorro-back');
        const benefitSaludBack = document.getElementById('benefit-salud-back');
        const benefitTranquilidadBack = document.getElementById('benefit-tranquilidad-back');

        if (benefitAhorroBack) {
            benefitAhorroBack.addEventListener('click', () => {
                console.log('➡️ Botón Felicidades de Ahorro presionado, volviendo a pantalla de premio');
                this.transitionToScreen('prize');
            });
            benefitAhorroBack.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón Felicidades de Ahorro presionado (táctil), volviendo a pantalla de premio');
                this.transitionToScreen('prize');
            });
        }

        if (benefitSaludBack) {
            benefitSaludBack.addEventListener('click', () => {
                console.log('➡️ Botón Felicidades de Salud presionado, volviendo a pantalla de premio');
                this.transitionToScreen('prize');
            });
            benefitSaludBack.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón Felicidades de Salud presionado (táctil), volviendo a pantalla de premio');
                this.transitionToScreen('prize');
            });
        }

        if (benefitTranquilidadBack) {
            benefitTranquilidadBack.addEventListener('click', () => {
                console.log('➡️ Botón Felicidades de Tranquilidad presionado, volviendo a pantalla de premio');
                this.transitionToScreen('prize');
            });
            benefitTranquilidadBack.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón Felicidades de Tranquilidad presionado (táctil), volviendo a pantalla de premio');
                this.transitionToScreen('prize');
            });
        }

        // Botón multiplicador de meses
        const multiplierBtn = document.getElementById('multiplier-continue');
        if (multiplierBtn) {
            multiplierBtn.addEventListener('click', () => {
                console.log('➡️ Botón continuar de multiplicador de meses presionado, avanzando a pantalla de multiplicador de años');
                this.transitionToScreen('years-multiplier');
            });
            // Soporte táctil
            multiplierBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón continuar de multiplicador de meses presionado (táctil), avanzando a pantalla de multiplicador de años');
                this.transitionToScreen('years-multiplier');
            });
        }

        // Botón multiplicador de años
        const yearsMultiplierBtn = document.getElementById('years-multiplier-continue');
        if (yearsMultiplierBtn) {
            yearsMultiplierBtn.addEventListener('click', () => {
                console.log('➡️ Botón continuar de multiplicador de años presionado, avanzando a pantalla de resultado de años');
                this.transitionToScreen('years-result');
            });
            // Soporte táctil
            yearsMultiplierBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                console.log('➡️ Botón continuar de multiplicador de años presionado (táctil), avanzando a pantalla de resultado de años');
                this.transitionToScreen('years-result');
            });
        }

        // Botón continuar de resultado de años
        const yearsResultContinueBtn = document.getElementById('years-result-continue-button');
        if (yearsResultContinueBtn) {
            yearsResultContinueBtn.addEventListener('click', () => {
                console.log('➡️ Botón continuar de resultado de años presionado, avanzando a pantalla de validación');
                // Detener alarma repetitiva antes de avanzar
                this.stopYearsRepeatingAlarm();
                this.nextScreen();
            });
            // Soporte táctil
            yearsResultContinueBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón continuar de resultado de años presionado (táctil), avanzando a pantalla de validación');
                // Detener alarma repetitiva antes de avanzar
                this.stopYearsRepeatingAlarm();
                this.nextScreen();
            });
        }

        // Botón continuar de productos de limpieza
        const cleaningContinueBtn = document.getElementById('cleaning-continue-button');
        if (cleaningContinueBtn) {
            cleaningContinueBtn.addEventListener('click', () => {
                console.log('➡️ Botón continuar de limpieza presionado, avanzando a pantalla de agua');
                this.nextScreen();
            });
            // Soporte táctil
            cleaningContinueBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón continuar de limpieza presionado (táctil), avanzando a pantalla de agua');
                this.nextScreen();
            });
        }

        // Botón continuar de agua
        const waterContinueBtn = document.getElementById('water-continue-button');
        if (waterContinueBtn) {
            waterContinueBtn.addEventListener('click', () => {
                console.log('➡️ Botón continuar de agua presionado, avanzando a pantalla de resultados');
                this.nextScreen();
            });
            // Soporte táctil
            waterContinueBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                console.log('➡️ Botón continuar de agua presionado (táctil), avanzando a pantalla de resultados');
                this.nextScreen();
            });
        }

        // Botón continuar de advertencia de agua
        const warningContinueBtn = document.getElementById('warning-continue-button');
        if (warningContinueBtn) {
            warningContinueBtn.addEventListener('click', () => {
                console.log('➡️ Botón continuar de advertencia presionado, avanzando a pantalla de simulación');
                // Limpiar intervalo si existe
                if (this.warningInterval) {
                    clearInterval(this.warningInterval);
                }
                this.transitionToScreen('water-simulation');
            });
            // Soporte táctil
            warningContinueBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón continuar de advertencia presionado (táctil), avanzando a pantalla de simulación');
                // Limpiar intervalo si existe
                if (this.warningInterval) {
                    clearInterval(this.warningInterval);
                }
                this.transitionToScreen('water-simulation');
            });
        }

        // Botón de simulación de agua
        const waterSimulationBtn = document.getElementById('water-simulation-button');
        if (waterSimulationBtn) {
            waterSimulationBtn.addEventListener('click', () => {
                console.log('➡️ Botón adelante de simulación presionado, avanzando a pantalla de frecuencia');
                this.transitionToScreen('water-frequency');
            });
            // Soporte táctil
            waterSimulationBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón adelante de simulación presionado (táctil), avanzando a pantalla de frecuencia');
                this.transitionToScreen('water-frequency');
            });
        }

        // Botón continuar de resultados generales
        const resultsContinueBtn = document.getElementById('results-continue-button');
        if (resultsContinueBtn) {
            resultsContinueBtn.addEventListener('click', () => {
                console.log('➡️ Botón continuar de resultados generales presionado, avanzando a pantalla de multiplicador');
                this.nextScreen();
            });
            // Soporte táctil
            resultsContinueBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón continuar de resultados generales presionado (táctil), avanzando a pantalla de multiplicador');
                this.nextScreen();
            });
        }
    }

    // Iniciar el juego
    startGame() {
        console.log('🎮 Iniciando juego...');
        
        // Resetear estado del juego (preservar userName)
        const savedUserName = this.gameState.userName || '';
        const savedIsPlural = this.gameState.isPlural || false;
        this.gameState = {
            userName: savedUserName, // Preservar el nombre del usuario
            isPlural: savedIsPlural, // Preservar si es plural
            products: [],
            currentProductIndex: 0,
            monthlyTotal: 0,
            currentProductData: null,
            waterType: null,
            waterFrequency: null,
            waterPrice: null,
            waterMonthlyTotal: 0,
            multiplier: 1,
            totalAccumulated: 0,
            yearsMultiplier: 1,
            yearsTotalAccumulated: 0
        };
        
        // Resetear timers
        Object.keys(this.timers).forEach(key => {
            this.stopTimer(key);
        });
        
        // Resetear banderas de narración
        this.rulesNarrationPlayed = false;
        this.reflectivePhrasePlayed = false; // Resetear frase reflexiva para nueva sesión
        
        console.log('🔄 Estado del juego reseteado:', this.gameState);
        
        // Navegar directamente a la pantalla de reglas
        this.transitionToScreen('rules');
    }

    // Ir a la siguiente pantalla
    nextScreen() {
        console.log(`📱 nextScreen() llamado desde: ${this.currentScreen}`);
        // Flujo dinámico basado en el estado actual
        if (this.currentScreen === 'welcome') {
            console.log('➡️ Navegando a: rules');
            this.transitionToScreen('rules');
        } else if (this.currentScreen === 'rules') {
            console.log('➡️ Navegando a: countdown');
            this.transitionToScreen('countdown');
        } else if (this.currentScreen === 'countdown') {
            console.log('➡️ Navegando a: price');
            this.transitionToScreen('price');
        } else if (this.currentScreen === 'price') {
            console.log('➡️ Navegando a: quantity');
            this.transitionToScreen('quantity');
        } else if (this.currentScreen === 'quantity') {
            // Verificar si hay más productos
            this.gameState.currentProductIndex++;
            console.log(`📦 Producto actual: ${this.gameState.currentProductIndex} de ${PRODUCT_DATA.products.length}`);
            if (this.gameState.currentProductIndex < PRODUCT_DATA.products.length) {
                console.log('➡️ Navegando a: price (siguiente producto)');
                this.transitionToScreen('price');
            } else {
                console.log('➡️ Navegando a: cleaning-result (todos los productos completados)');
                this.transitionToScreen('cleaning-result');
            }
        } else if (this.currentScreen === 'cleaning-result') {
            console.log('➡️ Navegando a: water-type');
            this.transitionToScreen('water-type');
        } else if (this.currentScreen === 'water-type') {
            // Esto no debería ocurrir directamente, pero por si acaso
            console.log('➡️ Navegando a: results');
            this.transitionToScreen('results');
        } else if (this.currentScreen === 'water-warning') {
            console.log('➡️ Navegando a: water-frequency');
            this.transitionToScreen('water-frequency');
        } else if (this.currentScreen === 'water-frequency') {
            console.log('➡️ Navegando a: water-price');
            this.transitionToScreen('water-price');
        } else if (this.currentScreen === 'water-price') {
            console.log('➡️ Navegando a: water-result');
            this.transitionToScreen('water-result');
        } else if (this.currentScreen === 'water-result') {
            console.log('➡️ Navegando a: results');
            this.transitionToScreen('results');
        } else if (this.currentScreen === 'results') {
            console.log('➡️ Navegando a: multiplier');
            this.transitionToScreen('multiplier');
        } else if (this.currentScreen === 'years-result') {
            console.log('➡️ Navegando a: validation');
            this.transitionToScreen('validation');
        } else if (this.currentScreen === 'validation') {
            console.log('➡️ Navegando a: analysis');
            this.transitionToScreen('analysis');
        } else if (this.currentScreen === 'analysis') {
            console.log('➡️ Navegando a: prize');
            this.transitionToScreen('prize');
        } else {
            console.warn(`⚠️ Pantalla desconocida: ${this.currentScreen}`);
        }
    }

    // Transición entre pantallas
    transitionToScreen(screenName) {
        console.log(`🔄 Transición INICIADA: ${this.currentScreen} → ${screenName}`);
        
        // Asegurar que el loading overlay no esté bloqueando
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay && !loadingOverlay.classList.contains('hidden')) {
            console.log('⚠️ Loading overlay visible, ocultándolo...');
            loadingOverlay.classList.add('hidden');
        }
        
        // Si salimos de la pantalla de resultado de años, detener la alarma repetitiva
        if (this.currentScreen === 'years-result' && screenName !== 'years-result') {
            this.stopYearsRepeatingAlarm();
        }
        
        // Si salimos de la pantalla principal, detener el sonido de gota
        if (this.currentScreen === 'initial-welcome' && screenName !== 'initial-welcome') {
            this.stopWaterDropSound();
        }
        
        // Si entramos a la pantalla principal, iniciar el sonido de gota
        if (screenName === 'initial-welcome' && this.currentScreen !== 'initial-welcome') {
            this.setupLogoWaterSound();
        }
        
        // Ocultar todas las pantallas primero
        const allScreens = document.querySelectorAll('.screen');
        console.log(`📺 Pantallas encontradas: ${allScreens.length}`);
        allScreens.forEach(screen => {
            screen.classList.remove('active');
            console.log(`  - Ocultando pantalla: ${screen.getAttribute('data-screen') || 'sin data-screen'}`);
        });

        // Mostrar nueva pantalla
        const newScreenEl = document.querySelector(`.screen[data-screen="${screenName}"]`);
        console.log(`🔍 Buscando pantalla con data-screen="${screenName}"`);
        
        if (newScreenEl) {
            console.log(`✅ Pantalla encontrada: ${screenName}`);
            console.log(`  - ID: ${newScreenEl.id || 'sin ID'}`);
            console.log(`  - Clases antes: ${newScreenEl.className}`);
            
            newScreenEl.classList.add('active');
            this.currentScreen = screenName;
            
            console.log(`  - Clases después: ${newScreenEl.className}`);
            console.log(`📱 currentScreen actualizado a: ${this.currentScreen}`);
            
            // Verificar que la pantalla esté visible
            const isVisible = newScreenEl.classList.contains('active') && 
                             window.getComputedStyle(newScreenEl).opacity !== '0';
            console.log(`  - ¿Pantalla visible?: ${isVisible}`);
            
            // Actualizar nombre de usuario si existe
            this.updateUserNameDisplay();
            
            // Ejecutar lógica específica de la pantalla
            this.handleScreenEnter(screenName);
            console.log(`✅ Pantalla ${screenName} activada correctamente`);
        } else {
            console.error(`❌ No se encontró la pantalla: ${screenName}`);
            // Listar todas las pantallas disponibles para debugging
            const allAvailableScreens = document.querySelectorAll('.screen');
            console.log('📋 Pantallas disponibles:');
            allAvailableScreens.forEach(screen => {
                const screenNameAttr = screen.getAttribute('data-screen');
                const screenId = screen.id || 'sin ID';
                console.log(`  - data-screen: "${screenNameAttr || '(sin data-screen)'}" | ID: ${screenId}`);
            });
        }
    }

    // Mostrar pantalla (método simple)
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const target = document.querySelector(`.screen[data-screen="${screenName}"]`);
        if (target) {
            target.classList.add('active');
            this.currentScreen = screenName;
            // Actualizar nombre de usuario si existe
            this.updateUserNameDisplay();
            this.handleScreenEnter(screenName);
        }
    }

    // Actualizar textos de la pantalla de bienvenida según singular/plural y género
    updateWelcomeScreenTexts() {
        const nameInfo = this.getUserNameInfo();
        const welcomeQuestion = document.querySelector('.welcome-question');
        const welcomeTime = document.querySelector('.welcome-time');
        
        if (welcomeQuestion) {
            if (nameInfo.isPlural) {
                // Plural: "¿Están listos para descubrir cuánto dinero están gastando..."
                welcomeQuestion.textContent = `¿Están listos para descubrir cuánto dinero están gastando realmente en productos de limpieza y agua poco saludable?`;
            } else {
                // Singular: usar "lista" para mujer, "listo" para hombre
                const readyText = nameInfo.readyText || 'listo';
                welcomeQuestion.textContent = `¿Estás ${readyText} para descubrir cuánto dinero estás gastando realmente en productos de limpieza y agua poco saludable?`;
            }
        }
        
        if (welcomeTime) {
            if (nameInfo.isPlural) {
                welcomeTime.textContent = `⏱️ Solo les tomará unos segundos.`;
            } else {
                welcomeTime.textContent = `⏱️ Solo te tomará unos segundos.`;
            }
        }
    }

    // Manejar entrada a pantalla
    handleScreenEnter(screenName) {
        // Si entramos a la pantalla principal, iniciar sonido de gota
        if (screenName === 'initial-welcome') {
            console.log('💧 Entrando a pantalla principal, iniciando sonido de gota...');
            this.setupLogoWaterSound();
        }
        
        // Si entramos a la pantalla de bienvenida (segunda pantalla), actualizar textos y iniciar narración
        if (screenName === 'welcome') {
            console.log('🎤 Entrando a pantalla de bienvenida, actualizando textos y iniciando narración...');
            // Actualizar textos según singular/plural
            this.updateWelcomeScreenTexts();
            // Esperar un momento para que la pantalla se muestre completamente
            setTimeout(() => {
                this.startWelcomeNarration();
            }, 500);
        }
        
        // Si entramos a la pantalla de reglas (tercera pantalla), actualizar textos y iniciar narración automáticamente (solo una vez)
        if (screenName === 'rules' && !this.rulesNarrationPlayed) {
            console.log('🎤 Entrando a pantalla de reglas, actualizando textos e iniciando narración automáticamente...');
            this.setupRulesScreen();
            // Esperar un momento para que la pantalla se muestre completamente
            setTimeout(() => {
                this.startRulesNarration();
            }, 500);
        }
        
        // Si salimos de la pantalla de resultado de años, detener la alarma repetitiva
        if (screenName !== 'years-result') {
            this.stopYearsRepeatingAlarm();
        }
        
        // Si salimos de la pantalla de bienvenida, detener la narración
        if (screenName !== 'welcome' && screenName !== 'initial-welcome' && screenName !== 'rules') {
            this.stopWelcomeNarration();
        }
        
        switch (screenName) {
            case 'countdown':
                this.startCountdown();
                break;
            case 'price':
                this.setupPriceScreen();
                break;
            case 'quantity':
                this.setupQuantityScreen();
                break;
            case 'cleaning-result':
                this.showCleaningResult();
                break;
            case 'water-type':
                this.setupWaterTypeScreen();
                this.startWaterTypeNarration();
                break;
            case 'water-warning':
                this.showWaterWarning();
                break;
            case 'water-simulation':
                this.setupWaterSimulationScreen();
                break;
            case 'water-frequency':
                this.setupWaterFrequencyScreen();
                break;
            case 'water-price':
                this.setupWaterPriceScreen();
                break;
            case 'water-result':
                this.showWaterResult();
                break;
            case 'results':
                this.showResults();
                break;
            case 'multiplier':
                this.setupMultiplierScreen();
                break;
            case 'years-multiplier':
                this.setupYearsMultiplierScreen();
                break;
            case 'years-result':
                this.showYearsResult();
                break;
            case 'validation':
                this.setupValidationScreen();
                this.startValidationNarration();
                break;
            case 'analysis':
                this.setupAnalysisScreen();
                this.showAnalysis();
                break;
            case 'prize':
                this.setupPrizeScreen();
                this.showConfetti();
                this.startPrizeNarration();
                break;
            case 'benefit-ahorro':
                this.setupBenefitAhorroScreen();
                this.startBenefitAhorroNarration();
                break;
            case 'benefit-salud':
                this.setupBenefitSaludScreen();
                this.startBenefitSaludNarration();
                break;
            case 'benefit-tranquilidad':
                this.setupBenefitTranquilidadScreen();
                this.startBenefitTranquilidadNarration();
                break;
            case 'specialist':
                this.setupSpecialistScreen();
                this.startSpecialistNarration();
                break;
            case 'summary':
                this.generateSummaryTable();
                // Asegurar que el botón de descarga esté disponible
                const downloadBtn = document.getElementById('download-pdf-button');
                if (downloadBtn) {
                    downloadBtn.style.display = 'block';
                    console.log('✅ Botón de descarga PDF visible en pantalla de resumen');
                } else {
                    console.warn('⚠️ Botón de descarga PDF no encontrado en pantalla de resumen');
                }
                break;
        }
    }

    // Reproducir sonido de cuenta regresiva (tipo carrera)
    playCountdownSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Crear un sonido tipo "beep" de carrera - tono corto y agudo
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Configurar el sonido - tono agudo tipo "beep" de carrera
            oscillator.type = 'square'; // Tipo square para sonido más "digital" tipo carrera
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Tono agudo
            
            // Configurar volumen - sonido corto y claro
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.15);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
            
            // Reproducir
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            // Silenciosamente fallar si el audio no está disponible
            console.log('Audio de cuenta regresiva no disponible');
        }
    }

    // Inicializar AudioContext (se llama cuando el usuario interactúa)
    initAudioContext() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('✅ AudioContext inicializado, estado:', this.audioContext.state);
            } catch (error) {
                console.error('❌ Error al crear AudioContext:', error);
                return;
            }
        }
        
        // Resumir AudioContext si está suspendido (CRÍTICO para que funcione)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('✅ AudioContext resumido, ahora está:', this.audioContext.state);
            }).catch(err => {
                console.error('❌ Error al resumir AudioContext:', err);
            });
        } else if (this.audioContext && this.audioContext.state === 'running') {
            console.log('✅ AudioContext ya está activo');
        }
    }

    // Reproducir sonido de reloj (versión simple y funcional, similar a playCountdownSound)
    playClockTickSound() {
        try {
            // Crear AudioContext nuevo cada vez (mismo patrón que playCountdownSound que funciona)
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Alternar entre "tick" y "tock"
            if (this.clockTickCounter === undefined) {
                this.clockTickCounter = 0;
            }
            this.clockTickCounter++;
            const isTick = this.clockTickCounter % 2 === 1;
            
            // Frecuencia: tick más agudo, tock más grave (sonido de reloj)
            const frequency = isTick ? 1000 : 800;
            
            // Crear sonido de reloj - simple y directo
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Configurar el sonido - tono tipo reloj
            oscillator.type = 'sine'; // Tipo sine para sonido suave
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            
            // Configurar volumen - sonido corto y claro
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);
            
            // Reproducir
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
            
            console.log(`🕰️ Reloj: ${isTick ? 'Tick' : 'Tock'} (${frequency}Hz)`);
        } catch (error) {
            // Silenciosamente fallar si el audio no está disponible
            console.log('Audio de reloj no disponible');
        }
    }

    // Countdown
    async startCountdown() {
        const countdownEl = document.getElementById('countdown-number');
        if (!countdownEl) return;

        for (let i = 3; i > 0; i--) {
            countdownEl.textContent = i;
            // Reproducir sonido de cuenta regresiva en cada número
            this.playCountdownSound();
            await this.sleep(1000);
        }
        this.nextScreen();
    }

    // Configurar pantalla de reglas con lógica de género y plural
    setupRulesScreen() {
        const nameInfo = this.getUserNameInfo();
        const rulesMainText = document.querySelector('.rules-main-text');
        const instructionItems = document.querySelectorAll('.instruction-item');
        const rulesQuestion = document.querySelector('.rules-question');
        
        if (rulesMainText) {
            if (nameInfo.isPlural) {
                rulesMainText.textContent = 'Tendrán 15 segundos para elegir el precio aproximado de los productos que usan actualmente.';
            } else {
                rulesMainText.textContent = 'Tendrás 15 segundos para elegir el precio aproximado de los productos que usas actualmente.';
            }
        }
        
        if (instructionItems.length > 1) {
            if (nameInfo.isPlural) {
                instructionItems[1].textContent = '👉 Solo elijan la opción que más se acerque a su realidad.';
            } else {
                instructionItems[1].textContent = '👉 Solo elige la opción que más se acerque a tu realidad.';
            }
        }
        
        if (rulesQuestion) {
            if (nameInfo.isPlural) {
                rulesQuestion.textContent = '¿Preparados?';
            } else {
                // Aplicar género: "Preparada" para mujer, "Preparado" para hombre
                const preparedText = nameInfo.isFeminine ? 'Preparada' : 'Preparado';
                rulesQuestion.textContent = `¿${preparedText}?`;
            }
        }
    }

    // Configurar pantalla de precio
    setupPriceScreen() {
        // Actualizar pregunta según singular/plural
        const priceQuestion = document.getElementById('price-question');
        if (priceQuestion) {
            const nameInfo = this.getUserNameInfo();
            if (nameInfo.isPlural) {
                priceQuestion.textContent = '¿Cuál es el costo del producto que usan?';
            } else {
                priceQuestion.textContent = '¿Cuál es el costo del producto que usas?';
            }
        }
        
        const container = document.getElementById('drag-options');
        const dropZone = document.getElementById('drop-zone');
        const productNameEl = document.getElementById('product-name');
        
        if (!container) return;

        const currentProduct = PRODUCT_DATA.products[this.gameState.currentProductIndex];
        if (!currentProduct) {
            // No hay más productos, ir a resultados
            this.nextScreen();
            return;
        }

        // Inicializar AudioContext cuando se entra a la pantalla (interacción del usuario)
        this.initAudioContext();

        // Mostrar nombre del producto
        if (productNameEl) {
            const emojiEl = productNameEl.querySelector('.product-emoji');
            const nameEl = productNameEl.querySelector('.product-name-text');
            if (emojiEl) emojiEl.textContent = currentProduct.emoji;
            if (nameEl) nameEl.textContent = currentProduct.name;
        }

        // Limpiar contenedor
        container.innerHTML = '';
        if (dropZone) {
            dropZone.classList.remove('has-selection', 'success-glow');
        }

        // Crear tarjetas de precios clickeables
        currentProduct.prices.forEach(price => {
            const div = document.createElement('div');
            div.className = 'drag-option clickable-option';
            // Mostrar "No lo uso" cuando el precio es 0, de lo contrario mostrar el precio formateado
            if (price === 0) {
                div.textContent = 'No lo uso';
            } else if (price === 2) {
                div.textContent = '$2';
            } else {
            div.textContent = `$${price.toFixed(2)}`;
            }
            div.dataset.price = price;
            
            // Evento de click (reemplaza drag & drop)
            div.addEventListener('click', () => {
                console.log('🖱️ Precio clickeado:', price);
                // Asegurar que AudioContext esté activo al hacer click
                this.initAudioContext();
                this.selectPrice(price);
            });
            
            // Soporte táctil para móviles
            div.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('👆 Precio seleccionado (táctil):', price);
                // Asegurar que AudioContext esté activo al tocar
                this.initAudioContext();
                this.selectPrice(price);
            });
            
            container.appendChild(div);
        });

        // Iniciar timer
        this.startTimer('price', 15, () => {
            // Selección automática por defecto (precio medio, índice 3 = $9.99)
            const defaultPrice = currentProduct.prices[3] || currentProduct.prices[1];
            this.selectPrice(defaultPrice);
        });
    }

    // Configurar pantalla de frecuencia de compra de agua
    setupWaterSimulationScreen() {
        // Actualizar el texto con el nombre del usuario
        const simulationText = document.getElementById('water-simulation-text');
        if (simulationText) {
            const nameInfo = this.getUserNameInfo();
            if (nameInfo.displayName) {
                if (nameInfo.isPlural) {
                    simulationText.textContent = `${nameInfo.displayName}, no se preocupen, ustedes hoy tienen la solución en sus manos, así que hagamos una simulación de gastos de agua.`;
                } else {
                    simulationText.textContent = `${nameInfo.displayName}, no se preocupe, usted hoy tiene la solución en sus manos, así que hagamos una simulación de gastos de agua.`;
                }
            } else {
                simulationText.textContent = 'No se preocupe, usted hoy tiene la solución en sus manos, así que hagamos una simulación de gastos de agua.';
            }
        }
        
        // Iniciar narración
        this.startWaterSimulationNarration();
    }

    setupWaterFrequencyScreen() {
        // Actualizar pregunta según singular/plural
        const waterFrequencyQuestion = document.querySelector('#water-frequency-screen .question-text');
        if (waterFrequencyQuestion) {
            const nameInfo = this.getUserNameInfo();
            if (nameInfo.isPlural) {
                waterFrequencyQuestion.textContent = '¿Cuántas veces compran agua a la semana?';
            } else {
                waterFrequencyQuestion.textContent = '¿Cuántas veces compras agua a la semana?';
            }
        }
        
        const container = document.getElementById('water-frequency-options');
        const dropZone = document.getElementById('water-frequency-drop-zone');
        
        if (!container) return;

        // Limpiar contenedor
        container.innerHTML = '';
        if (dropZone) {
            dropZone.classList.remove('has-selection', 'success-glow');
        }

        // Crear tarjetas de frecuencia clickeables (1 al 10)
        PRODUCT_DATA.waterFrequencies.forEach(frequency => {
            const div = document.createElement('div');
            div.className = 'drag-option clickable-option';
            div.textContent = this.getNumberEmoji(frequency);
            div.dataset.frequency = frequency;
            
            // Evento de click (reemplaza drag & drop)
            div.addEventListener('click', () => {
                console.log('🖱️ Frecuencia de agua clickeada:', frequency);
                this.selectWaterFrequency(frequency);
            });
            
            // Soporte táctil para móviles
            div.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('👆 Frecuencia de agua seleccionada (táctil):', frequency);
                this.selectWaterFrequency(frequency);
            });
            
            container.appendChild(div);
        });
    }

    // Obtener emoji para número
    getNumberEmoji(num) {
        if (num === 10) return '🔟';
        // Para números 1-9, usar el formato: número + ️⃣
        const numberEmojis = {
            1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣',
            6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣'
        };
        return numberEmojis[num] || '';
    }

    // Configurar pantalla de precio del agua
    setupWaterPriceScreen() {
        // Actualizar pregunta según singular/plural
        const waterPriceQuestion = document.querySelector('#water-price-screen .question-text');
        if (waterPriceQuestion) {
            const nameInfo = this.getUserNameInfo();
            if (nameInfo.isPlural) {
                waterPriceQuestion.textContent = '¿Cuánto pagan por cada compra?';
            } else {
                waterPriceQuestion.textContent = '¿Cuánto pagas por cada compra?';
            }
        }
        
        const container = document.getElementById('water-price-options');
        const dropZone = document.getElementById('water-price-drop-zone');
        
        if (!container) return;

        // Limpiar contenedor
        container.innerHTML = '';
        if (dropZone) {
            dropZone.classList.remove('has-selection', 'success-glow');
        }

        // Crear tarjetas de precio clickeables
        PRODUCT_DATA.waterPrices.forEach(price => {
            const div = document.createElement('div');
            div.className = 'drag-option clickable-option';
            div.textContent = price === 20 ? '$+20' : `$${price.toFixed(2)}`;
            div.dataset.price = price;
            
            // Evento de click (reemplaza drag & drop)
            div.addEventListener('click', () => {
                console.log('🖱️ Precio de agua clickeado:', price);
                this.selectWaterPrice(price);
            });
            
            // Soporte táctil para móviles
            div.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('👆 Precio de agua seleccionado (táctil):', price);
                this.selectWaterPrice(price);
            });
            
            container.appendChild(div);
        });
    }

    // Configurar pantalla de tipo de agua
    setupWaterTypeScreen() {
        const container = document.getElementById('water-type-options');
        const dropZone = document.getElementById('water-type-drop-zone');
        const titleElement = document.getElementById('water-type-title');
        const waterTypeQuestion = document.querySelector('#water-type-screen .question-text');
        
        if (!container) return;

        const nameInfo = this.getUserNameInfo();
        
        // Actualizar título con el nombre del usuario si existe
        if (titleElement) {
            if (nameInfo.displayName) {
                if (nameInfo.isPlural) {
                    titleElement.textContent = `💧 Ahora, ${nameInfo.displayName}, hablemos del agua que consumen`;
                } else {
                    titleElement.textContent = `💧 Ahora, ${nameInfo.displayName}, hablemos del agua que consumes`;
                }
            } else {
                titleElement.textContent = '💧 Ahora hablemos del agua que consumes';
            }
        }
        
        // Actualizar pregunta según singular/plural
        if (waterTypeQuestion) {
            if (nameInfo.isPlural) {
                waterTypeQuestion.textContent = '¿Qué tipo de agua beben actualmente?';
            } else {
                waterTypeQuestion.textContent = '¿Qué tipo de agua bebes actualmente?';
            }
        }

        // Limpiar contenedor
        container.innerHTML = '';
        if (dropZone) {
            dropZone.classList.remove('has-selection', 'success-glow');
        }

        // Crear tarjetas de tipo de agua clickeables
        PRODUCT_DATA.waterTypes.forEach(waterType => {
            const div = document.createElement('div');
            div.className = 'drag-option clickable-option';
            div.textContent = `${waterType.emoji} ${waterType.name}`;
            div.dataset.value = waterType.value;
            div.dataset.name = waterType.name;
            div.dataset.emoji = waterType.emoji;
            
            // Evento de click (reemplaza drag & drop)
            div.addEventListener('click', () => {
                console.log('🖱️ Tipo de agua clickeado:', waterType);
                this.selectWaterType(waterType);
            });
            
            // Soporte táctil para móviles
            div.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('👆 Tipo de agua seleccionado (táctil):', waterType);
                this.selectWaterType(waterType);
            });
            
            container.appendChild(div);
        });
    }

    // Configurar pantalla de cantidad
    setupQuantityScreen() {
        // Actualizar pregunta según singular/plural
        const quantityQuestion = document.getElementById('quantity-question');
        if (quantityQuestion) {
            const nameInfo = this.getUserNameInfo();
            if (nameInfo.isPlural) {
                quantityQuestion.textContent = '¿Cuántas unidades compran al mes?';
            } else {
                quantityQuestion.textContent = '¿Cuántas unidades compras al mes?';
            }
        }
        const container = document.getElementById('quantity-options');
        const dropZone = document.getElementById('quantity-drop-zone');
        const timerEl = document.getElementById('quantity-timer-seconds');
        
        if (!container) return;

        if (!this.gameState.currentProductData) {
            console.error('No hay precio seleccionado');
            return;
        }

        // Inicializar AudioContext cuando se entra a la pantalla (interacción del usuario)
        this.initAudioContext();

        // Limpiar contenedor
        container.innerHTML = '';
        if (dropZone) {
            dropZone.classList.remove('has-selection', 'success-glow');
        }

        // Crear tarjetas de cantidad clickeables
        PRODUCT_DATA.quantities.forEach(quantity => {
            const div = document.createElement('div');
            div.className = 'drag-option clickable-option';
            // Mostrar "Ninguno" cuando el valor es 0
            div.textContent = quantity === 0 ? 'Ninguno' : quantity.toString();
            div.dataset.quantity = quantity;
            
            // Evento de click (reemplaza drag & drop)
            div.addEventListener('click', () => {
                console.log('🖱️ Cantidad clickeada:', quantity);
                // Asegurar que AudioContext esté activo al hacer click
                this.initAudioContext();
                this.selectQuantity(quantity);
            });
            
            // Soporte táctil para móviles
            div.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('👆 Cantidad seleccionada (táctil):', quantity);
                // Asegurar que AudioContext esté activo al tocar
                this.initAudioContext();
                this.selectQuantity(quantity);
            });
            
            container.appendChild(div);
        });

        // Iniciar timer para cantidad
        this.startTimer('quantity', 15, () => {
            // Selección automática por defecto (cantidad media)
            const defaultQuantity = PRODUCT_DATA.quantities[Math.floor(PRODUCT_DATA.quantities.length / 2)];
            this.selectQuantity(defaultQuantity);
        }, timerEl);
    }

    // ===== DRAG & DROP HANDLERS =====
    
    // Variables para soporte táctil
    touchData = {
        isDragging: false,
        startX: 0,
        startY: 0,
        currentElement: null,
        currentOption: null
    };
    
    // Manejar inicio de arrastre (mouse)
    handleDragStart(e, option) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify(option));
        e.currentTarget.classList.add('dragging');
        let label = 'opción';
        if (option.price !== undefined) {
            label = `$${option.price.toFixed(2)}`;
        } else if (option.quantity !== undefined) {
            label = option.quantity.toString();
        } else if (option.label) {
            label = option.label;
        }
        console.log('🖱️ Iniciando arrastre:', label);
    }
    
    // Manejar inicio táctil
    handleTouchStart(e, option, element, type) {
        if (this.touchData.isDragging) return;
        
        const touch = e.touches[0];
        this.touchData = {
            isDragging: true,
            startX: touch.clientX,
            startY: touch.clientY,
            currentElement: element,
            currentOption: option,
            type: type
        };
        
        element.classList.add('dragging');
        e.preventDefault();
    }
    
    // Manejar movimiento táctil
    handleTouchMove(e) {
        if (!this.touchData.isDragging) return;
        
        const touch = e.touches[0];
        const element = this.touchData.currentElement;
        
        if (element) {
            const deltaX = touch.clientX - this.touchData.startX;
            const deltaY = touch.clientY - this.touchData.startY;
            
            element.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(5deg)`;
            element.style.opacity = '0.7';
            element.style.zIndex = '1000';
        }
        
        // Verificar si está sobre drop zone
        const dropZone = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.drop-zone');
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('drag-over');
        });
        if (dropZone) {
            dropZone.classList.add('drag-over');
        }
        
        e.preventDefault();
    }
    
    // Manejar fin táctil
    handleTouchEnd(e, type) {
        if (!this.touchData.isDragging) return;
        
        const touch = e.changedTouches[0];
        const element = this.touchData.currentElement;
        const data = this.touchData.currentOption;
        
        // Resetear estilos
        if (element) {
            element.style.transform = '';
            element.style.opacity = '';
            element.style.zIndex = '';
            element.classList.remove('dragging');
        }
        
        // Verificar si se soltó sobre drop zone
        const dropZone = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.drop-zone');
        
        if (dropZone && !dropZone.classList.contains('has-selection')) {
            if (type === 'price' && data.price !== undefined) {
                this.selectPrice(data.price, dropZone);
            } else if (type === 'quantity' && data.quantity !== undefined) {
                this.selectQuantity(data.quantity, dropZone);
            } else if (type === 'water-type' && data.waterType !== undefined) {
                this.selectWaterType(data.waterType, dropZone);
            } else if (type === 'water-frequency' && data.frequency !== undefined) {
                this.selectWaterFrequency(data.frequency, dropZone);
            } else if (type === 'water-price' && data.price !== undefined) {
                this.selectWaterPrice(data.price, dropZone);
            }
        }
        
        // Limpiar drag over
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('drag-over');
        });
        
        this.touchData = {
            isDragging: false,
            startX: 0,
            startY: 0,
            currentElement: null,
            currentOption: null,
            type: null
        };
        
        e.preventDefault();
    }

    // Manejar fin de arrastre
    handleDragEnd(e) {
        e.currentTarget.classList.remove('dragging');
    }

    // Manejar drag over (permitir drop)
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    }

    // Manejar drag leave
    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    // Manejar drop (soltar)
    handleDrop(e, type) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropZone = e.currentTarget;
        dropZone.classList.remove('drag-over');
        
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            
            if (type === 'price') {
                this.selectPrice(data.price, dropZone);
            } else if (type === 'quantity') {
                this.selectQuantity(data.quantity, dropZone);
            } else if (type === 'water-type') {
                this.selectWaterType(data.waterType, dropZone);
            } else if (type === 'water-frequency') {
                this.selectWaterFrequency(data.frequency, dropZone);
            } else if (type === 'water-price') {
                this.selectWaterPrice(data.price, dropZone);
            }
        } catch (error) {
            console.error('Error procesando drop:', error);
        }
    }

    // Seleccionar precio
    selectPrice(price, dropZone = null) {
        console.log('✅ Precio seleccionado:', price);
        
        const currentProduct = PRODUCT_DATA.products[this.gameState.currentProductIndex];
        if (!currentProduct) return;
        
        // Guardar precio temporalmente - guardar solo el nombre del producto, no el objeto completo
        if (!this.gameState.currentProductData) {
            this.gameState.currentProductData = {
                product: currentProduct.name, // Guardar solo el nombre como string
                price: price
            };
        } else {
            this.gameState.currentProductData.price = price;
        }
        
        if (!dropZone) {
            dropZone = document.getElementById('drop-zone');
        }
        
        // Mostrar feedback apropiado según el precio
        const priceLabel = price === 0 ? 'No lo uso' : (price === 2 ? '$2' : `$${price.toFixed(2)}`);
        this.showSuccessFeedback(dropZone, { label: priceLabel });
        this.playSuccessSound();
        this.stopTimer('price');
        
        // Bloquear todas las opciones
        this.lockAllOptions('drag-options');
        
        setTimeout(() => this.nextScreen(), 1500);
    }

    // Seleccionar frecuencia de compra de agua
    selectWaterFrequency(frequency, dropZone = null) {
        console.log('✅ Frecuencia de agua seleccionada:', frequency);
        
        // Guardar frecuencia en el estado
        this.gameState.waterFrequency = frequency;
        
        if (!dropZone) {
            dropZone = document.getElementById('water-frequency-drop-zone');
        }
        
        this.showSuccessFeedback(dropZone, { label: `${frequency} vez${frequency > 1 ? 'es' : ''} por semana` });
        this.playSuccessSound();
        
        // Bloquear todas las opciones
        this.lockAllOptions('water-frequency-options');
        
        // Pasar automáticamente a precio de agua
        setTimeout(() => {
            this.nextScreen(); // Pasa a precio de agua
        }, 1500);
    }

    // Seleccionar precio del agua
    selectWaterPrice(price, dropZone = null) {
        console.log('✅ Precio de agua seleccionado:', price);
        
        // Guardar precio en el estado
        this.gameState.waterPrice = price;
        
        // Calcular automáticamente: Precio × Compras semanales
        if (this.gameState.waterFrequency) {
            const weeklyTotal = price * this.gameState.waterFrequency;
            // Convertir a mensual (asumiendo 4 semanas por mes)
            const monthlyWaterTotal = weeklyTotal * 4;
            this.gameState.waterMonthlyTotal = monthlyWaterTotal;
            console.log(`💧 Cálculo automático: $${price.toFixed(2)} × ${this.gameState.waterFrequency} compras/semana = $${weeklyTotal.toFixed(2)}/semana = $${monthlyWaterTotal.toFixed(2)}/mes`);
        }
        
        if (!dropZone) {
            dropZone = document.getElementById('water-price-drop-zone');
        }
        
        const priceLabel = price === 20 ? '$+20' : `$${price.toFixed(2)}`;
        this.showSuccessFeedback(dropZone, { label: priceLabel });
        this.playSuccessSound();
        
        // Bloquear todas las opciones
        this.lockAllOptions('water-price-options');
        
        // Pasar automáticamente a resultado del agua
        setTimeout(() => {
            this.nextScreen(); // Pasa a resultado del agua
        }, 1500);
    }

    // Iniciar narración de productos de limpieza con voz femenina (misma que pantallas 1 y 2)
    startCleaningNarration() {
        console.log('🎤 Iniciando proceso de narración de productos de limpieza...');
        
        // Verificar si SpeechSynthesis está disponible
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible en este navegador');
            // Fallback: mostrar resultado después de 3 segundos
            setTimeout(() => {
                this.showCleaningResultAfterNarration();
            }, 3000);
            return;
        }

        // Prevenir múltiples llamadas simultáneas
        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            // Detener cualquier narración previa
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
            
            // Marcar que estamos narrando
            this.isNarrating = true;

            // Función para iniciar la narración (se llama cuando las voces estén listas)
            const startSpeaking = () => {
                console.log('🗣️ Preparando para hablar (productos de limpieza)...');
                
                // Verificar que speechSynthesis siga disponible
                if (!('speechSynthesis' in window)) {
                    console.error('❌ SpeechSynthesis ya no está disponible');
                    this.isNarrating = false;
                    setTimeout(() => {
                        this.showCleaningResultAfterNarration();
                    }, 3000);
                    return;
                }

                // Texto a leer con lógica singular/plural
                const nameInfo = this.getUserNameInfo();
                const cleaningText = nameInfo.isPlural
                    ? 'Sumando sus gastos en productos de limpieza y aseo. Espere un momento.'
                    : 'Sumando tus gastos en productos de limpieza y aseo. Espere un momento.';
                
                // Crear utterance con voz humanizada
                const utterance = this.createHumanizedUtterance(cleaningText, 0.88, 1.2);

                // Guardar referencia
                this.currentUtterance = utterance;

                // Evento cuando termine la lectura
                utterance.onend = () => {
                    console.log('✅ Narración de productos de limpieza completada');
                    this.currentUtterance = null;
                    this.isNarrating = false;
                    // Mostrar resultado inmediatamente después de la narración
                    this.showCleaningResultAfterNarration();
                };

                // Evento de error
                utterance.onerror = (event) => {
                    console.error('❌ Error en la narración de productos de limpieza:', event.error);
                    this.currentUtterance = null;
                    this.isNarrating = false;
                    // Mostrar resultado inmediatamente incluso con error
                    this.showCleaningResultAfterNarration();
                };

                // Evento cuando comienza
                utterance.onstart = () => {
                    console.log('🔊 Narración de productos de limpieza iniciada correctamente');
                };

                // Iniciar la narración
                try {
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        setTimeout(() => {
                            speechSynthesis.speak(utterance);
                            console.log('🎤 Comando speak() ejecutado para productos de limpieza (después de cancelar)');
                        }, 100);
                    } else {
                        speechSynthesis.speak(utterance);
                        console.log('🎤 Comando speak() ejecutado para productos de limpieza');
                    }
                } catch (speakError) {
                    console.error('❌ Error al ejecutar speak() para productos de limpieza:', speakError);
                    this.isNarrating = false;
                    setTimeout(() => {
                        this.showCleaningResultAfterNarration();
                    }, 3000);
                }
            };

            // Verificar si las voces ya están cargadas
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                startSpeaking();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                };
                setTimeout(() => {
                    if (speechSynthesis.getVoices().length > 0) {
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces para productos de limpieza');
                        this.isNarrating = false;
                        setTimeout(() => {
                            this.showCleaningResultAfterNarration();
                        }, 3000);
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error al iniciar la narración de productos de limpieza:', error);
            this.isNarrating = false;
            // Fallback: mostrar resultado después de 3 segundos
            setTimeout(() => {
                this.showCleaningResultAfterNarration();
            }, 3000);
        }
    }

    // Mostrar resultado después de la narración
    showCleaningResultAfterNarration() {
        // Calcular total de productos de limpieza
        const cleaningTotal = this.gameState.products.reduce((sum, product) => {
            return sum + (product.total || 0);
        }, 0);
        
        // Guardar el total en el estado
        this.gameState.monthlyTotal = cleaningTotal;
        
        console.log(`🧹 Total de productos de limpieza: $${cleaningTotal.toFixed(2)}`);
        
        // Ocultar animación y mostrar resultado
        const thinking = document.getElementById('cleaning-thinking');
        const result = document.getElementById('cleaning-calculation-result');
        const continueButton = document.getElementById('cleaning-continue-button');
        const resultTitle = result ? result.querySelector('.result-title-orange') : null;
        
        // Actualizar texto del título según género y plural
        if (resultTitle) {
            const nameInfo = this.getUserNameInfo();
            if (nameInfo.isPlural) {
                resultTitle.textContent = '🧹 Sus gastos mensuales en productos de limpieza son:';
            } else {
                resultTitle.textContent = '🧹 Tus gastos mensuales en productos de limpieza son:';
            }
        }
        
        if (thinking) thinking.classList.add('hidden');
        if (result) {
            result.classList.remove('hidden');
            const amountEl = document.getElementById('cleaning-total-amount');
            if (amountEl) {
                amountEl.textContent = cleaningTotal.toFixed(2);
            }
        }

        // Mostrar botón de continuar
        if (continueButton) {
            continueButton.classList.remove('hidden');
        }

        // Reproducir sonido de alerta
        this.playAlertSound();

        // Iniciar narración de resultados con voz femenina
        this.startCleaningResultNarration(cleaningTotal);

        // Ya no avanzamos automáticamente - el usuario debe hacer clic en el botón
    }

    // Iniciar narración de resultados de productos de limpieza
    startCleaningResultNarration(cleaningTotal) {
        console.log('🎤 Iniciando narración de resultados de productos de limpieza...');
        
        // Verificar si SpeechSynthesis está disponible
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible');
            return;
        }

        // Prevenir múltiples llamadas simultáneas
        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            // Detener cualquier narración previa
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
            
            // Marcar que estamos narrando
            this.isNarrating = true;

            // Función para iniciar la narración
            const startSpeaking = () => {
                console.log('🗣️ Preparando para hablar (resultados de limpieza)...');
                
                // Verificar que speechSynthesis siga disponible
                if (!('speechSynthesis' in window)) {
                    console.error('❌ SpeechSynthesis ya no está disponible');
                    this.isNarrating = false;
                    return;
                }

                // Texto del resultado (en dólares) - sin emoji para mejor pronunciación
                const resultText = `Tus gastos mensuales en productos de limpieza y aseo personal son aproximadamente ${cleaningTotal.toFixed(2)} dólares`;
                
                // Crear utterance para el resultado
                // Crear utterance con voz humanizada
                const resultUtterance = this.createHumanizedUtterance(resultText, 0.88, 1.2);

                // Guardar referencia
                this.currentUtterance = resultUtterance;

                // Evento cuando termine el resultado
                resultUtterance.onend = () => {
                    console.log('✅ Narración de resultado completada');
                    
                    // Esperar un momento antes de la frase reflexiva
        setTimeout(() => {
                        // Solo decir la frase reflexiva una vez
                        if (!this.reflectivePhrasePlayed) {
                            this.reflectivePhrasePlayed = true;
                            this.speakReflectivePhrase(spanishVoice, voices);
                        } else {
                            this.isNarrating = false;
                            this.currentUtterance = null;
                        }
                    }, 800);
                };

                // Evento de error
                resultUtterance.onerror = (event) => {
                    console.error('❌ Error en la narración de resultado:', event.error);
                    this.isNarrating = false;
                    this.currentUtterance = null;
                };

                // Evento cuando comienza
                resultUtterance.onstart = () => {
                    console.log('🔊 Narración de resultado iniciada');
                };

                // Iniciar la narración
                try {
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        setTimeout(() => {
                            speechSynthesis.speak(resultUtterance);
                            console.log('🎤 Comando speak() ejecutado para resultado (después de cancelar)');
                        }, 100);
                    } else {
                        speechSynthesis.speak(resultUtterance);
                        console.log('🎤 Comando speak() ejecutado para resultado');
                    }
                } catch (speakError) {
                    console.error('❌ Error al ejecutar speak() para resultado:', speakError);
                    this.isNarrating = false;
                }
            };

            // Verificar si las voces ya están cargadas
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                startSpeaking();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                };
                setTimeout(() => {
                    if (speechSynthesis.getVoices().length > 0) {
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces para resultados');
                        this.isNarrating = false;
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error al iniciar la narración de resultados:', error);
            this.isNarrating = false;
        }
    }

    // Hablar la frase reflexiva (solo una vez)
    speakReflectivePhrase(spanishVoice, voices) {
        const reflectiveText = 'Ahora que lo ves claramente, tu cerebro ya no puede ignorar este gasto.';
        
        // Configurar con voz humanizada (un poco más lento para efecto reflexivo)
        const reflectiveUtterance = this.createHumanizedUtterance(reflectiveText, 0.85, 1.2);

        // La voz ya está configurada en createHumanizedUtterance

        this.currentUtterance = reflectiveUtterance;

        reflectiveUtterance.onend = () => {
            console.log('✅ Frase reflexiva completada');
            this.isNarrating = false;
            this.currentUtterance = null;
        };

        reflectiveUtterance.onerror = (event) => {
            console.error('❌ Error en la frase reflexiva:', event.error);
            this.isNarrating = false;
            this.currentUtterance = null;
        };

        reflectiveUtterance.onstart = () => {
            console.log('🔊 Frase reflexiva iniciada');
        };

        try {
            speechSynthesis.speak(reflectiveUtterance);
            console.log('🎤 Comando speak() ejecutado para frase reflexiva');
        } catch (speakError) {
            console.error('❌ Error al ejecutar speak() para frase reflexiva:', speakError);
            this.isNarrating = false;
        }
    }

    // Mostrar resultado de productos de limpieza
    async showCleaningResult() {
        // Calcular total de productos de limpieza
        const cleaningTotal = this.gameState.products.reduce((sum, product) => {
            return sum + (product.total || 0);
        }, 0);
        
        // Guardar el total en el estado
        this.gameState.monthlyTotal = cleaningTotal;
        
        console.log(`🧹 Total de productos de limpieza: $${cleaningTotal.toFixed(2)}`);
        
        // Mostrar animación de pensamiento (cerebro visible)
        const thinking = document.getElementById('cleaning-thinking');
        const result = document.getElementById('cleaning-calculation-result');
        const continueButton = document.getElementById('cleaning-continue-button');
        const thinkingText = thinking ? thinking.querySelector('.thinking-text') : null;
        
        // Actualizar texto según género y plural
        if (thinkingText) {
            const nameInfo = this.getUserNameInfo();
            if (nameInfo.isPlural) {
                thinkingText.textContent = '➡️ Sumando sus gastos en productos de limpieza...';
            } else {
                thinkingText.textContent = '➡️ Sumando tus gastos en productos de limpieza...';
            }
        }
        
        if (thinking) thinking.classList.remove('hidden');
        if (result) result.classList.add('hidden');
        if (continueButton) continueButton.classList.add('hidden');

        // Iniciar narración (el cerebro estará visible mientras habla)
        this.startCleaningNarration();
    }

    // Mostrar resultado del agua
    async showWaterResult() {
        // Mostrar animación de pensamiento (cerebro visible)
        const thinking = document.getElementById('water-thinking');
        const result = document.getElementById('water-calculation-result');
        const thinkingText = thinking ? thinking.querySelector('.thinking-text') : null;
        
        // Actualizar texto según género y plural
        if (thinkingText) {
            const nameInfo = this.getUserNameInfo();
            if (nameInfo.isPlural) {
                thinkingText.textContent = '➡️ Sumando sus gastos del agua...';
            } else {
                thinkingText.textContent = '➡️ Sumando tus gastos del agua...';
            }
        }
        
        if (thinking) thinking.classList.remove('hidden');
        if (result) result.classList.add('hidden');

        // Iniciar narración (el cerebro estará visible mientras habla)
        this.startWaterNarration();
    }

    // Iniciar narración de agua con voz femenina
    startWaterNarration() {
        console.log('🎤 Iniciando proceso de narración de agua...');
        
        // Verificar si SpeechSynthesis está disponible
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible en este navegador');
            // Fallback: mostrar resultado después de 3 segundos
            setTimeout(() => {
                this.showWaterResultAfterNarration();
            }, 3000);
            return;
        }

        // Prevenir múltiples llamadas simultáneas
        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            // Detener cualquier narración previa
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
            
            // Marcar que estamos narrando
            this.isNarrating = true;

            // Función para iniciar la narración (se llama cuando las voces estén listas)
            const startSpeaking = () => {
                console.log('🗣️ Preparando para hablar (agua)...');
                
                // Verificar que speechSynthesis siga disponible
                if (!('speechSynthesis' in window)) {
                    console.error('❌ SpeechSynthesis ya no está disponible');
                    this.isNarrating = false;
                    setTimeout(() => {
                        this.showWaterResultAfterNarration();
                    }, 3000);
                    return;
                }

                // Texto a leer con lógica singular/plural
                const nameInfo = this.getUserNameInfo();
                const waterText = nameInfo.isPlural
                    ? 'Sumando sus gastos totales de consumo de agua. Espere un momento.'
                    : 'Sumando tus gastos totales de consumo de agua. Espere un momento.';
                
                // Crear utterance con voz humanizada
                const utterance = this.createHumanizedUtterance(waterText, 0.88, 1.2);

                // Guardar referencia
                this.currentUtterance = utterance;

                // Evento cuando termine la lectura
                utterance.onend = () => {
                    console.log('✅ Narración de agua completada');
                    this.currentUtterance = null;
                    this.isNarrating = false;
                    // Mostrar resultado inmediatamente después de la narración
                    this.showWaterResultAfterNarration();
                };

                // Evento de error
                utterance.onerror = (event) => {
                    console.error('❌ Error en la narración de agua:', event.error);
                    this.currentUtterance = null;
                    this.isNarrating = false;
                    // Mostrar resultado inmediatamente incluso con error
                    this.showWaterResultAfterNarration();
                };

                // Evento cuando comienza
                utterance.onstart = () => {
                    console.log('🔊 Narración de agua iniciada correctamente');
                };

                // Iniciar la narración
                try {
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        setTimeout(() => {
                            speechSynthesis.speak(utterance);
                            console.log('🎤 Comando speak() ejecutado para agua (después de cancelar)');
                        }, 100);
                    } else {
                        speechSynthesis.speak(utterance);
                        console.log('🎤 Comando speak() ejecutado para agua');
                    }
                } catch (speakError) {
                    console.error('❌ Error al ejecutar speak() para agua:', speakError);
                    this.isNarrating = false;
                    setTimeout(() => {
                        this.showWaterResultAfterNarration();
                    }, 3000);
                }
            };

            // Verificar si las voces ya están cargadas
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                startSpeaking();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                };
                setTimeout(() => {
                    if (speechSynthesis.getVoices().length > 0) {
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces para agua');
                        this.isNarrating = false;
                        setTimeout(() => {
                            this.showWaterResultAfterNarration();
                        }, 3000);
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error al iniciar la narración de agua:', error);
            this.isNarrating = false;
            // Fallback: mostrar resultado después de 3 segundos
            setTimeout(() => {
                this.showWaterResultAfterNarration();
            }, 3000);
        }
    }

    // Mostrar resultado después de la narración de agua
    showWaterResultAfterNarration() {
        const waterTotal = this.gameState.waterMonthlyTotal || 0;
        
        console.log(`💧 Total de agua: $${waterTotal.toFixed(2)}`);

        // Ocultar animación y mostrar resultado
        const thinking = document.getElementById('water-thinking');
        const result = document.getElementById('water-calculation-result');
        const continueButton = document.getElementById('water-continue-button');
        const resultTitle = result ? result.querySelector('.result-title-orange') : null;
        
        // Actualizar texto del título según género y plural
        if (resultTitle) {
            const nameInfo = this.getUserNameInfo();
            if (nameInfo.isPlural) {
                resultTitle.textContent = '💧 Sus gastos mensuales en agua son:';
            } else {
                resultTitle.textContent = '💧 Tus gastos mensuales en agua son:';
            }
        }
        
        if (thinking) thinking.classList.add('hidden');
        if (result) {
            result.classList.remove('hidden');
            const amountEl = document.getElementById('water-total-amount');
            if (amountEl) {
                amountEl.textContent = waterTotal.toFixed(2);
            }
        }

        // Mostrar botón de continuar
        if (continueButton) {
            continueButton.classList.remove('hidden');
        }

        // Reproducir sonido de alerta
        this.playAlertSound();

        // Iniciar narración de resultados con voz femenina
        this.startWaterResultNarration(waterTotal);

        // Ya no avanzamos automáticamente - el usuario debe hacer clic en el botón
    }

    // Iniciar narración de resultados de agua
    startWaterResultNarration(waterTotal) {
        console.log('🎤 Iniciando narración de resultados de agua...');
        
        // Verificar si SpeechSynthesis está disponible
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible');
            return;
        }

        // Prevenir múltiples llamadas simultáneas
        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            // Detener cualquier narración previa
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
            
            // Marcar que estamos narrando
            this.isNarrating = true;

            // Variables para guardar la voz (fuera de startSpeaking para acceso en callbacks)
            let spanishVoice = null;
            let voices = [];

            // Función para iniciar la narración
            const startSpeaking = () => {
                console.log('🗣️ Preparando para hablar (resultados de agua)...');
                
                // Verificar que speechSynthesis siga disponible
                if (!('speechSynthesis' in window)) {
                    console.error('❌ SpeechSynthesis ya no está disponible');
                    this.isNarrating = false;
                    return;
                }

                // Texto del resultado (en dólares) - sin emoji para mejor pronunciación
                const resultText = `Tus gastos mensuales en consumo de agua son aproximadamente ${waterTotal.toFixed(2)} dólares`;
                
                // Crear utterance para el resultado
                const resultUtterance = new SpeechSynthesisUtterance(resultText);
                resultUtterance.lang = 'es-ES';
                resultUtterance.rate = 0.95;
                resultUtterance.pitch = 1.5;
                resultUtterance.volume = 1.0;

                // Usar la voz centralizada
                spanishVoice = this.selectVoice();
                voices = speechSynthesis.getVoices();
                
                if (spanishVoice) {
                    resultUtterance.voice = spanishVoice;
                    console.log('✅ Usando voz centralizada para resultados de agua:', spanishVoice.name);
                } else if (voices.length > 0) {
                    resultUtterance.voice = voices[0];
                    resultUtterance.pitch = 1.6;
                    console.log('⚠️ Usando voz predeterminada (fallback):', voices[0].name);
                }

                // Guardar referencia
                this.currentUtterance = resultUtterance;

                // Evento cuando termine el resultado
                resultUtterance.onend = () => {
                    console.log('✅ Narración de resultado de agua completada');
                    
                    // Esperar un momento antes del mensaje adicional
                    setTimeout(() => {
                        this.speakWaterAdditionalMessage(spanishVoice, voices);
                    }, 800);
                };

                // Evento de error
                resultUtterance.onerror = (event) => {
                    console.error('❌ Error en la narración de resultado de agua:', event.error);
                    this.isNarrating = false;
                    this.currentUtterance = null;
                };

                // Evento cuando comienza
                resultUtterance.onstart = () => {
                    console.log('🔊 Narración de resultado de agua iniciada');
                };

                // Iniciar la narración
                try {
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        setTimeout(() => {
                            speechSynthesis.speak(resultUtterance);
                            console.log('🎤 Comando speak() ejecutado para resultado de agua (después de cancelar)');
                        }, 100);
                    } else {
                        speechSynthesis.speak(resultUtterance);
                        console.log('🎤 Comando speak() ejecutado para resultado de agua');
                    }
                } catch (speakError) {
                    console.error('❌ Error al ejecutar speak() para resultado de agua:', speakError);
                    this.isNarrating = false;
                }
            };

            // Verificar si las voces ya están cargadas
            voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                startSpeaking();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                };
                setTimeout(() => {
                    voices = speechSynthesis.getVoices();
                    if (voices.length > 0) {
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces para resultados de agua');
                        this.isNarrating = false;
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error al iniciar la narración de resultados de agua:', error);
            this.isNarrating = false;
        }
    }

    // Hablar el mensaje adicional después del resultado de agua
    speakWaterAdditionalMessage(spanishVoice, voices) {
        // Actualizar texto según singular/plural
        const nameInfo = this.getUserNameInfo();
        const additionalText = nameInfo.isPlural 
            ? 'Estos gastos solo corresponden al agua que consumen. Ahora veremos cuál es el resultado de la suma de gastos de productos de limpieza y aseo personal, más el agua que consumen.'
            : 'Estos gastos solo corresponden al agua que consumes. Ahora veremos cuál es el resultado de la suma de gastos de productos de limpieza y aseo personal, más el agua que consumes.';
        
        const additionalUtterance = new SpeechSynthesisUtterance(additionalText);
        additionalUtterance.lang = 'es-ES';
        additionalUtterance.rate = 0.95;
        additionalUtterance.pitch = 1.5;
        additionalUtterance.volume = 1.0;

        if (spanishVoice) {
            additionalUtterance.voice = spanishVoice;
        } else if (voices.length > 0) {
            additionalUtterance.voice = voices[0];
            additionalUtterance.pitch = 1.6;
        }

        this.currentUtterance = additionalUtterance;

        additionalUtterance.onend = () => {
            console.log('✅ Mensaje adicional de agua completado');
            this.isNarrating = false;
            this.currentUtterance = null;
        };

        additionalUtterance.onerror = (event) => {
            console.error('❌ Error en el mensaje adicional de agua:', event.error);
            this.isNarrating = false;
            this.currentUtterance = null;
        };

        additionalUtterance.onstart = () => {
            console.log('🔊 Mensaje adicional de agua iniciado');
        };

        try {
            speechSynthesis.speak(additionalUtterance);
            console.log('🎤 Comando speak() ejecutado para mensaje adicional de agua');
        } catch (speakError) {
            console.error('❌ Error al ejecutar speak() para mensaje adicional de agua:', speakError);
            this.isNarrating = false;
        }
    }

    // Seleccionar tipo de agua
    selectWaterType(waterType, dropZone = null) {
        console.log('✅ Tipo de agua seleccionado:', waterType);
        
        // Guardar tipo de agua en el estado
        this.gameState.waterType = waterType;
        
        if (!dropZone) {
            dropZone = document.getElementById('water-type-drop-zone');
        }
        
        this.showSuccessFeedback(dropZone, { label: `${waterType.emoji} ${waterType.name}` });
        
        // Si es "Agua del grifo", mostrar advertencia con sonido y efecto visual
        if (waterType.value === 'tap') {
            // Reproducir sonido de alerta y peligro
            this.playAlertSound();
            
            // Agregar efecto de luces rojas a la pantalla
            const screen = document.getElementById('water-type-screen');
            if (screen) {
                screen.classList.add('red-alert');
                // Remover el efecto después de la transición
                setTimeout(() => {
                    screen.classList.remove('red-alert');
                }, 2000);
            }
        
        // Bloquear todas las opciones
        this.lockAllOptions('water-type-options');
        
            // Transicionar a pantalla de advertencia y narrar mensajes
            setTimeout(() => {
                this.transitionToScreen('water-warning');
                // Iniciar narración de mensajes de advertencia
                setTimeout(() => {
                    this.startWaterWarningNarration();
                }, 500);
            }, 1500);
        } else {
            // Si no es grifo, reproducir sonido de éxito normal
            this.playSuccessSound();
            
            // Bloquear todas las opciones
            this.lockAllOptions('water-type-options');
            
            // Pasar directamente a frecuencia
            setTimeout(() => {
                this.transitionToScreen('water-frequency');
            }, 1500);
        }
    }

    // Seleccionar cantidad
    selectQuantity(quantity, dropZone = null) {
        console.log('✅ Cantidad seleccionada:', quantity);
        
        if (!this.gameState.currentProductData) {
            console.error('No hay precio seleccionado');
            return;
        }
        
        const productData = this.gameState.currentProductData;
        const total = productData.price * quantity;
        
        // Guardar producto completo - asegurar que product sea el nombre (string)
        // Si por alguna razón productData.product es un objeto, extraer el nombre
        let productName = productData.product;
        if (typeof productName === 'object' && productName !== null) {
            productName = productName.name || 'Producto';
        } else if (typeof productName !== 'string') {
            productName = String(productName || 'Producto');
        }
        
        this.gameState.products.push({
            product: productName,
            price: productData.price,
            quantity: quantity,
            total: total
        });
        
        // Limpiar datos temporales
        this.gameState.currentProductData = null;
        
        if (!dropZone) {
            dropZone = document.getElementById('quantity-drop-zone');
        }
        
        // Mostrar feedback apropiado según la cantidad
        const feedbackLabel = quantity === 0 ? 'Ninguno' : `${quantity} vez${quantity > 1 ? 'es' : ''}`;
        this.showSuccessFeedback(dropZone, { label: feedbackLabel });
        this.playSuccessSound();
        
        // Bloquear todas las opciones
        this.lockAllOptions('quantity-options');
        
        // Detener timer de cantidad
        this.stopTimer('quantity');
        
        // Calcular y pasar automáticamente
        setTimeout(() => {
            this.nextScreen(); // Pasa a siguiente producto o resultados
        }, 1500);
    }

    // Mostrar feedback de éxito
    showSuccessFeedback(dropZone, data) {
        if (!dropZone) return;
        
        // Agregar clases de éxito
        dropZone.classList.add('has-selection', 'success-glow');
        
        // Actualizar texto
        const dropText = dropZone.querySelector('.drop-zone-text');
        if (dropText) {
            if (data.label) {
                dropText.textContent = `✓ ${data.label}`;
            } else if (data.price !== undefined) {
                dropText.textContent = `✓ $${data.price.toFixed(2)}`;
            } else if (data.quantity !== undefined) {
                dropText.textContent = `✓ ${data.quantity} vez${data.quantity > 1 ? 'es' : ''}`;
            }
            dropText.style.color = '#4CAF50';
            dropText.style.fontWeight = '700';
        }
        
        // Animación de pulso verde
        setTimeout(() => {
            dropZone.classList.remove('success-glow');
        }, 2000);
    }

    // Bloquear todas las opciones
    lockAllOptions(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const options = container.querySelectorAll('.drag-option');
        options.forEach(option => {
            option.draggable = false;
            option.classList.add('locked');
            option.style.opacity = '0.5';
            option.style.cursor = 'not-allowed';
        });
    }

    // Reproducir sonido de alerta y peligro
    playAlertSound() {
        try {
            this.initAudioContext();
            if (!this.audioContext) {
                // Fallback si no hay audioContext
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.playAlertSoundWithContext(audioContext);
                return;
            }
            this.playAlertSoundWithContext(this.audioContext);
        } catch (error) {
            console.error('❌ Error al reproducir sonido de alerta:', error);
        }
    }

    playAlertSoundWithContext(audioContext) {
        try {
            // Sonido de alerta y peligro (tono bajo y repetitivo)
            const oscillator1 = audioContext.createOscillator();
            const oscillator2 = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            // Tono bajo de alerta (200Hz)
            oscillator1.type = 'sawtooth';
            oscillator1.frequency.setValueAtTime(200, audioContext.currentTime);
            
            // Tono medio de alerta (300Hz)
            oscillator2.type = 'sawtooth';
            oscillator2.frequency.setValueAtTime(300, audioContext.currentTime);
            
            // Envolvente de volumen para efecto pulsante
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.2);
            gainNode.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + 0.3);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.4);
            gainNode.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + 0.5);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.8);
            
            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator1.start(audioContext.currentTime);
            oscillator2.start(audioContext.currentTime);
            oscillator1.stop(audioContext.currentTime + 0.8);
            oscillator2.stop(audioContext.currentTime + 0.8);
            
            console.log('🚨 Sonido de alerta reproducido');
        } catch (error) {
            console.error('❌ Error al reproducir sonido de alerta:', error);
        }
    }

    // Reproducir sonido de acierto
    playSuccessSound() {
        try {
            setTimeout(() => {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Sonido de acierto (tono ascendente agradable)
                const oscillator1 = audioContext.createOscillator();
                const oscillator2 = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator1.connect(gainNode);
                oscillator2.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Dos tonos que suenan juntos (acorde)
                oscillator1.type = 'sine';
                oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator1.frequency.exponentialRampToValueAtTime(659.25, audioContext.currentTime + 0.15); // E5
                
                oscillator2.type = 'sine';
                oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
                oscillator2.frequency.exponentialRampToValueAtTime(783.99, audioContext.currentTime + 0.15); // G5
                
                // Volumen
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                
                oscillator1.start(audioContext.currentTime);
                oscillator2.start(audioContext.currentTime);
                oscillator1.stop(audioContext.currentTime + 0.2);
                oscillator2.stop(audioContext.currentTime + 0.2);
            }, 50);
        } catch (error) {
            console.log('Audio no disponible');
        }
    }

    // Actualizar zona de drop
    updateDropZone(dropZoneId, label) {
        const dropZone = document.getElementById(dropZoneId);
        if (dropZone) {
            dropZone.classList.add('has-selection');
            const text = dropZone.querySelector('.drop-zone-text');
            if (text) text.textContent = `Seleccionado: ${label}`;
        }
    }

    // Mostrar resultados
    async showResults() {
        // El total de productos de limpieza ya está guardado en this.gameState.monthlyTotal
        // Solo necesitamos sumar el total de agua
        const cleaningTotal = this.gameState.monthlyTotal || 0;
        const waterTotal = this.gameState.waterMonthlyTotal || 0;
        
        // Total mensual = productos de limpieza (ya guardado) + agua
        this.gameState.monthlyTotal = cleaningTotal + waterTotal;
        
        console.log('🧹 Total productos de limpieza (guardado):', cleaningTotal);
        console.log('💧 Total agua mensual:', waterTotal);
        console.log('💰 Total mensual calculado:', this.gameState.monthlyTotal);

        // Mostrar animación de pensamiento
        const thinking = document.getElementById('thinking-animation');
        const result = document.getElementById('calculation-result');
        const thinkingText = thinking ? thinking.querySelector('.thinking-text') : null;
        
        // Actualizar texto según género y plural
        if (thinkingText) {
            const nameInfo = this.getUserNameInfo();
            if (nameInfo.isPlural) {
                thinkingText.textContent = '➡️ Sumando sus gastos generales...';
            } else {
                thinkingText.textContent = '➡️ Sumando tus gastos generales...';
            }
        }
        
        if (thinking) thinking.classList.remove('hidden');
        if (result) result.classList.add('hidden');

        // Iniciar narración de "Sumando tus gastos generales"
        this.startGeneralResultsNarration();

        // Esperar 5 segundos (tiempo para la narración y espera)
        await this.sleep(5000);

        // Reproducir sonido de alarma suave
        this.playAlarmSound();

        // Ocultar animación y mostrar resultado con luces rojas
        if (thinking) thinking.classList.add('hidden');
        if (result) {
            result.classList.remove('hidden');
            const amountEl = document.getElementById('total-amount');
            if (amountEl) {
                amountEl.textContent = this.gameState.monthlyTotal.toFixed(2);
            }
            
            // Actualizar título del header cuando aparece el monto
            const resultsTitle = document.getElementById('results-title');
            if (resultsTitle) {
                resultsTitle.textContent = 'Total de Gastos Mensuales';
            }
            
            // Actualizar texto de alerta según género y plural
            const alertWarningText = result.querySelector('.alert-warning-text');
            if (alertWarningText) {
                const nameInfo = this.getUserNameInfo();
                if (nameInfo.isPlural) {
                    alertWarningText.textContent = '⚠️ Sus gastos mensuales totales superan los estándares normales de consumo.';
                } else {
                    alertWarningText.textContent = '⚠️ Tus gastos mensuales totales superan los estándares normales de consumo.';
                }
            }
            
            // Actualizar el texto del título del resultado
            const resultTitleMaximum = result.querySelector('.result-title-maximum');
            if (resultTitleMaximum) {
                resultTitleMaximum.textContent = '💰 Gastos totales mensuales:';
            }
            
            // Activar luces rojas pulsantes
            const redLights = document.querySelector('.red-lights');
            if (redLights) {
                redLights.classList.add('active');
            }

            // Mostrar botón de continuar
            const continueButton = document.getElementById('results-continue-button');
            if (continueButton) {
                continueButton.classList.remove('hidden');
            }
        }

        // Guardar resultado automáticamente (ya está en gameState.monthlyTotal)
        console.log('💾 Resultado guardado:', this.gameState.monthlyTotal);

        // Ya no avanzamos automáticamente - el usuario debe hacer clic en el botón
    }

    // Iniciar narración de resultados generales
    startGeneralResultsNarration() {
        console.log('🎤 Iniciando narración de resultados generales...');
        
        // Verificar si SpeechSynthesis está disponible
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible');
            return;
        }

        // Prevenir múltiples llamadas simultáneas
        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            // Detener cualquier narración previa
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
            
            // Marcar que estamos narrando
            this.isNarrating = true;

            // Función para iniciar la narración
            const startSpeaking = () => {
                console.log('🗣️ Preparando para hablar (resultados generales)...');
                
                // Verificar que speechSynthesis siga disponible
                if (!('speechSynthesis' in window)) {
                    console.error('❌ SpeechSynthesis ya no está disponible');
                    this.isNarrating = false;
                    return;
                }

                // Texto a leer con lógica singular/plural
                const nameInfo = this.getUserNameInfo();
                const generalText = nameInfo.isPlural
                    ? 'Sumando sus gastos generales.'
                    : 'Sumando tus gastos generales.';
                
                // Crear utterance
                // Crear utterance con voz humanizada
                const utterance = this.createHumanizedUtterance(generalText, 0.88, 1.2);

                // Guardar referencia
                this.currentUtterance = utterance;

                // Evento cuando termine la lectura
                utterance.onend = () => {
                    console.log('✅ Narración de resultados generales completada');
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                // Evento de error
                utterance.onerror = (event) => {
                    console.error('❌ Error en la narración de resultados generales:', event.error);
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                // Evento cuando comienza
                utterance.onstart = () => {
                    console.log('🔊 Narración de resultados generales iniciada correctamente');
                };

                // Iniciar la narración
                try {
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        setTimeout(() => {
                            speechSynthesis.speak(utterance);
                            console.log('🎤 Comando speak() ejecutado para resultados generales (después de cancelar)');
                        }, 100);
                    } else {
                        speechSynthesis.speak(utterance);
                        console.log('🎤 Comando speak() ejecutado para resultados generales');
                    }
                } catch (speakError) {
                    console.error('❌ Error al ejecutar speak() para resultados generales:', speakError);
                    this.isNarrating = false;
                }
            };

            // Verificar si las voces ya están cargadas
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                startSpeaking();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                };
                setTimeout(() => {
                    if (speechSynthesis.getVoices().length > 0) {
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces para resultados generales');
                        this.isNarrating = false;
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error al iniciar la narración de resultados generales:', error);
            this.isNarrating = false;
        }
    }

    // Reproducir sonido de alarma suave
    playAlarmSound() {
        try {
            setTimeout(() => {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Sonido de alarma suave (pulso repetitivo)
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Tono de alarma (más suave que el anterior)
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
                
                // Volumen con pulsos suaves
                const duration = 0.3;
                const pulses = 3;
                
                for (let i = 0; i < pulses; i++) {
                    const startTime = audioContext.currentTime + (i * 0.4);
                    gainNode.gain.setValueAtTime(0, startTime);
                    gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
                    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
                }
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + (pulses * 0.4));
            }, 50);
        } catch (error) {
            console.log('Audio no disponible');
        }
    }

    // Reproducir sonido de alerta y peligro (actualizado para agua del grifo)
    playAlertSound() {
        try {
            this.initAudioContext();
            const audioContext = this.audioContext || new (window.AudioContext || window.webkitAudioContext)();
            
            // Sonido de alerta y peligro (tono bajo y repetitivo tipo sirena)
            const oscillator1 = audioContext.createOscillator();
            const oscillator2 = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Tono bajo de alerta (200Hz) con efecto pulsante
            oscillator1.type = 'sawtooth';
            oscillator1.frequency.setValueAtTime(200, audioContext.currentTime);
            
            // Tono medio de alerta (300Hz)
            oscillator2.type = 'sawtooth';
            oscillator2.frequency.setValueAtTime(300, audioContext.currentTime);
            
            // Envolvente de volumen para efecto pulsante de alerta
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.2);
            gainNode.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + 0.3);
            gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.4);
            gainNode.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + 0.5);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.8);
            
            oscillator1.start(audioContext.currentTime);
            oscillator2.start(audioContext.currentTime);
            oscillator1.stop(audioContext.currentTime + 0.8);
            oscillator2.stop(audioContext.currentTime + 0.8);
            
            console.log('🚨 Sonido de alerta y peligro reproducido');
        } catch (error) {
            console.error('❌ Error al reproducir sonido de alerta:', error);
        }
    }
    
    // Función anterior (mantener para compatibilidad)
    playAlertSoundOld() {
        try {
            setTimeout(() => {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Sonido de alerta (tono descendente tipo "fallo")
                const oscillator1 = audioContext.createOscillator();
                const oscillator2 = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator1.connect(gainNode);
                oscillator2.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Dos tonos descendentes (acorde de alerta)
                oscillator1.type = 'sine';
                oscillator1.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
                oscillator1.frequency.exponentialRampToValueAtTime(523.25, audioContext.currentTime + 0.2); // C5
                
                oscillator2.type = 'sine';
                oscillator2.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator2.frequency.exponentialRampToValueAtTime(392.00, audioContext.currentTime + 0.2); // G4
                
                // Volumen (más fuerte que el sonido de éxito)
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
                
                oscillator1.start(audioContext.currentTime);
                oscillator2.start(audioContext.currentTime);
                oscillator1.stop(audioContext.currentTime + 0.25);
                oscillator2.stop(audioContext.currentTime + 0.25);
            }, 50);
        } catch (error) {
            console.log('Audio no disponible');
        }
    }

    // Manejar validación
    handleValidation(isCorrect) {
        console.log('Validación:', isCorrect ? 'Correcto' : 'Incorrecto');
        
        if (isCorrect) {
            // Si responde SÍ, continuar normalmente
        this.nextScreen();
        } else {
            // Si responde NO, mostrar modal de confirmación
            this.showValidationModal();
        }
    }

    // Mostrar modal de confirmación para revisar precios
    showValidationModal() {
        const nameInfo = this.getUserNameInfo();
        const modal = document.getElementById('validation-review-modal');
        const modalText = document.getElementById('validation-review-modal-text');
        const acceptButton = document.getElementById('validation-review-accept');
        const cancelButton = document.getElementById('validation-review-cancel');
        
        if (!modal) {
            console.error('❌ Modal de validación no encontrado');
            return;
        }
        
        // Actualizar texto del modal según género y plural
        if (modalText) {
            if (nameInfo.isPlural) {
                modalText.textContent = 'Ok, revisemos de nuevo sus precios';
            } else {
                modalText.textContent = 'Ok, revisemos de nuevo tus precios';
            }
        }
        
        // Mostrar modal
        modal.classList.remove('hidden');
        
        // Narrar el mensaje del modal
        this.speakValidationReviewMessage();
        
        // Event listeners para los botones
        if (acceptButton) {
            // Remover listeners previos para evitar duplicados
            const newAcceptButton = acceptButton.cloneNode(true);
            acceptButton.parentNode.replaceChild(newAcceptButton, acceptButton);
            
            newAcceptButton.addEventListener('click', () => {
                this.handleValidationReviewAccept();
            });
            newAcceptButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleValidationReviewAccept();
            });
        }
        
        if (cancelButton) {
            // Remover listeners previos para evitar duplicados
            const newCancelButton = cancelButton.cloneNode(true);
            cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
            
            newCancelButton.addEventListener('click', () => {
                this.handleValidationReviewCancel();
            });
            newCancelButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleValidationReviewCancel();
            });
        }
    }

    // Narrar mensaje del modal de revisión
    speakValidationReviewMessage() {
        console.log('🎤 Iniciando narración de revisión de precios...');
        
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible');
            return;
        }

        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            this.stopWelcomeNarration();
            speechSynthesis.cancel();
            this.isNarrating = true;

            const startSpeaking = () => {
                if (!('speechSynthesis' in window)) {
                    console.error('❌ SpeechSynthesis ya no está disponible');
                    this.isNarrating = false;
                    return;
                }

                const nameInfo = this.getUserNameInfo();
                const reviewText = nameInfo.isPlural 
                    ? 'Ok, revisemos de nuevo sus precios'
                    : 'Ok, revisemos de nuevo tus precios';

                // Crear utterance con voz humanizada
                const utterance = this.createHumanizedUtterance(reviewText, 0.88, 1.2);

                this.currentUtterance = utterance;
                utterance.onend = () => {
                    console.log('✅ Narración de revisión completada');
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };
                utterance.onerror = (event) => {
                    console.error('❌ Error en la narración de revisión:', event.error);
                    this.isNarrating = false;
                    this.currentUtterance = null;
                };
                utterance.onstart = () => {
                    console.log('🔊 Narración de revisión iniciada');
                };

                try {
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        setTimeout(() => {
                            speechSynthesis.speak(utterance);
                            console.log('🎤 Comando speak() ejecutado para revisión (después de cancelar)');
                        }, 100);
                    } else {
                        speechSynthesis.speak(utterance);
                        console.log('🎤 Comando speak() ejecutado para revisión');
                    }
                } catch (speakError) {
                    console.error('❌ Error al ejecutar speak() para revisión:', speakError);
                    this.isNarrating = false;
                }
            };

            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                startSpeaking();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                };
                setTimeout(() => {
                    if (speechSynthesis.getVoices().length > 0) {
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces para revisión');
                        this.isNarrating = false;
                    }
                }, 1000);
            }
        } catch (error) {
            console.error('❌ Error al iniciar la narración de revisión:', error);
            this.isNarrating = false;
        }
    }

    // Manejar aceptación de revisión de precios
    handleValidationReviewAccept() {
        console.log('✅ Usuario acepta revisar precios, reiniciando desde el principio');
        
        // Ocultar modal
        const modal = document.getElementById('validation-review-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // Preservar nombre y género del usuario
        const savedUserName = this.gameState.userName || '';
        const savedGender = this.gameState.gender || '';
        const savedIsPlural = this.gameState.isPlural || false;
        
        // Resetear el índice del producto al inicio
        this.gameState.currentProductIndex = 0;
        
        // Limpiar todos los productos seleccionados completamente
        this.gameState.products = [];
        
        // Resetear otros valores pero preservar nombre y género
        this.gameState.monthlyTotal = 0;
        this.gameState.waterType = null;
        this.gameState.waterFrequency = null;
        this.gameState.waterPrice = null;
        this.gameState.waterMonthlyTotal = 0;
        this.gameState.multiplier = 1;
        this.gameState.totalAccumulated = 0;
        this.gameState.yearsMultiplier = 1;
        this.gameState.yearsTotalAccumulated = 0;
        this.gameState.currentProductData = null;
        
        // Preservar nombre y género
        this.gameState.userName = savedUserName;
        this.gameState.gender = savedGender;
        this.gameState.isPlural = savedIsPlural;
        
        // Volver a la primera pantalla de precio (primer producto)
        this.transitionToScreen('price');
    }

    // Manejar cancelación de revisión de precios
    handleValidationReviewCancel() {
        console.log('❌ Usuario cancela revisión, permaneciendo en pantalla de validación');
        
        // Ocultar modal
        const modal = document.getElementById('validation-review-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // Permanecer en la pantalla de validación (no hacer nada)
    }

    // Iniciar narración de mensajes de advertencia de agua del grifo
    startWaterWarningNarration() {
        console.log('🎤 Iniciando narración de advertencia de agua del grifo...');
        
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible');
            return;
        }

        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            this.stopWelcomeNarration();
            speechSynthesis.cancel();
            this.isNarrating = true;

            const startSpeaking = () => {
                if (!('speechSynthesis' in window)) {
                    console.error('❌ SpeechSynthesis ya no está disponible');
                    this.isNarrating = false;
                    return;
                }

                // Obtener todos los mensajes de advertencia
                const messages = document.querySelectorAll('#warning-messages .warning-message');
                const allMessages = Array.from(messages).map(msg => msg.textContent.trim());
                
                // Combinar todos los mensajes en un solo texto
                const fullWarningText = allMessages.join('. ');
                
                // Crear utterance con voz masculina humanizada (un poco más lento para seriedad)
                const utterance = this.createMaleHumanizedUtterance(fullWarningText, 0.85, 1.15);

                this.currentUtterance = utterance;

                utterance.onend = () => {
                    console.log('✅ Narración de advertencia completada');
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                utterance.onerror = (event) => {
                    console.error('❌ Error en la narración de advertencia:', event.error);
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                utterance.onstart = () => {
                    console.log('🔊 Narración de advertencia iniciada');
                };

                try {
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        setTimeout(() => {
                            speechSynthesis.speak(utterance);
                            console.log('🎤 Comando speak() ejecutado para advertencia (después de cancelar)');
                        }, 100);
                    } else {
                        speechSynthesis.speak(utterance);
                        console.log('🎤 Comando speak() ejecutado para advertencia');
                    }
                } catch (speakError) {
                    console.error('❌ Error al ejecutar speak() para advertencia:', speakError);
                    this.isNarrating = false;
                }
            };

            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                startSpeaking();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                };
                setTimeout(() => {
                    if (speechSynthesis.getVoices().length > 0) {
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces para advertencia');
                        this.isNarrating = false;
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error al iniciar la narración de advertencia:', error);
            this.isNarrating = false;
        }
    }

    // Mostrar advertencia de agua del grifo
    showWaterWarning() {
        const messages = document.querySelectorAll('#warning-messages .warning-message');
        const continueButton = document.getElementById('warning-continue-button');
        if (messages.length === 0) return;
        
        // Ocultar botón inicialmente
        if (continueButton) {
            continueButton.classList.add('hidden');
        }
        
        let currentIndex = 0;
        
        // Mostrar primer mensaje
        messages[currentIndex].classList.add('active');
        
        // Rotar mensajes cada 7 segundos (más lento para personas mayores)
        const rotateInterval = setInterval(() => {
            // Ocultar mensaje actual
            messages[currentIndex].classList.remove('active');
            
            // Avanzar al siguiente
            currentIndex = (currentIndex + 1) % messages.length;
            
            // Mostrar nuevo mensaje
            messages[currentIndex].classList.add('active');
            
            // Si llegamos al último mensaje, mostrar el botón
            if (currentIndex === messages.length - 1) {
                clearInterval(rotateInterval);
                if (continueButton) {
                    continueButton.classList.remove('hidden');
                }
            }
        }, 7000); // 7 segundos para dar tiempo a personas mayores a leer cada mensaje
        
        // Guardar intervalo para poder limpiarlo si es necesario
        this.warningInterval = rotateInterval;
        
        // Si hay 4 mensajes, después de 28 segundos (4 × 7) mostrar el botón como respaldo
        setTimeout(() => {
            clearInterval(rotateInterval);
            if (continueButton) {
                continueButton.classList.remove('hidden');
            }
        }, 28000); // 4 mensajes × 7 segundos = 28 segundos
    }

    // Configurar pantalla de multiplicador
    setupMultiplierScreen() {
        // Actualizar pregunta según singular/plural
        const multiplierQuestion = document.querySelector('#multiplier-screen .question-text');
        if (multiplierQuestion) {
            const nameInfo = this.getUserNameInfo();
            if (nameInfo.isPlural) {
                multiplierQuestion.textContent = '¿Elige por cuántos meses?';
            } else {
                multiplierQuestion.textContent = '¿Elige por cuántos meses?';
            }
        }
        
        const slider = document.getElementById('multiplier-slider');
        const multiplierValue = document.getElementById('multiplier-value');
        
        if (!slider || !multiplierValue) return;

        // Inicializar con valor 12 (por defecto)
        this.gameState.multiplier = 12;
        this.updateMultiplierDisplay();

        // Event listener para el slider
        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.gameState.multiplier = value;
            this.updateMultiplierDisplay();
        });

        // También permitir arrastrar el slider con touch
        slider.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    // Actualizar display del multiplicador
    updateMultiplierDisplay() {
        const multiplierValue = document.getElementById('multiplier-value');
        const multipliedTotal = document.getElementById('multiplied-total');
        const slider = document.getElementById('multiplier-slider');
        
        if (multiplierValue) {
            multiplierValue.textContent = this.gameState.multiplier;
        }
        
        if (slider) {
            slider.value = this.gameState.multiplier;
        }
        
        // Calcular total multiplicado
        const total = this.gameState.monthlyTotal * this.gameState.multiplier;
        this.gameState.totalAccumulated = total;
        
        if (multipliedTotal) {
            multipliedTotal.textContent = total.toFixed(2);
        }
        
        console.log(`📊 Multiplicador: ${this.gameState.multiplier} meses × $${this.gameState.monthlyTotal.toFixed(2)} = $${total.toFixed(2)}`);
    }

    // Configurar pantalla de multiplicador de años
    setupYearsMultiplierScreen() {
        // Actualizar pregunta según singular/plural
        const yearsMultiplierQuestion = document.querySelector('#years-multiplier-screen .question-text');
        if (yearsMultiplierQuestion) {
            const nameInfo = this.getUserNameInfo();
            if (nameInfo.isPlural) {
                yearsMultiplierQuestion.textContent = '¿Durante cuántos años aproximadamente será este gasto?';
            } else {
                yearsMultiplierQuestion.textContent = '¿Durante cuántos años aproximadamente será este gasto?';
            }
        }
        
        const slider = document.getElementById('years-multiplier-slider');
        const multiplierValue = document.getElementById('years-multiplier-value');
        
        if (!slider || !multiplierValue) return;

        // Inicializar con valor 1
        this.gameState.yearsMultiplier = 1;
        this.updateYearsMultiplierDisplay();

        // Event listener para el slider
        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.gameState.yearsMultiplier = value;
            this.updateYearsMultiplierDisplay();
        });

        // También permitir arrastrar el slider con touch
        slider.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    // Actualizar display del multiplicador de años
    updateYearsMultiplierDisplay() {
        const multiplierValue = document.getElementById('years-multiplier-value');
        const slider = document.getElementById('years-multiplier-slider');
        
        if (multiplierValue) {
            multiplierValue.textContent = this.gameState.yearsMultiplier;
        }
        
        if (slider) {
            slider.value = this.gameState.yearsMultiplier;
        }
        
        // Calcular total multiplicado: usar totalAccumulated (que ya tiene el multiplicador de meses aplicado) × años
        // No mostramos el resultado aquí, se mostrará en la pantalla siguiente
        const total = this.gameState.totalAccumulated * this.gameState.yearsMultiplier;
        this.gameState.yearsTotalAccumulated = total;
        
        console.log(`📊 Multiplicador de años: ${this.gameState.yearsMultiplier} años × $${this.gameState.totalAccumulated.toFixed(2)} = $${total.toFixed(2)}`);
    }

    // Mostrar resultado de años
    async showYearsResult() {
        // Calcular total final (ya está calculado en updateYearsMultiplierDisplay)
        const yearsTotal = this.gameState.yearsTotalAccumulated || 0;
        
        console.log('💰 Total acumulado por años:', yearsTotal);

        // Mostrar animación de pensamiento
        const thinking = document.getElementById('years-thinking-animation');
        const result = document.getElementById('years-calculation-result');
        const thinkingText = document.getElementById('years-thinking-text');
        
        if (thinking) thinking.classList.remove('hidden');
        if (result) result.classList.add('hidden');

        // Actualizar texto del cerebro pensando con la cantidad de años elegida según género y plural
        const yearsCount = this.gameState.yearsMultiplier || 1;
        if (thinkingText) {
            const nameInfo = this.getUserNameInfo();
            if (nameInfo.isPlural) {
                thinkingText.textContent = `➡️ Calculando sus gastos por ${yearsCount} ${yearsCount === 1 ? 'año' : 'años'}...`;
            } else {
                thinkingText.textContent = `➡️ Calculando tus gastos por ${yearsCount} ${yearsCount === 1 ? 'año' : 'años'}...`;
            }
        }

        // Iniciar narración del texto de cálculo
        this.startYearsCalculationNarration(yearsCount);

        // Esperar 8 segundos
        await this.sleep(8000);

        // Ocultar animación y mostrar resultado con luces rojas
        if (thinking) thinking.classList.add('hidden');
        if (result) {
            result.classList.remove('hidden');
            const amountEl = document.getElementById('years-total-amount');
            if (amountEl) {
                amountEl.textContent = yearsTotal.toFixed(2);
            }
            
            // Actualizar título del header con la cantidad de años
            const yearsCount = this.gameState.yearsMultiplier || 1;
            const headerTitle = document.getElementById('years-result-title');
            if (headerTitle) {
                headerTitle.textContent = `Gastos Por ${yearsCount} ${yearsCount === 1 ? 'Año' : 'Años'}`;
            }
            
            // Actualizar texto de alerta según género y plural, incluyendo la cantidad de años
            const alertWarningText = result.querySelector('.alert-warning-text');
            if (alertWarningText) {
                const nameInfo = this.getUserNameInfo();
                const yearsCount = this.gameState.yearsMultiplier || 1;
                const yearsText = yearsCount === 1 ? 'año' : 'años';
                if (nameInfo.isPlural) {
                    alertWarningText.textContent = `⚠️ Sus gastos acumulados en ${yearsCount} ${yearsText} superan los estándares normales de consumo.`;
                } else {
                    alertWarningText.textContent = `⚠️ Tus gastos acumulados en ${yearsCount} ${yearsText} superan los estándares normales de consumo.`;
                }
            }
            
            // Activar luces rojas pulsantes
            const redLights = result.querySelector('.red-lights');
            if (redLights) {
                redLights.classList.add('active');
            }

            // Iniciar alarma repetitiva cada 3 segundos
            this.startYearsRepeatingAlarm();

            // Mostrar botón de continuar
            const continueButton = document.getElementById('years-result-continue-button');
            if (continueButton) {
                continueButton.classList.remove('hidden');
            }

            // Iniciar narración
            this.startYearsResultNarration();
        }

        console.log('💾 Resultado de años guardado:', yearsTotal);
    }

    // Iniciar narración del texto de cálculo por años
    startYearsCalculationNarration(yearsCount) {
        console.log('🎤 Iniciando narración de cálculo por años...');
        
        // Verificar si SpeechSynthesis está disponible
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible');
            return;
        }

        try {
            // Detener cualquier narración previa
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
            
            // Función para iniciar la narración
            const startSpeaking = () => {
                // Obtener información del usuario
                const nameInfo = this.getUserNameInfo();
                
                // Construir el texto según género y plural
                let calculationText = '';
                if (nameInfo.isPlural) {
                    calculationText = `Calculando sus gastos por ${yearsCount} ${yearsCount === 1 ? 'año' : 'años'}`;
                } else {
                    calculationText = `Calculando tus gastos por ${yearsCount} ${yearsCount === 1 ? 'año' : 'años'}`;
                }
                
                // Crear utterance con voz humanizada
                const utterance = this.createHumanizedUtterance(calculationText, 0.88, 1.2);
                
                // Guardar referencia
                this.currentUtterance = utterance;
                
                // Evento cuando termine la lectura
                utterance.onend = () => {
                    console.log('✅ Narración de cálculo por años completada');
                    this.currentUtterance = null;
                };
                
                // Evento de error
                utterance.onerror = (event) => {
                    console.error('❌ Error en la narración de cálculo por años:', event.error);
                    this.currentUtterance = null;
                };
                
                // Iniciar la narración
                try {
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        setTimeout(() => {
                            speechSynthesis.speak(utterance);
                            console.log('🎤 Comando speak() ejecutado para cálculo por años (después de cancelar)');
                        }, 100);
                    } else {
                        speechSynthesis.speak(utterance);
                        console.log('🎤 Comando speak() ejecutado para cálculo por años');
                    }
                } catch (speakError) {
                    console.error('❌ Error al ejecutar speak() para cálculo por años:', speakError);
                }
            };

            // Verificar si las voces ya están cargadas
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                startSpeaking();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                };
                setTimeout(() => {
                    if (speechSynthesis.getVoices().length > 0) {
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces para cálculo por años');
                    }
                }, 1000);
            }
        } catch (error) {
            console.error('❌ Error al iniciar la narración de cálculo por años:', error);
        }
    }

    // Iniciar alarma repetitiva cada 3 segundos para años
    startYearsRepeatingAlarm() {
        // Limpiar intervalo anterior si existe
        if (this.yearsAlarmInterval) {
            clearInterval(this.yearsAlarmInterval);
        }

        // Reproducir alarma inmediatamente
        this.playAlarmSound();

        // Configurar intervalo para repetir cada 3 segundos
        this.yearsAlarmInterval = setInterval(() => {
            this.playAlarmSound();
        }, 3000);

        console.log('🔔 Alarma repetitiva de años iniciada (cada 3 segundos)');
    }

    // Detener alarma repetitiva de años
    stopYearsRepeatingAlarm() {
        if (this.yearsAlarmInterval) {
            clearInterval(this.yearsAlarmInterval);
            this.yearsAlarmInterval = null;
            console.log('🔕 Alarma repetitiva de años detenida');
        }
    }

    // Iniciar narración de resultado de años
    startYearsResultNarration() {
        console.log('🎤 Iniciando narración de resultado de años...');
        
        // Verificar si SpeechSynthesis está disponible
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible');
            return;
        }

        // Prevenir múltiples llamadas simultáneas
        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            // Detener cualquier narración previa
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
            
            // Marcar que estamos narrando
            this.isNarrating = true;

            // Función para iniciar la narración
            const startSpeaking = () => {
                console.log('🗣️ Preparando para hablar (resultado de años)...');
                
                // Verificar que speechSynthesis siga disponible
                if (!('speechSynthesis' in window)) {
                    console.error('❌ SpeechSynthesis ya no está disponible');
                    this.isNarrating = false;
                    return;
                }

                // Usar la voz centralizada
                const spanishVoice = this.selectVoice();
                const voices = speechSynthesis.getVoices();
                
                // Crear función para crear utterance con la voz configurada
                const createUtterance = (text, rate = 0.88) => {
                    return this.createHumanizedUtterance(text, rate, 1.2);
                };

                // Obtener información del usuario
                const nameInfo = this.getUserNameInfo();
                const userName = this.gameState.userName || '';
                
                // Obtener el monto total acumulado
                const yearsTotal = this.gameState.yearsTotalAccumulated || 0;
                const formattedTotal = yearsTotal.toLocaleString('es-ES', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                
                // Construir el texto de narración según género y plural
                let narrationText = '';
                
                // Nombre del usuario
                if (userName) {
                    narrationText += `${userName}, `;
                }
                
                // Texto principal con lógica de género y plural
                if (nameInfo.isPlural) {
                    narrationText += 'como pueden ver, sus gastos superan los estándares de consumo, convirtiéndose esto en una pérdida monetaria importante para ustedes. Si no toman una medida, nunca podrán rescatar este dinero. ';
                    // Frase final para plural
                    narrationText += `Ustedes podrían estar perdiendo $${formattedTotal}.`;
                } else {
                    // Singular: "puede" y "sus gastos", "toma" y "podrá" según género
                    narrationText += 'como puede ver, sus gastos superan los estándares de consumo, convirtiéndose esto en una pérdida monetaria importante para usted. Si no toma una medida, nunca podrá rescatar este dinero. ';
                    // Frase final para singular
                    narrationText += `Usted podría estar perdiendo $${formattedTotal}.`;
                }
                
                // Crear utterance con el texto completo
                const utterance = createUtterance(narrationText, 0.85);
                
                // Event listeners
                utterance.onend = () => {
                    console.log('✅ Narración de resultado de años completada');
                    this.isNarrating = false;
                    this.currentUtterance = null;
                };
                
                utterance.onerror = (event) => {
                    console.error('❌ Error en narración de resultado de años:', event);
                    this.isNarrating = false;
                    this.currentUtterance = null;
                };
                
                // Guardar referencia y comenzar
                this.currentUtterance = utterance;
                speechSynthesis.speak(utterance);
            };

            // Iniciar inmediatamente si las voces ya están cargadas
            if (speechSynthesis.getVoices().length > 0) {
                startSpeaking();
            } else {
                // Esperar a que las voces se carguen
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                    speechSynthesis.onvoiceschanged = null; // Limpiar listener
                };
            }
        } catch (error) {
            console.error('❌ Error al iniciar narración de resultado de años:', error);
            this.isNarrating = false;
        }
    }

    // Mostrar pantalla de análisis
    setupAnalysisScreen() {
        // Actualizar el texto según singular/plural
        const analysisThinkingText = document.getElementById('analysis-thinking-text');
        if (analysisThinkingText) {
            const nameInfo = this.getUserNameInfo();
            if (nameInfo.isPlural) {
                analysisThinkingText.textContent = '➡️ Analizando su situación...';
            } else {
                analysisThinkingText.textContent = '➡️ Analizando tu situación...';
            }
        }
    }

    async showAnalysis() {
        // Mostrar animación de pensamiento
        const thinking = document.getElementById('analysis-thinking-animation');
        
        if (thinking) {
            thinking.classList.remove('hidden');
        }

        // Iniciar narración
        this.startAnalysisNarration();

        // Esperar tiempo para narración (~4 segundos) + 5 segundos adicionales = 9 segundos total
        await this.sleep(9000);

        // Avanzar automáticamente a la pantalla de felicidades
        this.transitionToScreen('prize');
    }

    // Iniciar narración de análisis
    async startAnalysisNarration() {
        console.log('🎤 Iniciando narración de análisis...');
        
        // Verificar si SpeechSynthesis está disponible
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible');
            return;
        }

        // Prevenir múltiples llamadas simultáneas
        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            // Detener cualquier narración previa
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
            
            // Marcar que estamos narrando
            this.isNarrating = true;

            // Función para iniciar la narración
            const startSpeaking = () => {
                console.log('🗣️ Preparando para hablar (análisis)...');
                
                // Verificar que speechSynthesis siga disponible
                if (!('speechSynthesis' in window)) {
                    console.error('❌ SpeechSynthesis ya no está disponible');
                    this.isNarrating = false;
                    return;
                }

                // Texto a leer según singular/plural
                const nameInfo = this.getUserNameInfo();
                const analysisText = nameInfo.isPlural 
                    ? 'Analizando su situación. Obteniendo resultados de calificación.'
                    : 'Analizando tu situación. Obteniendo resultados de calificación.';
                
                // Crear utterance con voz humanizada
                const utterance = this.createHumanizedUtterance(analysisText, 0.88, 1.2);

                // Guardar referencia
                this.currentUtterance = utterance;

                // Evento cuando termine la lectura
                utterance.onend = () => {
                    console.log('✅ Narración de análisis completada');
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                // Evento de error
                utterance.onerror = (event) => {
                    console.error('❌ Error en la narración de análisis:', event.error);
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                // Evento cuando comienza
                utterance.onstart = () => {
                    console.log('🔊 Narración de análisis iniciada correctamente');
                };

                // Iniciar la narración
                try {
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        setTimeout(() => {
                            speechSynthesis.speak(utterance);
                            console.log('🎤 Comando speak() ejecutado para análisis (después de cancelar)');
                        }, 100);
                    } else {
                        speechSynthesis.speak(utterance);
                        console.log('🎤 Comando speak() ejecutado para análisis');
                    }
                } catch (speakError) {
                    console.error('❌ Error al ejecutar speak() para análisis:', speakError);
                    this.isNarrating = false;
                }
            };

            // Verificar si las voces ya están cargadas
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                startSpeaking();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                };
                setTimeout(() => {
                    if (speechSynthesis.getVoices().length > 0) {
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces para análisis');
                        this.isNarrating = false;
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error al iniciar la narración de análisis:', error);
            this.isNarrating = false;
        }
    }

    setupValidationScreen() {
        // Actualizar el texto según singular/plural y género
        const validationQuestion = document.querySelector('.validation-question');
        if (validationQuestion) {
            const nameInfo = this.getUserNameInfo();
            if (nameInfo.isPlural) {
                validationQuestion.textContent = '⚠️ ¿Seguro que los montos de precios ingresados, reflejan el aproximado de sus gastos al mes?';
            } else {
                validationQuestion.textContent = '⚠️ ¿Seguro que los montos de precios ingresados, reflejan el aproximado de tus gastos al mes?';
            }
        }
    }

    // Iniciar narración de validación
    startValidationNarration() {
        console.log('🎤 Iniciando narración de validación...');
        
        // Verificar si SpeechSynthesis está disponible
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible');
            return;
        }

        // Prevenir múltiples llamadas simultáneas
        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            // Detener cualquier narración previa
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
            
            // Marcar que estamos narrando
            this.isNarrating = true;

            // Función para iniciar la narración
            const startSpeaking = () => {
                console.log('🗣️ Preparando para hablar (validación)...');
                
                // Verificar que speechSynthesis siga disponible
                if (!('speechSynthesis' in window)) {
                    console.error('❌ SpeechSynthesis ya no está disponible');
                    this.isNarrating = false;
                    return;
                }

                // Texto a leer según singular/plural y género
                const nameInfo = this.getUserNameInfo();
                const validationText = nameInfo.isPlural 
                    ? '¿Seguro que los montos de precios ingresados, reflejan el aproximado de sus gastos al mes?'
                    : '¿Seguro que los montos de precios ingresados, reflejan el aproximado de tus gastos al mes?';
                
                // Crear utterance
                const utterance = new SpeechSynthesisUtterance(validationText);
                utterance.lang = 'es-ES';
                utterance.rate = 0.95;
                utterance.pitch = 1.5;
                utterance.volume = 1.0;

                // Usar la voz centralizada
                const spanishVoice = this.selectVoice();
                const voices = speechSynthesis.getVoices();
                
                if (spanishVoice) {
                    utterance.voice = spanishVoice;
                    utterance.pitch = 1.5;
                    console.log('✅ Usando voz centralizada para validación:', spanishVoice.name);
                } else if (voices.length > 0) {
                    utterance.voice = voices[0];
                    utterance.pitch = 1.6;
                    console.log('⚠️ Usando voz predeterminada (fallback):', voices[0].name);
                }

                // Guardar referencia
                this.currentUtterance = utterance;

                // Evento cuando termine la lectura
                utterance.onend = () => {
                    console.log('✅ Narración de validación completada');
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                // Evento de error
                utterance.onerror = (event) => {
                    console.error('❌ Error en la narración de validación:', event.error);
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                // Evento cuando comienza
                utterance.onstart = () => {
                    console.log('🔊 Narración de validación iniciada correctamente');
                };

                // Iniciar la narración
                try {
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        setTimeout(() => {
                            speechSynthesis.speak(utterance);
                            console.log('🎤 Comando speak() ejecutado para validación (después de cancelar)');
                        }, 100);
                    } else {
                        speechSynthesis.speak(utterance);
                        console.log('🎤 Comando speak() ejecutado para validación');
                    }
                } catch (speakError) {
                    console.error('❌ Error al ejecutar speak() para validación:', speakError);
                    this.isNarrating = false;
                }
            };

            // Verificar si las voces ya están cargadas
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                startSpeaking();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                };
                setTimeout(() => {
                    if (speechSynthesis.getVoices().length > 0) {
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces para validación');
                        this.isNarrating = false;
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error al iniciar la narración de validación:', error);
            this.isNarrating = false;
        }
    }

    setupPrizeScreen() {
        // Actualizar textos según singular/plural
        const nameInfo = this.getUserNameInfo();
        const prizeMainText = document.querySelector('.prize-main-text');
        const prizeQuestionText = document.querySelector('.prize-question-text');
        
        if (prizeMainText) {
            if (nameInfo.isPlural) {
                prizeMainText.innerHTML = 'Han calificado para recibir <strong>GRATIS</strong> la dotación de todos los productos evaluados, durante <strong>5 AÑOS consecutivos</strong>. Todo esto incluidos con la adquisición del <strong>Purificador de Agua Pasteur Water System</strong>.';
            } else {
                prizeMainText.innerHTML = 'Has calificado para recibir <strong>GRATIS</strong> la dotación de todos los productos evaluados, durante <strong>5 AÑOS consecutivos</strong>. Todo esto incluidos con la adquisición del <strong>Purificador de Agua Pasteur Water System</strong>.';
            }
        }
        
        if (prizeQuestionText) {
            if (nameInfo.isPlural) {
                prizeQuestionText.textContent = '¿Al comenzar desde hoy mismo lo harían por ?';
            } else {
                // Aplicar género: "lo harías" para mujer, "lo haría" para hombre
                const wouldDoText = nameInfo.isFeminine ? 'lo harías' : 'lo haría';
                prizeQuestionText.textContent = `¿Al comenzar desde hoy mismo ${wouldDoText} por ?`;
            }
        }
    }

    setupBenefitAhorroScreen() {
        const nameInfo = this.getUserNameInfo();
        const benefitText = document.querySelector('#benefit-ahorro-screen .benefit-detail-text');
        if (benefitText) {
            if (nameInfo.isPlural) {
                benefitText.textContent = 'Invertir una sola vez para dejar de pagar agua embotellada todos los meses. Su cerebro percibe control financiero y menor gasto futuro.';
            } else {
                benefitText.textContent = 'Invertir una sola vez para dejar de pagar agua embotellada todos los meses. Tu cerebro percibe control financiero y menor gasto futuro.';
            }
        }
    }

    startBenefitAhorroNarration() {
        console.log('🎤 Iniciando narración de beneficio Ahorro...');
        
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible');
            return;
        }

        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            this.stopWelcomeNarration();
            speechSynthesis.cancel();
            this.isNarrating = true;

            const startSpeaking = () => {
                const nameInfo = this.getUserNameInfo();
                const textToRead = nameInfo.isPlural 
                    ? 'Ahorro. Invertir una sola vez para dejar de pagar agua embotellada todos los meses. Su cerebro percibe control financiero y menor gasto futuro. Felicidades!'
                    : 'Ahorro. Invertir una sola vez para dejar de pagar agua embotellada todos los meses. Tu cerebro percibe control financiero y menor gasto futuro. Felicidades!';
                
                const utterance = new SpeechSynthesisUtterance(textToRead);
                utterance.lang = 'es-ES';
                utterance.rate = 0.95;
                utterance.pitch = 1.5;
                utterance.volume = 1.0;

                const spanishVoice = this.selectVoice();
                const voices = speechSynthesis.getVoices();
                
                if (spanishVoice) {
                    utterance.voice = spanishVoice;
                    utterance.pitch = 1.5;
                } else if (voices.length > 0) {
                    utterance.voice = voices[0];
                    utterance.pitch = 1.6;
                }

                this.currentUtterance = utterance;

                utterance.onend = () => {
                    console.log('✅ Narración de Ahorro completada');
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                utterance.onerror = (event) => {
                    console.error('❌ Error en la narración de Ahorro:', event.error);
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                utterance.onstart = () => {
                    console.log('🔊 Narración de Ahorro iniciada');
                };

                try {
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        setTimeout(() => {
                            speechSynthesis.speak(utterance);
                            console.log('🎤 Comando speak() ejecutado para Ahorro (después de cancelar)');
                        }, 100);
                    } else {
                        speechSynthesis.speak(utterance);
                        console.log('🎤 Comando speak() ejecutado para Ahorro');
                    }
                } catch (speakError) {
                    console.error('❌ Error al ejecutar speak() para Ahorro:', speakError);
                    this.isNarrating = false;
                }
            };

            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                startSpeaking();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                };
                setTimeout(() => {
                    if (speechSynthesis.getVoices().length > 0) {
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces para Ahorro');
                        this.isNarrating = false;
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error al iniciar la narración de Ahorro:', error);
            this.isNarrating = false;
        }
    }

    setupBenefitSaludScreen() {
        const nameInfo = this.getUserNameInfo();
        const benefitText = document.querySelector('#benefit-salud-screen .benefit-detail-text');
        if (benefitText) {
            if (nameInfo.isPlural) {
                benefitText.textContent = 'Agua libre de contaminantes que su cuerpo reconoce como segura. Menos carga tóxica, más energía y bienestar a largo plazo.';
            } else {
                benefitText.textContent = 'Agua libre de contaminantes que tu cuerpo reconoce como segura. Menos carga tóxica, más energía y bienestar a largo plazo.';
            }
        }
    }

    startBenefitSaludNarration() {
        console.log('🎤 Iniciando narración de beneficio Salud...');
        
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible');
            return;
        }

        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            this.stopWelcomeNarration();
            speechSynthesis.cancel();
            this.isNarrating = true;

            const startSpeaking = () => {
                const nameInfo = this.getUserNameInfo();
                const textToRead = nameInfo.isPlural 
                    ? 'Salud. Agua libre de contaminantes que su cuerpo reconoce como segura. Menos carga tóxica, más energía y bienestar a largo plazo. Felicidades!'
                    : 'Salud. Agua libre de contaminantes que tu cuerpo reconoce como segura. Menos carga tóxica, más energía y bienestar a largo plazo. Felicidades!';
                
                const utterance = new SpeechSynthesisUtterance(textToRead);
                utterance.lang = 'es-ES';
                utterance.rate = 0.95;
                utterance.pitch = 1.5;
                utterance.volume = 1.0;

                const spanishVoice = this.selectVoice();
                const voices = speechSynthesis.getVoices();
                
                if (spanishVoice) {
                    utterance.voice = spanishVoice;
                    utterance.pitch = 1.5;
                } else if (voices.length > 0) {
                    utterance.voice = voices[0];
                    utterance.pitch = 1.6;
                }

                this.currentUtterance = utterance;

                utterance.onend = () => {
                    console.log('✅ Narración de Salud completada');
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                utterance.onerror = (event) => {
                    console.error('❌ Error en la narración de Salud:', event.error);
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                utterance.onstart = () => {
                    console.log('🔊 Narración de Salud iniciada');
                };

                try {
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        setTimeout(() => {
                            speechSynthesis.speak(utterance);
                            console.log('🎤 Comando speak() ejecutado para Salud (después de cancelar)');
                        }, 100);
                    } else {
                        speechSynthesis.speak(utterance);
                        console.log('🎤 Comando speak() ejecutado para Salud');
                    }
                } catch (speakError) {
                    console.error('❌ Error al ejecutar speak() para Salud:', speakError);
                    this.isNarrating = false;
                }
            };

            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                startSpeaking();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                };
                setTimeout(() => {
                    if (speechSynthesis.getVoices().length > 0) {
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces para Salud');
                        this.isNarrating = false;
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error al iniciar la narración de Salud:', error);
            this.isNarrating = false;
        }
    }

    setupBenefitTranquilidadScreen() {
        const nameInfo = this.getUserNameInfo();
        const benefitText = document.querySelector('#benefit-tranquilidad-screen .benefit-detail-text');
        if (benefitText) {
            if (nameInfo.isPlural) {
                benefitText.textContent = 'La certeza diaria de que ustedes y su familia beben agua confiable sin preocuparse por lo invisible. Descanso mental automático.';
            } else {
                benefitText.textContent = 'La certeza diaria de que tú y tu familia beben agua confiable sin preocuparse por lo invisible. Descanso mental automático.';
            }
        }
    }

    startBenefitTranquilidadNarration() {
        console.log('🎤 Iniciando narración de beneficio Tranquilidad...');
        
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible');
            return;
        }

        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            this.stopWelcomeNarration();
            speechSynthesis.cancel();
            this.isNarrating = true;

            const startSpeaking = () => {
                const nameInfo = this.getUserNameInfo();
                const textToRead = nameInfo.isPlural 
                    ? 'Tranquilidad. La certeza diaria de que ustedes y su familia beben agua confiable sin preocuparse por lo invisible. Descanso mental automático. Felicidades!'
                    : 'Tranquilidad. La certeza diaria de que tú y tu familia beben agua confiable sin preocuparse por lo invisible. Descanso mental automático. Felicidades!';
                
                const utterance = new SpeechSynthesisUtterance(textToRead);
                utterance.lang = 'es-ES';
                utterance.rate = 0.95;
                utterance.pitch = 1.5;
                utterance.volume = 1.0;

                const spanishVoice = this.selectVoice();
                const voices = speechSynthesis.getVoices();
                
                if (spanishVoice) {
                    utterance.voice = spanishVoice;
                    utterance.pitch = 1.5;
                } else if (voices.length > 0) {
                    utterance.voice = voices[0];
                    utterance.pitch = 1.6;
                }

                this.currentUtterance = utterance;

                utterance.onend = () => {
                    console.log('✅ Narración de Tranquilidad completada');
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                utterance.onerror = (event) => {
                    console.error('❌ Error en la narración de Tranquilidad:', event.error);
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                utterance.onstart = () => {
                    console.log('🔊 Narración de Tranquilidad iniciada');
                };

                try {
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        setTimeout(() => {
                            speechSynthesis.speak(utterance);
                            console.log('🎤 Comando speak() ejecutado para Tranquilidad (después de cancelar)');
                        }, 100);
                    } else {
                        speechSynthesis.speak(utterance);
                        console.log('🎤 Comando speak() ejecutado para Tranquilidad');
                    }
                } catch (speakError) {
                    console.error('❌ Error al ejecutar speak() para Tranquilidad:', speakError);
                    this.isNarrating = false;
                }
            };

            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                startSpeaking();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                };
                setTimeout(() => {
                    if (speechSynthesis.getVoices().length > 0) {
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces para Tranquilidad');
                        this.isNarrating = false;
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error al iniciar la narración de Tranquilidad:', error);
            this.isNarrating = false;
        }
    }

    setupSpecialistScreen() {
        const nameInfo = this.getUserNameInfo();
        const specialistText = document.querySelector('.specialist-text');
        if (specialistText) {
            if (nameInfo.isPlural) {
                specialistText.textContent = 'Felicidades, nuestros especialistas les ayudarán en todo desde ya mismo.';
            } else {
                specialistText.textContent = 'Felicidades, nuestros especialistas le ayudarán en todo desde ya mismo.';
            }
        }
    }

    // Iniciar narración de especialista
    startSpecialistNarration() {
        console.log('🎤 Iniciando narración de especialista...');
        
        // Verificar si SpeechSynthesis está disponible
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible');
            return;
        }

        // Prevenir múltiples llamadas simultáneas
        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            // Detener cualquier narración previa
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
            
            // Marcar que estamos narrando
            this.isNarrating = true;

            // Función para iniciar la narración
            const startSpeaking = () => {
                console.log('🗣️ Preparando para hablar (especialista)...');
                
                // Verificar que speechSynthesis siga disponible
                if (!('speechSynthesis' in window)) {
                    console.error('❌ SpeechSynthesis ya no está disponible');
                    this.isNarrating = false;
                    return;
                }

                // Usar la voz centralizada
                const spanishVoice = this.selectVoice();
                const voices = speechSynthesis.getVoices();
                
                // Crear función para crear utterance con la voz configurada
                const createUtterance = (text, rate = 0.88) => {
                    return this.createHumanizedUtterance(text, rate, 1.2);
                };

                // Obtener información del usuario
                const nameInfo = this.getUserNameInfo();
                
                // Construir el texto de narración según género y plural
                let narrationText = '';
                
                if (nameInfo.isPlural) {
                    narrationText = 'Felicidades, nuestros especialistas les ayudarán en todo desde ya mismo.';
                } else {
                    narrationText = 'Felicidades, nuestros especialistas le ayudarán en todo desde ya mismo.';
                }
                
                // Crear utterance con el texto completo
                const utterance = createUtterance(narrationText, 0.85);
                
                // Event listeners
                utterance.onend = () => {
                    console.log('✅ Narración de especialista completada');
                    this.isNarrating = false;
                    this.currentUtterance = null;
                };
                
                utterance.onerror = (event) => {
                    console.error('❌ Error en narración de especialista:', event);
                    this.isNarrating = false;
                    this.currentUtterance = null;
                };
                
                // Guardar referencia y comenzar
                this.currentUtterance = utterance;
                speechSynthesis.speak(utterance);
            };

            // Iniciar inmediatamente si las voces ya están cargadas
            if (speechSynthesis.getVoices().length > 0) {
                startSpeaking();
            } else {
                // Esperar a que las voces se carguen
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                    speechSynthesis.onvoiceschanged = null; // Limpiar listener
                };
            }
        } catch (error) {
            console.error('❌ Error al iniciar narración de especialista:', error);
            this.isNarrating = false;
        }
    }

    // Iniciar narración de premio/felicidades
    startPrizeNarration() {
        console.log('🎤 Iniciando narración de premio...');
        
        // Verificar si SpeechSynthesis está disponible
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible');
            return;
        }

        // Prevenir múltiples llamadas simultáneas
        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            // Detener cualquier narración previa
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
            
            // Marcar que estamos narrando
            this.isNarrating = true;

            // Función para iniciar la narración
            const startSpeaking = () => {
                console.log('🗣️ Preparando para hablar (premio)...');
                
                // Verificar que speechSynthesis siga disponible
                if (!('speechSynthesis' in window)) {
                    console.error('❌ SpeechSynthesis ya no está disponible');
                    this.isNarrating = false;
                    return;
                }

                // Usar la voz centralizada
                const spanishVoice = this.selectVoice();
                const voices = speechSynthesis.getVoices();
                
                // Crear función para crear utterance con la voz configurada
                const createUtterance = (text, rate = 0.88) => {
                    return this.createHumanizedUtterance(text, rate, 1.2);
                };

                // Secuencia de narraciones con pausas naturales (actualizada según género y plural)
                const nameInfo = this.getUserNameInfo();
                let questionText;
                if (nameInfo.isPlural) {
                    questionText = '¿Al comenzar desde hoy mismo lo harían por?';
                } else {
                    // Aplicar género: "lo harías" para mujer, "lo haría" para hombre
                    questionText = nameInfo.isFeminine 
                        ? '¿Al comenzar desde hoy mismo lo harías por?'
                        : '¿Al comenzar desde hoy mismo lo haría por?';
                }
                
                const texts = [
                    '¡Felicidades!',
                    nameInfo.isPlural 
                        ? 'Han calificado para recibir gratis la dotación de todos los productos evaluados, durante 5 años consecutivos.'
                        : 'Has calificado para recibir gratis la dotación de todos los productos evaluados, durante 5 años consecutivos.',
                    'Todo esto incluido con la adquisición del Purificador de Agua Pasteur Water System.',
                    questionText,
                    'Ahorro.',
                    'Salud.',
                    'Tranquilidad.'
                ];

                let currentIndex = 0;
                
                const speakNext = () => {
                    if (currentIndex >= texts.length) {
                        console.log('✅ Narración de premio completada');
                        this.currentUtterance = null;
                        this.isNarrating = false;
                        return;
                    }

                    const text = texts[currentIndex];
                    const utterance = createUtterance(text);
                    this.currentUtterance = utterance;

                    utterance.onend = () => {
                        currentIndex++;
                        // Pausa entre textos (más larga después de la pregunta)
                        const pause = (currentIndex === 4) ? 800 : 500; // Pausa más larga antes de los botones
                        setTimeout(() => {
                            speakNext();
                        }, pause);
                    };

                    utterance.onerror = (event) => {
                        console.error('❌ Error en la narración de premio:', event.error);
                        this.currentUtterance = null;
                        this.isNarrating = false;
                    };

                    if (currentIndex === 0) {
                        utterance.onstart = () => {
                            console.log('🔊 Narración de premio iniciada correctamente');
                        };
                    }

                    try {
                        speechSynthesis.speak(utterance);
                        console.log(`🎤 Hablando parte ${currentIndex + 1} de ${texts.length}: "${text}"`);
                    } catch (speakError) {
                        console.error('❌ Error al ejecutar speak() para premio:', speakError);
                        this.isNarrating = false;
                    }
                };

                // Iniciar la secuencia
                try {
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        setTimeout(() => {
                            speakNext();
                        }, 100);
                    } else {
                        speakNext();
                    }
                } catch (speakError) {
                    console.error('❌ Error al iniciar narración de premio:', speakError);
                    this.isNarrating = false;
                }
            };

            // Verificar si las voces ya están cargadas
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                startSpeaking();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                };
                setTimeout(() => {
                    if (speechSynthesis.getVoices().length > 0) {
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces para premio');
                        this.isNarrating = false;
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error al iniciar la narración de premio:', error);
            this.isNarrating = false;
        }
    }

    // Mostrar confetti
    showConfetti() {
        const container = document.getElementById('confetti-container');
        if (!container) return;

        // Reproducir sonido de premio
        this.playPrizeSound();

        // Crear más confetti para un efecto más impactante
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#4CAF50', '#ffc107', '#ff5722'];
            const shapes = ['circle', 'square', 'triangle'];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            
            confetti.style.cssText = `
                position: absolute;
                width: ${8 + Math.random() * 12}px;
                height: ${8 + Math.random() * 12}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                border-radius: ${shape === 'circle' ? '50%' : shape === 'square' ? '0' : '0'};
                clip-path: ${shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'};
                animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
                z-index: 1000;
            `;
            container.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }
    }

    // Reproducir sonido de premio/triunfo (fanfarria emocionante)
    playPrizeSound() {
        try {
            setTimeout(() => {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const now = audioContext.currentTime;
                
                // Crear fanfarria de triunfo con múltiples secuencias de acordes
                // Secuencia 1: Acorde mayor brillante (Do-Mi-Sol-Do)
                const playFanfareChord = (startTime, frequencies, duration, volume = 0.4) => {
                const gainNode = audioContext.createGain();
                gainNode.connect(audioContext.destination);
                
                    frequencies.forEach((freq, index) => {
                        const osc = audioContext.createOscillator();
                        osc.type = index === 0 ? 'triangle' : 'sine'; // Primer tono más brillante
                        osc.frequency.setValueAtTime(freq, startTime);
                        osc.connect(gainNode);
                        
                        gainNode.gain.setValueAtTime(0, startTime);
                        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
                        gainNode.gain.exponentialRampToValueAtTime(volume * 0.3, startTime + duration * 0.6);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                        
                        osc.start(startTime);
                        osc.stop(startTime + duration);
                    });
                };
                
                // Primera secuencia: Acorde Do mayor (C-E-G-C) - Alegre y brillante
                playFanfareChord(now, [523.25, 659.25, 783.99, 1046.50], 0.5, 0.35);
                
                // Segunda secuencia: Acorde Sol mayor (G-B-D-G) - Más alto y triunfante
                setTimeout(() => {
                    playFanfareChord(now + 0.3, [783.99, 987.77, 1174.66, 1567.98], 0.6, 0.4);
                }, 300);
                
                // Tercera secuencia: Acorde Do mayor más agudo - Final triunfante
                setTimeout(() => {
                    playFanfareChord(now + 0.7, [1046.50, 1318.51, 1567.98, 2093.00], 0.8, 0.45);
                }, 700);
                
                // Cuarta secuencia: Escala ascendente rápida para el final emocionante
                setTimeout(() => {
                    const scaleFreqs = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
                    scaleFreqs.forEach((freq, index) => {
                        const osc = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        osc.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(freq, now + 1.2 + (index * 0.08));
                        
                        const noteStart = now + 1.2 + (index * 0.08);
                        gainNode.gain.setValueAtTime(0, noteStart);
                        gainNode.gain.linearRampToValueAtTime(0.3, noteStart + 0.02);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.1);
                        
                        osc.start(noteStart);
                        osc.stop(noteStart + 0.1);
                    });
                }, 1200);
                
                console.log('🎉 Sonido de triunfo reproducido');
            }, 50);
        } catch (error) {
            console.log('Audio no disponible');
        }
    }

    // Timer
    startTimer(screen, seconds, callback, customTimerEl = null) {
        this.stopTimer(screen);
        let timerEl = customTimerEl;
        
        if (!timerEl) {
            // Determinar el elemento del timer según la pantalla
            if (screen === 'price') {
                timerEl = document.getElementById('timer-seconds');
            } else if (screen === 'quantity') {
                timerEl = document.getElementById('quantity-timer-seconds');
            } else {
                timerEl = document.getElementById(`${screen}-seconds`);
            }
        }
        
        // Inicializar AudioContext antes de comenzar el timer
        this.initAudioContext();
        
        // Asegurar que el AudioContext esté activo antes de comenzar
        const ensureAudioReady = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('✅ AudioContext listo para timer');
                    startTimerCountdown();
                }).catch(() => {
                    console.warn('⚠️ No se pudo resumir AudioContext, continuando de todas formas');
                    startTimerCountdown();
                });
            } else {
                startTimerCountdown();
            }
        };
        
        // Resetear contador de tick-tock para cada timer
        this.clockTickCounter = 0;
        
        let remaining = seconds;

        const startTimerCountdown = () => {
            const update = () => {
                if (timerEl) timerEl.textContent = remaining;
                
                // Reproducir sonido de reloj en cada segundo (incluyendo el primero)
                if (remaining > 0) {
                    // Reproducir sonido inmediatamente
                    this.playClockTickSound();
                }
                
                if (remaining <= 0) {
                    callback();
                } else {
                    remaining--;
                    // Programar siguiente actualización
                    this.timers[screen] = setTimeout(update, 1000);
                }
            };
            
            // Iniciar inmediatamente (reproduce sonido en el segundo 15)
            update();
        };
        
        // Asegurar que el audio esté listo antes de comenzar
        ensureAudioReady();
    }

    stopTimer(screen) {
        if (this.timers[screen]) {
            clearTimeout(this.timers[screen]);
            delete this.timers[screen];
        }
    }

    // Utilidad: sleep
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Generar tabla de resumen
    generateSummaryTable() {
        const container = document.getElementById('summary-table-container');
        if (!container) return;

        const state = this.gameState;
        
        // Limpiar contenedor
        container.innerHTML = '';

        let html = '';

        // 1. Gastos de Limpieza y Aseo
        html += '<div class="summary-section">';
        html += '<h3 class="summary-section-title">🧹 Gastos de Limpieza y Aseo</h3>';
        html += '<table class="summary-table">';
        html += '<thead><tr><th>Producto</th><th>Precio (USD)</th><th>Cantidad</th><th>Total (USD)</th></tr></thead>';
        html += '<tbody>';
        
        let cleaningTotal = 0;
        if (state.products && state.products.length > 0) {
            // Filtrar solo productos que tienen precio > 0 y cantidad > 0 para evitar mostrar productos vacíos o duplicados
            const validProducts = state.products.filter(product => {
                const hasPrice = product.price && product.price > 0;
                const hasQuantity = product.quantity && product.quantity > 0;
                return hasPrice && hasQuantity;
            });
            
            validProducts.forEach(product => {
                const productInfo = PRODUCT_DATA.products.find(p => p.name === product.product);
                const emoji = productInfo ? productInfo.emoji : '🧴';
                html += `<tr>`;
                html += `<td>${emoji} ${product.product}</td>`;
                html += `<td>$${product.price.toFixed(2)}</td>`;
                html += `<td>${product.quantity}</td>`;
                html += `<td>$${product.total.toFixed(2)}</td>`;
                html += `</tr>`;
                cleaningTotal += product.total;
            });
        }
        
        html += '<tr class="summary-total-row">';
        html += '<td colspan="3"><strong>Total Gastos de Limpieza y Aseo:</strong></td>';
        html += `<td><strong>$${cleaningTotal.toFixed(2)}</strong></td>`;
        html += '</tr>';
        html += '</tbody></table>';
        html += '</div>';

        // 2. Gastos de Agua
        html += '<div class="summary-section">';
        html += '<h3 class="summary-section-title">💧 Gastos de Agua al Mes</h3>';
        html += '<table class="summary-table">';
        html += '<thead><tr><th>Concepto</th><th>Valor</th></tr></thead>';
        html += '<tbody>';
        
        const waterTypeInfo = PRODUCT_DATA.waterTypes.find(wt => wt.value === state.waterType);
        const waterTypeName = waterTypeInfo ? `${waterTypeInfo.emoji} ${waterTypeInfo.name}` : 'No seleccionado';
        
        html += `<tr><td>Tipo de Agua</td><td>${waterTypeName}</td></tr>`;
        if (state.waterFrequency) {
            html += `<tr><td>Frecuencia por Semana</td><td>${state.waterFrequency} vez${state.waterFrequency > 1 ? 'es' : ''}</td></tr>`;
        }
        if (state.waterPrice) {
            html += `<tr><td>Precio por Compra</td><td>$${state.waterPrice.toFixed(2)}</td></tr>`;
        }
        
        html += '<tr class="summary-total-row">';
        html += '<td><strong>Total Gastos de Agua al Mes:</strong></td>';
        html += `<td><strong>$${state.waterMonthlyTotal.toFixed(2)}</strong></td>`;
        html += '</tr>';
        html += '</tbody></table>';
        html += '</div>';

        // 3. Sumatoria General
        const generalTotal = cleaningTotal + state.waterMonthlyTotal;
        html += '<div class="summary-section">';
        html += '<h3 class="summary-section-title">💰 Sumatoria General</h3>';
        html += '<table class="summary-table">';
        html += '<thead><tr><th>Concepto</th><th>Total (USD)</th></tr></thead>';
        html += '<tbody>';
        html += `<tr><td>Gastos de Limpieza y Aseo</td><td>$${cleaningTotal.toFixed(2)}</td></tr>`;
        html += `<tr><td>Gastos de Agua al Mes</td><td>$${state.waterMonthlyTotal.toFixed(2)}</td></tr>`;
        html += '<tr class="summary-total-row">';
        html += '<td><strong>Total General Mensual:</strong></td>';
        html += `<td><strong>$${generalTotal.toFixed(2)}</strong></td>`;
        html += '</tr>';
        html += '</tbody></table>';
        html += '</div>';

        // 4. Multiplicador de 12 Meses
        const multiplier = state.multiplier || 12;
        const yearTotal = generalTotal * multiplier;
        html += '<div class="summary-section">';
        html += '<h3 class="summary-section-title">📅 Multiplicador de Meses</h3>';
        html += '<table class="summary-table">';
        html += '<thead><tr><th>Concepto</th><th>Valor</th></tr></thead>';
        html += '<tbody>';
        html += `<tr><td>Total Mensual</td><td>$${generalTotal.toFixed(2)}</td></tr>`;
        html += `<tr><td>Multiplicador (Meses)</td><td>${multiplier}</td></tr>`;
        html += '<tr class="summary-total-row">';
        html += '<td><strong>Total por Año:</strong></td>';
        html += `<td><strong>$${yearTotal.toFixed(2)}</strong></td>`;
        html += '</tr>';
        html += '</tbody></table>';
        html += '</div>';

        // 5. Multiplicador de Años
        const yearsMultiplier = state.yearsMultiplier || 1;
        const yearsTotal = yearTotal * yearsMultiplier;
        html += '<div class="summary-section">';
        html += '<h3 class="summary-section-title">⏰ Multiplicador de Años</h3>';
        html += '<table class="summary-table">';
        html += '<thead><tr><th>Concepto</th><th>Valor</th></tr></thead>';
        html += '<tbody>';
        html += `<tr><td>Total por Año</td><td>$${yearTotal.toFixed(2)}</td></tr>`;
        html += `<tr><td>Multiplicador (Años)</td><td>${yearsMultiplier}</td></tr>`;
        html += '<tr class="summary-grand-total">';
        html += '<td><strong>Total Acumulado Final:</strong></td>';
        html += `<td><strong>$${yearsTotal.toFixed(2)}</strong></td>`;
        html += '</tr>';
        html += '</tbody></table>';
        html += '</div>';

        container.innerHTML = html;
        console.log('✅ Tabla de resumen generada correctamente');
    }

    // Descargar PDF del resumen
    downloadSummaryPDF() {
        console.log('📥 Iniciando descarga de PDF...');
        try {
            // Verificar que jsPDF esté disponible
            if (typeof window.jspdf === 'undefined') {
                console.error('❌ jsPDF no está disponible');
                alert('Error: La librería para generar PDF no está cargada. Por favor, recarga la página.');
                return;
            }

            console.log('✅ jsPDF está disponible');
            const { jsPDF } = window.jspdf;
            
            // Verificar que jsPDF sea una función
            if (typeof jsPDF !== 'function') {
                console.error('❌ jsPDF no es una función:', typeof jsPDF);
                alert('Error: La librería jsPDF no está correctamente cargada. Por favor, recarga la página.');
                return;
            }

            console.log('✅ Creando documento PDF...');
            const doc = new jsPDF();
            
            if (!doc) {
                console.error('❌ No se pudo crear el documento PDF');
                alert('Error: No se pudo crear el documento PDF. Por favor, intente nuevamente.');
                return;
            }
            
            console.log('✅ Documento PDF creado correctamente');
            
            const state = this.gameState;
            let yPosition = 20;
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            const maxWidth = pageWidth - (margin * 2);

            // Título principal con nombre del usuario - centrado y con formato tipo título
            const userName = state.userName && state.userName.trim() !== '' ? String(state.userName.trim()).toUpperCase() : 'USUARIO';
            const titleText = `Gastos de Consumo de Agua+ Limpieza y Aseo actual de ${userName}`;
            
            // Configurar formato tipo título (más grande y en negrita)
            doc.setFontSize(18);
            doc.setTextColor(102, 126, 234);
            doc.setFont('helvetica', 'bold');
            
            // Dividir el título en líneas si es muy largo
            const titleLines = doc.splitTextToSize(String(titleText), pageWidth - (margin * 2));
            let titleHeight = 0;
            
            if (Array.isArray(titleLines)) {
                // Centrar cada línea del título
                titleLines.forEach((line, index) => {
                    const lineWidth = doc.getTextWidth(line);
                    const centeredX = (pageWidth - lineWidth) / 2;
                    doc.text(line, centeredX, yPosition);
                    yPosition += 8; // Espaciado entre líneas
                    titleHeight += 8;
                });
            } else {
                // Centrar el título en una sola línea
                const lineWidth = doc.getTextWidth(String(titleText));
                const centeredX = (pageWidth - lineWidth) / 2;
                doc.text(String(titleText), centeredX, yPosition);
                yPosition += 10;
                titleHeight = 10;
            }
            
            // Agregar espacio después del título
            yPosition += 5;
            
            // Dibujar línea delgada horizontal que divide el título del contenido
            doc.setDrawColor(200, 200, 200); // Color gris claro para la línea
            doc.setLineWidth(0.5); // Línea delgada
            const lineY = yPosition;
            doc.line(margin, lineY, pageWidth - margin, lineY);
            
            // Agregar espacio después de la línea
            yPosition += 10;

            // 1. Gastos de Limpieza y Aseo
            yPosition += 5;
            doc.setFontSize(14);
            doc.setTextColor(102, 126, 234);
            doc.text('• Gastos de Limpieza y Aseo', margin, yPosition);
            yPosition += 8;

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text('Producto', margin, yPosition);
            doc.text('Precio', margin + 60, yPosition);
            doc.text('Cantidad', margin + 90, yPosition);
            doc.text('Total', margin + 130, yPosition);
            yPosition += 5;
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 8;

            let cleaningTotal = 0;
            if (state.products && state.products.length > 0) {
                // Filtrar solo productos que tienen precio > 0 y cantidad > 0 para evitar mostrar productos vacíos o duplicados
                const validProducts = state.products.filter(product => {
                    const hasPrice = product.price && product.price > 0;
                    const hasQuantity = product.quantity && product.quantity > 0;
                    return hasPrice && hasQuantity;
                });
                
                validProducts.forEach(product => {
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    const productInfo = PRODUCT_DATA.products.find(p => p.name === product.product);
                    // Solo mostrar el nombre del producto directamente, sin emoji ni viñeta
                    // Asegurar que todos los valores sean cadenas
                    const productName = String(product.product || 'Producto');
                    const productPrice = typeof product.price === 'number' ? product.price.toFixed(2) : '0.00';
                    const productQuantity = String(product.quantity || 0);
                    const productTotal = typeof product.total === 'number' ? product.total.toFixed(2) : '0.00';
                    
                    doc.text(productName, margin, yPosition);
                    doc.text(`$${productPrice}`, margin + 60, yPosition);
                    doc.text(productQuantity, margin + 90, yPosition);
                    doc.text(`$${productTotal}`, margin + 130, yPosition);
                    yPosition += 7;
                    cleaningTotal += (product.total || 0);
                });
            }

            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            doc.setFont('helvetica', 'bold');
            doc.text('Total Gastos de Limpieza y Aseo:', margin, yPosition);
            doc.text(`$${cleaningTotal.toFixed(2)}`, margin + 130, yPosition);
            yPosition += 10;

            // 2. Gastos de Agua
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(102, 126, 234);
            doc.text('• Gastos de Agua al Mes', margin, yPosition);
            yPosition += 8;

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            const waterTypeInfo = PRODUCT_DATA.waterTypes.find(wt => wt.value === state.waterType);
            // Solo mostrar el nombre del tipo de agua sin emoji
            const waterTypeName = waterTypeInfo ? String(waterTypeInfo.name) : 'No seleccionado';
            doc.text(`Tipo de Agua: ${waterTypeName}`, margin, yPosition);
            yPosition += 6;
            if (state.waterFrequency) {
                const waterFreq = Number(state.waterFrequency) || 0;
                doc.text(`Frecuencia por Semana: ${waterFreq} vez${waterFreq > 1 ? 'es' : ''}`, margin, yPosition);
                yPosition += 6;
            }
            if (state.waterPrice) {
                const waterPrice = typeof state.waterPrice === 'number' ? state.waterPrice.toFixed(2) : '0.00';
                doc.text(`Precio por Compra: $${waterPrice}`, margin, yPosition);
                yPosition += 6;
            }
            doc.setFont('helvetica', 'bold');
            doc.text('Total Gastos de Agua al Mes:', margin, yPosition);
            const waterMonthlyTotal = typeof state.waterMonthlyTotal === 'number' ? state.waterMonthlyTotal.toFixed(2) : '0.00';
            doc.text(`$${waterMonthlyTotal}`, margin + 130, yPosition);
            yPosition += 10;

            // 3. Sumatoria General
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(102, 126, 234);
            doc.text('• Sumatoria General', margin, yPosition);
            yPosition += 8;

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            const waterMonthlyTotalNum = typeof state.waterMonthlyTotal === 'number' ? state.waterMonthlyTotal : 0;
            const generalTotal = cleaningTotal + waterMonthlyTotalNum;
            doc.text(`Gastos de Limpieza y Aseo: $${cleaningTotal.toFixed(2)}`, margin, yPosition);
            yPosition += 6;
            doc.text(`Gastos de Agua al Mes: $${waterMonthlyTotalNum.toFixed(2)}`, margin, yPosition);
            yPosition += 6;
            doc.setFont('helvetica', 'bold');
            doc.text('Total General Mensual:', margin, yPosition);
            doc.text(`$${generalTotal.toFixed(2)}`, margin + 130, yPosition);
            yPosition += 10;

            // 4. Multiplicador de 12 Meses
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(102, 126, 234);
            doc.text('• Multiplicador de Meses', margin, yPosition);
            yPosition += 8;

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            const multiplier = Number(state.multiplier) || 12;
            const yearTotal = generalTotal * multiplier;
            doc.text(`Total Mensual: $${generalTotal.toFixed(2)}`, margin, yPosition);
            yPosition += 6;
            doc.text(`Multiplicador (Meses): ${String(multiplier)}`, margin, yPosition);
            yPosition += 6;
            doc.setFont('helvetica', 'bold');
            doc.text('Total por Año:', margin, yPosition);
            doc.text(`$${yearTotal.toFixed(2)}`, margin + 130, yPosition);
            yPosition += 10;

            // 5. Multiplicador de Años
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(102, 126, 234);
            doc.text('• Multiplicador de Años', margin, yPosition);
            yPosition += 8;

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            const yearsMultiplier = Number(state.yearsMultiplier) || 1;
            const finalYearsTotal = yearTotal * yearsMultiplier;
            doc.text(`Total por Año: $${yearTotal.toFixed(2)}`, margin, yPosition);
            yPosition += 6;
            doc.text(`Multiplicador (Años): ${String(yearsMultiplier)}`, margin, yPosition);
            yPosition += 10;
            
            // Total Acumulado Final en celda gris con texto rojo
            const cellHeight = 15;
            const cellWidth = pageWidth - (margin * 2);
            const cellY = yPosition;
            
            // Dibujar rectángulo gris de fondo
            doc.setFillColor(220, 220, 220); // Gris claro
            doc.rect(margin, cellY, cellWidth, cellHeight, 'F');
            
            // Texto en rojo con tamaño tipo título
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 0, 0); // Rojo
            const totalText = `Total Acumulado Final: $${finalYearsTotal.toFixed(2)}`;
            const textWidth = doc.getTextWidth(totalText);
            const textX = margin + (cellWidth - textWidth) / 2; // Centrar texto
            doc.text(totalText, textX, cellY + 11);
            
            yPosition += cellHeight + 15;
            
            // Frase final
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            
            // Formatear el monto con separadores de miles
            const formattedTotal = finalYearsTotal.toLocaleString('es-ES', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            });
            
            // Obtener información del usuario para aplicar lógica de género y plural
            // Nota: userName ya fue declarado anteriormente en la función, reutilizamos esa variable
            const nameInfo = this.getUserNameInfo();
            
            // Construir el mensaje final con lógica de género y plural
            let finalPhrase1;
            if (nameInfo.isPlural) {
                finalPhrase1 = `${userName}, En ${yearsMultiplier} año${yearsMultiplier > 1 ? 's' : ''}, con estos números ustedes pueden gastar $${formattedTotal}… Esto sin calcular gastos de transporte, aumentos de precio, riesgos en la salud, etc.`;
            } else {
                finalPhrase1 = `${userName}, En ${yearsMultiplier} año${yearsMultiplier > 1 ? 's' : ''}, con estos números usted puede gastar $${formattedTotal}… Esto sin calcular gastos de transporte, aumentos de precio, riesgos en la salud, etc.`;
            }
            
            const finalPhrase2 = 'Tiene la opción de invertir, muchísimo menos y desde hoy cambiar completamente esa historia.';
            const finalPhrase3 = '¿Qué versión de esa historia quiere vivir?';
            
            // Dividir textos largos en líneas y asegurar que sean cadenas
            const phrase1Lines = doc.splitTextToSize(String(finalPhrase1), maxWidth);
            if (Array.isArray(phrase1Lines)) {
                doc.text(phrase1Lines, margin, yPosition);
                yPosition += (phrase1Lines.length * 6) + 5;
            } else {
                doc.text(String(finalPhrase1), margin, yPosition);
                yPosition += 11;
            }
            
            const phrase2Lines = doc.splitTextToSize(String(finalPhrase2), maxWidth);
            if (Array.isArray(phrase2Lines)) {
                doc.text(phrase2Lines, margin, yPosition);
                yPosition += (phrase2Lines.length * 6) + 5;
            } else {
                doc.text(String(finalPhrase2), margin, yPosition);
                yPosition += 11;
            }
            
            doc.setFont('helvetica', 'bold');
            const phrase3Lines = doc.splitTextToSize(String(finalPhrase3), maxWidth);
            if (Array.isArray(phrase3Lines)) {
                doc.text(phrase3Lines, margin, yPosition);
            } else {
                doc.text(String(finalPhrase3), margin, yPosition);
            }

            // Guardar PDF
            console.log('💾 Guardando PDF...');
            const fileName = `Resumen_Gastos_${new Date().toISOString().split('T')[0]}.pdf`;
            
            // Verificar que el método save exista
            if (typeof doc.save !== 'function') {
                console.error('❌ El método save no está disponible en el documento');
                alert('Error: No se puede guardar el PDF. Por favor, intente nuevamente.');
                return;
            }
            
            // Intentar guardar el PDF
            try {
                doc.save(fileName);
                console.log('✅ PDF descargado correctamente:', fileName);
                
                // Mostrar mensaje de confirmación
                setTimeout(() => {
                    console.log('✅ Descarga de PDF completada exitosamente');
                }, 100);
            } catch (saveError) {
                console.error('❌ Error al guardar PDF:', saveError);
                alert('Error al guardar el PDF. Por favor, verifique la configuración de su navegador.');
            }
        } catch (error) {
            console.error('❌ Error al generar PDF:', error);
            console.error('❌ Stack trace:', error.stack);
            alert(`Error al generar el PDF: ${error.message}. Por favor, intente nuevamente.`);
        }
    }

    // Actualizar display del nombre de usuario
    updateUserNameDisplay() {
        const nameDisplay = document.getElementById('user-name-display');
        if (!nameDisplay) return;

        if (this.gameState.userName && this.gameState.userName.trim() !== '') {
            nameDisplay.textContent = this.gameState.userName;
            nameDisplay.classList.remove('hidden');
        } else {
            nameDisplay.classList.add('hidden');
        }
    }

    // Iniciar narración de simulación de agua
    startWaterSimulationNarration() {
        console.log('🎤 Iniciando narración de simulación de agua...');
        
        // Verificar si SpeechSynthesis está disponible
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible en este navegador');
            return;
        }

        // Prevenir múltiples llamadas simultáneas
        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            // Detener cualquier narración previa
            this.stopWelcomeNarration();
            speechSynthesis.cancel();
            
            // Marcar que estamos narrando
            this.isNarrating = true;

            // Función para iniciar la narración
            const startSpeaking = () => {
                console.log('🗣️ Preparando para hablar (simulación de agua)...');
                
                // Verificar que speechSynthesis siga disponible
                if (!('speechSynthesis' in window)) {
                    console.error('❌ SpeechSynthesis ya no está disponible');
                    this.isNarrating = false;
                    return;
                }

                // Texto con el nombre del usuario
                let simulationText;
                const nameInfo = this.getUserNameInfo();
                if (nameInfo.displayName) {
                    if (nameInfo.isPlural) {
                        simulationText = `${nameInfo.displayName}, no se preocupen, ustedes hoy tienen la solución en sus manos, así que hagamos una simulación de gastos de agua.`;
                    } else {
                        simulationText = `${nameInfo.displayName}, no se preocupe, usted hoy tiene la solución en sus manos, así que hagamos una simulación de gastos de agua.`;
                    }
                } else {
                    simulationText = 'No se preocupe, usted hoy tiene la solución en sus manos, así que hagamos una simulación de gastos de agua.';
                }
                
                // Crear utterance
                const utterance = new SpeechSynthesisUtterance(simulationText);
                utterance.lang = 'es-ES';
                utterance.rate = 0.95; // Velocidad natural
                utterance.pitch = 1.5; // Pitch alto para voz femenina
                utterance.volume = 1.0;

                // Usar la voz centralizada seleccionada para toda la aplicación
                const spanishVoice = this.selectVoice();
                const voices = speechSynthesis.getVoices();
                
                if (spanishVoice) {
                    utterance.voice = spanishVoice;
                    utterance.pitch = 1.5;
                    console.log('✅ Usando voz centralizada para simulación de agua:', spanishVoice.name);
                } else if (voices.length > 0) {
                    utterance.voice = voices[0];
                    utterance.pitch = 1.6;
                    console.log('⚠️ Usando voz predeterminada (fallback) para simulación de agua:', voices[0].name);
                }

                // Guardar referencia para poder detenerla
                this.currentUtterance = utterance;

                // Evento cuando termine la narración
                utterance.onend = () => {
                    console.log('✅ Narración de simulación de agua completada');
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                // Evento de error
                utterance.onerror = (event) => {
                    console.error('❌ Error en la narración de simulación de agua:', event.error);
                    this.isNarrating = false;
                    this.currentUtterance = null;
                };

                // Evento cuando comienza
                utterance.onstart = () => {
                    console.log('🔊 Narración de simulación de agua iniciada');
                };

                // Iniciar la narración
                try {
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        setTimeout(() => {
                            speechSynthesis.speak(utterance);
                            console.log('🎤 Comando speak() ejecutado para simulación de agua (después de cancelar)');
                        }, 100);
                    } else {
                        speechSynthesis.speak(utterance);
                        console.log('🎤 Comando speak() ejecutado para simulación de agua');
                    }
                } catch (speakError) {
                    console.error('❌ Error al ejecutar speak() para simulación de agua:', speakError);
                    this.isNarrating = false;
                }
            };

            // Verificar si las voces ya están cargadas
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                startSpeaking();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                };
                setTimeout(() => {
                    if (speechSynthesis.getVoices().length > 0) {
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces para simulación de agua');
                        this.isNarrating = false;
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error al iniciar la narración de simulación de agua:', error);
            this.isNarrating = false;
        }
    }

    // Iniciar narración de tipo de agua
    startWaterTypeNarration() {
        console.log('🎤 Iniciando narración de tipo de agua...');
        
        // Verificar si SpeechSynthesis está disponible
        if (!('speechSynthesis' in window)) {
            console.error('❌ SpeechSynthesis no está disponible en este navegador');
            return;
        }

        // Prevenir múltiples llamadas simultáneas
        if (this.isNarrating) {
            console.log('⚠️ Narración ya en curso, ignorando llamada duplicada');
            return;
        }

        try {
            // Detener cualquier narración previa
            this.stopWelcomeNarration();
            speechSynthesis.cancel();
            
            // Marcar que estamos narrando
            this.isNarrating = true;

            // Función para iniciar la narración
            const startSpeaking = () => {
                console.log('🗣️ Preparando para hablar (tipo de agua)...');
                
                // Verificar que speechSynthesis siga disponible
                if (!('speechSynthesis' in window)) {
                    console.error('❌ SpeechSynthesis ya no está disponible');
                    this.isNarrating = false;
                    return;
                }

                // Texto corregido y mejorado con el nombre del usuario y tratamiento correcto
                const nameInfo = this.getUserNameInfo();
                let waterTypeText;
                if (nameInfo.displayName) {
                    if (nameInfo.isPlural) {
                        waterTypeText = `Ahora, ${nameInfo.displayName}, hablemos del agua que consumen. Será rápido, así que ¿atentos?`;
                    } else {
                        waterTypeText = `Ahora, ${nameInfo.displayName}, hablemos del agua que consumes. Será rápido, así que ¿atentos?`;
                    }
                } else {
                    waterTypeText = 'Ahora hablemos del agua que consumes. Será rápido, así que ¿atentos?';
                }
                
                // Crear utterance
                const utterance = new SpeechSynthesisUtterance(waterTypeText);
                utterance.lang = 'es-ES';
                utterance.rate = 0.95; // Velocidad natural
                utterance.pitch = 1.5; // Pitch alto para voz femenina
                utterance.volume = 1.0;

                // Usar la voz centralizada seleccionada para toda la aplicación
                const spanishVoice = this.selectVoice();
                const voices = speechSynthesis.getVoices();
                
                if (spanishVoice) {
                    utterance.voice = spanishVoice;
                    utterance.pitch = 1.5;
                    console.log('✅ Usando voz centralizada para tipo de agua:', spanishVoice.name);
                } else if (voices.length > 0) {
                    utterance.voice = voices[0];
                    utterance.pitch = 1.6;
                    console.log('⚠️ Usando voz predeterminada (fallback) para tipo de agua:', voices[0].name);
                }

                // Guardar referencia para poder detenerla
                this.currentUtterance = utterance;

                // Evento cuando termine la narración
                utterance.onend = () => {
                    console.log('✅ Narración de tipo de agua completada');
                    this.currentUtterance = null;
                    this.isNarrating = false;
                };

                // Evento de error
                utterance.onerror = (event) => {
                    console.error('❌ Error en la narración de tipo de agua:', event.error);
                    this.isNarrating = false;
                    this.currentUtterance = null;
                };

                // Evento cuando comienza
                utterance.onstart = () => {
                    console.log('🔊 Narración de tipo de agua iniciada');
                };

                // Iniciar la narración
                try {
                    if (speechSynthesis.speaking || speechSynthesis.pending) {
                        speechSynthesis.cancel();
                        setTimeout(() => {
                            speechSynthesis.speak(utterance);
                            console.log('🎤 Comando speak() ejecutado para tipo de agua (después de cancelar)');
                        }, 100);
                    } else {
                        speechSynthesis.speak(utterance);
                        console.log('🎤 Comando speak() ejecutado para tipo de agua');
                    }
                } catch (speakError) {
                    console.error('❌ Error al ejecutar speak() para tipo de agua:', speakError);
                    this.isNarrating = false;
                }
            };

            // Verificar si las voces ya están cargadas
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                startSpeaking();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    startSpeaking();
                };
                setTimeout(() => {
                    if (speechSynthesis.getVoices().length > 0) {
                        startSpeaking();
                    } else {
                        console.warn('⚠️ No se pudieron cargar las voces para tipo de agua');
                        this.isNarrating = false;
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error al iniciar la narración de tipo de agua:', error);
            this.isNarrating = false;
        }
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado, iniciando aplicación...');
    window.app = new CalculadoraApp();
    window.app.init();
});

// Agregar animación de confetti al CSS si no existe
if (!document.querySelector('style[data-confetti]')) {
    const style = document.createElement('style');
    style.setAttribute('data-confetti', 'true');
    style.textContent = `
        @keyframes confettiFall {
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

