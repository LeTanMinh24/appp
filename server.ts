import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.NODE_ENV === 'production' ? (Number(process.env.PORT) || 3000) : 3000;

app.use(express.json({ limit: '15mb' }));

// Server-side Google GenAI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Resilient model execution with fallback
async function generateWithGeminiFallback(contents: any, config: any) {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastErr = null;
  for (const model of models) {
    try {
      const resp = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      if (resp && resp.text) {
        return resp;
      }
    } catch (err: any) {
      console.warn(`Model ${model} encountered error, trying fallback if available:`, err?.message || err);
      lastErr = err;
    }
  }
  throw lastErr || new Error('Không thể kết nối với Gemini AI.');
}

// Robust JSON parse helper with sanitization
function parseGeminiJson(rawText: string): any {
  let text = rawText.trim();
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  try {
    return JSON.parse(text);
  } catch (e: any) {
    console.warn('Initial JSON.parse failed, attempting repair...');
    const lastBraceIndex = text.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      try {
        return JSON.parse(text.substring(0, lastBraceIndex + 1));
      } catch (e2) {}
    }
    throw new Error('Dữ liệu AI trả về không đúng định dạng JSON chuẩn.');
  }
}

// Endpoint to generate full literature exam
app.post('/api/generate-exam', async (req: Request, res: Response) => {
  try {
    const {
      grade = '11',
      textbook = 'Kết nối tri thức với cuộc sống',
      topic = 'Truyện ngắn, tiểu thuyết',
      examType = 'Kiểm tra giữa kỳ I',
      customExamTitle = '',
      durationMinutes = 90,
      totalScore = 10,
      sampleModel = 'B',
      readingQuestionCount = 5,
      readingScore = 6.0,
      writingParagraphScore = 0,
      writingEssayScore = 4.0,
      readingQuestionScores = [1.0, 1.0, 1.0, 1.5, 1.5],
      essayType = 'Nghị luận văn học',
      sourceText,
      includeMatrix = true,
      includeSpecification = true,
      includeRubric = true,
      schoolHeader = {
        department: 'SỞ GIÁO DỤC VÀ ĐÀO TẠO',
        schoolName: 'TRƯỜNG THPT',
        academicYear: '2024 - 2025',
        semester: 'HỌC KỲ I',
      },
      teacherPromptNote = '',
    } = req.body;

    // 1. Kiểm tra ngữ liệu nguồn
    if (!sourceText || !sourceText.content || sourceText.content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Chưa có ngữ liệu nguồn. Hệ thống tuân thủ nguyên tắc sư phạm của GDPT 2018: ưu tiên sử dụng 100% đúng văn bản do giáo viên cung cấp, không tự bịa đặt tác giả, tác phẩm hay nguồn xuất xứ. Thầy/Cô vui lòng nhập văn bản, tải tệp tài liệu, bấm "Gợi ý ngữ liệu chuẩn GDPT 2018" hoặc chọn từ Ngân hàng ngữ liệu.',
      });
    }

    const words = sourceText.content.trim().split(/\s+/).length;
    if (words < 40) {
      return res.status(400).json({
        success: false,
        error: `Văn bản nguồn quá ngắn (${words} từ). Để xây dựng đề thi gồm ${readingQuestionCount} câu đọc hiểu và bài viết nghị luận chất lượng theo chuẩn GDPT 2018, văn bản cần độ dài thích hợp (tối thiểu khoảng 50 - 300 từ tùy thể loại thơ hoặc văn xuôi). Vui lòng bổ sung đoạn trích đầy đủ hơn.`,
      });
    }

    // 2. System Instruction
    const systemInstruction = `Bạn là Chuyên gia Khảo thí và Giảng viên Sư phạm Ngữ văn THPT hàng đầu Việt Nam, am hiểu sâu sắc Chương trình GDPT 2018 môn Ngữ văn và định hướng đề thi của Bộ Giáo dục và Đào tạo.

NGUYÊN TẮC BẮT BUỘC:
1. MÔN HỌC & CẤP HỌC: Chỉ tạo đề môn NGỮ VĂN cấp THPT (Lớp ${grade}). Tuyệt đối không tạo môn khác.
2. ĐÚNG CHUẨN KHỐI LỚP VÀ BỘ SÁCH:
   - Đề thi PHẢI ĐÚNG theo yêu cầu cần đạt của môn Ngữ văn LỚP ${grade} và định hướng của bộ sách "${textbook}".
   - TUYỆT ĐỐI không lấy nhầm nội dung, tác phẩm hay chuẩn kiến thức của khối lớp khác (ví dụ: đang làm Lớp 10 thì không lấy kiến thức hay yêu cầu của Lớp 11 hoặc Lớp 12).
3. NGUYÊN TẮC VĂN BẢN NGUỒN:
   - SỬ DỤNG 100% ĐÚNG VĂN BẢN NGUỒN DO GIÁO VIÊN CUNG CẤP.
   - Tuyệt đối không tự bịa đặt tác giả, tên tác phẩm, nguồn trích dẫn hay năm xuất bản nếu không có trong ngữ liệu.
   - Các câu hỏi và đáp án đọc hiểu PHẢI CÓ CĂN CỨ TRỰC TIẾP trong văn bản nguồn đã cung cấp. Không hỏi về các chi tiết không xuất hiện trong ngữ liệu.
4. ĐẶC TRƯNG THỂ LOẠI (CỰC KỲ QUAN TRỌNG):
   - Thể loại ngữ liệu: "${sourceText.genre || topic}".
   - NẾU LÀ THƠ / ĐOẠN THƠ: Các câu hỏi đọc hiểu PHẢI khai thác đúng đặc trưng thể loại thơ: thể thơ, vần, nhịp, từ ngữ, hình ảnh thơ, biện pháp tu từ nghệ thuật (ẩn dụ, hoán dụ, so sánh, điệp ngữ...), nhân vật trữ tình, tâm trạng / cảm xúc của chủ thể trữ tình, cảm hứng chủ đạo, thông điệp ý nghĩa rút ra từ bài thơ. TUYỆT ĐỐI không hỏi về "ngôi kể", "người kể chuyện", "cốt truyện", "tình huống truyện" khi ngữ liệu là thơ!
   - NẾU LÀ TRUYỆN NGẮN / TIỂU THUYẾT: Câu hỏi khai thác ngôi kể, điểm nhìn trần thuật, tình huống truyện, chi tiết nghệ thuật tiêu biểu, diễn biến tâm lý, tính cách, hành động của nhân vật, nghệ thuật xây dựng nhân vật, chủ đề tư tưởng.
   - NẾU LÀ VĂN BẢN NGHỊ LUẬN: Câu hỏi khai thác luận đề, luận điểm, lí lẽ, dẫn chứng, mục đích và thái độ, tình cảm của người viết.
   - NẾU LÀ VĂN BẢN THÔNG TIN: Câu hỏi khai thác dữ liệu, thông tin cơ bản, thông tin chi tiết, cách trình bày thông tin, phương tiện phi ngôn ngữ.
5. CẤU TRÚC ĐỀ VÀ THANG ĐIỂM:
   - Tổng điểm toàn bài: ${totalScore}.0 điểm.
   - PHẦN I. ĐỌC HIỂU: Đúng ${readingQuestionCount} câu tự luận (đánh số từ Câu 1 đến Câu ${readingQuestionCount}), tổng điểm là ${readingScore}.0 điểm.
     * Điểm từng câu theo phân bổ: ${JSON.stringify(readingQuestionScores)}.
     * Phân bố mức độ nhận thức:
       - Các câu đầu: Nhận biết (chỉ ra thể thơ/ngôi kể, chi tiết, phương thức biểu đạt, từ ngữ...).
       - Các câu giữa: Thông hiểu (giải thích ý nghĩa hình ảnh, phân tích tâm trạng/tác dụng biện pháp tu từ, thông điệp...).
       - Câu cuối: Vận dụng (bài học rút ra, liên hệ nhận thức hoặc hành động thực tiễn).
   - PHẦN II. VIẾT: Tổng điểm là ${Number(writingParagraphScore) + Number(writingEssayScore)}.0 điểm.
     * Mẫu A: Không có phần viết (0.0 điểm).
     * Mẫu B: Không có đoạn văn ngắn, chỉ có 1 bài văn hoàn chỉnh (${writingEssayScore}.0 điểm).
     * Mẫu C: Có 1 đoạn văn khoảng 200 chữ (${writingParagraphScore}.0 điểm) và 1 bài văn hoàn chỉnh (${writingEssayScore}.0 điểm).
     * Kiểu bài viết: "${essayType}".
       - "Nghị luận văn học": Yêu cầu viết bài văn phân tích, đánh giá nét đặc sắc về nội dung và nghệ thuật của đoạn trích ngữ liệu đọc hiểu trên (phù hợp Lớp ${grade}).
       - "Nghị luận xã hội": Yêu cầu viết bài văn bàn về một vấn đề tư tưởng, lối sống, trách nhiệm... được gợi mở sâu sắc từ văn bản đọc hiểu.
6. TÍNH ĐA DẠNG & SÁNG TẠO:
   - Mỗi lần tạo đề hãy xây dựng hệ thống câu hỏi độc đáo, mới mẻ, phân hóa rõ rệt, không sao chép máy móc đề mẫu có sẵn.
   - Trả về JSON thuần túy theo schema.`;

    const prompt = `YÊU CẦU TẠO BỘ ĐỀ KIỂM TRA ĐỊNH KỲ MÔN NGỮ VĂN THPT:
- Môn học: Ngữ văn (Cấp THPT)
- Khối lớp: Lớp ${grade} (Đúng chuẩn cần đạt GDPT 2018 Lớp ${grade})
- Bộ sách: ${textbook}
- Tên bài học / Chủ đề: ${topic}
- Loại đề kiểm tra: ${examType}
- Thời gian làm bài: ${durationMinutes} phút
- Tổng điểm toàn bài: ${totalScore}.0 điểm
- Cấu trúc mẫu: Mẫu ${sampleModel}
- Phần I. Đọc hiểu: Đúng ${readingQuestionCount} câu hỏi tự luận, tổng điểm đúng ${readingScore}.0 điểm (Thang điểm từng câu: ${readingQuestionScores.join(', ')} điểm)
- Phần II. Viết:
  * Điểm đoạn văn: ${writingParagraphScore}.0 điểm
  * Điểm bài văn: ${writingEssayScore}.0 điểm
  * Kiểu bài viết được chọn: ${essayType}
- Tạo kèm: Ma trận (${includeMatrix}), Bảng đặc tả (${includeSpecification}), Hướng dẫn chấm chi tiết (${includeRubric})
${teacherPromptNote ? `- Ghi chú riêng của giáo viên: ${teacherPromptNote}` : ''}
- Thời điểm tạo đề: ${new Date().toISOString()} (Tạo các câu hỏi mới mẻ, đặc sắc, không trùng lặp)

VĂN BẢN NGUỒN DO GIÁO VIÊN CUNG CẤP (BẮT BUỘC DÙNG ĐÚNG):
Tác phẩm: ${sourceText.title || 'Văn bản đọc hiểu'}
Tác giả: ${sourceText.author || 'Tác giả cung cấp theo ngữ liệu'}
Nguồn: ${sourceText.source || 'Theo ngữ liệu giáo viên'}
Thể loại: ${sourceText.genre || topic}
Nội dung văn bản:
"""
${sourceText.content}
"""

Hãy tạo đề kiểm tra, hướng dẫn chấm và ma trận kỹ thuật chuẩn GDPT 2018.`;

    const response = await generateWithGeminiFallback(prompt, {
      systemInstruction,
      temperature: 0.7,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          examTitle: { type: Type.STRING },
          readingQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionNumber: { type: Type.INTEGER },
                score: { type: Type.NUMBER },
                cognitiveLevel: { type: Type.STRING },
                prompt: { type: Type.STRING },
                criteria: { type: Type.STRING },
                detailedAnswer: { type: Type.STRING },
              },
              required: ['questionNumber', 'score', 'cognitiveLevel', 'prompt', 'criteria', 'detailedAnswer'],
            },
          },
          paragraphQuestion: {
            type: Type.OBJECT,
            properties: {
              questionNumber: { type: Type.INTEGER },
              score: { type: Type.NUMBER },
              prompt: { type: Type.STRING },
              rubric: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    requirement: { type: Type.STRING },
                  },
                  required: ['name', 'score', 'requirement'],
                },
              },
            },
          },
          essayQuestion: {
            type: Type.OBJECT,
            properties: {
              questionNumber: { type: Type.INTEGER },
              score: { type: Type.NUMBER },
              essayType: { type: Type.STRING },
              prompt: { type: Type.STRING },
              rubric: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    requirement: { type: Type.STRING },
                  },
                  required: ['name', 'score', 'requirement'],
                },
              },
            },
            required: ['prompt', 'score', 'rubric'],
          },
          matrixRows: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                contentUnit: { type: Type.STRING },
                recognitionScore: { type: Type.NUMBER },
                comprehensionScore: { type: Type.NUMBER },
                applicationScore: { type: Type.NUMBER },
                totalScore: { type: Type.NUMBER },
                percentage: { type: Type.NUMBER },
              },
              required: ['skill', 'contentUnit', 'totalScore', 'percentage'],
            },
          },
          specificationItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                unit: { type: Type.STRING },
                cognitiveLevel: { type: Type.STRING },
                assessmentCriteria: { type: Type.STRING },
                questionRef: { type: Type.STRING },
                score: { type: Type.NUMBER },
              },
              required: ['skill', 'unit', 'cognitiveLevel', 'assessmentCriteria', 'questionRef', 'score'],
            },
          },
          teacherNotice: { type: Type.STRING },
        },
        required: ['examTitle', 'readingQuestions', 'essayQuestion', 'teacherNotice'],
      },
    });

    const rawData = parseGeminiJson(response.text || '{}');

    // ==========================================
    // BACKEND RIGOROUS VALIDATION & NORMALIZATION
    // ==========================================
    if (!rawData.readingQuestions || !Array.isArray(rawData.readingQuestions)) {
      throw new Error('Dữ liệu AI trả về không có danh sách câu hỏi đọc hiểu hợp lệ.');
    }

    // 1. Chuẩn hóa câu hỏi đọc hiểu: đúng 5 câu (hoặc readingQuestionCount)
    let questions = rawData.readingQuestions;
    if (questions.length > readingQuestionCount) {
      questions = questions.slice(0, readingQuestionCount);
    }

    // Gán số câu 1-N và điểm chuẩn theo cấu hình
    questions.forEach((q: any, idx: number) => {
      q.questionNumber = idx + 1;
      if (readingQuestionScores && readingQuestionScores[idx] !== undefined) {
        q.score = readingQuestionScores[idx];
      }
    });

    const actualReadingSum = Number(questions.reduce((sum: number, q: any) => sum + (Number(q.score) || 0), 0).toFixed(2));

    // 2. Chuẩn hóa phần viết
    const hasParagraph = sampleModel === 'C' && Number(writingParagraphScore) > 0;
    const hasEssay = Number(writingEssayScore) > 0;

    let paragraphQ = undefined;
    if (hasParagraph && rawData.paragraphQuestion) {
      paragraphQ = {
        questionNumber: 1,
        score: Number(writingParagraphScore),
        cognitiveLevel: 'Vận dụng' as const,
        prompt: rawData.paragraphQuestion.prompt || 'Viết đoạn văn khoảng 200 chữ...',
        wordLimit: 'Khoảng 200 chữ',
      };
    }

    let essayQ = undefined;
    if (hasEssay && rawData.essayQuestion) {
      essayQ = {
        questionNumber: hasParagraph ? 2 : 1,
        score: Number(writingEssayScore),
        cognitiveLevel: 'Vận dụng cao' as const,
        prompt: rawData.essayQuestion.prompt || 'Viết bài văn nghị luận...',
        essayType: rawData.essayQuestion.essayType || essayType,
      };
    }

    const actualWritingSum = Number(((hasParagraph ? Number(writingParagraphScore) : 0) + (hasEssay ? Number(writingEssayScore) : 0)).toFixed(2));
    const finalTotalScore = Number((actualReadingSum + actualWritingSum).toFixed(2));

    // 3. Chuẩn hóa Hướng dẫn chấm
    const readingAnswers = questions.map((q: any) => ({
      questionNumber: q.questionNumber,
      score: q.score,
      criteria: q.criteria || `Mức độ ${q.cognitiveLevel}`,
      detailedAnswer: q.detailedAnswer || 'Học sinh trả lời đúng trọng tâm câu hỏi.',
    }));

    const paragraphRubric = hasParagraph && rawData.paragraphQuestion?.rubric ? {
      title: 'Hướng dẫn chấm đoạn văn',
      totalScore: Number(writingParagraphScore),
      criteriaList: rawData.paragraphQuestion.rubric,
    } : undefined;

    const essayRubric = hasEssay ? (rawData.essayQuestion?.rubric ? {
      title: 'Hướng dẫn chấm bài văn nghị luận',
      totalScore: Number(writingEssayScore),
      criteriaList: rawData.essayQuestion.rubric,
    } : {
      title: 'Hướng dẫn chấm bài văn nghị luận',
      totalScore: Number(writingEssayScore),
      criteriaList: [
        { name: 'Xác định đúng vấn đề nghị luận', score: 0.5, requirement: 'Nêu đúng vấn đề cần bàn luận theo yêu cầu của đề' },
        { name: 'Triển khai luận điểm, luận cứ', score: Number((Number(writingEssayScore) - 1.5).toFixed(1)) > 0 ? Number((Number(writingEssayScore) - 1.5).toFixed(1)) : 2.5, requirement: 'Hệ thống luận điểm rõ ràng, lập luận chặt chẽ, dẫn chứng xác đáng' },
        { name: 'Chính tả, ngữ pháp', score: 0.5, requirement: 'Đảm bảo chuẩn chính tả, ngữ pháp tiếng Việt, diễn đạt mạch lạc' },
        { name: 'Sáng tạo, phong cách', score: 0.5, requirement: 'Có suy nghĩ sâu sắc, mới mẻ; lời văn giàu cảm xúc, có hình ảnh' },
      ],
    }) : undefined;

    // 4. Ma trận & Đặc tả
    const matrixRows = rawData.matrixRows && rawData.matrixRows.length > 0 ? rawData.matrixRows : [
      {
        skill: 'Đọc hiểu',
        contentUnit: sourceText.genre || topic,
        recognitionScore: Number((actualReadingSum * 0.3).toFixed(1)),
        comprehensionScore: Number((actualReadingSum * 0.3).toFixed(1)),
        applicationScore: Number((actualReadingSum - Number((actualReadingSum * 0.3).toFixed(1)) * 2).toFixed(1)),
        totalScore: actualReadingSum,
        percentage: Number(((actualReadingSum / finalTotalScore) * 100).toFixed(0)),
      },
      ...(actualWritingSum > 0 ? [{
        skill: 'Viết',
        contentUnit: essayType,
        recognitionScore: 0,
        comprehensionScore: 0,
        applicationScore: actualWritingSum,
        totalScore: actualWritingSum,
        percentage: Number(((actualWritingSum / finalTotalScore) * 100).toFixed(0)),
      }] : []),
    ];

    const matrix = {
      title: 'MA TRẬN ĐỀ KIỂM TRA MÔN NGỮ VĂN (GDPT 2018)',
      rows: matrixRows,
      summary: {
        totalRecognitionScore: 2.0,
        totalComprehensionScore: 2.0,
        totalApplicationScore: finalTotalScore - 4.0,
        recognitionPercent: 20,
        comprehensionPercent: 20,
        applicationPercent: 60,
      },
    };

    const specificationTable = {
      title: 'BẢNG ĐẶC TẢ KỸ THUẬT ĐỀ KIỂM TRA',
      items: rawData.specificationItems && rawData.specificationItems.length > 0 ? rawData.specificationItems : questions.map((q: any) => ({
        skill: 'Đọc hiểu',
        unit: sourceText.genre || topic,
        cognitiveLevel: q.cognitiveLevel,
        assessmentCriteria: q.criteria || 'Yêu cầu cần đạt chuẩn GDPT 2018',
        questionRef: `Câu ${q.questionNumber}`,
        score: q.score,
      })),
    };

    const assembledExam = {
      examHeader: {
        department: schoolHeader.department || 'SỞ GIÁO DỤC VÀ ĐÀO TẠO',
        school: schoolHeader.schoolName || 'TRƯỜNG THPT',
        examTitle: (customExamTitle || examType || 'KIỂM TRA GIỮA KỲ I').toUpperCase(),
        subject: 'Ngữ văn',
        grade: String(grade),
        academicYear: schoolHeader.academicYear || '2024 - 2025',
        semester: schoolHeader.semester || 'HỌC KỲ I',
        duration: Number(durationMinutes),
        totalScore: finalTotalScore,
        instructions: '- Thí sinh không được sử dụng tài liệu.\n- Cán bộ coi thi không giải thích gì thêm.',
      },
      sourcePassage: {
        title: sourceText.title || 'Đoạn trích đọc hiểu',
        author: sourceText.author || 'Tác giả cung cấp theo ngữ liệu',
        source: sourceText.source || 'Theo văn bản giáo viên cung cấp',
        genre: sourceText.genre || topic,
        content: sourceText.content,
      },
      readingSection: {
        sectionTitle: 'ĐỌC HIỂU',
        sectionScore: actualReadingSum,
        questions: questions.map((q: any) => ({
          questionNumber: q.questionNumber,
          score: q.score,
          cognitiveLevel: q.cognitiveLevel,
          prompt: q.prompt,
        })),
      },
      writingSection: {
        sectionTitle: 'LÀM VĂN',
        sectionScore: actualWritingSum,
        hasParagraph,
        hasEssay,
        paragraphQuestion: paragraphQ,
        essayQuestion: essayQ,
      },
      answerGuide: {
        readingAnswers,
        paragraphRubric,
        essayRubric,
      },
      matrix,
      specificationTable,
      teacherNotice: rawData.teacherNotice || 'Thầy/Cô vui lòng rà soát, thẩm định và hiệu chỉnh đề thi cho phù hợp với đối tượng học sinh cụ thể của đơn vị trước khi sử dụng chính thức.',
      validationInfo: {
        isValid: questions.length === readingQuestionCount && Math.abs(finalTotalScore - totalScore) < 0.01,
        readingQuestionsCount: questions.length,
        readingScoreTotal: actualReadingSum,
        writingScoreTotal: actualWritingSum,
        totalScore: finalTotalScore,
        message: `Đã kiểm định tự động bằng mã nguồn: ${questions.length} câu đọc hiểu (${actualReadingSum} điểm) + Phần làm văn (${actualWritingSum} điểm) = Tổng ${finalTotalScore} điểm chuẩn GDPT 2018.`,
      },
    };

    return res.json({
      success: true,
      data: assembledExam,
    });
  } catch (error: any) {
    console.error('Error generating literature exam:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Có lỗi xảy ra khi tạo đề thi với AI. Vui lòng thử lại.',
    });
  }
});

