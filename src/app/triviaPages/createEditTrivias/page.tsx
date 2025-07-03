'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuthenticatedUser,
  getMyTriviaGames,
  createTriviaGame,
  addTriviaIdToClient,
} from '../../supabasefuncs/helperSupabaseFuncs';
import '../../cssStyling/createEditTrivias.css';

interface TriviaGame {
  id: string;
  title: string;
  status: string;
  content: any;
}

export default function CreateEditTrivias() {
  const router = useRouter();
  const [triviaGames, setTriviaGames] = useState<TriviaGame[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [creating, setCreating] = useState(false);

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

  const canBeShared = (content: any): boolean => {
    if (!content || !Array.isArray(content.questions)) return false;
    const categoryMap: Record<string, number> = {};
    content.questions.forEach((q: any) => {
      categoryMap[q.category] = (categoryMap[q.category] || 0) + 1;
    });

    const counts = Object.values(categoryMap);
    const isUniform = counts.every((count) => count === counts[0]);

    return isUniform && counts.length > 0 && counts[0] > 0;
  };

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

    // Create empty trivia row
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

    // Update client's my_trivia_games list
    const updated = await addTriviaIdToClient(user.id, created.triviaId!);
    if (!updated.success) {
      setErrorMsg('Failed to update client trivia list: ' + updated.error);
      setCreating(false);
      return;
    }

    // Refresh list with new trivia included
    const games = await getMyTriviaGames(user.id);
    setTriviaGames(games);

    setNewTitle('');
    setShowModal(false);
    setCreating(false);
  };

  return (
    <div className="cet-container">
      <h1 className="cet-title">Create, Edit, or Share a Trivia!</h1>
      <p className="cet-subtext">
        Design new trivia games or update ones you’ve already created.
      </p>

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
                <button onClick={() => console.log(`Delete ${game.id}`)}>🗑️ Delete</button>
                <button
                  disabled={game.status !== 'completed'}
                  onClick={() => console.log(`Share ${game.id}`)}
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