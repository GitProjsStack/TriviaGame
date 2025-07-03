'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuthenticatedUser,
  getMyTriviaGames,
  createTriviaGame,
  addTriviaIdToClient,
  deleteTriviaById,
} from '../../supabasefuncs/helperSupabaseFuncs';
import { TriviaGame } from '../../interfaces/triviaTypes';
import '../../cssStyling/createEditTrivias.css';

export default function CreateEditTrivias() {
  const router = useRouter();
  const [triviaGames, setTriviaGames] = useState<TriviaGame[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTriviaGames = async () => {
      const user = await getAuthenticatedUser();
      if (!user) return;

      const games = await getMyTriviaGames(user.id);
      setTriviaGames(games);
      setLoading(false);
    };

    fetchTriviaGames();
  }, []);

  // Handle Create New Trivia submit
  const handleCreateTrivia = async () => {
    setErrorMsg('');
    if (!newTitle.trim()) {
      setErrorMsg('Please enter a title.');
      return;
    }
    setCreating(true);

    const user = await getAuthenticatedUser();
    if (!user) {
      setErrorMsg('User not authenticated.');
      setCreating(false);
      return;
    }

    const created = await createTriviaGame({
      creator_id: user.id,
      title: newTitle.trim(),
      status: 'in progress',
      content: {},
    });

    if (!created.success) {
      setErrorMsg('Failed to create trivia: ' + created.error);
      setCreating(false);
      return;
    }

    const updated = await addTriviaIdToClient(user.id, created.triviaId!);
    if (!updated.success) {
      setErrorMsg('Failed to update client trivia list: ' + updated.error);
      setCreating(false);
      return;
    }

    const games = await getMyTriviaGames(user.id);
    setTriviaGames(games);

    setNewTitle('');
    setShowModal(false);
    setCreating(false);
  };

  const handleDeleteTrivia = async (id: string) => {
    setDeleteErrorMsg('');
    setDeletingId(id);

    const user = await getAuthenticatedUser();
    if (!user) {
      setDeleteErrorMsg('User not authenticated.');
      setDeletingId(null);
      return;
    }

    const result = await deleteTriviaById(id);

    if (!result.success) {
      setDeleteErrorMsg('Failed to delete trivia: ' + result.error);
      setDeletingId(null);
      return;
    }

    // Refresh list after delete
    const games = await getMyTriviaGames(user.id);
    setTriviaGames(games);
    setDeletingId(null);
  };

  return (
    <div className="cet-container">
      <h1 className="cet-title">Create, Edit, or Share a Trivia!</h1>
      <p className="cet-subtext">
        Design new trivia games or update ones you’ve already created.
      </p>

      {errorMsg && <p className="cet-error">{errorMsg}</p>}
      {deleteErrorMsg && <p className="cet-error">{deleteErrorMsg}</p>}

      <button className="cet-back-button" onClick={() => router.push('./dashboard')}>
        ← Back to Dashboard
      </button>

      {loading ? (
        <p>Loading your trivia games...</p>
      ) : triviaGames.length === 0 ? (
        <p>You haven’t created any trivia games yet.</p>
      ) : (
        <div className="cet-sections">
          {triviaGames.map((game) => (
            <div key={game.id} className="cet-card">
              <h2>{game.title}</h2>
              <p>Status: {game.status}</p>
              <div className="cet-card-actions">
                {game.status !== 'completed' && (
                  <button onClick={() => router.push(`./edit/${game.id}`)}>✏️ Edit</button>
                )}
                <button
                  onClick={() => handleDeleteTrivia(game.id)}
                  disabled={deletingId === game.id}
                >
                  {deletingId === game.id ? 'Deleting...' : '🗑️ Delete'}
                </button>
                <button
                  disabled={game.status !== 'completed'}
                  onClick={() => router.push(`./shareTrivia/${game.id}`)}
                >
                  📤 Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="cet-create-btn" onClick={() => setShowModal(true)}>
        + Create New Trivia
      </button>

      {showModal && (
        <div className="cet-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="cet-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Trivia</h2>
            <input
              type="text"
              placeholder="Trivia Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="cet-input"
              disabled={creating}
            />
            {errorMsg && <p className="cet-error">{errorMsg}</p>}
            <div className="cet-modal-actions">
              <button onClick={() => setShowModal(false)} disabled={creating}>
                Cancel
              </button>
              <button onClick={handleCreateTrivia} disabled={creating}>
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}