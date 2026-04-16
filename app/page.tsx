'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      if (user) {
        router.push('/dashboard');
      }
    };

    getUser();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-4">
            QuickLink
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create short, memorable links and track their performance
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/auth"
              className="px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="px-8 py-3 text-lg font-medium text-blue-600 bg-white rounded-lg border border-blue-600 hover:bg-blue-50 transition"
            >
              Learn More
            </a>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Fast Creation</h3>
              <p className="text-gray-600">
                Generate short links instantly with one click
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-lg font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-gray-600">
                Track clicks and engagement for all your links
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">
                Your data is protected with enterprise-grade security
              </p>
            </div>
          </div>

          <div id="features" className="mt-20 text-left max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Features</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Create custom or auto-generated short links</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>View detailed analytics with 7-day history</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Manage all your links in one dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Fast redirects under 200ms</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Rate limiting for fair use</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
