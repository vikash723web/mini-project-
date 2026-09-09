import React from 'react';
import { 
  Cpu, 
  Loader2, 
  ShieldCheck, 
  Scan, 
  UserCheck, 
  Stethoscope, 
  BarChart3, 
  Layers 
} from 'lucide-react';

export default function Loading({
  isLoading = true,
  heading = 'Analyzing CT Scan',
  message = 'Our AI system is securely processing the CT scan and patient information.',
  subMessage,
}) {
  // If loading is explicitly disabled, do not render overlay
  if (!isLoading) {
    return null;
  }

  const processingSteps = [
    {
      id: 'patient_val',
      label: 'Validating patient information',
      icon: UserCheck,
    },
    {
      id: 'ct_proc',
      label: 'Processing CT scan',
      icon: Scan,
    },
    {
      id: 'symp_eval',
      label: 'Analyzing clinical symptoms',
      icon: Stethoscope,
    },
    {
      id: 'risk_strat',
      label: 'Generating risk assessment',
      icon: BarChart3,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      aria-live="polite"
      aria-label="AI Diagnostic Processing"
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
    >
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white border border-teal-200/80 shadow-2xl text-center space-y-6 relative overflow-hidden">
        
        {/* Top Medical Pulse Badge & Icon */}
        <div className="relative w-20 h-20 mx-auto">
          {/* Subtle Outer Ping Glow */}
          <div className="absolute inset-0 rounded-2xl bg-teal-500/20 animate-ping" />
          
          {/* Main Icon Container */}
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-teal-800 via-teal-700 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-700/30 text-white">
            <Cpu className="w-9 h-9 animate-pulse" />
          </div>
        </div>

        {/* Heading & Dynamic Message */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {heading}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
          {subMessage && (
            <p className="text-[11px] font-mono text-teal-700 font-medium">
              {subMessage}
            </p>
          )}
        </div>

        {/* Animated Scanning Line */}
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-teal-600 via-emerald-400 to-teal-600 w-1/2 rounded-full animate-[scan_1.6s_ease-in-out_infinite]" />
        </div>

        {/* Visual Processing Steps */}
        <div className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-4 text-left space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <span>Pipeline Execution</span>
            <span className="flex items-center text-teal-700 font-mono normal-case">
              <Loader2 className="w-3 h-3 animate-spin mr-1 text-teal-600" />
              In Progress
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {processingSteps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.id}
                  className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg text-slate-700"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center shrink-0">
                      <StepIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium truncate text-slate-800">
                      {step.label}
                    </span>
                  </div>

                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shrink-0 ml-2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* HIPAA / Security Notice */}
        <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 font-medium pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Encrypted Diagnostic Pipeline</span>
        </div>

      </div>
    </div>
  );
}
