import { SupabaseClient } from '@supabase/supabase-js';

export interface Link {
  id: string;
  user_id: string;
  slug: string;
  long_url: string;
  created_at: string;
}

/**
 * Create a new link
 */
export async function createLink(
  client: SupabaseClient,
  userId: string,
  slug: string,
  longUrl: string
): Promise<{ success: boolean; data?: Link; error?: string }> {
  const { data, error } = await client
    .from('links')
    .insert([
      {
        user_id: userId,
        slug,
        long_url: longUrl,
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.message.includes('duplicate key')) {
      return { success: false, error: 'This slug is already taken' };
    }
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Get all links for a user
 */
export async function getUserLinks(
  client: SupabaseClient,
  userId: string
): Promise<{ success: boolean; data?: Link[]; error?: string }> {
  const { data, error } = await client
    .from('links')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data || [] };
}

/**
 * Get a link by slug
 */
export async function getLinkBySlug(
  client: SupabaseClient,
  slug: string
): Promise<{ success: boolean; data?: Link; error?: string }> {
  const { data, error } = await client
    .from('links')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return { success: false, error: 'Link not found' };
    }
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Delete a link
 */
export async function deleteLink(
  client: SupabaseClient,
  userId: string,
  linkId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await client
    .from('links')
    .delete()
    .eq('id', linkId)
    .eq('user_id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get link with click count
 */
export async function getLinkWithClicks(
  client: SupabaseClient,
  linkId: string,
  userId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const { data: link, error: linkError } = await client
    .from('links')
    .select('*')
    .eq('id', linkId)
    .eq('user_id', userId)
    .single();

  if (linkError) {
    return { success: false, error: linkError.message };
  }

  const { data: clicks, error: clickError } = await client
    .from('clicks')
    .select('id')
    .eq('link_id', linkId);

  if (clickError) {
    return { success: false, error: clickError.message };
  }

  return {
    success: true,
    data: {
      ...link,
      click_count: clicks?.length || 0,
    },
  };
}
