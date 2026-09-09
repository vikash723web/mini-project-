import React from 'react';
import { AlertTriangle, CheckCircle, AlertOctagon, Activity } from 'lucide-react';

export default function RiskGauge({ score = 88, riskLevel = 'High Risk', confidence = '94.2%' }) {
  // Determine color scheme based on score or risk level
  const getRiskDetails = () => {
    if (score >= 70 || riskLevel.toLowerCase().includes('high')) {
      return {
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        barGradient: 'from-rose-500 to-red-600',
        icon: AlertOctagon,
        badge: 'High Malignancy Risk',
        description: 'Features highly consistent with primary pulmonary neoplasm.',
      };
    }
    if (score >= 40 || riskLevel.toLowerCase().includes('moderate')) {
      return {
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        barGradient: 'from-amber-400 to-amber-600',
        icon: AlertTriangle,
        badge: 'Intermediate / Indeterminate Risk',
        description: 'Indeterminate nodular morphology; close follow-up advised.',
      };
    }
    return {
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      barGradient: 'from-emerald-400 to-teal-500',
      icon: CheckCircle,
      badge: 'Low / Benign Risk',
      description: 'Benign radiomic profile or absence of suspicious solid nodules.',
    };
  };

  const config = getRiskDetails();
  const IconComponent = config.icon;

  return (
    <div className={`rounded-2xl border ${config.border} ${config.bg} p-5 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <IconComponent className={`w-5 h-5 ${config.color}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>
            {config.badge}
          </span>
        </div>
        <span className="text-xs font-mono font-medium text-slate-500">
          Confidence: <strong className="text-slate-800">{confidence}</strong>
        </span>
      </div>

      {/* Main Score Display */}
      <div className="flex items-baseline space-x-2 my-2">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {score}%
        </span>
        <span className="text-xs text-slate-600 font-medium">
          Malignancy Probability Index
        </span>
      </div>

      {/* Visual Meter Bar */}
      <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden my-3 relative">
        <div
          className={`h-full bg-gradient-to-r ${config.barGradient} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(Math.max(score, 5), 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px] font-medium text-slate-500">
        <span>0% (Benign)</span>
        <span>50% (Indeterminate)</span>
        <span>100% (Malignant)</span>
      </div>

      <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200/60 leading-relaxed">
        {config.description}
      </p>
    </div>
  );
}
