'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuthenticatedUser,
  getSharedTriviasWithSharerInfo,
  removeTriviaFromSharedWithMe,
  generateUSERProfilePicSignedUrl,
} from '@/app/supabasefuncs/helperSupabaseFuncs';
import { SharedTrivia } from '@/app/interfaces/triviaTypes';
import PlayTriviaPage from '../playTrivia/page';
import { BUTTON_LABELS } from '@/app/constants/gameSettings';

export default function ViewSharedTrivias() {
  const router = useRouter();
  const [sharedTrivias, setSharedTrivias] = useState<SharedTrivia[]>([]);
  const [loading, setLoading] = useState(true);
  const [playLoadingId, setPlayLoadingId] = useState<string | null>(null);
  const [playingTriviaId, setPlayingTriviaId] = useState<string | null>(null);

  const fetchSharedTrivias = async () => {
    setLoading(true);
    const user = await getAuthenticatedUser();
    if (!user) {
      router.push('/login');
      return;
    }
    const data = await getSharedTriviasWithSharerInfo(user.id);

    // Get signed profile picture URLs (if user uploaded one)
    const updatedData = await Promise.all(
      data.map(async (trivia) => {
        if (trivia.sharerProfilePicUrl) {
          const signedUrl = await generateUSERProfilePicSignedUrl(trivia.sharerProfilePicUrl, 60 * 60); // 1 hour expiry
          return { ...trivia, sharerProfilePicUrl: signedUrl };
        }
        return trivia;
      })
    );

    setSharedTrivias(updatedData);
    setLoading(false);
  };

  useEffect(() => {
    fetchSharedTrivias();
  }, []);

  const handleDelete = async (triviaId: string) => {
    const user = await getAuthenticatedUser();
    if (!user) return;

    const success = await removeTriviaFromSharedWithMe(user.id, triviaId);
    if (success) {
      setSharedTrivias((prev) => prev.filter((t) => t.triviaId !== triviaId));
    } else {
      alert('Failed to remove trivia.');
    }
  };

  if (playingTriviaId) {
    return (
      <div className="dashboard-container">
        <PlayTriviaPage id={playingTriviaId} onClose={() => setPlayingTriviaId(null)} />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">{BUTTON_LABELS.PLAY_SHARED.generic}</h1>
      <p className="dashboard-subtext">
        {BUTTON_LABELS.PLAY_SHARED.generic_description}
      </p>

      <button className="dashboard-back-button" onClick={() => router.push('./dashboard')}>
        {BUTTON_LABELS.BACK_TO_DASHBOARD}
      </button>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner" />
        </div>
      ) : sharedTrivias.length === 0 ? (
        <p>No trivia games shared with you yet.</p>
      ) : (
        <div className="shared-trivia-list">
          {sharedTrivias.map(({ triviaId, title, sharerUsername, sharerProfilePicUrl }) => (
            <div key={triviaId} className="trivia-card-horizontal">
              <div className="trivia-left">
                {sharerProfilePicUrl ? (
                  <img
                    src={sharerProfilePicUrl}
                    alt={`${sharerUsername}'s profile`}
                    className="sharer-profile-pic"
                  />
                ) : (
                  <div className="sharer-profile-placeholder">
                    {sharerUsername.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="trivia-text-group">
                  <span className="sharer-username">{sharerUsername}</span>
                  <span className="trivia-title">{title}</span>
                </div>
              </div>

              <div className="trivia-right">
                <button
                  className="rounded-btn play"
                  onClick={() => {
                    setPlayLoadingId(triviaId);
                    setTimeout(() => {
                      setPlayingTriviaId(triviaId); // NOT router.push
                    }, 1000);
                  }}
                >
                  {playLoadingId === triviaId ? <div className="mini-spinner" /> : '▶ Play'}
                </button>
                <button
                  className="rounded-btn delete"
                  onClick={() => handleDelete(triviaId)}
                >
                  ✕ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}