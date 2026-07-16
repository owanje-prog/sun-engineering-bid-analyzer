'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import type { NoticeData } from '@/types/notice';

interface Result {
  summary: string;
  eligibility: string;
  deadline: string;
}

export default function SummaryCard({ notice }: { notice: NoticeData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSummarize() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/summarize-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notice.title,
          organization: notice.organization,
          deadline: notice.deadline,
          rawText: notice.rawText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'AI 요약에 실패했습니다.');
        return;
      }
      setResult(data);
    } catch {
      setError('네트워크 오류로 AI 요약을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-500" /> AI 요약
        </h2>
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {result ? '다시 요약하기' : 'AI로 요약하기'}
        </button>
      </div>

      {error && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {!error && !result && !loading && (
        <p className="text-sm text-gray-400">
          버튼을 누르면 공고 원문을 바탕으로 핵심 요약·참가자격·마감일을 정리해 드립니다.
        </p>
      )}

      {result && (
        <dl className="flex flex-col gap-4">
          <div>
            <dt className="text-xs font-medium text-gray-400 mb-1">핵심 요약</dt>
            <dd className="text-sm text-gray-700 whitespace-pre-wrap">{result.summary}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400 mb-1">참가 자격</dt>
            <dd className="text-sm text-gray-700 whitespace-pre-wrap">{result.eligibility}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400 mb-1">마감일</dt>
            <dd className="text-sm text-gray-700 whitespace-pre-wrap">{result.deadline}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
