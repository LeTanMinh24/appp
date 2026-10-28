import { GeneratedExam, SchoolSettings, SourcePassage } from '../types/exam';

const STORAGE_KEYS = {
  HISTORY: 'tro_ly_van_exam_history_v1',
  SETTINGS: 'tro_ly_van_school_settings_v1',
  CUSTOM_PASSAGES: 'tro_ly_van_custom_passages_v1',
  DRAFT_CONFIG: 'tro_ly_van_draft_config_v1',
};

export const DEFAULT_SETTINGS: SchoolSettings = {
  department: 'SỞ GIÁO DỤC VÀ ĐÀO TẠO',
  schoolName: 'TRƯỜNG THPT CHUYÊN / THPT',
  teacherName: 'Giáo viên Ngữ văn',
  academicYear: '2024 - 2025',
  semester: 'HỌC KỲ I',
  defaultDuration: 90,
  autoSaveHistory: true,
};

export function getExamHistory(): GeneratedExam[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading exam history:', e);
    return [];
  }
}

export function saveExamToHistory(exam: GeneratedExam): void {
  try {
    const history = getExamHistory();
    // Prepend new exam or update if already exists
    const existingIndex = history.findIndex((h) => h.id === exam.id);
    if (existingIndex >= 0) {
      history[existingIndex] = exam;
    } else {
      history.unshift(exam);
    }
    // Limit to 50 most recent exams to prevent local storage overflow
    const trimmed = history.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Error saving exam to history:', e);
  }
}

export function deleteExamFromHistory(id: string): void {
  try {
    const history = getExamHistory().filter((h) => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Error deleting exam:', e);
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (e) {
    console.error('Error clearing history:', e);
  }
}

export function getSchoolSettings(): SchoolSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSchoolSettings(settings: SchoolSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

export function getCustomPassages(): SourcePassage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_PASSAGES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveCustomPassage(passage: SourcePassage): void {
  try {
    const list = getCustomPassages();
    list.unshift(passage);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PASSAGES, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving custom passage:', e);
  }
}

export function deleteCustomPassage(id: string): void {
  try {
    const list = getCustomPassages().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PASSAGES, JSON.stringify(list));
  } catch (e) {
    console.error('Error deleting custom passage:', e);
  }
}
