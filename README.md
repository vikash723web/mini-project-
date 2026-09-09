# Lung Cancer Detection and Diagnostic Support System
## Member 4: Frontend Development • API Integration • Result Dashboard • PDF Report Generation • Documentation

An institutional, clinical-grade React application developed as the frontend interface for the **Lung Cancer Detection and Diagnostic Support System** major project.

Styled with a clean modern healthcare aesthetic (**Teal, Dark Green, White, and Light Gray**), this frontend enables clinicians and users to input patient demographics, record respiratory symptoms, upload thoracic CT scans, initiate AI diagnostic inference via Axios to the backend `/predict` endpoint, visualize risk stratification with Grad-CAM localization, and export comprehensive clinical PDF reports using `jsPDF`.

---

## 📋 System Architecture & Workflow

```
[ Step 1: Intake & Scan ] ───► [ Step 2: AI Processing ] ───► [ Step 3: Result Dashboard ] ───► [ Step 4: PDF Export ]
• Patient Demographics         • Axios POST to /predict         • Risk Score & Risk Level        • jsPDF & html2canvas
• Clinical Symptoms Checklist  • Multipart / JSON Payload       • Diagnosis & Summary            • Print / Save A4 PDF
• CT Scan Image Upload         • Fallback Simulation Engine     • Radiomics & Grad-CAM Heatmap   • Electronic Validation
```

### End-to-End User Flow
1. **Patient Details Intake**: Enters full name, contact information, date of birth, gender, and unique patient MRN.
2. **Clinical Symptoms Selection**: Marks observed signs (persistent cough, chest pain, dyspnea/breathlessness, weight loss, fatigue).
3. **CT Scan Image Upload**: Drag-and-drops thoracic CT scan slice (PNG, JPG, DICOM) or selects a clinical benchmark preset.
4. **AI Inference Trigger**: Clicks **"Analyze with AI"** / **"Submit for Analysis"** which sends payload data via Axios to backend endpoint `/predict`.
5. **Real-time Diagnostic Dashboard**: Visualizes the AI risk score, risk level (High / Moderate / Low), diagnosis, detailed radiomic summary, and Grad-CAM localization.
6. **Clinical PDF Report Generation**: Downloads or prints an institutional diagnostic medical report in A4 format with verified clinical findings.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **React.js (v18)** | Declarative component-based UI architecture |
| **Build Tool** | **Vite (v6)** | Ultra-fast development server and optimized production bundler |
| **Styling** | **Tailwind CSS + Custom CSS** | Healthcare theme (Teal `#0d9488`, Dark Green `#134e4a`, Slate `#f8fafc`, Pure White) |
| **Networking** | **Axios (v1.7)** | HTTP client with request/response interceptors & latency tracking |
| **PDF Engine** | **jsPDF (v2.5) + html2canvas** | High-resolution multi-page vector & canvas PDF compilation |
| **Icons** | **Lucide React** | Medical and UI iconography |

---

## 📂 Project Structure

```
lung-cancer-diagnostic-system/
├── index.html                      # HTML5 root template
├── package.json                    # Dependencies and build scripts
├── vite.config.js                  # Vite configuration & dev server port
├── tailwind.config.js              # Custom healthcare color palette
├── postcss.config.js               # PostCSS plugin setup
├── .env.example                    # Environment template for backend URL
├── README.md                       # Complete project documentation
└── src/
    ├── main.jsx                    # Application bootstrapping
    ├── App.jsx                     # Top-level workflow state machine & views
    ├── index.css                   # Medical grid background & print CSS
    ├── services/
    │   └── api.js                  # Axios client, /predict integration & fallback engine
    ├── utils/
    │   ├── pdfGenerator.js         # jsPDF document generator
    │   └── mockData.js             # Sample CT scans & clinical preset responses
    └── components/
        ├── common/
        │   ├── Navbar.jsx          # Institutional header & status badges
        │   ├── StepTracker.jsx     # Visual step progression breadcrumbs
        │   └── StatCard.jsx        # Modular diagnostic metric card
        ├── patient/
        │   └── PatientForm.jsx     # Patient details, symptoms & drag-drop upload
        ├── upload/
        │   └── ImageUpload.jsx     # CT scan acquisition with brightness/contrast HUD
        ├── dashboard/
        │   ├── ResultDashboard.jsx # Risk score, risk level, diagnosis & summary dashboard
        │   ├── ConfidenceGauge.jsx # Circular probability gauge & class breakdown
        │   └── HeatmapViewer.jsx   # Interactive Grad-CAM attention heatmap overlay
        └── report/
            ├── ReportDownload.jsx  # PDF generation action controls
            └── DiagnosticReportTemplate.jsx # Formal clinical report layout
```

