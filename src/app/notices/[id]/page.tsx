'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useNoticeStore } from '@/hooks/useNoticeStore';
import DDayBadge from '@/components/notices/DDayBadge';
import ExtractedFields from '@/components/detail/ExtractedFields';
import TabNav from '@/components/detail/TabNav';
import Checklist from '@/components/detail/checklist/Checklist';
import ProjectRecordForm from '@/components/detail/forms/ProjectRecordForm';
import EngineerCareerForm from '@/components/detail/forms/EngineerCareerForm';
import ExportButton from '@/components/detail/forms/ExportButton';
import type { NoticeData } from '@/types/notice';

const TABS = [
  { key: 'checklist', label: '제출서류 체크리스트' },
  { key: 'records', label: '유사용역 실적' },
  { key: 'careers', label: '기술자 경력' },
];

export default function NoticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { notices, updateNotice, updateChecklist, updateProjectRecords, updateEngineerCareers } = useNoticeStore();
  const notice = notices.find(n => n.id === id);
  const router = useRouter();
  const [tab, setTab] = useState('checklist');

  if (!notice) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <p>공고를 찾을 수 없습니다.</p>
        <button onClick={() => router.push('/')} className="mt-4 text-blue-600 hover:underline text-sm">홈으로 돌아가기</button>
      </div>
    );
  }

  function handleFieldUpdate(field: keyof NoticeData, value: string) {
    updateNotice(id, { [field]: value });
  }

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 w-fit">
        <ArrowLeft className="w-4 h-4" /> 목록으로
      </button>

      {/* 헤더 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900 leading-snug">
            {notice.title ?? <span className="text-amber-600">공고명 확인 필요</span>}
          </h1>
          <DDayBadge deadline={notice.deadline} />
        </div>
        <p className="text-sm text-gray-500">{notice.organization ?? '발주기관 확인 필요'}</p>
        <p className="text-xs text-gray-400 mt-1">파일: {notice.fileName}</p>
      </div>

      {/* 추출 필드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">공고 정보</h2>
        <ExtractedFields notice={notice} onUpdate={handleFieldUpdate} />
      </div>

      {/* 탭 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 pt-4">
          <TabNav tabs={TABS} active={tab} onChange={setTab} />
        </div>
        <div className="p-6">
          {tab === 'checklist' && (
            <Checklist
              items={notice.checklist}
              onChange={items => updateChecklist(id, items)}
            />
          )}
          {tab === 'records' && (
            <div className="flex flex-col gap-4">
              <ProjectRecordForm
                records={notice.projectRecords}
                onChange={records => updateProjectRecords(id, records)}
              />
            </div>
          )}
          {tab === 'careers' && (
            <div className="flex flex-col gap-4">
              <EngineerCareerForm
                careers={notice.engineerCareers}
                onChange={careers => updateEngineerCareers(id, careers)}
              />
            </div>
          )}
          {(tab === 'records' || tab === 'careers') && (
            <div className="mt-6 flex justify-end">
              <ExportButton notice={notice} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
