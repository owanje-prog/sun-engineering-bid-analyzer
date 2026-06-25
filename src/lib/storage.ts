import { supabase } from '@/lib/supabase';
import type { NoticeData, NoticeStore } from '@/types/notice';

export const MAX_BYTES = 5 * 1024 * 1024;

function toRow(notice: NoticeData) {
  return {
    id: notice.id,
    file_name: notice.fileName,
    uploaded_at: notice.uploadedAt,
    title: notice.title,
    organization: notice.organization,
    estimated_amount: notice.estimatedAmount,
    service_period: notice.servicePeriod,
    deadline: notice.deadline,
    qualifications: notice.qualifications,
    raw_text: notice.rawText,
    checklist: notice.checklist,
    project_records: notice.projectRecords,
    engineer_careers: notice.engineerCareers,
  };
}

function fromRow(row: Record<string, unknown>): NoticeData {
  return {
    id: row.id as string,
    fileName: row.file_name as string,
    uploadedAt: row.uploaded_at as string,
    title: row.title as string | null,
    organization: row.organization as string | null,
    estimatedAmount: row.estimated_amount as string | null,
    servicePeriod: row.service_period as string | null,
    deadline: row.deadline as string | null,
    qualifications: row.qualifications as string | null,
    rawText: row.raw_text as string,
    checklist: (row.checklist as NoticeData['checklist']) ?? [],
    projectRecords: (row.project_records as NoticeData['projectRecords']) ?? [],
    engineerCareers: (row.engineer_careers as NoticeData['engineerCareers']) ?? [],
  };
}

export async function loadStore(): Promise<NoticeStore> {
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Supabase load error:', error);
    return { notices: [] };
  }
  return { notices: (data ?? []).map(fromRow) };
}

export async function upsertNotice(notice: NoticeData): Promise<void> {
  const { error } = await supabase.from('notices').upsert(toRow(notice));
  if (error) console.error('Supabase upsert error:', error);
}

export async function deleteNoticeFromDb(id: string): Promise<void> {
  const { error } = await supabase.from('notices').delete().eq('id', id);
  if (error) console.error('Supabase delete error:', error);
}
