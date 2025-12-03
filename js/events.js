import { showToast, showConfirm, parseCSV, validateImportedData, exportGame } from './utils.js';
import { getGameState, updatePlayerName, addRound, updateRound, resetGameState, setPlayers, setRounds } from './state.js';
import { calculateScores, validateRoundInput } from './logic.js';
import { renderTable, openAddRoundModal, closeAddRoundModal, getModalWinnerButtons } from './ui.js';
import { toggleGraph, updateGraph } from './graph.js';

let editingRoundIndex = undefined;

export function initEvents() {
    // Player name inputs
    for (let i = 0; i < 4; i++) {
        const playerInput = document.getElementById('player' + i);

        playerInput.addEventListener('focus', () => {
            if (playerInput.value === playerInput.placeholder) {
                playerInput.value = '';
            }
        });

        playerInput.addEventListener('blur', () => {
            if (playerInput.value.trim() === '') {
                playerInput.value = playerInput.placeholder;
            }
        });

        playerInput.addEventListener('input', () => {
            updatePlayerName(i, playerInput.value.trim() || `Player ${i + 1}`);
        });
    }

    // Global buttons
    document.getElementById('resetGame').addEventListener('click', handleResetGame);
    document.getElementById('exportGame').addEventListener('click', () => exportGame(getGameState()));
    document.getElementById('importGame').addEventListener('click', importGame);
    document.getElementById('csvFileInput').addEventListener('change', handleCSVImport);
    document.getElementById('toggleGraph').addEventListener('click', toggleGraph);

    // Modal events
    document.getElementById('modalAddRound').addEventListener('click', handleAddRoundFromModal);
    document.querySelector('.modal-cancel-button').addEventListener('click', closeAddRoundModal);
    document.querySelector('.modal-close').addEventListener('click', closeAddRoundModal);

    document.getElementById('addRoundModal').addEventListener('click', (e) => {
        if (e.target.id === 'addRoundModal') {
            closeAddRoundModal();
        }
    });

    document.getElementById('confirmModal').addEventListener('click', (e) => {
        if (e.target.id === 'confirmModal') {
            document.getElementById('confirmModal').style.display = 'none';
        }
    });

    document.getElementById('modalIncreasePoints').addEventListener('click', () => {
        let input = document.getElementById('modalRoundPoints');
        input.value = parseInt(input.value || '1') + 1;
    });

    document.getElementById('modalDecreasePoints').addEventListener('click', () => {
        let input = document.getElementById('modalRoundPoints');
        let newValue = parseInt(input.value || '1') - 1;
        input.value = Math.max(newValue, 0);
    });

    // Table event delegation for edit buttons
    document.querySelector('#scoreTable tbody').addEventListener('click', (e) => {
        // Check if we clicked on the "Add Round" button first
        const addBtn = e.target.closest("button[data-action='open-add-round']");
        if (addBtn) {
            editingRoundIndex = undefined;
            openAddRoundModal(false);
            return;
        }

        // Check if we clicked on a row
        const tr = e.target.closest('tr.clickable-row');
        if (tr && tr.dataset.index !== undefined) {
            const index = parseInt(tr.dataset.index, 10);
            const label = tr.dataset.label;
            handleEditRound(index, label);
        }
    });
}

function handleResetGame() {
    showConfirm('Are you sure you want to reset all scores? This action cannot be undone.', () => {
        resetGameState();
        renderTable();
        showToast('Game has been reset successfully.', 'success');

        const graphContainer = document.getElementById('graphContainer');
        if (graphContainer.style.display !== 'none') {
            updateGraph();
        }
    });
}

function handleEditRound(index, label) {
    const gameState = getGameState();
    const round = gameState.rounds[index];
    editingRoundIndex = index;
    openAddRoundModal(true, round, label);
}

function handleAddRoundFromModal() {
    let points = parseInt(document.getElementById('modalRoundPoints').value, 10);
    let solo = document.getElementById('modalSoloRound').checked;

    const modalWinnerButtons = getModalWinnerButtons();
    let winners = modalWinnerButtons.map((btn) => btn.classList.contains('active'));

    const validation = validateRoundInput(points, winners, solo);
    if (!validation.valid) {
        showToast(validation.message);
        return;
    }

    const scores = calculateScores(points, winners, solo);

    if (editingRoundIndex !== undefined) {
        updateRound(editingRoundIndex, { points: points, scores: scores, solo: solo });
        editingRoundIndex = undefined;
    } else {
        addRound({ points: points, scores: scores, solo: solo });
    }

    closeAddRoundModal();
    renderTable();

    const graphContainer = document.getElementById('graphContainer');
    if (graphContainer.style.display !== 'none') {
        updateGraph();
    }
}

function importGame() {
    const gameState = getGameState();
    if (gameState.rounds.length > 0) {
        showConfirm(
            'Importing a CSV file will completely replace your current scoreboard. All existing rounds will be lost. Are you sure you want to continue?',
            () => {
                document.getElementById('csvFileInput').click();
            }
        );
    } else {
        document.getElementById('csvFileInput').click();
    }
}

function handleCSVImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    event.target.value = '';

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const csvText = e.target.result;
            const parsedData = parseCSV(csvText);
            validateImportedData(parsedData);
            performImport(parsedData);
        } catch (error) {
            showToast(`Import failed: ${error.message}`, 'error');
        }
    };

    reader.onerror = function () {
        showToast('Error reading file. Please try again.', 'error');
    };

    reader.readAsText(file);
}

function performImport(parsedData) {
    const { playerNames, rounds } = parsedData;
    const gameState = getGameState();

    setPlayers(playerNames);

    for (let i = 0; i < 4; i++) {
        const input = document.getElementById(`player${i}`);
        input.value = playerNames[i];
    }

    const newRounds = rounds.map(round => ({
        points: round.points,
        scores: round.roundScores,
        solo: round.isSolo
    }));

    setRounds(newRounds);

    renderTable();

    const graphContainer = document.getElementById('graphContainer');
    if (graphContainer.style.display !== 'none') {
        updateGraph();
    }

    showToast(`Successfully imported ${rounds.length} rounds`, 'success');
}
