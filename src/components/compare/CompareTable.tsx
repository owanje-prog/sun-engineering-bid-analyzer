import type { NoticeData } from '@/types/notice';
import DDayBadge from '@/components/notices/DDayBadge';

const ROWS: { label: string; key: keyof NoticeData }[] = [
  { label: '공고명', key: 'title' },
  { label: '발주기관', key: 'organization' },
  { label: '예정금액', key: 'estimatedAmount' },
  { label: '용역기간', key: 'servicePeriod' },
  { label: '입찰 마감일', key: 'deadline' },
  { label: '참가자격', key: 'qualifications' },
];

interface Props {
  notices: NoticeData[];
}

export default function CompareTable({ notices }: Props) {
  function isDiff(key: keyof NoticeData): boolean {
    const vals = notices.map(n => String(n[key] ?? ''));
    return new Set(vals).size > 1;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium border border-gray-200 w-28">항목</th>
            {notices.map(n => (
              <th key={n.id} className="px-4 py-3 text-left text-xs font-medium border border-gray-200">
                <div className="text-gray-800 font-semibold line-clamp-2">{n.title ?? '공고명 확인 필요'}</div>
                <div className="text-gray-400 font-normal mt-0.5">{n.organization ?? ''}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(row => (
            <tr key={row.key} className={isDiff(row.key) ? 'bg-yellow-50' : ''}>
              <td className="px-4 py-3 text-xs text-gray-500 font-medium border border-gray-200 bg-gray-50 whitespace-nowrap">
                {row.label}
                {isDiff(row.key) && <span className="ml-1 text-yellow-600">⚠</span>}
              </td>
              {notices.map(n => (
                <td key={n.id} className="px-4 py-3 border border-gray-200 text-gray-700 align-top whitespace-pre-wrap">
                  {row.key === 'deadline' ? (
                    <div className="flex flex-col gap-1">
                      <span>{n.deadline ?? <span className="text-amber-600">확인 필요</span>}</span>
                      <DDayBadge deadline={n.deadline} />
                    </div>
                  ) : (
                    (n[row.key] as string | null) ?? <span className="text-amber-600">확인 필요</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
          {/* 제출서류 수 */}
          <tr>
            <td className="px-4 py-3 text-xs text-gray-500 font-medium border border-gray-200 bg-gray-50">제출서류 수</td>
            {notices.map(n => (
              <td key={n.id} className="px-4 py-3 border border-gray-200 text-gray-700">{n.checklist.length}개</td>
            ))}
          </tr>
          {/* 진행률 */}
          <tr>
            <td className="px-4 py-3 text-xs text-gray-500 font-medium border border-gray-200 bg-gray-50">준비 진행률</td>
            {notices.map(n => {
              const pct = n.checklist.length > 0
                ? Math.round(n.checklist.filter(i => i.checked).length / n.checklist.length * 100)
                : 0;
              return (
                <td key={n.id} className="px-4 py-3 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-600">{pct}%</span>
                  </div>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
