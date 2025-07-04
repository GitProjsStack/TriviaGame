'use client';

import { useRouter } from 'next/navigation';
import { handleSignOut } from '../../supabasefuncs/helperSupabaseFuncs';
import { BUTTON_LABELS } from '@/app/constants/gameSettings';
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
            <h2>{BUTTON_LABELS.HOW_TO_PLAY.title}</h2>
            <p>{BUTTON_LABELS.HOW_TO_PLAY.description}</p>
          </div>
        </div>

        {/* Row for side-by-side action cards */}
        <div className="dashboard-row">
          <div
            className="dashboard-card half-width"
            onClick={() => router.push('./createEditTrivias')}
          >
            <h2>{BUTTON_LABELS.CREATE_EDIT_SHARE.title}</h2>
            <p>{BUTTON_LABELS.CREATE_EDIT_SHARE.description}</p>
          </div>

          <div
            className="dashboard-card half-width"
            onClick={() => router.push('./viewSharedTrivias')}
          >
            <h2>{BUTTON_LABELS.PLAY_SHARED.title}</h2>
            <p>{BUTTON_LABELS.PLAY_SHARED.description}</p>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={() => handleSignOut(() => router.push('../..'))}
        className="signout-button"
      >
        {BUTTON_LABELS.SIGN_OUT}
      </button>
    </div>
  );
}