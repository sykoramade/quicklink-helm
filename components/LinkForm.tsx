'use client';

import { useState } from 'react';
import { validateUrl } from '@/lib/validation';
import { validateCustomSlug } from '@/lib/slug';

interface LinkFormProps {
  onSuccess: () => void;
  disabled?: boolean;
}

export function LinkForm({ onSuccess, disabled = false }: LinkFormProps) {
  const [longUrl, setLongUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!longUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    const urlValidation = validateUrl(longUrl);
    if (!urlValidation.valid) {
      setError(urlValidation.error || 'Invalid URL');
      return;
    }

    if (customSlug.trim()) {
      const slugValidation = validateCustomSlug(customSlug);
      if (!slugValidation.valid) {
        setError(slugValidation.error || 'Invalid slug');
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          long_url: longUrl,
          custom_slug: customSlug || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create link');
        return;
      }

      setSuccess(`Short link created: ${window.location.origin}/${data.slug}`);
      setLongUrl('');
      setCustomSlug('');
      onSuccess();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="longUrl" className="block text-sm font-medium text-gray-700">
          Long URL
        </label>
        <input
          type="text"
          id="longUrl"
          placeholder="https://example.com/very/long/url"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          disabled={loading || disabled}
          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
        />
      </div>

      <div>
        <label htmlFor="customSlug" className="block text-sm font-medium text-gray-700">
          Custom Slug (optional)
        </label>
        <input
          type="text"
          id="customSlug"
          placeholder="my-custom-slug"
          value={customSlug}
          onChange={(e) => setCustomSlug(e.target.value)}
          disabled={loading || disabled}
          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
        />
        <p className="text-xs text-gray-500 mt-1">
          Alphanumeric and hyphens only, 3-50 characters
        </p>
      </div>

      {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

      {success && <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}

      <button
        type="submit"
        disabled={loading || disabled}
        className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Creating...' : 'Create Short Link'}
      </button>
    </form>
  );
}