---

## 🔌 Backend API Integration Specification

The frontend connects to the backend via **Axios** configured in [`src/services/api.js`](file:///c:/Users/shrut/Desktop/lung%20cancer%20mini%20project/src/services/api.js).

### **Endpoint**: `POST /api/predict` (or `/predict`)

#### **Request Payload (Multipart Form-Data or JSON)**:
```json
{
  "patient": {
    "patientId": "PT-2026-8842",
    "full_name": "Eleanor Vance",
    "email": "eleanor.vance@medmail.org",
    "phone": "+1 (555) 382-9401",
    "date_of_birth": "1962-08-14",
    "gender": "Female",
    "symptoms": {
      "cough": true,
      "chest_pain": true,
      "breathlessness": true,
      "weight_loss": true,
      "fatigue": true
    }
  },
  "scanMeta": {
    "fileName": "axial_slice_rul_048.png",
    "scanKey": "adenocarcinoma"
  }
}
```

#### **Expected Backend Response Schema**:
```json
{
  "success": true,
  "risk_score": 94.8,
  "risk_level": "High (Malignant)",
  "diagnosis": "Malignant Adenocarcinoma (Right Upper Lobe)",
  "summary": "Deep learning ensemble model identified a hyperdense spiculated mass in the right apical parenchyma with 94.8% confidence for Malignant Adenocarcinoma.",
  "probabilities": {
    "malignant": 94.8,
    "benign": 4.1,
    "normal": 1.1
  },
  "noduleDetails": {
    "location": "Right Upper Lobe (Apical Segment)",
    "coordinates": { "x": 62, "y": 38 },
    "diameterMm": 34.2,
    "volumeMm3": 1860,
    "margin": "Spiculated / Irregular",
    "densityHu": "+38 HU"
  },
  "recommendations": [
    "Immediate referral to Thoracic Multidisciplinary Oncology Board (MDT).",
    "Contrast-enhanced FDG PET-CT scan for accurate systemic staging.",
    "CT-guided core needle biopsy or navigational bronchoscopy for histopathology."
  ]
}
```

> **Note**: If the backend is offline during frontend demonstration, the built-in clinical fallback engine automatically simulates realistic inference latency (1.5s) with authentic radiomic responses so all features and PDF generation remain 100% functional.

---

## 🚀 Setup & Execution Guide

### 1. Configure Environment
Create a `.env` file in the root folder:
```bash
VITE_API_URL=http://localhost:8000/api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` (or port indicated in the terminal) in your browser.

### 4. Build for Production
```bash
npm run build
```
Production assets will be built in the `dist/` directory.

---

## 📄 PDF Report Generation (`jsPDF`)

The PDF export feature is triggered from the **Clinical Report** step. It uses `html2canvas` to render the DOM template (`#clinical-report-root`) at a `scale: 2` factor for medical-grade vector clarity, then embeds the high-resolution capture into an A4 document via `jsPDF`, preserving:
- Institutional header, report reference, and timestamps
- Full patient demographic profile & anamnesis
- Risk Score, Risk Level, Primary Diagnosis, and Summary
- CT scan slice with Grad-CAM attention heatmap overlay
- Quantitative 3D radiomic metrics table
- Actionable clinical recommendations and electronic signature block

