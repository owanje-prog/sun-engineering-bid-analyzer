'use client';

import { useRef, useState, useEffect } from 'react';
import { Upload, Search } from 'lucide-react';
import KpiCards from '@/components/dashboard/KpiCards';
import NoticeTable from '@/components/dashboard/NoticeTable';
import ChecklistPreview from '@/components/dashboard/ChecklistPreview';
import ComparePanel from '@/components/dashboard/ComparePanel';
import NaraSearchModal from '@/components/search/NaraSearchModal';
import { useNoticeStore } from '@/hooks/useNoticeStore';
import { extractTextFromPdf } from '@/lib/pdf-extractor';
import { parseNotice } from '@/lib/notice-parser';
import { generateId } from '@/lib/utils';
import { upsertNotice } from '@/lib/storage';
import type { NoticeData } from '@/types/notice';

const LS_KEY = 'bid-analyzer-store';

export default function HomePage() {
  const { notices, addNotice, deleteNotice, storageWarning } = useNoticeStore();
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [legacyNotices, setLegacyNotices] = useState<NoticeData[]>([]);
  const [migrating, setMigrating] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { notices: NoticeData[] };
      if (parsed.notices?.length > 0) setLegacyNotices(parsed.notices);
    } catch {}
  }, []);

  async function handleMigrate() {
    setMigrating(true);
    try {
      for (const notice of legacyNotices) {
        await upsertNotice(notice);
        addNotice(notice);
      }
      localStorage.removeItem(LS_KEY);
      setLegacyNotices([]);
    } finally {
      setMigrating(false);
    }
  }

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
        {legacyNotices.length > 0 && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg px-4 py-2 gap-3">
            <span>이전에 저장된 공고 {legacyNotices.length}건이 브라우저에 남아 있습니다. 데이터베이스로 복구하시겠습니까?</span>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => { localStorage.removeItem(LS_KEY); setLegacyNotices([]); }}
                className="px-2 py-1 rounded border border-blue-300 bg-white hover:bg-blue-50"
              >
                무시
              </button>
              <button
                onClick={handleMigrate}
                disabled={migrating}
                className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {migrating ? '복구 중...' : '복구하기'}
              </button>
            </div>
          </div>
        )}
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
          <div className="flex gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Search size={13} />
              공고 검색
            </button>
            <button
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <Upload size={13} />
              {loading ? '처리 중...' : 'PDF 업로드'}
            </button>
          </div>
        </div>

        {searchOpen && (
          <NaraSearchModal
            onClose={() => setSearchOpen(false)}
            onImport={(notice) => { addNotice(notice); setFocusedId(notice.id); }}
          />
        )}

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
