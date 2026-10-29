import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  PageBreak,
  Packer,
  HeadingLevel,
} from 'docx';
import { GeneratedExam } from '../types/exam';

const FONT_FAMILY = 'Times New Roman';
// In docx library, font size is defined in half-points. 13pt = 26.
const SIZE_BODY = 26; // 13pt
const SIZE_SUB = 22; // 11pt
const SIZE_H1 = 28; // 14pt
const SIZE_H2 = 26; // 13pt

const nfc = (text?: string): string => (text || '').normalize('NFC');

function createPromptTextRuns(prompt: string): TextRun[] {
  const normalized = nfc(prompt);
  // Split by quoted phrases: "...", “...”, '...', ‘...’
  const parts = normalized.split(/([“"‘'][^”"’']+[”"’'])/g);
  return parts.map((part) => {
    const isQuoted = /^[“"‘'].+[”"’']$/.test(part);
    return new TextRun({
      text: part,
      font: FONT_FAMILY,
      size: SIZE_BODY,
      italics: isQuoted,
      color: '000000',
    });
  });
}

const BORDER_NONE = {
  style: BorderStyle.NONE,
  size: 0,
  color: 'auto',
};

const CELL_NO_BORDER = {
  top: BORDER_NONE,
  bottom: BORDER_NONE,
  left: BORDER_NONE,
  right: BORDER_NONE,
};

const BORDER_THIN = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: '000000',
};

const CELL_TABLE_BORDER = {
  top: BORDER_THIN,
  bottom: BORDER_THIN,
  left: BORDER_THIN,
  right: BORDER_THIN,
};

