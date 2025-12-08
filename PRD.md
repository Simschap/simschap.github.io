# Product Requirements Document (PRD) - Doko Rocks

## 1. Project Overview
"Doko Rocks" is a web-based score tracker for the card game **Doppelkopf**. It provides a digital alternative to paper scorepads, offering automated score calculations, game history visualization, and persistent data storage. The application is designed to be offline-first, dependency-free (Vanilla JS), and responsive for both mobile and desktop use.

## 2. User Roles
*   **Scorer**: The player responsible for entering game results and managing the app.
*   **Player**: A participant in the game whose score is tracked.

## 3. Functional Requirements

### 3.1. Scoreboard Management
*   **Player Names**:
    *   Support for 4 players.
    *   Editable player names via the table header inputs.
    *   Default names (Player 1 - Player 4) provided if left empty.
*   **Round Table**:
    *   Display a chronological list of rounds.
    *   Columns: Round Number (or 'S' for Solo), Player 1 Score, Player 2 Score, Player 3 Score, Player 4 Score, Round Points.
    *   **Sticky Header**: Table headers remain visible while scrolling.
    *   **Sticky First Column**: Round number remains visible while scrolling horizontally on small screens.
*   **Dealer Tracking**:
    *   Visual indication of the **current dealer** (if applicable) or a rotation mechanism.
    *   Visual indication of the **next dealer** at the bottom of the table to facilitate game flow.

### 3.2. Round Entry (Add/Edit Round)
*   **Add Round Modal**:
    *   Input for **Round Points** (Default: 1).
    *   Buttons to increment/decrement points.
    *   **Winner Selection**: Toggle buttons for all 4 players to select winners.
    *   **Solo Mode**: Checkbox to toggle "Solo" round logic.
*   **Validation**:
    *   **Normal Round**: Requires exactly 2 winners.
    *   **Solo Round**: Requires exactly 1 winner (the soloist) OR 3 winners (the opponents against the soloist).
    *   Points must be a non-negative integer.
    *   Error messages displayed via Toast notifications for invalid inputs.
*   **Score Calculation**:
    *   **Normal**: Winners get `+Points`, Losers get `-Points`.
    *   **Solo**:
        *   If Soloist wins (1 winner): Soloist gets `+Points * 3`, Opponents get `-Points`.
        *   If Soloist loses (3 winners): Opponents get `+Points`, Soloist gets `-Points * 3`.
*   **Edit Round**:
    *   Ability to click on an existing round in the table to edit its details.
    *   Updates the scoreboard and re-calculates subsequent totals (if cumulative view is used).

### 3.3. Game Statistics
*   **Score Graph**:
    *   Interactive line graph showing the score evolution over time.
    *   Collapsible section to hide/show the graph.
    *   Distinct colored lines for each player matching the legend.

### 3.4. Data Persistence & Management
*   **Local Storage**:
    *   Game state (players, rounds, settings) automatically saved to the browser's `localStorage`.
    *   State persists across page reloads and browser sessions.
*   **Reset Game**:
    *   Button to clear all data and start a fresh game.
    *   Confirmation modal to prevent accidental data loss.
*   **Export Data**:
    *   Export current game history as a **CSV file**.
    *   Filename includes timestamp and player names.
*   **Import Data**:
    *   Import game history from a valid CSV file.
    *   Validation of CSV structure (headers, column count, data types).
    *   Confirmation prompt before overwriting current game data.

### 3.5. Reference Materials
*   **Rules Cheat Sheet**:
    *   Modal displaying essential Doppelkopf rules.
    *   Sections: Trumpf (Trumps), Fehl (Suits), Vorbehalte (Reservations), Wertung (Card Values), Spielpunkte (Game Points).

## 4. Non-Functional Requirements
*   **Tech Stack**: HTML5, CSS3 (Vanilla), JavaScript (ES6 Modules). No external frameworks or libraries (zero-dependency).
*   **Responsive Design**: Optimized for mobile devices (phones/tablets) and desktop screens.
*   **Performance**: Fast load times, immediate UI feedback.
*   **Usability**:
    *   High contrast text and clear interactive elements.
    *   Toast notifications for user feedback (success/error).
    *   "Skip Navigation" links for keyboard accessibility.
    *   ARIA labels for accessibility.

## 5. UI/UX Features
*   **Navigation**:
    *   Discrete Burger Menu for secondary actions (Reset, Import, Export).
    *   "Book" icon for quick access to Rules.
*   **Visual Feedback**:
    *   Toast messages for actions (e.g., "Game has been reset", "Import failed").
    *   Modal dialogs for complex interactions.
