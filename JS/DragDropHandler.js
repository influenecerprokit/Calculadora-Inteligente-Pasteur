/**
 * Drag & Drop Handler Module
 * Manages drag and drop interactions for the expense calculator game
 * Supports both mouse and touch events for mobile compatibility
 */

export class DragDropHandler {
    constructor() {
        this.onDropSuccess = null;
        this.currentDragElement = null;
        this.currentDropZone = null;
        this.dragOffset = { x: 0, y: 0 };
        this.isInitialized = false;
        this.isDragging = false;
        
        // Touch event tracking
        this.touchStartPos = { x: 0, y: 0 };
        this.dragThreshold = 10; // pixels to start drag
        
        // Bind methods
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDragLeave = this.handleDragLeave.bind(this);
    }

    /**
     * Initialize the drag & drop system
     */
    init() {
        try {
            console.log('📋 Initializing DragDropHandler...');
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ DragDropHandler initialized successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize DragDropHandler:', error);
            return false;
        }
    }

    /**
     * Set up event listeners for drag & drop
     */
    setupEventListeners() {
        // Mouse events
        document.addEventListener('mousedown', this.handleMouseDown, { passive: false });
        document.addEventListener('mousemove', this.handleMouseMove, { passive: false });
        document.addEventListener('mouseup', this.handleMouseUp, { passive: false });
        
        // Touch events for mobile
        document.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        
        // Prevent default drag behavior on images and other elements
        document.addEventListener('dragstart', (e) => e.preventDefault());
        document.addEventListener('selectstart', (e) => {
            if (e.target.classList.contains('drag-option')) {
                e.preventDefault();
            }
        });
    }

    /**
     * Create draggable options in the specified container
     */
    createDragOptions(container, options) {
        if (!container) {
            console.warn('Container not found for drag options');
            return;
        }

        // Clear existing options
        container.innerHTML = '';

        options.forEach((option, index) => {
            const dragElement = document.createElement('div');
            dragElement.className = 'drag-option';
            dragElement.textContent = option.label;
            dragElement.dataset.value = option.value;
            dragElement.dataset.index = index;
            dragElement.setAttribute('role', 'button');
            dragElement.setAttribute('tabindex', '0');
            dragElement.setAttribute('aria-label', `Arrastrar opción: ${option.label}`);
            
            // Add price indicator if available
            if (option.price) {
                const priceIndicator = document.createElement('span');
                priceIndicator.className = 'option-price';
                priceIndicator.textContent = `$${option.price}`;
                priceIndicator.style.cssText = `
                    display: block;
                    font-size: 0.8em;
                    opacity: 0.8;
                    margin-top: 4px;
                `;
                dragElement.appendChild(priceIndicator);
            }
            
            // Add entrance animation
            dragElement.style.opacity = '0';
            dragElement.style.transform = 'translateY(20px)';
            dragElement.style.transition = 'all 0.3s ease';
            
            container.appendChild(dragElement);
            
            // Trigger entrance animation
            setTimeout(() => {
                dragElement.style.opacity = '1';
                dragElement.style.transform = 'translateY(0)';
            }, index * 100 + 50);
        });

        console.log(`📋 Created ${options.length} drag options with enhanced visuals`);
    }

    /**
     * Add hover preview effect
     */
    addHoverPreview(dragElement) {
        const preview = document.createElement('div');
        preview.className = 'drag-hover-preview';
        preview.textContent = 'Arrastra para seleccionar';
        preview.style.cssText = `
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.7em;
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.2s ease;
            pointer-events: none;
            z-index: 1000;
        `;
        
        dragElement.style.position = 'relative';
        dragElement.appendChild(preview);
        
        // Show on hover
        dragElement.addEventListener('mouseenter', () => {
            preview.style.opacity = '1';
        });
        
        dragElement.addEventListener('mouseleave', () => {
            preview.style.opacity = '0';
        });
    }

    /**
     * Add loading state to drag option
     */
    setOptionLoading(optionElement, loading = true) {
        if (loading) {
            optionElement.classList.add('loading');
            optionElement.setAttribute('aria-busy', 'true');
        } else {
            optionElement.classList.remove('loading');
            optionElement.setAttribute('aria-busy', 'false');
        }
    }

    /**
     * Highlight compatible drop zones
     */
    highlightCompatibleDropZones(dragElement) {
        const dropZones = document.querySelectorAll('.drop-zone:not(.has-selection)');
        dropZones.forEach(zone => {
            zone.classList.add('compatible-zone');
            zone.style.borderColor = '#667eea';
            zone.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
        });
    }

