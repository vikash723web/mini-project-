import React from 'react';
import { Link } from 'react-router-dom';
import RiskGauge from '../components/RiskGauge';
import { generatePDF } from '../utils/generatePDF';
import { 
  FileDown, 
  ArrowLeft, 
  User, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Stethoscope, 
  RefreshCw 
} from 'lucide-react';

export default function Results({ 
  patientData, 
  symptoms, 
  selectedImage, 
  imageFileName, 
  analysisResult 
}) {
  // Default fallback data if navigated directly
  const data = analysisResult || {
    malignancyScore: 88,
    riskLevel: 'High Risk',
    confidence: '94.2%',
    primaryDiagnosis: 'Pulmonary Adenocarcinoma (Primary Malignant Neoplasm)',
    icd10: 'C34.90',
    noduleLocation: 'Right Upper Lobe (Apical segment)',
    noduleDiameter: '22.4 mm',
    spiculationScore: 'High (Lobulated with pleural indentation)',
    recommendation: 'Urgent PET-CT staging, CT-guided core biopsy, and multidisciplinary thoracic oncology review.',
  };

  const activeSymptomsList = Object.entries(symptoms || {})
    .filter(([_, value]) => Boolean(value))
    .map(([key]) => key.replace('_', ' '));

  const handleDownloadPDF = () => {
    // Calls placeholder PDF function as requested
    generatePDF({
      patient: patientData,
      symptoms: symptoms,
      results: data,
      imageName: imageFileName,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
              REPORT ID: DXR-2026-992
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Completed on {new Date().toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Diagnostic Analysis & Risk Stratification Results
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/analysis"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit Analysis</span>
          </Link>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>Export Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (Risk & Findings) + Right Column (Scan & Patient Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Reusable RiskGauge Component */}
          <RiskGauge
            score={data.malignancyScore}
            riskLevel={data.riskLevel}
            confidence={data.confidence}
          />

          {/* Primary Diagnostic Findings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <h2 className="text-base font-bold text-slate-900">Radiomic Findings & Classification</h2>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Predicted Subtype Classification
              </span>
              <p className="text-base font-extrabold text-slate-900">
                {data.primaryDiagnosis}
              </p>
              <p className="text-xs text-teal-700 font-mono">
                ICD-10 Code: {data.icd10}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Nodule Location</span>
                <span className="text-sm font-bold text-slate-800">{data.noduleLocation}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Estimated Diameter</span>
                <span className="text-sm font-bold text-slate-800">{data.noduleDiameter}</span>
              </div>
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Morphology & Margins</span>
                <span className="text-sm font-medium text-slate-700">{data.spiculationScore}</span>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-4 p-4 rounded-xl bg-teal-50/60 border border-teal-200">
              <div className="flex items-center space-x-2 text-teal-900 font-bold text-xs mb-1">
                <AlertCircle className="w-4 h-4 text-teal-600" />
                <span>Recommended Clinical Action Plan:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {data.recommendation}
              </p>
            </div>

          </div>

        </div>

        {/* Right Column: Scan Preview & Patient Overview */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CT Scan Preview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
              <Layers className="w-5 h-5 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Analyzed CT Scan Slice</h3>
            </div>

            <div className="bg-black rounded-xl overflow-hidden relative border border-slate-800 flex items-center justify-center min-h-[200px]">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Analyzed CT Scan"
                  className="w-full h-48 object-contain"
                />
              ) : (
                <p className="text-xs text-slate-500">No scan image provided</p>
              )}
              <div className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-teal-300 font-mono">
                {imageFileName || 'axial_ct_sample.png'}
              </div>
            </div>
          </div>

          {/* Patient Demographic Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 mb-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Patient Case Details</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Patient ID:</span>
                <span className="font-semibold text-slate-800">{patientData?.patientId || 'PT-2026-8842'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Full Name:</span>
                <span className="font-semibold text-slate-800">{patientData?.fullName || 'Eleanor Vance'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Age / DOB:</span>
                <span className="font-semibold text-slate-800">{patientData?.ageOrDob || '58 yrs'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Biological Sex:</span>
                <span className="font-semibold text-slate-800">{patientData?.gender || 'Female'}</span>
              </div>

              {activeSymptomsList.length > 0 && (
                <div className="pt-2">
                  <span className="text-slate-500 block mb-1.5 font-medium">Presenting Symptoms:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSymptomsList.map((symptom) => (
                      <span key={symptom} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] capitalize">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/analysis"
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Start Another Analysis</span>
              </Link>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
