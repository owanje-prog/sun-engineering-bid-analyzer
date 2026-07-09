import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// 매직링크·가입확인 메일의 링크(token_hash)를 검증해 세션을 만들고 리디렉션한다.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  const redirectTo = request.nextUrl.clone();

  if (token_hash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      redirectTo.pathname = next;
      redirectTo.search = '';
      return NextResponse.redirect(redirectTo);
    }
  }

  // 실패 시 로그인 페이지로 (오류 표시)
  redirectTo.pathname = '/login';
  redirectTo.search = '?error=링크가 만료되었거나 올바르지 않습니다';
  return NextResponse.redirect(redirectTo);
}
