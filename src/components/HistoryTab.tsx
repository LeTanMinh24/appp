import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Download, 
  Printer, 
  FileEdit, 
  Copy, 
  AlertCircle, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  Layers,
  FileText
} from 'lucide-react';
import { GeneratedExam, GradeLevel } from '../types/exam';
import { deleteExamFromHistory, clearAllHistory, saveExamToHistory } from '../utils/storage';
import { exportExamToDocx } from '../utils/docxExport';

interface HistoryTabProps {
  exams: GeneratedExam[];
  onReloadHistory: () => void;
  onOpenExam: (exam: GeneratedExam) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  exams,
  onReloadHistory,
  onOpenExam,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [exportingId, setExportingId] = useState<string | null>(null);

  const filteredExms = exams.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.sourcePassage?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.sourcePassage?.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.config.topic || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade = filterGrade === 'all' || e.config.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Thầy/Cô có chắc chắn muốn xóa đề kiểm tra: "${title}"?`)) {
      deleteExamFromHistory(id);
      onReloadHistory();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Thầy/Cô có chắc chắn muốn xóa toàn bộ lịch sử đề đã lưu trên máy tính này?')) {
      clearAllHistory();
      onReloadHistory();
    }
  };

  const handleDuplicate = (exam: GeneratedExam) => {
    const duplicated: GeneratedExam = {
      ...JSON.parse(JSON.stringify(exam)),
      id: 'exam_' + Date.now(),
      createdAt: new Date().toISOString(),
      title: `${exam.title} (Bản sao)`,
    };
    saveExamToHistory(duplicated);
    onReloadHistory();
  };

  const handleExportWord = async (exam: GeneratedExam) => {
    try {
      setExportingId(exam.id);
      const blob = await exportExamToDocx(exam);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanTitle = (exam.sourcePassage.title || exam.config.topic || 'De_Kiem_Tra')
        .replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '_')
        .substring(0, 30);
      a.download = `De_Ngu_Van_Lop_${exam.config.grade}_${cleanTitle}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Không thể xuất tệp Word. Vui lòng thử lại!');
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center space-x-3">
            <span>Lịch Sử Đề Kiểm Tra Đã Tạo</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-stone-200 text-stone-700 font-sans font-bold">
              {exams.length} đề đã lưu
            </span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Quản lý, xem lại, chỉnh sửa hoặc xuất tệp Word các đề Ngữ văn đã biên soạn
          </p>
        </div>

        {exams.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-3.5 py-2 rounded-xl border border-stone-300 hover:border-rose-400 hover:text-rose-700 text-stone-600 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa tất cả lịch sử</span>
          </button>
        )}
      </div>

      {/* Storage Notification Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 flex items-start space-x-3 text-xs sm:text-sm">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Thông báo lưu trữ cục bộ: </strong>
          Toàn bộ đề thi trong danh sách này đang được lưu trực tiếp trên bộ nhớ trình duyệt của máy tính (Local Storage), chưa đồng bộ lên máy chủ hoặc các thiết bị khác. Thầy/Cô nên bấm nút <strong>Xuất Word (.docx)</strong> đối với các đề thi quan trọng để lưu giữ trên máy tính cá nhân.
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo chủ đề, tiêu đề đề thi, tác giả hoặc tác phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
          />
        </div>

        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="py-2.5 px-3.5 rounded-xl border border-stone-200 bg-white text-sm font-medium text-stone-700 focus:outline-none"
        >
          <option value="all">Tất cả khối lớp</option>
          <option value="10">Lớp 10</option>
          <option value="11">Lớp 11</option>
          <option value="12">Lớp 12</option>
        </select>
      </div>

      {/* Exam List */}
      {filteredExms.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
          <History className="w-12 h-12 stroke-[1.5] text-stone-300 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-stone-800">
            {exams.length === 0 ? 'Chưa có đề kiểm tra nào được lưu' : 'Không tìm thấy đề phù hợp với tìm kiếm'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            {exams.length === 0
              ? 'Khi Thầy/Cô tạo đề kiểm tra mới ở mục "Tạo đề", hệ thống sẽ tự động lưu lại vào đây để xem lại và xuất Word bất kỳ lúc nào.'
              : 'Hãy thử đổi từ khóa tìm kiếm hoặc chọn "Tất cả khối lớp".'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExms.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-rose-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-900 font-bold text-xs">
                    Lớp {exam.config.grade}
                  </span>
                  <span className="text-[11px] text-stone-400 font-sans flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base text-stone-900 leading-snug line-clamp-2">
                  {exam.title}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-1">
                  <strong>Ngữ liệu: </strong> {exam.sourcePassage.title || 'Không có tiêu đề'} ({exam.sourcePassage.author})
                </p>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
                  <span className="px-2 py-0.5 rounded bg-stone-100">
                    {exam.config.examType}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-stone-100">
                    Mẫu {exam.config.sampleModel}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-stone-100">
                    {exam.config.durationMinutes} phút
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-semibold">
                    {exam.config.totalScore} điểm
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onOpenExam(exam)}
                    className="px-3 py-1.5 rounded-xl bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Mở xem & In</span>
                  </button>

                  <button
                    onClick={() => handleExportWord(exam)}
                    disabled={exportingId === exam.id}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                    title="Tải tệp Word .docx"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{exportingId === exam.id ? 'Đang xuất...' : 'Tải Word'}</span>
                  </button>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleDuplicate(exam)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Nhân bản đề này"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(exam.id, exam.title)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Xóa đề này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
