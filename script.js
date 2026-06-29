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
    const metaLiteras = 100;
    
    // Estado inicial (comienza en 0 y se actualiza al cargar el Google Sheet o usar fallbacks)
    let state = {
        totalRecaudado: 0,
        literasFinanciadas: 0,
        literasProduccion: 0,
        literasEntregadas: 0
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
        // Calcular automáticamente las literas financiadas a partir del total recaudado (costo estimado por litera: $150 USD)
        state.literasFinanciadas = Math.floor(state.totalRecaudado / 150);

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

    // El Dashboard se inicializará y animará automáticamente en cuanto finalice el fetch de Google Sheets o carguen los fallbacks.

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
                totalRecaudado: 0,
                literasFinanciadas: 0,
                literasProduccion: 0,
                literasEntregadas: 0
            };
            fetchGoogleSheetData();
        });
    }


    // ==========================================================================
    // Integración de Google Sheets (Base de Datos via JSONP para evitar CORS)
    // ==========================================================================
    const SPREADSHEET_ID = '1s7mhuWQs1XWsVrhaUg0j0nT5Ib7Zky4hoGRCnX0i4Oo'; 
    
    // Callback global de JSONP que ejecutará Google Sheets
    window.handleGoogleSheetResponse = function(data) {
        if (data.table && data.table.rows) {
            let sheetData = {};
            
            // Formato Horizontal: Las columnas (cols) son las claves, la primera fila (rows[0]) tiene los valores
            const cols = data.table.cols;
            const firstRow = data.table.rows[0];
            
            if (cols && cols.length > 0 && firstRow && firstRow.c) {
                cols.forEach((col, index) => {
                    const cell = firstRow.c[index];
                    if (cell && cell.v !== null) {
                        const key = col.label ? String(col.label).trim().toLowerCase() : '';
                        if (key) {
                            sheetData[key] = parseFloat(cell.v);
                        }
                    }
                });
            }
            
            // Formato Vertical (Fallback)
            if (Object.keys(sheetData).length === 0) {
                data.table.rows.forEach(row => {
                    if (row.c && row.c[0]) {
                        const key = row.c[0].v ? String(row.c[0].v).trim().toLowerCase() : '';
                        const value = (row.c[1] && row.c[1].v !== null) ? parseFloat(row.c[1].v) : 0;
                        if (key) {
                            sheetData[key] = value;
                        }
                    }
                });
            }
            
            // Mapear al estado
            if (sheetData['recaudado'] !== undefined) state.totalRecaudado = sheetData['recaudado'];
            if (sheetData['en_taller'] !== undefined) state.literasProduccion = Math.floor(sheetData['en_taller']);
            if (sheetData['entregadas'] !== undefined) state.literasEntregadas = Math.floor(sheetData['entregadas']);
            
            updateDashboard();
            console.log("Datos de Google Sheets (JSONP) actualizados:", sheetData);
        }
    };

    function fetchGoogleSheetData() {
        if (!SPREADSHEET_ID || SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
            console.log("Usando datos locales por defecto. Configura el SPREADSHEET_ID.");
            state = {
                totalRecaudado: 15600,
                literasFinanciadas: 65,
                literasProduccion: 45,
                literasEntregadas: 30
            };
            updateDashboard();
            return;
        }
        
        // Remover script anterior si existe para evitar acumulación
        const oldScript = document.getElementById('gsheet-jsonp');
        if (oldScript) oldScript.remove();
        
        // Crear elemento script dinámico (JSONP para evitar cualquier restricción de CORS)
        const script = document.createElement('script');
        script.id = 'gsheet-jsonp';
        script.src = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=responseHandler:handleGoogleSheetResponse`;
        
        script.onerror = () => {
            console.error("Error al cargar JSONP de Google Sheets. Cargando datos de fallback.");
            state = {
                totalRecaudado: 15600,
                literasFinanciadas: 65,
                literasProduccion: 45,
                literasEntregadas: 30
            };
            updateDashboard();
        };
        
        document.head.appendChild(script);
    }

    // Cargar datos de Google Sheets al iniciar
    fetchGoogleSheetData();

    // ==========================================================================
    // Interactividad de Tarjetas de WhatsApp y Animación del SVG Litera
    // ==========================================================================
    const whatsappCards = document.querySelectorAll('.whatsapp-card');
    
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
        if (bedMattressTop) bedMattressTop.classList.remove('active');
        if (bedMattressBottom) bedMattressBottom.classList.remove('active');
        if (kidTop) kidTop.style.opacity = '0.1';
        if (kidBottom) kidBottom.style.opacity = '0.1';
        
        if (amount < 25) {
            bedFrame.classList.add('active');
        } else if (amount >= 25 && amount < 60) {
            bedFrame.classList.add('active');
            bedLadder.classList.add('active');
        } else if (amount >= 60 && amount < 120) {
            bedFrame.classList.add('active');
            bedLadder.classList.add('active');
            if (bedMattressTop) bedMattressTop.classList.add('active');
            if (kidTop) kidTop.style.opacity = '1';
        } else if (amount >= 120 && amount < 240) {
            bedFrame.classList.add('active');
            bedLadder.classList.add('active');
            if (bedMattressTop) bedMattressTop.classList.add('active');
            if (bedMattressBottom) bedMattressBottom.classList.add('active');
            if (kidTop) kidTop.style.opacity = '1';
        } else {
            // $240 o superior
            bedFrame.classList.add('active');
            bedLadder.classList.add('active');
            if (bedMattressTop) bedMattressTop.classList.add('active');
            if (bedMattressBottom) bedMattressBottom.classList.add('active');
            if (kidTop) kidTop.style.opacity = '1';
            if (kidBottom) kidBottom.style.opacity = '1';
        }
    }

    // Event Listeners para pasar el ratón (hover) sobre las tarjetas de WhatsApp y animar el SVG
    whatsappCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const amount = parseInt(card.getAttribute('data-amount'), 10);
            updateDonationImpact(amount);
        });
        
        card.addEventListener('mouseleave', () => {
            // Volver al estado por defecto (25) al quitar el cursor
            updateDonationImpact(25);
        });
    });

    // Inicializar estado del impacto al cargar la página
    updateDonationImpact(25);

    // ==========================================================================
    // Filtros de Galería
    // ==========================================================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (filterBtns.length > 0 && galleryItems.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Cambiar botón activo
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                
                galleryItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
        
        // Inicializar opacidad y escala de los items de la galería
        galleryItems.forEach(item => {
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
        });
    }

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
