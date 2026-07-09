// 조달청 나라장터 입찰공고정보서비스 (data.go.kr) 서버 전용 클라이언트.
// 서비스키는 NARA_SERVICE_KEY 환경변수로만 사용하며, 클라이언트에 노출하지 않는다.

const BASE_URL = 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService';

export type NoticeCategory = 'cnstwk' | 'servc' | 'thng' | 'frgcpt';

const ENDPOINT_BY_CATEGORY: Record<NoticeCategory, string> = {
  cnstwk: 'getBidPblancListInfoCnstwkPPSSrch',
  servc: 'getBidPblancListInfoServcPPSSrch',
  thng: 'getBidPblancListInfoThngPPSSrch',
  frgcpt: 'getBidPblancListInfoFrgcptPPSSrch',
};

export interface NaraBidItem {
  bidNtceNo: string;
  bidNtceOrd: string;
  bidNtceNm: string;
  ntceInsttNm: string;
  dminsttNm: string;
  cntrctCnclsMthdNm: string;
  bidClseDt: string;
  opengDt: string;
  presmptPrce: string;
  asignBdgtAmt: string;
  rgstDt: string;
  bidNtceDtlUrl: string;
}

export interface NaraSearchParams {
  category: NoticeCategory;
  keyword?: string;
  fromDate: string; // YYYYMMDD
  toDate: string; // YYYYMMDD
  pageNo?: number;
  numOfRows?: number;
}

export interface NaraSearchResult {
  items: NaraBidItem[];
  totalCount: number;
}

export const MAX_RANGE_DAYS = 30;

function formatInqryDt(date: string, endOfDay: boolean): string {
  // YYYYMMDD -> YYYYMMDDHHmm
  return `${date}${endOfDay ? '2359' : '0000'}`;
}

function parseYyyymmdd(date: string): Date {
  return new Date(`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`);
}

// 나라장터 API는 조회 기간(inqryBgnDt~inqryEndDt)이 30일을 넘으면
// "입력범위값 초과 에러"(resultCode 07)로 거부한다.
function assertRangeWithinLimit(fromDate: string, toDate: string): void {
  const days = Math.round(
    (parseYyyymmdd(toDate).getTime() - parseYyyymmdd(fromDate).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days > MAX_RANGE_DAYS - 1) {
    throw new Error(`조회 기간은 최대 ${MAX_RANGE_DAYS}일까지 가능합니다. 기간을 좁혀서 다시 검색해 주세요.`);
  }
}

// 정상 응답은 {"response": {header, body}} 형태지만, 입력값 오류 시
// {"nkoneps.com.response.ResponseError": {header}} 처럼 최상위 키가 달라진다.
function extractHeader(data: unknown): { resultCode?: string; resultMsg?: string } | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const values = Object.values(data as Record<string, unknown>);
  for (const value of values) {
    if (value && typeof value === 'object' && 'header' in value) {
      return (value as { header?: { resultCode?: string; resultMsg?: string } }).header;
    }
  }
  return undefined;
}

export async function searchNaraNotices(params: NaraSearchParams): Promise<NaraSearchResult> {
  const serviceKey = process.env.NARA_SERVICE_KEY;
  if (!serviceKey) throw new Error('NARA_SERVICE_KEY 환경변수가 설정되지 않았습니다.');

  assertRangeWithinLimit(params.fromDate, params.toDate);

  const endpoint = ENDPOINT_BY_CATEGORY[params.category];
  const numOfRows = params.numOfRows ?? 50;

  const query = new URLSearchParams({
    serviceKey,
    pageNo: String(params.pageNo ?? 1),
    numOfRows: String(numOfRows),
    inqryDiv: '1',
    inqryBgnDt: formatInqryDt(params.fromDate, false),
    inqryEndDt: formatInqryDt(params.toDate, true),
    type: 'json',
  });

  const res = await fetch(`${BASE_URL}/${endpoint}?${query.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`나라장터 API 호출 실패 (HTTP ${res.status})`);

  const data = await res.json();
  const header = extractHeader(data);
  if (header?.resultCode !== '00') {
    throw new Error(header?.resultMsg ?? '나라장터 API 오류');
  }

  const body = (data as { response?: { body?: unknown } })?.response?.body as
    | { items?: unknown; totalCount?: unknown }
    | undefined;
  const rawItems = Array.isArray(body?.items) ? (body.items as NaraBidItem[]) : [];

  // 공고명 검색어는 API 서버 필터가 불안정해 클라이언트 측에서 부분일치로 재필터링한다.
  const keyword = params.keyword?.trim();
  const items = keyword
    ? rawItems.filter((item) => item.bidNtceNm?.includes(keyword))
    : rawItems;

  return { items, totalCount: Number(body?.totalCount ?? items.length) };
}
