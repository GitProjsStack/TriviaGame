export interface Question {
    question: string;
    choices: Record<string, string>;
    answer: string;
    points: number;
}

export interface TriviaContent {
    [category: string]: Question[];
}

export interface TriviaGame {
    id: string;
    title: string;
    status: string;
    content: TriviaContent;
}

export type ShareRecipient = {
    id: string;
    username: string;
    profile_pic_url: string | null;
};

export type TriviaParams = {
    id: string;
};

export type SharedTrivia = {
  triviaId: string;
  title: string;
  creatorId: string;
  sharerUsername: string;
  sharerProfilePicUrl: string | null;
};