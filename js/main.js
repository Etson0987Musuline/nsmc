// main.js - Versión mejorada con mejor funcionalidad móvil

class QuechuaApp {
    constructor() {
        this.currentLesson = null;
        this.completedLessons = new Set(
            JSON.parse(localStorage.getItem('completedLessons') || '[]')
        );
        this.navMenu = document.querySelector('.nav-menu');
        this.hamburger = document.querySelector('.hamburger');
        this.isMobileMenuOpen = false;

        this.initializeEventListeners();
        this.initializeDropdowns();
        this.initializeMobileMenu();
        this.updateNavigation();
        this.createNotificationContainer();
        this.handleResize();
    }

    initializeEventListeners() {
        // Menú hamburguesa
        if (this.hamburger && this.navMenu) {
            this.hamburger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMenu();
            });
        }

        // Enlaces de navegación
        if (this.navMenu) {
            this.navMenu.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    // Si no es un dropdown toggle, cerrar menú móvil
                    if (!link.classList.contains('dropdown-toggle')) {
                        this.setActiveNav(link);
                        this.closeMobileMenu();
                    }
                });
            });
        }

        // Cerrar dropdowns y menú móvil al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!this.navMenu?.contains(e.target) && 
                !this.hamburger?.contains(e.target)) {
                this.closeMobileMenu();
                this.closeAllDropdowns();
            }
        });

        // Soporte de teclado mejorado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
                this.closeAllDropdowns();
                document.querySelectorAll('.tooltip').forEach(t => t.remove());
            }
            if (e.altKey && e.key.toLowerCase() === 'm') {
                e.preventDefault();
                this.toggleMobileMenu();
            }
        });

        // Detectar cambios de tamaño de ventana
        window.addEventListener('resize', () => this.handleResize());
    }

    initializeMobileMenu() {
        // Crear botón hamburguesa si no existe
        if (!this.hamburger && document.querySelector('.navbar')) {
            this.createHamburgerButton();
        }
    }

    createHamburgerButton() {
        const navbar = document.querySelector('.navbar .container');
        const hamburger = document.createElement('button');
        hamburger.className = 'hamburger';
        hamburger.setAttribute('aria-label', 'Menú');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.innerHTML = `
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        `;
        
        navbar.appendChild(hamburger);
        this.hamburger = hamburger;

        this.hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu();
        });
    }

    initializeDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (toggle && menu) {
                // Click en toggle
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleDropdown(dropdown);
                });

                // Hover en desktop
                if (window.innerWidth >= 768) {
                    dropdown.addEventListener('mouseenter', () => {
                        if (!this.isMobile()) {
                            this.openDropdown(dropdown);
                        }
                    });

                    dropdown.addEventListener('mouseleave', () => {
                        if (!this.isMobile()) {
                            setTimeout(() => {
                                if (!dropdown.matches(':hover')) {
                                    this.closeDropdown(dropdown);
                                }
                            }, 100);
                        }
                    });
                }

                // Manejar clicks en items del dropdown
                menu.querySelectorAll('.dropdown-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        const href = item.getAttribute('href');
                        if (href && href !== '#') {
                            // Navegación real
                            window.location.href = href;
                        }
                        this.closeAllDropdowns();
                        this.closeMobileMenu();
                    });
                });
            }
        });
    }

    toggleMobileMenu() {
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.isMobileMenuOpen = true;
        this.navMenu?.classList.add('active');
        this.hamburger?.classList.add('active');
        this.hamburger?.setAttribute('aria-expanded', 'true');
        
        // Cerrar dropdowns al abrir menú móvil
        this.closeAllDropdowns();
        
        // Prevenir scroll del body
        document.body.classList.add('menu-open');
        
        // Animación staggered para los elementos del menú
        if (this.navMenu) {
            const navItems = this.navMenu.querySelectorAll('.nav-link, .dropdown');
            navItems.forEach((item, index) => {
                item.style.animationDelay = `${index * 0.1}s`;
            });
        }
    }

    closeMobileMenu() {
        this.isMobileMenuOpen = false;
        this.navMenu?.classList.remove('active');
        this.hamburger?.classList.remove('active');
        this.hamburger?.setAttribute('aria-expanded', 'false');
        
        // Restaurar scroll del body
        document.body.classList.remove('menu-open');
    }

    toggleDropdown(targetDropdown) {
        const isActive = targetDropdown.classList.contains('active');
        
        if (this.isMobile()) {
            // En móvil, comportamiento accordion
            if (isActive) {
                this.closeDropdown(targetDropdown);
            } else {
                // Cerrar otros dropdowns
                this.closeAllDropdowns();
                this.openDropdown(targetDropdown);
            }
        } else {
            // En desktop, comportamiento normal
            if (isActive) {
                this.closeDropdown(targetDropdown);
            } else {
                this.closeAllDropdowns();
                this.openDropdown(targetDropdown);
            }
        }
    }

    openDropdown(dropdown) {
        dropdown.classList.add('active');
        const menu = dropdown.querySelector('.dropdown-menu');
        const toggle = dropdown.querySelector('.dropdown-toggle');
        
        if (menu) {
            menu.style.animation = 'dropdownFadeIn 0.3s ease-out';
            menu.setAttribute('aria-hidden', 'false');
        }
        
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'true');
        }
    }

    closeDropdown(dropdown) {
        dropdown.classList.remove('active');
        const menu = dropdown.querySelector('.dropdown-menu');
        const toggle = dropdown.querySelector('.dropdown-toggle');
        
        if (menu) {
            menu.setAttribute('aria-hidden', 'true');
        }
        
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown.active').forEach(dropdown => {
            this.closeDropdown(dropdown);
        });
    }

    setActiveNav(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    isMobile() {
        return window.innerWidth < 768;
    }

    handleResize() {
        if (window.innerWidth >= 768) {
            // En desktop, cerrar menú móvil si está abierto
            this.closeMobileMenu();
            document.body.classList.remove('menu-open');
        } else {
            // En móvil, asegurar que los dropdowns funcionen con click
            this.closeAllDropdowns();
        }
    }

    updateNavigation() {
        this.completedLessons.forEach(lessonId => {
            const link = document.querySelector(`[href*="${lessonId}"]`);
            if (link) {
                link.classList.add('completed');
                // Añadir icono de completado
                if (!link.querySelector('.completed-icon')) {
                    const icon = document.createElement('span');
                    icon.className = 'completed-icon';
                    icon.innerHTML = '✅';
                    link.appendChild(icon);
                }
            }
        });
    }

    completeLesson(lessonId) {
        this.completedLessons.add(lessonId);
        localStorage.setItem('completedLessons', JSON.stringify([...this.completedLessons]));
        this.updateNavigation();
        this.showNotification('¡Lección completada! 🎉', 'success');
    }

    createNotificationContainer() {
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = 'info') {
        const container = document.querySelector('.notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${this.getNotificationBg(type)};
            color: white;
            padding: 12px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            pointer-events: auto;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        const content = document.createElement('div');
        content.className = 'notification-content';
        content.innerHTML = `
            <span class="notification-icon">${this.getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                margin-left: auto;
                padding: 0 5px;
            ">×</button>
        `;
        
        notification.appendChild(content);
        container.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto-remover después de 4 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    getNotificationBg(type) {
        const backgrounds = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        };
        return backgrounds[type] || backgrounds.info;
    }
}

// -------------------------------
// Gestor de lecciones mejorado
// -------------------------------
class LessonManager {
    constructor(appInstance) {
        this.app = appInstance;
        this.currentLesson = null;
        this.completedExercises = new Set();
        this.progress = 0;
    }

    startLesson(lessonId) {
        this.currentLesson = lessonId;
        this.completedExercises.clear();
        this.progress = 0;
        this.updateProgressBar();
        this.app.showNotification(`Iniciando lección: ${lessonId}`, 'info');
    }

    completeExercise(exerciseId) {
        if (this.completedExercises.has(exerciseId)) return;
        
        this.completedExercises.add(exerciseId);
        const totalExercises = document.querySelectorAll('.exercise').length;
        
        if (totalExercises > 0) {
            this.progress = (this.completedExercises.size / totalExercises) * 100;
            this.updateProgressBar();
            
            if (this.completedExercises.size === totalExercises) {
                this.app.completeLesson(this.currentLesson);
            }
        }
    }

    updateProgressBar() {
        const progressBar = document.querySelector('.lesson-progress');
        if (progressBar) {
            progressBar.style.width = `${this.progress}%`;
            progressBar.setAttribute('data-progress', `${Math.round(this.progress)}%`);
        }
    }
}

// -------------------------------
// Quiz interactivo mejorado
// -------------------------------
class QuizManager {
    constructor() {
        this.score = 0;
        this.totalQuestions = 0;
        this.answers = new Map();
    }

    checkAnswer(questionId, selectedAnswer, correctAnswer) {
        if (this.answers.has(questionId)) return; // Ya respondida
        
        this.answers.set(questionId, selectedAnswer);
        const isCorrect = selectedAnswer === correctAnswer;
        
        if (isCorrect) {
            this.score++;
        }
        
        this.totalQuestions++;
        this.updateScore();
        this.highlightAnswer(questionId, selectedAnswer, correctAnswer, isCorrect);
        
        return isCorrect;
    }

    highlightAnswer(questionId, selected, correct, isCorrect) {
        const questionElement = document.getElementById(questionId);
        if (!questionElement) return;

        const options = questionElement.querySelectorAll('.quiz-option');
        options.forEach(option => {
            const value = option.dataset.value;
            
            if (value === selected) {
                option.classList.add(isCorrect ? 'correct' : 'incorrect');
                option.style.background = isCorrect ? '#10b981' : '#ef4444';
                option.style.color = 'white';
            }
            if (value === correct && !isCorrect) {
                option.classList.add('correct-answer');
                option.style.background = '#10b981';
                option.style.color = 'white';
            }
            
            option.style.pointerEvents = 'none'; // Desabilitar clicks
        });
    }

    updateScore() {
        const scoreElements = document.querySelectorAll('.quiz-score');
        scoreElements.forEach(element => {
            element.textContent = `Puntaje: ${this.score}/${this.totalQuestions}`;
            element.style.color = this.score === this.totalQuestions ? '#10b981' : '#6b7280';
        });
    }

    resetQuiz() {
        this.score = 0;
        this.totalQuestions = 0;
        this.answers.clear();
        
        // Limpiar interfaz
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.classList.remove('correct', 'incorrect', 'correct-answer');
            option.style.pointerEvents = 'auto';
            option.style.background = '';
            option.style.color = '';
        });
        
        this.updateScore();
    }
}

