interface Props {
  value: number; // 0–100
}

export default function ProgressBar({ value }: Props) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>진행률</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${value === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
