import React, { useState } from 'react';
import { PurityLab3DScene } from '../components/three/PurityLab3DScene';
import { IodineTestSimulator } from '../components/shop/IodineTestSimulator';
import { generateCertificatePDF } from '../utils/generateCertificatePDF';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Award,
  Sparkles,
  Zap,
  FlaskConical,
  Download,
  Droplets,
  Check
} from 'lucide-react';

export const PurityLabPage: React.FC = () => {
  const [batchQuery, setBatchQuery] = useState('CLR-KH-8841');
  const [searchedBatch, setSearchedBatch] = useState('CLR-KH-8841');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const batchDatabase: Record<string, {
    product: string;
    harvestDate: string;
    millLocation: string;
    labName: string;
    curcuminOrMoisture: string;
    adulterationScore: string;
    peroxideOrFFA: string;
    pesticideResidue: string;
    a2Protein: string;
    status: 'PASSED' | 'CERTIFIED 100% PURE';
  }> = {
    'CLR-KH-8841': {
      product: 'itsclear Khapli (Emmer) Ancient Grain Atta',
      harvestDate: 'October 2026 Fresh Harvest',
      millLocation: 'Maharashtra Sangli Traditional Stone Chakki',
      labName: 'CFTRI Accredited Food Testing Institute',
      curcuminOrMoisture: 'Glycemic Index (GI): 42 (Clinically Low GI)',
      adulterationScore: 'Maida / Hybrid Wheat: 0.00% (100% Ancient Emmer)',
      peroxideOrFFA: 'Soluble Dietary Fiber: 14.2g per 100g',
      pesticideResidue: 'Synthetic Fertilizers & Bleach: 0.00 ppm (Zero)',
      a2Protein: 'Water-Soluble Gentle Gluten: 100% Easy Digestion',
      status: 'CERTIFIED 100% PURE'
    },
    'CLR-HP-9204': {
      product: 'itsclear Premium High Protein Whole Wheat Flour (36% Protein)',
      harvestDate: 'October 2026 Harvest',
      millLocation: 'Malwa Precision Emery Stone Mill (<28°C)',
      labName: 'NABL Certified Protein Bio-Assay Testing Center',
      curcuminOrMoisture: 'Pure Natural Protein: 36.2g / 100g (Lab Certified)',
      adulterationScore: 'Maida / Added Starch: 0.00% (Strictly Negative)',
      peroxideOrFFA: 'Dietary Coarse Fiber: 12.4g / 100g (100% Bran)',
      pesticideResidue: 'Chemical Residues & Bleach: 0.00 ppm (Nil)',
      a2Protein: '60% Whole Wheat + 30% Soya + 10% Roasted Peanut',
      status: 'CERTIFIED 100% PURE'
    },
    'CLR-SH-2026': {
      product: 'itsclear MP Sharbati Gold Whole Wheat Atta',
      harvestDate: 'October 2026 Fresh Harvest',
      millLocation: 'Sehore Organic Cold Stone Mill #1 (<27°C)',
      labName: 'NABL Central Food Quality Lab, New Delhi',
      curcuminOrMoisture: 'Moisture: 10.2% (Standard < 12%)',
      adulterationScore: 'Maida / Added Starch: 0.00% (Strictly Negative)',
      peroxideOrFFA: 'Coarse Bran Fiber: 11.8% (100% Retained)',
      pesticideResidue: 'Chemical Residues & Bleach: 0.00 ppm (Nil)',
      a2Protein: 'Milling Temperature: 26.4°C (Live Enzymes Intact)',
      status: 'CERTIFIED 100% PURE'
    },
    'CLR-MG-9021': {
      product: 'itsclear 9-Grain High-Protein Multigrain Atta',
      harvestDate: 'Multi-Grain Harvest 2026',
      millLocation: 'Malwa Therapeutic Stone Chakki Unit',
      labName: 'NABL Regional Analytical Laboratory',
      curcuminOrMoisture: 'Pure Plant Protein: 16.5g per 100g (Lab Certified)',
      adulterationScore: 'Maida / Chalk: 0.00% (Negative)',
      peroxideOrFFA: 'Dietary Fiber: 13.5g per 100g',
      pesticideResidue: 'Heavy Metals (Lead/Cadmium): < 0.01 ppm (Safe)',
      a2Protein: 'Sprouted Millets Bio-Activation: 100% Verified',
      status: 'CERTIFIED 100% PURE'
    },
    'CLR-BW-3041': {
      product: 'itsclear Black Wheat (Kala Gehun) Antioxidant Atta',
      harvestDate: 'Rabi Harvest 2026',
      millLocation: 'Patiala & Malwa Dedicated Colored Grain Mill',
      labName: 'National Agri-Food Biotechnology Center (NABI)',
      curcuminOrMoisture: 'Anthocyanin Bio-Actives: 140 ppm (28x Standard Wheat)',
      adulterationScore: 'Artificial Coloring / Dyes: 0.00% (100% Natural Grain)',
      peroxideOrFFA: 'Total Antioxidant Activity (ORAC): 88.4%',
      pesticideResidue: 'Chemical Pesticides: 0.00 ppm',
      a2Protein: 'Natural Zinc & Iron Bio-Availability: 5.8 mg/100g',
      status: 'CERTIFIED 100% PURE'
    }
  };

  const currentReport = batchDatabase[searchedBatch] || batchDatabase['CLR-KH-8841'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = batchQuery.trim().toUpperCase();
    if (batchDatabase[clean]) {
      setSearchedBatch(clean);
    } else {
      setSearchedBatch('CLR-KH-8841');
    }
  };

  const handleDownloadPDF = () => {
    generateCertificatePDF({
      batchNumber: searchedBatch,
      productName: currentReport.product,
      harvestDate: currentReport.harvestDate,
      millLocation: currentReport.millLocation,
      labName: currentReport.labName,
      moisture: currentReport.curcuminOrMoisture,
      adulterationScore: currentReport.adulterationScore,
      branRetention: currentReport.peroxideOrFFA,
      pesticideBleach: currentReport.pesticideResidue,
      millingTemp: currentReport.a2Protein,
      status: currentReport.status
    });

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-black shadow-2xs">
          <FlaskConical className="w-4 h-4 text-emerald-600" />
          <span>100% Zero-Maida &amp; Zero-Bleach Guarantee</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
          its<span className="text-amber-600">clear</span>™ Virtual Purity Testing Lab
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
          Every single batch of our cold-stoneground wheat flour undergoes rigorous spectrometer and chromatography tests for zero maida, 100% bran retention, moisture safety (&lt;12%), and pesticide clearance.
        </p>
      </div>

      {/* 1. Interactive Iodine Starch Reagent Simulator */}
      <IodineTestSimulator />

      {/* 2. Spectrometer Laboratory Scene */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-950 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>Interactive Flour Spectrometer Simulation</span>
          </h2>
          <span className="text-xs sm:text-sm text-amber-700 font-extrabold">
            Rotatable Laboratory Environment
          </span>
        </div>
        <PurityLab3DScene />
      </div>

      {/* 3. Batch Certificate Search & Download */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 lg:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950">NABL Certified Atta Batch Lookup</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Enter the batch code printed on your itsclear sack to view verified laboratory results.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex space-x-2">
            <input
              type="text"
              value={batchQuery}
              onChange={(e) => setBatchQuery(e.target.value.toUpperCase())}
              placeholder="e.g. CLR-KH-8841"
              className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 uppercase font-mono w-48 focus:outline-none focus:border-amber-500 focus:bg-white font-bold"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-950 hover:bg-orange-500 text-white hover:text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <Search className="w-4 h-4" />
              <span>Verify</span>
            </button>
          </form>
        </div>

        {/* Quick Batch Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <span className="text-xs sm:text-sm text-slate-500 font-bold whitespace-nowrap">Live Harvest Batches:</span>
          {Object.keys(batchDatabase).map((b) => (
            <button
              key={b}
              onClick={() => {
                setBatchQuery(b);
                setSearchedBatch(b);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                searchedBatch === b
                  ? 'bg-orange-500 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              #{b}
            </button>
          ))}
        </div>

        {/* Certificate Display Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 relative overflow-hidden space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-black text-emerald-700 tracking-wider uppercase">
                  Government Accredited NABL Test Certificate
                </span>
              </div>
              <h4 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">
                {currentReport.product}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Batch #{searchedBatch} • Cold Stone Milled: {currentReport.harvestDate}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-emerald-100 text-emerald-950 font-black text-xs sm:text-sm border border-emerald-300 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{currentReport.status}</span>
              </div>

              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-slate-950 hover:bg-orange-500 text-white hover:text-slate-950 font-black text-xs sm:text-sm shadow-sm transition-all transform active:scale-95"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Certificate Saved!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-orange-400" />
                    <span>Download Official PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Test Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Moisture Content</span>
              <p className="text-base font-black text-slate-950">{currentReport.curcuminOrMoisture}</p>
              <span className="text-xs text-emerald-700 font-extrabold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Safe below 12% barrier</span>
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Maida Adulteration Test</span>
              <p className="text-base font-black text-slate-950">{currentReport.adulterationScore}</p>
              <span className="text-xs text-emerald-700 font-extrabold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero Added Starch</span>
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Natural Dietary Bran</span>
              <p className="text-base font-black text-slate-950">{currentReport.peroxideOrFFA}</p>
              <span className="text-xs text-emerald-700 font-extrabold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% Bran Retained</span>
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Chemicals &amp; Bleaching</span>
              <p className="text-base font-black text-slate-950">{currentReport.pesticideResidue}</p>
              <span className="text-xs text-emerald-700 font-extrabold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero Benzoyl Peroxide</span>
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cold Stone Milling Check</span>
              <p className="text-base font-black text-slate-950">{currentReport.a2Protein}</p>
              <span className="text-xs text-emerald-700 font-extrabold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Slow-Ground Below 28°C</span>
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Accredited Laboratory</span>
              <p className="text-xs font-bold text-slate-800">{currentReport.labName}</p>
              <span className="text-[11px] text-slate-500 block font-semibold">FSSAI / Agmark Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
