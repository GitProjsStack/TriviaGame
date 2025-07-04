'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TPlayer } from '@/app/interfaces/triviaTypes';
import { getWinners } from '@/app/components/getWinners';
import '../../cssStyling/triviaEndScreen.css';

interface TriviaEndScreenProps {
    players: TPlayer[];
    triviaId: string;
}

const TEMP_REROUTE_PATH = '../dashboard';

export default function TriviaEndScreen({ players, triviaId }: TriviaEndScreenProps) {
    const router = useRouter();
    const { winners } = getWinners(players);

    const isTie = winners.length > 1;

    function goToDashboard() {
        router.push('../dashboard');
    }

    return (
        <div className="end-screen-container">
            <h1 className="end-screen-title">Game Over</h1>

            {isTie ? (
                <h2 className="tie-message">It's a tie! 🏆</h2>
            ) : (
                <h2 className="winner-message">
                    Winner: <span className="winner-name">{winners[0].name}</span> 🎉
                </h2>
            )}

            <div className="podium">
                {[...players]
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3)
                    .map((player, index) => (
                        <div
                            key={player.id}
                            className={`podium-spot spot-${index + 1} ${winners.some(w => w.id === player.id) ? 'winner-spot' : ''
                                }`}
                        >
                            <div className="podium-block">
                                <span className="podium-rank">{index + 1}</span>
                                <span className="podium-player-name">{player.name || `Player ${player.id}`}</span>
                                <span className="podium-score">{player.score} pts</span>
                            </div>
                        </div>
                    ))}
            </div>

            <div className="end-screen-buttons">
                <button className="btn dashboard-btn" onClick={goToDashboard}>
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}