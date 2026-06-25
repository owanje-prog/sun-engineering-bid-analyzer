'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import type { NoticeData } from '@/types/notice';

interface Props {
  notices: NoticeData[];
  selectedIds: string[];
  onDeselect: (id: string) => void;
}

export default function ComparePanel({ notices, selectedIds, onDeselect }: Props) {
  const router = useRouter();
  const selected = selectedIds.map((id) => notices.find((n) => n.id === id)).filter(Boolean) as NoticeData[];

  return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex flex-col h-full">
      <p className="text-xs font-medium text-gray-400 mb-2">공고 비교</p>

      {selected.length === 0 ? (
        <p className="text-xs text-gray-300 flex-1 flex items-center">
          체크박스로 2개 이상 선택하면 비교할 수 있습니다
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5 flex-1">
          {selected.map((n) => (
            <span
              key={n.id}
              className="flex items-center gap-1 text-xs bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 text-gray-600"
            >
              <span className="max-w-[120px] truncate">{n.title ?? n.fileName}</span>
              <button
                onClick={() => onDeselect(n.id)}
                className="text-gray-300 hover:text-gray-500 ml-0.5"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        disabled={selected.length < 2}
        onClick={() => router.push(`/compare?ids=${selectedIds.join(',')}`)}
        className="mt-3 w-full text-xs py-2 rounded-lg border border-gray-100 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        비교 보기 →
      </button>
    </div>
  );
}
