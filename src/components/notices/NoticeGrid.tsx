'use client';

import type { NoticeData } from '@/types/notice';
import NoticeCard from './NoticeCard';

interface Props {
  notices: NoticeData[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NoticeGrid({ notices, selectedIds, onSelect, onDelete }: Props) {
  if (notices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <p className="text-base">아직 업로드된 공고가 없습니다.</p>
        <p className="text-sm mt-1">위 영역에 PDF를 드래그하거나 클릭해서 업로드하세요.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {notices.map(notice => (
        <NoticeCard
          key={notice.id}
          notice={notice}
          selected={selectedIds.includes(notice.id)}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
