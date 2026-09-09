import React, { useState } from 'react';
import { User, Calendar, Mail, Phone, MapPin, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PatientForm({ patientData = {}, onChange, onUpdate }) {
  const [touched, setTouched] = useState({});

  // Support both onChange and onUpdate props for flexibility
  const handleUpdate = (updatedData) => {
    if (onChange) onChange(updatedData);
    if (onUpdate) onUpdate(updatedData);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleUpdate({
      ...patientData,
      [name]: value,
    });
  };

  // Extract values with sensible defaults
  const fullName = patientData.fullName ?? '';
  const age = patientData.age ?? patientData.ageOrDob ?? '';
  const gender = patientData.gender ?? 'Female';
  const email = patientData.email ?? '';
  const phone = patientData.phone ?? '';
  const address = patientData.address ?? '';
  const notes = patientData.notes ?? '';

  // Validation checks
  const getValidationErrors = () => {
    const errors = {};

    // 1. Full Name Validation
    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters';
    }

    // 2. Age Validation (realistic positive numeric value 1-120)
    const numericAge = Number(age);
    if (!age && age !== 0) {
      errors.age = 'Age is required';
    } else if (isNaN(numericAge) || numericAge <= 0 || numericAge > 120) {
      errors.age = 'Please enter a valid age (1 - 120)';
    }

    // 3. Gender Validation
    if (!gender) {
      errors.gender = 'Gender selection is required';
    }

    // 4. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    // 5. Phone Validation (minimum digits check)
    const cleanedPhone = phone.replace(/[^0-9]/g, '');
    if (!phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (cleanedPhone.length < 7 || cleanedPhone.length > 15) {
      errors.phone = 'Please enter a valid phone number';
    }

    return errors;
  };

  const errors = getValidationErrors();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
      
      {/* Header Section */}
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Patient Information
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter the patient's basic information for AI-assisted screening.
          </p>
        </div>
      </div>

      {/* Form Grid: 2 Columns on Desktop, 1 Column on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* 1. Full Name */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Full Name <span className="text-rose-500 font-bold">*</span>
            </label>
            {touched.fullName && !errors.fullName && (
              <span className="flex items-center text-[11px] text-emerald-600 font-medium">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Valid
              </span>
            )}
          </div>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              name="fullName"
              value={fullName}
              onChange={handleInputChange}
              onBlur={() => handleBlur('fullName')}
              placeholder="e.g. Eleanor Vance"
              className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 transition-all focus:outline-none focus:bg-white ${
                touched.fullName && errors.fullName
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
              }`}
            />
          </div>
          {touched.fullName && errors.fullName && (
            <p className="flex items-center text-xs text-rose-500 mt-1.5">
              <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
              {errors.fullName}
            </p>
          )}
        </div>

        {/* 2. Age */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Age (Years) <span className="text-rose-500 font-bold">*</span>
            </label>
            {touched.age && !errors.age && (
              <span className="flex items-center text-[11px] text-emerald-600 font-medium">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Valid
              </span>
            )}
          </div>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="number"
              name="age"
              min="1"
              max="120"
              value={age}
              onChange={handleInputChange}
              onBlur={() => handleBlur('age')}
              placeholder="e.g. 58"
              className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 transition-all focus:outline-none focus:bg-white ${
                touched.age && errors.age
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
              }`}
            />
          </div>
          {touched.age && errors.age && (
            <p className="flex items-center text-xs text-rose-500 mt-1.5">
              <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
              {errors.age}
            </p>
          )}
        </div>

        {/* 3. Gender */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Gender <span className="text-rose-500 font-bold">*</span>
            </label>
          </div>
          <select
            name="gender"
            value={gender}
            onChange={handleInputChange}
            onBlur={() => handleBlur('gender')}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 transition-all focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {touched.gender && errors.gender && (
            <p className="flex items-center text-xs text-rose-500 mt-1.5">
              <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
              {errors.gender}
            </p>
          )}
        </div>

        {/* 4. Email Address */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Email Address <span className="text-rose-500 font-bold">*</span>
            </label>
            {touched.email && !errors.email && (
              <span className="flex items-center text-[11px] text-emerald-600 font-medium">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Valid
              </span>
            )}
          </div>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleInputChange}
              onBlur={() => handleBlur('email')}
              placeholder="patient@example.com"
              className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 transition-all focus:outline-none focus:bg-white ${
                touched.email && errors.email
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
              }`}
            />
          </div>
          {touched.email && errors.email && (
            <p className="flex items-center text-xs text-rose-500 mt-1.5">
              <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
              {errors.email}
            </p>
          )}
        </div>

        {/* 5. Phone Number */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Phone Number <span className="text-rose-500 font-bold">*</span>
            </label>
            {touched.phone && !errors.phone && (
              <span className="flex items-center text-[11px] text-emerald-600 font-medium">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Valid
              </span>
            )}
          </div>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="tel"
              name="phone"
              value={phone}
              onChange={handleInputChange}
              onBlur={() => handleBlur('phone')}
              placeholder="+1 (555) 234-5678"
              className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 transition-all focus:outline-none focus:bg-white ${
                touched.phone && errors.phone
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
              }`}
            />
          </div>
          {touched.phone && errors.phone && (
            <p className="flex items-center text-xs text-rose-500 mt-1.5">
              <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
              {errors.phone}
            </p>
          )}
        </div>

        {/* 6. Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Address
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              name="address"
              value={address}
              onChange={handleInputChange}
              onBlur={() => handleBlur('address')}
              placeholder="e.g. 742 Evergreen Terrace, Sector 4"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 transition-all focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

      </div>

      {/* 7. Optional Clinical Notes */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Clinical Notes <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
        </div>
        <div className="relative">
          <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <textarea
            name="notes"
            rows="2"
            value={notes}
            onChange={handleInputChange}
            placeholder="Enter clinical observations, smoking history, or relevant pulmonary evaluation notes..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 transition-all focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

    </div>
  );
}
