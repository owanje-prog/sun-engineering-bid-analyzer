'use client';

import { useState } from 'react';
import { Search, X, Download } from 'lucide-react';
import type { NaraBidItem, NoticeCategory } from '@/lib/nara-api';

// 나라장터 API 조회 기간 제한(서버의 nara-api.ts MAX_RANGE_DAYS와 동일하게 유지)
const MAX_RANGE_DAYS = 30;
import type { NoticeData } from '@/types/notice';
import { generateId } from '@/lib/utils';

interface Props {
  onClose: () => void;
  onImport: (notice: NoticeData) => void;
}

const CATEGORY_OPTIONS: { value: NoticeCategory; label: string }[] = [
  { value: 'servc', label: '용역' },
  { value: 'cnstwk', label: '공사' },
  { value: 'thng', label: '물품' },
  { value: 'frgcpt', label: '외자' },
];

function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function toApiDate(value: string): string {
  return value.replaceAll('-', '');
}

function formatAmount(value: string): string | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${n.toLocaleString('ko-KR')}원`;
}

export default function NaraSearchModal({ onClose, onImport }: Props) {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [category, setCategory] = useState<NoticeCategory>('servc');
  const [keyword, setKeyword] = useState('');
  const [fromDate, setFromDate] = useState(toDateInputValue(weekAgo));
  const [toDate, setToDate] = useState(toDateInputValue(today));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<NaraBidItem[]>([]);
  const [importedIds, setImportedIds] = useState<string[]>([]);

  async function handleSearch() {
    const days = Math.round((new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24));
    if (days > MAX_RANGE_DAYS - 1) {
      setError(`조회 기간은 최대 ${MAX_RANGE_DAYS}일까지 가능합니다. 기간을 좁혀서 다시 검색해 주세요.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        category,
        fromDate: toApiDate(fromDate),
        toDate: toApiDate(toDate),
      });
      if (keyword.trim()) params.set('keyword', keyword.trim());

      const res = await fetch(`/api/nara-notices?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '검색에 실패했습니다.');
      setResults(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleImport(item: NaraBidItem) {
    const amount = formatAmount(item.presmptPrce) ?? formatAmount(item.asignBdgtAmt);
    const notice: NoticeData = {
      id: generateId(),
      fileName: `나라장터_${item.bidNtceNo}`,
      uploadedAt: new Date().toISOString(),
      title: item.bidNtceNm ?? null,
      organization: item.ntceInsttNm ?? null,
      estimatedAmount: amount,
      servicePeriod: null,
      deadline: item.bidClseDt ?? null,
      qualifications: null,
      rawText:
        `[나라장터 공고 자동 수집]\n` +
        `공고번호: ${item.bidNtceNo}\n` +
        `공고명: ${item.bidNtceNm}\n` +
        `발주기관: ${item.ntceInsttNm}\n` +
        `수요기관: ${item.dminsttNm}\n` +
        `계약체결방법: ${item.cntrctCnclsMthdNm}\n` +
        `입찰마감일시: ${item.bidClseDt}\n` +
        `개찰일시: ${item.opengDt}\n` +
        `추정가격: ${item.presmptPrce}\n` +
        `배정예산금액: ${item.asignBdgtAmt}\n` +
        `원문 링크: ${item.bidNtceDtlUrl}`,
      checklist: [],
      projectRecords: [],
      engineerCareers: [],
    };
    onImport(notice);
    setImportedIds((prev) => [...prev, item.bidNtceNo]);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">나라장터 공고 검색해서 가져오기</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3 border-b border-gray-100">
          <div className="flex gap-2 flex-wrap">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NoticeCategory)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="공고명 키워드 (선택)"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[160px]"
            />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2"
            />
            <span className="text-gray-400 self-center">~</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Search size={14} />
              {loading ? '검색 중...' : '검색'}
            </button>
          </div>
          <p className="text-xs text-gray-400">조회 기간은 최대 {MAX_RANGE_DAYS}일까지 검색할 수 있어요.</p>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-2">
          {results.length === 0 && !loading && !error && (
            <p className="text-sm text-gray-400 text-center py-8">검색 조건을 입력하고 검색해 보세요.</p>
          )}
          {results.map((item) => {
            const imported = importedIds.includes(item.bidNtceNo);
            return (
              <div
                key={`${item.bidNtceNo}-${item.bidNtceOrd}`}
                className="border border-gray-100 rounded-lg px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.bidNtceNm}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.ntceInsttNm} · 마감 {item.bidClseDt || '-'}
                  </p>
                </div>
                <button
                  onClick={() => handleImport(item)}
                  disabled={imported}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <Download size={12} />
                  {imported ? '가져옴' : '가져오기'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
