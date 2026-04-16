import { SupabaseClient } from '@supabase/supabase-js';

export interface DailyClicks {
  date: string;
  count: number;
}

/**
 * Record a click for a link
 */
export async function recordClick(
  client: SupabaseClient,
  linkId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await client.from('clicks').insert([
    {
      link_id: linkId,
    },
  ]);

  if (error) {
    console.error('Failed to record click:', error);
    // Don't fail the redirect for click recording errors
    return { success: true };
  }

  return { success: true };
}

/**
 * Get total clicks for a link
 */
export async function getTotalClicks(
  client: SupabaseClient,
  linkId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  const { data, error } = await client
    .from('clicks')
    .select('id', { count: 'exact' })
    .eq('link_id', linkId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, count: data?.length || 0 };
}

/**
 * Get clicks grouped by day for the last 7 days
 */
export async function getClicksByDay(
  client: SupabaseClient,
  linkId: string
): Promise<{ success: boolean; data?: DailyClicks[]; error?: string }> {
  // Get clicks for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await client
    .from('clicks')
    .select('clicked_at')
    .eq('link_id', linkId)
    .gte('clicked_at', sevenDaysAgo.toISOString())
    .order('clicked_at', { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  // Group by day
  const byDay = new Map<string, number>();

  for (const click of data || []) {
    const date = new Date(click.clicked_at);
    const dateStr = date.toISOString().split('T')[0];
    byDay.set(dateStr, (byDay.get(dateStr) || 0) + 1);
  }

  // Create array for last 7 days (including days with 0 clicks)
  const result: DailyClicks[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      count: byDay.get(dateStr) || 0,
    });
  }

  return { success: true, data: result };
}
