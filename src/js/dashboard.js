// Dashboard module
window.dashboardModule = {
    charts: {},
    
    init() {
        this.updateStats();
        this.initializeCharts();
        this.loadRecentActivities();
        this.loadAlerts();
        this.setupChartControls();
    },

    updateStats() {
        const stats = window.app.getStats();
        
        // Animate numbers
        this.animateNumber('total-bovinos', stats.total);
        this.animateNumber('bovinos-saudaveis', stats.saudaveis);
        this.animateNumber('reproducao-ativa', stats.reproducao);
        this.animateNumber('peso-medio', stats.pesoMedio);
    },

    animateNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const duration = 1500;
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
    },

    initializeCharts() {
        this.initGrowthChart();
        this.initBreedChart();
    },

    initGrowthChart() {
        const ctx = document.getElementById('growth-chart');
        if (!ctx) return;

        const growthData = window.app.getGrowthData();
        
        this.charts.growth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: growthData.map(d => d.month),
                datasets: [{
                    label: 'Número de Bovinos',
                    data: growthData.map(d => d.count),
                    borderColor: 'rgb(20, 184, 166)',
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(20, 184, 166)',
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        border: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        border: {
                            display: false
                        },
                        beginAtZero: false
                    }
                },
                elements: {
                    point: {
                        hoverBackgroundColor: 'rgb(20, 184, 166)'
                    }
                }
            }
        });
    },

    initBreedChart() {
        const ctx = document.getElementById('breed-chart');
        if (!ctx) return;

        const breedData = window.app.getBreedDistribution();
        const labels = Object.keys(breedData);
        const data = Object.values(breedData);
        
        const colors = [
            'rgb(20, 184, 166)',
            'rgb(59, 130, 246)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(139, 92, 246)',
            'rgb(34, 197, 94)',
            'rgb(236, 72, 153)',
            'rgb(251, 146, 60)'
        ];

        this.charts.breed = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    },

    loadRecentActivities() {
        const activitiesList = document.getElementById('activity-list');
        if (!activitiesList) return;

        // Generate sample activities
        const sampleActivities = [
            {
                type: 'vaccination',
                title: 'Vacinação realizada',
                description: 'Bovino BR0123 - Vacina contra febre aftosa',
                time: '2 horas atrás',
                icon: 'syringe'
            },
            {
                type: 'weight',
                title: 'Pesagem registrada',
                description: 'Bovino BR0087 - 485kg (+15kg)',
                time: '4 horas atrás',
                icon: 'scale'
            },
            {
                type: 'birth',
                title: 'Nascimento registrado',
                description: 'Nova cria da vaca BR0045',
                time: '1 dia atrás',
                icon: 'heart'
            },
            {
                type: 'treatment',
                title: 'Tratamento iniciado',
                description: 'Bovino BR0156 - Antibiótico prescrito',
                time: '2 dias atrás',
                icon: 'medical'
            }
        ];

        const iconMap = {
            syringe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>`,
            scale: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3v18m-4-4h8"/>
            </svg>`,
            heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>`,
            medical: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7 7-7z"/>
            </svg>`
        };

        const colorMap = {
            vaccination: 'var(--success-100)',
            weight: 'var(--info-100)',
            birth: 'var(--warning-100)',
            treatment: 'var(--error-100)'
        };

        const textColorMap = {
            vaccination: 'var(--success-600)',
            weight: 'var(--info-600)',
            birth: 'var(--warning-600)',
            treatment: 'var(--error-600)'
        };

        activitiesList.innerHTML = sampleActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${colorMap[activity.type]}; color: ${textColorMap[activity.type]};">
                    ${iconMap[activity.icon]}
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description" style="color: var(--secondary-600); font-size: var(--font-size-xs); margin-bottom: var(--space-1);">${activity.description}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    },

    loadAlerts() {
        const alertsList = document.getElementById('alerts-list');
        if (!alertsList) return;

        const alerts = window.app.getAlerts();

        const iconMap = {
            warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>`,
            error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>`,
            info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>`
        };

        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">
                    ${iconMap[alert.type]}
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                </div>
            </div>
        `).join('');
    },

    setupChartControls() {
        const chartBtns = document.querySelectorAll('.chart-btn');
        
        chartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                chartBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Update chart data based on selection
                this.updateGrowthChart(btn.textContent);
            });
        });
    },

    updateGrowthChart(period) {
        if (!this.charts.growth) return;

        let newData;
        
        switch (period) {
            case '6M':
                newData = window.app.getGrowthData();
                break;
            case '1A':
                newData = this.generateYearlyData();
                break;
            case '2A':
                newData = this.generateTwoYearData();
                break;
            default:
                newData = window.app.getGrowthData();
        }

        this.charts.growth.data.labels = newData.map(d => d.month);
        this.charts.growth.data.datasets[0].data = newData.map(d => d.count);
        this.charts.growth.update('active');
    },

    generateYearlyData() {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return months.map((month, index) => ({
            month,
            count: Math.floor(Math.random() * 30) + 100 + (index * 3)
        }));
    },

    generateTwoYearData() {
        const quarters = ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'];
        return quarters.map((quarter, index) => ({
            month: quarter,
            count: Math.floor(Math.random() * 40) + 80 + (index * 8)
        }));
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.app && window.app.currentPage === 'dashboard') {
        window.dashboardModule.init();
    }
});