    /**
     * Remove drop zone highlights
     */
    removeDropZoneHighlights() {
        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            zone.classList.remove('compatible-zone');
            zone.style.borderColor = '';
            zone.style.backgroundColor = '';
        });
    }

    /**
     * Handle mouse down event
     */
    handleMouseDown(event) {
        const dragElement = event.target.closest('.drag-option');
        if (!dragElement) return;

        event.preventDefault();
        this.startDrag(dragElement, event.clientX, event.clientY);
    }

    /**
     * Handle touch start event
     */
    handleTouchStart(event) {
        const dragElement = event.target.closest('.drag-option');
        if (!dragElement) return;

        const touch = event.touches[0];
        this.touchStartPos = { x: touch.clientX, y: touch.clientY };
        
        // Don't start drag immediately, wait for movement
        this.potentialDragElement = dragElement;
        this.potentialStartTime = Date.now();
    }

    /**
     * Handle mouse move event
     */
    handleMouseMove(event) {
        if (!this.isDragging) return;

        event.preventDefault();
        this.updateDragPosition(event.clientX, event.clientY);
        this.checkDropZone(event.clientX, event.clientY);
    }

    /**
     * Handle touch move event
     */
    handleTouchMove(event) {
        const touch = event.touches[0];
        
        // Check if we should start dragging
        if (this.potentialDragElement && !this.isDragging) {
            const deltaX = Math.abs(touch.clientX - this.touchStartPos.x);
            const deltaY = Math.abs(touch.clientY - this.touchStartPos.y);
            
            if (deltaX > this.dragThreshold || deltaY > this.dragThreshold) {
                event.preventDefault();
                this.startDrag(this.potentialDragElement, touch.clientX, touch.clientY);
                this.potentialDragElement = null;
            }
            return;
        }

        if (!this.isDragging) return;

        event.preventDefault();
        this.updateDragPosition(touch.clientX, touch.clientY);
        this.checkDropZone(touch.clientX, touch.clientY);
    }

    /**
     * Handle mouse up event
     */
    handleMouseUp(event) {
        if (!this.isDragging) return;

        event.preventDefault();
        this.endDrag(event.clientX, event.clientY);
    }

    /**
     * Handle touch end event
     */
    handleTouchEnd(event) {
        // Clear potential drag
        this.potentialDragElement = null;
        
        if (!this.isDragging) return;

        event.preventDefault();
        
        // Use the last known position or touch position
        const touch = event.changedTouches[0];
        this.endDrag(touch.clientX, touch.clientY);
    }

    /**
     * Start dragging an element
     */
    startDrag(element, clientX, clientY) {
        this.currentDragElement = element;
        this.isDragging = true;

        // Calculate offset from mouse/touch to element center
        const rect = element.getBoundingClientRect();
        this.dragOffset = {
            x: clientX - rect.left - rect.width / 2,
            y: clientY - rect.top - rect.height / 2
        };

        // Add dragging class
        element.classList.add('dragging');
        
        // Create drag clone
        this.createDragClone(element, clientX, clientY);
        
        // Hide original element
        element.style.opacity = '0.5';
        
        // Highlight compatible drop zones
        this.highlightCompatibleDropZones(element);
        
        console.log('📋 Started dragging:', element.textContent);
    }

    /**
     * Create a visual clone for dragging
     */
    createDragClone(element, clientX, clientY) {
        this.dragClone = element.cloneNode(true);
        this.dragClone.className = 'drag-option dragging drag-clone';
        this.dragClone.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 1000;
            transform: rotate(5deg) scale(1.05);
            transition: none;
            left: ${clientX - this.dragOffset.x - element.offsetWidth / 2}px;
            top: ${clientY - this.dragOffset.y - element.offsetHeight / 2}px;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.6);
            filter: brightness(1.1);
        `;
        
        document.body.appendChild(this.dragClone);
        
        // Add ripple effect to original element
        this.createRippleEffect(element, clientX, clientY);
        
        // Add drag trail effect
        this.startDragTrail();
    }

    /**
     * Create ripple effect on drag start
     */
    createRippleEffect(element, clientX, clientY) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'drag-ripple';
        
        const size = Math.max(rect.width, rect.height);
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${clientX - rect.left - size / 2}px;
            top: ${clientY - rect.top - size / 2}px;
            background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleExpand 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    }

    /**
     * Start drag trail effect
     */
    startDragTrail() {
        this.dragTrail = [];
        this.trailInterval = setInterval(() => {
            if (this.dragClone && this.isDragging) {
                this.addTrailParticle();
            }
        }, 50);
    }

    /**
     * Add particle to drag trail
     */
    addTrailParticle() {
        if (!this.dragClone) return;
        
        const rect = this.dragClone.getBoundingClientRect();
        const particle = document.createElement('div');
        particle.className = 'drag-trail-particle';
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            border-radius: 50%;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            pointer-events: none;
            z-index: 999;
            animation: trailFade 1s ease-out forwards;
        `;
        
        document.body.appendChild(particle);
        this.dragTrail.push(particle);
        
        // Limit trail length
        if (this.dragTrail.length > 10) {
            const oldParticle = this.dragTrail.shift();
            if (oldParticle.parentNode) {
                oldParticle.remove();
            }
        }
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 1000);
    }

    /**
     * Stop drag trail effect
     */
    stopDragTrail() {
        if (this.trailInterval) {
            clearInterval(this.trailInterval);
            this.trailInterval = null;
        }
        
        // Clean up remaining trail particles
        if (this.dragTrail) {
            this.dragTrail.forEach(particle => {
                if (particle.parentNode) {
                    particle.remove();
                }
            });
            this.dragTrail = [];
        }
    }

    /**
     * Update drag position
     */
    updateDragPosition(clientX, clientY) {
        if (!this.dragClone) return;

        this.dragClone.style.left = `${clientX - this.dragOffset.x - this.currentDragElement.offsetWidth / 2}px`;
        this.dragClone.style.top = `${clientY - this.dragOffset.y - this.currentDragElement.offsetHeight / 2}px`;
    }

    /**
     * Check if dragging over a drop zone
     */
    checkDropZone(clientX, clientY) {
        const elementBelow = document.elementFromPoint(clientX, clientY);
        const dropZone = elementBelow?.closest('.drop-zone');

        // Remove previous hover state
        if (this.currentDropZone && this.currentDropZone !== dropZone) {
            this.currentDropZone.classList.remove('drag-over');
            this.removeDropZoneIndicators(this.currentDropZone);
        }

        // Add hover state to new drop zone
        if (dropZone && dropZone !== this.currentDropZone) {
            dropZone.classList.add('drag-over');
            this.addDropZoneIndicators(dropZone);
        }

        this.currentDropZone = dropZone;
    }

    /**
     * Add visual indicators to drop zone
     */
    addDropZoneIndicators(dropZone) {
        // Add pulsing border effect
        const pulseRing = document.createElement('div');
        pulseRing.className = 'drop-zone-pulse';
        pulseRing.style.cssText = `
            position: absolute;
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
            border: 3px solid #667eea;
            border-radius: 25px;
            animation: dropZonePulse 1s ease-in-out infinite;
            pointer-events: none;
            z-index: 1;
        `;
        
        dropZone.style.position = 'relative';
        dropZone.appendChild(pulseRing);
        
        // Add corner indicators
        this.addCornerIndicators(dropZone);
        
        // Add magnetic effect to drag clone
        this.addMagneticEffect(dropZone);
    }

    /**
     * Add corner indicators to drop zone
     */
    addCornerIndicators(dropZone) {
        const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        
        corners.forEach(corner => {
            const indicator = document.createElement('div');
            indicator.className = `drop-corner-indicator ${corner}`;
            indicator.style.cssText = `
                position: absolute;
                width: 20px;
                height: 20px;
                background: #667eea;
                border-radius: 50%;
                animation: cornerPulse 0.8s ease-in-out infinite alternate;
                pointer-events: none;
                z-index: 2;
            `;
            
            // Position corners
            switch(corner) {
                case 'top-left':
                    indicator.style.top = '-10px';
                    indicator.style.left = '-10px';
                    break;
                case 'top-right':
                    indicator.style.top = '-10px';
                    indicator.style.right = '-10px';
                    break;
                case 'bottom-left':
                    indicator.style.bottom = '-10px';
                    indicator.style.left = '-10px';
                    break;
                case 'bottom-right':
                    indicator.style.bottom = '-10px';
                    indicator.style.right = '-10px';
                    break;
            }
            
            dropZone.appendChild(indicator);
        });
    }

    /**
     * Add magnetic effect when near drop zone
     */
    addMagneticEffect(dropZone) {
        if (!this.dragClone) return;
        
        const dropRect = dropZone.getBoundingClientRect();
        const cloneRect = this.dragClone.getBoundingClientRect();
        
        const centerX = dropRect.left + dropRect.width / 2;
        const centerY = dropRect.top + dropRect.height / 2;
        const cloneCenterX = cloneRect.left + cloneRect.width / 2;
        const cloneCenterY = cloneRect.top + cloneRect.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(centerX - cloneCenterX, 2) + 
            Math.pow(centerY - cloneCenterY, 2)
        );
        
        // Apply magnetic effect if close enough
        if (distance < 100) {
            const magnetStrength = Math.max(0, (100 - distance) / 100);
            this.dragClone.style.filter = `brightness(${1.1 + magnetStrength * 0.3}) saturate(${1 + magnetStrength * 0.5})`;
            this.dragClone.style.transform = `rotate(${5 - magnetStrength * 3}deg) scale(${1.05 + magnetStrength * 0.1})`;
        }
    }

    /**
     * Remove visual indicators from drop zone
     */
    removeDropZoneIndicators(dropZone) {
        // Remove pulse ring
        const pulseRing = dropZone.querySelector('.drop-zone-pulse');
        if (pulseRing) {
            pulseRing.remove();
        }
        
        // Remove corner indicators
        const corners = dropZone.querySelectorAll('.drop-corner-indicator');
        corners.forEach(corner => corner.remove());
    }

    /**
     * End dragging
     */
    endDrag(clientX, clientY) {
        if (!this.currentDragElement) return;

        const elementBelow = document.elementFromPoint(clientX, clientY);
        const dropZone = elementBelow?.closest('.drop-zone');

        // Stop drag trail
        this.stopDragTrail();

        // Clean up drag state
        this.currentDragElement.classList.remove('dragging');
        this.currentDragElement.style.opacity = '';

        // Remove drag clone with animation
        if (this.dragClone) {
            if (dropZone) {
                // Animate to drop zone center
                this.animateCloneToDropZone(this.dragClone, dropZone);
            } else {
                // Animate back to original position
                this.animateCloneToOriginal(this.dragClone, this.currentDragElement);
            }
        }

        // Remove drop zone hover state and indicators
        if (this.currentDropZone) {
            this.currentDropZone.classList.remove('drag-over');
            this.removeDropZoneIndicators(this.currentDropZone);
        }

        // Remove drop zone highlights
        this.removeDropZoneHighlights();

        // Check if dropped on valid zone
        if (dropZone) {
            this.handleSuccessfulDrop(this.currentDragElement, dropZone);
        } else {
            this.handleFailedDrop(this.currentDragElement);
        }

        // Reset state
        this.currentDragElement = null;
        this.currentDropZone = null;
        this.isDragging = false;

        console.log('📋 Ended drag operation');
    }

    /**
     * Animate drag clone to drop zone
     */
    animateCloneToDropZone(clone, dropZone) {
        const dropRect = dropZone.getBoundingClientRect();
        const targetX = dropRect.left + dropRect.width / 2 - clone.offsetWidth / 2;
        const targetY = dropRect.top + dropRect.height / 2 - clone.offsetHeight / 2;
        
        clone.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        clone.style.left = `${targetX}px`;
        clone.style.top = `${targetY}px`;
        clone.style.transform = 'rotate(0deg) scale(0.8)';
        clone.style.opacity = '0';
        
        setTimeout(() => {
            if (clone.parentNode) {
                clone.remove();
            }
            this.dragClone = null;
        }, 300);
    }

    /**
     * Animate drag clone back to original position
     */
    animateCloneToOriginal(clone, originalElement) {
        const originalRect = originalElement.getBoundingClientRect();
        const targetX = originalRect.left;
        const targetY = originalRect.top;
        
        clone.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        clone.style.left = `${targetX}px`;
        clone.style.top = `${targetY}px`;
        clone.style.transform = 'rotate(0deg) scale(1)';
        clone.style.opacity = '0.5';
        
        setTimeout(() => {
            if (clone.parentNode) {
                clone.remove();
            }
            this.dragClone = null;
        }, 400);
    }

    /**
     * Handle successful drop
     */
    handleSuccessfulDrop(dragElement, dropZone) {
        const optionData = {
            label: dragElement.textContent,
            value: dragElement.dataset.value,
            index: parseInt(dragElement.dataset.index)
        };

        // Update drop zone visual state
        dropZone.classList.add('has-selection');
        const dropText = dropZone.querySelector('.drop-zone-text');
        if (dropText) {
            dropText.textContent = optionData.label;
        }

        // Hide the dragged element with fade animation
        dragElement.style.transition = 'all 0.3s ease';
        dragElement.style.opacity = '0';
        dragElement.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            dragElement.style.display = 'none';
        }, 300);

        // Create success particles
        this.createSuccessParticles(dropZone);
        
        // Add success pulse to drop zone
        this.addSuccessPulse(dropZone);

        console.log('✅ Successful drop:', optionData);

        // Trigger success callback
        if (this.onDropSuccess) {
            this.onDropSuccess(optionData);
        }
    }

    /**
     * Create success particles effect
     */
    createSuccessParticles(dropZone) {
        const rect = dropZone.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create multiple particles
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'success-particle';
            
            const angle = (i / 12) * Math.PI * 2;
            const velocity = 50 + Math.random() * 30;
            const size = 4 + Math.random() * 4;
            
            particle.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size}px;
                background: linear-gradient(45deg, #4CAF50, #45a049);
                border-radius: 50%;
                left: ${centerX}px;
                top: ${centerY}px;
                pointer-events: none;
                z-index: 1001;
                animation: successParticle 1s ease-out forwards;
                --angle: ${angle}rad;
                --velocity: ${velocity}px;
            `;
            
            document.body.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 1000);
        }
    }

    /**
     * Add success pulse to drop zone
     */
    addSuccessPulse(dropZone) {
        const pulse = document.createElement('div');
        pulse.className = 'success-pulse';
        pulse.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(76, 175, 80, 0.8) 0%, transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: successPulse 0.6s ease-out;
            pointer-events: none;
            z-index: 2;
        `;
        
        dropZone.style.position = 'relative';
        dropZone.appendChild(pulse);
        
        // Remove pulse after animation
        setTimeout(() => {
            if (pulse.parentNode) {
                pulse.remove();
            }
        }, 600);
    }

    /**
     * Handle failed drop (not on drop zone)
     */
    handleFailedDrop(dragElement) {
        // Add shake animation
        dragElement.style.animation = 'dragShake 0.5s ease-in-out';
        
        // Create failure indicator
        this.createFailureIndicator(dragElement);
        
        // Reset animation after completion
        setTimeout(() => {
            dragElement.style.animation = '';
        }, 500);

        console.log('❌ Failed drop - not on drop zone');
    }

    /**
     * Create failure indicator
     */
    createFailureIndicator(element) {
        const rect = element.getBoundingClientRect();
        const indicator = document.createElement('div');
        indicator.className = 'failure-indicator';
        indicator.innerHTML = '❌';
        indicator.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top - 10}px;
            transform: translateX(-50%);
            font-size: 24px;
            color: #f44336;
            pointer-events: none;
            z-index: 1001;
            animation: failureFloat 1s ease-out forwards;
        `;
        
        document.body.appendChild(indicator);
        
        // Remove indicator after animation
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, 1000);
    }

    /**
     * Reset drop zones to initial state
     */
    resetDropZones() {
        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            zone.classList.remove('has-selection', 'drag-over');
            const dropText = zone.querySelector('.drop-zone-text');
            if (dropText) {
                dropText.textContent = 'Arrastra tu selección aquí';
            }
        });

        // Show all drag options
        const dragOptions = document.querySelectorAll('.drag-option');
        dragOptions.forEach(option => {
            option.style.display = '';
            option.style.opacity = '';
        });

        console.log('🔄 Reset all drop zones');
    }

    /**
     * Get current selections from drop zones
     */
    getCurrentSelections() {
        const selections = {};
        const dropZones = document.querySelectorAll('.drop-zone.has-selection');
        
        dropZones.forEach(zone => {
            const zoneId = zone.id;
            const text = zone.querySelector('.drop-zone-text')?.textContent;
            if (text && text !== 'Arrastra tu selección aquí') {
                selections[zoneId] = text;
            }
        });

        return selections;
    }

    /**
     * Handle drag over event (for native drag API compatibility)
     */
    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    /**
     * Handle drag leave event
     */
    handleDragLeave(event) {
        const dropZone = event.target.closest('.drop-zone');
        if (dropZone) {
            dropZone.classList.remove('drag-over');
        }
    }

    /**
     * Enable/disable drag and drop
     */
    setEnabled(enabled) {
        const dragOptions = document.querySelectorAll('.drag-option');
        dragOptions.forEach(option => {
            if (enabled) {
                option.style.pointerEvents = '';
                option.setAttribute('aria-disabled', 'false');
            } else {
                option.style.pointerEvents = 'none';
                option.setAttribute('aria-disabled', 'true');
            }
        });

        console.log(`📋 Drag & Drop ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Cleanup and destroy the drag & drop handler
     */
    destroy() {
        // Remove event listeners
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);

        // Clean up drag clone if exists
        if (this.dragClone) {
            this.dragClone.remove();
            this.dragClone = null;
        }

        // Reset state
        this.currentDragElement = null;
        this.currentDropZone = null;
        this.isDragging = false;
        this.isInitialized = false;

        console.log('🧹 DragDropHandler destroyed');
    }
}
// Universal Module Compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DragDropHandler };
} else if (typeof window !== 'undefined') {
    window.DragDropHandler = DragDropHandler;
}