// -------------------------------
// Constructor de palabras mejorado
// -------------------------------
class WordBuilder {
    constructor() {
        this.root = '';
        this.suffixes = [];
        this.history = [];
    }

    setRoot(root) {
        this.root = root;
        this.updateDisplay();
    }

    addSuffix(suffix) {
        this.suffixes.push(suffix);
        this.history.push(`+${suffix}`);
        this.updateDisplay();
    }

    removeLast() {
        if (this.suffixes.length > 0) {
            this.suffixes.pop();
            this.history.pop();
            this.updateDisplay();
        }
    }

    clear() {
        this.root = '';
        this.suffixes = [];
        this.history = [];
        this.updateDisplay();
    }

    updateDisplay() {
        const result = this.root + this.suffixes.join('');
        const displays = document.querySelectorAll('.word-result');
        
        displays.forEach(display => {
            display.textContent = result || 'Selecciona una raíz...';
            display.classList.toggle('empty', !result);
        });

        // Actualizar historial
        const historyDisplay = document.querySelector('.word-history');
        if (historyDisplay) {
            historyDisplay.textContent = this.history.join(' ');
        }
    }
}

// -------------------------------
// Utilidades mejoradas
// -------------------------------

// Formateo de texto Quechua mejorado
function formatQuechuaText(text) {
    return text
        .replace(/c(?![h])/g, 'k')
        .replace(/C(?![h])/g, 'K')
        .replace(/qu/g, 'q')
        .replace(/Qu/g, 'Q');
}

