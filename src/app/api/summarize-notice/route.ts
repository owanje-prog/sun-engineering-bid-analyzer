import { NextRequest, NextResponse } from 'next/server';
import { summarizeNotice, GeminiApiError, GeminiRateLimitError } from '@/lib/gemini-api';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const { title, organization, deadline, rawText } = body as {
    title?: string | null;
    organization?: string | null;
    deadline?: string | null;
    rawText?: string;
  };

  if (!rawText || !rawText.trim()) {
    return NextResponse.json({ error: '요약할 공고 원문이 없습니다.' }, { status: 400 });
  }

  try {
    const result = await summarizeNotice({
      title: title ?? null,
      organization: organization ?? null,
      deadline: deadline ?? null,
      rawText,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GeminiRateLimitError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    const message = err instanceof GeminiApiError ? err.message : '요약 중 알 수 없는 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
