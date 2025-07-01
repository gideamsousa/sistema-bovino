// Cadastrar module
window.cadastrarModule = {
    init() {
        this.setupForm();
        this.setupValidation();
    },

    setupForm() {
        const form = document.getElementById('animal-form');
        const clearButton = document.getElementById('clear-form');

        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        if (clearButton) {
            clearButton.addEventListener('click', this.clearForm.bind(this));
        }

        // Setup phone number formatting
        const phoneInput = document.getElementById('telefone');
        if (phoneInput) {
            phoneInput.addEventListener('input', this.formatPhoneInput.bind(this));
        }

        // Setup species-based breed suggestions
        const especieSelect = document.getElementById('especie');
        const racaInput = document.getElementById('raca');
        
        if (especieSelect && racaInput) {
            especieSelect.addEventListener('change', this.updateBreedSuggestions.bind(this));
        }
    },

    setupValidation() {
        const form = document.getElementById('animal-form');
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            input.addEventListener('blur', this.validateField.bind(this));
            input.addEventListener('input', this.clearFieldError.bind(this));
        });
    },

    handleSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        // Validate form
        if (!window.utils.validateForm(form)) {
            window.app.showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        // Additional validations
        if (!this.validateAnimalData(formData)) {
            return;
        }

        // Convert FormData to object
        const animalData = {};
        for (let [key, value] of formData.entries()) {
            animalData[key] = value;
        }

        // Add calculated fields
        animalData.imc = this.calculateIMC(animalData.peso, animalData.especie);
        animalData.categoria = this.categorizeAnimal(animalData);

        try {
            // Save animal
            const savedAnimal = window.app.saveAnimal(animalData);
            
            // Show success message
            window.app.showToast(`Animal ${animalData.nome} cadastrado com sucesso!`, 'success');
            
            // Clear form
            this.clearForm();
            
            // Optional: Navigate to consultation page to show the new animal
            setTimeout(() => {
                window.app.navigateTo('consultar');
            }, 1500);

        } catch (error) {
            console.error('Erro ao cadastrar animal:', error);
            window.app.showToast('Erro ao cadastrar animal. Tente novamente.', 'error');
        }
    },

    validateAnimalData(formData) {
        const idade = parseInt(formData.get('idade'));
        const peso = parseFloat(formData.get('peso'));
        const telefone = formData.get('telefone');

        // Validate age
        if (idade < 0 || idade > 50) {
            window.app.showToast('Idade deve estar entre 0 e 50 anos.', 'error');
            return false;
        }

        // Validate weight
        if (peso <= 0 || peso > 2000) {
            window.app.showToast('Peso deve ser maior que 0 e menor que 2000kg.', 'error');
            return false;
        }

        // Validate phone number
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        if (!phoneRegex.test(telefone)) {
            window.app.showToast('Formato de telefone inválido. Use (XX) XXXXX-XXXX', 'error');
            return false;
        }

        return true;
    },

    validateField(event) {
        const field = event.target;
        const value = field.value.trim();

        // Remove previous error state
        field.classList.remove('error');

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, 'Este campo é obrigatório');
            return false;
        }

        // Specific field validations
        switch (field.type) {
            case 'email':
                if (value && !this.isValidEmail(value)) {
                    this.showFieldError(field, 'Email inválido');
                    return false;
                }
                break;
            case 'tel':
                if (value && !this.isValidPhone(value)) {
                    this.showFieldError(field, 'Telefone inválido');
                    return false;
                }
                break;
            case 'number':
                const min = parseFloat(field.min);
                const max = parseFloat(field.max);
                const numValue = parseFloat(value);
                
                if (value && (isNaN(numValue) || numValue < min || numValue > max)) {
                    this.showFieldError(field, `Valor deve estar entre ${min} e ${max}`);
                    return false;
                }
                break;
        }

        return true;
    },

    showFieldError(field, message) {
        field.classList.add('error');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Add error message
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: var(--error-500);
            font-size: var(--font-size-xs);
            margin-top: var(--space-1);
        `;
        
        field.parentNode.appendChild(errorElement);
    },

    clearFieldError(event) {
        const field = event.target;
        field.classList.remove('error');
        
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    },

    formatPhoneInput(event) {
        const input = event.target;
        let value = input.value.replace(/\D/g, '');
        
        if (value.length >= 11) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 6) {
            value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length >= 2) {
            value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        }
        
        input.value = value;
    },

    updateBreedSuggestions(event) {
        const especie = event.target.value;
        const racaInput = document.getElementById('raca');
        
        if (!racaInput) return;

        // Common breeds by species
        const breedSuggestions = {
            canino: ['Labrador', 'Golden Retriever', 'Pastor Alemão', 'Bulldog', 'Poodle', 'Rottweiler', 'Beagle', 'SRD'],
            felino: ['Persa', 'Siamês', 'Maine Coon', 'British Shorthair', 'Ragdoll', 'Bengal', 'SRD'],
            bovino: ['Nelore', 'Angus', 'Brahman', 'Gir', 'Holandês', 'Jersey'],
            equino: ['Quarto de Milha', 'Mangalarga', 'Árabe', 'Puro Sangue Inglês', 'Crioulo'],
            suino: ['Landrace', 'Large White', 'Duroc', 'Hampshire', 'Pietrain'],
            ovino: ['Santa Inês', 'Dorper', 'Morada Nova', 'Somalis Brasileira']
        };

        // Add datalist for breed suggestions
        let datalist = document.getElementById('raca-suggestions');
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = 'raca-suggestions';
            racaInput.parentNode.appendChild(datalist);
            racaInput.setAttribute('list', 'raca-suggestions');
        }

        // Clear previous options
        datalist.innerHTML = '';

        // Add new options
        if (breedSuggestions[especie]) {
            breedSuggestions[especie].forEach(breed => {
                const option = document.createElement('option');
                option.value = breed;
                datalist.appendChild(option);
            });
        }
    },

    calculateIMC(peso, especie) {
        // Simplified IMC calculation based on species
        const pesoNum = parseFloat(peso);
        
        const imcRanges = {
            canino: { min: 15, max: 35 },
            felino: { min: 3, max: 8 },
            bovino: { min: 400, max: 800 },
            equino: { min: 300, max: 600 },
            suino: { min: 80, max: 200 },
            ovino: { min: 30, max: 80 }
        };

        const range = imcRanges[especie];
        if (!range) return 'Normal';

        if (pesoNum < range.min) return 'Abaixo do peso';
        if (pesoNum > range.max) return 'Acima do peso';
        return 'Normal';
    },

    categorizeAnimal(animalData) {
        const idade = parseInt(animalData.idade);
        
        if (idade < 1) return 'Filhote';
        if (idade < 7) return 'Adulto';
        return 'Idoso';
    },

    clearForm() {
        const form = document.getElementById('animal-form');
        window.utils.clearForm(form);
        
        // Clear any error messages
        const errorElements = form.querySelectorAll('.field-error');
        errorElements.forEach(error => error.remove());
    },

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isValidPhone(phone) {
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        return phoneRegex.test(phone);
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.app && window.app.currentPage === 'cadastrar') {
        window.cadastrarModule.init();
    }
});