// Google Gemini API 서버 전용 클라이언트.
// API 키는 GEMINI_API_KEY 환경변수로만 읽으며, 이 파일은 API 라우트(서버)에서만 import한다.
// 절대 클라이언트 컴포넌트에서 import하지 말 것 — 키가 번들에 포함될 수 있다.

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// 공고 원문이 아무리 길어도 프롬프트에는 이 길이까지만 넣는다(과금·응답지연 방지).
const MAX_INPUT_CHARS = 20000;

export interface NoticeSummary {
  summary: string;
  eligibility: string;
  deadline: string;
}

export class GeminiRateLimitError extends Error {}
export class GeminiApiError extends Error {}

function buildPrompt(input: {
  title: string | null;
  organization: string | null;
  deadline: string | null;
  rawText: string;
}): string {
  const truncated = input.rawText.slice(0, MAX_INPUT_CHARS);
  return `당신은 공공입찰 공고문을 분석하는 보조원입니다. 아래 공고 원문을 읽고 JSON으로만 답하세요.

[공고명] ${input.title ?? '알 수 없음'}
[발주기관] ${input.organization ?? '알 수 없음'}
[문서에서 추출된 마감일] ${input.deadline ?? '알 수 없음'}

[공고 원문]
${truncated}

다음 세 항목을 채워 JSON으로 응답하세요.
- summary: 이 공고가 어떤 용역/공사인지 핵심 내용을 3~5문장으로 요약
- eligibility: 입찰 참가자격 요건을 불릿 형태 없이 문단으로 정리(자격 조건이 원문에 없으면 "원문에서 참가자격을 찾을 수 없습니다"라고 작성)
- deadline: 입찰 마감일시(원문 기준으로 확인, 없으면 "원문에서 마감일을 찾을 수 없습니다"라고 작성)`;
}

export async function summarizeNotice(input: {
  title: string | null;
  organization: string | null;
  deadline: string | null;
  rawText: string;
}): Promise<NoticeSummary> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiApiError('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');

  const text = input.rawText?.trim();
  if (!text) throw new GeminiApiError('요약할 공고 원문이 없습니다.');

  const res = await fetch(`${BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt({ ...input, rawText: text }) }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            summary: { type: 'STRING' },
            eligibility: { type: 'STRING' },
            deadline: { type: 'STRING' },
          },
          required: ['summary', 'eligibility', 'deadline'],
        },
      },
    }),
    cache: 'no-store',
  });

  if (res.status === 429) {
    throw new GeminiRateLimitError('Gemini API 호출 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.');
  }
  if (!res.ok) {
    throw new GeminiApiError(`Gemini API 호출에 실패했습니다 (HTTP ${res.status}).`);
  }

  const data = await res.json();
  const candidateText: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    throw new GeminiApiError('Gemini 응답에서 결과를 찾을 수 없습니다.');
  }

  let parsed: Partial<NoticeSummary>;
  try {
    parsed = JSON.parse(candidateText);
  } catch {
    throw new GeminiApiError('Gemini 응답을 해석할 수 없습니다.');
  }

  if (!parsed.summary || !parsed.eligibility || !parsed.deadline) {
    throw new GeminiApiError('Gemini 응답에 필요한 항목이 빠져 있습니다.');
  }

  return { summary: parsed.summary, eligibility: parsed.eligibility, deadline: parsed.deadline };
}