// Buscador mejorado
function performSearch(query) {
    if (!query.trim()) {
        showNotification('Ingresa un término de búsqueda', 'warning');
        return;
    }
    
    showNotification(`Buscando: "${query}"...`, 'info');
    
    // Simulación de búsqueda
    setTimeout(() => {
        const results = mockSearch(query);
        displaySearchResults(results);
    }, 500);
}

function mockSearch(query) {
    // Datos de ejemplo - reemplazar con datos reales
    const mockData = [
        { type: 'palabra', quechua: 'munay', spanish: 'querer, amar' },
        { type: 'frase', quechua: 'munakuyki', spanish: 'te quiero' },
        { type: 'gramatica', title: 'Sufijos posesivos', url: 'sufijos.html' }
    ];
    
    return mockData.filter(item => 
        item.quechua?.toLowerCase().includes(query.toLowerCase()) ||
        item.spanish?.toLowerCase().includes(query.toLowerCase()) ||
        item.title?.toLowerCase().includes(query.toLowerCase())
    );
}

function displaySearchResults(results) {
    console.log('Resultados de búsqueda:', results);
    // Implementar visualización de resultados
}

// Función global para notificaciones (compatible con versión anterior)
function showNotification(message, type = 'info') {
    if (window.quechuaApp) {
        window.quechuaApp.showNotification(message, type);
    }
}

