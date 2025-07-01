// Consultar module
window.consultarModule = {
    currentResults: [],
    
    init() {
        this.setupSearch();
        this.loadInitialResults();
    },

    setupSearch() {
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-raca');
        const filterSelect = document.getElementById('filter-especie');

        if (searchBtn) {
            searchBtn.addEventListener('click', this.performSearch.bind(this));
        }

        if (searchInput) {
            // Debounced search on input
            const debouncedSearch = window.utils.debounce(this.performSearch.bind(this), 300);
            searchInput.addEventListener('input', debouncedSearch);
            
            // Search on Enter key
            searchInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', this.performSearch.bind(this));
        }
    },

    loadInitialResults() {
        // Load all animals initially
        this.currentResults = window.app.getAnimals();
        this.displayResults(this.currentResults);
    },

    performSearch() {
        const searchInput = document.getElementById('search-raca');
        const filterSelect = document.getElementById('filter-especie');
        
        const filters = {
            raca: searchInput ? searchInput.value.trim() : '',
            especie: filterSelect ? filterSelect.value : ''
        };

        // Show loading state
        this.showLoading(true);

        // Simulate search delay for better UX
        setTimeout(() => {
            this.currentResults = window.app.searchAnimals(filters);
            this.displayResults(this.currentResults);
            this.showLoading(false);
        }, 300);
    },

    displayResults(animals) {
        const resultsGrid = document.getElementById('results-grid');
        const resultsCount = document.getElementById('results-count');
        
        if (!resultsGrid || !resultsCount) return;

        // Update count
        const count = animals.length;
        resultsCount.textContent = `${count} ${count === 1 ? 'animal encontrado' : 'animais encontrados'}`;

        // Clear previous results
        resultsGrid.innerHTML = '';

        if (count === 0) {
            this.showNoResults(resultsGrid);
            return;
        }

        // Group animals by breed for better organization
        const groupedAnimals = this.groupAnimalsByBreed(animals);
        
        // Display grouped results
        Object.entries(groupedAnimals).forEach(([breed, breedAnimals]) => {
            this.displayBreedGroup(resultsGrid, breed, breedAnimals);
        });
    },

    groupAnimalsByBreed(animals) {
        return animals.reduce((groups, animal) => {
            const breed = animal.raca || 'Sem raça definida';
            if (!groups[breed]) {
                groups[breed] = [];
            }
            groups[breed].push(animal);
            return groups;
        }, {});
    },

    displayBreedGroup(container, breed, animals) {
        // Create breed section
        const breedSection = document.createElement('div');
        breedSection.className = 'breed-section';
        breedSection.style.cssText = `
            grid-column: 1 / -1;
            margin-bottom: var(--space-6);
        `;

        // Breed header
        const breedHeader = document.createElement('div');
        breedHeader.className = 'breed-header';
        breedHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-4);
            padding-bottom: var(--space-2);
            border-bottom: 2px solid var(--primary-200);
        `;

        breedHeader.innerHTML = `
            <h3 style="font-size: var(--font-size-xl); font-weight: 600; color: var(--secondary-900);">
                ${breed}
            </h3>
            <span style="background: var(--primary-100); color: var(--primary-700); padding: var(--space-1) var(--space-3); border-radius: var(--radius-md); font-size: var(--font-size-sm); font-weight: 500;">
                ${animals.length} ${animals.length === 1 ? 'animal' : 'animais'}
            </span>
        `;

        breedSection.appendChild(breedHeader);

        // Animals grid for this breed
        const animalsGrid = document.createElement('div');
        animalsGrid.className = 'animals-grid';
        animalsGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: var(--space-4);
        `;

        animals.forEach(animal => {
            const animalCard = this.createAnimalCard(animal);
            animalsGrid.appendChild(animalCard);
        });

        breedSection.appendChild(animalsGrid);
        container.appendChild(breedSection);
    },

    createAnimalCard(animal) {
        const card = document.createElement('div');
        card.className = 'animal-card';
        
        const age = this.calculateAge(animal.idade);
        const registrationDate = window.app.formatDate(animal.createdAt);
        
        card.innerHTML = `
            <div class="animal-header" style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-4);">
                <div>
                    <h4 class="animal-name">${animal.nome}</h4>
                    <div style="font-size: var(--font-size-sm); color: var(--secondary-500);">
                        ${animal.especie} • ${animal.sexo}
                    </div>
                </div>
                <div class="animal-status" style="background: var(--success-50); color: var(--success-600); padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm); font-size: var(--font-size-xs); font-weight: 500;">
                    ${animal.vacinado === 'sim' ? 'Vacinado' : 'Não vacinado'}
                </div>
            </div>
            
            <div class="animal-info">
                <div class="animal-info-item">
                    <span class="animal-info-label">Idade:</span>
                    <span>${age}</span>
                </div>
                <div class="animal-info-item">
                    <span class="animal-info-label">Peso:</span>
                    <span>${animal.peso}kg</span>
                </div>
                <div class="animal-info-item">
                    <span class="animal-info-label">Cor:</span>
                    <span>${animal.cor}</span>
                </div>
                <div class="animal-info-item">
                    <span class="animal-info-label">Proprietário:</span>
                    <span>${animal.proprietario}</span>
                </div>
                <div class="animal-info-item">
                    <span class="animal-info-label">Telefone:</span>
                    <span>${this.formatPhone(animal.telefone)}</span>
                </div>
                <div class="animal-info-item">
                    <span class="animal-info-label">Cadastrado:</span>
                    <span>${registrationDate}</span>
                </div>
            </div>
            
            ${animal.observacoes ? `
                <div class="animal-observations" style="margin-top: var(--space-4); padding: var(--space-3); background: var(--secondary-50); border-radius: var(--radius-md); border-left: 3px solid var(--primary-500);">
                    <div style="font-size: var(--font-size-xs); color: var(--secondary-600); font-weight: 500; margin-bottom: var(--space-1);">Observações:</div>
                    <div style="font-size: var(--font-size-sm); color: var(--secondary-700);">${animal.observacoes}</div>
                </div>
            ` : ''}
            
            <div class="animal-actions" style="margin-top: var(--space-4); display: flex; gap: var(--space-2);">
                <button class="btn btn-secondary" style="flex: 1; font-size: var(--font-size-xs);" onclick="consultarModule.viewAnimalDetails('${animal.id}')">
                    Ver Detalhes
                </button>
                <button class="btn btn-primary" style="flex: 1; font-size: var(--font-size-xs);" onclick="consultarModule.editAnimal('${animal.id}')">
                    Editar
                </button>
            </div>
        `;

        return card;
    },

    showNoResults(container) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: var(--space-12); color: var(--secondary-500);">
                <svg style="width: 64px; height: 64px; margin-bottom: var(--space-4); opacity: 0.5;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                </svg>
                <h3 style="font-size: var(--font-size-lg); margin-bottom: var(--space-2);">Nenhum animal encontrado</h3>
                <p>Tente ajustar os filtros de busca ou cadastre um novo animal.</p>
                <button class="btn btn-primary" style="margin-top: var(--space-4);" onclick="app.navigateTo('cadastrar')">
                    Cadastrar Animal
                </button>
            </div>
        `;
    },

    showLoading(show) {
        const resultsGrid = document.getElementById('results-grid');
        const searchBtn = document.getElementById('search-btn');
        
        if (show) {
            if (searchBtn) {
                searchBtn.disabled = true;
                searchBtn.innerHTML = '<span class="spinner"></span> Buscando...';
            }
            if (resultsGrid) {
                resultsGrid.style.opacity = '0.6';
            }
        } else {
            if (searchBtn) {
                searchBtn.disabled = false;
                searchBtn.innerHTML = 'Buscar';
            }
            if (resultsGrid) {
                resultsGrid.style.opacity = '1';
            }
        }
    },

    calculateAge(ageInYears) {
        const age = parseInt(ageInYears);
        if (age === 0) return 'Menos de 1 ano';
        if (age === 1) return '1 ano';
        return `${age} anos`;
    },

    formatPhone(phone) {
        if (!phone) return '';
        return window.utils.formatPhoneNumber(phone);
    },

    viewAnimalDetails(animalId) {
        const animal = window.app.getAnimals().find(a => a.id === animalId);
        if (!animal) return;

        // Create modal for animal details
        this.showAnimalModal(animal, 'view');
    },

    editAnimal(animalId) {
        const animal = window.app.getAnimals().find(a => a.id === animalId);
        if (!animal) return;

        // For now, show details modal with edit option
        // In a full implementation, this would open an edit form
        this.showAnimalModal(animal, 'edit');
    },

    showAnimalModal(animal, mode = 'view') {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: var(--space-4);
        `;

        // Create modal content
        const modal = document.createElement('div');
        modal.className = 'modal-content';
        modal.style.cssText = `
            background: white;
            border-radius: var(--radius-xl);
            padding: var(--space-8);
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: var(--shadow-xl);
        `;

        const registrationDate = window.app.formatDate(animal.createdAt);
        const age = this.calculateAge(animal.idade);

        modal.innerHTML = `
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); padding-bottom: var(--space-4); border-bottom: 1px solid var(--secondary-200);">
                <h2 style="font-size: var(--font-size-2xl); font-weight: 700; color: var(--secondary-900);">
                    ${animal.nome}
                </h2>
                <button class="close-modal" style="background: none; border: none; font-size: var(--font-size-xl); color: var(--secondary-500); cursor: pointer; padding: var(--space-2);">
                    ×
                </button>
            </div>
            
            <div class="modal-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-6);">
                    <div>
                        <h3 style="font-size: var(--font-size-lg); font-weight: 600; color: var(--secondary-900); margin-bottom: var(--space-3);">Informações Básicas</h3>
                        <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                            <div><strong>Espécie:</strong> ${animal.especie}</div>
                            <div><strong>Raça:</strong> ${animal.raca}</div>
                            <div><strong>Idade:</strong> ${age}</div>
                            <div><strong>Peso:</strong> ${animal.peso}kg</div>
                            <div><strong>Sexo:</strong> ${animal.sexo}</div>
                            <div><strong>Cor:</strong> ${animal.cor}</div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 style="font-size: var(--font-size-lg); font-weight: 600; color: var(--secondary-900); margin-bottom: var(--space-3);">Proprietário</h3>
                        <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                            <div><strong>Nome:</strong> ${animal.proprietario}</div>
                            <div><strong>Telefone:</strong> ${this.formatPhone(animal.telefone)}</div>
                            <div><strong>Endereço:</strong> ${animal.endereco}</div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: var(--space-6);">
                    <h3 style="font-size: var(--font-size-lg); font-weight: 600; color: var(--secondary-900); margin-bottom: var(--space-3);">Saúde</h3>
                    <div style="display: flex; gap: var(--space-4);">
                        <div><strong>Vacinado:</strong> ${animal.vacinado === 'sim' ? 'Sim' : 'Não'}</div>
                        ${animal.imc ? `<div><strong>Condição:</strong> ${animal.imc}</div>` : ''}
                        ${animal.categoria ? `<div><strong>Categoria:</strong> ${animal.categoria}</div>` : ''}
                    </div>
                </div>
                
                ${animal.observacoes ? `
                    <div style="margin-bottom: var(--space-6);">
                        <h3 style="font-size: var(--font-size-lg); font-weight: 600; color: var(--secondary-900); margin-bottom: var(--space-3);">Observações</h3>
                        <div style="background: var(--secondary-50); padding: var(--space-4); border-radius: var(--radius-md); border-left: 3px solid var(--primary-500);">
                            ${animal.observacoes}
                        </div>
                    </div>
                ` : ''}
                
                <div style="font-size: var(--font-size-sm); color: var(--secondary-500); text-align: center; padding-top: var(--space-4); border-top: 1px solid var(--secondary-200);">
                    Cadastrado em ${registrationDate}
                </div>
            </div>
            
            <div class="modal-actions" style="display: flex; gap: var(--space-4); justify-content: flex-end; margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--secondary-200);">
                <button class="btn btn-secondary close-modal">Fechar</button>
                ${mode === 'edit' ? '<button class="btn btn-primary">Editar Animal</button>' : ''}
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Close modal handlers
        const closeButtons = overlay.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(overlay);
            });
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.app && window.app.currentPage === 'consultar') {
        window.consultarModule.init();
    }
});