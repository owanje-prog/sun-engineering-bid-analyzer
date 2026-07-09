'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Mode = 'password' | 'magic';
type PwAction = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('password');
  const [pwAction, setPwAction] = useState<PwAction>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function reset() {
    setError(null);
    setInfo(null);
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      if (pwAction === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/');
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
        });
        if (error) throw error;
        // 이메일 확인이 꺼져 있으면 바로 세션 발급 → 대시보드로
        if (data.session) {
          router.replace('/');
          router.refresh();
        } else {
          setInfo('가입 확인 메일을 보냈습니다. 메일의 링크를 눌러 인증을 완료하세요.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleMagic(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
      });
      if (error) throw error;
      setInfo('로그인 링크를 이메일로 보냈습니다. 메일함을 확인해 주세요.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '링크 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const tabBtn = (active: boolean) =>
    `flex-1 text-xs py-2 rounded-md transition-colors ${
      active ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
    }`;

  return (
    <div className="min-h-full flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-lg font-semibold text-gray-800">입찰공고 분석기</h1>
          <p className="text-xs text-gray-400 mt-1">선엔지니어링 수주전략팀</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          {/* 로그인 방식 탭 */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-5">
            <button className={tabBtn(mode === 'password')} onClick={() => { setMode('password'); reset(); }}>
              이메일 + 비밀번호
            </button>
            <button className={tabBtn(mode === 'magic')} onClick={() => { setMode('magic'); reset(); }}>
              매직 링크
            </button>
          </div>

          {mode === 'password' ? (
            <form onSubmit={handlePassword} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="비밀번호 (6자 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
              <button
                type="submit"
                disabled={loading}
                className="text-sm py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '처리 중...' : pwAction === 'login' ? '로그인' : '회원가입'}
              </button>
              <button
                type="button"
                onClick={() => { setPwAction(pwAction === 'login' ? 'signup' : 'login'); reset(); }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                {pwAction === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMagic} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
              <button
                type="submit"
                disabled={loading}
                className="text-sm py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '발송 중...' : '로그인 링크 받기'}
              </button>
              <p className="text-xs text-gray-400 text-center">
                비밀번호 없이 이메일로 받은 링크를 눌러 로그인합니다.
              </p>
            </form>
          )}

          {error && (
            <p className="mt-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {info && (
            <p className="mt-4 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              {info}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
