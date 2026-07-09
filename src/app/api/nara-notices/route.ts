import { NextRequest, NextResponse } from 'next/server';
import { searchNaraNotices, type NoticeCategory } from '@/lib/nara-api';

const CATEGORIES: NoticeCategory[] = ['cnstwk', 'servc', 'thng', 'frgcpt'];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const keyword = searchParams.get('keyword') ?? undefined;
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');

  if (!category || !CATEGORIES.includes(category as NoticeCategory)) {
    return NextResponse.json({ error: '카테고리가 올바르지 않습니다.' }, { status: 400 });
  }
  if (!fromDate || !toDate) {
    return NextResponse.json({ error: '조회 기간(fromDate, toDate)이 필요합니다.' }, { status: 400 });
  }

  try {
    const result = await searchNaraNotices({
      category: category as NoticeCategory,
      keyword,
      fromDate,
      toDate,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