// Endpoint to suggest quality standard literary passages compliant with GDPT 2018
app.post('/api/suggest-passages', async (req: Request, res: Response) => {
  try {
    const { grade = '11', genre = 'truyen', textbook = 'Kết nối tri thức với cuộc sống' } = req.body;

    const prompt = `Hãy gợi ý 3 đoạn trích ngữ liệu văn học xuất sắc, chuẩn mực, giàu giá trị tư tưởng và thẩm mỹ, phù hợp với học sinh Lớp ${grade} THPT Việt Nam (Bộ sách: ${textbook}, Thể loại: ${genre}).
YÊU CẦU:
1. Ngữ liệu phải có thật 100%, ghi rõ tác giả, tên tác phẩm, nhà xuất bản hoặc nguồn trích dẫn chính xác. TUYỆT ĐỐI KHÔNG BỊA TÁC PHẨM.
2. Độ dài đoạn trích vừa vặn cho đề kiểm tra đọc hiểu (khoảng 250 - 450 chữ).
3. Thích hợp cho Chương trình Giáo dục phổ thông 2018.`;

    const response = await generateWithGeminiFallback(prompt, {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            source: { type: Type.STRING },
            genre: { type: Type.STRING },
            description: { type: Type.STRING },
            content: { type: Type.STRING },
          },
          required: ['title', 'author', 'source', 'genre', 'content'],
        },
      },
    });

    const parsed = parseGeminiJson(response.text || '[]');
    return res.json({ success: true, passages: parsed });
  } catch (error: any) {
    console.error('Error suggesting passages:', error);
    return res.status(500).json({
      success: false,
      error: 'Không thể gợi ý ngữ liệu lúc này. Vui lòng tự nhập ngữ liệu.',
    });
  }
});

