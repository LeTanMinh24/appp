import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  GraduationCap, 
  Save, 
  Check, 
  Trash2, 
  Info, 
  BookOpen, 
  ShieldCheck, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { SchoolSettings } from '../types/exam';
import { getSchoolSettings, saveSchoolSettings, clearAllHistory } from '../utils/storage';

export const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<SchoolSettings>(getSchoolSettings());
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSchoolSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleClearData = () => {
    if (window.confirm('Thầy/Cô có chắc chắn muốn xóa toàn bộ bản nháp và lịch sử đề trên trình duyệt này? Hành động này không thể hoàn tác.')) {
      clearAllHistory();
      alert('Đã dọn sạch bộ nhớ đệm lịch sử trên trình duyệt.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-stone-200 pb-5">
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center space-x-3">
          <Settings className="w-7 h-7 text-rose-900" />
          <span>Cài Đặt & Thông Tin Đơn Vị</span>
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Thiết lập thông tin trường, tổ bộ môn để tự động điền vào tiêu đề đề thi và bản Word xuất ra
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-stone-100">
          <Building2 className="w-5 h-5 text-rose-800" />
          <h3 className="font-serif font-bold text-lg text-stone-900">
            Thông tin tiêu đề đề kiểm tra
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Sở Giáo dục & Đào tạo / Cơ quan quản lý
            </label>
            <input
              type="text"
              value={settings.department}
              onChange={(e) => setSettings({ ...settings, department: e.target.value })}
              placeholder="VD: SỞ GIÁO DỤC VÀ ĐÀO TẠO HÀ NỘI"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Tên trường THPT
            </label>
            <input
              type="text"
              value={settings.schoolName}
              onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
              placeholder="VD: TRƯỜNG THPT CHUYÊN HÀ NỘI - AMSTERDAM"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Năm học mặc định
            </label>
            <input
              type="text"
              value={settings.academicYear}
              onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
              placeholder="VD: 2024 - 2025"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Học kỳ
            </label>
            <input
              type="text"
              value={settings.semester}
              onChange={(e) => setSettings({ ...settings, semester: e.target.value })}
              placeholder="VD: HỌC KỲ I"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Giáo viên / Tổ chuyên môn
            </label>
            <input
              type="text"
              value={settings.teacherName}
              onChange={(e) => setSettings({ ...settings, teacherName: e.target.value })}
              placeholder="VD: Tổ Ngữ văn"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <p className="text-xs text-stone-500 italic">
            Thông tin này được lưu cục bộ trên trình duyệt máy tính của Thầy/Cô và tự động áp dụng cho các đề mới.
          </p>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-rose-900 hover:bg-rose-800 text-white text-sm font-semibold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Đã lưu thành công!' : 'Lưu thông tin cài đặt'}</span>
          </button>
        </div>
      </form>

      {/* Thông tin chuẩn GDPT 2018 & Khảo thí */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-stone-100">
          <GraduationCap className="w-5 h-5 text-amber-800" />
          <h3 className="font-serif font-bold text-lg text-stone-900">
            Quy chuẩn khảo thí môn Ngữ văn GDPT 2018
          </h3>
        </div>

        <div className="text-xs sm:text-sm text-stone-600 leading-relaxed space-y-2.5">
          <p>
            • <strong>Định dạng đề thi tốt nghiệp THPT từ năm 2025:</strong> Cấu trúc gồm Phần I. Đọc hiểu (4.0 điểm, 5 câu hỏi tự luận phân hóa theo 3 cấp độ: Nhận biết, Thông hiểu, Vận dụng) và Phần II. Viết (6.0 điểm gồm: Câu 1 viết đoạn văn ~200 chữ chiếm 2.0 điểm; Câu 2 viết bài văn nghị luận chiếm 4.0 điểm).
          </p>
          <p>
            • <strong>Nguyên tắc chọn ngữ liệu:</strong> Ngữ liệu đọc hiểu trong đề kiểm tra đánh giá định kỳ phải là văn bản nằm ngoài các bộ sách giáo khoa đang học nhằm đánh giá thực chất phẩm chất và năng lực đọc hiểu của học sinh.
          </p>
          <p>
            • <strong>Cam kết tính trung thực:</strong> Ứng dụng "Trợ lý tạo đề Ngữ văn THPT" luôn sử dụng đúng văn bản nguồn do giáo viên cung cấp, không tự ý bịa đặt trích dẫn hay tác giả.
          </p>
        </div>
      </div>

      {/* Quản lý bộ nhớ đệm trình duyệt */}
      <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-stone-900">Dọn dẹp bộ nhớ đệm trình duyệt</h4>
          <p className="text-xs text-stone-500 mt-0.5">
            Xóa các bản nháp và toàn bộ lịch sử đề đã lưu trên trình duyệt của máy tính này.
          </p>
        </div>

        <button
          onClick={handleClearData}
          className="px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-100/50 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span>Dọn dẹp dữ liệu cục bộ</span>
        </button>
      </div>
    </div>
  );
};
