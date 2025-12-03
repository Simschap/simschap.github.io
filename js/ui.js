import { SVG_PENCIL, DEFAULT_PLAYER_NAMES, MODAL_CONFIG, ELEMENT_IDS, CSS_CLASSES } from './constants.js';
import { getGameState } from './state.js';

// Keep track of modal buttons
let modalWinnerButtons = [];

export function getModalWinnerButtons() {
    return modalWinnerButtons;
}

export function renderTable() {
    const gameState = getGameState();

    for (let i = 0; i < 4; i++) {
        let input = document.getElementById('player' + i);
        if (gameState.players[i] && gameState.players[i] !== DEFAULT_PLAYER_NAMES[i]) {
            input.value = gameState.players[i];
        } else {
            if (gameState.players[i] && gameState.players[i] !== `Player ${i + 1}`) {
                input.value = gameState.players[i];
            } else {
                input.value = ''; // This will show placeholder
            }
        }
    }

    const tbody = document.querySelector('#scoreTable tbody');
    tbody.innerHTML = '';
    let totals = [0, 0, 0, 0];
    let roundCounter = 1;

    gameState.rounds.forEach((round, index) => {
        let tr = document.createElement('tr');
        tr.dataset.index = index;
        tr.classList.add('clickable-row');

        let roundLabel = round.solo ? 'S' : roundCounter++;
        tr.dataset.label = roundLabel;

        let rowHtml = `<td>${roundLabel}</td>`;
        round.scores.forEach((score, i) => {
            totals[i] += score;
            let cls = score > 0 ? CSS_CLASSES.POSITIVE : score < 0 ? CSS_CLASSES.NEGATIVE : '';
            rowHtml += `<td class='${cls}'>${totals[i]}</td>`;
        });

        rowHtml += `<td>${round.points}</td>`;
        tr.innerHTML = rowHtml;

        if (!round.solo && roundCounter > 1 && (roundCounter - 1) % 4 === 0) {
            tr.classList.add(CSS_CLASSES.GAME_SEPARATOR);
        }

        tbody.appendChild(tr);
    });

    const addRow = document.createElement('tr');
    addRow.className = CSS_CLASSES.ADD_ROUND_ROW;

    if (gameState.rounds.length === 0) {
        addRow.innerHTML = `
      <td colspan="7" class="${CSS_CLASSES.EMPTY_STATE}">
        <div class="${CSS_CLASSES.EMPTY_MESSAGE}">
          <p>No rounds yet. Click the button below to start your first round!</p>
          <button data-action="open-add-round" aria-label="Add new round" class="${CSS_CLASSES.ADD_ROUND_BUTTON}">Add Round</button>
        </div>
      </td>
    `;
    } else {
        addRow.innerHTML = `<td colspan="7"><button data-action="open-add-round" aria-label="Add new round" class="${CSS_CLASSES.ADD_ROUND_BUTTON}">Add Round</button></td>`;
    }

    tbody.appendChild(addRow);
}

export function openAddRoundModal(isEditMode = false, roundData = null, roundLabel = null) {
    const modal = document.getElementById(MODAL_CONFIG.ADD_ROUND_MODAL_ID);
    modal.style.display = 'block';

    const modalTitle = document.querySelector('.modal-header h2');
    const modalButton = document.getElementById(ELEMENT_IDS.MODAL_ADD_ROUND);

    if (isEditMode) {
        modalTitle.textContent = roundLabel ? `Edit Round ${roundLabel}` : 'Edit Round';
        modalButton.textContent = 'Save Edits';
    } else {
        modalTitle.textContent = 'Add Round';
        modalButton.textContent = 'Add Round';
        document.getElementById(ELEMENT_IDS.MODAL_ROUND_POINTS).value = '1';
        document.getElementById(ELEMENT_IDS.MODAL_SOLO_ROUND).checked = false;
    }

    buildModalWinnerButtons();

    if (isEditMode && roundData) {
        document.getElementById(ELEMENT_IDS.MODAL_ROUND_POINTS).value = roundData.points;
        document.getElementById(ELEMENT_IDS.MODAL_SOLO_ROUND).checked = roundData.solo;

        const winners = roundData.scores.map(score => score > 0);

        modalWinnerButtons.forEach((btn, i) => {
            if (winners[i]) {
                btn.classList.add(CSS_CLASSES.ACTIVE);
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove(CSS_CLASSES.ACTIVE);
                btn.setAttribute('aria-pressed', 'false');
            }
        });
    } else {
        modalWinnerButtons.forEach(btn => {
            btn.classList.remove(CSS_CLASSES.ACTIVE);
            btn.setAttribute('aria-pressed', 'false');
        });
    }
}

export function closeAddRoundModal() {
    const modal = document.getElementById(MODAL_CONFIG.ADD_ROUND_MODAL_ID);
    modal.style.display = 'none';
}

function buildModalWinnerButtons() {
    const modalWinnerButtonsContainer = document.getElementById(ELEMENT_IDS.MODAL_WINNER_BUTTONS_CONTAINER);
    const legend = modalWinnerButtonsContainer.querySelector('legend');

    modalWinnerButtonsContainer.innerHTML = '';
    if (legend) {
        modalWinnerButtonsContainer.appendChild(legend);
    }

    modalWinnerButtons = [];
    const gameState = getGameState();

    gameState.players.forEach((playerName, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = playerName;
        btn.className = CSS_CLASSES.WINNER_BUTTON;
        btn.dataset.playerIndex = index;

        btn.addEventListener('click', () => {
            btn.classList.toggle(CSS_CLASSES.ACTIVE);
            btn.setAttribute('aria-pressed', btn.classList.contains(CSS_CLASSES.ACTIVE));
        });

        modalWinnerButtonsContainer.appendChild(btn);
        modalWinnerButtons.push(btn);
    });
}
