// Main JavaScript Module - Handles presentation initialization and interactions

// Configure MathJax
window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']]
    }
};

// Wait for DOM and libraries to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing presentation...');

    // Initialize Reveal.js first
    initializeReveal();

    // Initialize other components with delay to ensure libraries are loaded
    setTimeout(() => {
        initializeCharts();
        initializeMaps();
        initializeInteractivity();
        initializeVisualizations();
    }, 1000);

    // Try to render equations after a longer delay for MathJax
    setTimeout(() => {
        updateEquations();
    }, 2000);
});

// Initialize Reveal.js
function initializeReveal() {
    if (typeof Reveal === 'undefined') {
        console.warn('Reveal.js not loaded yet, retrying...');
        setTimeout(initializeReveal, 100);
        return;
    }

    Reveal.initialize({
        hash: true,
        transition: 'slide',
        transitionSpeed: 'default',
        backgroundTransition: 'fade',
        controls: true,
        progress: true,
        keyboard: true,
        touch: true,
        loop: false,
        fragments: true
    });

    // Update slide counter
    Reveal.on('slidechanged', event => {
        const counter = document.getElementById('slide-counter');
        if (counter) {
            counter.textContent = `${event.indexh + 1} / ${Reveal.getTotalSlides()}`;
        }
    });

    console.log('Reveal.js initialized');
}

// Initialize Maps (placeholder for now)
function initializeMaps() {
    console.log('Initializing maps...');
    // Map initialization code would go here
}

// Initialize Interactivity
function initializeInteractivity() {
    console.log('Initializing interactivity...');

    // Parameter sliders
    const sigmaSlider = document.getElementById('sigma-slider');
    const alphaSlider = document.getElementById('alpha-slider');

    if (sigmaSlider) {
        sigmaSlider.addEventListener('input', function() {
            const valueDisplay = document.getElementById('sigma-value');
            if (valueDisplay) {
                valueDisplay.textContent = this.value;
            }
            updateDecayChart();
            updateInteractiveExample(); // Update the example calculations
        });
    }

    if (alphaSlider) {
        alphaSlider.addEventListener('input', function() {
            const valueDisplay = document.getElementById('alpha-value');
            if (valueDisplay) {
                valueDisplay.textContent = parseFloat(this.value).toFixed(2);
            }
            updateComplexityCalculation();
        });
        // Initialize the complexity chart with default value
        setTimeout(() => updateComplexityCalculation(), 100);
    }

    // Calculator inputs
    const calcInputs = ['calc-travel-time', 'calc-intersections', 'calc-appointments', 'calc-population'];
    calcInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateCalculator);
            input.addEventListener('change', updateCalculator);
        }
    });

    // Initialize calculator on first load
    updateCalculator();

    // Initialize equations with MathJax
    if (typeof MathJax !== 'undefined') {
        updateEquations();
    }
}

// Initialize Additional Visualizations
function initializeVisualizations() {
    console.log('Initializing additional visualizations...');

    // Initialize decay chart on slide 5
    updateDecayChart();

    // Initialize E2SFCA diagrams
    createE2SFCADiagrams();

    // Initialize interactive example
    updateInteractiveExample();

    // Edge effects visualization
    const edgeCanvas = document.getElementById('edge-effects-chart');
    if (edgeCanvas) {
        const ctx = edgeCanvas.getContext('2d');

        // Draw nested boundaries
        ctx.strokeStyle = '#0066CC';
        ctx.lineWidth = 3;
        ctx.strokeRect(150, 100, 200, 150); // Core area

        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.strokeRect(100, 50, 300, 200); // Buffer zone

        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1;
        ctx.strokeRect(50, 25, 400, 250); // Computational area

        // Add labels
        ctx.fillStyle = '#374151';
        ctx.font = '14px Source Sans Pro';
        ctx.fillText('Core Study Area', 160, 130);
        ctx.fillText('Buffer Zone', 110, 80);
        ctx.fillText('Computational Area', 60, 50);
    }

    // Pipeline visualization with D3
    if (typeof d3 !== 'undefined') {
        createPipelineVisualization();
    }
}

// Update decay chart based on parameters
function updateDecayChart() {
    const canvas = document.getElementById('decay-chart');
    if (!canvas || !window.Chart) return;

    const d0 = parseFloat(document.getElementById('d0-slider')?.value) || 60;
    const sigma = parseFloat(document.getElementById('sigma-slider')?.value) || 60;

    console.log('Updating decay chart with d0:', d0, 'sigma:', sigma);

    // Generate decay function data - extend to 120 to show full curve
    const distances = [];
    const weights = [];
    for (let d = 0; d <= 120; d += 2) {
        distances.push(d);
        weights.push(Math.exp(-Math.pow(d / sigma, 2)));
    }

    // Check if chart already exists
    if (window.decayChart && Chart.getChart(canvas)) {
        // Update existing chart data
        window.decayChart.data.labels = distances;
        window.decayChart.data.datasets[0].data = weights;
        window.decayChart.update('active'); // Animate the update
        return;
    }

    // Create new chart only if it doesn't exist
    const ctx = canvas.getContext('2d');

    window.decayChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: distances,
            datasets: [{
                label: 'Distance Decay Weight',
                data: weights,
                borderColor: '#0066CC',
                backgroundColor: 'rgba(0, 102, 204, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 4,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 400,
                easing: 'easeInOutQuart'
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Gaussian Decay Function',
                    font: {
                        size: 12
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Distance (minutes)',
                        font: {
                            size: 10
                        }
                    },
                    ticks: {
                        font: {
                            size: 9
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Weight',
                        font: {
                            size: 10
                        }
                    },
                    min: 0,
                    max: 1,
                    ticks: {
                        font: {
                            size: 9
                        }
                    }
                }
            }
        }
    });
}

