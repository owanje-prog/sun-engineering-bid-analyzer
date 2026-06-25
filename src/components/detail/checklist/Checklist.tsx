'use client';

import { Plus } from 'lucide-react';
import type { ChecklistItem as Item } from '@/types/notice';
import ChecklistItem from './ChecklistItem';
import ProgressBar from '../ProgressBar';
import { generateId } from '@/lib/utils';

interface Props {
  items: Item[];
  onChange: (items: Item[]) => void;
}

export default function Checklist({ items, onChange }: Props) {
  const checked = items.filter(i => i.checked).length;
  const progress = items.length > 0 ? Math.round((checked / items.length) * 100) : 0;

  function update(item: Item) {
    onChange(items.map(i => i.id === item.id ? item : i));
  }

  function remove(id: string) {
    onChange(items.filter(i => i.id !== id));
  }

  function addItem() {
    onChange([...items, { id: generateId(), label: '새 항목', checked: false }]);
  }

  return (
    <div className="flex flex-col gap-4">
      <ProgressBar value={progress} />
      <p className="text-xs text-gray-400">{checked} / {items.length}개 완료</p>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">추출된 제출서류가 없습니다. 직접 추가해 주세요.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map(item => (
            <ChecklistItem key={item.id} item={item} onChange={update} onDelete={remove} />
          ))}
        </ul>
      )}

      <button
        onClick={addItem}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium mt-1"
      >
        <Plus className="w-4 h-4" /> 항목 추가
      </button>
    </div>
  );
}
