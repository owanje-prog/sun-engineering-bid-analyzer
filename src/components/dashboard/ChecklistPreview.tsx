'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import type { NoticeData } from '@/types/notice';

interface Props {
  notice: NoticeData | null;
}

export default function ChecklistPreview({ notice }: Props) {
  if (!notice) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex flex-col h-full">
        <p className="text-xs font-medium text-gray-400 mb-3">체크리스트</p>
        <div className="flex-1 flex items-center justify-center text-xs text-gray-300">
          공고를 선택하면 표시됩니다
        </div>
      </div>
    );
  }

  const items = notice.checklist.slice(0, 5);
  const extra = notice.checklist.length - items.length;

  return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex flex-col h-full">
      <p className="text-xs font-medium text-gray-400 mb-2">
        체크리스트 — <span className="text-gray-600 font-medium">{notice.title ?? notice.fileName}</span>
      </p>

      {items.length === 0 ? (
        <p className="text-xs text-gray-300 py-2">항목이 없습니다</p>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-50">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 py-1.5 text-xs text-gray-700">
              {item.checked
                ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                : <Circle size={14} className="text-gray-200 shrink-0" />}
              <span className={item.checked ? 'line-through text-gray-300' : ''}>{item.label}</span>
            </li>
          ))}
        </ul>
      )}

      {extra > 0 && (
        <p className="text-[10px] text-gray-300 mt-2">+{extra}개 더</p>
      )}
    </div>
  );
}
