import React, { useState } from 'react';
import { 
  Library, 
  Search, 
  Plus, 
  BookOpen, 
  ArrowRight, 
  Check, 
  Trash2, 
  Filter, 
  Sparkles,
  BookmarkCheck,
  Feather
} from 'lucide-react';
import { SourcePassage, GradeLevel, LiteraryGenre } from '../types/exam';
import { DEFAULT_PASSAGES } from '../data/defaultPassages';
import { getCustomPassages, saveCustomPassage, deleteCustomPassage } from '../utils/storage';

interface PassageBankTabProps {
  onUsePassage: (passage: SourcePassage) => void;
}

export const PassageBankTab: React.FC<PassageBankTabProps> = ({ onUsePassage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [customPassages, setCustomPassages] = useState<SourcePassage[]>(getCustomPassages());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New passage form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newGenre, setNewGenre] = useState<LiteraryGenre>('Nghị luận xã hội');
  const [newGrade, setNewGrade] = useState<GradeLevel>('11');
  const [newContent, setNewContent] = useState('');

  const allPassages: SourcePassage[] = [...DEFAULT_PASSAGES, ...customPassages];

  const filteredPassages = allPassages.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.source.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGenre = filterGenre === 'all' || p.genre === filterGenre;
    const matchesGrade = filterGrade === 'all' || p.grade === filterGrade;

    return matchesSearch && matchesGenre && matchesGrade;
  });

  const handleAddNewPassage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung ngữ liệu.');
      return;
    }

    const passage: SourcePassage = {
      id: 'custom_p_' + Date.now(),
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Khuyết danh',
      source: newSource.trim() || 'Tài liệu giáo viên lưu trữ',
      genre: newGenre,
      grade: newGrade,
      content: newContent.trim(),
      wordCount: newContent.trim().split(/\s+/).length,
    };

    saveCustomPassage(passage);
    setCustomPassages(getCustomPassages());
    setIsAddModalOpen(false);

    // Reset
    setNewTitle('');
    setNewAuthor('');
    setNewSource('');
    setNewContent('');
  };

  const handleDeleteCustom = (id: string, title: string) => {
    if (window.confirm(`Xóa ngữ liệu tự thêm: "${title}"?`)) {
      deleteCustomPassage(id);
      setCustomPassages(getCustomPassages());
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center space-x-3">
            <span>Ngân Hàng Ngữ Liệu Chuẩn GDPT 2018</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 font-sans font-bold">
              {allPassages.length} văn bản
            </span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Kho ngữ liệu văn học, nghị luận và thông tin chuẩn mực có xuất xứ rõ ràng cho giáo viên Ngữ văn THPT
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-900 hover:bg-rose-800 text-white text-xs sm:text-sm font-semibold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm ngữ liệu riêng</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tác phẩm, tác giả hoặc từ khóa trích dẫn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="py-2.5 px-3 rounded-xl border border-stone-200 bg-white text-sm font-medium text-stone-700 focus:outline-none"
          >
            <option value="all">Tất cả khối lớp</option>
            <option value="10">Lớp 10</option>
            <option value="11">Lớp 11</option>
            <option value="12">Lớp 12</option>
          </select>

          <select
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="py-2.5 px-3 rounded-xl border border-stone-200 bg-white text-sm font-medium text-stone-700 focus:outline-none"
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

      {/* Passages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPassages.map((p) => {
          const isCustom = p.id?.startsWith('custom_p_');
          const words = p.wordCount || p.content.trim().split(/\s+/).length;

          return (
            <div
              key={p.id || p.title}
              className="bg-white rounded-2xl p-6 border border-stone-200 hover:border-rose-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 font-semibold text-xs">
                    {p.genre}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {p.grade && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold text-[11px]">
                        Lớp {p.grade}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 text-[11px]">
                      ~{words} chữ
                    </span>
                    {isCustom && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 font-semibold text-[11px]">
                        Tự thêm
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs text-stone-600 font-medium mt-0.5">
                    Tác giả: <span className="text-rose-950 font-bold">{p.author}</span>
                  </p>
                  <p className="text-[11px] text-stone-400 italic line-clamp-1 mt-0.5">
                    Nguồn: {p.source}
                  </p>
                </div>

                {/* Excerpt preview */}
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-700 font-serif leading-relaxed line-clamp-4 whitespace-pre-line">
                  {p.content}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => onUsePassage(p)}
                  className="px-4 py-2 rounded-xl bg-rose-900 hover:bg-rose-800 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center space-x-2 cursor-pointer shadow-xs"
                >
                  <span>Dùng ngữ liệu này tạo đề</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {isCustom && (
                  <button
                    onClick={() => handleDeleteCustom(p.id!, p.title)}
                    className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Xóa ngữ liệu tự thêm này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Passage Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Thêm Ngữ Liệu Riêng Vào Ngân Hàng
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewPassage} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tên tác phẩm / Nhan đề đoạn trích <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="VD: Chiếc thuyền ngoài xa (Trích)"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tác giả
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="VD: Nguyễn Minh Châu"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Thể loại
                  </label>
                  <select
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value as LiteraryGenre)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                  >
                    {genres.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phù hợp khối lớp
                  </label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                  >
                    <option value="10">Lớp 10</option>
                    <option value="11">Lớp 11</option>
                    <option value="12">Lớp 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nguồn xuất bản
                  </label>
                  <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    placeholder="VD: NXB Giáo dục, 2020"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nội dung đoạn trích <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={8}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Dán nội dung ngữ liệu tại đây..."
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs sm:text-sm font-serif leading-relaxed"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-900 text-white text-xs font-semibold cursor-pointer"
                >
                  Lưu vào ngân hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
