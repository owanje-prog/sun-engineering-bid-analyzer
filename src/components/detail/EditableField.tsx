'use client';

import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface Props {
  label: string;
  value: string | null;
  onSave: (v: string) => void;
  multiline?: boolean;
}

export default function EditableField({ label, value, onSave, multiline }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');

  function save() {
    onSave(draft.trim() || '');
    setEditing(false);
  }

  return (
    <div className="group">
      <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
      <dd className="flex items-start gap-1">
        {editing ? (
          <div className="flex-1 flex gap-1 items-start">
            {multiline ? (
              <textarea
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={3}
                className="flex-1 text-sm border border-blue-300 rounded px-2 py-1 outline-none resize-none"
              />
            ) : (
              <input
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
                className="flex-1 text-sm border border-blue-300 rounded px-2 py-0.5 outline-none"
              />
            )}
            <button onClick={save} className="text-green-600 hover:text-green-700 mt-0.5"><Check className="w-4 h-4" /></button>
            <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600 mt-0.5"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <>
            <span className={`flex-1 text-sm ${!value ? 'text-amber-600 font-medium' : 'text-gray-800'} whitespace-pre-wrap`}>
              {value ?? '확인 필요'}
            </span>
            <button
              onClick={() => { setDraft(value ?? ''); setEditing(true); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-500 shrink-0 mt-0.5"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </dd>
    </div>
  );
}
