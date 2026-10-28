import React from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Printer, 
  Scale, 
  BookMarked, 
  Layers, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { SampleModelType } from '../types/exam';

interface HomeTabProps {
  onStartExam: (sampleModel?: SampleModelType) => void;
  onBrowsePassages: () => void;
  historyCount: number;
  onViewHistory: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  onStartExam,
  onBrowsePassages,
  historyCount,
  onViewHistory,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-rose-950 to-stone-900 text-white p-8 sm:p-12 shadow-xl border border-stone-800">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Dành riêng cho giáo viên Ngữ văn THPT</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
            TRỢ LÝ TẠO ĐỀ NGỮ VĂN THPT
          </h1>

          <p className="text-base sm:text-lg text-stone-300 font-normal leading-relaxed mb-8">
            Công cụ hỗ trợ giáo viên xây dựng nhanh chóng ma trận, bảng đặc tả, đề kiểm tra và hướng dẫn chấm chi tiết môn Ngữ văn Lớp 10, 11, 12 chuẩn theo Chương trình GDPT 2018 và định dạng đề thi mới nhất.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onStartExam('C')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-base shadow-lg shadow-rose-900/40 hover:shadow-xl transition-all flex items-center space-x-2 group cursor-pointer"
            >
              <span>Bắt đầu tạo đề ngay</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onBrowsePassages}
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-100 font-medium text-base border border-white/15 backdrop-blur-xs transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <BookMarked className="w-5 h-5 text-amber-300" />
              <span>Xem ngân hàng ngữ liệu</span>
            </button>

            {historyCount > 0 && (
              <button
                onClick={onViewHistory}
                className="px-4 py-3.5 rounded-xl text-stone-300 hover:text-white font-medium text-sm transition-colors cursor-pointer"
              >
                Đã lưu {historyCount} đề kiểm tra
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Local Storage Notice */}
      <div className="flex items-start space-x-3 p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-sm">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold">Lưu ý quan trọng về lưu trữ: </span>
          Trong phiên bản hiện tại, các bản nháp và lịch sử đề thi được lưu trữ cục bộ trực tiếp trên trình duyệt của máy tính này (Local Storage) để bảo mật và sử dụng tức thì mà không cần đăng nhập. Dữ liệu chưa đồng bộ tự động giữa các máy tính khác nhau. Quý Thầy/Cô nên xuất tệp Word (.docx) hoặc sao lưu đề thi quan trọng về máy.
        </div>
      </div>

      {/* 3 Mẫu Đề Ngữ Văn Chuẩn */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              3 Mẫu cấu trúc đề Ngữ văn THPT
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Thầy/Cô có thể chọn mẫu phù hợp và tự do tùy biến số câu, điểm số và cấu trúc trước khi tạo đề
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mẫu A */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-rose-100 text-rose-900 font-bold font-serif flex items-center justify-center text-lg">
                  A
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                  15 - 45 phút
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900 mb-2">
                Mẫu A: Đọc hiểu 5 câu tự luận
              </h3>
              <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                Tập trung rèn luyện năng lực đọc hiểu văn bản (truyện ngắn, thơ ca, nghị luận xã hội hoặc văn bản thông tin).
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-xs text-stone-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                  <span>Phần I: 5 câu hỏi tự luận đọc hiểu</span>
                </div>
                <div className="flex items-center text-xs text-stone-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                  <span>Phân cấp: Nhận biết, Thông hiểu, Vận dụng</span>
                </div>
                <div className="flex items-center text-xs text-stone-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                  <span>Thang điểm: 10.0 điểm hoặc tùy chọn</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onStartExam('A')}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-rose-900 hover:text-white text-stone-800 text-sm font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Chọn Mẫu A</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mẫu B */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-bold font-serif flex items-center justify-center text-lg">
                  B
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                  60 - 90 phút
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900 mb-2">
                Mẫu B: Đọc hiểu 6.0đ + Viết văn 4.0đ
              </h3>
              <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                Cấu trúc đề kiểm tra định kỳ truyền thống, kết hợp rèn luyện kỹ năng đọc hiểu chuyên sâu và viết bài văn nghị luận hoàn chỉnh.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-xs text-stone-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                  <span>Phần I: Đọc hiểu 5 câu (6.0 điểm)</span>
                </div>
                <div className="flex items-center text-xs text-stone-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                  <span>Phần II: Viết 1 bài văn nghị luận (4.0 điểm)</span>
                </div>
                <div className="flex items-center text-xs text-stone-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                  <span>Tổng điểm: 10.0 điểm</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onStartExam('B')}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-rose-900 hover:text-white text-stone-800 text-sm font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Chọn Mẫu B</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mẫu C (Khuyến nghị chuẩn Bộ 2025) */}
          <div className="bg-gradient-to-b from-rose-50/60 to-white rounded-2xl p-6 border-2 border-rose-500/80 shadow-md flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 bg-gradient-to-r from-rose-700 to-amber-700 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Chuẩn Tốt nghiệp 2025
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-rose-600 text-white font-bold font-serif flex items-center justify-center text-lg shadow-xs">
                  C
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-900">
                  90 - 120 phút
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900 mb-2">
                Mẫu C: 4đ Đọc hiểu + 2đ Đoạn + 4đ Bài
              </h3>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                Cấu trúc định dạng đề thi chuẩn của Bộ Giáo dục & Đào tạo từ năm 2025. Phân hóa năng lực toàn diện cho học sinh THPT.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-xs text-stone-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-rose-700 mr-2 shrink-0" />
                  <span>Phần I: Đọc hiểu 5 câu tự luận (4.0 điểm)</span>
                </div>
                <div className="flex items-center text-xs text-stone-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-rose-700 mr-2 shrink-0" />
                  <span>Phần II.1: Viết đoạn văn ~200 chữ (2.0 điểm)</span>
                </div>
                <div className="flex items-center text-xs text-stone-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-rose-700 mr-2 shrink-0" />
                  <span>Phần II.2: Viết bài văn nghị luận (4.0 điểm)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onStartExam('C')}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-900 hover:bg-rose-800 text-white text-sm font-semibold shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Tạo đề theo Mẫu C</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cam kết sư phạm và Tính năng cốt lõi */}
      <div className="bg-white rounded-3xl p-8 border border-stone-200">
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6 text-center">
          Cam kết chất lượng sư phạm & Quy chuẩn khảo thí
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-stone-50">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-900 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-stone-900 text-sm mb-1">
              Trung thực về ngữ liệu
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Ưu tiên dùng đúng 100% văn bản giáo viên nhập; không bịa tên tác giả, tác phẩm hay nguồn xuất xứ.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-stone-50">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-3">
              <Scale className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-stone-900 text-sm mb-1">
              Chuẩn GDPT 2018
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Phân cấp nhận thức rõ rệt: Nhận biết, Thông hiểu, Vận dụng; kèm Ma trận & Bảng đặc tả chuẩn quy cách.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-stone-50">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center mb-3">
              <Download className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-stone-900 text-sm mb-1">
              Xuất Word (.docx) chuẩn
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Xuất tệp Word thực sự với font Times New Roman 13pt, kẻ bảng đáp án và ma trận chuẩn sư phạm.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-stone-50">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-900 flex items-center justify-center mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-stone-900 text-sm mb-1">
              Chỉnh sửa & In ấn tức thì
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Giáo viên dễ dàng chỉnh sửa câu chữ, sao chép từng phần hoặc bấm In ấn chuẩn A4 phục vụ phòng thi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
