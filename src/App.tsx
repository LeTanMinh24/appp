import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeTab } from './components/HomeTab';
import { GeneratorTab } from './components/GeneratorTab';
import { HistoryTab } from './components/HistoryTab';
import { PassageBankTab } from './components/PassageBankTab';
import { SettingsTab } from './components/SettingsTab';
import { GeneratedExam, SampleModelType, SourcePassage } from './types/exam';
import { getExamHistory } from './utils/storage';
import { BookOpen, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'generator' | 'history' | 'passages' | 'settings'>('home');
  const [examHistory, setExamHistory] = useState<GeneratedExam[]>([]);
  const [initialModel, setInitialModel] = useState<SampleModelType>('B');
  const [loadedExam, setLoadedExam] = useState<GeneratedExam | null>(null);

  // Load history from localStorage
  const loadHistory = () => {
    setExamHistory(getExamHistory());
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Handlers
  const handleStartExamFromHome = (model: SampleModelType = 'B') => {
    setInitialModel(model);
    setLoadedExam(null);
    setActiveTab('generator');
  };

  const handleUsePassageFromBank = (passage: SourcePassage) => {
    // Switch to generator with this passage preloaded
    setActiveTab('generator');
    setLoadedExam({
      id: 'draft_' + Date.now(),
      createdAt: new Date().toISOString(),
      title: `Đề kiểm tra - ${passage.title}`,
      config: {
        subject: 'Ngữ văn',
        grade: passage.grade || '11',
        textbook: 'Kết nối tri thức với cuộc sống',
        topic: passage.title || 'Truyện ngắn, tiểu thuyết',
        examType: 'Kiểm tra giữa kỳ I',
        durationMinutes: 90,
        totalScore: 10,
        sampleModel: 'B',
        readingQuestionCount: 5,
        readingScore: 6.0,
        writingParagraphScore: 0,
        writingEssayScore: 4.0,
        readingQuestionScores: [1.0, 1.0, 1.0, 1.5, 1.5],
        essayType: 'Nghị luận văn học',
        includeMatrix: true,
        includeSpecification: true,
        includeRubric: true,
      },
      examHeader: {
        department: 'SỞ GIÁO DỤC VÀ ĐÀO TẠO',
        school: 'TRƯỜNG THPT',
        examTitle: 'ĐỀ KIỂM TRA ĐỊNH KỲ',
        subject: 'Ngữ văn',
        grade: passage.grade || '11',
        academicYear: '2024 - 2025',
        semester: 'HỌC KỲ I',
        duration: 90,
        totalScore: 10,
      },
      sourcePassage: passage,
      readingSection: {
        sectionTitle: 'ĐỌC HIỂU',
        sectionScore: 6.0,
        questions: [],
      },
      writingSection: {
        sectionTitle: 'LÀM VĂN',
        sectionScore: 4.0,
        hasParagraph: false,
        hasEssay: true,
      },
      answerGuide: {
        readingAnswers: [],
      },
      teacherNotice: 'Thầy/Cô vui lòng rà soát lại trước khi sử dụng.',
    });
  };

  const handleOpenExamFromHistory = (exam: GeneratedExam) => {
    setLoadedExam(exam);
    setActiveTab('generator');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          loadHistory();
        }}
        historyCount={examHistory.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'home' && (
          <HomeTab
            onStartExam={handleStartExamFromHome}
            onBrowsePassages={() => setActiveTab('passages')}
            historyCount={examHistory.length}
            onViewHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'generator' && (
          <GeneratorTab
            initialModel={initialModel}
            loadedExam={loadedExam}
            onClearLoadedExam={() => setLoadedExam(null)}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            exams={examHistory}
            onReloadHistory={loadHistory}
            onOpenExam={handleOpenExamFromHistory}
          />
        )}

        {activeTab === 'passages' && (
          <PassageBankTab onUsePassage={handleUsePassageFromBank} />
        )}

        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-rose-900" />
            <span className="font-semibold text-stone-700">TRỢ LÝ TẠO ĐỀ NGỮ VĂN THPT</span>
            <span>—</span>
            <span>Ứng dụng khảo thí sư phạm chuẩn GDPT 2018</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>Đồng hành cùng Quý Thầy/Cô giáo Ngữ văn THPT trên toàn quốc</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
