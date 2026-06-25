'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import type { NoticeData } from '@/types/notice';
import { exportNoticeDocx } from '@/lib/docx-exporter';

export default function ExportButton({ notice }: { notice: NoticeData }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      await exportNoticeDocx(notice, notice.projectRecords, notice.engineerCareers);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      .docx 내보내기
    </button>
  );
}
