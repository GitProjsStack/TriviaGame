'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getTriviaById } from '@/app/supabasefuncs/helperSupabaseFuncs';
import {
    TPlayer,
    TQuestion,
    TChoice,
    TriviaContent,
    TriviaParams
} from '@/app/interfaces/triviaTypes';
import '../../../cssStyling/viewSharedTrivias.css';
import '../../../cssStyling/playTrivia.css';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

export default function PlayTriviaPage() {
    const router = useRouter();
    const params = useParams() as TriviaParams;
    const id = params.id;

    const [triviaTitle, setTriviaTitle] = useState<string>('');
    const [triviaContent, setTriviaContent] = useState<TriviaContent | null>(null);

    const [numPlayers, setNumPlayers] = useState('');
    const [players, setPlayers] = useState<TPlayer[]>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

    const [showGame, setShowGame] = useState(false);
    const [canStartGame, setCanStartGame] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalQuestion, setModalQuestion] = useState<TQuestion | null>(null);
    const [modalQuestionIndex, setModalQuestionIndex] = useState<number | null>(null);

    const [modalMessage, setModalMessage] = useState<string>('');
    const [uiMessage, setUiMessage] = useState<string>('');

    const [questionAnswered, setQuestionAnswered] = useState(false);

    // Fetch trivia data on mount
    useEffect(() => {
        if (!id) return;
        (async () => {
            const { trivia, error } = await getTriviaById(id);
            if (error) {
                showUIMessage('Failed to load trivia: ' + error);
                router.push('/dashboard');
                return;
            }
            setTriviaTitle(trivia.title);
            setTriviaContent(trivia.content);
        })();
    }, [id, router]);

    // Validate player names
    useEffect(() => {
        const allNamesValid = players.length > 0 && players.every(p => p.name.trim().length > 0);
        setCanStartGame(allNamesValid);
    }, [players]);

    function showUIMessage(message: string, duration: number = 1000) {
        setUiMessage(message);
        setTimeout(() => setUiMessage(''), duration);
    }

    function updatePlayerName(index: number, newName: string) {
        setPlayers((prev) => {
            const updated = [...prev];
            updated[index].name = newName;
            return updated;
        });
    }

    function initPlayers() {
        const n = Number(numPlayers || MIN_PLAYERS);
        const initialPlayers = Array.from({ length: n }, (_, i) => ({
            id: i + 1,
            name: '',
            score: 0,
        }));
        setPlayers(initialPlayers);
        setCurrentPlayerIndex(0);
    }

    function getPlayerColor(index: number): string {
        const colors = [
            '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE',
            '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE',
            '#B2FF59', '#FFD740', '#FFAB40', '#FF6E40'
        ];
        return colors[index % colors.length];
    }

    function beginGame() {
        const allNamesValid = players.every(p => p.name.trim().length > 0);
        if (!allNamesValid) {
            showUIMessage('Please enter a name for each player!');
            return;
        }
        setShowGame(true);
    }

    function openQuestionModal(categoryName: string, questionIdx: number) {
        if (!triviaContent) return;
        const questions = triviaContent[categoryName];
        if (!questions || !questions[questionIdx]) return;

        const rawQuestion = questions[questionIdx];
        const convertedQuestion: TQuestion = {
            question: rawQuestion.question,
            points: rawQuestion.points,
            choices: Object.entries(rawQuestion.choices).map(([key, text]) => ({
                text,
                isCorrect: key === rawQuestion.answer,
            })),
        };

        setModalQuestion(convertedQuestion);
        setModalQuestionIndex(questionIdx);
        setModalMessage('');
        setQuestionAnswered(false);
        setModalOpen(true);
    }

    function nextPlayer() {
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    }

    function closeModal() {
        setModalOpen(false);
        setModalQuestion(null);
        setModalQuestionIndex(null);
        setModalMessage('');
        setQuestionAnswered(false);
    }

    function handleGiveUp() {
        if (questionAnswered) return;
        setModalMessage('No points awarded. Moving to next player.');
        setQuestionAnswered(true);
        setTimeout(() => {
            closeModal();
            nextPlayer();
        }, 1500);
    }

    function handleSteal() {
        showUIMessage('Steal functionality not yet implemented.');
    }

    function handleChoiceClick(choice: TChoice) {
        if (questionAnswered) return;
        if (modalQuestionIndex === null || !triviaContent) return;

        if (choice.isCorrect) {
            setModalMessage('Correct! Points awarded.');
            setQuestionAnswered(true);

            setPlayers((prev) => {
                const newPlayers = [...prev];
                newPlayers[currentPlayerIndex].score += modalQuestion?.points || 0;
                return newPlayers;
            });

            setTimeout(() => {
                closeModal();
                nextPlayer();
            }, 1500);
        } else {
            setModalMessage('Incorrect. No points awarded.');
            setQuestionAnswered(true);
            setTimeout(() => {
                closeModal();
                nextPlayer();
            }, 1500);
        }
    }

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">{triviaTitle}</h1>
            <p className="dashboard-subtext">
                {showGame ? (
                    <>Game in progress!</>
                ) : (
                    'Set up your players and start the game!'
                )}
            </p>

            <div className="button-row">
                <button className="dashboard-back-button" onClick={() => router.push('../dashboard')}>
                    ← Back to Dashboard
                </button>
                <button className="dashboard-back-button" onClick={() => router.push('../viewSharedTrivias')}>
                    Play a different trivia
                </button>
            </div>

            {showGame && (
                <div className="players-scoreboard">
                    {players.map((p, i) => (
                        <div
                            key={p.id}
                            className={`scoreboard-entry ${i === currentPlayerIndex ? 'active-player' : ''}`}
                            style={{ borderColor: i === currentPlayerIndex ? '#db2777' : '#fbbf24' }}
                        >
                            <span className="scoreboard-name" style={{ color: getPlayerColor(i) }}>
                                {p.name || `Player ${p.id}`}
                            </span>
                            <span className="scoreboard-points">{p.score} pts</span>
                        </div>
                    ))}
                </div>
            )}

            {uiMessage && <div className="ui-message-banner">{uiMessage}</div>}

            {!players.length ? (
                <div className="players-input-box">
                    <label htmlFor="numPlayers">Number of players: {numPlayers || MIN_PLAYERS}</label>
                    <input
                        id="numPlayers"
                        type="range"
                        min={MIN_PLAYERS}
                        max={MAX_PLAYERS}
                        value={numPlayers || MIN_PLAYERS}
                        onChange={(e) => setNumPlayers(e.target.value)}
                    />
                    <button className="start-btn" onClick={initPlayers}>
                        Confirm Player Count
                    </button>
                </div>
            ) : !showGame ? (
                <>
                    <div className="players-row">
                        {players.map((p, i) => (
                            <div
                                key={p.id}
                                className={`player-box ${i === currentPlayerIndex ? 'active-player' : ''}`}
                            >
                                <input
                                    type="text"
                                    className="player-name-input"
                                    placeholder={`Player ${p.id} name`}
                                    value={p.name}
                                    onChange={(e) => updatePlayerName(i, e.target.value)}
                                />
                                <div className="player-score">Score: {p.score}</div>
                            </div>
                        ))}
                    </div>
                    <p className="dashboard-subtext">Please enter a name for each player to begin.</p>
                    <button
                        className="start-btn"
                        onClick={beginGame}
                        style={{ marginTop: '1rem' }}
                    >
                        Start Game
                    </button>
                </>
            ) : (
                triviaContent && Object.keys(triviaContent).length > 0 ? (
                    <div className="trivia-grid">
                        {Object.entries(triviaContent).map(([categoryName, questions]) => (
                            <div key={categoryName} className="category-column">
                                <h3 className="category-name">{categoryName}</h3>
                                {[...questions]
                                    .sort((a, b) => a.points - b.points)
                                    .map((question, qIdx) => (
                                        <button
                                            key={`${categoryName}-${qIdx}`}
                                            className="question-button"
                                            onClick={() => openQuestionModal(categoryName, qIdx)}
                                        >
                                            {question.points} pts
                                        </button>
                                    ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No trivia categories found.</p>
                )
            )}

            {modalOpen && modalQuestion && (
                <div className="modal-overlay" onClick={() => !questionAnswered && closeModal()}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-question"
                    >
                        <h2 id="modal-question">{modalQuestion.question}</h2>
                        <div className="choices-container">
                            {modalQuestion.choices.map((choice, idx) => (
                                <button
                                    key={idx}
                                    className="choice-button"
                                    onClick={() => handleChoiceClick(choice)}
                                    disabled={questionAnswered}
                                >
                                    {choice.text}
                                </button>
                            ))}
                        </div>

                        {modalMessage && <p className="modal-message">{modalMessage}</p>}

                        <div className="modal-buttons">
                            <button className="modal-btn give-up" onClick={handleGiveUp} disabled={questionAnswered}>
                                I Give Up
                            </button>
                            <button className="modal-btn steal" onClick={handleSteal} disabled={questionAnswered}>
                                Steal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}