// Constants for DoppelkopfJS
// Static values used throughout the application

/**
 * SVG icon for edit button
 */
export const SVG_PENCIL = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2L3 10.207V13h2.793L14 4.793 11.207 2z"/>
</svg>`;

/**
 * Player colors for the score graph
 */
export const PLAYER_COLORS = ['#56a15a', '#bc4f4f', '#3498db', '#f39c12'];

/**
 * Default player names
 */
export const DEFAULT_PLAYER_NAMES = ["Player 1", "Player 2", "Player 3", "Player 4"];

/**
 * Game configuration constants
 */
export const GAME_CONFIG = {
  MAX_PLAYERS: 4,
  DEFAULT_POINTS: 1,
  MIN_POINTS: 0,
  SOLO_WINNER_COUNTS: [1, 3], // Valid winner counts for solo rounds
  NORMAL_WINNER_COUNT: 2, // Valid winner count for normal rounds
  SOLO_MULTIPLIER: 3, // Multiplier for solo round scoring
};

/**
 * Graph configuration
 */
export const GRAPH_CONFIG = {
  MIN_WIDTH: 400,
  HEIGHT: 300,
  PADDING: { top: 20, right: 40, bottom: 40, left: 60 },
  ROUND_WIDTH_MULTIPLIER: 60,
  ADDITIONAL_WIDTH: 100,
  GRID_LINES: 5,
  POINT_RADIUS: 4,
  LINE_WIDTH: 2,
  LEGEND_OFFSET: 20,
  LEGEND_LINE_LENGTH: 20,
  LEGEND_TEXT_OFFSET: 5,
};

/**
 * Toast notification configuration
 */
export const TOAST_CONFIG = {
  DEFAULT_DURATION: 4000,
  ANIMATION_DELAY: 100,
  REMOVE_DELAY: 300,
  DEFAULT_TYPE: 'error',
};

/**
 * CSV export configuration
 */
export const CSV_CONFIG = {
  REQUIRED_COLUMNS: 6,
  HEADER_COLUMNS: ['Round', 'Player1', 'Player2', 'Player3', 'Player4', 'Points'],
  SOLO_ROUND_LABEL: 'S',
  FILENAME_SEPARATOR: '-',
  DATE_PADDING: 2,
};

/**
 * Modal configuration
 */
export const MODAL_CONFIG = {
  CONFIRM_MODAL_ID: 'confirmModal',
  ADD_ROUND_MODAL_ID: 'addRoundModal',
  RULES_MODAL_ID: 'rulesModal',
  TOAST_CONTAINER_ID: 'toastContainer',
};

/**
 * CSS class names
 */
export const CSS_CLASSES = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  ACTIVE: 'active',
  SHOW: 'show',
  GAME_SEPARATOR: 'game-separator',
  ADD_ROUND_ROW: 'add-round-row',
  EMPTY_STATE: 'empty-state',
  EMPTY_MESSAGE: 'empty-message',
  WINNER_BUTTON: 'winner-button',
  ICON_BUTTON: 'icon-button',
  ADD_ROUND_BUTTON: 'add-round-button',
  TOGGLE_ICON: 'toggle-icon',
  EXPANDED: 'expanded',
};

/**
 * DOM element IDs
 */
export const ELEMENT_IDS = {
  SCORE_TABLE: 'scoreTable',
  GRAPH_CONTAINER: 'graphContainer',
  SCORE_GRAPH: 'scoreGraph',
  TOGGLE_GRAPH: 'toggleGraph',
  RESET_GAME: 'resetGame',
  EXPORT_GAME: 'exportGame',
  IMPORT_GAME: 'importGame',
  SHOW_RULES: 'showRules',
  CSV_FILE_INPUT: 'csvFileInput',
  CONFIRM_MESSAGE: 'confirmMessage',
  CONFIRM_YES: 'confirmYes',
  CONFIRM_NO: 'confirmNo',
  MODAL_ADD_ROUND: 'modalAddRound',
  MODAL_ROUND_POINTS: 'modalRoundPoints',
  MODAL_SOLO_ROUND: 'modalSoloRound',
  MODAL_WINNER_BUTTONS_CONTAINER: 'modalWinnerButtonsContainer',
  MODAL_INCREASE_POINTS: 'modalIncreasePoints',
  MODAL_DECREASE_POINTS: 'modalDecreasePoints',
};
