'use client';

import { useRouter } from 'next/navigation';
import '../../cssStyling/dashboardstyling.css';

export default function CreateEditTrivias() {
  const router = useRouter();

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Create or Edit Trivia</h1>
      <p className="dashboard-subtext">
        Design new trivia games or make changes to ones you’ve already made.
      </p>

      <button className="dashboard-back-button" onClick={() => router.push('./dashboard')}>
        ← Back to Dashboard
      </button>
    </div>
  );
}