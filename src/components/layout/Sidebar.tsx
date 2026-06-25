'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, Columns2, Download, Settings } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: '대시보드', href: '/' },
  { icon: FileText, label: '공고 목록', href: '/' },
  { icon: Columns2, label: '비교', href: '/compare' },
  { icon: Download, label: '내보내기', href: '/' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-14 shrink-0 bg-white border-r border-gray-100 flex flex-col items-center py-4 gap-1">
      {navItems.map(({ icon: Icon, label, href }) => {
        const active = pathname === href && label === '대시보드';
        return (
          <button
            key={label}
            title={label}
            onClick={() => router.push(href)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              active
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
        title="설정"
        className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
      >
        <Settings size={18} />
      </button>
    </aside>
  );
}
