import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/components/StoreProvider";
import Sidebar from "@/components/layout/Sidebar";
import LogoutButton from "@/components/layout/LogoutButton";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "선엔지니어링 입찰공고 분석기",
  description: "나라장터 입찰 공고 PDF 분석 도구 — 선엔지니어링 수주전략팀",
};

// proxy.ts와 동일한 개발용 로그인 생략 스위치 (.env.local의 SKIP_AUTH=true)
const SKIP_AUTH =
  process.env.NODE_ENV !== 'production' && process.env.SKIP_AUTH === 'true';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user: { email?: string } | null = null;

  if (SKIP_AUTH) {
    user = { email: '개발용(로그인 생략)' };
  } else {
    const supabase = await createSupabaseServerClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
  }

  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="h-full flex bg-gray-50">
        {user ? (
          // 로그인 상태: 전체 대시보드 화면(사이드바·상단바·로그아웃)
          <StoreProvider>
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 h-full">
              <header className="h-12 shrink-0 bg-white border-b border-gray-100 flex items-center px-5 gap-3">
                <span className="text-sm font-medium text-gray-800">입찰공고 분석기</span>
                <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 rounded-full px-2.5 py-0.5">
                  ⚠ 원문 확인 필요
                </span>
                <LogoutButton email={user.email} />
              </header>
              <main className="flex-1 overflow-auto p-5">
                {children}
              </main>
            </div>
          </StoreProvider>
        ) : (
          // 미로그인 상태: 로그인 페이지만 깔끔히 표시
          <div className="flex-1 min-w-0 h-full">{children}</div>
        )}
      </body>
    </html>
  );
}
