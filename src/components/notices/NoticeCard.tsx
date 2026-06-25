'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import type { NoticeData } from '@/types/notice';
import DDayBadge from './DDayBadge';

interface Props {
  notice: NoticeData;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NoticeCard({ notice, selected, onSelect, onDelete }: Props) {
  const progress = notice.checklist.length > 0
    ? Math.round((notice.checklist.filter(i => i.checked).length / notice.checklist.length) * 100)
    : null;

  return (
    <div className={`relative bg-white rounded-xl border-2 transition-colors ${selected ? 'border-blue-500' : 'border-gray-200'} shadow-sm hover:shadow-md`}>
      {/* compare checkbox */}
      <label className="absolute top-3 left-3 flex items-center gap-1 cursor-pointer z-10" onClick={e => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(notice.id)}
          className="w-4 h-4 accent-blue-600"
        />
        <span className="text-xs text-gray-500">비교</span>
      </label>

      <Link href={`/notices/${notice.id}`} className="block p-5 pt-8">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
            {notice.title ?? <span className="text-amber-600">공고명 확인 필요</span>}
          </h3>
          <DDayBadge deadline={notice.deadline} />
        </div>

        <p className="text-xs text-gray-500 mb-3">{notice.organization ?? '발주기관 확인 필요'}</p>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
          <div>
            <dt className="text-gray-400">예정금액</dt>
            <dd className="text-gray-700 font-medium truncate">{notice.estimatedAmount ?? '확인 필요'}</dd>
          </div>
          <div>
            <dt className="text-gray-400">용역기간</dt>
            <dd className="text-gray-700 truncate">{notice.servicePeriod ?? '확인 필요'}</dd>
          </div>
        </dl>

        {progress !== null && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>제출서류 진행률</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </Link>

      <button
        onClick={e => { e.preventDefault(); onDelete(notice.id); }}
        className="absolute bottom-3 right-3 text-gray-300 hover:text-red-500 transition-colors"
        title="삭제"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
