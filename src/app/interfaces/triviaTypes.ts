// Represents a single trivia question with multiple choices
export interface Question {
    question: string;                  // The question text
    choices: Record<string, string>;  // Choice letter (A, B, C, ...) mapped to answer text
    answer: string;                   // Correct answer letter (e.g., 'A')
    points: number;                   // Points awarded for correct answer
}

// Trivia content organized by category name, each holding an array of Questions
export interface TriviaContent {
    [category: string]: Question[];  // E.g., "Movies": Question[]
}

// Overall trivia game info stored in DB or state
export interface TriviaGame {
    id: string;                      // Unique trivia game ID
    title: string;                   // Trivia game title
    status: string;                  // e.g., 'in progress', 'completed'
    content: TriviaContent;          // All questions organized by category
}

// Choice object for UI components or internal game logic
export interface TChoice {
  text: string;                     // Choice text displayed
  isCorrect: boolean;               // Flag if this choice is the correct answer
}

// Question object optimized for frontend or game logic usage
export interface TQuestion {
  question: string;                 // Question text
  points: number;                  // Points for correct answer
  choices: TChoice[];              // Array of choices with correctness flag
}

// Category containing a list of TQuestions for UI display or processing
export interface TCategory {
  name: string;                    // Category name (e.g., "Animals")
  questions: TQuestion[];          // List of questions under this category
}

// Player info for game session tracking or scoreboard
export interface TPlayer {
  id: number;                     // Unique player ID (e.g., session-based)
  score: number;                  // Current player score
  name: string;                  // Player display name
}

// Basic user info for sharing trivia or social features
export type ShareRecipient = {
    id: string;                   // User ID
    username: string;             // Username for display
    profile_pic_url: string | null;  // URL of user's profile picture (can be null)
};

// Represents a trivia game shared with the current user along with sharer info
export type SharedTrivia = {
  triviaId: string;               // Shared trivia ID
  title: string;                  // Trivia title
  creatorId: string;              // Creator user ID
  sharerUsername: string;         // Username of person who shared the trivia
  sharerProfilePicUrl: string | null;  // Profile picture URL of sharer
};

export type TriviaParams = {
    id: string;
    onClose: () => void;
};