function createHeaderTable(exam: GeneratedExam): Table {
  const { examHeader } = exam;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: CELL_NO_BORDER,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            borders: CELL_NO_BORDER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: (examHeader.department || 'SỞ GIÁO DỤC VÀ ĐÀO TẠO').toUpperCase(),
                    font: FONT_FAMILY,
                    size: SIZE_BODY,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: (examHeader.school || 'TRƯỜNG THPT').toUpperCase(),
                    font: FONT_FAMILY,
                    size: SIZE_BODY,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '-----------------------',
                    font: FONT_FAMILY,
                    size: SIZE_SUB,
                    color: '000000',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: examHeader.pageCountNotice || '(Đề kiểm tra có 02 trang)',
                    font: FONT_FAMILY,
                    size: SIZE_SUB,
                    italics: true,
                    color: '000000',
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            borders: CELL_NO_BORDER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: (examHeader.examTitle || 'KIỂM TRA ĐỊNH KỲ').toUpperCase(),
                    font: FONT_FAMILY,
                    size: SIZE_H1,
                    bold: true,
                    color: '000000',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `NĂM HỌC ${examHeader.academicYear || '2024 - 2025'} - ${examHeader.semester || 'HỌC KỲ I'}`,
                    font: FONT_FAMILY,
                    size: SIZE_BODY,
                    bold: true,
                    color: '000000',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Môn: ${(examHeader.subject || 'NGỮ VĂN').toUpperCase()} - LỚP ${examHeader.grade || '11'}`,
                    font: FONT_FAMILY,
                    size: SIZE_BODY,
                    bold: true,
                    color: '000000',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: examHeader.timeNotice || `Thời gian làm bài: ${examHeader.duration || 90} phút (không kể thời gian phát đề)`,
                    font: FONT_FAMILY,
                    size: SIZE_BODY,
                    italics: true,
                    color: '000000',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createExamContentElements(exam: GeneratedExam): (Paragraph | Table)[] {
  const { sourcePassage, readingSection, writingSection } = exam;
  const elements: (Paragraph | Table)[] = [];

  elements.push(createHeaderTable(exam));
  elements.push(new Paragraph({ spacing: { before: 200, after: 150 } }));

  // PHẦN I. ĐỌC HIỂU
  elements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: `I. ${readingSection.sectionTitle || 'ĐỌC HIỂU'} (${readingSection.sectionScore} điểm)`,
          font: FONT_FAMILY,
          size: SIZE_H2,
          bold: true,
        }),
      ],
    })
  );

  elements.push(
    new Paragraph({
      spacing: { before: 50, after: 100 },
      children: [
        new TextRun({
          text: 'Đọc văn bản sau:',
          font: FONT_FAMILY,
          size: SIZE_BODY,
          bold: true,
          italics: true,
        }),
      ],
    })
  );

  if (sourcePassage.title) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 100 },
        children: [
          new TextRun({
            text: sourcePassage.title.toUpperCase(),
            font: FONT_FAMILY,
            size: SIZE_BODY,
            bold: true,
          }),
        ],
      })
    );
  }

  const passageLines = sourcePassage.content.split('\n');
  for (const line of passageLines) {
    if (line.trim().length > 0) {
      elements.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          indent: { left: 400, right: 400 },
          children: [
            new TextRun({
              text: nfc(line.trim()),
              font: FONT_FAMILY,
              size: SIZE_BODY,
              italics: true,
              color: '000000',
            }),
          ],
        })
      );
    }
  }

  elements.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 100, after: 200 },
      children: [
        new TextRun({
          text: `(Nguồn: ${nfc(sourcePassage.author)}, "${nfc(sourcePassage.title)}", ${nfc(sourcePassage.source)})`,
          font: FONT_FAMILY,
          size: SIZE_BODY,
          italics: true,
          color: '000000',
        }),
      ],
    })
  );

  elements.push(
    new Paragraph({
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({
          text: 'Thực hiện các yêu cầu sau:',
          font: FONT_FAMILY,
          size: SIZE_BODY,
          bold: true,
          italics: true,
          color: '000000',
        }),
      ],
    })
  );

  // Reading questions
  for (const q of readingSection.questions) {
    elements.push(
      new Paragraph({
        spacing: { before: 80, after: 80 },
        children: [
          new TextRun({
            text: `Câu ${q.questionNumber} (${q.score} điểm): `,
            font: FONT_FAMILY,
            size: SIZE_BODY,
            bold: true,
            color: '000000',
          }),
          ...createPromptTextRuns(q.prompt),
        ],
      })
    );
  }

  // PHẦN II. LÀM VĂN / VIẾT
  if (writingSection && writingSection.sectionScore > 0) {
    elements.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 250, after: 100 },
        children: [
          new TextRun({
            text: `II. ${writingSection.sectionTitle || 'LÀM VĂN'} (${writingSection.sectionScore} điểm)`,
            font: FONT_FAMILY,
            size: SIZE_H2,
            bold: true,
            color: '000000',
          }),
        ],
      })
    );

    let writingQIndex = 1;

    if (writingSection.hasParagraph && writingSection.paragraphQuestion) {
      const pq = writingSection.paragraphQuestion;
      elements.push(
        new Paragraph({
          spacing: { before: 80, after: 80 },
          children: [
            new TextRun({
              text: `Câu ${writingQIndex} (${pq.score} điểm): `,
              font: FONT_FAMILY,
              size: SIZE_BODY,
              bold: true,
              color: '000000',
            }),
            ...createPromptTextRuns(pq.prompt),
          ],
        })
      );
      writingQIndex++;
    }

    if (writingSection.hasEssay && writingSection.essayQuestion) {
      const eq = writingSection.essayQuestion;
      elements.push(
        new Paragraph({
          spacing: { before: 80, after: 80 },
          children: [
            new TextRun({
              text: `Câu ${writingQIndex} (${eq.score} điểm): `,
              font: FONT_FAMILY,
              size: SIZE_BODY,
              bold: true,
              color: '000000',
            }),
            ...createPromptTextRuns(eq.prompt),
          ],
        })
      );
    }
  }

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 100 },
      children: [
        new TextRun({
          text: '---------- HẾT ----------',
          font: FONT_FAMILY,
          size: SIZE_BODY,
          bold: true,
        }),
      ],
    })
  );

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 50, after: 200 },
      children: [
        new TextRun({
          text: '- Thí sinh không được sử dụng tài liệu.\n- Cán bộ coi thi không giải thích gì thêm.',
          font: FONT_FAMILY,
          size: SIZE_SUB,
          italics: true,
        }),
      ],
    })
  );

  return elements;
}

function createAnswerGuideElements(exam: GeneratedExam): (Paragraph | Table)[] {
  const { examHeader, answerGuide } = exam;
  const elements: (Paragraph | Table)[] = [];

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({
          text: 'ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM',
          font: FONT_FAMILY,
          size: SIZE_H1,
          bold: true,
        }),
      ],
    })
  );

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 50, after: 200 },
      children: [
        new TextRun({
          text: `Môn: Ngữ văn - Lớp ${examHeader.grade} (Thời gian: ${examHeader.duration} phút - Tổng điểm: ${examHeader.totalScore})`,
          font: FONT_FAMILY,
          size: SIZE_BODY,
          italics: true,
        }),
      ],
    })
  );

  const answerRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 12, type: WidthType.PERCENTAGE },
          borders: CELL_TABLE_BORDER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Phần', bold: true, font: FONT_FAMILY, size: SIZE_BODY })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          borders: CELL_TABLE_BORDER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Câu', bold: true, font: FONT_FAMILY, size: SIZE_BODY })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 66, type: WidthType.PERCENTAGE },
          borders: CELL_TABLE_BORDER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Nội dung yêu cầu cần đạt', bold: true, font: FONT_FAMILY, size: SIZE_BODY })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 12, type: WidthType.PERCENTAGE },
          borders: CELL_TABLE_BORDER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Điểm', bold: true, font: FONT_FAMILY, size: SIZE_BODY })],
            }),
          ],
        }),
      ],
    }),
  ];

  let isFirstReading = true;
  for (const item of answerGuide.readingAnswers) {
    answerRows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 12, type: WidthType.PERCENTAGE },
            borders: CELL_TABLE_BORDER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: isFirstReading ? 'I. ĐỌC HIỂU' : '',
                    bold: true,
                    font: FONT_FAMILY,
                    size: SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            borders: CELL_TABLE_BORDER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Câu ${item.questionNumber}`,
                    bold: true,
                    font: FONT_FAMILY,
                    size: SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 66, type: WidthType.PERCENTAGE },
            borders: CELL_TABLE_BORDER,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: item.criteria ? `Tiêu chí: ${item.criteria}\n` : '',
                    italics: true,
                    font: FONT_FAMILY,
                    size: SIZE_SUB,
                    color: '000000',
                  }),
                  ...createPromptTextRuns(item.detailedAnswer),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 12, type: WidthType.PERCENTAGE },
            borders: CELL_TABLE_BORDER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${item.score}`,
                    bold: true,
                    font: FONT_FAMILY,
                    size: SIZE_BODY,
                    color: '000000',
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
    isFirstReading = false;
  }

  // Writing Paragraph Rubric (if any)
  if (answerGuide.paragraphRubric && answerGuide.paragraphRubric.criteriaList) {
    let isFirstPara = true;
    for (const crit of answerGuide.paragraphRubric.criteriaList) {
      answerRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 12, type: WidthType.PERCENTAGE },
              borders: CELL_TABLE_BORDER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: isFirstPara ? 'II. LÀM VĂN' : '',
                      bold: true,
                      font: FONT_FAMILY,
                      size: SIZE_BODY,
                      color: '000000',
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              borders: CELL_TABLE_BORDER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: isFirstPara ? 'Câu 1\n(Đoạn văn)' : '',
                      font: FONT_FAMILY,
                      size: SIZE_BODY,
                      color: '000000',
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 66, type: WidthType.PERCENTAGE },
              borders: CELL_TABLE_BORDER,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${crit.name}: `,
                      bold: true,
                      font: FONT_FAMILY,
                      size: SIZE_BODY,
                      color: '000000',
                    }),
                    ...createPromptTextRuns(crit.requirement),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 12, type: WidthType.PERCENTAGE },
              borders: CELL_TABLE_BORDER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `${crit.score}`,
                      font: FONT_FAMILY,
                      size: SIZE_BODY,
                      color: '000000',
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
      isFirstPara = false;
    }
  }

  // Writing Essay Rubric
  if (answerGuide.essayRubric && answerGuide.essayRubric.criteriaList) {
    let isFirstEssay = true;
    for (const crit of answerGuide.essayRubric.criteriaList) {
      answerRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 12, type: WidthType.PERCENTAGE },
              borders: CELL_TABLE_BORDER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: isFirstEssay && !answerGuide.paragraphRubric ? 'II. LÀM VĂN' : '',
                      bold: true,
                      font: FONT_FAMILY,
                      size: SIZE_BODY,
                      color: '000000',
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              borders: CELL_TABLE_BORDER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: isFirstEssay ? (answerGuide.paragraphRubric ? 'Câu 2\n(Bài văn)' : 'Câu 1\n(Bài văn)') : '',
                      font: FONT_FAMILY,
                      size: SIZE_BODY,
                      color: '000000',
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 66, type: WidthType.PERCENTAGE },
              borders: CELL_TABLE_BORDER,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${crit.name}: `,
                      bold: true,
                      font: FONT_FAMILY,
                      size: SIZE_BODY,
                      color: '000000',
                    }),
                    ...createPromptTextRuns(crit.requirement),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 12, type: WidthType.PERCENTAGE },
              borders: CELL_TABLE_BORDER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `${crit.score}`,
                      font: FONT_FAMILY,
                      size: SIZE_BODY,
                      color: '000000',
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
      isFirstEssay = false;
    }
  }

  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: CELL_TABLE_BORDER,
      rows: answerRows,
    })
  );

  return elements;
}

// 1. Export FULL: Đề thi + Đáp án + Ma trận & Đặc tả
export async function exportExamToDocx(exam: GeneratedExam): Promise<Blob> {
  const children: (Paragraph | Table)[] = [
    ...createExamContentElements(exam),
    new Paragraph({ children: [new PageBreak()] }),
    ...createAnswerGuideElements(exam),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, bottom: 1134, left: 1417, right: 1134 },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

// 2. Export ONLY Exam: Chỉ Đề thi
export async function exportExamOnlyDocx(exam: GeneratedExam): Promise<Blob> {
  const children: (Paragraph | Table)[] = [...createExamContentElements(exam)];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, bottom: 1134, left: 1417, right: 1134 },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

// 3. Export ONLY Answer Guide: Chỉ Đáp án & Hướng dẫn chấm
export async function exportAnswerGuideOnlyDocx(exam: GeneratedExam): Promise<Blob> {
  const children: (Paragraph | Table)[] = [...createAnswerGuideElements(exam)];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, bottom: 1134, left: 1417, right: 1134 },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
