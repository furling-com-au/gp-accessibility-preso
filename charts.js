// Charts Module - Handles all Chart.js visualizations

// Wait for Chart.js to be available
function waitForChart(callback) {
    if (typeof Chart !== 'undefined') {
        callback();
    } else {
        setTimeout(() => waitForChart(callback), 100);
    }
}

// Initialize all charts
function initializeCharts() {
    waitForChart(() => {
        console.log('Initializing charts...');

        // DPA Counter Animation
        animateCounter('dpa-counter', 0, 85, 2000, '%');

        // Initialize specific charts
        createDPAChart();
        createBinaryGradientCharts();
        // Don't create decay chart here - it will be created by updateDecayChart()
        createComplexityChart();
        createValidationChart();
        createSensitivityChart();
        createHeatMaps();
        createGanttChart();
        createBudgetChart();
    });
}

// Counter animation
function animateCounter(elementId, start, end, duration, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = start + (end - start) * easeOutQuart(progress);
        element.textContent = Math.round(current) + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    update();
}

function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

// DPA Pie Chart
function createDPAChart() {
    const canvas = document.getElementById('dpa-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['DPA Status', 'Non-DPA'],
            datasets: [{
                data: [85, 15],
                backgroundColor: ['#EF4444', '#10B981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Binary vs Gradient Charts
function createBinaryGradientCharts() {
    const binaryCanvas = document.getElementById('binary-chart');
    const gradientCanvas = document.getElementById('gradient-chart');

    if (binaryCanvas) {
        const binaryCtx = binaryCanvas.getContext('2d');
        new Chart(binaryCtx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'DPA',
                    data: generateRandomPoints(50, -0.25, 0.25),
                    backgroundColor: '#EF4444',
                    pointRadius: 3
                }, {
                    label: 'Non-DPA',
                    data: generateRandomPoints(10, -0.25, 0.25),
                    backgroundColor: '#10B981',
                    pointRadius: 3
                }]
            },
            options: getScatterOptions()
        });
    }

    if (gradientCanvas) {
        const gradientCtx = gradientCanvas.getContext('2d');
        const points = generateRandomPoints(60, -0.25, 0.25);
        new Chart(gradientCtx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Accessibility',
                    data: points,
                    backgroundColor: points.map(() => {
                        const val = Math.random();
                        return val > 0.7 ? '#10B981' : val > 0.4 ? '#F59E0B' : '#EF4444';
                    }),
                    pointRadius: 4
                }]
            },
            options: getScatterOptions()
        });
    }
}

// Decay Function Chart
function createDecayChart() {
    const canvas = document.getElementById('decay-chart');
    if (!canvas) return;

    // Check if chart already exists
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    const distances = Array.from({length: 121}, (_, i) => i);
    const decayValues = distances.map(d => Math.exp(-Math.pow(d/60, 2)));

    window.decayChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: distances,
            datasets: [{
                label: 'Distance Decay',
                data: decayValues,
                borderColor: '#0066CC',
                backgroundColor: 'rgba(0, 102, 204, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Distance (minutes)' } },
                y: { title: { display: true, text: 'Weight' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// Complexity Chart
function createComplexityChart(alpha = 0.15) {
    const canvas = document.getElementById('complexity-chart');
    if (!canvas) return;

    const routes = [
        { name: 'Rural Route', base: 20, intersections: 0.2, color: '#10B981' },
        { name: 'Urban Route', base: 20, intersections: 1.5, color: '#EF4444' }
    ];

    // Check if chart already exists
    if (window.complexityChart && Chart.getChart(canvas)) {
        // Update existing chart data
        const newData = routes.map(route => ({
            x: route.base,
            y: route.base * (1 + alpha * route.intersections),
            r: 10
        }));

        window.complexityChart.data.datasets[0].data = newData;
        window.complexityChart.options.plugins.tooltip.callbacks.label = function(context) {
            const route = routes[context.dataIndex];
            const adjustedTime = context.parsed.y;
            return [
                `${route.name}`,
                `Base time: ${route.base} min`,
                `Adjusted: ${adjustedTime.toFixed(1)} min`,
                `Increase: ${((adjustedTime - route.base) / route.base * 100).toFixed(1)}%`
            ];
        };
        window.complexityChart.update('active'); // Animate the update
        return;
    }

    // Create new chart only if it doesn't exist
    const ctx = canvas.getContext('2d');
    const data = routes.map(route => ({
        x: route.base,
        y: route.base * (1 + alpha * route.intersections),
        r: 10
    }));

    window.complexityChart = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Travel Time Adjustment',
                data: data,
                backgroundColor: routes.map(r => r.color)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 400,
                easing: 'easeInOutQuart'
            },
            scales: {
                x: {
                    title: { display: true, text: 'Base Time (minutes)' },
                    min: 15,
                    max: 25
                },
                y: {
                    title: { display: true, text: 'Adjusted Time (minutes)' },
                    min: 15,
                    max: 30
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        generateLabels: function() {
                            return [
                                {
                                    text: 'Rural (0.2 intersections/min)',
                                    fillStyle: '#10B981',
                                    strokeStyle: '#10B981',
                                    lineWidth: 0
                                },
                                {
                                    text: 'Urban (1.5 intersections/min)',
                                    fillStyle: '#EF4444',
                                    strokeStyle: '#EF4444',
                                    lineWidth: 0
                                }
                            ];
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const route = routes[context.dataIndex];
                            return [
                                `${route.name}`,
                                `Base time: ${route.base} min`,
                                `Adjusted: ${context.parsed.y.toFixed(1)} min`,
                                `Increase: ${((context.parsed.y - route.base) / route.base * 100).toFixed(1)}%`
                            ];
                        }
                    }
                }
            }
        }
    });
}

