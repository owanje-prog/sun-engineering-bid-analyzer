'use client';

import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface Props {
  onFilesAccepted: (files: File[]) => void;
  loading: boolean;
}

export default function DropZone({ onFilesAccepted, loading }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (files.length) onFilesAccepted(files);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFilesAccepted(files);
    e.target.value = '';
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !loading && inputRef.current?.click()}
      className={`w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 py-10 cursor-pointer transition-colors
        ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'}
        ${loading ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <UploadCloud className="w-10 h-10 text-gray-400" />
      {loading ? (
        <p className="text-sm text-blue-600 font-medium">PDF 분석 중...</p>
      ) : (
        <>
          <p className="text-sm text-gray-600 font-medium">PDF를 드래그하거나 클릭해서 업로드</p>
          <p className="text-xs text-gray-400">나라장터 입찰 공고 PDF (.pdf)</p>
        </>
      )}
      <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden" onChange={handleChange} />
    </div>
  );
}
