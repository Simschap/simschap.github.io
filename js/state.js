import { DEFAULT_PLAYER_NAMES } from './constants.js';

let gameState = {
    players: [...DEFAULT_PLAYER_NAMES],
    rounds: [],
};

export function getGameState() {
    return gameState;
}

export function setGameState(newState) {
    gameState = newState;
    saveState();
}

export function saveState() {
    localStorage.setItem("dokoGame", JSON.stringify(gameState));
}

export function loadState() {
    let saved = localStorage.getItem("dokoGame");
    if (saved) {
        gameState = JSON.parse(saved);
    }
    return gameState;
}

export function updatePlayerName(index, name) {
    gameState.players[index] = name;
    saveState();
}

export function addRound(round) {
    gameState.rounds.push(round);
    saveState();
}

export function updateRound(index, round) {
    gameState.rounds[index] = round;
    saveState();
}

export function resetGameState() {
    gameState.rounds = [];
    saveState();
}

export function setPlayers(players) {
    gameState.players = players;
    saveState();
}

export function setRounds(rounds) {
    gameState.rounds = rounds;
    saveState();
}
