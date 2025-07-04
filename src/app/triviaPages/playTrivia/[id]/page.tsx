'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getTriviaById } from '@/app/supabasefuncs/helperSupabaseFuncs';
import {
    TContent,
    TPlayer,
    TQuestion,
    TChoice,
    TriviaParams
} from '@/app/interfaces/triviaTypes';
import '@app/styles/playTriviaPage.css';

export default function PlayTriviaPage() {
    const router = useRouter();
    const params = useParams() as TriviaParams;
    const id = params.id;

    const [triviaTitle, setTriviaTitle] = useState<string>('');
    const [triviaContent, setTriviaContent] = useState<TContent | null>(null);

    const [numPlayers, setNumPlayers] = useState('');
    const [players, setPlayers] = useState<TPlayer[]>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

    const [showGame, setShowGame] = useState(false);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalQuestion, setModalQuestion] = useState<TQuestion | null>(null);
    const [modalCategoryIndex, setModalCategoryIndex] = useState<number | null>(null);
    const [modalQuestionIndex, setModalQuestionIndex] = useState<number | null>(null);

    const [modalMessage, setModalMessage] = useState<string>('');
    const [questionAnswered, setQuestionAnswered] = useState(false);

    // Fetch trivia data on mount
    useEffect(() => {
        if (!id) return;
        (async () => {
            const { trivia, error } = await getTriviaById(id);
            if (error) {
                alert('Failed to load trivia: ' + error);
                router.push('/dashboard');
                return;
            }
            setTriviaTitle(trivia.title);
            setTriviaContent(trivia.content);
        })();
    }, [id, router]);

    // Start game handler
    function startGame() {
        const n = Number(numPlayers);
        if (isNaN(n) || n < 2 || n > 10) {
            alert('Please enter a number of players between 2 and 10');
            return;
        }
        const initialPlayers = Array.from({ length: n }, (_, i) => ({ id: i + 1, score: 0 }));
        setPlayers(initialPlayers);
        setCurrentPlayerIndex(0);
        setShowGame(true);
    }

    // Handle question click to open modal
    function openQuestionModal(categoryIdx: number, questionIdx: number) {
        if (!triviaContent) return;
        const question = triviaContent.categories[categoryIdx].questions[questionIdx];
        setModalQuestion(question);
        setModalCategoryIndex(categoryIdx);
        setModalQuestionIndex(questionIdx);
        setModalMessage('');
        setQuestionAnswered(false);
        setModalOpen(true);
    }

    // Move to next player
    function nextPlayer() {
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    }

    // Close modal and move on
    function closeModal() {
        setModalOpen(false);
        setModalQuestion(null);
        setModalCategoryIndex(null);
        setModalQuestionIndex(null);
        setModalMessage('');
        setQuestionAnswered(false);
    }

    // When "I Give Up" clicked: 0 points, next player
    function handleGiveUp() {
        if (questionAnswered) return;
        setModalMessage('No points awarded. Moving to next player.');
        setQuestionAnswered(true);
        setTimeout(() => {
            closeModal();
            nextPlayer();
        }, 1500);
    }

    // When "Steal" clicked: call your placeholder function (to be implemented)
    function handleSteal() {
        alert('Steal functionality not yet implemented.');
    }

    // When a choice is clicked
    function handleChoiceClick(choice: TChoice) {
        if (questionAnswered) return;
        if (modalQuestionIndex === null || modalCategoryIndex === null || !triviaContent) return;

        if (choice.isCorrect) {
            setModalMessage('Correct! Points awarded.');
            setQuestionAnswered(true);

            // Add points to current player
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
        <div className="play-container">
            <header className="play-header">
                <h1 className="trivia-title">{triviaTitle}</h1>
                {showGame && (
                    <div className="players-row">
                        {players.map((p, i) => (
                            <div
                                key={p.id}
                                className={`player-box ${i === currentPlayerIndex ? 'active-player' : ''}`}
                            >
                                Player {p.id} <br />
                                Score: {p.score}
                            </div>
                        ))}
                    </div>
                )}
            </header>

            {!showGame ? (
                <div className="players-input-box">
                    <label htmlFor="numPlayers">Number of players (2-10): </label>
                    <input
                        id="numPlayers"
                        type="number"
                        min={2}
                        max={10}
                        value={numPlayers}
                        onChange={(e) => setNumPlayers(e.target.value)}
                    />
                    <button className="start-btn" onClick={startGame}>
                        Play game with {numPlayers || '?'} players
                    </button>
                </div>
            ) : (
                <div className="trivia-grid">
                    {triviaContent?.categories.map((category, catIdx) => (
                        <div key={category.name} className="category-column">
                            <h3 className="category-name">{category.name}</h3>
                            {category.questions.map((question, qIdx) => (
                                <button
                                    key={`${category.name}-${qIdx}`}
                                    className="question-button"
                                    onClick={() => openQuestionModal(catIdx, qIdx)}
                                >
                                    {question.points} pts
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
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