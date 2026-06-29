document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // Menú Móvil
    // ==========================================================================
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('open');
            const isOpen = mainNav.classList.contains('open');
            menuToggle.innerHTML = isOpen 
                ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
                : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>`;
        });
        
        // Cerrar menú al hacer clic en un enlace
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('open');
                menuToggle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>`;
            });
        });
    }

    // ==========================================================================
    // Tablero de Producción y Donativos (Dashboard & Simulator)
    // ==========================================================================
    const DURATION = 1000; // ms de animación
    const metaLiteras = 300;
    
    // Estado inicial simulado
    let state = {
        totalRecaudado: 15600,
        literasFinanciadas: 65,
        literasProduccion: 45,
        literasEntregadas: 30
    };
    
    // Almacena los valores anteriores para animación
    let previousState = { ...state };

    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(value);
    }

    // Animación de números (efecto odómetro/conteo rápido)
    function animateCounter(elementId, start, end, isCurrency = false) {
        const obj = document.getElementById(elementId);
        if (!obj) return;
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / DURATION, 1);
            const currentValue = Math.floor(progress * (end - start) + start);
            
            obj.innerHTML = isCurrency ? formatCurrency(currentValue) : currentValue;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = isCurrency ? formatCurrency(end) : end;
            }
        };
        window.requestAnimationFrame(step);
    }

    // Actualiza la UI del Dashboard
    function updateDashboard() {
        // Animar Donaciones
        animateCounter('valDonaciones', previousState.totalRecaudado, state.totalRecaudado, true);
        // Animar Financiadas
        animateCounter('valFinanciadas', previousState.literasFinanciadas, state.literasFinanciadas, false);
        // Animar Producción
        animateCounter('valProduccion', previousState.literasProduccion, state.literasProduccion, false);
        // Animar Entregadas
        animateCounter('valEntregadas', previousState.literasEntregadas, state.literasEntregadas, false);

        // Actualizar Barra de Progreso
        const totalFabricadas = state.literasProduccion + state.literasEntregadas;
        const progressPercentage = Math.min((totalFabricadas / metaLiteras) * 100, 100).toFixed(1);
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressPercentage');
        const progressCurrentText = document.getElementById('progressCurrent');

        if (progressBar) progressBar.style.width = `${progressPercentage}%`;
        if (progressText) progressText.textContent = `${progressPercentage}%`;
        if (progressCurrentText) progressCurrentText.textContent = `${totalFabricadas} Literas fabricadas`;

        // Guardar estado actual como anterior
        previousState = { ...state };
    }

    // Inicializar el Dashboard con animaciones
    animateCounter('valDonaciones', 0, state.totalRecaudado, true);
    animateCounter('valFinanciadas', 0, state.literasFinanciadas, false);
    animateCounter('valProduccion', 0, state.literasProduccion, false);
    animateCounter('valEntregadas', 0, state.literasEntregadas, false);
    setTimeout(() => {
        const totalFabricadas = state.literasProduccion + state.literasEntregadas;
        const progressPercentage = Math.min((totalFabricadas / metaLiteras) * 100, 100).toFixed(1);
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressPercentage');
        const progressCurrentText = document.getElementById('progressCurrent');
        if (progressBar) progressBar.style.width = `${progressPercentage}%`;
        if (progressText) progressText.textContent = `${progressPercentage}%`;
        if (progressCurrentText) progressCurrentText.textContent = `${totalFabricadas} Literas fabricadas`;
    }, 100);

    // Controles del simulador
    const simDonar25 = document.getElementById('simDonar25');
    const simDonar120 = document.getElementById('simDonar120');
    const simDonar240 = document.getElementById('simDonar240');
    const simEntregar = document.getElementById('simEntregar');
    const simReset = document.getElementById('simReset');

    if (simDonar25) {
        simDonar25.addEventListener('click', () => {
            state.totalRecaudado += 25;
            updateDashboard();
        });
    }

    if (simDonar120) {
        simDonar120.addEventListener('click', () => {
            state.totalRecaudado += 120;
            state.literasProduccion += 1;
            updateDashboard();
        });
    }

    if (simDonar240) {
        simDonar240.addEventListener('click', () => {
            state.totalRecaudado += 240;
            state.literasFinanciadas += 1;
            state.literasProduccion += 1;
            updateDashboard();
        });
    }

    if (simEntregar) {
        simEntregar.addEventListener('click', () => {
            if (state.literasProduccion > 0) {
                state.literasProduccion -= 1;
                state.literasEntregadas += 1;
                updateDashboard();
            } else {
                alert('No hay literas metálicas disponibles en el taller. ¡Simula más donaciones para iniciar la soldadura y producción!');
            }
        });
    }

    if (simReset) {
        simReset.addEventListener('click', () => {
            state = {
                totalRecaudado: 15600,
                literasFinanciadas: 65,
                literasProduccion: 45,
                literasEntregadas: 30
            };
            updateDashboard();
        });
    }


    // ==========================================================================
    // Selector de Donaciones & Animación de la Litera SVG (Sección Donar)
    // ==========================================================================
    const donarCards = document.querySelectorAll('.donar-card');
    const customAmountInput = document.getElementById('customAmount');
    const impactDescription = document.getElementById('impactDescription');
    const donationForm = document.getElementById('donationForm');
    
    // Partes del SVG Litera
    const bedFrame = document.getElementById('bed-frame');
    const bedLadder = document.getElementById('bed-ladder');
    const bedMattressTop = document.getElementById('bed-mattress-top');
    const bedMattressBottom = document.getElementById('bed-mattress-bottom');
    const kidTop = document.getElementById('kid-top');
    const kidBottom = document.getElementById('kid-bottom');

    // Actualiza la visualización del SVG e impacto
    function updateDonationImpact(amount) {
        if (!bedFrame) return; // Validación por seguridad
        
        // Reiniciar todas las clases activas
        bedFrame.classList.remove('active');
        bedLadder.classList.remove('active');
        bedMattressTop.classList.remove('active');
        bedMattressBottom.classList.remove('active');
        if (kidTop) kidTop.style.opacity = '0.1';
        if (kidBottom) kidBottom.style.opacity = '0.1';
        
        let descText = "";
        
        if (amount < 25) {
            descText = `Con $${amount} USD compras consumibles básicos como electrodos de soldar y pintura base anticorrosiva.`;
            bedFrame.classList.add('active');
        } else if (amount >= 25 && amount < 60) {
            descText = `Con $${amount} USD aseguras el metal tubular y tornillería básica de anclaje para la estructura de la litera.`;
            bedFrame.classList.add('active');
            bedLadder.classList.add('active');
        } else if (amount >= 60 && amount < 120) {
            descText = `Con $${amount} USD adquieres un colchón antialérgico especial, cómodo y resistente a la humedad.`;
            bedFrame.classList.add('active');
            bedLadder.classList.add('active');
            if (bedMattressTop) bedMattressTop.classList.add('active');
            if (kidTop) kidTop.style.opacity = '1';
        } else if (amount >= 120 && amount < 240) {
            descText = `Con $${amount} USD cubres el total de perfiles de acero estructurados y pagas al soldador local de ECOTECHNE, C.A. para armar la estructura.`;
            bedFrame.classList.add('active');
            bedLadder.classList.add('active');
            if (bedMattressTop) bedMattressTop.classList.add('active');
            if (bedMattressBottom) bedMattressBottom.classList.add('active');
            if (kidTop) kidTop.style.opacity = '1';
        } else {
            // $240 o superior
            descText = `¡Increíble! Con $${amount} USD financias la litera metálica doble completa con sus dos colchones. ¡Cambias el descanso de 2 personas para siempre!`;
            bedFrame.classList.add('active');
            bedLadder.classList.add('active');
            if (bedMattressTop) bedMattressTop.classList.add('active');
            if (bedMattressBottom) bedMattressBottom.classList.add('active');
            if (kidTop) kidTop.style.opacity = '1';
            if (kidBottom) kidBottom.style.opacity = '1';
        }
        
        if (impactDescription) impactDescription.textContent = descText;
    }

    // Event Listener para tarjetas de donación
    donarCards.forEach(card => {
        card.addEventListener('click', () => {
            donarCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const amount = parseInt(card.getAttribute('data-amount'), 10);
            if (customAmountInput) customAmountInput.value = amount;
            
            updateDonationImpact(amount);
        });
    });

    // Event Listener para input numérico
    if (customAmountInput) {
        customAmountInput.addEventListener('input', (e) => {
            let amount = parseInt(e.target.value, 10);
            if (isNaN(amount) || amount < 0) amount = 0;
            
            donarCards.forEach(card => {
                const cardAmount = parseInt(card.getAttribute('data-amount'), 10);
                if (cardAmount === amount) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
            
            updateDonationImpact(amount);
        });
    }

    // Conectar el formulario de donaciones real con el Tablero
    if (donationForm) {
        donationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseInt(customAmountInput.value, 10) || 0;
            if (amount >= 5) {
                // Actualizar estado general
                state.totalRecaudado += amount;
                
                // Calcular literas financiadas y en taller basadas en el aporte de forma demostrativa
                if (amount >= 240) {
                    const count = Math.floor(amount / 240);
                    state.literasFinanciadas += count;
                    state.literasProduccion += count;
                } else if (amount >= 120) {
                    state.literasProduccion += 1;
                }
                
                updateDashboard();
                
                alert(`¡Gracias por tu aporte simulado de $${amount} USD! Hemos sumado tu donativo al Tablero de Monitoreo en Vivo.`);
                
                // Desplazarse de forma fluida hacia el Tablero para ver los resultados
                const tableroSection = document.getElementById('tablero');
                if (tableroSection) {
                    tableroSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // Inicializar estado del impacto al cargar la página
    updateDonationImpact(25);

    // ==========================================================================
    // Acordeón FAQ
    // ==========================================================================
    const faqTriggers = document.querySelectorAll('.faq-trigger');
    
    faqTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const parent = trigger.parentElement;
            const content = trigger.nextElementSibling;
            const isOpen = parent.classList.contains('active');
            
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                const c = item.querySelector('.faq-content');
                if (c) c.style.maxHeight = null;
            });
            
            if (!isOpen) {
                parent.classList.add('active');
                if (content) content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});
