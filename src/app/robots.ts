import type { MetadataRoute } from 'next';

// 사내 전용 도구 — 검색엔진·AI 크롤러 색인을 전면 차단한다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
