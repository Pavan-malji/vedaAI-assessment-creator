'use client';

import { PlusCircle, Plus, Minus, ChevronDown, X } from 'lucide-react';

export interface QuestionTypeRow {
  id: string;
  type: string;
  count: number;
  marks: number;
}

interface QuestionTypeTableProps {
  rows: QuestionTypeRow[];
  onChange: (rows: QuestionTypeRow[]) => void;
}

const QUESTION_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Long Questions',
  'Case Study Questions',
];

export default function QuestionTypeTable({ rows, onChange }: QuestionTypeTableProps) {
  
  const updateRow = (id: string, field: keyof QuestionTypeRow, value: string | number) => {
    const updated = rows.map((row) => {
      if (row.id === id) {
        let val = value;
        // Validation: prevent negative values for count and marks
        if (field === 'count' || field === 'marks') {
          val = Math.max(1, parseInt(value as string) || 1);
        }
        return { ...row, [field]: val };
      }
      return row;
    });
    onChange(updated);
  };

  const addRow = () => {
    const newRow: QuestionTypeRow = {
      id: 'row-' + Date.now(),
      type: QUESTION_OPTIONS[Math.min(rows.length, QUESTION_OPTIONS.length - 1)],
      count: 5,
      marks: 2,
    };
    onChange([...rows, newRow]);
  };

  const removeRow = (id: string) => {
    // Keep at least one row
    if (rows.length <= 1) return;
    const filtered = rows.filter((row) => row.id !== id);
    onChange(filtered);
  };

  const totalQuestions = rows.reduce((acc, row) => acc + row.count, 0);
  const totalMarks = rows.reduce((acc, row) => acc + (row.count * row.marks), 0);

  return (
    <div className="w-full space-y-4">
      {/* Table Headers */}
      <div className="grid grid-cols-[1fr_120px_120px_40px] gap-4 text-xs font-bold text-gray-500 px-4">
        <span>Question Type</span>
        <span className="text-center">No. of Questions</span>
        <span className="text-center">Marks</span>
        <span></span>
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {rows.map((row) => (
          <div 
            key={row.id} 
            className="grid grid-cols-[1fr_120px_120px_40px] items-center gap-4 p-2 bg-white rounded-2xl border border-brand-border shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Dropdown Select Type */}
            <div className="relative">
              <select
                value={row.type}
                onChange={(e) => updateRow(row.id, 'type', e.target.value)}
                className="
                  w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl
                  text-sm font-semibold text-brand-dark border-none appearance-none focus:outline-none focus:ring-1 focus:ring-brand-orange/40 transition-colors cursor-pointer
                "
              >
                {QUESTION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                <ChevronDown className="h-4.5 w-4.5" />
              </div>
            </div>

            {/* Questions Counter */}
            <div className="flex items-center justify-between px-2.5 py-1 bg-gray-50 rounded-xl border border-brand-border/10">
              <button
                type="button"
                onClick={() => updateRow(row.id, 'count', row.count - 1)}
                className="flex items-center justify-center w-7 h-7 rounded-lg bg-white shadow-sm border border-brand-border/50 text-gray-600 hover:text-brand-orange transition-colors cursor-pointer"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-sm font-extrabold text-brand-dark">{row.count}</span>
              <button
                type="button"
                onClick={() => updateRow(row.id, 'count', row.count + 1)}
                className="flex items-center justify-center w-7 h-7 rounded-lg bg-white shadow-sm border border-brand-border/50 text-gray-600 hover:text-brand-orange transition-colors cursor-pointer"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Marks Counter */}
            <div className="flex items-center justify-between px-2.5 py-1 bg-gray-50 rounded-xl border border-brand-border/10">
              <button
                type="button"
                onClick={() => updateRow(row.id, 'marks', row.marks - 1)}
                className="flex items-center justify-center w-7 h-7 rounded-lg bg-white shadow-sm border border-brand-border/50 text-gray-600 hover:text-brand-orange transition-colors cursor-pointer"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-sm font-extrabold text-brand-dark">{row.marks}</span>
              <button
                type="button"
                onClick={() => updateRow(row.id, 'marks', row.marks + 1)}
                className="flex items-center justify-center w-7 h-7 rounded-lg bg-white shadow-sm border border-brand-border/50 text-gray-600 hover:text-brand-orange transition-colors cursor-pointer"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Remove Row Button */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                disabled={rows.length <= 1}
                onClick={() => removeRow(row.id)}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 cursor-pointer
                  ${rows.length <= 1
                    ? 'border-gray-50 text-gray-300 bg-gray-50/50 cursor-not-allowed'
                    : 'border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100'
                  }
                `}
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Controls & Live Calculations */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={addRow}
          className="
            flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-brand-dark text-white text-xs font-bold tracking-wide
            hover:bg-brand-orange hover:shadow-md hover:shadow-brand-orange-glow active:scale-98 transition-all duration-300 cursor-pointer
          "
        >
          <PlusCircle className="h-4.5 w-4.5" />
          Add Question Type
        </button>

        {/* Live Counters */}
        <div className="flex gap-6 self-end sm:self-auto text-xs font-semibold text-gray-500">
          <div className="space-y-0.5 text-right">
            <span className="block text-gray-400">Total Questions</span>
            <span className="text-base font-extrabold text-brand-dark">{totalQuestions}</span>
          </div>
          <div className="space-y-0.5 text-right">
            <span className="block text-gray-400">Total Marks</span>
            <span className="text-base font-extrabold text-brand-orange">{totalMarks}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
