import { TPlayer } from '@/app/interfaces/triviaTypes';

/**
 * Returns the highest score and an array of winner players with that score.
 * @param players Array of players with scores
 */
export function getWinners(players: TPlayer[]): { highestScore: number; winners: TPlayer[] } {
    if (players.length === 0) return { highestScore: 0, winners: [] };

    const highestScore = Math.max(...players.map(p => p.score));
    const winners = players.filter(p => p.score === highestScore);

    return { highestScore, winners };
}