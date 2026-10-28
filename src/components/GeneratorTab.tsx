import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FileText, 
  BookOpen, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  RefreshCw, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  Library,
  Feather,
  Wand2,
  FileCheck
} from 'lucide-react';
import { 
  ExamConfig, 
  GeneratedExam, 
  GradeLevel, 
  TextbookSeries, 
  ExamType, 
  SampleModelType, 
  SourcePassage, 
  LiteraryGenre 
} from '../types/exam';
import { PassageSelectorModal } from './PassageSelectorModal';
import { ExamViewer } from './ExamViewer';
import { getSchoolSettings, saveExamToHistory } from '../utils/storage';
import { DEFAULT_PASSAGES } from '../data/defaultPassages';

interface GeneratorTabProps {
  initialModel?: SampleModelType;
  loadedExam?: GeneratedExam | null;
  onClearLoadedExam?: () => void;
}

export const GeneratorTab: React.FC<GeneratorTabProps> = ({
  initialModel = 'B',
  loadedExam = null,
  onClearLoadedExam,
}) => {
  // CẤU HÌNH ĐỀ MẶC ĐỊNH THEO YÊU CẦU:
  // - Môn học: Ngữ văn
  // - Khối lớp: 11
  // - Bộ sách: Kết nối tri thức với cuộc sống
  // - Loại kiểm tra: Giữa kỳ I (Kiểm tra giữa kỳ I)
  // - Cấu trúc: B
  // - Thời gian: 90 phút
  // - Chủ đề: Truyện ngắn, tiểu thuyết
  // - Tổng điểm: 10 điểm
  // - Phần I: Đọc hiểu 5 câu tự luận, tổng 6,0 điểm
  // - Phần II: Viết bài văn nghị luận văn học hoặc nghị luận xã hội theo lựa chọn, tổng 4,0 điểm
  const [grade, setGrade] = useState<GradeLevel>('11');
  const [textbook, setTextbook] = useState<TextbookSeries>('Kết nối tri thức với cuộc sống');
  const [topic, setTopic] = useState<string>('Truyện ngắn, tiểu thuyết');
  const [examType, setExamType] = useState<ExamType>('Kiểm tra giữa kỳ I');
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [totalScore, setTotalScore] = useState<number>(10);
  const [sampleModel, setSampleModel] = useState<SampleModelType>(initialModel || 'B');

  // Structural Fine-tuning State
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [readingQuestionCount, setReadingQuestionCount] = useState<number>(5);
  const [readingScore, setReadingScore] = useState<number>(6.0);
  const [writingParagraphScore, setWritingParagraphScore] = useState<number>(0);
  const [writingEssayScore, setWritingEssayScore] = useState<number>(4.0);
  const [readingQuestionScores, setReadingQuestionScores] = useState<number[]>([1.0, 1.0, 1.0, 1.5, 1.5]);

  // Choice between "Nghị luận văn học" vs "Nghị luận xã hội" for Section II
  const [essayType, setEssayType] = useState<'Nghị luận văn học' | 'Nghị luận xã hội'>('Nghị luận văn học');

  // Pedagogical Elements Checkbox
  const [includeMatrix, setIncludeMatrix] = useState<boolean>(true);
  const [includeSpecification, setIncludeSpecification] = useState<boolean>(true);
  const [includeRubric, setIncludeRubric] = useState<boolean>(true);
  const [teacherPromptNote, setTeacherPromptNote] = useState<string>('');

  // Source Text State
  const [sourceText, setSourceText] = useState<SourcePassage>({
    title: '',
    author: '',
    source: '',
    genre: 'Truyện ngắn / Tiểu thuyết',
    content: '',
  });

  // UI State
  const [isPassageModalOpen, setIsPassageModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentExam, setCurrentExam] = useState<GeneratedExam | null>(loadedExam);
  const [isSuggestingPassages, setIsSuggestingPassages] = useState(false);

  // Sync when initialModel changes
  useEffect(() => {
    if (initialModel) {
      applySampleModelDefaults(initialModel);
    }
  }, [initialModel]);

  // Sync when a loaded exam from history is passed
  useEffect(() => {
    if (loadedExam) {
      setCurrentExam(loadedExam);
      setGrade(loadedExam.config.grade);
      setTextbook(loadedExam.config.textbook);
      setTopic(loadedExam.config.topic);
      setExamType(loadedExam.config.examType);
      setDurationMinutes(loadedExam.config.durationMinutes);
      setTotalScore(loadedExam.config.totalScore);
      setSampleModel(loadedExam.config.sampleModel);
      if (loadedExam.config.essayType) {
        setEssayType(loadedExam.config.essayType);
      }
      setSourceText(loadedExam.sourcePassage);
    }
  }, [loadedExam]);

  // Apply default distributions for Sample Models A, B, C
  const applySampleModelDefaults = (model: SampleModelType) => {
    setSampleModel(model);
    if (model === 'A') {
      // Đọc hiểu toàn phần
      setReadingQuestionCount(5);
      setReadingScore(10.0);
      setWritingParagraphScore(0);
      setWritingEssayScore(0);
      setReadingQuestionScores([2.0, 2.0, 2.0, 2.0, 2.0]);
      setDurationMinutes(45);
    } else if (model === 'B') {
      // Đọc hiểu 6.0đ + Viết bài văn 4.0đ
      setReadingQuestionCount(5);
      setReadingScore(6.0);
      setWritingParagraphScore(0);
      setWritingEssayScore(4.0);
      setReadingQuestionScores([1.0, 1.0, 1.0, 1.5, 1.5]);
      setDurationMinutes(90);
    } else if (model === 'C') {
      // Đọc hiểu 4.0đ + Viết đoạn 2.0đ + Viết bài 4.0đ
      setReadingQuestionCount(5);
      setReadingScore(4.0);
      setWritingParagraphScore(2.0);
      setWritingEssayScore(4.0);
      setReadingQuestionScores([0.5, 0.5, 1.0, 1.0, 1.0]);
      setDurationMinutes(90);
    }
  };

  // Adjust reading question scores when count changes
  const handleQuestionCountChange = (newCount: number) => {
    setReadingQuestionCount(newCount);
    const newScores = [...readingQuestionScores];
    if (newCount > newScores.length) {
      while (newScores.length < newCount) {
        newScores.push(1.0);
      }
    } else {
      newScores.splice(newCount);
    }
    setReadingQuestionScores(newScores);
  };

  // Calculate current sum of scores
  const calculatedReadingSum = Number(readingQuestionScores.reduce((a, b) => a + b, 0).toFixed(2));
  const calculatedTotalScore = Number((calculatedReadingSum + writingParagraphScore + writingEssayScore).toFixed(2));
  const isScoreBalanced = Math.abs(calculatedTotalScore - totalScore) < 0.01;

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setSourceText((prev) => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, ''),
          content: text,
        }));
      }
    };
    reader.readAsText(file);
  };

  // Fast load sample passage (Grade 11 Nam Cao "Một bữa no")
  const handleLoadSamplePassage = () => {
    const p = DEFAULT_PASSAGES[0];
    if (p) {
      setSourceText({
        title: p.title,
        author: p.author,
        source: p.source,
        genre: p.genre,
        content: p.content,
      });
      setTopic('Truyện ngắn, tiểu thuyết');
    }
  };

  // AI Suggest Passage
  const handleAISuggestPassage = async () => {
    try {
      setIsSuggestingPassages(true);
      const res = await fetch('/api/suggest-passages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          genre: sourceText.genre,
          textbook,
        }),
      });
      const data = await res.json();
      if (data.success && data.passages && data.passages.length > 0) {
        const p = data.passages[0];
        setSourceText({
          title: p.title,
          author: p.author,
          source: p.source,
          genre: p.genre as LiteraryGenre,
          content: p.content,
        });
      } else {
        alert('Không tìm thấy gợi ý phù hợp. Vui lòng nhập ngữ liệu trực tiếp hoặc chọn từ Ngân hàng ngữ liệu.');
      }
    } catch (e) {
      alert('Không thể kết nối dịch vụ gợi ý. Vui lòng thử lại.');
    } finally {
      setIsSuggestingPassages(false);
    }
  };

  // Trigger Exam Generation
  const handleGenerateExam = async () => {
    setErrorMessage(null);

    // Validation
    if (!sourceText.content || sourceText.content.trim().length === 0) {
      setErrorMessage(
        'Chưa có ngữ liệu nguồn. Hệ thống tuân thủ nguyên tắc sư phạm của GDPT 2018: ưu tiên sử dụng 100% đúng văn bản do giáo viên cung cấp, không tự bịa đặt tác giả, tác phẩm hay nguồn xuất xứ. Thầy/Cô vui lòng nhập văn bản, tải tệp tài liệu, bấm "Gợi ý ngữ liệu chuẩn GDPT 2018" hoặc chọn từ Ngân hàng ngữ liệu.'
      );
      return;
    }

    const words = sourceText.content.trim().split(/\s+/).length;
    if (words < 40) {
      setErrorMessage(
        `Văn bản nguồn quá ngắn (${words} từ). Để xây dựng đề thi gồm ${readingQuestionCount} câu đọc hiểu và bài viết nghị luận chất lượng theo chuẩn GDPT 2018, văn bản cần độ dài thích hợp (tối thiểu khoảng 50 - 300 từ tùy thể loại thơ hoặc văn xuôi). Vui lòng bổ sung đoạn trích đầy đủ hơn.`
      );
      return;
    }

    if (!topic || topic.trim().length === 0) {
      setErrorMessage('Vui lòng nhập Tên bài học / Chủ đề kiểm tra.');
      return;
    }

    setIsGenerating(true);
    setGeneratingStep('1/4: Đang đọc hiểu văn bản nguồn và phân tích đặc trưng thể loại...');

    try {
      const schoolSettings = getSchoolSettings();

      const timer1 = setTimeout(() => {
        setGeneratingStep('2/4: Đang đối chiếu chuẩn kiến thức GDPT 2018 & xây dựng ma trận nhận thức...');
      }, 3000);

      const timer2 = setTimeout(() => {
        setGeneratingStep('3/4: Đang biên soạn 5 câu hỏi đọc hiểu (6.0đ) & đề bài viết ' + essayType.toLowerCase() + ' (4.0đ)...');
      }, 6500);

      const timer3 = setTimeout(() => {
        setGeneratingStep('4/4: Đang kiểm định điểm số bằng mã nguồn và hoàn thiện hướng dẫn chấm chi tiết...');
      }, 10000);

      const response = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grade,
          textbook,
          topic,
          examType,
          durationMinutes,
          totalScore,
          sampleModel,
          readingQuestionCount,
          readingScore: calculatedReadingSum,
          writingParagraphScore,
          writingEssayScore,
          readingQuestionScores,
          essayType,
          sourceText,
          includeMatrix,
          includeSpecification,
          includeRubric,
          schoolHeader: {
            department: schoolSettings.department,
            schoolName: schoolSettings.schoolName,
            academicYear: schoolSettings.academicYear,
            semester: schoolSettings.semester,
          },
          teacherPromptNote,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Có lỗi xảy ra khi tạo đề.');
      }

      const generatedData: GeneratedExam = {
        id: 'exam_' + Date.now(),
        createdAt: new Date().toISOString(),
        title: `${examType} Ngữ văn ${grade} - ${topic}`,
        config: {
          subject: 'Ngữ văn',
          grade,
          textbook,
          topic,
          examType,
          durationMinutes,
          totalScore,
          sampleModel,
          readingQuestionCount,
          readingScore: calculatedReadingSum,
          writingParagraphScore,
          writingEssayScore,
          readingQuestionScores,
          essayType,
          includeMatrix,
          includeSpecification,
          includeRubric,
          teacherPromptNote,
        },
        ...resData.data,
      };

      setCurrentExam(generatedData);
      saveExamToHistory(generatedData);

      // Scroll to exam paper smoothly
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Lỗi tạo đề:', err);
      setErrorMessage(err.message || 'Không thể tạo đề lúc này. Vui lòng kiểm tra lại kết nối mạng và ngữ liệu.');
    } finally {
      setIsGenerating(false);
      setGeneratingStep('');
    }
  };

  const wordCount = sourceText.content ? sourceText.content.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* If exam is already generated, render the ExamViewer with a quick back-to-config bar */}
      {currentExam && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <div className="flex items-center space-x-3">
              <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                ✓
              </span>
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg">
                  {currentExam.title}
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Lớp {currentExam.config.grade} • {currentExam.config.textbook} • Mẫu {currentExam.config.sampleModel} (Đọc hiểu: {currentExam.readingSection.sectionScore}đ + Viết: {currentExam.writingSection.sectionScore}đ)
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setCurrentExam(null);
                if (onClearLoadedExam) onClearLoadedExam();
              }}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer self-start sm:self-auto"
            >
              ← Tùy chỉnh thông số / Tạo đề khác
            </button>
          </div>

          <ExamViewer
            exam={currentExam}
            onUpdateExam={(updated) => setCurrentExam(updated)}
            onRegenerate={handleGenerateExam}
          />
        </div>
      )}

      {/* Configuration Studio (shown when no exam is active, or user is configuring) */}
      {!currentExam && (
        <div className="space-y-8">
          {/* Header Title */}
          <div className="border-b border-stone-200 pb-5">
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Studio Tạo Đề Ngữ Văn THPT Thực Tế
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Hệ thống kết nối trực tiếp Gemini AI Khảo thí theo chuẩn GDPT 2018. Mặc định: Lớp 11 • Sách Kết nối tri thức • Giữa kỳ I • Mẫu B (Đọc hiểu 6,0đ + Viết 4,0đ).
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 space-y-3 animate-in fade-in">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                <div className="text-sm leading-relaxed">
                  <span className="font-bold">Thông báo xử lý dữ liệu: </span>
                  {errorMessage}
                </div>
              </div>

              {/* Quick actions for teacher */}
              {errorMessage.includes('ngữ liệu') && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-200">
                  <button
                    type="button"
                    onClick={handleAISuggestPassage}
                    disabled={isSuggestingPassages}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-900 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isSuggestingPassages ? 'Đang tìm ngữ liệu...' : 'Gợi ý ngữ liệu chuẩn GDPT 2018 (có xuất xứ thật)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPassageModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-300 hover:bg-rose-100 text-rose-900 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Mở Ngân hàng ngữ liệu</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadSamplePassage}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-300 hover:bg-stone-200 text-stone-800 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Nạp nhanh ngữ liệu mẫu Lớp 11</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="ml-auto text-xs text-rose-700 hover:text-rose-900 underline font-medium cursor-pointer"
                  >
                    Đóng thông báo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Main Grid: Form Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Cấu hình chung & Mẫu đề (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* BƯỚC 1: CẤU HÌNH KHẢO THÍ */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-5">
                <div className="flex items-center space-x-2.5 pb-3 border-b border-stone-100">
                  <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-900 font-bold text-sm flex items-center justify-center">
                    1
                  </span>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Cấu hình đề kiểm tra
                  </h3>
                </div>

                {/* Môn học & Khối lớp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Môn học
                    </label>
                    <div className="px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm font-semibold text-stone-800 flex items-center justify-between">
                      <span>Ngữ văn</span>
                      <span className="text-[11px] font-normal px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 font-semibold">
                        Môn duy nhất
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Khối lớp THPT <span className="text-rose-600">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['10', '11', '12'] as GradeLevel[]).map((g) => (
                        <button
                          type="button"
                          key={g}
                          onClick={() => setGrade(g)}
                          className={`py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                            grade === g
                              ? 'bg-rose-900 text-white shadow-xs'
                              : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          Lớp {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bộ sách & Loại kiểm tra */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Bộ sách giáo khoa <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={textbook}
                      onChange={(e) => setTextbook(e.target.value as TextbookSeries)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                    >
                      <option value="Kết nối tri thức với cuộc sống">Kết nối tri thức với cuộc sống</option>
                      <option value="Chân trời sáng tạo">Chân trời sáng tạo</option>
                      <option value="Cánh Diều">Cánh Diều</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Loại kiểm tra <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value as ExamType)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                    >
                      <option value="Kiểm tra giữa kỳ I">Kiểm tra giữa kỳ I (Mặc định)</option>
                      <option value="Kiểm tra cuối kỳ I">Kiểm tra cuối kỳ I</option>
                      <option value="Kiểm tra giữa kỳ II">Kiểm tra giữa kỳ II</option>
                      <option value="Kiểm tra cuối kỳ II">Kiểm tra cuối kỳ II</option>
                      <option value="Kiểm tra thường xuyên">Kiểm tra thường xuyên</option>
                      <option value="Đề luyện tập tốt nghiệp THPT">Đề luyện tập tốt nghiệp THPT</option>
                    </select>
                  </div>
                </div>

                {/* Tên bài học / Chủ đề */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                      Tên bài học / Chủ đề <span className="text-rose-600">*</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="VD: Truyện ngắn, tiểu thuyết..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all font-medium"
                  />
                  {/* Quick topic tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[11px] text-stone-400">Gợi ý nhanh:</span>
                    {[
                      'Truyện ngắn, tiểu thuyết',
                      'Thơ tự do',
                      'Văn bản nghị luận',
                      'Văn bản thông tin',
                      'Bi kịch và hài kịch',
                    ].map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => {
                          setTopic(t);
                          if (t.includes('Truyện')) setSourceText((p) => ({ ...p, genre: 'Truyện ngắn / Tiểu thuyết' }));
                          if (t.includes('Thơ')) setSourceText((p) => ({ ...p, genre: 'Thơ / Đoạn thơ' }));
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          topic === t
                            ? 'bg-rose-100 text-rose-900 font-bold border border-rose-300'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thời gian & Tổng điểm */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Thời gian làm bài
                    </label>
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                    >
                      <option value={45}>45 phút</option>
                      <option value={60}>60 phút</option>
                      <option value={90}>90 phút (Mặc định)</option>
                      <option value={120}>120 phút</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Tổng điểm đề thi
                    </label>
                    <div className="px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm font-bold text-stone-800 flex items-center justify-between">
                      <span>{totalScore}.0 điểm</span>
                      <span className="text-[11px] font-normal text-stone-500">Thang điểm 10</span>
                    </div>
                  </div>
                </div>

                {/* Chọn Mẫu Cấu Trúc Đề (A, B, C) */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Cấu trúc đề kiểm tra
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Model A */}
                    <button
                      type="button"
                      onClick={() => applySampleModelDefaults('A')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        sampleModel === 'A'
                          ? 'border-rose-600 bg-rose-50/80 ring-2 ring-rose-500/20'
                          : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-serif font-bold text-rose-950 text-sm">Mẫu A</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-stone-200 text-stone-700">
                            15-45p
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 font-medium">Đọc hiểu 5 câu tự luận</p>
                      </div>
                      <span className="text-[11px] text-stone-400 mt-2 block">10.0đ đọc hiểu</span>
                    </button>

                    {/* Model B (Mặc định) */}
                    <button
                      type="button"
                      onClick={() => applySampleModelDefaults('B')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        sampleModel === 'B'
                          ? 'border-rose-600 bg-rose-50/80 ring-2 ring-rose-500/20 shadow-xs'
                          : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-serif font-bold text-rose-950 text-sm">Mẫu B (Mặc định)</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-200 text-rose-900">
                            90p
                          </span>
                        </div>
                        <p className="text-xs text-stone-900 font-semibold">Đọc hiểu 6.0đ + Viết văn 4.0đ</p>
                      </div>
                      <span className="text-[11px] text-rose-800 font-medium mt-2 block">Giữa kỳ / Cuối kỳ</span>
                    </button>

                    {/* Model C */}
                    <button
                      type="button"
                      onClick={() => applySampleModelDefaults('C')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        sampleModel === 'C'
                          ? 'border-rose-600 bg-rose-50/80 ring-2 ring-rose-500/20'
                          : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-serif font-bold text-rose-950 text-sm">Mẫu C</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-stone-200 text-stone-700">
                            Bộ 2025
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 font-medium">4đ ĐH + 2đ Đoạn + 4đ Bài</p>
                      </div>
                      <span className="text-[11px] text-stone-500 mt-2 block">Tốt nghiệp THPT</span>
                    </button>
                  </div>
                </div>

                {/* Phần II. Lựa chọn kiểu bài viết (Nghị luận văn học vs Nghị luận xã hội) */}
                {(sampleModel === 'B' || sampleModel === 'C') && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <label className="block text-xs font-bold text-amber-950 uppercase tracking-wide">
                      Phần II. Viết (4,0 điểm) — Chọn kiểu bài viết:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`flex items-center space-x-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        essayType === 'Nghị luận văn học'
                          ? 'bg-white border-amber-500 shadow-xs font-semibold text-amber-950 ring-1 ring-amber-400'
                          : 'bg-amber-100/40 border-amber-200 text-amber-900 hover:bg-white'
                      }`}>
                        <input
                          type="radio"
                          name="essayType"
                          checked={essayType === 'Nghị luận văn học'}
                          onChange={() => setEssayType('Nghị luận văn học')}
                          className="text-amber-800 focus:ring-amber-500"
                        />
                        <div className="text-xs leading-snug">
                          <span className="block font-bold">Nghị luận văn học</span>
                          <span className="text-[11px] text-stone-500 font-normal">Phân tích/cảm nhận nhân vật, tình huống, nghệ thuật</span>
                        </div>
                      </label>

                      <label className={`flex items-center space-x-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        essayType === 'Nghị luận xã hội'
                          ? 'bg-white border-amber-500 shadow-xs font-semibold text-amber-950 ring-1 ring-amber-400'
                          : 'bg-amber-100/40 border-amber-200 text-amber-900 hover:bg-white'
                      }`}>
                        <input
                          type="radio"
                          name="essayType"
                          checked={essayType === 'Nghị luận xã hội'}
                          onChange={() => setEssayType('Nghị luận xã hội')}
                          className="text-amber-800 focus:ring-amber-500"
                        />
                        <div className="text-xs leading-snug">
                          <span className="block font-bold">Nghị luận xã hội</span>
                          <span className="text-[11px] text-stone-500 font-normal">Bàn về tư tưởng, lối sống rút ra từ văn bản</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Collapsible: Tinh chỉnh chi tiết số câu và điểm từng phần */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
                    className="flex items-center justify-between w-full py-2 text-xs font-semibold text-rose-900 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center space-x-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Tinh chỉnh số câu & phân bổ điểm (Thầy/Cô có thể chỉnh sửa tự do)</span>
                    </span>
                    {isCustomizeOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isCustomizeOpen && (
                    <div className="p-4 mt-2 rounded-2xl bg-stone-50 border border-stone-200 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-stone-700">
                          Số câu hỏi Đọc hiểu:
                        </label>
                        <select
                          value={readingQuestionCount}
                          onChange={(e) => handleQuestionCountChange(Number(e.target.value))}
                          className="px-2.5 py-1 rounded-lg border border-stone-300 text-xs font-semibold bg-white"
                        >
                          <option value={3}>3 câu</option>
                          <option value={4}>4 câu</option>
                          <option value={5}>5 câu (Mặc định)</option>
                          <option value={6}>6 câu</option>
                        </select>
                      </div>

                      {/* Reading questions individual scores */}
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1.5">
                          Điểm từng câu Đọc hiểu (Tổng hiện tại: {calculatedReadingSum}đ):
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {readingQuestionScores.map((score, idx) => (
                            <div key={idx} className="text-center">
                              <span className="text-[10px] text-stone-500 block mb-0.5">C{idx + 1}</span>
                              <input
                                type="number"
                                step="0.25"
                                min="0.25"
                                max="4"
                                value={score}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const next = [...readingQuestionScores];
                                  next[idx] = val;
                                  setReadingQuestionScores(next);
                                }}
                                className="w-full py-1 text-center font-bold text-xs rounded border border-stone-300 bg-white"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Writing sections scores */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-200">
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">
                            Điểm Đoạn văn:
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={writingParagraphScore}
                            onChange={(e) => setWritingParagraphScore(parseFloat(e.target.value) || 0)}
                            className="w-full py-1 px-2 text-center font-bold text-xs rounded border border-stone-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">
                            Điểm Bài văn nghị luận:
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={writingEssayScore}
                            onChange={(e) => setWritingEssayScore(parseFloat(e.target.value) || 0)}
                            className="w-full py-1 px-2 text-center font-bold text-xs rounded border border-stone-300 bg-white"
                          />
                        </div>
                      </div>

                      {/* Total Score check indicator */}
                      <div className={`p-2.5 rounded-xl text-xs flex items-center justify-between font-medium ${
                        isScoreBalanced ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-300'
                      }`}>
                        <span>Tổng phân bổ: <strong>{calculatedTotalScore} điểm</strong> / {totalScore} điểm</span>
                        <span>{isScoreBalanced ? '✓ Chuẩn khớp 10.0 điểm' : '⚠️ Lệch tổng điểm cấu hình'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Yêu cầu tạo kèm: Ma trận, Bảng đặc tả, Hướng dẫn chấm */}
                <div className="pt-2 border-t border-stone-100 space-y-2">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                    Các tài liệu sư phạm tạo kèm
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className="flex items-center space-x-2 text-xs text-stone-700 font-medium cursor-pointer p-2 rounded-xl bg-stone-50 border border-stone-200 hover:bg-stone-100">
                      <input
                        type="checkbox"
                        checked={includeMatrix}
                        onChange={(e) => setIncludeMatrix(e.target.checked)}
                        className="rounded text-rose-900 focus:ring-rose-500"
                      />
                      <span>Ma trận đề thi</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs text-stone-700 font-medium cursor-pointer p-2 rounded-xl bg-stone-50 border border-stone-200 hover:bg-stone-100">
                      <input
                        type="checkbox"
                        checked={includeSpecification}
                        onChange={(e) => setIncludeSpecification(e.target.checked)}
                        className="rounded text-rose-900 focus:ring-rose-500"
                      />
                      <span>Bảng đặc tả đề</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs text-stone-700 font-medium cursor-pointer p-2 rounded-xl bg-stone-50 border border-stone-200 hover:bg-stone-100">
                      <input
                        type="checkbox"
                        checked={includeRubric}
                        onChange={(e) => setIncludeRubric(e.target.checked)}
                        className="rounded text-rose-900 focus:ring-rose-500"
                      />
                      <span>Đáp án & Biểu điểm</span>
                    </label>
                  </div>
                </div>

                {/* Ghi chú riêng của giáo viên */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Ghi chú riêng cho AI (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={teacherPromptNote}
                    onChange={(e) => setTeacherPromptNote(e.target.value)}
                    placeholder="VD: Chú trọng chi tiết diễn biến tâm lý nhân vật; bài văn nghị luận tập trung vào phẩm giá con người..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Ngữ liệu nguồn (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* BƯỚC 2: VĂN BẢN NGUỒN */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-900 font-bold text-sm flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-serif font-bold text-lg text-stone-900">
                      Văn bản nguồn (Ngữ liệu)
                    </h3>
                  </div>

                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    wordCount >= 60 ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {wordCount} chữ
                  </span>
                </div>

                {/* Quick actions for passage */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSamplePassage}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
                    title="Tải văn bản truyện ngắn chuẩn Lớp 11: Một bữa no (Nam Cao)"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-rose-700" />
                    <span>Nạp ngữ liệu mẫu Lớp 11</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPassageModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Library className="w-3.5 h-3.5 text-amber-700" />
                    <span>Chọn từ Ngân hàng</span>
                  </button>

                  <label className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải tệp .txt</span>
                    <input
                      type="file"
                      accept=".txt,.text,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Thể loại & Tên tác phẩm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Thể loại văn bản
                    </label>
                    <select
                      value={sourceText.genre}
                      onChange={(e) =>
                        setSourceText({ ...sourceText, genre: e.target.value as LiteraryGenre })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium focus:outline-none"
                    >
                      <option value="Truyện ngắn / Tiểu thuyết">Truyện ngắn / Tiểu thuyết</option>
                      <option value="Thơ / Đoạn thơ">Thơ / Đoạn thơ</option>
                      <option value="Nghị luận xã hội">Nghị luận xã hội</option>
                      <option value="Văn bản thông tin">Văn bản thông tin</option>
                      <option value="Tản văn / Tùy bút">Tản văn / Tùy bút</option>
                      <option value="Kịch / Bi kịch">Kịch / Bi kịch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Tác phẩm / Nhan đề
                    </label>
                    <input
                      type="text"
                      value={sourceText.title}
                      onChange={(e) => setSourceText({ ...sourceText, title: e.target.value })}
                      placeholder="VD: Một bữa no, Lão Hạc, Vợ nhặt..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Tác giả & Nguồn xuất xứ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Tác giả
                    </label>
                    <input
                      type="text"
                      value={sourceText.author}
                      onChange={(e) => setSourceText({ ...sourceText, author: e.target.value })}
                      placeholder="VD: Nam Cao, Kim Lân..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Nguồn xuất xứ chính thức
                    </label>
                    <input
                      type="text"
                      value={sourceText.source}
                      onChange={(e) => setSourceText({ ...sourceText, source: e.target.value })}
                      placeholder="VD: Tuyển tập Nam Cao, NXB Văn học..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Textarea Content */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Nội dung đoạn trích văn bản <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={8}
                    value={sourceText.content}
                    onChange={(e) => setSourceText({ ...sourceText, content: e.target.value })}
                    placeholder="Dán hoặc nhập toàn bộ nội dung đoạn trích truyện ngắn/tiểu thuyết tại đây..."
                    className="w-full p-3.5 rounded-2xl border border-stone-200 bg-stone-50/40 text-xs sm:text-sm font-serif leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all"
                  />
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mt-1">
                    <span>Độ dài yêu cầu: tối thiểu 60 từ (lý tưởng: 150 - 350 từ)</span>
                    <span className={wordCount < 60 && wordCount > 0 ? 'text-rose-600 font-bold' : ''}>
                      {wordCount} chữ
                    </span>
                  </div>
                </div>

                {/* Cam kết sử dụng đúng ngữ liệu */}
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-xs leading-relaxed flex items-start space-x-2">
                  <Feather className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Kiểm soát ngữ liệu: </strong> Hệ thống ưu tiên ngữ liệu do giáo viên cung cấp, không tự bịa đặt tác giả/tác phẩm, phân biệt rõ ngữ liệu đọc hiểu và câu hỏi do AI tạo.
                  </span>
                </div>
              </div>

              {/* BƯỚC 3: NÚT TẠO ĐỀ CHÍNH THỨC */}
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerateExam}
                  className={`w-full py-4 px-6 rounded-2xl font-serif font-bold text-base sm:text-lg flex items-center justify-center space-x-2.5 shadow-lg transition-all cursor-pointer ${
                    isGenerating
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-rose-900 via-red-800 to-amber-800 hover:from-rose-800 hover:to-amber-700 text-white shadow-rose-900/30 hover:shadow-xl hover:scale-101'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>{isGenerating ? 'Đang gọi Gemini AI tạo đề...' : 'TẠO ĐỀ KIỂM TRA NGAY'}</span>
                </button>

                {/* Loading status progress */}
                {isGenerating && (
                  <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-950 text-xs sm:text-sm space-y-2 text-center animate-in fade-in">
                    <div className="flex items-center justify-center space-x-2 font-semibold">
                      <RefreshCw className="w-4 h-4 animate-spin text-rose-700" />
                      <span>{generatingStep}</span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Đang xử lý trên máy chủ an toàn với Gemini API và thẩm định thang điểm...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chọn Ngữ Liệu từ Ngân Hàng */}
      <PassageSelectorModal
        isOpen={isPassageModalOpen}
        onClose={() => setIsPassageModalOpen(false)}
        currentGrade={grade}
        onSelectPassage={(p) => {
          setSourceText({
            title: p.title,
            author: p.author,
            source: p.source,
            genre: p.genre,
            content: p.content,
          });
          if (p.grade) setGrade(p.grade);
        }}
      />
    </div>
  );
};
