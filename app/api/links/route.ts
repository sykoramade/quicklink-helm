import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSlug, validateCustomSlug } from '@/lib/slug';
import { validateUrl } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all links for this user with click counts
    const { data: links, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get click counts for each link
    const linksWithClicks = await Promise.all(
      (links || []).map(async (link) => {
        const { data: clicks } = await supabase
          .from('clicks')
          .select('id', { count: 'exact' })
          .eq('link_id', link.id);

        return {
          ...link,
          click_count: clicks?.length || 0,
        };
      })
    );

    return NextResponse.json({ data: linksWithClicks });
  } catch (error: any) {
    console.error('GET /api/links error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit
    const rateLimitResult = checkRateLimit(user.id);
    if (rateLimitResult.limited) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Max 60 links per hour.',
          remaining: 0,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { long_url, custom_slug } = body;

    // Validate long URL
    if (!long_url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const urlValidation = validateUrl(long_url);
    if (!urlValidation.valid) {
      return NextResponse.json(
        { error: urlValidation.error || 'Invalid URL' },
        { status: 400 }
      );
    }

    // Determine slug
    let slug = custom_slug;
    if (slug) {
      const slugValidation = validateCustomSlug(slug);
      if (!slugValidation.valid) {
        return NextResponse.json(
          { error: slugValidation.error || 'Invalid slug' },
          { status: 400 }
        );
      }
    } else {
      slug = createSlug();
    }

    // Insert into database
    const { data, error } = await supabase
      .from('links')
      .insert([
        {
          user_id: user.id,
          slug,
          long_url,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'This slug is already taken' },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        id: data.id,
        slug: data.slug,
        long_url: data.long_url,
        created_at: data.created_at,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/links error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
