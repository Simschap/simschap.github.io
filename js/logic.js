import { GAME_CONFIG } from './constants.js';

export function calculateScores(points, winners, isSolo) {
    const winnerCount = winners.filter((w) => w).length;
    let scores;

    if (isSolo) {
        // Solo round logic:
        // - If 1 winner (solo player wins): winner gets 3x points, losers get -1x points
        // - If 3 winners (solo player loses): winners get 1x points, loser gets -3x points
        if (winnerCount === 1) {
            // Solo player wins
            scores = winners.map((w) => (w ? points * GAME_CONFIG.SOLO_MULTIPLIER : -points));
        } else {
            // Solo player loses (3 winners)
            scores = winners.map((w) => (w ? points : -points * GAME_CONFIG.SOLO_MULTIPLIER));
        }
    } else {
        scores = winners.map((w) => (w ? points : -points));
    }
    return scores;
}

export function validateRoundInput(points, winners, isSolo) {
    if (isNaN(points) || points < 0) {
        return { valid: false, message: "Please enter a valid point value (0 or greater)." };
    }

    if (!winners.includes(true)) {
        return { valid: false, message: "Please select at least one winner." };
    }

    const winnerCount = winners.filter((w) => w).length;

    if (isSolo) {
        if (!GAME_CONFIG.SOLO_WINNER_COUNTS.includes(winnerCount)) {
            return { valid: false, message: "For a solo round, select exactly 1 winner (solo player) or 3 winners (against solo player)." };
        }
    } else {
        if (winnerCount !== GAME_CONFIG.NORMAL_WINNER_COUNT) {
            return { valid: false, message: "For a normal round, select exactly 2 winners." };
        }
    }

    return { valid: true };
}
