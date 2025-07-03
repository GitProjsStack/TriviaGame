'use client';

import { useRouter } from 'next/navigation';
import '../../cssStyling/dashboardstyling.css';

export default function ViewSharedTrivias() {
  const router = useRouter();

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Play Shared Trivias</h1>
      <p className="dashboard-subtext">
        Choose from a list of trivia games shared with you and start playing!
      </p>

      <button className="dashboard-back-button" onClick={() => router.push('./dashboard')}>
        ← Back to Dashboard
      </button>
    </div>
  );
}