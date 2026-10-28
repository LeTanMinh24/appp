import React, { useState } from 'react';
import { X, Search, BookOpen, Check, Sparkles, Filter } from 'lucide-react';
import { SourcePassage, GradeLevel, LiteraryGenre } from '../types/exam';
import { DEFAULT_PASSAGES } from '../data/defaultPassages';
import { getCustomPassages } from '../utils/storage';

interface PassageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPassage: (passage: SourcePassage) => void;
  currentGrade: GradeLevel;
}

export const PassageSelectorModal: React.FC<PassageSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectPassage,
  currentGrade,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>(currentGrade || 'all');
  const [selectedPassage, setSelectedPassage] = useState<SourcePassage | null>(null);

  if (!isOpen) return null;

  const allPassages: SourcePassage[] = [...DEFAULT_PASSAGES, ...getCustomPassages()];

  const filteredPassages = allPassages.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGenre = selectedGenre === 'all' || p.genre === selectedGenre;
    const matchesGrade = selectedGrade === 'all' || p.grade === selectedGrade;

    return matchesSearch && matchesGenre && matchesGrade;
  });

  const handleConfirm = () => {
    if (selectedPassage) {
      onSelectPassage(selectedPassage);
      onClose();
    }
  };

  const genres: LiteraryGenre[] = [
    'Truyện ngắn / Tiểu thuyết',
    'Thơ / Đoạn thơ',
    'Nghị luận xã hội',
    'Văn bản thông tin',
    'Tản văn / Tùy bút',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-900 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Ngân hàng ngữ liệu chuẩn GDPT 2018
              </h3>
              <p className="text-xs text-stone-500">
                Các văn bản văn học, nghị luận và thông tin có xuất xứ rõ ràng, chuẩn mực
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:px-6 border-b border-stone-100 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tác phẩm, tác giả hoặc từ khóa ngữ liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="py-2.5 px-3 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              >
                <option value="all">Tất cả khối lớp</option>
                <option value="10">Lớp 10</option>
                <option value="11">Lớp 11</option>
                <option value="12">Lớp 12</option>
              </select>

              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="py-2.5 px-3 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              >
                <option value="all">Tất cả thể loại</option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Body: Two Column (List left, Preview right) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* List */}
          <div className="w-full md:w-1/2 border-r border-stone-200 overflow-y-auto p-4 space-y-2.5">
            {filteredPassages.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-sm">
                Không tìm thấy ngữ liệu phù hợp với bộ lọc.
              </div>
            ) : (
              filteredPassages.map((passage) => {
                const isSelected = selectedPassage?.id === passage.id;
                return (
                  <div
                    key={passage.id || passage.title}
                    onClick={() => setSelectedPassage(passage)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/60 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/70 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-serif font-bold text-stone-900 text-base leading-snug">
                        {passage.title}
                      </h4>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-stone-600 mb-2 font-medium">
                      Tác giả: <span className="text-rose-900 font-semibold">{passage.author}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                        {passage.genre}
                      </span>
                      {passage.grade && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-medium">
                          Lớp {passage.grade}
                        </span>
                      )}
                      {passage.wordCount && (
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-500">
                          ~{passage.wordCount} chữ
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Preview Panel */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-stone-50/40 flex flex-col justify-between">
            {selectedPassage ? (
              <div className="space-y-4">
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-900 text-xs font-semibold uppercase mb-2">
                    {selectedPassage.genre}
                  </div>
                  <h3 className="font-serif font-bold text-xl text-stone-900 mb-1">
                    {selectedPassage.title}
                  </h3>
                  <p className="text-sm text-stone-600 font-medium">
                    Tác giả: <span className="font-semibold text-stone-900">{selectedPassage.author}</span>
                  </p>
                  <p className="text-xs text-stone-500 italic mt-0.5">
                    Nguồn xuất xứ: {selectedPassage.source}
                  </p>
                </div>

                <div className="border-t border-stone-200 pt-3">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                    Nội dung trích đoạn:
                  </span>
                  <div className="bg-white p-4 rounded-xl border border-stone-200 text-sm text-stone-800 leading-relaxed font-serif whitespace-pre-line max-h-72 overflow-y-auto shadow-inner">
                    {selectedPassage.content}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                <BookOpen className="w-12 h-12 stroke-[1.5] mb-3 text-stone-300" />
                <p className="text-sm font-medium">Chọn một ngữ liệu bên trái để xem nội dung chi tiết</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-stone-200 bg-white flex items-center justify-between">
          <p className="text-xs text-stone-500 hidden sm:block">
            {selectedPassage ? `Đã chọn: ${selectedPassage.title} (${selectedPassage.author})` : 'Chưa chọn ngữ liệu'}
          </p>

          <div className="flex items-center space-x-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-sm font-medium cursor-pointer"
            >
              Hủy
            </button>
            <button
              disabled={!selectedPassage}
              onClick={handleConfirm}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 cursor-pointer ${
                selectedPassage
                  ? 'bg-rose-900 hover:bg-rose-800 text-white shadow-xs'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Sử dụng ngữ liệu này</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
