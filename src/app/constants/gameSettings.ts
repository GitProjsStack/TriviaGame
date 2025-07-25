export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 10;

export const BUTTON_LABELS = {
    CREATE_EDIT_SHARE: {
        title: 'Create, Edit, or Share a Trivia Game',
        description: 'Build new trivia or update existing ones.'
    },
    PLAY_SHARED: {
        title: 'Play Trivias Shared With Me',
        generic: 'Play Shared Trivias',
        description: 'Try trivia games shared by friends or other users.',
        generic_description: 'Choose from a list of trivia games shared with you and start playing!'
    },
    HOW_TO_PLAY: {
        title: 'How to Play & Rules',
        description: 'Learn how TriviaShare works: creating, sharing, playing, stealing, and more.'
    },
    SIGN_OUT: 'Sign Out',
    BACK_TO_DASHBOARD: '← Back to Dashboard',
    GIVE_UP: 'I Give Up',
    CANCEL: 'Cancel',
};

export const EDIT_TRIVIA_LIMITS = {
    MAX_POINTS_PER_QUESTION: 10000,
    MIN_POINTS_PER_QUESTION: 1,
    MAX_CHOICES: 6,
    MIN_CHOICES: 2,
    MAX_QUESTIONS_PER_CATEGORY: 10,
    MIN_QUESTIONS_PER_CATEGORY: 1,
    MAX_CATEGORIES: 10,
    MIN_CATEGORIES: 1,
    COLORS: [
        '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE',
        '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE',
        '#B2FF59', '#FFD740', '#FFAB40', '#FF6E40'
    ]
};