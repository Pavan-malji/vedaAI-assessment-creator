'use client';

import { useState, useRef } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

interface UploadDropzoneProps {
  onFileSelect: (file: { name: string; size: string } | null) => void;
  selectedFile: { name: string; size: string } | null;
}

export default function UploadDropzone({ onFileSelect, selectedFile }: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (name: string, sizeStr: string) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          onFileSelect({ name, size: sizeStr });
          return null;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      simulateUpload(file.name, sizeStr);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      simulateUpload(file.name, sizeStr);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* File Upload Zone */}
      {!selectedFile && uploadProgress === null && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`
            relative flex flex-col items-center justify-center w-full min-h-42.5 p-6 rounded-3xl cursor-pointer
            border-2 border-dashed transition-all duration-300
            ${isDragActive 
              ? 'border-brand-orange bg-[#FFF3EF]/50' 
              : 'border-[#EAEDF2] hover:border-brand-orange bg-white hover:bg-gray-50/50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.txt,.doc,.docx,image/*"
            onChange={handleChange}
          />
          
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Code-drawn selector illustration */}
            <div className="relative w-40 h-24 mb-2 select-none pointer-events-none">
              <div className="absolute inset-x-3 top-3 h-14 rounded-3xl border border-[#E9ECEF] bg-white shadow-sm" />
              <div className="absolute left-1/2 top-5 -translate-x-1/2 w-16 h-16 rounded-2xl bg-linear-to-br from-[#FFF3EF] to-white border border-[#F1E0D8] shadow-inner shadow-black/5 flex items-center justify-center">
                <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#FFF7F3] border border-[#F6D3C3]">
                  <UploadCloud className="h-5 w-5 text-brand-orange" />
                </div>
              </div>
              <div className="absolute left-7 bottom-2 h-9 w-24 rounded-2xl bg-[#F8FAFC] border border-[#EEF1F5]" />
              <div className="absolute right-7 bottom-3 h-7 w-18 rounded-2xl bg-[#F2F4F7] border border-[#E5E7EB]" />
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-brand-dark tracking-tight">
                Choose a file or drag & drop it here
              </p>
              <p className="text-xs font-semibold text-gray-400">
                PDF, JPEG, PNG, upto 10MB
              </p>
            </div>
            
            <button
              type="button"
              className="
                px-4 py-2 rounded-xl bg-gray-100 hover:bg-brand-orange hover:text-white
                text-xs font-bold text-gray-700 transition-all duration-200 cursor-pointer
              "
            >
              Browse Files
            </button>
          </div>
        </div>
      )}

      {/* Uploading State */}
      {uploadProgress !== null && (
        <div className="w-full p-6 rounded-3xl bg-white border border-brand-border flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FFF3EF] border border-[#FFE1D4] text-brand-orange">
            <UploadCloud className="h-6 w-6 animate-pulse" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-brand-dark">
              <span>Uploading attachment...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-orange rounded-full transition-all duration-100"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Uploaded File Showcase */}
      {selectedFile && uploadProgress === null && (
        <div className="
          w-full p-5 rounded-3xl bg-white border border-[#E9ECEF] flex items-center justify-between gap-4
          shadow-sm shadow-black/2 hover:shadow-md transition-shadow duration-300
        ">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[#EFF2F5] text-brand-dark">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-brand-dark truncate pr-4">
                {selectedFile.name}
              </p>
              <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                {selectedFile.size} • Uploaded successfully
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="
              flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 hover:bg-red-50
              text-gray-400 hover:text-red-500 border border-gray-100 transition-colors cursor-pointer
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      <p className="text-[11px] font-bold text-gray-400 text-center mt-2.5">
        Upload images of your preferred document/image
      </p>
    </div>
  );
}
