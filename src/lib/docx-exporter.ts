import type { EngineerCareer, NoticeData, ProjectRecord } from '@/types/notice';
import {
  Document, Packer, Paragraph, Table, TableCell, TableRow,
  TextRun, HeadingLevel, WidthType, BorderStyle,
} from 'docx';

function cell(text: string, header = false) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: header, size: header ? 20 : 18 })],
    })],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    },
  });
}

function makeTable(headers: string[], rows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: headers.map(h => cell(h, true)), tableHeader: true }),
      ...rows.map(row => new TableRow({ children: row.map(v => cell(v)) })),
    ],
  });
}

export async function exportNoticeDocx(
  notice: NoticeData,
  projectRecords: ProjectRecord[],
  engineerCareers: EngineerCareer[],
): Promise<void> {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: notice.title ?? '공고명 미확인', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ children: [new TextRun({ text: `발주기관: ${notice.organization ?? '확인 필요'}`, size: 22 })] }),
        new Paragraph({ text: '' }),

        new Paragraph({ text: '유사용역 실적', heading: HeadingLevel.HEADING_2 }),
        makeTable(
          ['용역명', '발주기관', '계약금액', '용역기간', '수행내용'],
          projectRecords.length > 0
            ? projectRecords.map(r => [r.serviceName, r.client, r.contractAmount, r.period, r.description])
            : [['', '', '', '', '']],
        ),
        new Paragraph({ text: '' }),

        new Paragraph({ text: '기술자 경력', heading: HeadingLevel.HEADING_2 }),
        makeTable(
          ['성명', '직위', '자격증', '투입기간', '담당업무'],
          engineerCareers.length > 0
            ? engineerCareers.map(c => [c.name, c.position, c.license, c.deployPeriod, c.role])
            : [['', '', '', '', '']],
        ),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${notice.title ?? '공고'}_실적경력.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
