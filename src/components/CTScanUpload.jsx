import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  FileText, 
  FileCheck,
  Layers,
  Sparkles
} from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

export default function CTScanUpload({
  selectedImage,
  fileName,
  fileSize,
  selectedFile,
  scanNotes,
  notes,
  onImageUpload,
  onFileChange,
  onRemoveImage,
  onNotesChange,
  onSelectPreset,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Format file size utility
  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Validate and process selected file
  const processFile = (file) => {
    setErrorMessage('');

    if (!file) return;

    // 1. Validate File Type
    const fileType = file.type?.toLowerCase();
    const fileNameLower = file.name?.toLowerCase() || '';
    const hasValidExt = ACCEPTED_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));

    if (!ACCEPTED_FILE_TYPES.includes(fileType) && !hasValidExt) {
      setErrorMessage('Unsupported file format. Please upload a JPG, JPEG, or PNG image.');
      return;
    }

    // 2. Validate File Size (10 MB max)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File size (${formatFileSize(file.size)}) exceeds the maximum 10 MB limit.`);
      return;
    }

    // 3. Read and provide preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;

      // Update parent state with both data URL and actual File object
      if (onImageUpload) {
        onImageUpload(dataUrl, file.name, file);
      }
      if (onFileChange) {
        onFileChange(file, dataUrl, file.size);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Error reading the selected image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = () => {
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemoveImage) {
      onRemoveImage();
    } else if (onImageUpload) {
      onImageUpload(null, '', null);
    }
    if (onFileChange) {
      onFileChange(null, null, 0);
    }
  };

  const handleNotesTextChange = (e) => {
    if (onNotesChange) {
      onNotesChange(e.target.value);
    }
  };

  const currentNotesValue = scanNotes ?? notes ?? '';

  // Preset demo samples
  const samplePresets = [
    {
      id: 'adenocarcinoma',
      label: 'Sample: Adenocarcinoma',
      sub: 'Axial slice with peripheral nodule',
      url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
      approxSize: 2450000,
    },
    {
      id: 'squamous',
      label: 'Sample: Squamous Cell',
      sub: 'Central hilar cavitary mass',
      url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=600&q=80',
      approxSize: 1850000,
    },
    {
      id: 'normal',
      label: 'Sample: Normal / Benign',
      sub: 'Clear bilateral lung parenchyma',
      url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
      approxSize: 1980000,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Upload CT Scan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload the patient's chest CT scan image for AI-assisted analysis.
          </p>
        </div>
      </div>

      {/* Upload Zone & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Upload Drag-and-Drop Area */}
        <div className="lg:col-span-7 space-y-4">
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
              isDragging
                ? 'border-teal-600 bg-teal-50/70 scale-[1.01]'
                : 'border-slate-300 hover:border-teal-500 bg-slate-50/70 hover:bg-teal-50/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-teal-100/80 border border-teal-200 text-teal-700 flex items-center justify-center mb-3.5 shadow-2xs">
              <UploadCloud className="w-7 h-7" />
            </div>

            <p className="text-sm font-bold text-slate-800">
              Drag & Drop your CT scan image here
            </p>

            <p className="text-xs text-slate-500 mt-1">
              or click to browse from your device
            </p>

            <div className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-teal-700 shadow-2xs hover:bg-slate-50">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Browse File</span>
            </div>

            <p className="text-[11px] text-slate-400 font-medium mt-3">
              Accepted formats: <strong className="text-slate-600">JPG, JPEG, PNG</strong> (Max 10 MB)
            </p>
          </div>

          {/* Validation Error Message */}
          {errorMessage && (
            <div className="flex items-start space-x-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Preset Demo Scans */}
          {onSelectPreset && (
            <div className="pt-2">
              <div className="flex items-center space-x-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Or load standard test sample:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {samplePresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      onSelectPreset(preset.url, `${preset.id}_ct_slice.png`);
                      if (onFileChange) {
                        onFileChange(null, preset.url, preset.approxSize);
                      }
                    }}
                    className="p-2.5 text-left rounded-xl border border-slate-200 bg-slate-50/80 hover:border-teal-500 hover:bg-teal-50/60 transition-all text-xs"
                  >
                    <p className="font-semibold text-slate-800 leading-tight truncate">{preset.label}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{preset.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Image Preview & Details Card */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-[280px] text-white shadow-inner relative overflow-hidden">
          
          {selectedImage ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono font-semibold text-teal-400 flex items-center">
                  <FileCheck className="w-3.5 h-3.5 mr-1" /> CT SCAN PREVIEW
                </span>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2 py-1 rounded-md transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Image</span>
                </button>
              </div>

              {/* Preview Window */}
              <div className="relative w-full h-44 bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Chest CT Scan Preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-teal-300 border border-slate-700">
                  AXIAL VIEW
                </div>
              </div>

              {/* Metadata Details */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">File Name:</span>
                  <span className="font-mono text-slate-200 truncate max-w-[180px]">
                    {fileName || selectedFile?.name || 'ct_scan_slice.png'}
                  </span>
                </div>

                {(fileSize || selectedFile?.size) && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">File Size:</span>
                    <span className="font-mono text-slate-200">
                      {formatFileSize(fileSize || selectedFile?.size)}
                    </span>
                  </div>
                )}

                <div className="flex items-center text-teal-400 font-semibold text-xs pt-1">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-teal-400" />
                  <span>Upload Successful • Ready for Analysis</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">No CT Scan Selected</p>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Upload a chest CT scan image using the dropzone or select a pre-calibrated sample to view preview.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* 6. Optional CT Scan Notes */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            CT Scan Notes <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
        </div>
        <div className="relative">
          <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <textarea
            rows="2"
            value={currentNotesValue}
            onChange={handleNotesTextChange}
            placeholder="Add any observations or notes related to the uploaded CT scan..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 transition-all focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

    </div>
  );
}
