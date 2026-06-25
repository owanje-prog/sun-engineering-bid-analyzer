'use client';

import { Plus } from 'lucide-react';
import type { ProjectRecord } from '@/types/notice';
import FormRow from './FormRow';
import { generateId } from '@/lib/utils';

const HEADERS = ['용역명', '발주기관', '계약금액', '용역기간', '수행내용'];
const FIELDS: (keyof Omit<ProjectRecord, 'id'>)[] = ['serviceName', 'client', 'contractAmount', 'period', 'description'];

interface Props {
  records: ProjectRecord[];
  onChange: (records: ProjectRecord[]) => void;
}

export default function ProjectRecordForm({ records, onChange }: Props) {
  function update(id: string, index: number, value: string) {
    onChange(records.map(r => r.id === id ? { ...r, [FIELDS[index]]: value } : r));
  }

  function remove(id: string) {
    onChange(records.filter(r => r.id !== id));
  }

  function add() {
    onChange([...records, { id: generateId(), serviceName: '', client: '', contractAmount: '', period: '', description: '' }]);
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {HEADERS.map(h => <th key={h} className="px-2 py-2 text-left text-xs text-gray-500 font-medium">{h}</th>)}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <FormRow
                key={r.id}
                cells={FIELDS.map(f => r[f])}
                onChange={(i, v) => update(r.id, i, v)}
                onDelete={() => remove(r.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
      {records.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">등록된 실적이 없습니다.</p>
      )}
      <button onClick={add} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium mt-3">
        <Plus className="w-4 h-4" /> 행 추가
      </button>
    </div>
  );
}
