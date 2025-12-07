// Utility functions for DoppelkopfJS
// These are pure functions with no dependencies on global state or DOM

/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast ('error', 'success', 'warning', 'info')
 * @param {number} duration - How long to show the toast in milliseconds
 */
export function showToast(message, type = 'error', duration = 4000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 100);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => container.removeChild(toast), 300);
  }, duration);
}

/**
 * Shows a confirmation modal
 * @param {string} message - The confirmation message
 * @param {function} onConfirm - Callback function when user confirms
 */
export function showConfirm(message, onConfirm) {
  const modal = document.getElementById('confirmModal');
  const messageEl = document.getElementById('confirmMessage');
  const yesBtn = document.getElementById('confirmYes');
  const noBtn = document.getElementById('confirmNo');

  messageEl.textContent = message;
  modal.style.display = 'block';

  // Remove existing listeners
  const newYesBtn = yesBtn.cloneNode(true);
  const newNoBtn = noBtn.cloneNode(true);
  yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
  noBtn.parentNode.replaceChild(newNoBtn, noBtn);

  // Add new listeners
  newYesBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    onConfirm();
  });

  newNoBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

/**
 * Parses CSV text and returns structured data
 * @param {string} csvText - The CSV text to parse
 * @returns {object} Parsed data with playerNames and rounds
 * @throws {Error} If CSV format is invalid
 */
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error("CSV file must have at least a header row and one data row");
  }

  // Parse header
  const header = lines[0].split(',');
  if (header.length !== 6) {
    throw new Error("CSV must have exactly 6 columns: Round, 4 player columns, Points");
  }

  // Extract player names from header (columns 1-4)
  const playerNames = header.slice(1, 5);

  // Parse data rows
  const rounds = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row.length !== 6) {
      throw new Error(`Row ${i + 1} has ${row.length} columns, expected 6`);
    }

    // Parse round label
    const roundLabel = row[0].trim();
    const isSolo = roundLabel === 'S';

    // Parse cumulative scores (columns 1-4)
    const cumulativeScores = [];
    for (let j = 1; j <= 4; j++) {
      const score = parseFloat(row[j]);
      if (isNaN(score)) {
        throw new Error(`Row ${i + 1}, column ${j + 1}: "${row[j]}" is not a valid number`);
      }
      cumulativeScores.push(score);
    }

    // Parse points
    const points = parseFloat(row[5]);
    if (isNaN(points) || points < 0) {
      throw new Error(`Row ${i + 1}, Points column: "${row[5]}" is not a valid positive number`);
    }

    // Calculate round scores from cumulative scores
    const roundScores = [];
    for (let j = 0; j < 4; j++) {
      const previousScore = i === 1 ? 0 : rounds[i - 2].cumulativeScores[j];
      const roundScore = cumulativeScores[j] - previousScore;
      roundScores.push(roundScore);
    }

    rounds.push({
      roundLabel,
      isSolo,
      cumulativeScores,
      roundScores,
      points
    });
  }

  return {
    playerNames,
    rounds
  };
}

/**
 * Validates imported data for consistency
 * @param {object} parsedData - The parsed data to validate
 * @returns {boolean} True if valid
 * @throws {Error} If data is invalid
 */
export function validateImportedData(parsedData) {
  const { playerNames, rounds } = parsedData;

  // Validate player names
  for (let i = 0; i < playerNames.length; i++) {
    if (!playerNames[i] || playerNames[i].trim() === '') {
      throw new Error(`Player ${i + 1} name is empty`);
    }
  }

  // Validate rounds data
  for (let i = 0; i < rounds.length; i++) {
    const round = rounds[i];

    // Check if round scores make sense (should be multiples of points)
    for (let j = 0; j < 4; j++) {
      const score = round.roundScores[j];
      if (score !== 0 && Math.abs(score) !== round.points && Math.abs(score) !== round.points * 3) {
        throw new Error(`Row ${i + 2}: Player ${j + 1} score ${score} doesn't match expected values (0, ±${round.points}, or ±${round.points * 3})`);
      }
    }

    // Check for solo round logic
    if (round.isSolo) {
      const winners = round.roundScores.filter(score => score > 0);
      if (winners.length !== 1 && winners.length !== 3) {
        throw new Error(`Row ${i + 2}: Solo round must have exactly 1 or 3 winners, found ${winners.length}`);
      }
    } else {
      const winners = round.roundScores.filter(score => score > 0);
      if (winners.length !== 2) {
        throw new Error(`Row ${i + 2}: Normal round must have exactly 2 winners, found ${winners.length}`);
      }
    }
  }

  return true;
}

/**
 * Exports game data as CSV
 * @param {object} gameState - The current game state
 * @returns {void} Downloads the CSV file
 */
export function exportGame(gameState) {
  // CSV header: Round, player names, then Points column
  let csv = "Round," + gameState.players.join(",") + ",Points\n";

  // Initialize totals array to track cumulative scores per player
  let totals = [0, 0, 0, 0];

  gameState.rounds.forEach((round, idx) => {
    // Update totals with this round's scores
    round.scores.forEach((score, i) => {
      totals[i] += score;
    });

    // Compose CSV row:
    // Round label: "S" for solo, otherwise round index + 1
    // Then totals (running scores)
    // Then round.points
    let roundLabel = round.solo ? "S" : idx + 1;

    csv += roundLabel + "," + totals.join(",") + "," + round.points + "\n";
  });

  // Generate descriptive filename with date, time, and player names
  const now = new Date();
  const dateString = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');

  const timeString = now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');

  // Create player names string, replacing spaces with underscores
  const playerNames = gameState.players.map(name =>
    name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
  ).join('-');

  const filename = `${dateString}-${timeString}-${playerNames}.csv`;

  // Create downloadable CSV file
  let blob = new Blob([csv], { type: "text/csv" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = filename;

  // Append to body to ensure it works on iOS/Firefox
  document.body.appendChild(a);
  a.click();

  // cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

