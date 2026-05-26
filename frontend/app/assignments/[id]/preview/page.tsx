'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Download, 
  RotateCw, 
  Eye, 
  EyeOff, 
  MessageSquare,
  CheckCircle,
  Loader2,
  Calendar,
  Layers
} from 'lucide-react';
import { useVedaStore } from '../../../../lib/store';
import { generateQuestionsForSubject } from '../../../../lib/generator';
import QuestionPaperDoc from '../../../../components/QuestionPaperDoc';

export default function PreviewAssignment() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const id = params?.id as string;
  const triggerWs = searchParams?.get('trigger') === 'true';

  const { assignments, wsStatus, wsLogs, triggerGeneration, resetWs } = useVedaStore();
  const assignment = assignments.find((a) => a.id === id);

  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [showOverlay, setShowOverlay] = useState(triggerWs);

  // Trigger WebSocket generation simulation
  useEffect(() => {
    if (triggerWs && assignment) {
      triggerGeneration(assignment.id, () => {
        // Callback after completion: set overlay to close after 1s
        setTimeout(() => {
          setShowOverlay(false);
          // Set status to published in client
          assignment.status = 'published';
        }, 1000);
      });
    } else {
      resetWs();
    }
  }, [triggerWs, id, assignment, resetWs, triggerGeneration]);

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-100 p-8 text-center bg-white border border-brand-border rounded-3xl">
        <h2 className="text-xl font-extrabold text-brand-dark tracking-tight">Assignment not found</h2>
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

  // Handle manual regeneration trigger
  const handleRegenerate = () => {
    setShowOverlay(true);
    triggerGeneration(assignment.id, () => {
      // Perform simple regeneration of questions for variety
      const { questions, answerKey } = generateQuestionsForSubject(
        assignment.subject,
        assignment.class,
        assignment.questionTypes,
        assignment.additionalInfo
      );
      assignment.questions = questions;
      assignment.answerKey = answerKey;

      setTimeout(() => {
        setShowOverlay(false);
      }, 1000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative print-area-wrapper min-h-full">
      {/* WebSocket Queue Loading Overlay */}
      {showOverlay && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/95 backdrop-blur-md transition-all duration-300">
          <div className="w-full max-w-lg p-8 rounded-3xl bg-white border border-[#E9ECEF] shadow-2xl flex flex-col items-center text-center space-y-6 mx-4">
            
            {/* Spinning/Check Indicator */}
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#FFF3EF]">
              {wsStatus === 'completed' ? (
                <CheckCircle className="h-10 w-10 text-emerald-500 animate-bounce" />
              ) : (
                <Loader2 className="h-8 w-8 text-brand-orange animate-spin" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-brand-dark tracking-tight">
                {wsStatus === 'connecting' && 'Connecting to Broadcaster...'}
                {wsStatus === 'processing' && 'AI Generating Questions...'}
                {wsStatus === 'completed' && 'Assessment Generated!'}
              </h3>
              <p className="text-xs font-semibold text-gray-400">
                Please wait while background workers compile your prompt constraints.
              </p>
            </div>

            {/* Simulated Live Console Log Terminal */}
            <div className="w-full h-44 rounded-2xl bg-brand-dark text-[10px] font-mono text-emerald-400 p-4 text-left overflow-y-auto space-y-1.5 shadow-inner">
              {wsLogs.map((log, idx) => (
                <div key={idx} className="leading-normal">
                  <span className="text-gray-500 select-none">&gt;&nbsp;</span>
                  {log}
                </div>
              ))}
              {wsStatus !== 'completed' && (
                <div className="flex items-center gap-1.5 text-brand-orange font-bold animate-pulse mt-1 select-none">
                  <span>●</span>
                  <span>Awaiting queue worker broadcast...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Breadcrumb Tracker */}
      <div className="no-print w-full flex items-center justify-between gap-4 p-1 bg-white border border-[#E9ECEF] rounded-2xl mb-6">
        <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-gray-400 text-xs font-semibold">
          <Check className="h-4 w-4 text-emerald-500" />
          <span>1. Assignment Details</span>
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-light-gray text-brand-dark text-xs font-extrabold tracking-wide">
          <Layers className="h-4 w-4 text-brand-orange" />
          <span>2. Generation Preview</span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
        
        {/* Left Side Controller Pane */}
        <div className="no-print space-y-5">
          {/* AI Chat-like Prompt Bubble Card */}
          <div className="p-5 rounded-3xl bg-white border border-brand-border shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <MessageSquare className="h-4.5 w-4.5 text-brand-orange" />
              <span>AI Broadcaster</span>
            </div>
            
            <p className="text-xs font-bold text-brand-dark leading-relaxed">
              Certainly, Lakshya! Here is the customized Question Paper for your CBSE Class {assignment.class} {assignment.subject} students:
            </p>

            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 bg-brand-light-gray px-3 py-1.5 rounded-xl border border-gray-100/50">
              <Calendar className="h-3.5 w-3.5 text-brand-orange" />
              <span>Due Date: {assignment.dueDate}</span>
            </div>
          </div>

          {/* Action List Panel */}
          <div className="p-5 rounded-3xl bg-white border border-brand-border shadow-sm space-y-3.5">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Controls
            </h4>

            {/* Print / Save to PDF */}
            <button
              onClick={handlePrint}
              className="
                flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-full
                bg-brand-dark hover:bg-brand-orange text-white text-xs font-bold tracking-wide
                shadow-md hover:shadow-brand-orange-glow active:scale-98 transition-all duration-300 cursor-pointer
              "
            >
              <Download className="h-4 w-4" />
              <span>Download as PDF</span>
            </button>

            {/* Toggle Answer Key */}
            <button
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              className="
                flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-full
                bg-white border border-brand-border hover:border-brand-dark text-gray-700 hover:text-brand-dark
                text-xs font-bold active:scale-98 transition-all duration-200 cursor-pointer
              "
            >
              {showAnswerKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}</span>
            </button>

            {/* Regenerate Trigger */}
            <button
              onClick={handleRegenerate}
              className="
                flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-full
                bg-white border border-brand-border hover:border-brand-dark text-gray-700 hover:text-brand-dark
                text-xs font-bold active:scale-98 transition-all duration-200 cursor-pointer
              "
            >
              <RotateCw className="h-4 w-4 text-brand-orange animate-spin-hover" />
              <span>Regenerate Paper</span>
            </button>
          </div>
        </div>

        {/* Right Side: Scrollable Physical Document Render Container */}
        <div className="print-area flex justify-center overflow-x-auto pb-4">
          <QuestionPaperDoc
            schoolName={assignment.schoolName}
            subject={assignment.subject}
            className={assignment.class}
            timeAllowed={assignment.timeAllowed}
            maxMarks={assignment.maxMarks}
            questions={assignment.questions}
            answerKey={assignment.answerKey}
            showAnswerKey={showAnswerKey}
          />
        </div>
      </div>
    </div>
  );
}

// Simple check component icon
function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
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
