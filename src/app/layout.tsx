import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/components/StoreProvider";
import Sidebar from "@/components/layout/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "선엔지니어링 입찰공고 분석기",
  description: "나라장터 입찰 공고 PDF 분석 도구 — 선엔지니어링 수주전략팀",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="h-full flex bg-gray-50">
        <StoreProvider>
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 h-full">
            <header className="h-12 shrink-0 bg-white border-b border-gray-100 flex items-center px-5 gap-3">
              <span className="text-sm font-medium text-gray-800">입찰공고 분석기</span>
              <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 rounded-full px-2.5 py-0.5">
                ⚠ 원문 확인 필요
              </span>
            </header>
            <main className="flex-1 overflow-auto p-5">
              {children}
            </main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
