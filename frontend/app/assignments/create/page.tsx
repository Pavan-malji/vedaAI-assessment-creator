'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  Mic, 
  MicOff,
  FileText, 
  Layers,
  AlertCircle
} from 'lucide-react';

import { useVedaStore, Assignment } from '../../../lib/store';
import { generateQuestionsForSubject } from '../../../lib/generator';
import UploadDropzone from '../../../components/UploadDropzone';
import QuestionTypeTable, { QuestionTypeRow } from '../../../components/QuestionTypeTable';

export default function CreateAssignment() {
  const router = useRouter();
  const addAssignment = useVedaStore((state) => state.addAssignment);

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Science');
  const [classLevel, setClassLevel] = useState('5th');
  const [schoolName, setSchoolName] = useState('Delhi Public School, Sector-4, Bokaro');
  const [timeAllowed, setTimeAllowed] = useState('45 minutes');
  const [dueDate, setDueDate] = useState('');
  
  const [fileUploaded, setFileUploaded] = useState<{ name: string; size: string } | null>(null);
  
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeRow[]>([
    { id: 'row-1', type: 'Multiple Choice Questions', count: 4, marks: 1 },
    { id: 'row-2', type: 'Short Questions', count: 3, marks: 2 },
    { id: 'row-3', type: 'Diagram/Graph-Based Questions', count: 5, marks: 5 },
    { id: 'row-4', type: 'Numerical Problems', count: 5, marks: 5 },
  ]);

  const [additionalInfo, setAdditionalInfo] = useState('');
  
  // Custom states
  const [isListening, setIsListening] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Voice Input Simulation
  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      setValidationError('');
      
      // Simulate speech-to-text input after a short delay
      setTimeout(() => {
        const spokenText = "Generate a highly structured question paper testing conceptual comprehension rather than rote memory. Make sure it matches NCERT guidelines.";
        setAdditionalInfo((prev) => prev ? prev + " " + spokenText : spokenText);
        setIsListening(false);
      }, 2500);
    } else {
      setIsListening(false);
    }
  };

  const handleValidation = (): boolean => {
    if (!title.trim()) {
      setValidationError('Please specify an Assignment Title.');
      return false;
    }
    if (!dueDate) {
      setValidationError('Please select a Due Date.');
      return false;
    }
    
    // Check if total questions is > 0
    const totalQ = questionTypes.reduce((acc, row) => acc + row.count, 0);
    if (totalQ <= 0) {
      setValidationError('Please configure at least 1 question.');
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleNext = () => {
    if (!handleValidation()) return;

    const assignmentId = 'assign-' + Date.now();
    const totalMarks = questionTypes.reduce((acc, r) => acc + (r.count * r.marks), 0);

    // Generate dynamic questions based on fields
    const { questions, answerKey } = generateQuestionsForSubject(
      subject,
      classLevel,
      questionTypes,
      additionalInfo
    );

    // Date formatting (convert YYYY-MM-DD to DD-MM-YYYY)
    const formattedDueDate = dueDate.split('-').reverse().join('-');
    const today = new Date();
    const formattedToday = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    const newAssignment: Assignment = {
      id: assignmentId,
      title: title,
      assignedDate: formattedToday,
      dueDate: formattedDueDate,
      status: 'draft', // Draft status initially, transitions during preview queue simulation
      subject,
      class: classLevel,
      schoolName,
      timeAllowed,
      maxMarks: totalMarks,
      additionalInfo,
      fileUploaded,
      questionTypes: questionTypes.map(q => ({ type: q.type, count: q.count, marks: q.marks })),
      questions,
      answerKey
    };

    addAssignment(newAssignment);
    
    // Redirect to preview screen with WebSocket generation visual trigger
    router.push(`/assignments/${assignmentId}/preview?trigger=true`);
  };

  return (
    <div className="max-w-190 mx-auto space-y-6 pt-2">
      
      {/* Step Indicators */}
      <div className="no-print w-full flex items-center justify-between gap-4 p-1 bg-white border border-[#E9ECEF] rounded-2xl mb-2">
        <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-light-gray text-brand-dark text-xs font-extrabold tracking-wide">
          <Layers className="h-4 w-4 text-brand-orange" />
          <span>1. Assignment Details</span>
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-gray-400 text-xs font-semibold">
          <FileText className="h-4 w-4 text-gray-300" />
          <span>2. Generation Preview</span>
        </div>
      </div>

      {/* Main Form Panel */}
      <div className="relative p-6 md:p-8 rounded-3xl bg-white border border-[#EAEDF2] shadow-sm space-y-6">
        
        {/* Card Title */}
        <div className="border-b border-gray-50 pb-4">
          <h2 className="text-xl font-extrabold text-brand-dark tracking-tight">Assignment Details</h2>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            Basic information about your assignment
          </p>
        </div>

        {/* Validation Errors alert */}
        {validationError && (
          <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Text Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div className="space-y-1.5 col-span-1 sm:col-span-2">
            <label className="text-xs font-bold text-gray-700">Assignment Title *</label>
            <input
              type="text"
              placeholder="e.g. Quiz on Electricity"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="
                w-full px-4 py-2.5 rounded-xl border border-brand-border
                text-sm font-semibold text-brand-dark placeholder-gray-400
                focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30
                transition-all duration-200 bg-gray-50/20
              "
            />
          </div>

          {/* School Name */}
          <div className="space-y-1.5 col-span-1 sm:col-span-2">
            <label className="text-xs font-bold text-gray-700">School / Organization</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="
                w-full px-4 py-2.5 rounded-xl border border-brand-border
                text-sm font-semibold text-brand-dark placeholder-gray-400
                focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30
                transition-all duration-200 bg-gray-50/20
              "
            />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="
                w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white
                text-sm font-semibold text-brand-dark focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30
                transition-all duration-200 cursor-pointer
              "
            >
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Social Studies">Social Studies</option>
            </select>
          </div>

          {/* Class */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Class</label>
            <select
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              className="
                w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white
                text-sm font-semibold text-brand-dark focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30
                transition-all duration-200 cursor-pointer
              "
            >
              <option value="5th">5th Grade</option>
              <option value="6th">6th Grade</option>
              <option value="7th">7th Grade</option>
              <option value="8th">8th Grade</option>
              <option value="9th">9th Grade</option>
              <option value="10th">10th Grade</option>
              <option value="11th">11th Grade</option>
              <option value="12th">12th Grade</option>
            </select>
          </div>

          {/* Time Allowed */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Time Allowed</label>
            <input
              type="text"
              placeholder="e.g. 45 minutes"
              value={timeAllowed}
              onChange={(e) => setTimeAllowed(e.target.value)}
              className="
                w-full px-4 py-2.5 rounded-xl border border-brand-border
                text-sm font-semibold text-brand-dark focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30
                transition-all duration-200 bg-gray-50/20
              "
            />
          </div>

          {/* Due Date Calendar Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Due Date *</label>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="
                  w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white
                  text-sm font-semibold text-brand-dark focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30
                  transition-all duration-200 cursor-pointer pr-10
                "
              />
              <Calendar className="absolute right-3.5 top-3.5 h-4.5 w-4.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* File Drag and Drop zone */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-gray-700">Attachment Material (Optional)</label>
          <UploadDropzone onFileSelect={setFileUploaded} selectedFile={fileUploaded} />
        </div>

        {/* Dynamic Question Configurations Table */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <span>Configure Questions Structure</span>
            <span className="bg-[#FFF3EF] text-brand-orange text-[10px] px-2 py-0.5 rounded font-bold uppercase">Dynamic</span>
          </label>
          <QuestionTypeTable rows={questionTypes} onChange={setQuestionTypes} />
        </div>

        {/* Prompt/Guidelines Text Area */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
            <span>Additional Guidelines (For better output)</span>
            {isListening && (
              <span className="text-[10px] font-extrabold text-brand-orange flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
                Simulating Voice Input...
              </span>
            )}
          </label>
          <div className="relative rounded-3xl border border-[#EAEDF2] overflow-hidden bg-gray-50/20">
            <textarea
              placeholder="e.g. Generate a question paper for 3 hour exam duration..."
              rows={4}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="
                w-full p-4 text-sm font-semibold text-brand-dark placeholder-gray-400
                border-none resize-none focus:outline-none focus:ring-1 focus:ring-brand-orange/20
                pr-12 bg-transparent
              "
            />
            {/* Listening Mic Action Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`
                absolute right-4.5 bottom-4.5 p-2 rounded-xl border transition-all duration-300 shadow-sm cursor-pointer
                ${isListening 
                  ? 'bg-brand-orange text-white border-brand-orange animate-ping' 
                  : 'bg-white hover:bg-gray-100 text-gray-400 hover:text-brand-orange border-brand-border'
                }
              `}
            >
              {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Wizard Footer */}
      <div className="no-print flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.push('/assignments')}
          className="
            flex items-center gap-2 px-5 py-3 rounded-full border border-brand-border bg-white text-gray-600
            text-xs font-bold hover:bg-gray-50 hover:text-brand-dark transition-all duration-200 cursor-pointer
          "
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="
            flex items-center gap-2 px-6 py-3.5 rounded-full bg-brand-dark text-white
            text-xs font-bold tracking-wide hover:bg-brand-orange hover:shadow-lg hover:shadow-brand-orange-glow
            active:scale-98 transition-all duration-300 cursor-pointer
          "
        >
          <span>Generate Assessment</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
