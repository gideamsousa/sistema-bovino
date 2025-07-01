// Classificar module
window.classificarModule = {
    classificationRules: {
        canino: {
            'Labrador': {
                porte: ['medio', 'grande'],
                pelo: ['curto'],
                cores: ['amarelo', 'chocolate', 'preto', 'dourado'],
                confidence: 0.9
            },
            'Golden Retriever': {
                porte: ['grande'],
                pelo: ['longo'],
                cores: ['dourado', 'amarelo', 'creme'],
                confidence: 0.85
            },
            'Pastor Alemão': {
                porte: ['grande'],
                pelo: ['medio'],
                cores: ['preto', 'marrom', 'cinza'],
                confidence: 0.9
            },
            'Bulldog': {
                porte: ['medio'],
                pelo: ['curto'],
                cores: ['branco', 'tigrado', 'fulvo'],
                confidence: 0.8
            },
            'Poodle': {
                porte: ['pequeno', 'medio', 'grande'],
                pelo: ['crespo'],
                cores: ['branco', 'preto', 'marrom', 'cinza'],
                confidence: 0.85
            },
            'Beagle': {
                porte: ['medio'],
                pelo: ['curto'],
                cores: ['tricolor', 'branco', 'marrom'],
                confidence: 0.8
            }
        },
        felino: {
            'Persa': {
                porte: ['medio'],
                pelo: ['longo'],
                cores: ['branco', 'preto', 'cinza', 'laranja'],
                confidence: 0.85
            },
            'Siamês': {
                porte: ['medio'],
                pelo: ['curto'],
                cores: ['creme', 'chocolate', 'seal point'],
                confidence: 0.9
            },
            'Maine Coon': {
                porte: ['grande'],
                pelo: ['longo'],
                cores: ['tabby', 'preto', 'branco', 'cinza'],
                confidence: 0.8
            },
            'British Shorthair': {
                porte: ['medio'],
                pelo: ['curto'],
                cores: ['azul', 'cinza', 'preto', 'branco'],
                confidence: 0.85
            }
        },
        bovino: {
            'Nelore': {
                porte: ['grande'],
                pelo: ['curto'],
                cores: ['branco', 'cinza', 'bege'],
                confidence: 0.9
            },
            'Angus': {
                porte: ['grande'],
                pelo: ['curto'],
                cores: ['preto', 'vermelho'],
                confidence: 0.85
            },
            'Holandês': {
                porte: ['grande'],
                pelo: ['curto'],
                cores: ['preto', 'branco', 'malhado'],
                confidence: 0.9
            }
        },
        equino: {
            'Quarto de Milha': {
                porte: ['grande'],
                pelo: ['curto'],
                cores: ['alazão', 'castanho', 'tordilho'],
                confidence: 0.8
            },
            'Árabe': {
                porte: ['medio'],
                pelo: ['curto'],
                cores: ['tordilho', 'alazão', 'castanho'],
                confidence: 0.85
            }
        }
    },

    init() {
        this.setupForm();
        this.setupResultActions();
    },

    setupForm() {
        const form = document.getElementById('classification-form');
        if (form) {
            form.addEventListener('submit', this.handleClassification.bind(this));
        }
    },

    setupResultActions() {
        const newClassificationBtn = document.getElementById('new-classification');
        const saveClassificationBtn = document.getElementById('save-classification');

        if (newClassificationBtn) {
            newClassificationBtn.addEventListener('click', this.resetClassification.bind(this));
        }

        if (saveClassificationBtn) {
            saveClassificationBtn.addEventListener('click', this.saveClassification.bind(this));
        }
    },

    handleClassification(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        // Validate form
        if (!window.utils.validateForm(form)) {
            window.app.showToast('Por favor, preencha todos os campos.', 'error');
            return;
        }

        // Get form data
        const characteristics = {
            especie: formData.get('especie'),
            porte: formData.get('porte'),
            pelo: formData.get('pelo'),
            cor: formData.get('cor').toLowerCase()
        };

        // Show loading state
        this.showLoading(true);

        // Simulate AI processing delay
        setTimeout(() => {
            const result = this.classifyBreed(characteristics);
            this.showResult(result, characteristics);
            this.showLoading(false);
        }, 1500);
    },

    classifyBreed(characteristics) {
        const { especie, porte, pelo, cor } = characteristics;
        const breeds = this.classificationRules[especie] || {};
        
        let bestMatch = null;
        let highestScore = 0;
        let matches = [];

        // Score each breed
        Object.entries(breeds).forEach(([breedName, rules]) => {
            let score = 0;
            let maxScore = 0;

            // Check porte match
            maxScore += 3;
            if (rules.porte.includes(porte)) {
                score += 3;
            }

            // Check pelo match
            maxScore += 2;
            if (rules.pelo.includes(pelo)) {
                score += 2;
            }

            // Check cor match (fuzzy matching)
            maxScore += 2;
            const colorMatch = this.matchColor(cor, rules.cores);
            score += colorMatch * 2;

            // Calculate percentage
            const percentage = (score / maxScore) * rules.confidence;

            if (percentage > 0.3) { // Minimum threshold
                matches.push({
                    breed: breedName,
                    confidence: Math.round(percentage * 100),
                    score: score,
                    maxScore: maxScore
                });
            }

            if (percentage > highestScore) {
                highestScore = percentage;
                bestMatch = {
                    breed: breedName,
                    confidence: Math.round(percentage * 100),
                    score: score,
                    maxScore: maxScore
                };
            }
        });

        // Sort matches by confidence
        matches.sort((a, b) => b.confidence - a.confidence);

        // If no good match found, suggest SRD (Sem Raça Definida)
        if (!bestMatch || bestMatch.confidence < 50) {
            bestMatch = {
                breed: 'SRD (Sem Raça Definida)',
                confidence: 75,
                score: 0,
                maxScore: 0
            };
        }

        return {
            primary: bestMatch,
            alternatives: matches.slice(0, 3).filter(m => m.breed !== bestMatch.breed),
            characteristics
        };
    },

    matchColor(inputColor, breedColors) {
        // Exact match
        if (breedColors.some(color => color.toLowerCase().includes(inputColor))) {
            return 1;
        }

        // Partial match
        const colorSynonyms = {
            'amarelo': ['dourado', 'creme', 'bege'],
            'dourado': ['amarelo', 'creme'],
            'marrom': ['chocolate', 'castanho'],
            'chocolate': ['marrom', 'castanho'],
            'cinza': ['azul', 'tordilho'],
            'azul': ['cinza'],
            'tigrado': ['listrado', 'rajado'],
            'tricolor': ['três cores', 'malhado']
        };

        for (const [synonym, alternatives] of Object.entries(colorSynonyms)) {
            if (inputColor.includes(synonym)) {
                if (breedColors.some(color => 
                    alternatives.some(alt => color.toLowerCase().includes(alt))
                )) {
                    return 0.7;
                }
            }
        }

        return 0;
    },

    showResult(result, characteristics) {
        const resultContainer = document.getElementById('classification-result');
        const confidenceElement = document.getElementById('result-confidence');
        const breedElement = document.getElementById('result-breed');
        const detailsElement = document.getElementById('result-details');

        // Show result container
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth' });

        // Update confidence
        const confidence = result.primary.confidence;
        confidenceElement.textContent = `${confidence}% de confiança`;
        confidenceElement.className = 'result-confidence';
        
        if (confidence >= 80) {
            confidenceElement.style.background = 'var(--success-50)';
            confidenceElement.style.color = 'var(--success-600)';
        } else if (confidence >= 60) {
            confidenceElement.style.background = 'var(--warning-50)';
            confidenceElement.style.color = 'var(--warning-600)';
        } else {
            confidenceElement.style.background = 'var(--error-50)';
            confidenceElement.style.color = 'var(--error-600)';
        }

        // Update breed
        breedElement.textContent = result.primary.breed;

        // Update details
        let detailsHTML = `
            <h4 style="margin-bottom: var(--space-3); color: var(--secondary-700);">Características Analisadas:</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin-bottom: var(--space-4);">
                <div><strong>Espécie:</strong> ${this.capitalizeFirst(characteristics.especie)}</div>
                <div><strong>Porte:</strong> ${this.capitalizeFirst(characteristics.porte)}</div>
                <div><strong>Pelo:</strong> ${this.capitalizeFirst(characteristics.pelo)}</div>
                <div><strong>Cor:</strong> ${this.capitalizeFirst(characteristics.cor)}</div>
            </div>
        `;

        if (result.alternatives.length > 0) {
            detailsHTML += `
                <h4 style="margin-bottom: var(--space-3); color: var(--secondary-700);">Outras Possibilidades:</h4>
                <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            `;
            
            result.alternatives.forEach(alt => {
                detailsHTML += `
                    <div style="display: flex; justify-content: space-between; padding: var(--space-2); background: var(--secondary-50); border-radius: var(--radius-sm);">
                        <span>${alt.breed}</span>
                        <span style="color: var(--secondary-600);">${alt.confidence}%</span>
                    </div>
                `;
            });
            
            detailsHTML += '</div>';
        }

        detailsElement.innerHTML = detailsHTML;

        // Store result for saving
        this.currentResult = result;
    },

    showLoading(show) {
        const form = document.getElementById('classification-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (show) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Classificando...';
            form.classList.add('loading');
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Classificar Raça';
            form.classList.remove('loading');
        }
    },

    resetClassification() {
        const form = document.getElementById('classification-form');
        const resultContainer = document.getElementById('classification-result');
        
        window.utils.clearForm(form);
        resultContainer.style.display = 'none';
        this.currentResult = null;
    },

    saveClassification() {
        if (!this.currentResult) {
            window.app.showToast('Nenhuma classificação para salvar.', 'error');
            return;
        }

        try {
            const classificationData = {
                breed: this.currentResult.primary.breed,
                confidence: this.currentResult.primary.confidence,
                characteristics: this.currentResult.characteristics,
                alternatives: this.currentResult.alternatives
            };

            window.app.saveClassification(classificationData);
            window.app.showToast('Classificação salva com sucesso!', 'success');
            
            // Reset form after saving
            setTimeout(() => {
                this.resetClassification();
            }, 1000);

        } catch (error) {
            console.error('Erro ao salvar classificação:', error);
            window.app.showToast('Erro ao salvar classificação.', 'error');
        }
    },

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.app && window.app.currentPage === 'classificar') {
        window.classificarModule.init();
    }
});