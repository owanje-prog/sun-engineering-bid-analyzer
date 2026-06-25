'use client';

import { Trash2 } from 'lucide-react';

interface Props {
  cells: string[];
  onChange: (index: number, value: string) => void;
  onDelete: () => void;
}

export default function FormRow({ cells, onChange, onDelete }: Props) {
  return (
    <tr className="group border-b border-gray-100">
      {cells.map((cell, i) => (
        <td key={i} className="px-2 py-1.5">
          <input
            value={cell}
            onChange={e => onChange(i, e.target.value)}
            className="w-full text-sm border-0 border-b border-transparent focus:border-blue-400 focus:outline-none bg-transparent py-0.5"
          />
        </td>
      ))}
      <td className="px-2 py-1.5 w-8">
        <button onClick={onDelete} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}
