import React from 'react';
import { Stethoscope, CheckCircle2, ShieldAlert, FileEdit, AlertCircle } from 'lucide-react';

const PRIMARY_SYMPTOMS = [
  {
    id: 'persistent_cough',
    altId: 'cough',
    label: 'Persistent Cough',
    subtitle: 'Chronic cough lasting more than 3 weeks',
  },
  {
    id: 'chest_pain',
    altId: 'chest_pain',
    label: 'Chest Pain',
    subtitle: 'Aching or sharp pain exacerbated by breathing or coughing',
  },
  {
    id: 'breathlessness',
    altId: 'shortness_of_breath',
    label: 'Breathlessness / Shortness of Breath',
    subtitle: 'Dyspnea during routine daily activities or at rest',
  },
  {
    id: 'weight_loss',
    altId: 'unexplained_weight_loss',
    label: 'Unexplained Weight Loss',
    subtitle: 'Significant involuntary reduction in body mass',
  },
  {
    id: 'fatigue',
    altId: 'fatigue',
    label: 'Fatigue',
    subtitle: 'Unusual, persistent weakness and extreme tiredness',
  },
];

const RISK_INDICATORS = [
  {
    id: 'smoking_history',
    altId: 'smoking_history',
    label: 'Smoking History',
    subtitle: 'Current or former smoker / exposure to second-hand smoke',
  },
  {
    id: 'hemoptysis',
    altId: 'blood_in_cough',
    label: 'Blood in Cough (Hemoptysis)',
    subtitle: 'Coughing up blood or blood-streaked sputum',
  },
];

export default function SymptomsForm({ symptoms = {}, onChange, onUpdate }) {
  // Support both onChange and onUpdate props
  const handleUpdate = (updatedSymptoms) => {
    if (onChange) onChange(updatedSymptoms);
    if (onUpdate) onUpdate(updatedSymptoms);
  };

  const isSymptomActive = (id, altId) => {
    return Boolean(symptoms[id] ?? (altId ? symptoms[altId] : false));
  };

  const toggleSymptom = (id, altId) => {
    const currentState = isSymptomActive(id, altId);
    const updated = {
      ...symptoms,
      [id]: !currentState,
    };
    if (altId && altId !== id) {
      updated[altId] = !currentState;
    }
    handleUpdate(updated);
  };

  const handleOtherSymptomsChange = (e) => {
    const value = e.target.value;
    handleUpdate({
      ...symptoms,
      other_symptoms: value,
      otherSymptoms: value,
    });
  };

  const otherSymptomsText = symptoms.other_symptoms ?? symptoms.otherSymptoms ?? '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Symptoms Assessment
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select all symptoms and risk indicators currently experienced by the patient.
          </p>
        </div>
      </div>

      {/* Primary Symptoms Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Primary Clinical Symptoms
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            (Select all that apply)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {PRIMARY_SYMPTOMS.map((item) => {
            const isSelected = isSymptomActive(item.id, item.altId);

            return (
              <div
                key={item.id}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => toggleSymptom(item.id, item.altId)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggleSymptom(item.id, item.altId);
                  }
                }}
                className={`flex items-start space-x-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer select-none group ${
                  isSelected
                    ? 'bg-teal-50/80 border-teal-600 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-teal-600 text-white'
                        : 'border-2 border-slate-300 bg-white group-hover:border-teal-400'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4 fill-teal-600 text-white" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm font-semibold leading-tight ${
                      isSelected ? 'text-teal-950' : 'text-slate-800'
                    }`}
                  >
                    {item.label}
                  </h3>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isSelected ? 'text-teal-800/80' : 'text-slate-500'
                    }`}
                  >
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional Risk Indicators Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Key Risk Indicators
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            (Optional clinical risk factors)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {RISK_INDICATORS.map((item) => {
            const isSelected = isSymptomActive(item.id, item.altId);

            return (
              <div
                key={item.id}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => toggleSymptom(item.id, item.altId)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggleSymptom(item.id, item.altId);
                  }
                }}
                className={`flex items-start space-x-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer select-none group ${
                  isSelected
                    ? 'bg-teal-50/80 border-teal-600 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-teal-600 text-white'
                        : 'border-2 border-slate-300 bg-white group-hover:border-teal-400'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4 fill-teal-600 text-white" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3
                      className={`text-sm font-semibold leading-tight ${
                        isSelected ? 'text-teal-950' : 'text-slate-800'
                      }`}
                    >
                      {item.label}
                    </h3>
                  </div>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isSelected ? 'text-teal-800/80' : 'text-slate-500'
                    }`}
                  >
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Other Symptoms Textarea */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Other Symptoms
          </label>
          <span className="text-[11px] text-slate-400">(Optional)</span>
        </div>
        <div className="relative">
          <FileEdit className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <textarea
            rows="2"
            value={otherSymptomsText}
            onChange={handleOtherSymptomsChange}
            placeholder="Describe any other respiratory symptoms, voice changes, or specific chest sensations..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 transition-all focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

    </div>
  );
}