// Endpoint to extract text from uploaded .pdf, .docx, or .txt files
app.post('/api/parse-document', async (req: Request, res: Response) => {
  try {
    const { fileBase64, fileName = 'tai_lieu', fileType = '' } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ success: false, error: 'Chưa có dữ liệu tệp được gửi lên.' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    let extractedText = '';
    const lowerName = fileName.toLowerCase();

    if (lowerName.endsWith('.docx') || fileType.includes('word') || fileType.includes('officedocument')) {
      const mammoth = await import('mammoth');
      const mammothFn = (mammoth.default as any)?.extractRawText || (mammoth as any).extractRawText;
      const result = await mammothFn({ buffer });
      extractedText = result.value || '';
    } else if (lowerName.endsWith('.pdf') || fileType.includes('pdf')) {
      // 1. Phân tích văn bản PDF bằng pdf-parse
      try {
        const pdfPkg: any = await import('pdf-parse');
        const PDFParseClass = pdfPkg?.PDFParse || pdfPkg?.default?.PDFParse || pdfPkg?.default;
        if (PDFParseClass) {
          const parser = new PDFParseClass({ data: buffer });
          await parser.load();
          const textResult = await parser.getText();
          if (textResult) {
            extractedText = typeof textResult === 'string' ? textResult : (textResult.text || '');
          }
        }
      } catch (pdfErr) {
        console.warn('PDFParse thông thường thất bại, thử phân tích qua Gemini OCR:', pdfErr);
      }

      // 2. Nếu PDF dạng scan ảnh hoặc text rỗng (< 25 từ), gọi Gemini OCR đọc PDF
      const wordCount = extractedText.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount < 25 && process.env.GEMINI_API_KEY) {
        try {
          const aiResp = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      mimeType: 'application/pdf',
                      data: fileBase64,
                    },
                  },
                  {
                    text: 'Hãy trích xuất nguyên văn toàn bộ nội dung văn bản (đoạn trích văn học, bài thơ, truyện, hoặc trích đoạn ngữ liệu) trong tệp PDF này. Đảm bảo giữ đúng chính tả, ngữ pháp tiếng Việt có dấu. Chỉ trả về văn bản trích xuất, không thêm lời chào hay giải thích nào khác.',
                  },
                ],
              },
            ],
          });
          if (aiResp.text && aiResp.text.trim().length > extractedText.trim().length) {
            extractedText = aiResp.text.trim();
          }
        } catch (geminiPdfErr) {
          console.warn('Lỗi OCR PDF bằng Gemini:', geminiPdfErr);
        }
      }
    } else {
      // Plain text / Markdown
      extractedText = buffer.toString('utf-8');
    }

    // Chuẩn hóa Unicode NFC để bảo đảm hiển thị dấu tiếng Việt nguyên khối không bị phân tách
    extractedText = extractedText.normalize('NFC').trim();

    if (!extractedText) {
      return res.status(400).json({
        success: false,
        error: 'Không tìm thấy nội dung văn bản khả dụng trong tệp vừa tải lên. Vui lòng kiểm tra lại tệp hoặc thử sao chép và dán trực tiếp.',
      });
    }

    const words = extractedText.split(/\s+/).filter(Boolean).length;
    const cleanTitle = fileName.replace(/\.[^/.]+$/, '').trim();

    return res.json({
      success: true,
      text: extractedText,
      title: cleanTitle,
      wordCount: words,
      message: `Đã trích xuất thành công ${words} chữ từ tệp "${fileName}".`,
    });
  } catch (err: any) {
    console.error('Lỗi trích xuất tệp:', err);
    return res.status(500).json({
      success: false,
      error: 'Không thể đọc nội dung tệp: ' + (err?.message || 'Lỗi định dạng'),
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        port: Number(PORT),
        host: '0.0.0.0',
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Exam generator server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