// Validation Chart
function createValidationChart() {
    const canvas = document.getElementById('validation-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Generate synthetic correlation data
    const correlationData = Array.from({length: 50}, () => {
        const accessibility = 0.01 + Math.random() * 0.035;
        return {
            x: accessibility,
            y: 15 - (accessibility * 300) + (Math.random() - 0.5) * 5
        };
    });

    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'E2SFCA vs TNAA',
                data: correlationData,
                backgroundColor: 'rgba(0, 102, 204, 0.6)',
                borderColor: '#0066CC'
            }, {
                label: 'Regression Line',
                type: 'line',
                data: [
                    { x: 0.01, y: 12 },
                    { x: 0.045, y: 3 }
                ],
                borderColor: '#EF4444',
                backgroundColor: 'transparent',
                pointRadius: 0,
                borderWidth: 2,
                borderDash: [5, 5]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'E2SFCA Accessibility Score' } },
                y: { title: { display: true, text: 'TNAA (days)' } }
            }
        }
    });
}

// Sensitivity Chart
function createSensitivityChart() {
    const canvas = document.getElementById('sensitivity-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const parameters = [
        'Urban complexity α',
        'Catchment threshold',
        'Decay parameter σ',
        'Buffer data quality'
    ];

    const impacts = [-0.15, 0.12, -0.08, 0.06];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: parameters,
            datasets: [{
                label: 'Parameter Impact',
                data: impacts,
                backgroundColor: impacts.map(i => i < 0 ? '#EF4444' : '#0066CC'),
                borderColor: impacts.map(i => i < 0 ? '#DC2626' : '#0052A3'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    title: { display: true, text: 'Impact on Accessibility Score' },
                    grid: { color: '#E5E7EB' }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// Heat Maps
function createHeatMaps() {
    const sites = ['heatmap1', 'heatmap2', 'heatmap3'];

    sites.forEach((siteId) => {
        const canvas = document.getElementById(siteId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const gridSize = 10;

        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const value = Math.random() * 0.035 + 0.01;
                const color = value > 0.030 ? '#10B981' :
                             value > 0.020 ? '#F59E0B' : '#EF4444';

                ctx.fillStyle = color;
                ctx.fillRect(i * 20, j * 20, 18, 18);
            }
        }
    });
}

// Gantt Chart
function createGanttChart() {
    const canvas = document.getElementById('gantt-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Phase 1', 'Phase 2', 'Phase 3'],
            datasets: [{
                label: 'Duration (months)',
                data: [6, 12, 12],
                backgroundColor: ['#0066CC', '#F59E0B', '#10B981'],
                borderColor: ['#0052A3', '#D97706', '#059669'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { title: { display: true, text: 'Duration (months)' } }
            }
        }
    });
}

// Budget Chart
function createBudgetChart() {
    const canvas = document.getElementById('budget-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Personnel', 'Data Collection', 'Computing', 'Dissemination'],
            datasets: [{
                data: [168, 56, 28, 28], // 60%, 20%, 10%, 10% of $280K
                backgroundColor: ['#0066CC', '#10B981', '#F59E0B', '#EF4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const percentage = Math.round((context.parsed / 280) * 100);
                            return `${context.label}: $${context.parsed}K (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Helper functions
function generateRandomPoints(count, minRange, maxRange) {
    return Array.from({length: count}, () => ({
        x: minRange + Math.random() * (maxRange - minRange),
        y: minRange + Math.random() * (maxRange - minRange)
    }));
}

function getScatterOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { display: false },
            y: { display: false }
        }
    };
}