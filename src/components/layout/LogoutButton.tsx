'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LogoutButton({ email }: { email?: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <div className="ml-auto flex items-center gap-3">
      {email && <span className="text-xs text-gray-400 hidden sm:inline">{email}</span>}
      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        <LogOut size={13} />
        {loading ? '로그아웃 중...' : '로그아웃'}
      </button>
    </div>
  );
}
