import React from 'react';
import { BookOpen, FileText, History, Library, Settings, Sparkles, GraduationCap } from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'generator' | 'history' | 'passages' | 'settings';
  setActiveTab: (tab: 'home' | 'generator' | 'history' | 'passages' | 'settings') => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, historyCount }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Branding */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3.5 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-900 via-red-800 to-amber-700 flex items-center justify-center text-white shadow-md shadow-rose-950/15 group-hover:scale-102 transition-transform">
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-lg sm:text-xl text-stone-900 tracking-tight leading-none">
                  TRỢ LÝ TẠO ĐỀ NGỮ VĂN THPT
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-900 border border-amber-200">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-700" />
                  GDPT 2018
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium tracking-normal mt-0.5">
                Chuyên biệt dành cho Giáo viên Ngữ văn THPT • Lớp 10, 11, 12
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'home'
                  ? 'bg-rose-50 text-rose-900 font-semibold border border-rose-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Trang chủ</span>
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'generator'
                  ? 'bg-rose-900 text-white font-semibold shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Tạo đề</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'history'
                  ? 'bg-rose-50 text-rose-900 font-semibold border border-rose-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Lịch sử đề</span>
              {historyCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-semibold bg-stone-200 text-stone-700">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('passages')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'passages'
                  ? 'bg-rose-50 text-rose-900 font-semibold border border-rose-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Library className="w-4 h-4" />
              <span>Ngân hàng ngữ liệu</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors ${
                activeTab === 'settings' ? 'bg-rose-50 text-rose-900 border border-rose-200' : ''
              }`}
              title="Cài đặt thông tin trường"
            >
              <Settings className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