// Update complexity calculation
function updateComplexityCalculation() {
    const alphaSlider = document.getElementById('alpha-slider');
    if (alphaSlider) {
        const alpha = parseFloat(alphaSlider.value);
        // Update the chart with the new alpha value
        if (typeof createComplexityChart === 'function') {
            createComplexityChart(alpha);
        }
    }
}

// Update calculator
function updateCalculator() {
    const travelTime = parseFloat(document.getElementById('calc-travel-time')?.value) || 15;
    const intersections = parseFloat(document.getElementById('calc-intersections')?.value) || 1.67;
    const appointments = parseInt(document.getElementById('calc-appointments')?.value) || 40;
    const population = parseInt(document.getElementById('calc-population')?.value) || 2988;
    const alpha = 0.15;
    const sigma = 60;

    // Calculations
    const adjustedTime = travelTime * (1 + alpha * intersections);
    const weight = Math.exp(-Math.pow(adjustedTime / sigma, 2));
    const ratio = appointments / population;
    const accessibility = ratio * weight;

    // Update display
    const adjTimeEl = document.getElementById('result-adj-time');
    const weightEl = document.getElementById('result-weight');
    const ratioEl = document.getElementById('result-ratio');
    const accessEl = document.getElementById('result-accessibility');

    if (adjTimeEl) adjTimeEl.textContent = adjustedTime.toFixed(2);
    if (weightEl) weightEl.textContent = weight.toFixed(3);
    if (ratioEl) ratioEl.textContent = ratio.toFixed(4);
    if (accessEl) accessEl.textContent = accessibility.toFixed(4);
}

// Update equations with MathJax
function updateEquations() {
    // Only try once since equations are already in HTML
    if (window.MathJax && window.MathJax.typesetPromise) {
        MathJax.typesetPromise().then(() => {
            console.log('MathJax processing complete');
        }).catch((err) => {
            console.error('MathJax error:', err);
        });
    }
    // Don't retry - equations are rendering fine from HTML
}

// Create E2SFCA visual diagrams
function createE2SFCADiagrams() {
    // Step 1 Diagram - Clinic perspective
    const step1 = document.getElementById('step1-diagram');
    if (step1) {
        step1.innerHTML = `
            <circle cx="90" cy="40" r="12" fill="#0066CC" stroke="#004499" stroke-width="2"/>
            <text x="90" y="44" text-anchor="middle" fill="white" font-size="10">GP</text>

            <!-- Population points flowing in -->
            <circle cx="35" cy="25" r="6" fill="#F59E0B"/>
            <circle cx="35" cy="55" r="6" fill="#F59E0B"/>
            <circle cx="145" cy="40" r="6" fill="#F59E0B"/>

            <!-- Arrows -->
            <path d="M 42 27 L 78 36" stroke="#F59E0B" stroke-width="1.5" marker-end="url(#arrowhead)"/>
            <path d="M 42 53 L 78 44" stroke="#F59E0B" stroke-width="1.5" marker-end="url(#arrowhead)"/>
            <path d="M 138 40 L 102 40" stroke="#F59E0B" stroke-width="1.5" marker-end="url(#arrowhead)"/>

            <!-- Arrow marker -->
            <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#F59E0B"/>
                </marker>
            </defs>

            <text x="90" y="70" text-anchor="middle" font-size="9" fill="#666">Population demand</text>
        `;
    }

    // Step 2 Diagram - Population perspective
    const step2 = document.getElementById('step2-diagram');
    if (step2) {
        step2.innerHTML = `
            <circle cx="90" cy="40" r="10" fill="#10B981" stroke="#059669" stroke-width="2"/>
            <text x="90" y="43" text-anchor="middle" fill="white" font-size="9">Pop</text>

            <!-- GP clinics -->
            <rect x="25" y="15" width="16" height="16" fill="#0066CC" rx="2"/>
            <rect x="135" y="25" width="16" height="16" fill="#0066CC" rx="2"/>
            <rect x="120" y="50" width="16" height="16" fill="#0066CC" rx="2"/>

            <!-- Arrows flowing out -->
            <path d="M 41 23 L 80 36" stroke="#0066CC" stroke-width="1.5" marker-end="url(#arrowhead2)"/>
            <path d="M 135 33 L 100 38" stroke="#0066CC" stroke-width="1.5" marker-end="url(#arrowhead2)"/>
            <path d="M 120 54 L 98 45" stroke="#0066CC" stroke-width="1.5" marker-end="url(#arrowhead2)"/>

            <!-- Arrow marker -->
            <defs>
                <marker id="arrowhead2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#0066CC"/>
                </marker>
            </defs>

            <text x="90" y="75" text-anchor="middle" font-size="9" fill="#666">GP supply ratios</text>
        `;
    }
}

