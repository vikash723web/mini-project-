import React, { useState } from 'react';
import PatientForm from '../components/PatientForm';
import SymptomsForm from '../components/SymptomsForm';
import CTScanUpload from '../components/CTScanUpload';
import Loading from '../components/Loading';
import { 
  Cpu, 
  Sparkles, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  ArrowDown, 
  FileCheck,
  ShieldCheck,
  Code2
} from 'lucide-react';

export default function Analysis({ 
  patientData, 
  setPatientData, 
  symptoms, 
  setSymptoms, 
  selectedImage, 
  setSelectedImage, 
  imageFileName, 
  setImageFileName,
  scanFile,
  setScanFile,
  scanNotes,
  setScanNotes
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [lastSubmission, setLastSubmission] = useState(null);

  // Local fallback state if props not passed from parent
  const [localScanFile, setLocalScanFile] = useState(null);
  const [localScanNotes, setLocalScanNotes] = useState('');

  const activeScanFile = scanFile ?? localScanFile;
  const activeScanNotes = scanNotes ?? localScanNotes;

  const handleScanFileChange = (file) => {
    if (setScanFile) setScanFile(file);
    setLocalScanFile(file);
  };

  const handleScanNotesChange = (notes) => {
    if (setScanNotes) setScanNotes(notes);
    setLocalScanNotes(notes);
  };

  // Helper to validate all required inputs prior to submission
  const validateForm = () => {
    const missing = [];

    const name = patientData?.fullName?.trim();
    const age = patientData?.age ?? patientData?.ageOrDob;
    const email = patientData?.email?.trim();
    const phone = patientData?.phone?.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || name.length < 2) {
      missing.push('Patient Full Name is required');
    }
    if (!age || isNaN(Number(age)) || Number(age) <= 0 || Number(age) > 120) {
      missing.push('Valid Patient Age (1-120) is required');
    }
    if (!patientData?.gender) {
      missing.push('Patient Gender selection is required');
    }
    if (!email || !emailRegex.test(email)) {
      missing.push('Valid Patient Email Address is required');
    }
    if (!phone || phone.replace(/[^0-9]/g, '').length < 7) {
      missing.push('Valid Contact Phone Number is required');
    }
    if (!selectedImage) {
      missing.push('Chest CT Scan image upload is required');
    }

    return {
      isValid: missing.length === 0,
      missingFields: missing,
    };
  };

  const { isValid, missingFields } = validateForm();

  // Preset sample auto-fill helper for quick testing
  const handleAutoFillSample = () => {
    setValidationAttempted(false);
    setSubmissionSuccess(false);

    setPatientData({
      patientId: 'PT-2026-8842',
      fullName: 'Eleanor Vance',
      age: '58',
      ageOrDob: '58',
      gender: 'Female',
      email: 'eleanor.vance@example.com',
      phone: '+1 (555) 349-8821',
      address: '742 Evergreen Terrace, Sector 4',
      notes: 'Chronic smoker (30 pack-years). Persistent dry cough for 5 weeks with right upper quadrant chest tightness.',
    });

    setSymptoms({
      persistent_cough: true,
      cough: true,
      chest_pain: true,
      breathlessness: false,
      shortness_of_breath: false,
      hemoptysis: true,
      blood_in_cough: true,
      weight_loss: true,
      unexplained_weight_loss: true,
      fatigue: true,
      smoking_history: true,
      other_symptoms: 'Mild vocal strain during evening hours.',
    });

    setSelectedImage('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80');
    setImageFileName('adenocarcinoma_ct_axial_slice.png');
    handleScanNotesChange('Axial CT slice centered on right upper lobe with visible nodular density.');
  };

  const handleResetForm = () => {
    setValidationAttempted(false);
    setSubmissionSuccess(false);
    setLastSubmission(null);

    setPatientData({
      patientId: `PT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: '',
      age: '',
      ageOrDob: '',
      gender: 'Female',
      email: '',
      phone: '',
      address: '',
      notes: '',
    });

    setSymptoms({
      persistent_cough: false,
      cough: false,
      chest_pain: false,
      breathlessness: false,
      shortness_of_breath: false,
      hemoptysis: false,
      blood_in_cough: false,
      weight_loss: false,
      unexplained_weight_loss: false,
      fatigue: false,
      smoking_history: false,
      other_symptoms: '',
    });

    setSelectedImage(null);
    setImageFileName('');
    handleScanFileChange(null);
    handleScanNotesChange('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationAttempted(true);
    setSubmissionSuccess(false);

    if (!isValid) {
      // Scroll to validation notice
      const validationEl = document.getElementById('validation-summary');
      if (validationEl) {
        validationEl.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Collect all clinical data into a structured submission object
    const structuredPayload = {
      patientData: {
        patientId: patientData.patientId || `PT-${new Date().getFullYear()}-001`,
        fullName: patientData.fullName?.trim(),
        age: Number(patientData.age || patientData.ageOrDob),
        gender: patientData.gender,
        email: patientData.email?.trim(),
        phone: patientData.phone?.trim(),
        address: patientData.address || '',
        clinicalNotes: patientData.notes || '',
      },
      symptoms: {
        persistent_cough: Boolean(symptoms.persistent_cough || symptoms.cough),
        chest_pain: Boolean(symptoms.chest_pain),
        breathlessness: Boolean(symptoms.breathlessness || symptoms.shortness_of_breath),
        weight_loss: Boolean(symptoms.weight_loss || symptoms.unexplained_weight_loss),
        fatigue: Boolean(symptoms.fatigue),
        smoking_history: Boolean(symptoms.smoking_history),
        hemoptysis: Boolean(symptoms.hemoptysis || symptoms.blood_in_cough),
        other_symptoms: symptoms.other_symptoms || symptoms.otherSymptoms || '',
      },
      ctScan: {
        fileName: imageFileName || activeScanFile?.name || 'ct_scan.png',
        fileSize: activeScanFile?.size || null,
        fileType: activeScanFile?.type || 'image/png',
        fileObject: activeScanFile || null,
        notes: activeScanNotes || '',
      },
      meta: {
        timestamp: new Date().toISOString(),
        targetEndpoint: '/predict',
        contentType: 'multipart/form-data',
      },
    };

    // Log complete data structure to browser console for testing
    console.log('========================================================');
    console.log('[LungCare AI] Form Submission Validated Successfully');
    console.log('Ready for Backend API endpoint: POST /predict');
    console.log('Structured Submission Payload:', structuredPayload);
    console.log('========================================================');

    /**
     * (Backend API Integration Template - for next phase)
     * 
     * const formData = new FormData();
     * formData.append('patientData', JSON.stringify(structuredPayload.patientData));
     * formData.append('symptoms', JSON.stringify(structuredPayload.symptoms));
     * formData.append('scanNotes', structuredPayload.ctScan.notes);
     * if (activeScanFile) {
     *   formData.append('ct_image', activeScanFile);
     * }
     * 
     * const response = await axios.post('/predict', formData, {
     *   headers: { 'Content-Type': 'multipart/form-data' }
     * });
     */

    setLastSubmission(structuredPayload);
    setSubmissionSuccess(true);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Top Header & Intake Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Standard Clinical Intake Pipeline</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Patient Diagnostic Intake
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete the 3-stage clinical intake workflow below to assemble data for AI-assisted diagnostic prediction.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleAutoFillSample}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold border border-teal-200 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Auto-fill Sample Case</span>
          </button>

          <button
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center space-x-1 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Workflow Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* ======================================================== */}
        {/* Step 1: PatientForm                                      */}
        {/* ======================================================== */}
        <div className="relative">
          <PatientForm
            patientData={patientData}
            onChange={setPatientData}
          />
        </div>

        {/* Visual Workflow Connector */}
        <div className="flex justify-center -my-3">
          <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-xs">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* Step 2: SymptomsForm                                     */}
        {/* ======================================================== */}
        <div className="relative">
          <SymptomsForm
            symptoms={symptoms}
            onChange={setSymptoms}
          />
        </div>

        {/* Visual Workflow Connector */}
        <div className="flex justify-center -my-3">
          <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-xs">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* Step 3: CTScanUpload                                     */}
        {/* ======================================================== */}
        <div className="relative">
          <CTScanUpload
            selectedImage={selectedImage}
            fileName={imageFileName}
            selectedFile={activeScanFile}
            scanNotes={activeScanNotes}
            onImageUpload={(url, name, file) => {
              setSelectedImage(url);
              setImageFileName(name);
              if (file) handleScanFileChange(file);
            }}
            onFileChange={(file) => {
              handleScanFileChange(file);
            }}
            onNotesChange={(notes) => {
              handleScanNotesChange(notes);
            }}
            onSelectPreset={(url, name) => {
              setSelectedImage(url);
              setImageFileName(name);
            }}
            onRemoveImage={() => {
              setSelectedImage(null);
              setImageFileName('');
              handleScanFileChange(null);
            }}
          />
        </div>

        {/* Visual Workflow Connector */}
        <div className="flex justify-center -my-3">
          <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-xs">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* Step 4: Validation Summary Status Card                  */}
        {/* ======================================================== */}
        <div id="validation-summary" className="scroll-mt-24">
          <div className={`p-5 rounded-2xl border transition-all ${
            isValid
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : validationAttempted
                ? 'bg-rose-50/90 border-rose-200 text-rose-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start space-x-3">
                {isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                    validationAttempted ? 'text-rose-600' : 'text-slate-400'
                  }`} />
                )}

                <div className="space-y-1">
                  <h3 className="text-sm font-bold tracking-tight">
                    {isValid 
                      ? 'All Intake Data Validated & Ready' 
                      : validationAttempted
                        ? 'Please Complete Required Intake Details'
                        : 'Intake Pipeline Readiness'}
                  </h3>

                  <p className="text-xs opacity-90 leading-relaxed">
                    {isValid
                      ? 'Patient demographics, clinical indicators, and CT radiograph are verified. Ready to package for API prediction.'
                      : 'Ensure all mandatory patient demographic fields and a valid CT scan image slice are loaded before submitting.'}
                  </p>

                  {/* List of missing fields when validation failed */}
                  {!isValid && validationAttempted && (
                    <ul className="mt-2.5 space-y-1 text-xs text-rose-700 font-medium pl-4 list-disc">
                      {missingFields.map((fieldMsg, idx) => (
                        <li key={idx}>{fieldMsg}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <span className={`text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                isValid
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-slate-200/70 text-slate-600 border-slate-300'
              }`}>
                {isValid ? 'Ready' : 'Pending Inputs'}
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* Step 5: Submission Success Confirmation Box              */}
        {/* ======================================================== */}
        {submissionSuccess && (
          <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 space-y-3 animate-fade-in shadow-sm">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-teal-950">
                  Data Structured & Ready for Backend API (POST /predict)
                </h4>
                <p className="text-xs text-teal-800 leading-relaxed">
                  Patient details, symptoms checklist, CT scan file data, and notes have been validated and structured. Open the browser console (<code className="bg-teal-100 px-1 py-0.5 rounded font-mono text-[11px]">F12 &rarr; Console</code>) to inspect the complete payload.
                </p>
              </div>
            </div>

            {lastSubmission && (
              <div className="pt-2 border-t border-teal-200/70 text-xs flex flex-wrap items-center gap-x-4 gap-y-1 text-teal-900 font-mono">
                <span>Patient: <strong>{lastSubmission.patientData.fullName}</strong></span>
                <span>•</span>
                <span>Age: <strong>{lastSubmission.patientData.age}</strong></span>
                <span>•</span>
                <span>Scan: <strong>{lastSubmission.ctScan.fileName}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* Step 6: Analyze with AI Button                           */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <FileCheck className="w-4 h-4 text-teal-600" />
            <span>Form data will be validated and structured for API prediction</span>
          </div>

          <button
            type="submit"
            className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-2xl font-bold text-sm shadow-lg transition-all ${
              isValid
                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30 hover:scale-[1.01] cursor-pointer'
                : 'bg-slate-800 hover:bg-slate-700 text-white shadow-slate-800/20 cursor-pointer'
            }`}
          >
            <Cpu className="w-5 h-5 text-teal-300" />
            <span>Analyze with AI</span>
          </button>
        </div>

      </form>

      {/* Loading Modal available for future live inference */}
      {isLoading && (
        <Loading
          message="Executing Neural Radiomic Pipeline"
          subMessage="Sending diagnostic payload to AI inference model..."
        />
      )}

    </div>
  );
}
