import { GAME_CONFIG, GRAPH_CONFIG, PLAYER_COLORS } from './constants.js';
import { getGameState } from './state.js';

export function toggleGraph() {
    const container = document.getElementById("graphContainer");
    const icon = document.querySelector(".toggle-icon");
    const isVisible = container.style.display !== "none";

    if (isVisible) {
        container.style.display = "none";
        icon.classList.remove("expanded");
    } else {
        container.style.display = "block";
        icon.classList.add("expanded");
        updateGraph();
    }
}

export function updateGraph() {
    const gameState = getGameState();
    const graphContainer = document.getElementById('scoreGraph');
    const legendContainer = document.getElementById('graphLegend');
    const rounds = gameState.rounds;

    if (rounds.length === 0) {
        graphContainer.innerHTML = '<p style="text-align: center; color: var(--color-text-muted); padding: 2rem;">No rounds yet. Add some rounds to see the score evolution!</p>';
        legendContainer.innerHTML = '';
        return;
    }

    // Render legend separately
    renderLegend(gameState);

    // Calculate cumulative scores for each player
    const cumulativeScores = [[0], [0], [0], [0]]; // Start with 0 for each player

    rounds.forEach(round => {
        for (let i = 0; i < 4; i++) {
            const previousScore = cumulativeScores[i][cumulativeScores[i].length - 1];
            const roundScore = round.scores[i] || 0;
            cumulativeScores[i].push(previousScore + roundScore);
        }
    });

    // Graph dimensions and padding
    const width = Math.max(GRAPH_CONFIG.MIN_WIDTH, rounds.length * GRAPH_CONFIG.ROUND_WIDTH_MULTIPLIER + GRAPH_CONFIG.ADDITIONAL_WIDTH);
    const height = GRAPH_CONFIG.HEIGHT;
    const padding = GRAPH_CONFIG.PADDING;
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Find min and max scores for scaling
    const allScores = cumulativeScores.flat();
    const minScore = Math.min(...allScores);
    const maxScore = Math.max(...allScores);
    const scoreRange = maxScore - minScore || 1; // Avoid division by zero

    // Player colors
    const colors = PLAYER_COLORS;

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Create grid lines
    const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gridGroup.setAttribute('class', 'grid');

    // Horizontal grid lines
    for (let i = 0; i <= GRAPH_CONFIG.GRID_LINES; i++) {
        const y = padding.top + (graphHeight / GRAPH_CONFIG.GRID_LINES) * i;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding.left);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width - padding.right);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#e0e0e0');
        line.setAttribute('stroke-width', '1');
        gridGroup.appendChild(line);

        // Y-axis labels
        const score = maxScore - (scoreRange / GRAPH_CONFIG.GRID_LINES) * i;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', padding.left - 10);
        text.setAttribute('y', y + 4);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', '#666');
        text.textContent = Math.round(score);
        gridGroup.appendChild(text);
    }

    // Vertical grid lines - now includes starting point (0) and all rounds
    for (let i = 0; i <= rounds.length; i++) {
        const x = padding.left + (graphWidth / rounds.length) * i;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', padding.top);
        line.setAttribute('x2', x);
        line.setAttribute('y2', height - padding.bottom);
        line.setAttribute('stroke', '#e0e0e0');
        line.setAttribute('stroke-width', '1');
        gridGroup.appendChild(line);

        // X-axis labels - show 0 for starting point, then round numbers
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', height - padding.bottom + 20);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', '#666');

        if (i === 0) {
            text.textContent = '0';
        } else {
            // Match table numbering: solo rounds show "S", others show round number
            const roundIndex = i - 1;
            const round = rounds[roundIndex];
            if (round.solo) {
                text.textContent = 'S';
                text.setAttribute('fill', '#d32f2f'); // Red color for solo rounds
                text.setAttribute('font-weight', 'bold');
            } else {
                text.textContent = i.toString();
            }
        }
        gridGroup.appendChild(text);
    }

    svg.appendChild(gridGroup);

    // Draw lines and points for each player
    for (let playerIndex = 0; playerIndex < 4; playerIndex++) {
        const scores = cumulativeScores[playerIndex];
        const color = colors[playerIndex];

        // Create path for the line
        let pathData = '';
        for (let i = 0; i < scores.length; i++) {
            const x = padding.left + (graphWidth / (scores.length - 1)) * i;
            const y = padding.top + graphHeight - ((scores[i] - minScore) / scoreRange) * graphHeight;

            if (i === 0) {
                pathData += `M ${x} ${y}`;
            } else {
                pathData += ` L ${x} ${y}`;
            }
        }

        // Draw the line
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', GRAPH_CONFIG.LINE_WIDTH);
        path.setAttribute('fill', 'none');
        path.setAttribute('class', `player-line player-${playerIndex}`);
        svg.appendChild(path);

        // Draw data points
        for (let i = 0; i < scores.length; i++) {
            const x = padding.left + (graphWidth / (scores.length - 1)) * i;
            const y = padding.top + graphHeight - ((scores[i] - minScore) / scoreRange) * graphHeight;

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', GRAPH_CONFIG.POINT_RADIUS);
            circle.setAttribute('fill', color);
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', '2');
            circle.setAttribute('class', `player-point player-${playerIndex}`);
            svg.appendChild(circle);
        }
    }

    // Add axis labels
    const xAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xAxisLabel.setAttribute('x', width / 2);
    xAxisLabel.setAttribute('y', height - 5);
    xAxisLabel.setAttribute('text-anchor', 'middle');
    xAxisLabel.setAttribute('font-size', '14');
    xAxisLabel.setAttribute('fill', '#333');
    xAxisLabel.textContent = 'Round';
    svg.appendChild(xAxisLabel);

    const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yAxisLabel.setAttribute('x', 15);
    yAxisLabel.setAttribute('y', height / 2);
    yAxisLabel.setAttribute('text-anchor', 'middle');
    yAxisLabel.setAttribute('font-size', '14');
    yAxisLabel.setAttribute('fill', '#333');
    yAxisLabel.setAttribute('transform', `rotate(-90, 15, ${height / 2})`);
    yAxisLabel.textContent = 'Cumulative Score';
    svg.appendChild(yAxisLabel);

    // Clear and add the new graph
    graphContainer.innerHTML = '';
    graphContainer.appendChild(svg);
}

function renderLegend(gameState) {
    const legendContainer = document.getElementById('graphLegend');
    const colors = PLAYER_COLORS;

    // Create HTML legend items
    const legendItems = gameState.players.map((playerName, i) => {
        return `
            <div class="legend-item">
                <span class="legend-line" style="background-color: ${colors[i]};"></span>
                <span class="legend-text">${playerName}</span>
            </div>
        `;
    }).join('');

    legendContainer.innerHTML = `<div class="legend-container">${legendItems}</div>`;
}
