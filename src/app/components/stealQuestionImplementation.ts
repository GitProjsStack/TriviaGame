import { TPlayer } from '../interfaces/triviaTypes';

let stealQueue: number[] = [];
let stealIndex = 0;
let originalTurnIndex = 0;

export function initStealQueue(currentIndex: number, playerCount: number) {
  originalTurnIndex = currentIndex;
  stealQueue = [];
  for (let i = 1; i < playerCount; i++) {
    stealQueue.push((currentIndex + i) % playerCount);
  }
  stealIndex = 0;
}

export function getCurrentStealer() {
  return stealQueue[stealIndex];
}

export function advanceStealTurn() {
  stealIndex++;
}

export function isStealOver() {
  return stealIndex >= stealQueue.length;
}

export function evaluateStealAnswer(
  players: TPlayer[],
  points: number,
  currentStealerIndex: number,
  isCorrect: boolean
): {
  updatedPlayers: TPlayer[];
  message: string;
  nextTurnIndex: number;
  isStealSuccess: boolean;
} {
  if (!isCorrect) {
    return {
      updatedPlayers: players,
      message: 'Incorrect steal. Moving onto the next player ...',
      nextTurnIndex: -1,
      isStealSuccess: false,
    };
  }

  const updatedPlayers = [...players];
  updatedPlayers[currentStealerIndex].score += points;

  const nextTurnIndex = (originalTurnIndex + 1) % players.length;

  return {
    updatedPlayers,
    message: 'Correct steal! Points awarded.',
    nextTurnIndex,
    isStealSuccess: true,
  };
}