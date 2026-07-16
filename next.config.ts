import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 프레임워크 노출 헤더 제거(불필요한 응답 헤더 축소)
  poweredByHeader: false,

  async headers() {
    return [
      {
        // 사내 전용 도구 — robots.txt/메타태그에 더해 HTTP 헤더로도 색인 차단
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
