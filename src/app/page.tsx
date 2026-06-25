'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import KpiCards from '@/components/dashboard/KpiCards';
import NoticeTable from '@/components/dashboard/NoticeTable';
import ChecklistPreview from '@/components/dashboard/ChecklistPreview';
import ComparePanel from '@/components/dashboard/ComparePanel';
import { useNoticeStore } from '@/hooks/useNoticeStore';
import { extractTextFromPdf } from '@/lib/pdf-extractor';
import { parseNotice } from '@/lib/notice-parser';
import { generateId } from '@/lib/utils';

export default function HomePage() {
  const { notices, addNotice, deleteNotice, storageWarning } = useNoticeStore();
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setLoading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.name.endsWith('.pdf')) continue;
        const rawText = await extractTextFromPdf(file);
        const parsed = parseNotice(rawText, file.name);
        const id = generateId();
        addNotice({
          ...parsed,
          id,
          uploadedAt: new Date().toISOString(),
          projectRecords: [],
          engineerCareers: [],
        });
        setFocusedId(id);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  const focusedNotice = notices.find((n) => n.id === focusedId) ?? notices[0] ?? null;

  return (
    <>
      {/* 업로드 버튼 — topbar에 포탈하지 않고 hidden input으로 처리 */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex flex-col gap-4 h-full">
        {storageWarning && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-4 py-2">
            저장 용량이 5MB에 근접했습니다. 오래된 공고를 삭제해 주세요.
          </div>
        )}

        {/* PDF 업로드 버튼 */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {notices.length > 0 ? `${notices.length}개 공고 관리 중` : '공고를 업로드하세요'}
          </p>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Upload size={13} />
            {loading ? '처리 중...' : 'PDF 업로드'}
          </button>
        </div>

        <KpiCards notices={notices} />

        <p className="text-xs font-medium text-gray-400 -mb-1">공고 현황</p>

        <NoticeTable
          notices={notices}
          selectedIds={selectedIds}
          focusedId={focusedId}
          onSelect={handleSelect}
          onFocus={setFocusedId}
        />

        <div className="grid grid-cols-2 gap-4" style={{ minHeight: '160px' }}>
          <ChecklistPreview notice={focusedNotice} />
          <ComparePanel
            notices={notices}
            selectedIds={selectedIds}
            onDeselect={(id) => setSelectedIds((prev) => prev.filter((i) => i !== id))}
          />
        </div>
      </div>
    </>
  );
}
