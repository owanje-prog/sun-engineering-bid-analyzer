import Link from 'next/link';
import { FileSearch } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
      <Link href="/" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
        <FileSearch className="w-5 h-5" />
        <span className="text-lg font-bold tracking-tight">입찰 공고 분석기</span>
      </Link>
      <span className="text-xs text-gray-400 ml-2">선엔지니어링 수주전략팀</span>
    </header>
  );
}
