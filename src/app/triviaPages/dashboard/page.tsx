'use client';

import { useRouter } from 'next/navigation';
import { handleSignOut } from '../../supabasefuncs/helperSupabaseFuncs';
import ProfilePicture from '../../components/ProfilePicture';
import '../../cssStyling/dashboardstyling.css';

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="dashboard-container">
      {/* Displays user profile picture (clickable so that user can change profile pic later */}
      <ProfilePicture clickable={true} />

      <h1 className="dashboard-title">Welcome to TriviaShare Dashboard</h1>

      {/* Main action cards: Create/Edit or Play shared trivias */}
      <div className="dashboard-sections">
        <div
          className="dashboard-card"
          onClick={() => router.push('./createEditTrivias')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && router.push('./createEditTrivias')}
        >
          <h2>Create, Edit, or Share a Trivia Game</h2>
          <p>Build new trivia or update existing ones.</p>
        </div>

        <div
          className="dashboard-card"
          onClick={() => router.push('./viewSharedTrivias')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && router.push('./viewSharedTrivias')}
        >
          <h2>Play Trivias Shared With Me</h2>
          <p>Try trivia games shared by friends or other users.</p>
        </div>
      </div>

      {/* Logs the user out and redirects to the home page */}
      <button
        onClick={() => handleSignOut(() => router.push('../..'))}
        className="signout-button"
      >
        Sign Out
      </button>
    </div>
  );
}