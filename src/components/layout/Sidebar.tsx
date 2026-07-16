'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Columns2, Download, Settings } from 'lucide-react';

// href가 있는 항목만 실제로 이동한다. href가 없는 항목은 아직 만들어지지 않은 기능이라
// 눌러도 반응하지 않는 대신 흐리게 표시해 "준비 중"임을 알린다.
const navItems = [
  { icon: LayoutDashboard, label: '대시보드', href: '/' },
  { icon: Columns2, label: '비교', href: '/compare' },
  { icon: Download, label: '내보내기 (준비 중)', href: null },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-14 shrink-0 bg-white border-r border-gray-100 flex flex-col items-center py-4 gap-1">
      {navItems.map(({ icon: Icon, label, href }) => {
        const active = pathname === href;
        return (
          <button
            key={label}
            title={label}
            disabled={!href}
            onClick={() => href && router.push(href)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              !href
                ? 'text-gray-300 cursor-not-allowed'
                : active
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
          >
            <Icon size={18} />
          </button>
        );
      })}
      <div className="flex-1" />
      <button
        title="설정 (준비 중)"
        disabled
        className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-300 cursor-not-allowed transition-colors"
      >
        <Settings size={18} />
      </button>
    </aside>
  );
}
