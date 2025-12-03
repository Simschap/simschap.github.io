import { SVG_PENCIL, DEFAULT_PLAYER_NAMES } from './constants.js';
import { getGameState } from './state.js';

// Keep track of modal buttons
let modalWinnerButtons = [];

export function getModalWinnerButtons() {
    return modalWinnerButtons;
}

export function renderTable() {
    const gameState = getGameState();

    // Update player names from inputs and sync to gameState (handled in events, but we need to ensure UI is correct)
    // Actually, let's just render the table based on state.
    // The inputs are already bound to state updates in events.js.
    // But we might need to refresh them if state changes externally (e.g. load).

    for (let i = 0; i < 4; i++) {
        let input = document.getElementById("player" + i);
        if (gameState.players[i] && gameState.players[i] !== DEFAULT_PLAYER_NAMES[i]) {
            input.value = gameState.players[i];
        } else {
            // If it matches default or is empty in state (shouldn't happen if initialized), show placeholder
            // But input.value = "" shows placeholder.
            // If state has specific name, show it.
            // If state has "Player 1", we can show that or empty.
            // The original code:
            // if (gameState.players[i] && gameState.players[i] !== `Player ${i + 1}`) { input.value = ... } else { input.value = input.placeholder }

            if (gameState.players[i] && gameState.players[i] !== `Player ${i + 1}`) {
                input.value = gameState.players[i];
            } else {
                input.value = ""; // This will show placeholder
            }
        }
    }

    const tbody = document.querySelector("#scoreTable tbody");
    tbody.innerHTML = "";
    let totals = [0, 0, 0, 0];
    let roundCounter = 1;

    gameState.rounds.forEach((round, index) => {
        let tr = document.createElement("tr");
        tr.dataset.index = index;
        tr.classList.add("clickable-row");

        let roundLabel = round.solo ? "S" : roundCounter++;
        tr.dataset.label = roundLabel;

        let rowHtml = `<td>${roundLabel}</td>`;
        round.scores.forEach((score, i) => {
            totals[i] += score;
            let cls = score > 0 ? "positive" : score < 0 ? "negative" : "";
            rowHtml += `<td class='${cls}'>${totals[i]}</td>`;
        });

        rowHtml += `<td>${round.points}</td>`;
        tr.innerHTML = rowHtml;

        if (!round.solo && roundCounter > 1 && (roundCounter - 1) % 4 === 0) {
            tr.classList.add("game-separator");
        }

        tbody.appendChild(tr);
    });

    const addRow = document.createElement("tr");
    addRow.className = "add-round-row";

    if (gameState.rounds.length === 0) {
        addRow.innerHTML = `
      <td colspan="7" class="empty-state">
        <div class="empty-message">
          <p>No rounds yet. Click the button below to start your first round!</p>
          <button data-action="open-add-round" aria-label="Add new round" class="add-round-button">Add Round</button>
        </div>
      </td>
    `;
    } else {
        addRow.innerHTML = `<td colspan="7"><button data-action="open-add-round" aria-label="Add new round" class="add-round-button">Add Round</button></td>`;
    }

    tbody.appendChild(addRow);
}

export function openAddRoundModal(isEditMode = false, roundData = null, roundLabel = null) {
    const modal = document.getElementById('addRoundModal');
    modal.style.display = 'block';

    const modalTitle = document.querySelector('.modal-header h2');
    const modalButton = document.getElementById('modalAddRound');

    if (isEditMode) {
        modalTitle.textContent = roundLabel ? `Edit Round ${roundLabel}` : 'Edit Round';
        modalButton.textContent = 'Save Edits';
    } else {
        modalTitle.textContent = 'Add Round';
        modalButton.textContent = 'Add Round';
        document.getElementById('modalRoundPoints').value = '1';
        document.getElementById('modalSoloRound').checked = false;
    }

    buildModalWinnerButtons();

    if (isEditMode && roundData) {
        document.getElementById('modalRoundPoints').value = roundData.points;
        document.getElementById('modalSoloRound').checked = roundData.solo;

        const winners = roundData.scores.map(score => score > 0);

        // We need to wait for buttons to be in DOM or just manipulate them directly since we just built them
        // buildModalWinnerButtons appends to DOM.

        modalWinnerButtons.forEach((btn, i) => {
            if (winners[i]) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            }
        });
    } else {
        modalWinnerButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
    }
}

export function closeAddRoundModal() {
    const modal = document.getElementById('addRoundModal');
    modal.style.display = 'none';
}

function buildModalWinnerButtons() {
    const modalWinnerButtonsContainer = document.getElementById('modalWinnerButtonsContainer');
    const legend = modalWinnerButtonsContainer.querySelector('legend');

    modalWinnerButtonsContainer.innerHTML = '';
    if (legend) {
        modalWinnerButtonsContainer.appendChild(legend);
    }

    modalWinnerButtons = [];
    const gameState = getGameState();

    gameState.players.forEach((playerName, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = playerName;
        btn.className = "winner-button";
        btn.dataset.playerIndex = index;

        // Event listener will be handled by delegation or we can attach here since it's dynamic
        // Attaching here is easier for dynamic elements
        btn.addEventListener("click", () => {
            btn.classList.toggle("active");
            btn.setAttribute("aria-pressed", btn.classList.contains("active"));
        });

        modalWinnerButtonsContainer.appendChild(btn);
        modalWinnerButtons.push(btn);
    });
}
