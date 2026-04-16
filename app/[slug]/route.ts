import { NextRequest, NextResponse } from 'next/server';
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // We can't set cookies in a route handler response directly
              // but we create the client anyway for consistency
            });
          },
        },
      }
    );

    // Look up the link
    const { data: link, error } = await supabase
      .from('links')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !link) {
      notFound();
    }

    // Record the click asynchronously (fire and forget)
    // Don't await this to keep redirect fast
    const recordClick = async () => {
      try {
        await supabase
          .from('clicks')
          .insert([{ link_id: link.id }]);
      } catch (err: any) {
        console.error('Failed to record click:', err);
      }
    };

    recordClick();

    // Redirect to the long URL
    return NextResponse.redirect(link.long_url, {
      status: 302,
    });
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
