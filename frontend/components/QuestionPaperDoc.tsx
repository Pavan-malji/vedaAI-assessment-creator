'use client';

import { Question, AnswerKeyItem } from '../lib/store';

interface QuestionPaperDocProps {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  questions: Question[];
  answerKey: AnswerKeyItem[];
  showAnswerKey?: boolean;
}

export default function QuestionPaperDoc({
  schoolName = 'Delhi Public School, Sector-4, Bokaro',
  subject = 'English',
  className = '5th',
  timeAllowed = '45 minutes',
  maxMarks = 20,
  questions = [],
  answerKey = [],
  showAnswerKey = true,
}: QuestionPaperDocProps) {

  // Group questions by section
  const sections = questions.reduce((acc, q) => {
    const sec = q.section || 'Section A';
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  // Difficulty badge colors
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200/50';
      case 'Moderate':
        return 'bg-blue-50 text-blue-700 border border-blue-200/50';
      case 'Challenging':
        return 'bg-rose-50 text-rose-700 border border-rose-200/50';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="print-paper w-full max-w-[800px] mx-auto bg-white border border-[#E9ECEF] rounded-3xl p-8 md:p-12 shadow-sm font-inter text-gray-800 leading-relaxed">
      {/* Paper Header */}
      <div className="text-center space-y-2 border-b border-dashed border-gray-200 pb-6 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          {schoolName}
        </h1>
        <div className="space-y-1">
          <p className="text-base font-bold text-gray-700">Subject: {subject}</p>
          <p className="text-sm font-bold text-gray-600">Class: {className}</p>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="flex items-center justify-between text-xs font-bold text-gray-700 pb-4">
        <span>Time Allowed: {timeAllowed}</span>
        <span>Maximum Marks: {maxMarks}</span>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-xs font-semibold text-gray-600 mb-6 text-center">
        All questions are compulsory unless stated otherwise.
      </div>

      {/* Student Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-gray-600 mb-8 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-1.5">
          <span>Name:</span>
          <span className="flex-1 border-b border-gray-300 h-4 min-w-[100px]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span>Roll Number:</span>
          <span className="flex-1 border-b border-gray-300 h-4 min-w-[80px]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span>Class: {className} Section:</span>
          <span className="flex-1 border-b border-gray-300 h-4 min-w-[50px]" />
        </div>
      </div>

      {/* Sections and Questions */}
      <div className="space-y-8">
        {Object.entries(sections).map(([sectionName, sectionQuestions]) => (
          <div key={sectionName} className="space-y-5">
            {/* Section Header */}
            <div className="text-center space-y-1">
              <h2 className="text-lg font-extrabold text-gray-900 uppercase tracking-wider">
                {sectionName}
              </h2>
              <div className="text-xs font-bold text-gray-600 italic">
                Short Answer Questions
                <span className="block font-medium not-italic text-gray-500 mt-0.5">
                  Attempt all questions. Each question carries marks as indicated.
                </span>
              </div>
            </div>

            {/* Questions List */}
            <ol className="space-y-4 text-sm">
              {sectionQuestions.map((q, idx) => (
                <li key={q.id} className="flex items-start justify-between gap-4 group">
                  <div className="flex items-start gap-2.5">
                    <span className="font-extrabold text-gray-900">{idx + 1}.</span>
                    <div className="space-y-1.5">
                      <p className="font-medium text-gray-900 leading-relaxed">{q.text}</p>
                      {/* Difficulty Badge */}
                      <span className={`
                        no-print inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider
                        ${getDifficultyColor(q.difficulty)}
                      `}>
                        {q.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  {/* Marks Tag */}
                  <span className="text-xs font-bold text-gray-500 flex-shrink-0">
                    [{q.marks} Marks]
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {/* End of Question Paper */}
      <div className="text-center text-xs font-bold uppercase text-gray-400 tracking-widest border-t border-dashed border-gray-200 mt-10 pt-6">
        End of Question Paper
      </div>

      {/* Answer Key */}
      {showAnswerKey && answerKey.length > 0 && (
        <div className="mt-12 border-t-2 border-dashed border-gray-200 pt-8 space-y-6">
          <h3 className="text-base font-extrabold text-gray-900 uppercase tracking-wider">
            Answer Key:
          </h3>
          <ol className="space-y-4 text-xs font-medium text-gray-600">
            {answerKey.map((item, idx) => {
              const matchingQ = questions.find(q => q.id === item.id);
              return (
                <li key={item.id} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-gray-800">{idx + 1}.</span>
                    <div className="space-y-1">
                      {matchingQ && (
                        <p className="font-bold text-gray-500 italic">Q: {matchingQ.text}</p>
                      )}
                      <p className="leading-relaxed text-gray-700">{item.answer}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
