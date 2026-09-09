import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Cpu,
  Stethoscope,
  BarChart3,
  FileDown,
  UserCheck,
  CheckCircle2,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Layers,
  Shield
} from 'lucide-react';

export default function Home() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const featureCards = [
    {
      title: 'AI-Assisted CT Scan Analysis',
      description:
        'Evaluates uploaded axial chest CT slices to assist in identifying suspicious pulmonary nodules and density anomalies.',
      icon: Cpu,
      tag: 'Computer Vision',
      linkTo: '/analysis',
    },
    {
      title: 'Structured Symptom-Based Assessment',
      description:
        'Structured clinical questionnaire capturing key respiratory indicators such as chronic cough, hemoptysis, and dyspnea.',
      icon: Stethoscope,
      tag: 'Clinical Screening',
      linkTo: '/analysis',
    },
    {
      title: 'Risk Score Visualization based on Model Output',
      description:
        'Visual risk stratification gauges displaying preliminary malignancy likelihood and model confidence metrics.',
      icon: BarChart3,
      tag: 'Risk Analytics',
      linkTo: '/results',
    },
    {
      title: 'Downloadable Diagnostic Support Report',
      description:
        'Generates structured summary sheets consolidating patient information, selected symptoms, and image findings.',
      icon: FileDown,
      tag: 'Reporting',
      linkTo: '/results',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Enter Patient Details',
      desc: 'Input patient demographic data, patient ID, age, and relevant clinical history.',
      icon: UserCheck,
    },
    {
      step: '02',
      title: 'Select Symptoms',
      desc: 'Check presenting clinical signs including cough, chest pain, and smoking status.',
      icon: Stethoscope,
    },
    {
      step: '03',
      title: 'Upload CT Scan',
      desc: 'Upload high-resolution chest CT scan slice or select calibrated test cases.',
      icon: UploadCloud,
    },
    {
      step: '04',
      title: 'AI Analysis',
      desc: 'Model extracts image features and evaluates combined risk indicators.',
      icon: Layers,
    },
    {
      step: '05',
      title: 'View Results & Download Report',
      desc: 'Inspect estimated risk stratification and export clinical summary sheet.',
      icon: FileCheck,
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      
      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-8 sm:p-14 shadow-xl border border-teal-800/40">
        <div className="relative z-10 max-w-3xl space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-teal-500/15 border border-teal-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-teal-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>AI Diagnostic Decision Support Framework</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            AI-Powered <span className="text-teal-400">Lung Cancer</span> Detection
          </h1>

          {/* Subheading */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            An intelligent diagnostic support system that combines CT scan analysis and patient symptoms to provide AI-assisted preliminary risk assessment.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/analysis"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02]"
            >
              <span>Start Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-medium text-sm transition-all"
            >
              <span>Learn More</span>
            </button>
          </div>

          {/* Quick Metrics / Academic Project Overview */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-teal-400">Dual-Input</p>
              <p className="text-xs text-slate-400 mt-0.5">CT Image & Clinical Symptoms</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-teal-400">Risk Gauge</p>
              <p className="text-xs text-slate-400 mt-0.5">Model-Based Stratification</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xl sm:text-2xl font-extrabold text-teal-400">Standardized</p>
              <p className="text-xs text-slate-400 mt-0.5">Diagnostic Support Reports</p>
            </div>
          </div>

        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="space-y-6 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60 inline-block">
            Key Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            System Modules & Features
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Core diagnostic screening modules designed for clinical intake, image evaluation, and risk visualization.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-teal-500/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors flex items-center justify-center font-bold">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-100">
                  <Link
                    to={card.linkTo}
                    className="inline-flex items-center text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors group/btn"
                  >
                    <span>Explore Module</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="space-y-8 bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-white px-3 py-1 rounded-full border border-slate-200 inline-block shadow-2xs">
            System Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A 5-step intuitive workflow guiding healthcare workers from patient intake to structured reporting.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
          {workflowSteps.map((stepItem, idx) => {
            const StepIcon = stepItem.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                      Step {stepItem.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-teal-600 flex items-center justify-center">
                      <StepIcon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">
                    {stepItem.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {stepItem.desc}
                  </p>
                </div>

                <div className="mt-4 pt-2 flex items-center text-[11px] font-medium text-slate-400 border-t border-slate-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mr-1" />
                  <span>Phase {idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA to start workflow */}
        <div className="text-center pt-4">
          <Link
            to="/analysis"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all"
          >
            <span>Proceed to Step 1: Patient Intake</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 5. IMPORTANT DISCLAIMER SECTION */}
      <section className="bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 rounded-2xl border border-amber-200 p-6 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-900 tracking-tight">
              Important Medical Disclaimer
            </h4>
            <p className="text-xs sm:text-sm text-amber-800/90 leading-relaxed font-medium">
              "This system provides AI-assisted preliminary screening and decision support. It is not a replacement for professional medical diagnosis."
            </p>
            <p className="text-[11px] text-amber-700/80 pt-1">
              All outputs, probability estimates, and summaries generated by this software must be reviewed and verified by qualified medical professionals.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
