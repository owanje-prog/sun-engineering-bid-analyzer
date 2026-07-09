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

function formatInqryDt(date: string, endOfDay: boolean): string {
  // YYYYMMDD -> YYYYMMDDHHmm
  return `${date}${endOfDay ? '2359' : '0000'}`;
}

export async function searchNaraNotices(params: NaraSearchParams): Promise<NaraSearchResult> {
  const serviceKey = process.env.NARA_SERVICE_KEY;
  if (!serviceKey) throw new Error('NARA_SERVICE_KEY 환경변수가 설정되지 않았습니다.');

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
  const header = data?.response?.header;
  if (header?.resultCode !== '00') {
    throw new Error(header?.resultMsg ?? '나라장터 API 오류');
  }

  const body = data?.response?.body;
  const rawItems = Array.isArray(body?.items) ? (body.items as NaraBidItem[]) : [];

  // 공고명 검색어는 API 서버 필터가 불안정해 클라이언트 측에서 부분일치로 재필터링한다.
  const keyword = params.keyword?.trim();
  const items = keyword
    ? rawItems.filter((item) => item.bidNtceNm?.includes(keyword))
    : rawItems;

  return { items, totalCount: Number(body?.totalCount ?? items.length) };
}
