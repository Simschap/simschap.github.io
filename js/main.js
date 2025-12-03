import { loadState } from './state.js';
import { renderTable } from './ui.js';
import { initEvents } from './events.js';

// Initialize on page load
loadState();
renderTable();
initEvents();
