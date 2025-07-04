'use client';

import { useRouter } from 'next/navigation';
import { handleSignOut } from '../../supabasefuncs/helperSupabaseFuncs';
import ProfilePicture from '../../components/ProfilePicture';
import '../../cssStyling/dashboardstyling.css';

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="dashboard-container">
      {/* Displays user profile picture */}
      <ProfilePicture clickable={true} />

      <h1 className="dashboard-title">Welcome to TriviaShare Dashboard</h1>

      {/* "How to Play" card */}
      <div className="dashboard-sections">
        <div className="dashboard-row">
          <div
            className="dashboard-card"
            style={{ maxWidth: '420px' }}
            onClick={() => router.push('./howToPlay')}
          >
            <h2>How to Play & Rules</h2>
            <p>Learn how TriviaShare works: creating, sharing, playing, stealing, and more.</p>
          </div>
        </div>

        {/* Row for side-by-side action cards */}
        <div className="dashboard-row">
          <div
            className="dashboard-card half-width"
            onClick={() => router.push('./createEditTrivias')}
          >
            <h2>Create, Edit, or Share a Trivia Game</h2>
            <p>Build new trivia or update existing ones.</p>
          </div>

          <div
            className="dashboard-card half-width"
            onClick={() => router.push('./viewSharedTrivias')}
          >
            <h2>Play Trivias Shared With Me</h2>
            <p>Try trivia games shared by friends or other users.</p>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={() => handleSignOut(() => router.push('../..'))}
        className="signout-button"
      >
        Sign Out
      </button>
    </div>
  );
}