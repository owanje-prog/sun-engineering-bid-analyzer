'use client';

import { Plus } from 'lucide-react';
import type { EngineerCareer } from '@/types/notice';
import FormRow from './FormRow';
import { generateId } from '@/lib/utils';

const HEADERS = ['성명', '직위', '자격증', '투입기간', '담당업무'];
const FIELDS: (keyof Omit<EngineerCareer, 'id'>)[] = ['name', 'position', 'license', 'deployPeriod', 'role'];

interface Props {
  careers: EngineerCareer[];
  onChange: (careers: EngineerCareer[]) => void;
}

export default function EngineerCareerForm({ careers, onChange }: Props) {
  function update(id: string, index: number, value: string) {
    onChange(careers.map(c => c.id === id ? { ...c, [FIELDS[index]]: value } : c));
  }

  function remove(id: string) {
    onChange(careers.filter(c => c.id !== id));
  }

  function add() {
    onChange([...careers, { id: generateId(), name: '', position: '', license: '', deployPeriod: '', role: '' }]);
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
            {careers.map(c => (
              <FormRow
                key={c.id}
                cells={FIELDS.map(f => c[f])}
                onChange={(i, v) => update(c.id, i, v)}
                onDelete={() => remove(c.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
      {careers.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">등록된 기술자 경력이 없습니다.</p>
      )}
      <button onClick={add} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium mt-3">
        <Plus className="w-4 h-4" /> 행 추가
      </button>
    </div>
  );
}
