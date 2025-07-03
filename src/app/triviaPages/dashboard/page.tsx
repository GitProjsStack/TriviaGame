'use client';

import { useRouter } from 'next/navigation';
import ProfilePicture from '../../components/ProfilePicture';
import '../../cssStyling/dashboardstyling.css';

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="dashboard-container">
      <ProfilePicture />
      <h1 className="dashboard-title">Welcome to TriviaShare Dashboard</h1>

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
    </div>
  );
}