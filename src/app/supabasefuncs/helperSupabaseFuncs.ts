import { supabase } from '../supabase/supabaseClient';

export const CLIENTS_TABLE = 'clients';
export const COL_MY_TRIVIA = 'my_trivia_games';
export const COL_SHARED_TRIVIA = 'trivia_games_shared_w_me';
export const COL_CREATOR_ID = 'creator_id';
export const COL_USERNAME = 'username';
export const COL_PROFILE_PIC = 'profile_pic_url';

export const TRIVIA_TABLE = 'triviagames';
export const COL_TRIVIA_ID = 'id';
export const COL_TRIVIA_TITLE = 'title';
export const COL_TRIVIA_STATUS = 'status';
export const COL_TRIVIA_CONTENT = 'content';
export const COL_TRIVIA_CREATED_AT = 'created_at';

const SELECT_CLIENT_FIELDS = [ COL_CREATOR_ID, COL_USERNAME, COL_PROFILE_PIC ].join(', ');
const AVATAR_BUCKET = 'avatars';

export type ShareRecipient = {
  id: string;
  username: string;
  profile_pic_url: string | null;
};

function toShareRecipient(user: any): ShareRecipient {
    return {
        id: user[COL_CREATOR_ID],
        username: user[COL_USERNAME],
        profile_pic_url: user[COL_PROFILE_PIC],
    };
}

export async function getAuthenticatedUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function fetchMatchingUsersBySimilarName(
    name: string
): Promise<ShareRecipient[]> {
    const { data, error } = await supabase
        .from(CLIENTS_TABLE)
        .select(SELECT_CLIENT_FIELDS)
        .ilike(COL_USERNAME, `${name}%`);

    if (error || !data) {
        console.error('Error fetching users:', error);
        return [];
    }

    return data.map(toShareRecipient);
}

export async function getUSERProfile(userId: string) {
  const { data, error } = await supabase
    .from(CLIENTS_TABLE)
    .select('*')
    .eq(COL_CREATOR_ID, userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function uploadToUSERProfilePics(
  userID: string,
  filePath: string,
  file: File,
  oldFilePath?: string
): Promise<boolean> {
  // 1. Delete old profile pic if it exists
  if (oldFilePath) {
    const { error: deleteError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .remove([oldFilePath]);

    if (deleteError) {
      console.error('Error deleting old user profile pic:', deleteError);
      // You can choose to return false or just log and continue
      // return false;
    }
  }

  // 2. Upload new profile pic
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return false;
  }

  // 3. Update DB with new file path
  const { error: updateError } = await supabase
    .from(CLIENTS_TABLE)
    .update({ profile_pic_url: filePath })
    .eq(COL_CREATOR_ID, userID);

  if (updateError) {
    console.error('DB update failed:', updateError);
    return false;
  }

  return true;
}

export async function getAllTriviaSharedWithUser(user: ShareRecipient): Promise<string[] | null> {
    const { data, error } = await supabase
        .from(CLIENTS_TABLE)
        .select(COL_SHARED_TRIVIA)
        .eq(COL_CREATOR_ID, user.id)
        .single();

    if (error || !data) return null;

    return data[COL_SHARED_TRIVIA] || [];
}

export async function updateTriviaSharedWithUser(userId: string, updated: string[]): Promise<boolean> {
  const { error } = await supabase
    .from(CLIENTS_TABLE)
    .update({ [COL_SHARED_TRIVIA]: updated })
    .eq(COL_CREATOR_ID, userId);

  return !error;
}

export async function generateUSERProfilePicSignedUrl(filePath: string, expiresInSeconds = 60): Promise<string | null> {
  const { data, error } = await supabase
    .storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    console.error('Error creating signed URL:', error);
    return null;
  }

  return data.signedUrl;
}


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
    .select('*')
    .in(COL_TRIVIA_ID, triviaIds)
    .order(COL_TRIVIA_CREATED_AT, { ascending: true });

  if (triviaError || !triviaData) return [];

  return triviaData;
}

export async function createTriviaGame(trivia: {
  creator_id: string;
  title: string;
  status: string;
  content: any;
}): Promise<{ success: boolean; triviaId?: string; createdAt?: string; error?: string }> {
  const { data, error } = await supabase
    .from(TRIVIA_TABLE)
    .insert([trivia])
    .select('id, created_at')
    .single();

  if (error || !data) return { success: false, error: error?.message || 'Unknown error' };
  return { success: true, triviaId: data.id, createdAt: data.created_at };
}

export async function addTriviaIdToClient(
  userId: string,
  triviaId: string
): Promise<{ success: boolean; error?: string }> {
  const { data: clientData, error: clientError } = await supabase
    .from(CLIENTS_TABLE)
    .select(COL_MY_TRIVIA)
    .eq(COL_CREATOR_ID, userId)
    .single();

  if (clientError || !clientData) return { success: false, error: clientError?.message || 'Client not found' };

  const currentList: string[] = clientData[COL_MY_TRIVIA] || [];
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
    .select('*')
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

  if (error) throw new Error(error.message);
  return data;
}

export async function updateTriviaStatus(triviaId: string, status: string) {
  const { data, error } = await supabase
    .from(TRIVIA_TABLE)
    .update({ status })
    .eq('id', triviaId);

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTriviaById(triviaId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TRIVIA_TABLE)
    .delete()
    .eq(COL_TRIVIA_ID, triviaId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}