'use client';

import type { NoticeData } from '@/types/notice';
import { calcDDay } from '@/lib/utils';

interface Props {
  notices: NoticeData[];
}

export default function KpiCards({ notices }: Props) {
  const total = notices.length;

  const urgent = notices.filter((n) => {
    const d = calcDDay(n.deadline);
    return d !== null && d >= 0 && d <= 7;
  }).length;

  const incomplete = notices.filter((n) =>
    n.checklist.length > 0 && n.checklist.some((c) => !c.checked),
  ).length;

  const amounts = notices
    .map((n) => {
      if (!n.estimatedAmount) return null;
      const num = parseInt(n.estimatedAmount.replace(/[^0-9]/g, ''), 10);
      return isNaN(num) ? null : num;
    })
    .filter((v): v is number => v !== null);

  const avg =
    amounts.length > 0
      ? Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length / 10000)
      : null;

  const kpis = [
    { label: '전체 공고', value: String(total), sub: '건 관리 중', color: '' },
    { label: '마감 임박', value: String(urgent), sub: 'D-7 이내', color: urgent > 0 ? 'text-red-500' : '' },
    { label: '체크리스트 미완', value: String(incomplete), sub: '건 진행 중', color: incomplete > 0 ? 'text-amber-500' : '' },
    {
      label: '평균 예정금액',
      value: avg !== null ? `${avg.toLocaleString()}만` : '-',
      sub: avg !== null ? '원' : '데이터 없음',
      color: '',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {kpis.map(({ label, value, sub, color }) => (
        <div
          key={label}
          className="bg-white border border-gray-100 rounded-xl px-4 py-3"
        >
          <p className="text-xs text-gray-400 mb-1">{label}</p>
          <p className={`text-2xl font-medium ${color || 'text-gray-900'}`}>{value}</p>
          <p className="text-xs text-gray-300 mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  );
}
