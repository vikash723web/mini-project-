import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Results from './pages/Results';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  // Shared state for patient intake
  const [patientData, setPatientData] = useState({
    patientId: 'PT-2026-8842',
    fullName: '',
    ageOrDob: '',
    gender: 'Female',
    email: '',
    phone: '',
    notes: '',
  });

  // Shared state for symptoms checklist
  const [symptoms, setSymptoms] = useState({
    cough: false,
    chest_pain: false,
    breathlessness: false,
    hemoptysis: false,
    weight_loss: false,
    fatigue: false,
    smoking_history: false,
    hoarseness: false,
  });

  // Shared state for CT scan selection/upload
  const [selectedImage, setSelectedImage] = useState(
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80'
  );
  const [imageFileName, setImageFileName] = useState('adenocarcinoma_ct_axial_slice.png');

  // Shared state for diagnostic results
  const [analysisResult, setAnalysisResult] = useState({
    malignancyScore: 88,
    riskLevel: 'High Risk',
    confidence: '94.2%',
    primaryDiagnosis: 'Pulmonary Adenocarcinoma (Primary Malignant Neoplasm)',
    icd10: 'C34.90',
    noduleLocation: 'Right Upper Lobe (Apical segment)',
    noduleDiameter: '22.4 mm',
    spiculationScore: 'High (Lobulated with pleural indentation)',
    recommendation: 'Urgent PET-CT staging, CT-guided core biopsy, and multidisciplinary thoracic oncology review.',
  });

  const handleRunAnalysis = () => {
    // Computes or updates mock analysis result based on symptoms / inputs
    const activeSymptomsCount = Object.values(symptoms).filter(Boolean).length;
    const computedScore = Math.min(Math.max(activeSymptomsCount * 12 + 30, 15), 96);
    
    setAnalysisResult({
      malignancyScore: computedScore,
      riskLevel: computedScore >= 70 ? 'High Risk' : computedScore >= 40 ? 'Moderate Risk' : 'Low Risk',
      confidence: `${(85 + (computedScore % 12)).toFixed(1)}%`,
      primaryDiagnosis: computedScore >= 70 
        ? 'Pulmonary Adenocarcinoma (Malignant Profile)' 
        : computedScore >= 40 
          ? 'Indeterminate Pulmonary Nodule / Ground Glass Opacity' 
          : 'Benign Lung Parenchyma / No Suspicious Mass',
      icd10: computedScore >= 70 ? 'C34.90' : computedScore >= 40 ? 'R91.1' : 'Z01.89',
      noduleLocation: 'Right Upper Lobe (Apical segment)',
      noduleDiameter: `${(10 + (computedScore / 8)).toFixed(1)} mm`,
      spiculationScore: computedScore >= 70 ? 'High (Lobulated margins)' : 'Smooth / Regular circumscription',
      recommendation: computedScore >= 70 
        ? 'Urgent PET-CT staging, CT-guided core biopsy, and thoracic oncology consultation.' 
        : computedScore >= 40 
          ? 'Follow-up low-dose thin-slice chest CT in 3 to 6 months to assess stability.' 
          : 'Routine annual preventive health checkup.',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/analysis" 
            element={
              <Analysis
                patientData={patientData}
                setPatientData={setPatientData}
                symptoms={symptoms}
                setSymptoms={setSymptoms}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                imageFileName={imageFileName}
                setImageFileName={setImageFileName}
                onRunAnalysis={handleRunAnalysis}
              />
            } 
          />
          <Route 
            path="/results" 
            element={
              <Results
                patientData={patientData}
                symptoms={symptoms}
                selectedImage={selectedImage}
                imageFileName={imageFileName}
                analysisResult={analysisResult}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 6. FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <span className="font-bold text-slate-800">LungCare AI</span>
            <span>•</span>
            <span className="font-medium text-slate-600">Lung Cancer Detection and Diagnostic Support System</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span className="flex items-center space-x-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Clinical Decision Support System (CDSS)</span>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
