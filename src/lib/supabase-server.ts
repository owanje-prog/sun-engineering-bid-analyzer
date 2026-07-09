import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 서버 컴포넌트·라우트 핸들러용 Supabase 클라이언트.
// 요청마다 새로 만들어야 하며, next/headers의 쿠키 저장소로 세션을 읽고 쓴다.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // 서버 컴포넌트에서는 쿠키 쓰기가 막혀 있을 수 있다(에러 무시).
          // 실제 세션 갱신 쓰기는 proxy.ts가 담당한다.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
}
