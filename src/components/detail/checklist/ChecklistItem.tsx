'use client';

import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { ChecklistItem as Item } from '@/types/notice';

interface Props {
  item: Item;
  onChange: (item: Item) => void;
  onDelete: (id: string) => void;
}

export default function ChecklistItem({ item, onChange, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.label);

  function save() {
    if (draft.trim()) onChange({ ...item, label: draft.trim() });
    setEditing(false);
  }

  return (
    <li className="flex items-start gap-2 py-1.5 group">
      <input
        type="checkbox"
        checked={item.checked}
        onChange={e => onChange({ ...item, checked: e.target.checked })}
        className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0"
      />
      {editing ? (
        <div className="flex-1 flex gap-1">
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
            className="flex-1 text-sm border border-blue-300 rounded px-2 py-0.5 outline-none"
          />
          <button onClick={save} className="text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
          <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
      ) : (
        <span className={`flex-1 text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
          {item.label}
        </span>
      )}
      {!editing && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => { setDraft(item.label); setEditing(true); }} className="text-gray-400 hover:text-blue-500">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(item.id)} className="text-gray-400 hover:text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </li>
  );
}
