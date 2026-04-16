'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Analytics } from '@/components/Analytics';
import Link from 'next/link';

interface LinkData {
  id: string;
  slug: string;
  long_url: string;
  created_at: string;
}

interface AnalyticsData {
  date: string;
  count: number;
}

export default function AnalyticsPage() {
  const params = useParams();
  const id = params.id as string;
  const [link, setLink] = useState<LinkData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth');
        return;
      }

      try {
        // Fetch link details
        const { data: linkData, error: linkError } = await supabase
          .from('links')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (linkError || !linkData) {
          setError('Link not found');
          setLoading(false);
          return;
        }

        setLink(linkData);

        // Fetch click count
        const { data: clickData, error: clickError } = await supabase
          .from('clicks')
          .select('id', { count: 'exact' })
          .eq('link_id', id);

        if (!clickError && clickData) {
          setTotalClicks(clickData.length);
        }

        // Fetch analytics data (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: analyticsData, error: analyticsError } = await supabase
          .from('clicks')
          .select('clicked_at')
          .eq('link_id', id)
          .gte('clicked_at', sevenDaysAgo.toISOString())
          .order('clicked_at', { ascending: true });

        if (!analyticsError && analyticsData) {
          // Group by day
          const byDay = new Map<string, number>();

          for (const click of analyticsData) {
            const date = new Date(click.clicked_at);
            const dateStr = date.toISOString().split('T')[0];
            byDay.set(dateStr, (byDay.get(dateStr) || 0) + 1);
          }

          // Create array for last 7 days
          const result: AnalyticsData[] = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            result.push({
              date: dateStr,
              count: byDay.get(dateStr) || 0,
            });
          }

          setAnalytics(result);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error || 'Link not found'}</p>
            <Link
              href="/dashboard"
              className="text-blue-600 hover:underline font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${link.slug}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:underline font-medium mb-6 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Analytics: {link.slug}
          </h1>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Short URL</p>
              <code className="text-lg font-mono text-blue-600 block break-all">
                {shortUrl}
              </code>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Total Clicks</p>
              <p className="text-3xl font-bold text-blue-600">{totalClicks}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Destination</p>
            <a
              href={link.long_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline block break-all"
            >
              {link.long_url}
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Click History (7 Days)
          </h2>
          <Analytics data={analytics} />
        </div>
      </div>
    </div>
  );
}
