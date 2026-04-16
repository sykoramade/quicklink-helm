'use client';

import Link from 'next/link';
import { useState } from 'react';

interface LinkRowProps {
  id: string;
  slug: string;
  longUrl: string;
  createdAt: string;
  clickCount: number;
  onDelete: () => void;
}

export function LinkRow({
  id,
  slug,
  longUrl,
  createdAt,
  clickCount,
  onDelete,
}: LinkRowProps) {
  const [deleting, setDeleting] = useState(false);
  const shortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${slug}`;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete();
      } else {
        alert('Failed to delete link');
      }
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shortUrl);
    alert('Copied to clipboard!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3">
        <code className="text-sm font-mono text-blue-600">{slug}</code>
      </td>
      <td className="px-4 py-3">
        <a
          href={longUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline truncate max-w-xs block"
          title={longUrl}
        >
          {longUrl.length > 40 ? longUrl.substring(0, 40) + '...' : longUrl}
        </a>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {formatDate(createdAt)}
      </td>
      <td className="px-4 py-3 text-sm font-medium">
        <Link
          href={`/dashboard/links/${id}`}
          className="text-blue-600 hover:underline"
        >
          {clickCount} {clickCount === 1 ? 'click' : 'clicks'}
        </Link>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="px-2 py-1 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Copy
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-2 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:bg-gray-400"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </td>
    </tr>
  );
}
