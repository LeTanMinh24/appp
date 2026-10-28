import React, { useState, useRef } from 'react';
import { 
  Download, 
  Printer, 
  Copy, 
  Edit3, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  FileText, 
  Eye, 
  BookmarkPlus,
  ShieldCheck,
  CheckCircle2,
  FileDown
} from 'lucide-react';
import { GeneratedExam } from '../types/exam';
import { exportExamToDocx, exportExamOnlyDocx, exportAnswerGuideOnlyDocx } from '../utils/docxExport';
import { ModalEditExam } from './ModalEditExam';
import { saveExamToHistory } from '../utils/storage';

interface ExamViewerProps {
  exam: GeneratedExam;
  onUpdateExam: (updated: GeneratedExam) => void;
  onRegenerate: () => void;
}

export const ExamViewer: React.FC<ExamViewerProps> = ({
  exam,
  onUpdateExam,
  onRegenerate,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'full' | 'exam' | 'reading_answers' | 'writing_rubric' | 'matrix'>('full');
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const answerRef = useRef<HTMLDivElement>(null);

  // Helper filename generator
  const getFilenamePrefix = () => {
    const cleanTitle = (exam.sourcePassage.title || exam.config.topic || 'De_Kiem_Tra')
      .replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '_')
      .substring(0, 30);
    return `De_Ngu_Van_Lop_${exam.config.grade}_${cleanTitle}`;
  };

  // 1. Export ONLY Exam
  const handleExportExamOnly = async () => {
    try {
      setIsExporting('exam_only');
      const blob = await exportExamOnlyDocx(exam);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${getFilenamePrefix()}_DE_THI.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Không thể xuất tệp Word. Vui lòng thử lại!');
    } finally {
      setIsExporting(null);
    }
  };

  // 2. Export ONLY Answer Key & Rubric
  const handleExportAnswersOnly = async () => {
    try {
      setIsExporting('answers_only');
      const blob = await exportAnswerGuideOnlyDocx(exam);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${getFilenamePrefix()}_DAP_AN_HUONG_DAN_CHAM.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Không thể xuất tệp Word. Vui lòng thử lại!');
    } finally {
      setIsExporting(null);
    }
  };

  // 3. Export FULL (Exam + Answers + Matrix)
  const handleExportFull = async () => {
    try {
      setIsExporting('full');
      const blob = await exportExamToDocx(exam);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${getFilenamePrefix()}_TRON_BO.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Không thể xuất tệp Word. Vui lòng thử lại!');
    } finally {
      setIsExporting(null);
    }
  };

  // Jump to answer section
  const handleJumpToAnswers = () => {
    setActiveSubTab('full');
    setTimeout(() => {
      answerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Browser print layout
  const handlePrint = () => {
    window.print();
  };

  // Save to history
  const handleSaveToHistory = () => {
    saveExamToHistory(exam);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Copy text to clipboard
  const handleCopyExamText = () => {
    let text = '';
    const { examHeader, sourcePassage, readingSection, writingSection, answerGuide } = exam;

    text += `${examHeader.department.toUpperCase()} - ${examHeader.school.toUpperCase()}\n`;
    text += `${examHeader.examTitle.toUpperCase()} - MÔN: NGỮ VĂN LỚP ${examHeader.grade}\n`;
    text += `Thời gian: ${examHeader.duration} phút - Tổng điểm: ${examHeader.totalScore} điểm\n\n`;
    text += `I. ${readingSection.sectionTitle.toUpperCase()} (${readingSection.sectionScore} điểm)\n`;
    text += `Đọc văn bản sau:\n`;
    text += `${sourcePassage.title ? sourcePassage.title + '\n' : ''}${sourcePassage.content}\n`;
    text += `(Nguồn: ${sourcePassage.author}, ${sourcePassage.source})\n\n`;
    text += `Thực hiện các yêu cầu:\n`;
    readingSection.questions.forEach((q) => {
      text += `Câu ${q.questionNumber} (${q.score} điểm): ${q.prompt}\n`;
    });
    text += `\nII. ${writingSection.sectionTitle.toUpperCase()} (${writingSection.sectionScore} điểm)\n`;
    if (writingSection.hasParagraph && writingSection.paragraphQuestion) {
      text += `Câu 1 (${writingSection.paragraphQuestion.score} điểm): ${writingSection.paragraphQuestion.prompt}\n`;
    }
    if (writingSection.hasEssay && writingSection.essayQuestion) {
      text += `${writingSection.hasParagraph ? 'Câu 2' : 'Câu 1'} (${writingSection.essayQuestion.score} điểm): ${writingSection.essayQuestion.prompt}\n`;
    }
    text += `\n---------- HẾT ----------\n\n`;
    text += `ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM\n`;
    answerGuide.readingAnswers.forEach((ans) => {
      text += `Câu ${ans.questionNumber} (${ans.score} điểm): ${ans.detailedAnswer}\n`;
    });
    if (answerGuide.essayRubric) {
      text += `\nPhần làm văn (${answerGuide.essayRubric.totalScore} điểm):\n`;
      answerGuide.essayRubric.criteriaList.forEach((c) => {
        text += `- ${c.name} (${c.score} điểm): ${c.requirement}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopiedNotification('Đã sao chép toàn bộ đề thi & đáp án vào bộ nhớ tạm!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Validation status badge */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-start space-x-3.5 print:hidden shadow-xs">
        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed flex-1">
          <span className="font-bold text-emerald-950">Đã kiểm duyệt cấu trúc & thang điểm bằng mã nguồn: </span>
          {exam.validationInfo?.message ||
            `Đề thi gồm đúng ${exam.readingSection.questions.length} câu đọc hiểu (${exam.readingSection.sectionScore} điểm) + Phần làm văn (${exam.writingSection.sectionScore} điểm) = Tổng ${exam.examHeader.totalScore} điểm chuẩn GDPT 2018.`}
        </div>
      </div>

      {/* Pedagogical Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-900 flex items-start space-x-3 text-xs leading-relaxed print:hidden">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong>Lưu ý dành cho Thầy/Cô: </strong>
          {exam.teacherNotice ||
            'Thầy/Cô vui lòng rà soát, thẩm định và hiệu chỉnh đề thi cho phù hợp với năng lực học sinh cụ thể của đơn vị trước khi sử dụng chính thức. Có thể bấm "Chỉnh sửa nội dung" để thay đổi bất kỳ câu hỏi hoặc biểu điểm nào.'}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3.5 print:hidden">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs sm:text-sm">
            <button
              onClick={() => setActiveSubTab('full')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeSubTab === 'full' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Toàn bộ đề & đáp án
            </button>
            <button
              onClick={() => setActiveSubTab('exam')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeSubTab === 'exam' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              1. Đề kiểm tra
            </button>
            <button
              onClick={() => setActiveSubTab('reading_answers')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeSubTab === 'reading_answers' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              2 & 3. Đáp án & HD Chấm Đọc hiểu
            </button>
            <button
              onClick={() => setActiveSubTab('writing_rubric')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeSubTab === 'writing_rubric' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              4 & 5. Đề viết & HD Chấm Viết
            </button>
            {exam.matrix && (
              <button
                onClick={() => setActiveSubTab('matrix')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeSubTab === 'matrix' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Ma trận & Bảng đặc tả
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-stone-500">
            <button
              onClick={handleJumpToAnswers}
              className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-900 font-semibold hover:bg-rose-100 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem đáp án nhanh</span>
            </button>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Edit, Copy, Regenerate, Save */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onRegenerate}
              className="px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 cursor-pointer"
              title="Tạo lại bộ đề mới trên cùng ngữ liệu"
            >
              <RotateCcw className="w-4 h-4 text-rose-700" />
              <span>Tạo lại đề</span>
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 cursor-pointer"
              title="Chỉnh sửa câu chữ, điểm số và đáp án"
            >
              <Edit3 className="w-4 h-4 text-rose-800" />
              <span>Chỉnh sửa nội dung</span>
            </button>

            <button
              onClick={handleCopyExamText}
              className="px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 cursor-pointer"
            >
              {copiedNotification ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedNotification ? 'Đã sao chép!' : 'Sao chép đề'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-medium flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In A4</span>
            </button>

            <button
              onClick={handleSaveToHistory}
              className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-medium flex items-center space-x-1.5 cursor-pointer"
            >
              {saveSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <BookmarkPlus className="w-4 h-4 text-amber-700" />}
              <span>{saveSuccess ? 'Đã lưu!' : 'Lưu lịch sử'}</span>
            </button>
          </div>

          {/* Word (.docx) Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExamOnly}
              disabled={isExporting !== null}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
              title="Xuất riêng tệp Word đề kiểm tra phát cho học sinh (Times New Roman 13pt)"
            >
              <FileDown className="w-4 h-4 text-blue-700" />
              <span>{isExporting === 'exam_only' ? 'Đang xuất...' : 'Xuất đề Word'}</span>
            </button>

            <button
              onClick={handleExportAnswersOnly}
              disabled={isExporting !== null}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
              title="Xuất riêng tệp Word đáp án và hướng dẫn chấm cho giám khảo (Times New Roman 13pt)"
            >
              <FileDown className="w-4 h-4 text-emerald-700" />
              <span>{isExporting === 'answers_only' ? 'Đang xuất...' : 'Xuất đáp án Word'}</span>
            </button>

            <button
              onClick={handleExportFull}
              disabled={isExporting !== null}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
              title="Xuất tệp Word trọn bộ gồm Đề thi + Đáp án + Ma trận & Đặc tả"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting === 'full' ? 'Đang tạo .docx...' : 'Xuất trọn bộ Word (.docx)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Printable Exam Paper Container */}
      <div className="bg-white rounded-2xl border border-stone-300 shadow-md p-6 sm:p-12 font-serif text-stone-900 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* ================= KHU VỰC 1 & 4: ĐỀ KIỂM TRA (ĐỌC HIỂU + ĐỀ VIẾT) ================= */}
        {(activeSubTab === 'full' || activeSubTab === 'exam') && (
          <div className="space-y-6">
            {/* Header Table (2 Cột Tiêu Đề Sư Phạm) */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-stone-300 text-center">
              <div className="space-y-0.5">
                <p className="font-bold text-xs sm:text-sm uppercase tracking-wide">
                  {exam.examHeader.department || 'SỞ GIÁO DỤC VÀ ĐÀO TẠO'}
                </p>
                <p className="font-bold text-xs sm:text-sm uppercase tracking-wide">
                  {exam.examHeader.school || 'TRƯỜNG THPT'}
                </p>
                <p className="text-xs text-stone-500 italic mt-1 font-sans">
                  (Đề thi gồm có 02 trang)
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="font-bold text-sm sm:text-base text-rose-950 uppercase tracking-wide">
                  {exam.examHeader.examTitle || 'ĐỀ KIỂM TRA ĐỊNH KỲ'}
                </p>
                <p className="font-bold text-xs sm:text-sm">
                  NĂM HỌC {exam.examHeader.academicYear} - {exam.examHeader.semester}
                </p>
                <p className="font-bold text-xs sm:text-sm">
                  Môn: NGỮ VĂN - LỚP {exam.examHeader.grade}
                </p>
                <p className="text-xs italic text-stone-600 font-sans">
                  Thời gian làm bài: {exam.examHeader.duration} phút (không kể thời gian giao đề)
                </p>
              </div>
            </div>

            {/* KHU VỰC 1: PHẦN I. ĐỌC HIỂU (6,0 ĐIỂM) */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-stone-200 pb-1">
                <h3 className="font-bold text-base sm:text-lg text-rose-950">
                  I. {exam.readingSection.sectionTitle.toUpperCase()} ({exam.readingSection.sectionScore} điểm)
                </h3>
              </div>

              <p className="italic text-sm font-sans font-medium text-stone-700">
                Đọc văn bản sau:
              </p>

              {/* Ngữ liệu văn bản nguồn */}
              <div className="p-5 sm:p-6 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                {exam.sourcePassage.title && (
                  <h4 className="text-center font-bold text-base text-stone-900 tracking-wide uppercase">
                    {exam.sourcePassage.title}
                  </h4>
                )}

                <div className="text-sm leading-relaxed text-stone-800 whitespace-pre-line text-justify font-serif">
                  {exam.sourcePassage.content}
                </div>

                <div className="text-right text-xs italic text-stone-600 pt-2 border-t border-stone-200/60 font-sans">
                  (Nguồn: {exam.sourcePassage.author}, "{exam.sourcePassage.title}", {exam.sourcePassage.source})
                </div>
              </div>

              <p className="italic text-sm font-sans font-medium text-stone-700">
                Thực hiện các yêu cầu sau:
              </p>

              {/* Danh sách 5 câu hỏi đọc hiểu */}
              <div className="space-y-3">
                {exam.readingSection.questions.map((q) => (
                  <div key={q.questionNumber} className="text-sm leading-relaxed pl-2">
                    <span className="font-bold text-stone-900">
                      Câu {q.questionNumber} ({q.score} điểm):{' '}
                    </span>
                    <span className="text-stone-800">{q.prompt}</span>
                    <span className="inline-block ml-2 px-1.5 py-0.2 rounded text-[10px] font-sans font-semibold bg-stone-100 text-stone-500 border border-stone-200 print:hidden">
                      {q.cognitiveLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* KHU VỰC 4: PHẦN II. ĐỀ BÀI VIẾT (4,0 ĐIỂM) */}
            {exam.writingSection && exam.writingSection.sectionScore > 0 && (
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div className="flex items-baseline justify-between border-b border-stone-200 pb-1">
                  <h3 className="font-bold text-base sm:text-lg text-rose-950">
                    II. {exam.writingSection.sectionTitle.toUpperCase()} ({exam.writingSection.sectionScore} điểm)
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Paragraph (if any) */}
                  {exam.writingSection.hasParagraph && exam.writingSection.paragraphQuestion && (
                    <div className="text-sm leading-relaxed pl-2">
                      <span className="font-bold text-stone-900">
                        Câu 1 ({exam.writingSection.paragraphQuestion.score} điểm):{' '}
                      </span>
                      <span className="text-stone-800">
                        {exam.writingSection.paragraphQuestion.prompt}
                      </span>
                      <span className="inline-block ml-2 px-1.5 py-0.2 rounded text-[10px] font-sans font-semibold bg-stone-100 text-stone-500 border border-stone-200 print:hidden">
                        Đoạn văn ~200 chữ
                      </span>
                    </div>
                  )}

                  {/* Essay */}
                  {exam.writingSection.hasEssay && exam.writingSection.essayQuestion && (
                    <div className="text-sm leading-relaxed pl-2">
                      <span className="font-bold text-stone-900">
                        {exam.writingSection.hasParagraph ? 'Câu 2' : 'Câu 1'} ({exam.writingSection.essayQuestion.score} điểm):{' '}
                      </span>
                      <span className="text-stone-800">
                        {exam.writingSection.essayQuestion.prompt}
                      </span>
                      <span className="inline-block ml-2 px-2 py-0.5 rounded text-[11px] font-sans font-semibold bg-rose-50 text-rose-900 border border-rose-200 print:hidden">
                        {exam.writingSection.essayQuestion.essayType || 'Bài văn nghị luận'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer của đề thi */}
            <div className="pt-8 text-center space-y-1">
              <p className="font-bold text-sm tracking-widest text-stone-700">
                ---------- HẾT ----------
              </p>
              <p className="text-xs italic text-stone-500 font-sans">
                - Thí sinh không được sử dụng tài liệu. Cán bộ coi thi không giải thích gì thêm.
              </p>
            </div>
          </div>
        )}

        {/* ================= KHU VỰC 2 & 3: ĐÁP ÁN & HƯỚNG DẪN CHẤM ĐỌC HIỂU ================= */}
        {/* ================= KHU VỰC 5: HƯỚNG DẪN CHẤM PHẦN VIẾT ================= */}
        {(activeSubTab === 'full' || activeSubTab === 'reading_answers' || activeSubTab === 'writing_rubric') && (
          <div 
            ref={answerRef}
            className={`space-y-6 ${activeSubTab === 'full' ? 'pt-12 mt-12 border-t-2 border-stone-400 print:break-before-page' : ''}`}
          >
            <div className="text-center space-y-1">
              <h2 className="font-serif font-bold text-lg sm:text-xl text-rose-950 uppercase tracking-wide">
                ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM
              </h2>
              <p className="text-xs italic text-stone-600 font-sans">
                Môn: Ngữ văn - Lớp {exam.examHeader.grade} (Thời gian: {exam.examHeader.duration} phút - Tổng điểm: {exam.examHeader.totalScore} điểm)
              </p>
            </div>

            {/* Bảng Đáp án Chi Tiết Chuẩn Quy Cách */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-stone-400 text-xs sm:text-sm">
                <thead>
                  <tr className="bg-stone-100 text-stone-900 font-bold">
                    <th className="border border-stone-400 px-3 py-2 text-center w-16">Phần</th>
                    <th className="border border-stone-400 px-3 py-2 text-center w-16">Câu</th>
                    <th className="border border-stone-400 px-4 py-2 text-center">Nội dung yêu cầu cần đạt & Biểu điểm</th>
                    <th className="border border-stone-400 px-3 py-2 text-center w-16">Điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {/* KHU VỰC 2 & 3: ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM ĐỌC HIỂU */}
                  {(activeSubTab === 'full' || activeSubTab === 'reading_answers') &&
                    exam.answerGuide.readingAnswers.map((ans, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        {idx === 0 && (
                          <td
                            rowSpan={exam.answerGuide.readingAnswers.length}
                            className="border border-stone-400 px-2 py-3 font-bold text-center align-top bg-stone-50/30"
                          >
                            I. ĐỌC HIỂU<br />
                            <span className="font-normal text-xs text-stone-500 font-sans">({exam.readingSection.sectionScore} điểm)</span>
                          </td>
                        )}
                        <td className="border border-stone-400 px-2 py-2 text-center font-bold align-top">
                          {ans.questionNumber}
                        </td>
                        <td className="border border-stone-400 px-3 py-2 leading-relaxed align-top whitespace-pre-line">
                          {ans.criteria && (
                            <div className="text-xs text-stone-500 italic mb-1 font-sans">
                              Tiêu chí: {ans.criteria}
                            </div>
                          )}
                          <div className="text-stone-900">{ans.detailedAnswer}</div>
                        </td>
                        <td className="border border-stone-400 px-2 py-2 text-center font-bold align-top">
                          {ans.score}
                        </td>
                      </tr>
                    ))}

                  {/* KHU VỰC 5: HƯỚNG DẪN CHẤM PHẦN VIẾT */}
                  {(activeSubTab === 'full' || activeSubTab === 'writing_rubric') && (
                    <>
                      {/* Paragraph Rubric (if any) */}
                      {exam.answerGuide.paragraphRubric &&
                        exam.answerGuide.paragraphRubric.criteriaList &&
                        exam.answerGuide.paragraphRubric.criteriaList.map((crit, cIdx) => (
                          <tr key={`p-${cIdx}`} className="hover:bg-stone-50/50">
                            {cIdx === 0 && (
                              <td
                                rowSpan={
                                  exam.answerGuide.paragraphRubric!.criteriaList.length +
                                  (exam.answerGuide.essayRubric?.criteriaList.length || 0)
                                }
                                className="border border-stone-400 px-2 py-3 font-bold text-center align-top bg-stone-50/30"
                              >
                                II. LÀM VĂN<br />
                                <span className="font-normal text-xs text-stone-500 font-sans">({exam.writingSection.sectionScore} điểm)</span>
                              </td>
                            )}
                            {cIdx === 0 && (
                              <td
                                rowSpan={exam.answerGuide.paragraphRubric!.criteriaList.length}
                                className="border border-stone-400 px-2 py-2 text-center font-semibold align-top"
                              >
                                Câu 1<br />
                                <span className="text-[11px] font-normal text-stone-500 font-sans">(Đoạn văn)</span>
                              </td>
                            )}
                            <td className="border border-stone-400 px-3 py-2 leading-relaxed align-top">
                              <span className="font-bold text-stone-900">{crit.name}: </span>
                              <span>{crit.requirement}</span>
                            </td>
                            <td className="border border-stone-400 px-2 py-2 text-center align-top">
                              {crit.score}
                            </td>
                          </tr>
                        ))}

                      {/* Essay Rubric */}
                      {exam.answerGuide.essayRubric &&
                        exam.answerGuide.essayRubric.criteriaList &&
                        exam.answerGuide.essayRubric.criteriaList.map((crit, eIdx) => (
                          <tr key={`e-${eIdx}`} className="hover:bg-stone-50/50">
                            {!exam.answerGuide.paragraphRubric && eIdx === 0 && (
                              <td
                                rowSpan={exam.answerGuide.essayRubric!.criteriaList.length}
                                className="border border-stone-400 px-2 py-3 font-bold text-center align-top bg-stone-50/30"
                              >
                                II. LÀM VĂN<br />
                                <span className="font-normal text-xs text-stone-500 font-sans">({exam.writingSection.sectionScore} điểm)</span>
                              </td>
                            )}
                            {eIdx === 0 && (
                              <td
                                rowSpan={exam.answerGuide.essayRubric!.criteriaList.length}
                                className="border border-stone-400 px-2 py-2 text-center font-semibold align-top"
                              >
                                {exam.answerGuide.paragraphRubric ? 'Câu 2' : 'Câu 1'}<br />
                                <span className="text-[11px] font-normal text-stone-500 font-sans">(Bài văn)</span>
                              </td>
                            )}
                            <td className="border border-stone-400 px-3 py-2 leading-relaxed align-top">
                              <span className="font-bold text-stone-900">{crit.name}: </span>
                              <span>{crit.requirement}</span>
                            </td>
                            <td className="border border-stone-400 px-2 py-2 text-center align-top">
                              {crit.score}
                            </td>
                          </tr>
                        ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= SECTION: MA TRẬN & BẢNG ĐẶC TẢ ================= */}
        {(activeSubTab === 'full' || activeSubTab === 'matrix') && exam.matrix && (
          <div className={`space-y-6 ${activeSubTab === 'full' ? 'pt-12 mt-12 border-t-2 border-stone-400 print:break-before-page' : ''}`}>
            {/* Ma Trận Đề */}
            <div className="text-center space-y-1">
              <h2 className="font-serif font-bold text-base sm:text-lg text-rose-950 uppercase tracking-wide">
                MA TRẬN ĐỀ KIỂM TRA MÔN NGỮ VĂN (GDPT 2018)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-stone-400 text-xs text-center font-sans">
                <thead>
                  <tr className="bg-stone-100 font-bold">
                    <th className="border border-stone-400 p-2">Kỹ năng</th>
                    <th className="border border-stone-400 p-2 text-left">Đơn vị kiến thức</th>
                    <th className="border border-stone-400 p-2">Nhận biết</th>
                    <th className="border border-stone-400 p-2">Thông hiểu</th>
                    <th className="border border-stone-400 p-2">Vận dụng</th>
                    <th className="border border-stone-400 p-2">Tổng điểm</th>
                    <th className="border border-stone-400 p-2">Tỉ lệ %</th>
                  </tr>
                </thead>
                <tbody>
                  {exam.matrix.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-stone-50">
                      <td className="border border-stone-400 p-2 font-semibold">{row.skill}</td>
                      <td className="border border-stone-400 p-2 text-left">{row.contentUnit}</td>
                      <td className="border border-stone-400 p-2">{row.recognitionScore || 0}</td>
                      <td className="border border-stone-400 p-2">{row.comprehensionScore || 0}</td>
                      <td className="border border-stone-400 p-2">{row.applicationScore || 0}</td>
                      <td className="border border-stone-400 p-2 font-bold">{row.totalScore}</td>
                      <td className="border border-stone-400 p-2">{row.percentage}%</td>
                    </tr>
                  ))}
                  {exam.matrix.summary && (
                    <tr className="bg-stone-100 font-bold">
                      <td colSpan={2} className="border border-stone-400 p-2 text-right">Tổng cộng:</td>
                      <td className="border border-stone-400 p-2">{exam.matrix.summary.totalRecognitionScore} ({exam.matrix.summary.recognitionPercent}%)</td>
                      <td className="border border-stone-400 p-2">{exam.matrix.summary.totalComprehensionScore} ({exam.matrix.summary.comprehensionPercent}%)</td>
                      <td className="border border-stone-400 p-2">{exam.matrix.summary.totalApplicationScore} ({exam.matrix.summary.applicationPercent}%)</td>
                      <td className="border border-stone-400 p-2 text-rose-900">{exam.examHeader.totalScore}</td>
                      <td className="border border-stone-400 p-2">100%</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bảng Đặc Tả Kỹ Thuật (Nếu có) */}
            {exam.specificationTable && exam.specificationTable.items && (
              <div className="space-y-3 pt-6">
                <h3 className="font-serif font-bold text-center text-sm sm:text-base text-rose-950 uppercase tracking-wide">
                  BẢNG ĐẶC TẢ KỸ THUẬT ĐỀ KIỂM TRA
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-stone-400 text-xs font-sans">
                    <thead>
                      <tr className="bg-stone-100 font-bold text-center">
                        <th className="border border-stone-400 p-2">Kỹ năng</th>
                        <th className="border border-stone-400 p-2">Đơn vị kiến thức</th>
                        <th className="border border-stone-400 p-2">Mức độ</th>
                        <th className="border border-stone-400 p-2 text-left">Yêu cầu cần đạt</th>
                        <th className="border border-stone-400 p-2">Câu hỏi</th>
                        <th className="border border-stone-400 p-2">Điểm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exam.specificationTable.items.map((it, iIdx) => (
                        <tr key={iIdx} className="hover:bg-stone-50">
                          <td className="border border-stone-400 p-2 text-center font-medium">{it.skill}</td>
                          <td className="border border-stone-400 p-2">{it.unit}</td>
                          <td className="border border-stone-400 p-2 text-center">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-stone-100 font-semibold">
                              {it.cognitiveLevel}
                            </span>
                          </td>
                          <td className="border border-stone-400 p-2 leading-relaxed">{it.assessmentCriteria}</td>
                          <td className="border border-stone-400 p-2 text-center font-semibold">{it.questionRef}</td>
                          <td className="border border-stone-400 p-2 text-center">{it.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <ModalEditExam
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        exam={exam}
        onSave={(updated) => {
          onUpdateExam(updated);
          saveExamToHistory(updated);
        }}
      />
    </div>
  );
};
