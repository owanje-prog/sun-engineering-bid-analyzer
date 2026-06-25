import { AlertTriangle } from 'lucide-react';

export default function WarningBanner() {
  return (
    <div className="w-full bg-amber-50 border-b border-amber-300 px-4 py-2 flex items-center gap-2 text-amber-800 text-sm font-medium">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      이 결과는 PDF에서 자동 추출한 내용으로 정확하지 않을 수 있습니다.&nbsp;
      <span className="font-bold">반드시 원문을 확인하세요.</span>
    </div>
  );
}
