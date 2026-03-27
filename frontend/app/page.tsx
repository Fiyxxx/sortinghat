import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Sorting Hat
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          AI-Powered Residential Floor Allocation
        </p>
        <p className="text-gray-500 mb-8">
          Every floor tells a story. We write the first chapter.
        </p>

        <Link
          href="/quiz"
          className="inline-block px-8 py-4 bg-indigo-600 text-white text-lg font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Start Quiz →
        </Link>

        <p className="text-sm text-gray-500 mt-6">
          Takes about 3 minutes
        </p>
      </div>
    </div>
  );
}
