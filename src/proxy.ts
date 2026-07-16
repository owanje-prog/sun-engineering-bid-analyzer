import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Next.js 16부터 middleware는 proxy로 이름이 바뀌었다(기능 동일).
// 매 요청마다 (1) Supabase 세션 쿠키를 갱신하고
// (2) 로그인 안 한 사용자가 보호된 페이지에 오면 /login으로 돌려보낸다.

// 로그인 없이 접근 가능한 경로
const PUBLIC_PATHS = ['/login', '/auth'];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
}

// 개발 중 로그인 없이 작업하고 싶을 때 .env.local에 SKIP_AUTH=true 추가하면
// 이 로그인 검사를 통째로 건너뛴다. 배포 환경(production)에서는 절대 동작하지 않도록
// NODE_ENV까지 함께 확인한다.
const SKIP_AUTH =
  process.env.NODE_ENV !== 'production' && process.env.SKIP_AUTH === 'true';

export async function proxy(request: NextRequest) {
  if (SKIP_AUTH) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser()는 토큰을 서버에서 검증하므로 getSession()보다 안전하다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 로그인 안 했는데 보호된 페이지 → /login
  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 이미 로그인했는데 /login → 대시보드로
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // 정적 파일·이미지·PDF 워커·robots.txt 등은 제외하고 페이지 요청에만 적용
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|mjs|css|map|woff|woff2)$).*)',
  ],
};
