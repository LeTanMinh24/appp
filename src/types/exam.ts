export type GradeLevel = '10' | '11' | '12';

export type TextbookSeries = 
  | 'Kết nối tri thức với cuộc sống'
  | 'Chân trời sáng tạo'
  | 'Cánh Diều';

export type ExamType = 
  | 'Kiểm tra giữa kỳ I'
  | 'Kiểm tra cuối kỳ I'
  | 'Kiểm tra giữa kỳ II'
  | 'Kiểm tra cuối kỳ II'
  | 'Kiểm tra thường xuyên (15 phút)'
  | 'Kiểm tra thường xuyên'
  | 'Kiểm tra giữa kỳ'
  | 'Kiểm tra cuối kỳ'
  | 'Đề luyện tập tốt nghiệp THPT';

export type SampleModelType = 'A' | 'B' | 'C';

export type LiteraryGenre = 
  | 'Truyện ngắn / Tiểu thuyết'
  | 'Thơ / Đoạn thơ'
  | 'Nghị luận xã hội'
  | 'Văn bản thông tin'
  | 'Tản văn / Tùy bút'
  | 'Kịch / Bi kịch';

export type CognitiveLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';

export interface SourcePassage {
  id?: string;
  title: string;
  author: string;
  source: string;
  genre: LiteraryGenre;
  content: string;
  grade?: GradeLevel;
  textbook?: string;
  wordCount?: number;
}

export interface ReadingQuestion {
  questionNumber: number;
  score: number;
  cognitiveLevel: CognitiveLevel;
  prompt: string;
}

export interface ParagraphQuestion {
  questionNumber: number;
  score: number;
  cognitiveLevel: CognitiveLevel;
  prompt: string;
  wordLimit?: string;
}

export interface EssayQuestion {
  questionNumber: number;
  score: number;
  cognitiveLevel: CognitiveLevel;
  prompt: string;
  essayType?: string;
}

export interface ReadingAnswerItem {
  questionNumber: number;
  score: number;
  criteria: string;
  detailedAnswer: string;
}

export interface RubricCriterion {
  name: string;
  score: number;
  requirement: string;
}

export interface SectionRubric {
  title: string;
  totalScore: number;
  criteriaList: RubricCriterion[];
}

export interface MatrixRow {
  skill: string;
  contentUnit: string;
  recognitionQuestions: number;
  recognitionScore: number;
  comprehensionQuestions: number;
  comprehensionScore: number;
  applicationQuestions: number;
  applicationScore: number;
  totalScore: number;
  percentage: number;
}

export interface ExamMatrix {
  title: string;
  rows: MatrixRow[];
  summary: {
    totalRecognitionScore: number;
    totalComprehensionScore: number;
    totalApplicationScore: number;
    recognitionPercent: number;
    comprehensionPercent: number;
    applicationPercent: number;
  };
}

export interface SpecificationItem {
  skill: string;
  unit: string;
  cognitiveLevel: string;
  assessmentCriteria: string;
  questionRef: string;
  score: number;
}

export interface SpecificationTable {
  title: string;
  items: SpecificationItem[];
}

export interface ExamHeader {
  department: string;
  school: string;
  examTitle: string;
  subject: string;
  grade: string;
  academicYear: string;
  semester: string;
  duration: number;
  totalScore: number;
  instructions?: string;
  pageCountNotice?: string;
  timeNotice?: string;
}

export interface ExamValidationInfo {
  isValid: boolean;
  readingQuestionsCount: number;
  readingScoreTotal: number;
  writingScoreTotal: number;
  totalScore: number;
  message: string;
}

export interface GeneratedExam {
  id: string;
  createdAt: string;
  title: string;
  config: ExamConfig;
  examHeader: ExamHeader;
  sourcePassage: SourcePassage;
  readingSection: {
    sectionTitle: string;
    sectionScore: number;
    instructions?: string;
    questions: ReadingQuestion[];
  };
  writingSection: {
    sectionTitle: string;
    sectionScore: number;
    hasParagraph: boolean;
    hasEssay: boolean;
    paragraphQuestion?: ParagraphQuestion;
    essayQuestion?: EssayQuestion;
  };
  answerGuide: {
    readingAnswers: ReadingAnswerItem[];
    paragraphRubric?: SectionRubric;
    essayRubric?: SectionRubric;
  };
  matrix?: ExamMatrix;
  specificationTable?: SpecificationTable;
  teacherNotice: string;
  validationInfo?: ExamValidationInfo;
}

export interface ExamConfig {
  subject: string; // Always 'Ngữ văn'
  grade: GradeLevel;
  textbook: TextbookSeries;
  topic: string;
  examType: ExamType;
  durationMinutes: number;
  totalScore: number;
  sampleModel: SampleModelType;
  readingQuestionCount: number;
  readingScore: number;
  writingParagraphScore: number;
  writingEssayScore: number;
  readingQuestionScores: number[];
  essayType?: 'Nghị luận văn học' | 'Nghị luận xã hội';
  includeMatrix: boolean;
  includeSpecification: boolean;
  includeRubric: boolean;
  teacherPromptNote?: string;
}

export interface SchoolSettings {
  department: string;
  schoolName: string;
  teacherName: string;
  academicYear: string;
  semester: string;
  defaultDuration: number;
  autoSaveHistory: boolean;
}
