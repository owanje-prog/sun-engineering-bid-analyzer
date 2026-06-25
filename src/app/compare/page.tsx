'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useNoticeStore } from '@/hooks/useNoticeStore';
import CompareTable from '@/components/compare/CompareTable';

export default function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const { ids } = use(searchParams);
  const { notices } = useNoticeStore();
  const router = useRouter();

  const selectedIds = ids ? ids.split(',') : [];
  const selected = selectedIds.map(id => notices.find(n => n.id === id)).filter(Boolean) as typeof notices;

  if (selected.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <p>비교할 공고가 2개 이상 필요합니다.</p>
        <button onClick={() => router.push('/')} className="mt-4 text-blue-600 hover:underline text-sm">홈으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 w-fit">
        <ArrowLeft className="w-4 h-4" /> 목록으로
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">공고 비교</h1>
        <span className="text-sm text-gray-400">{selected.length}개 공고</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <CompareTable notices={selected} />
      </div>

      <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
        ⚠ 항목 값이 다른 행은 노란색으로 표시됩니다.
      </p>
    </div>
  );
}
