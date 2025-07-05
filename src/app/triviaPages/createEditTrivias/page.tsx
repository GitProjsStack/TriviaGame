'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditTrivia from '../edit/page';
import ShareTrivia from '../shareTrivia/page';
import { BUTTON_LABELS } from '@/app/constants/gameSettings';
import {
  getAuthenticatedUser,
  getMyTriviaGames,
  createTriviaGame,
  addTriviaIdToClient,
  deleteTriviaById,
} from '../../supabasefuncs/helperSupabaseFuncs';
import { TriviaGame } from '../../interfaces/triviaTypes';

const CREATE_NEW_TRIVIA = 'Create New Trivia';

export default function CreateEditTrivias() {
  const router = useRouter();
  const [triviaGames, setTriviaGames] = useState<TriviaGame[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingTriviaId, setEditingTriviaId] = useState<string | null>(null);
  const [sharingTriviaId, setSharingTriviaId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load trivia games created by the logged-in user on page mount
  useEffect(() => {
    refreshTriviaList();
  }, []);

  // Handle logic for creating a new trivia
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

    // Create a blank trivia game with default "in progress" status
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

    // Add the new trivia ID to the user's `clients` record
    const updated = await addTriviaIdToClient(user.id, created.triviaId!);
    if (!updated.success) {
      setErrorMsg('Failed to update client trivia list: ' + updated.error);
      setCreating(false);
      return;
    }

    // Refresh trivia list after creation
    const games = await getMyTriviaGames(user.id);
    setTriviaGames(games);

    // Reset modal/input states
    setNewTitle('');
    setShowModal(false);
    setCreating(false);
  };

  // Handle logic for deleting a trivia game
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

    // Reload trivia list after successful delete
    const games = await getMyTriviaGames(user.id);
    setTriviaGames(games);
    setDeletingId(null);
  };

  const refreshTriviaList = async () => {
    setLoading(true);
    const user = await getAuthenticatedUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const games = await getMyTriviaGames(user.id);
    setTriviaGames(games);
    setLoading(false);
  };

  const handleCloseEdit = async () => {
    setEditingTriviaId(null);
    await refreshTriviaList(); // fetch again from Supabase
  };

  const handleCloseShare = async () => {
    setSharingTriviaId(null);
    await refreshTriviaList(); // fetch again from Supabase
  };

  return (
    <div className="cet-container">
      {editingTriviaId ? (
        <EditTrivia id={editingTriviaId} onClose={handleCloseEdit} />
      ) : sharingTriviaId ? (
        <ShareTrivia id={sharingTriviaId} onClose={handleCloseShare} />
      ) : (
        <>
          <h1 className="cet-title">{BUTTON_LABELS.CREATE_EDIT_SHARE.title}!</h1>
          <p className="cet-subtext">
            Design new trivia games or update ones you’ve already created.
          </p>

          {errorMsg && <p className="cet-error">{errorMsg}</p>}
          {deleteErrorMsg && <p className="cet-error">{deleteErrorMsg}</p>}

          <button className="cet-back-button" onClick={() => router.push('./dashboard')}>
            {BUTTON_LABELS.BACK_TO_DASHBOARD}
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
                      <button onClick={() => setEditingTriviaId(game.id)}>✏️ Edit</button>
                    )}
                    <button
                      onClick={() => handleDeleteTrivia(game.id)}
                      disabled={deletingId === game.id}
                    >
                      {deletingId === game.id ? 'Deleting...' : '🗑️ Delete'}
                    </button>
                    <button
                      disabled={game.status !== 'completed'}
                      onClick={() => setSharingTriviaId(game.id)}
                    >
                      📤 Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="cet-create-btn" onClick={() => setShowModal(true)}>
            + {CREATE_NEW_TRIVIA}
          </button>

          {showModal && (
            <div className="cet-modal-overlay" onClick={() => setShowModal(false)}>
              <div className="cet-modal" onClick={(e) => e.stopPropagation()}>
                <h2>{CREATE_NEW_TRIVIA}</h2>
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
                    {BUTTON_LABELS.CANCEL}
                  </button>
                  <button onClick={handleCreateTrivia} disabled={creating}>
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}