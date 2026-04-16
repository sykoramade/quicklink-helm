'use client';

import { useEffect, useState } from 'react';
import { LinkRow } from './LinkRow';

interface Link {
  id: string;
  slug: string;
  long_url: string;
  created_at: string;
  click_count: number;
}

interface LinkListProps {
  refreshKey?: number;
}

export function LinkList({ refreshKey = 0 }: LinkListProps) {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLinks = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/links');
        if (!response.ok) {
          setError('Failed to load links');
          return;
        }

        const data = await response.json();
        setLinks(data.data || []);
      } catch (err) {
        setError('An error occurred while loading links');
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [refreshKey]);

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading links...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        No links yet. Create your first short link above!
      </div>
    );
  }

  const handleDelete = () => {
    setLinks(links.filter((l) => l.id));
    // Trigger refresh
    window.location.reload();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-900">Short Link</th>
            <th className="px-4 py-3 font-medium text-gray-900">Destination</th>
            <th className="px-4 py-3 font-medium text-gray-900">Created</th>
            <th className="px-4 py-3 font-medium text-gray-900">Clicks</th>
            <th className="px-4 py-3 font-medium text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <LinkRow
              key={link.id}
              id={link.id}
              slug={link.slug}
              longUrl={link.long_url}
              createdAt={link.created_at}
              clickCount={link.click_count || 0}
              onDelete={handleDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
