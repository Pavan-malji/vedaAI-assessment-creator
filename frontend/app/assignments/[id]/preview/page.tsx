'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  Download,
  RotateCw,
  Eye,
  EyeOff,
  MessageSquare,
  CheckCircle,
  Loader2,
  Calendar,
  Layers,
  AlertCircle,
} from 'lucide-react';

import { useVedaStore } from '../../../../lib/store';
import { useAssignmentStore, useAssignmentStoreHydrated } from '../../../../lib/assignmentStore';
import { useSocket } from '../../../../hooks/useSocket';
import { getResult, createAssignment } from '../../../../lib/api';
import QuestionPaperDoc from '../../../../components/QuestionPaperDoc';
import { QuestionPaper } from '../../../../lib/types';

// Map backend difficulty values to the display values used by QuestionPaperDoc
function mapDifficulty(d: string): 'Easy' | 'Moderate' | 'Challenging' {
  if (d === 'easy') return 'Easy';
  if (d === 'hard') return 'Challenging';
  return 'Moderate';
}

export default function PreviewAssignment() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params?.id as string;
  const triggerWs = searchParams?.get('trigger') === 'true';

  // Wait for both stores to rehydrate from localStorage before rendering
  const storeReady = useAssignmentStoreHydrated();

  // Legacy store — for assignment metadata (title, subject, etc.)
  const { assignments } = useVedaStore();
  const assignment = assignments.find((a) => a.id === id);

  // New assignment store — tracks AI generation state
  const storeRef = useRef(useAssignmentStore.getState());

  // paper is keyed by assignment id — survives navigation between assignments
  const jobStatus = useAssignmentStore((s) => s.jobStatus);
  const paper = useAssignmentStore((s) => s.papers[id] ?? null);
  const error = useAssignmentStore((s) => s.error);

  // WebSocket hook — listens for job events and updates the store
  const { isConnected } = useSocket(triggerWs ? id : null);

  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [wsLogs, setWsLogs] = useState<string[]>(['Connecting to AI Server...']);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paperRef = useRef<HTMLDivElement | null>(null);

  // Initialise store with this assignment's ID on mount
  useEffect(() => {
    if (id) {
      storeRef.current.setAssignmentId(id);
      if (triggerWs && jobStatus === 'idle') {
        storeRef.current.setJobStatus('pending');
      }
    }
  }, [id, triggerWs, jobStatus]);

  // Add log messages as status changes
  useEffect(() => {
    if (jobStatus === 'processing') {
      setWsLogs((prev) => [
        ...prev,
        'Connected to Broadcaster. Worker is processing...',
        '[AI] Sending prompt to Gemini...',
      ]);
    }
    if (jobStatus === 'completed') {
      setWsLogs((prev) => [...prev, 'Generation complete! Loading paper...']);
    }
    if (jobStatus === 'failed') {
      setWsLogs((prev) => [...prev, `Worker failed: ${error}`]);
    }
  }, [jobStatus, error]);

  // Polling fallback / periodic sync
  // jobStatus is read via ref to avoid re-running the effect on every status change
  const jobStatusRef = useRef(jobStatus);
  useEffect(() => {
    jobStatusRef.current = jobStatus;
  }, [jobStatus]);

  useEffect(() => {
    if (!id) return;

    const pollResult = async () => {
      // Stop polling if already done
      if (jobStatusRef.current === 'completed' || jobStatusRef.current === 'failed') {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        return;
      }

      try {
        const data = await getResult(id);
        const store = useAssignmentStore.getState();

        if (data.paper) {
          store.setPaper(data.paper);
          store.setJobStatus('completed');
        } else if (data.status === 'failed') {
          store.setJobStatus('failed');
          store.setError('Generation failed on the server.');
        } else if (data.status) {
          store.setJobStatus(data.status as any);
        }
      } catch {
        // Silently ignore polling errors
      }
    };

    // Initial fetch for direct visits (e.g. navigating back to a completed assignment)
    pollResult();

    // Start interval — it self-terminates via the ref check above
    pollingRef.current = setInterval(pollResult, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [id]); // Only depends on id — never re-runs due to status changes

  // Regenerate — create a new assignment with the same config and redirect
  const handleRegenerate = async () => {
    if (!assignment) return;
    const store = useAssignmentStore.getState();
    store.setJobStatus('pending');
    setWsLogs(['Re-connecting to AI Server...']);
    store.setError(null);

    try {
      const data = await createAssignment({
        subject: assignment.subject,
        topic: assignment.title,
        dueDate: assignment.dueDate,
        questionTypes: assignment.questionTypes.map((q) => q.type),
        numberOfQuestions: assignment.questionTypes.reduce((acc, r) => acc + r.count, 0),
        marksPerQuestion: assignment.questionTypes[0]?.marks || 1,
        totalMarks: assignment.maxMarks,
        additionalInstructions: assignment.additionalInfo,
      });

      window.location.href = `/assignments/${data.assignmentId}/preview?trigger=true`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Regeneration failed';
      store.setJobStatus('failed');
      store.setError(msg);
    }
  };

  const handlePrint = async () => {
    if (isExportingPdf) return;

    const exportAssignment = assignment;
    if (!exportAssignment) return;

    setIsExportingPdf(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 14;
      const usableWidth = pageWidth - margin * 2;
      const lineHeight = 6;
      const smallLineHeight = 5;

      const ensureSpace = (neededHeight: number) => {
        if (cursorY + neededHeight > pageHeight - margin) {
          pdf.addPage();
          cursorY = margin;
        }
      };

      const addWrappedText = (text: string, fontSize: number, opts?: { bold?: boolean; align?: 'left' | 'center' | 'right'; color?: [number, number, number]; gapAfter?: number }) => {
        pdf.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
        pdf.setFontSize(fontSize);
        if (opts?.color) pdf.setTextColor(opts.color[0], opts.color[1], opts.color[2]);
        else pdf.setTextColor(20, 20, 20);
        const lines = pdf.splitTextToSize(text, usableWidth);
        const height = lines.length * (fontSize * 0.45 + 1.5);
        ensureSpace(height + (opts?.gapAfter ?? 0));
        pdf.text(lines, pageWidth / 2, cursorY, { align: opts?.align ?? 'center' });
        cursorY += height + (opts?.gapAfter ?? 0);
      };

      let cursorY = margin;

      const sections = displayPaper?.sections?.length
        ? displayPaper.sections
        : [{
            title: 'Section A',
            instruction: 'Attempt all questions. Each question carries marks as indicated.',
            questions: legacyQuestions.map((question) => ({
              id: question.id,
              text: question.text,
              difficulty: question.difficulty === 'Easy' ? 'easy' : question.difficulty === 'Challenging' ? 'hard' : 'medium',
              marks: question.marks,
            })),
          }];

      // Header block
      addWrappedText(exportAssignment.schoolName || 'Delhi Public School, Sector-4, Bokaro', 16, { bold: true, gapAfter: 2 });
      addWrappedText(`Subject: ${exportAssignment.subject}`, 12, { bold: true, gapAfter: 1 });
      addWrappedText(`Class: ${exportAssignment.class}`, 11, { bold: true, color: [90, 90, 90], gapAfter: 4 });

      pdf.setDrawColor(210, 214, 220);
      pdf.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 6;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      pdf.text(`Time Allowed: ${exportAssignment.timeAllowed || '45 minutes'}`, margin, cursorY);
      pdf.text(`Maximum Marks: ${exportAssignment.maxMarks}`, pageWidth - margin, cursorY, { align: 'right' });
      cursorY += 8;

      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      ensureSpace(14);
      pdf.roundedRect(margin, cursorY, usableWidth, 10, 2, 2, 'FD');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(75, 85, 99);
      pdf.text('All questions are compulsory unless stated otherwise.', pageWidth / 2, cursorY + 6.5, { align: 'center' });
      cursorY += 16;

      // Student fields
      ensureSpace(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(75, 85, 99);
      const fieldY = cursorY;
      const third = usableWidth / 3;
      const fieldGap = 6;
      pdf.text('Name:', margin, fieldY);
      pdf.line(margin + 16, fieldY + 0.5, margin + third - fieldGap, fieldY + 0.5);
      pdf.text('Roll Number:', margin + third, fieldY);
      pdf.line(margin + third + 24, fieldY + 0.5, margin + (third * 2) - fieldGap, fieldY + 0.5);
      pdf.text(`Class: ${exportAssignment.class} Section:`, margin + third * 2, fieldY);
      pdf.line(margin + third * 2 + 42, fieldY + 0.5, pageWidth - margin, fieldY + 0.5);
      cursorY += 14;

      cursorY += 2;

      const sectionInstruction = sections[0]?.instruction || 'Attempt all questions. Each question carries marks as indicated.';

      for (const section of sections) {
        ensureSpace(20);
        pdf.setFillColor(255, 248, 245);
        pdf.setDrawColor(255, 228, 213);
        pdf.roundedRect(margin, cursorY, usableWidth, 12, 2, 2, 'FD');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(31, 41, 55);
        pdf.text(section.title.toUpperCase(), pageWidth / 2, cursorY + 8, { align: 'center' });
        cursorY += 16;

        if (section.instruction) {
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(9);
          pdf.setTextColor(107, 114, 128);
          const instructionLines = pdf.splitTextToSize(section.instruction, usableWidth - 4);
          ensureSpace(instructionLines.length * smallLineHeight + 2);
          pdf.text(instructionLines, margin + 2, cursorY);
          cursorY += instructionLines.length * smallLineHeight + 3;
        } else if (sectionInstruction) {
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(9);
          pdf.setTextColor(107, 114, 128);
          const instructionLines = pdf.splitTextToSize(sectionInstruction, usableWidth - 4);
          ensureSpace(instructionLines.length * smallLineHeight + 2);
          pdf.text(instructionLines, margin + 2, cursorY);
          cursorY += instructionLines.length * smallLineHeight + 3;
        }

        for (let index = 0; index < section.questions.length; index++) {
          const question = section.questions[index];
          const questionNumber = `${index + 1}.`;
          const questionTextLines = pdf.splitTextToSize(question.text, usableWidth - 28);
          const questionHeight = Math.max(lineHeight, questionTextLines.length * smallLineHeight) + 2;
          ensureSpace(questionHeight + 6);

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(17, 24, 39);
          pdf.text(questionNumber, margin, cursorY);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.text(questionTextLines, margin + 8, cursorY);

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(107, 114, 128);
          pdf.text(`[${question.marks} Marks]`, pageWidth - margin, cursorY, { align: 'right' });

          cursorY += questionTextLines.length * smallLineHeight + 7;
        }

        cursorY += 4;
      }

      ensureSpace(16);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 6;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(156, 163, 175);
      pdf.text('End of Question Paper', pageWidth / 2, cursorY, { align: 'center' });
      cursorY += 8;

      if (showAnswerKey && displayPaper?.sections?.length) {
        ensureSpace(18);
        pdf.setDrawColor(226, 232, 240);
        pdf.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 8;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(17, 24, 39);
        pdf.text('Answer Key', margin, cursorY);
        cursorY += 8;

        for (const section of displayPaper.sections) {
          ensureSpace(14);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(31, 41, 55);
          pdf.text(section.title, margin, cursorY);
          cursorY += 6;

          for (const question of section.questions) {
            const answerText = `Answer: ${question.text}`;
            const answerLines = pdf.splitTextToSize(answerText, usableWidth - 6);
            const answerHeight = answerLines.length * smallLineHeight + 4;
            ensureSpace(answerHeight + 5);

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(9);
            pdf.setTextColor(75, 85, 99);
            pdf.text('•', margin, cursorY);
            pdf.setFont('helvetica', 'normal');
            pdf.text(answerLines, margin + 5, cursorY);
            cursorY += answerHeight;
          }

          cursorY += 4;
        }
      }

      pdf.save(`assignment-${id}-question-paper.pdf`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Show the loading overlay while generation is in progress
  const activeStatuses: string[] = ['idle', 'pending', 'processing'];
  const showOverlay = triggerWs && activeStatuses.includes(jobStatus);

  // Show skeleton while stores are rehydrating from localStorage
  if (!storeReady) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[60vh] gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-[#FFF3EF] border-t-brand-orange animate-spin" />
        <p className="text-xs font-semibold text-gray-400">Loading assignment...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-100 p-8 text-center bg-white border border-brand-border rounded-3xl">
        <h2 className="text-xl font-extrabold text-brand-dark tracking-tight">
          Assignment not found
        </h2>
        <p className="text-xs font-semibold text-gray-500 mt-2">
          The requested assessment details could not be retrieved.
        </p>
        <button
          onClick={() => router.push('/assignments')}
          className="mt-6 px-5 py-2.5 rounded-full bg-brand-dark text-white text-xs font-bold transition-all cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Build display questions from the AI-generated paper (new store) or legacy store
  const displayPaper: QuestionPaper | null = paper;

  // Flatten paper sections into the legacy Question[] shape for QuestionPaperDoc
  const legacyQuestions = displayPaper
    ? displayPaper.sections.flatMap((sec) =>
        sec.questions.map((q) => ({
          id: q.id,
          text: q.text,
          difficulty: mapDifficulty(q.difficulty) as 'Easy' | 'Moderate' | 'Challenging',
          marks: q.marks,
          section: sec.title,
        }))
      )
    : assignment.questions;

  // Capture as plain string to avoid TypeScript narrowing issues in JSX
  const currentStatus: string = jobStatus;

  return (
    <div className="print-preview-root relative print-area-wrapper min-h-full">
      {/* WebSocket Queue Loading Overlay */}
      {showOverlay && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/95 backdrop-blur-md transition-all duration-300">
          <div className="w-full max-w-lg p-8 rounded-3xl bg-white border border-[#E9ECEF] shadow-2xl flex flex-col items-center text-center space-y-6 mx-4">
            {/* Spinner */}
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#FFF3EF]">
              {currentStatus === 'completed' ? (
                <CheckCircle className="h-10 w-10 text-emerald-500 animate-bounce" />
              ) : currentStatus === 'failed' ? (
                <AlertCircle className="h-10 w-10 text-red-500" />
              ) : (
                <Loader2 className="h-8 w-8 text-brand-orange animate-spin" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-brand-dark tracking-tight">
                {currentStatus === 'pending' && 'Connecting to Broadcaster...'}
                {currentStatus === 'processing' && 'AI Generating Questions...'}
                {currentStatus === 'completed' && 'Assessment Generated!'}
                {currentStatus === 'failed' && 'Generation Failed'}
                {currentStatus === 'idle' && 'Initialising...'}
              </h3>
              <p className="text-xs font-semibold text-gray-400">
                {isConnected
                  ? 'WebSocket connected. Waiting for worker...'
                  : 'Connecting via WebSocket...'}
              </p>
            </div>

            {/* Live Console Log Terminal */}
            <div className="w-full h-44 rounded-2xl bg-brand-dark text-[10px] font-mono text-emerald-400 p-4 text-left overflow-y-auto space-y-1.5 shadow-inner">
              {wsLogs.map((log, idx) => (
                <div key={idx} className="leading-normal">
                  <span className="text-gray-500 select-none">&gt;&nbsp;</span>
                  {log}
                </div>
              ))}
              {currentStatus !== 'completed' && currentStatus !== 'failed' && (
                <div className="flex items-center gap-1.5 text-brand-orange font-bold animate-pulse mt-1 select-none">
                  <span>●</span>
                  <span>Awaiting queue worker broadcast...</span>
                </div>
              )}
            </div>

            {currentStatus === 'failed' && (
              <button
                onClick={() => router.push('/assignments/create')}
                className="px-5 py-2.5 rounded-full bg-brand-dark text-white text-xs font-bold cursor-pointer"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Page Breadcrumb Tracker */}
      <div className="no-print w-full flex items-center justify-between gap-4 p-1 bg-white border border-[#E9ECEF] rounded-2xl mb-6">
        <button
          onClick={() => router.push('/')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-gray-400 text-xs font-semibold hover:bg-brand-light-gray hover:text-brand-dark transition-all duration-200 cursor-pointer"
        >
          <CheckIcon className="h-4 w-4 text-emerald-500" />
          <span>1. Assignment Details</span>
        </button>
        <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-light-gray text-brand-dark text-xs font-extrabold tracking-wide">
          <Layers className="h-4 w-4 text-brand-orange" />
          <span>2. Generation Preview</span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
        {/* Left Side Controller Pane */}
        <div className="no-print space-y-5">
          {/* AI Chat Bubble */}
          <div className="p-5 rounded-3xl bg-white border border-brand-border shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <MessageSquare className="h-4.5 w-4.5 text-brand-orange" />
              <span>AI Broadcaster</span>
            </div>
            <p className="text-xs font-bold text-brand-dark leading-relaxed">
              Here is the customized Question Paper for your CBSE Class{' '}
              {assignment.class} {assignment.subject} students:
            </p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 bg-brand-light-gray px-3 py-1.5 rounded-xl border border-gray-100/50">
              <Calendar className="h-3.5 w-3.5 text-brand-orange" />
              <span>Due Date: {assignment.dueDate}</span>
            </div>
          </div>

          {/* Action Panel */}
          <div className="p-5 rounded-3xl bg-white border border-brand-border shadow-sm space-y-3.5">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Controls
            </h4>

            <button
              onClick={handlePrint}
              disabled={isExportingPdf}
              className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-full bg-brand-dark hover:bg-brand-orange text-white text-xs font-bold tracking-wide shadow-md hover:shadow-brand-orange-glow active:scale-98 transition-all duration-300 cursor-pointer"
            >
              <Download className={`h-4 w-4 ${isExportingPdf ? 'animate-pulse' : ''}`} />
              <span>{isExportingPdf ? 'Preparing PDF...' : 'Download as PDF'}</span>
            </button>

            <button
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-full bg-white border border-brand-border hover:border-brand-dark text-gray-700 hover:text-brand-dark text-xs font-bold active:scale-98 transition-all duration-200 cursor-pointer"
            >
              {showAnswerKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span>
                {showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}
              </span>
            </button>

            <button
              onClick={handleRegenerate}
              className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-full bg-white border border-brand-border hover:border-brand-dark text-gray-700 hover:text-brand-dark text-xs font-bold active:scale-98 transition-all duration-200 cursor-pointer"
            >
              <RotateCw className="h-4 w-4 text-brand-orange" />
              <span>Regenerate Paper</span>
            </button>
          </div>
        </div>

        {/* Right Side: Question Paper Document */}
        <div ref={paperRef} className="print-area flex justify-center overflow-x-auto pb-4">
          <QuestionPaperDoc
            schoolName={assignment.schoolName}
            subject={assignment.subject}
            className={assignment.class}
            timeAllowed={assignment.timeAllowed}
            maxMarks={assignment.maxMarks}
            questions={legacyQuestions}
            answerKey={assignment.answerKey}
            showAnswerKey={showAnswerKey}
          />
        </div>
      </div>
    </div>
  );
}

// Inline check icon to avoid import conflict
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
