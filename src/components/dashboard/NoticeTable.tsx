'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import type { NoticeData } from '@/types/notice';
import { calcDDay } from '@/lib/utils';
import DDayBadge from '@/components/notices/DDayBadge';

interface Props {
  notices: NoticeData[];
  selectedIds: string[];
  focusedId: string | null;
  onSelect: (id: string) => void;
  onFocus: (id: string) => void;
}

function borderColor(deadline: string | null): string {
  const d = calcDDay(deadline);
  if (d === null) return '';
  if (d < 0) return 'border-l-4 border-l-gray-200';
  if (d <= 7) return 'border-l-4 border-l-red-400';
  if (d <= 14) return 'border-l-4 border-l-amber-400';
  return '';
}

function rowOpacity(deadline: string | null): string {
  const d = calcDDay(deadline);
  return d !== null && d < 0 ? 'opacity-50' : '';
}

function sorted(notices: NoticeData[]): NoticeData[] {
  return [...notices].sort((a, b) => {
    const da = calcDDay(a.deadline);
    const db = calcDDay(b.deadline);
    if (da === null && db === null) return 0;
    if (da === null) return 1;
    if (db === null) return -1;
    if (da < 0 && db >= 0) return 1;
    if (db < 0 && da >= 0) return -1;
    return da - db;
  });
}

export default function NoticeTable({ notices, selectedIds, focusedId, onSelect, onFocus }: Props) {
  const router = useRouter();

  if (notices.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl flex items-center justify-center py-16 text-sm text-gray-300">
        업로드된 공고가 없습니다
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="grid grid-cols-[1fr_120px_130px_72px_36px] gap-3 px-4 py-2 border-b border-gray-50 text-xs text-gray-400 font-medium">
        <span>공고명 / 발주기관</span>
        <span className="text-right">예정금액</span>
        <span>진행률</span>
        <span className="text-center">마감</span>
        <span />
      </div>

      {sorted(notices).map((notice) => {
        const done = notice.checklist.filter((c) => c.checked).length;
        const total = notice.checklist.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const isFocused = focusedId === notice.id;

        return (
          <div
            key={notice.id}
            onClick={() => onFocus(notice.id)}
            className={`grid grid-cols-[1fr_120px_130px_72px_36px] gap-3 px-4 py-3 border-b border-gray-50 last:border-b-0 cursor-pointer transition-colors ${borderColor(notice.deadline)} ${rowOpacity(notice.deadline)} ${isFocused ? 'bg-blue-50/40' : 'hover:bg-gray-50/60'}`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(notice.id)}
                  onChange={(e) => { e.stopPropagation(); onSelect(notice.id); }}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 accent-blue-500"
                />
                <p className="text-sm font-medium text-gray-800 truncate">
                  {notice.title ?? notice.fileName}
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 pl-5 truncate">
                {notice.organization ?? '발주기관 확인 필요'}
              </p>
            </div>

            <div className="text-xs text-gray-600 text-right self-center">
              {notice.estimatedAmount
                ? notice.estimatedAmount.replace(/\s*\([^)]*\)/, '')
                : <span className="text-amber-400">확인 필요</span>}
            </div>

            <div className="self-center">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-300 text-right">
                {total > 0 ? `${done}/${total}` : '항목 없음'}
              </p>
            </div>

            <div className="self-center flex justify-center">
              <DDayBadge deadline={notice.deadline} />
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/notices/${notice.id}`); }}
              className="self-center w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
