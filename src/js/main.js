// Main application controller
class BoviTrackApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.bovinos = JSON.parse(localStorage.getItem('bovinos')) || this.generateSampleData();
        this.activities = JSON.parse(localStorage.getItem('activities')) || [];
        this.alerts = JSON.parse(localStorage.getItem('alerts')) || this.generateSampleAlerts();
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupSearch();
        this.setupQuickActions();
        this.saveData();
    }

    generateSampleData() {
        const racas = ['Nelore', 'Angus', 'Brahman', 'Gir', 'Holandês', 'Jersey', 'Limousin', 'Charolês'];
        const sexos = ['Macho', 'Fêmea'];
        const status = ['Saudável', 'Em Tratamento', 'Vacinado', 'Prenha'];
        
        const bovinos = [];
        
        for (let i = 1; i <= 150; i++) {
            const raca = racas[Math.floor(Math.random() * racas.length)];
            const sexo = sexos[Math.floor(Math.random() * sexos.length)];
            const idade = Math.floor(Math.random() * 10) + 1;
            const peso = Math.floor(Math.random() * 400) + 300;
            
            bovinos.push({
                id: i.toString().padStart(4, '0'),
                brinco: `BR${i.toString().padStart(4, '0')}`,
                nome: `Bovino ${i}`,
                raca: raca,
                sexo: sexo,
                idade: idade,
                peso: peso,
                status: status[Math.floor(Math.random() * status.length)],
                dataUltimaVacinacao: this.getRandomDate(30),
                dataNascimento: this.getRandomDate(idade * 365),
                proprietario: 'Fazenda São João',
                localizacao: `Pasto ${Math.floor(Math.random() * 10) + 1}`,
                observacoes: Math.random() > 0.7 ? 'Animal com bom desenvolvimento' : '',
                createdAt: this.getRandomDate(365)
            });
        }
        
        return bovinos;
    }

    generateSampleAlerts() {
        return [
            {
                id: '1',
                type: 'warning',
                title: 'Vacinação Pendente',
                description: '15 bovinos precisam de vacinação contra febre aftosa nos próximos 7 dias.',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                type: 'info',
                title: 'Pesagem Programada',
                description: 'Pesagem mensal agendada para o próximo sábado às 08:00.',
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                type: 'error',
                title: 'Animal em Tratamento',
                description: 'Bovino BR0045 apresenta sintomas e está em observação veterinária.',
                createdAt: new Date().toISOString()
            }
        ];
    }

    getRandomDate(daysAgo) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
        return date.toISOString();
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetPage = item.dataset.page;
                this.navigateTo(targetPage);
            });
        });
    }

    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.performSearch(e.target.value);
            }, 300));
        }
    }

    setupQuickActions() {
        const actionBtns = document.querySelectorAll('.action-btn');
        
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
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

        // Update page title
        const pageTitle = document.querySelector('.page-title');
        const pageSubtitle = document.querySelector('.page-subtitle');
        
        const titles = {
            dashboard: { title: 'Dashboard', subtitle: 'Visão geral do seu rebanho' },
            rebanho: { title: 'Rebanho', subtitle: 'Gestão completa dos bovinos' },
            cadastrar: { title: 'Cadastrar Bovino', subtitle: 'Adicionar novo animal ao rebanho' },
            saude: { title: 'Controle de Saúde', subtitle: 'Monitoramento veterinário' },
            reproducao: { title: 'Reprodução', subtitle: 'Controle reprodutivo do rebanho' },
            relatorios: { title: 'Relatórios', subtitle: 'Análises e estatísticas' }
        };

        if (titles[page]) {
            pageTitle.textContent = titles[page].title;
            pageSubtitle.textContent = titles[page].subtitle;
        }

        this.currentPage = page;

        // Initialize page-specific functionality
        if (page === 'dashboard') {
            this.initializeDashboard();
        }
    }

    initializeDashboard() {
        // This will be called from dashboard.js
        if (window.dashboardModule) {
            window.dashboardModule.init();
        }
    }

    performSearch(query) {
        if (!query.trim()) return;
        
        const results = this.bovinos.filter(bovino => 
            bovino.brinco.toLowerCase().includes(query.toLowerCase()) ||
            bovino.nome.toLowerCase().includes(query.toLowerCase()) ||
            bovino.raca.toLowerCase().includes(query.toLowerCase())
        );

        console.log('Search results:', results);
        // Implement search results display
    }

    handleQuickAction(action) {
        switch (action) {
            case 'cadastrar':
                this.navigateTo('cadastrar');
                break;
            case 'vacinacao':
                this.showModal('Registrar Vacinação', 'Funcionalidade em desenvolvimento...');
                break;
            case 'pesagem':
                this.showModal('Registrar Pesagem', 'Funcionalidade em desenvolvimento...');
                break;
            case 'relatorio':
                this.navigateTo('relatorios');
                break;
        }
    }

    showModal(title, content) {
        // Simple modal implementation
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
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
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 1rem;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                text-align: center;
            ">
                <h3 style="margin-bottom: 1rem; color: var(--secondary-900);">${title}</h3>
                <p style="margin-bottom: 2rem; color: var(--secondary-600);">${content}</p>
                <button onclick="this.closest('.modal-overlay').remove()" style="
                    background: var(--primary-500);
                    color: white;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                ">Fechar</button>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Data management methods
    getBovinos() {
        return this.bovinos;
    }

    getActivities() {
        return this.activities;
    }

    getAlerts() {
        return this.alerts;
    }

    addActivity(activity) {
        this.activities.unshift({
            id: Date.now().toString(),
            ...activity,
            createdAt: new Date().toISOString()
        });
        this.saveData();
    }

    saveData() {
        localStorage.setItem('bovinos', JSON.stringify(this.bovinos));
        localStorage.setItem('activities', JSON.stringify(this.activities));
        localStorage.setItem('alerts', JSON.stringify(this.alerts));
    }

    // Statistics methods
    getStats() {
        const total = this.bovinos.length;
        const saudaveis = this.bovinos.filter(b => b.status === 'Saudável').length;
        const reproducao = this.bovinos.filter(b => b.status === 'Prenha').length;
        const pesoMedio = Math.round(this.bovinos.reduce((sum, b) => sum + b.peso, 0) / total);

        return {
            total,
            saudaveis,
            reproducao,
            pesoMedio
        };
    }

    getBreedDistribution() {
        const distribution = {};
        this.bovinos.forEach(bovino => {
            distribution[bovino.raca] = (distribution[bovino.raca] || 0) + 1;
        });
        return distribution;
    }

    getGrowthData() {
        // Generate sample growth data for the last 6 months
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
        const data = months.map((month, index) => ({
            month,
            count: Math.floor(Math.random() * 20) + 120 + (index * 5)
        }));
        return data;
    }

    // Utility methods
    debounce(func, wait) {
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
const app = new BoviTrackApp();

// Make app globally available
window.app = app;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (app.currentPage === 'dashboard') {
        app.initializeDashboard();
    }
});