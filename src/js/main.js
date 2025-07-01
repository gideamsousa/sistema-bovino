// Main application controller
class AnimalManagementApp {
    constructor() {
        this.currentPage = 'home';
        this.animals = JSON.parse(localStorage.getItem('animals')) || [];
        this.classifications = JSON.parse(localStorage.getItem('classifications')) || [];
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.updateStats();
        this.setupFeatureCardNavigation();
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const pages = document.querySelectorAll('.page');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetPage = item.dataset.page;
                this.navigateTo(targetPage);
            });
        });
    }

    setupFeatureCardNavigation() {
        const featureCards = document.querySelectorAll('.feature-card[data-page]');
        featureCards.forEach(card => {
            card.addEventListener('click', () => {
                const targetPage = card.dataset.page;
                this.navigateTo(targetPage);
            });
        });
    }

    navigateTo(page) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Update pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.getElementById(`${page}-page`).classList.add('active');

        this.currentPage = page;

        // Trigger page-specific initialization
        this.initializePage(page);
    }

    initializePage(page) {
        switch(page) {
            case 'home':
                this.updateStats();
                break;
            case 'cadastrar':
                if (window.cadastrarModule) {
                    window.cadastrarModule.init();
                }
                break;
            case 'classificar':
                if (window.classificarModule) {
                    window.classificarModule.init();
                }
                break;
            case 'consultar':
                if (window.consultarModule) {
                    window.consultarModule.init();
                }
                break;
        }
    }

    updateStats() {
        const totalAnimals = this.animals.length;
        const totalBreeds = [...new Set(this.animals.map(animal => animal.raca))].length;
        const totalClassifications = this.classifications.length;

        // Animate numbers
        this.animateNumber('total-animals', totalAnimals);
        this.animateNumber('total-breeds', totalBreeds);
        this.animateNumber('total-classifications', totalClassifications);
    }

    animateNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
            
            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // Data management methods
    saveAnimal(animalData) {
        const animal = {
            id: Date.now().toString(),
            ...animalData,
            createdAt: new Date().toISOString()
        };

        this.animals.push(animal);
        localStorage.setItem('animals', JSON.stringify(this.animals));
        this.updateStats();
        
        return animal;
    }

    saveClassification(classificationData) {
        const classification = {
            id: Date.now().toString(),
            ...classificationData,
            createdAt: new Date().toISOString()
        };

        this.classifications.push(classification);
        localStorage.setItem('classifications', JSON.stringify(this.classifications));
        this.updateStats();
        
        return classification;
    }

    getAnimals() {
        return this.animals;
    }

    getClassifications() {
        return this.classifications;
    }

    searchAnimals(filters) {
        return this.animals.filter(animal => {
            let matches = true;

            if (filters.raca && filters.raca.trim()) {
                matches = matches && animal.raca.toLowerCase().includes(filters.raca.toLowerCase());
            }

            if (filters.especie && filters.especie.trim()) {
                matches = matches && animal.especie === filters.especie;
            }

            return matches;
        });
    }

    // Utility methods
    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        toastContainer.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
}

// Initialize the application
const app = new AnimalManagementApp();

// Make app globally available
window.app = app;

// Utility functions
window.utils = {
    validateForm: (formElement) => {
        const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });

        return isValid;
    },

    clearForm: (formElement) => {
        const inputs = formElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
            input.classList.remove('error');
        });
    },

    formatPhoneNumber: (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
    },

    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Add error styling
const style = document.createElement('style');
style.textContent = `
    .form-input.error,
    .form-select.error,
    .form-textarea.error {
        border-color: var(--error-500);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
`;
document.head.appendChild(style);