// -------------------------------
// Inicialización mejorada
// -------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia global de la aplicación
    window.quechuaApp = new QuechuaApp();
    window.lessonManager = new LessonManager(window.quechuaApp);
    window.quizManager = new QuizManager();
    window.wordBuilder = new WordBuilder();

    // Inicializar tooltips mejorados
    initializeTooltips();
    
    // Inicializar efectos visuales
    initializeAnimations();
    
    console.log('Quechua App inicializada correctamente ✅');
});

// -------------------------------
// Funciones auxiliares
// -------------------------------
function initializeTooltips() {
    // Crear contenedor de tooltip global
    if (!document.querySelector('.tooltip-container')) {
        const tooltipContainer = document.createElement('div');
        tooltipContainer.className = 'tooltip-container';
        tooltipContainer.style.cssText = `
            position: absolute;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(tooltipContainer);
    }

    // Configurar tooltips para morfemas
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        element.addEventListener('focus', showTooltip);
        element.addEventListener('blur', hideTooltip);
    });
}

function showTooltip(e) {
    const element = e.target;
    const text = element.dataset.tooltip;
    if (!text) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip active';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        position: absolute;
        z-index: 10001;
        white-space: nowrap;
        transform: translateX(-50%);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
    `;
    
    const container = document.querySelector('.tooltip-container');
    container.appendChild(tooltip);
    
    // Posicionar tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
    
    // Mostrar con animación
    setTimeout(() => {
        tooltip.style.opacity = '1';
    }, 50);
}

function hideTooltip() {
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        tooltip.style.opacity = '0';
        setTimeout(() => tooltip.remove(), 200);
    });
}

function initializeAnimations() {
    // Intersection Observer para animaciones al hacer scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observar elementos con clase 'animate-on-scroll'
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Funciones de utilidad exportadas globalmente
window.QuechuaUtils = {
    formatQuechuaText,
    performSearch,
    showNotification
};

// Fix para dropdowns - Asegurar que funcionen correctamente
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un momento para que todo se inicialice
    setTimeout(() => {
        document.querySelectorAll('.dropdown-item').forEach(item => {
            // Forzar event listener para navegación
            item.addEventListener('click', function(e) {
                console.log('Click en:', this.textContent.trim());
                const href = this.getAttribute('href');
                if (href && href !== '#') {
                    e.preventDefault();
                    window.location.href = href;
                }
            });
        });
    }, 100);
});

// Manejo de errores global
window.addEventListener('error', (e) => {
    console.error('Error en Quechua App:', e.error);
    if (window.quechuaApp) {
        window.quechuaApp.showNotification('Ocurrió un error inesperado', 'error');
    }
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`Quechua App cargada en ${Math.round(loadTime)}ms`);
    });
}