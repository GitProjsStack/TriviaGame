import { supabase } from '../supabase/supabaseClient';

export const CLIENTS_TABLE = 'clients';
export const TRIVIA_TABLE = 'triviagames';
export const COL_CREATOR_ID = 'creator_id';
export const COL_TITLE = 'title';
export const COL_STATUS = 'status';
export const COL_CONTENT = 'content';
export const COL_MY_TRIVIA = 'my_trivia_games';
export const ALL = '*';

// Get current logged-in user
export async function getAuthenticatedUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// Get list of Trivia games for a user
export async function getMyTriviaGames(userId: string) {
  const { data: clientData, error: clientError } = await supabase
    .from(CLIENTS_TABLE)
    .select(COL_MY_TRIVIA)
    .eq(COL_CREATOR_ID, userId)
    .single();

  if (clientError || !clientData || !clientData[COL_MY_TRIVIA]) return [];

  const triviaIds: string[] = clientData[COL_MY_TRIVIA];
  if (triviaIds.length === 0) return [];

  const { data: triviaData, error: triviaError } = await supabase
    .from(TRIVIA_TABLE)
    .select('id, title, status, content')
    .in('id', triviaIds);

  if (triviaError || !triviaData) return [];

  return triviaData;
}

// Create a new empty trivia game and return inserted ID
export async function createTriviaGame(trivia: {
  creator_id: string;
  title: string;
  status: string;
  content: any;
}): Promise<{ success: boolean; triviaId?: string; error?: string }> {
  const { data, error } = await supabase.from(TRIVIA_TABLE).insert([trivia]).select('id').single();

  if (error || !data) return { success: false, error: error?.message || 'Unknown error' };
  return { success: true, triviaId: data.id };
}

// Add a trivia id to client's my_trivia_games array
export async function addTriviaIdToClient(
  userId: string,
  triviaId: string
): Promise<{ success: boolean; error?: string }> {
  // Get current my_trivia_games array
  const { data: clientData, error: clientError } = await supabase
    .from(CLIENTS_TABLE)
    .select(COL_MY_TRIVIA)
    .eq(COL_CREATOR_ID, userId)
    .single();

  if (clientError || !clientData) return { success: false, error: clientError?.message || 'Client not found' };

  const currentList: string[] = clientData[COL_MY_TRIVIA] || [];

  // Avoid duplicates
  if (currentList.includes(triviaId)) return { success: true };

  const updatedList = [...currentList, triviaId];

  const { error: updateError } = await supabase
    .from(CLIENTS_TABLE)
    .update({ [COL_MY_TRIVIA]: updatedList })
    .eq(COL_CREATOR_ID, userId);

  if (updateError) return { success: false, error: updateError.message };
  return { success: true };
}

export async function getTriviaById(id: string) {
  const { data, error } = await supabase
    .from(TRIVIA_TABLE)
    .select(ALL)
    .eq('id', id)
    .single();

  if (error || !data) return { error: error?.message || 'Trivia not found', trivia: null };
  return { trivia: data, error: null };
}

export async function updateTriviaContent(triviaId: string, content: any) {
  const { data, error } = await supabase
    .from(TRIVIA_TABLE)
    .update({ content })
    .eq('id', triviaId)
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}