import { calcDDay } from '@/lib/utils';

export default function DDayBadge({ deadline }: { deadline: string | null }) {
  if (!deadline) return <span className="text-xs text-gray-400">마감일 미확인</span>;

  const days = calcDDay(deadline);
  if (days === null) return <span className="text-xs text-gray-400">{deadline}</span>;

  if (days < 0) return <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-gray-200 text-gray-500">마감</span>;
  if (days <= 7) return <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">D-{days}</span>;
  if (days <= 14) return <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-700">D-{days}</span>;
  return <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">D-{days}</span>;
}