// Update interactive example based on sigma
function updateInteractiveExample() {
    const sigma = parseFloat(document.getElementById('sigma-slider')?.value) || 60;

    // Fixed distances and appointments
    const distA = 15;
    const distB = 45;
    const apptsA = 40;
    const apptsB = 25;
    const population = 2988;

    // Calculate weights
    const weightA = Math.exp(-Math.pow(distA / sigma, 2));
    const weightB = Math.exp(-Math.pow(distB / sigma, 2));

    // Calculate supply ratios (simplified - assuming equal population competition)
    const ratioA = apptsA / population;
    const ratioB = apptsB / population;

    // Calculate accessibility score
    const accessScoreWeekly = (ratioA * weightA) + (ratioB * weightB);
    const accessScoreYearly = accessScoreWeekly * 52;

    // Determine classification
    let classification, color, message;
    if (accessScoreYearly >= 1.0) {
        classification = "ADEQUATE ACCESS";
        color = "#10B981";
        message = "";
    } else if (accessScoreYearly >= 0.5) {
        classification = "POOR ACCESS";
        color = "#F59E0B";
        message = "Below adequate threshold of 1.0";
    } else {
        classification = "GP DESERT";
        color = "#EF4444";
        message = "Critical shortage - less than 0.5";
    }

    // Update display elements
    const elements = {
        'clinic-a-weight': weightA.toFixed(2),
        'clinic-b-weight': weightB.toFixed(2),
        'clinic-a-ratio': ratioA.toFixed(4),
        'clinic-b-ratio': ratioB.toFixed(4),
        'access-score-weekly': accessScoreWeekly.toFixed(4),
        'access-score-yearly': accessScoreYearly.toFixed(2),
        'sigma-value': sigma
    };

    for (const [id, value] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    // Update classification result
    const classificationEl = document.getElementById('classification-result');
    if (classificationEl) {
        classificationEl.innerHTML = `
            <strong style="color: ${color};">Classification: ${classification}</strong>
            <div style="font-size: 0.9em;">${message}</div>
        `;
    }
}

// Create pipeline visualization with D3
function createPipelineVisualization() {
    const svg = d3.select('#pipeline-chart');
    if (!svg.node()) return;

    const width = 700;
    const height = 400;

    svg.attr('width', width).attr('height', height);

    // Pipeline nodes
    const nodes = [
        { id: 'healthdirect', x: 100, y: 100, label: 'HealthDirect API' },
        { id: 'platforms', x: 300, y: 100, label: 'Booking Platforms' },
        { id: 'phone', x: 500, y: 100, label: 'Phone Audits' },
        { id: 'processing', x: 300, y: 200, label: 'Data Processing' },
        { id: 'validation', x: 300, y: 300, label: 'Quality Validation' }
    ];

    // Draw connections
    const links = [
        { source: 'healthdirect', target: 'processing' },
        { source: 'platforms', target: 'processing' },
        { source: 'phone', target: 'processing' },
        { source: 'processing', target: 'validation' }
    ];

    // Add links
    svg.selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('x1', d => nodes.find(n => n.id === d.source).x)
        .attr('y1', d => nodes.find(n => n.id === d.source).y)
        .attr('x2', d => nodes.find(n => n.id === d.target).x)
        .attr('y2', d => nodes.find(n => n.id === d.target).y)
        .attr('stroke', '#0066CC')
        .attr('stroke-width', 2);

    // Add nodes
    svg.selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 20)
        .attr('fill', '#0066CC');

    // Add labels
    svg.selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .attr('x', d => d.x)
        .attr('y', d => d.y + 35)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'Source Sans Pro')
        .attr('font-size', '12px')
        .attr('fill', '#374151')
        .text(d => d.label);
}

// Animation for transformation
window.animateTransformation = function() {
    console.log('Transformation animation triggered');
    // Animation logic would go here
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === '?') {
        alert('Keyboard Shortcuts:\n' +
             '→ / Space: Next slide\n' +
             '← / Shift+Space: Previous slide\n' +
             '↑: Previous slide\n' +
             '↓: Next slide\n' +
             'F: Fullscreen\n' +
             'ESC: Exit fullscreen');
    }
});

// Print-friendly mode
window.addEventListener('beforeprint', function() {
    document.body.classList.add('print-mode');
});

window.addEventListener('afterprint', function() {
    document.body.classList.remove('print-mode');
});