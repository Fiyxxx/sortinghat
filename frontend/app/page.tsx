import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-cream-base flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="flex justify-center mb-8">
          <Image src="/sortinglogo.png" alt="Sorting Hat" width={200} height={64}
            className="select-none object-contain" style={{ height: '72px', width: 'auto' }} />
        </div>

        <p className="text-sm text-ink-muted mb-10">
          Every floor tells a story. We write the first chapter.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/quiz"
            className="w-full h-14 rounded-full bg-purple-primary text-white font-semibold text-base flex items-center justify-center hover:bg-purple-800 transition-colors">
            Start Quiz →
          </Link>
          <Link href="/result"
            className="w-full h-14 rounded-full bg-white border-2 border-purple-primary text-purple-primary font-semibold text-base flex items-center justify-center hover:bg-purple-50 transition-colors">
            View My Room
          </Link>
          <Link href="/dashboard/login"
            className="w-full h-14 rounded-full bg-white border-2 border-gray-300 text-ink-muted font-semibold text-base flex items-center justify-center hover:bg-gray-50 transition-colors">
            HR Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
