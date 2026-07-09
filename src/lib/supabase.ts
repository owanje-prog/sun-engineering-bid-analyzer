import { createBrowserClient } from '@supabase/ssr';

// 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트.
// @supabase/ssr의 createBrowserClient는 세션을 쿠키에 저장하므로
// 서버(proxy·서버 컴포넌트)에서도 같은 로그인 상태를 읽을 수 있다.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
