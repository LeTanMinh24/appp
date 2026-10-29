import React, { useState } from 'react';
import { X, Check, Save, RotateCcw } from 'lucide-react';
import { GeneratedExam } from '../types/exam';

interface ModalEditExamProps {
  isOpen: boolean;
  onClose: () => void;
  exam: GeneratedExam;
  onSave: (updatedExam: GeneratedExam) => void;
}

export const ModalEditExam: React.FC<ModalEditExamProps> = ({
  isOpen,
  onClose,
  exam,
  onSave,
}) => {
  if (!isOpen) return null;

  const [editedExam, setEditedExam] = useState<GeneratedExam>(JSON.parse(JSON.stringify(exam)));

  const handleReadingQuestionChange = (index: number, newPrompt: string, newScore: number) => {
    const updated = { ...editedExam };
    if (updated.readingSection.questions[index]) {
      updated.readingSection.questions[index].prompt = newPrompt;
      updated.readingSection.questions[index].score = newScore;
    }
    setEditedExam(updated);
  };

  const handleParagraphChange = (newPrompt: string, newScore: number) => {
    const updated = { ...editedExam };
    if (updated.writingSection.paragraphQuestion) {
      updated.writingSection.paragraphQuestion.prompt = newPrompt;
      updated.writingSection.paragraphQuestion.score = newScore;
    }
    setEditedExam(updated);
  };

  const handleEssayChange = (newPrompt: string, newScore: number) => {
    const updated = { ...editedExam };
    if (updated.writingSection.essayQuestion) {
      updated.writingSection.essayQuestion.prompt = newPrompt;
      updated.writingSection.essayQuestion.score = newScore;
    }
    setEditedExam(updated);
  };

  const handleReadingAnswerChange = (index: number, newAnswer: string) => {
    const updated = { ...editedExam };
    if (updated.answerGuide.readingAnswers[index]) {
      updated.answerGuide.readingAnswers[index].detailedAnswer = newAnswer;
    }
    setEditedExam(updated);
  };

  const handleSave = () => {
    onSave(editedExam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Chỉnh sửa trực tiếp đề kiểm tra & đáp án
            </h3>
            <p className="text-xs text-stone-500">
              Thầy/Cô có thể tinh chỉnh câu từ, điểm số hoặc đáp án theo sát thực tế học sinh
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Info */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <h4 className="font-bold text-sm text-stone-900 uppercase tracking-wide">
              Thông tin tiêu đề đề thi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Sở GD&ĐT:</label>
                <input
                  type="text"
                  value={editedExam.examHeader.department}
                  onChange={(e) =>
                    setEditedExam({
                      ...editedExam,
                      examHeader: { ...editedExam.examHeader, department: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white uppercase font-bold"
                  placeholder="SỞ GIÁO DỤC VÀ ĐÀO TẠO..."
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">Tên Trường / Đơn vị:</label>
                <input
                  type="text"
                  value={editedExam.examHeader.school}
                  onChange={(e) =>
                    setEditedExam({
                      ...editedExam,
                      examHeader: { ...editedExam.examHeader, school: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white uppercase font-bold"
                  placeholder="TRƯỜNG THPT CHUYÊN / THPT..."
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">Tiêu đề kỳ thi:</label>
                <input
                  type="text"
                  value={editedExam.examHeader.examTitle}
                  onChange={(e) =>
                    setEditedExam({
                      ...editedExam,
                      examHeader: { ...editedExam.examHeader, examTitle: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white uppercase font-bold"
                  placeholder="KIỂM TRA THƯỜNG XUYÊN (15 PHÚT)"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">Thời gian (phút):</label>
                <input
                  type="number"
                  value={editedExam.examHeader.duration}
                  onChange={(e) =>
                    setEditedExam({
                      ...editedExam,
                      examHeader: { 
                        ...editedExam.examHeader, 
                        duration: Number(e.target.value),
                        timeNotice: `Thời gian làm bài: ${e.target.value} phút (không kể thời gian giao đề)` 
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">Năm học & Học kỳ:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={editedExam.examHeader.academicYear}
                    onChange={(e) =>
                      setEditedExam({
                        ...editedExam,
                        examHeader: { ...editedExam.examHeader, academicYear: e.target.value },
                      })
                    }
                    className="w-full px-2 py-1.5 rounded-lg border border-stone-300 bg-white"
                    placeholder="2024 - 2025"
                  />
                  <input
                    type="text"
                    value={editedExam.examHeader.semester}
                    onChange={(e) =>
                      setEditedExam({
                        ...editedExam,
                        examHeader: { ...editedExam.examHeader, semester: e.target.value },
                      })
                    }
                    className="w-full px-2 py-1.5 rounded-lg border border-stone-300 bg-white"
                    placeholder="HỌC KỲ I"
                  />
                </div>
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">Môn & Khối lớp:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={editedExam.examHeader.subject}
                    onChange={(e) =>
                      setEditedExam({
                        ...editedExam,
                        examHeader: { ...editedExam.examHeader, subject: e.target.value },
                      })
                    }
                    className="w-full px-2 py-1.5 rounded-lg border border-stone-300 bg-white"
                    placeholder="NGỮ VĂN"
                  />
                  <input
                    type="text"
                    value={editedExam.examHeader.grade}
                    onChange={(e) =>
                      setEditedExam({
                        ...editedExam,
                        examHeader: { ...editedExam.examHeader, grade: e.target.value },
                      })
                    }
                    className="w-full px-2 py-1.5 rounded-lg border border-stone-300 bg-white"
                    placeholder="11"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reading Section Questions */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-base text-rose-950 flex items-center justify-between border-b border-stone-200 pb-2">
              <span>Phần I. Đọc hiểu ({editedExam.readingSection.sectionScore} điểm)</span>
            </h4>

            {editedExam.readingSection.questions.map((q, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-stone-900">
                    Câu {q.questionNumber} ({q.cognitiveLevel})
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs text-stone-500 font-medium">Điểm:</span>
                    <input
                      type="number"
                      step="0.25"
                      value={q.score}
                      onChange={(e) =>
                        handleReadingQuestionChange(idx, q.prompt, parseFloat(e.target.value) || 0)
                      }
                      className="w-16 px-2 py-1 rounded border border-stone-300 text-xs font-semibold text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-stone-500 mb-1">Yêu cầu câu hỏi:</label>
                  <textarea
                    rows={2}
                    value={q.prompt}
                    onChange={(e) => handleReadingQuestionChange(idx, e.target.value, q.score)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                {editedExam.answerGuide.readingAnswers[idx] && (
                  <div>
                    <label className="block text-xs text-emerald-800 font-medium mb-1">
                      Nội dung đáp án & Biểu điểm:
                    </label>
                    <textarea
                      rows={2}
                      value={editedExam.answerGuide.readingAnswers[idx].detailedAnswer}
                      onChange={(e) => handleReadingAnswerChange(idx, e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/30 text-xs text-stone-800 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Writing Section */}
          {editedExam.writingSection.sectionScore > 0 && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-base text-rose-950 flex items-center justify-between border-b border-stone-200 pb-2">
                <span>Phần II. Làm văn ({editedExam.writingSection.sectionScore} điểm)</span>
              </h4>

              {/* Paragraph */}
              {editedExam.writingSection.hasParagraph && editedExam.writingSection.paragraphQuestion && (
                <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-900">
                      Câu 1: Viết đoạn văn ~200 chữ
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs text-stone-500 font-medium">Điểm:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={editedExam.writingSection.paragraphQuestion.score}
                        onChange={(e) =>
                          handleParagraphChange(
                            editedExam.writingSection.paragraphQuestion!.prompt,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-16 px-2 py-1 rounded border border-stone-300 text-xs font-semibold text-center"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={editedExam.writingSection.paragraphQuestion.prompt}
                    onChange={(e) =>
                      handleParagraphChange(
                        e.target.value,
                        editedExam.writingSection.paragraphQuestion!.score
                      )
                    }
                    className="w-full p-2.5 rounded-lg border border-stone-300 text-sm font-sans"
                  />
                </div>
              )}

              {/* Essay */}
              {editedExam.writingSection.hasEssay && editedExam.writingSection.essayQuestion && (
                <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-900">
                      {editedExam.writingSection.hasParagraph ? 'Câu 2: Viết bài văn nghị luận' : 'Câu 1: Viết bài văn nghị luận'}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs text-stone-500 font-medium">Điểm:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={editedExam.writingSection.essayQuestion.score}
                        onChange={(e) =>
                          handleEssayChange(
                            editedExam.writingSection.essayQuestion!.prompt,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-16 px-2 py-1 rounded border border-stone-300 text-xs font-semibold text-center"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={editedExam.writingSection.essayQuestion.prompt}
                    onChange={(e) =>
                      handleEssayChange(
                        e.target.value,
                        editedExam.writingSection.essayQuestion!.score
                      )
                    }
                    className="w-full p-2.5 rounded-lg border border-stone-300 text-sm font-sans"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-sm font-medium cursor-pointer"
          >
            Hủy thay đổi
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-rose-900 hover:bg-rose-800 text-white text-sm font-semibold flex items-center space-x-2 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu bản cập nhật</span>
          </button>
        </div>
      </div>
    </div>
  );
};
