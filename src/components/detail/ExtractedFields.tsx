'use client';

import type { NoticeData } from '@/types/notice';
import EditableField from './EditableField';

interface Props {
  notice: NoticeData;
  onUpdate: (field: keyof NoticeData, value: string) => void;
}

export default function ExtractedFields({ notice, onUpdate }: Props) {
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
      <EditableField label="공고명" value={notice.title} onSave={v => onUpdate('title', v)} />
      <EditableField label="발주기관" value={notice.organization} onSave={v => onUpdate('organization', v)} />
      <EditableField label="예정금액" value={notice.estimatedAmount} onSave={v => onUpdate('estimatedAmount', v)} />
      <EditableField label="용역기간" value={notice.servicePeriod} onSave={v => onUpdate('servicePeriod', v)} />
      <EditableField label="입찰 마감일" value={notice.deadline} onSave={v => onUpdate('deadline', v)} />
      <EditableField label="참가자격" value={notice.qualifications} onSave={v => onUpdate('qualifications', v)} multiline />
    </dl>
  );
}
