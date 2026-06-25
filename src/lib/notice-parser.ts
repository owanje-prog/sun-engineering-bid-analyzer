import type { ChecklistItem, NoticeData } from '@/types/notice';
import { generateId } from '@/lib/utils';

function match(text: string, pattern: RegExp): string | null {
  const m = text.match(pattern);
  return m ? m[1].trim() : null;
}

function parseChecklist(text: string): ChecklistItem[] {
  // 제출서류 섹션 추출
  const sectionMatch = text.match(
    /제\s*출\s*서\s*류\s*[:：]?\s*([\s\S]+?)(?=\n\s*\n\s*\d+\s*\.|$)/m
  );
  if (!sectionMatch) return [];

  const block = sectionMatch[1];
  const lines = block.split('\n');
  const items: ChecklistItem[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 2) continue;
    if (/^[\d①②③④⑤⑥⑦⑧⑨○●▪◦·\-]/.test(trimmed) || /^\s*[가-힣]\.\s/.test(trimmed)) {
      const label = trimmed.replace(/^[\d①②③④⑤⑥⑦⑧⑨○●▪◦·\-]+\.?\s*/, '').trim();
      if (label.length > 1) {
        items.push({ id: generateId(), label, checked: false });
      }
    }
  }

  return items;
}

export function parseNotice(
  rawText: string,
  fileName: string,
): Omit<NoticeData, 'id' | 'uploadedAt' | 'projectRecords' | 'engineerCareers'> {
  // 공고명: "1. 공고명 :", "공고명 :", "용역명 :" 등
  // pdfjs가 줄바꿈 없이 공백으로 이어 붙이므로, 다음 번호 섹션(예: "  2. ") 앞에서 중단
  const title =
    match(rawText, /(?:\d+\s*\.\s*)?공\s*고\s*명\s*[:：]\s*(.+?)(?=\s{2,}\d+\s*\.\s|\n|$)/m) ??
    match(rawText, /(?:\d+\s*\.\s*)?용\s*역\s*명\s*[:：]\s*(.+?)(?=\s{2,}\d+\s*\.\s|\n|$)/m);

  // 발주기관: 명시적 라벨 우선, 없으면 문서 끝 서명란에서 추출
  // fallback: pdfjs가 줄바꿈 없이 공백으로 이어붙이므로 이중공백(\s{2,})을 경계로 사용
  const organization =
    match(rawText, /(?:발주기관|수요기관|발주처|계약기관)\s*[:：]\s*(.+?)(?=\s{2,}\S|\n|$)/m) ??
    match(rawText, /이상과 같이 공고합니다[\s\S]{0,300}?\s{2,}([가-힣A-Za-z]+(?:공사|공단|청|원|시|군|구|처|부)\s*[가-힣]*(?:지사|지부)?)\s*$/m) ??
    match(rawText, /([가-힣A-Za-z]{3,20}(?:공사|공단|청|원|시|군|구|처|부)\s*[가-힣]*(?:지사|지부)?)\s*$/m);

  // 예정금액 / 추정가격: ￦ 기호, 쉼표, 숫자 처리
  const estimatedAmount =
    match(rawText, /(?:추정가격|예정금액|사업예산)\s*[:：]?\s*[￦₩\s]*([\d,]+\s*원?(?:\s*\(부가세[^)]*\))?)/m) ??
    match(rawText, /예비가격기초금액\s*[:：]?\s*[￦₩\s]*([\d,]+\s*원?(?:\s*\(부가세[^)]*\))?)/m);

  // 용역기간: 다음 번호 섹션 또는 2개 이상 공백 앞에서 중단
  const servicePeriod = match(
    rawText,
    /(?:용역기간|계약기간|사업기간|이행기간)\s*[:：]?\s*(.+?)(?=\s{2,}\S|\s*[가-힣]\.\s|\n|$)/m,
  );

  // 마감일: "2026. 06. 26.(금) 10:00" 형식만 캡처
  const deadline =
    match(rawText, /(?:입찰마감일시?|접수\s*마감일시?|마감일시?|투찰마감)\s*[:：]\s*(\d{4}[-.\s]+\d{1,2}[-.\s]+\d{1,2}\.?(?:\([^)]+\))?\s*\d{1,2}:\d{2})/m) ??
    match(rawText, /(?:입찰마감일시?|접수\s*마감일시?|마감일시?|투찰마감)\s*[:：]\s*(\d{4}[-.\s]+\d{1,2}[-.\s]+\d{1,2})/m) ??
    match(rawText, /마감\s*[:：]\s*(\d{4}[-.\s]+\d{1,2}[-.\s]+\d{1,2})/m);

  // 참가자격
  const qualifications = match(
    rawText,
    /입\s*찰\s*참\s*가\s*자\s*격\s*[^)]*?\)\s*([\s\S]+?)(?=\n\s*\n\s*\d+\s*\.|공동도급|하도급|$)/m,
  ) ?? match(
    rawText,
    /참\s*가\s*자\s*격\s*[:：]?\s*([\s\S]+?)(?=\n\s*\n|\d+\s*\.\s*(?:제출서류|공동|입찰)|$)/m,
  );

  const checklist = parseChecklist(rawText);

  return {
    fileName,
    title,
    organization,
    estimatedAmount,
    servicePeriod,
    deadline,
    qualifications,
    rawText,
    checklist,
  };
}
