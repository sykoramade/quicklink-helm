import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">
          This page doesn't exist or the link has been deleted.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 font-medium text-blue-600 bg-white rounded-lg border border-blue-600 hover:bg-blue-50 transition"
          >
            My Links
          </Link>
        </div>
      </div>
    </div>
  );
}
