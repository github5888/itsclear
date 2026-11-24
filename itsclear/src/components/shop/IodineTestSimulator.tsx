import React, { useState } from 'react';
import { Sparkles, RotateCcw, AlertTriangle, CheckCircle2, ShieldCheck, Droplets, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

export const IodineTestSimulator: React.FC = () => {
  const [testedA, setTestedA] = useState(false);
  const [testedB, setTestedB] = useState(false);
  const [isDropping, setIsDropping] = useState(false);

  const handleTestBoth = () => {
    setIsDropping(true);
    setTimeout(() => {
      setTestedA(true);
      setTestedB(true);
      setIsDropping(false);
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#f97316', '#10b981', '#fbbf24']
        });
      } catch {
        // ignore
      }
    }, 900);
  };

  const handleTestA = () => {
    setIsDropping(true);
    setTimeout(() => {
      setTestedA(true);
      setIsDropping(false);
    }, 700);
  };

  const handleTestB = () => {
    setIsDropping(true);
    setTimeout(() => {
      setTestedB(true);
      setIsDropping(false);
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#10b981', '#f59e0b']
        });
      } catch {
        // ignore
      }
    }, 700);
  };

  const handleReset = () => {
    setTestedA(false);
    setTestedB(false);
    setIsDropping(false);
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-900 text-xs font-black uppercase tracking-wider mb-2">
            <Droplets className="w-3.5 h-3.5 text-orange-600" />
            <span>Interactive Purity Workbench</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Zero-Maida Iodine Reagent Simulator
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium max-w-2xl">
            Simulate a medical-grade iodine starch assay (Lugol’s solution) to visually differentiate adulterated commercial supermarket flour from honest stoneground whole wheat.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={handleTestBoth}
            disabled={isDropping}
            className={`px-5 py-3 rounded-xl font-black text-xs sm:text-sm transition-all shadow-sm flex items-center space-x-2 ${
              isDropping
                ? 'bg-orange-300 text-white cursor-wait'
                : 'bg-slate-950 hover:bg-orange-500 text-white hover:text-slate-950 active:scale-95'
            }`}
          >
            <Droplets className="w-4 h-4 text-orange-400" />
            <span>{isDropping ? 'Dispensing Reagent...' : 'Dispense Iodine Reagent on Both'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 border border-slate-200 transition-all shadow-2xs"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Two Virtual Petri Dishes (Comparison Workbench) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Plate A: Commercial Factory Flour */}
        <div className={`p-6 sm:p-7 rounded-3xl border transition-all duration-500 relative flex flex-col justify-between ${
          testedA
            ? 'bg-slate-900 text-white border-rose-500/80 shadow-xl'
            : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}>
          <div>
            {/* Header Plate Label */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                testedA
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                  : 'bg-slate-200 text-slate-700 border-slate-300'
              }`}>
                Sample A • Industrial Roller Flour
              </span>
              <span className="text-[11px] font-bold opacity-70">Supermarket Standard</span>
            </div>

            <h4 className="text-lg sm:text-xl font-black tracking-tight mb-2">
              Commercial Factory Flour (Adulterated)
            </h4>
            <p className={`text-xs leading-relaxed mb-6 ${testedA ? 'text-slate-300' : 'text-slate-500'}`}>
              High-speed roller milled at 90°C. Outer bran and living wheat germ are stripped out, leaving high-density exposed amylose starch treated with chemical bleaches.
            </p>

            {/* Virtual Petri Dish Well */}
            <div className="flex flex-col items-center justify-center my-4">
              <div
                onClick={handleTestA}
                className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border-4 flex items-center justify-center cursor-pointer transition-all duration-700 overflow-hidden shadow-inner group ${
                  testedA
                    ? 'border-rose-500 bg-[#070b19] ring-8 ring-rose-950/50'
                    : 'border-slate-300 bg-[#f8f6f0] hover:border-slate-400'
                }`}
              >
                {/* Visual Flour Texture */}
                <div className={`absolute inset-0 transition-opacity duration-700 ${
                  testedA ? 'opacity-0' : 'opacity-100'
                }`}>
                  <div className="w-full h-full bg-gradient-to-br from-[#ffffff] via-[#f7f5ee] to-[#ece7db] rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-400 tracking-wider uppercase select-none">
                      Dry White Flour Paste
                    </span>
                  </div>
                </div>

                {/* Reacted Dark Inky Starch State */}
                {testedA && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#091133] to-[#01030d] flex flex-col items-center justify-center p-4 text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-rose-950/60 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-1.5 animate-pulse">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-black text-rose-400 uppercase tracking-wider block">
                      Dark Midnight Blue Stain
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Starch Index: &gt; 85% Amylose Spike
                    </span>
                  </div>
                )}

                {/* Dropping Ripple Animation */}
                {isDropping && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="w-12 h-12 rounded-full bg-amber-500/40 animate-ping" />
                  </div>
                )}
              </div>

              {!testedA && (
                <button
                  onClick={handleTestA}
                  disabled={isDropping}
                  className="mt-3 text-xs font-bold text-slate-600 hover:text-orange-600 underline"
                >
                  Click to drop iodine on Sample A
                </button>
              )}
            </div>
          </div>

          {/* Test Readout Analysis */}
          <div className="mt-6 pt-4 border-t border-slate-200/30">
            {testedA ? (
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2 text-rose-400 text-xs sm:text-sm font-black">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>CRITICAL ADULTERATION / STARCH SPIKE</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Iodine forms an instant deep midnight-blue complex with pure exposed amylose starch. Absence of brown dietary bran flakes confirms industrial processing and bleached chalk/maida contamination.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-900 text-rose-300">
                    Maida / Starch: <strong className="text-white">Detected</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-900 text-rose-300">
                    Coarse Bran: <strong className="text-white">&lt; 1.5% (Stripped)</strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-2">
                Drop iodine tincture to reveal molecular starch adulteration.
              </p>
            )}
          </div>
        </div>

        {/* Plate B: itsclear™ Cold Stoneground Whole Wheat */}
        <div className={`p-6 sm:p-7 rounded-3xl border transition-all duration-500 relative flex flex-col justify-between ${
          testedB
            ? 'bg-emerald-950 text-white border-emerald-400 shadow-xl'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <div>
            {/* Header Plate Label */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                testedB
                  ? 'bg-emerald-900 text-emerald-200 border-emerald-600'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-200'
              }`}>
                Sample B • itsclear™ Stoneground Chakki
              </span>
              <span className={`text-[11px] font-bold ${testedB ? 'text-emerald-300' : 'text-emerald-700'}`}>
                100% Certified Whole Grain
              </span>
            </div>

            <h4 className="text-lg sm:text-xl font-black tracking-tight mb-2">
              itsclear™ Pure Stoneground Whole Wheat
            </h4>
            <p className={`text-xs leading-relaxed mb-6 ${testedB ? 'text-emerald-200' : 'text-slate-600'}`}>
              Slow-ground on natural emery stones below 28°C. 100% natural wheat germ oils and outer fibrous bran particles remain fully intact with zero bleaching chemicals.
            </p>

            {/* Virtual Petri Dish Well */}
            <div className="flex flex-col items-center justify-center my-4">
              <div
                onClick={handleTestB}
                className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border-4 flex items-center justify-center cursor-pointer transition-all duration-700 overflow-hidden shadow-inner group ${
                  testedB
                    ? 'border-emerald-400 bg-[#163b27] ring-8 ring-emerald-900/50'
                    : 'border-orange-200 bg-[#faf3e0] hover:border-orange-300'
                }`}
              >
                {/* Visual Flour Texture */}
                <div className={`absolute inset-0 transition-opacity duration-700 ${
                  testedB ? 'opacity-0' : 'opacity-100'
                }`}>
                  <div className="w-full h-full bg-gradient-to-br from-[#f8ecd0] via-[#ebd5a7] to-[#deb97b] rounded-full flex flex-col items-center justify-center p-4">
                    {/* Speckles representing whole wheat bran */}
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#8c5922_1px,transparent_1px)] [background-size:8px_8px]" />
                    <span className="relative text-xs font-black text-amber-950 tracking-wider uppercase select-none text-center">
                      Golden Whole Grain (Coarse Bran Flecks)
                    </span>
                  </div>
                </div>

                {/* Reacted Golden Amber Pure State */}
                {testedB && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1b432a] via-[#122e1d] to-[#0c1f13] flex flex-col items-center justify-center p-4 text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-emerald-900/80 border border-emerald-400/80 flex items-center justify-center text-emerald-300 mb-1.5 animate-bounce">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-black text-emerald-300 uppercase tracking-wider block">
                      Warm Amber • Intact Bran Shield
                    </span>
                    <span className="text-[10px] text-emerald-200 font-mono mt-0.5">
                      Purity Index: 100% Unadulterated
                    </span>
                  </div>
                )}

                {/* Dropping Ripple Animation */}
                {isDropping && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="w-12 h-12 rounded-full bg-emerald-400/40 animate-ping" />
                  </div>
                )}
              </div>

              {!testedB && (
                <button
                  onClick={handleTestB}
                  disabled={isDropping}
                  className="mt-3 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
                >
                  Click to drop iodine on itsclear Sample B
                </button>
              )}
            </div>
          </div>

          {/* Test Readout Analysis */}
          <div className="mt-6 pt-4 border-t border-slate-200/30">
            {testedB ? (
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2 text-emerald-300 text-xs sm:text-sm font-black">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>100% PURE STONEGROUND WHOLE GRAIN CERTIFIED</span>
                </div>
                <p className="text-xs text-emerald-200 leading-relaxed font-normal">
                  Natural golden-amber color persists. Intact coarse dietary bran and live germ oils shield the starch structure, preventing unnatural jet-black discoloration. Zero bleaching chemicals and zero added maida.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-emerald-900/50 border border-emerald-700 text-emerald-200">
                    Maida / Starch: <strong className="text-white">0.00% (Nil)</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-900/50 border border-emerald-700 text-emerald-200">
                    Coarse Bran: <strong className="text-white">100% Retained</strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-2">
                Drop iodine tincture to verify unadulterated whole wheat structure.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Scientific Principle Information Note */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start space-x-3.5 text-xs sm:text-sm text-slate-700">
        <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="font-black text-slate-950">The Chemistry of Purity: Lugol’s Iodine Reagent Test</h5>
          <p className="text-slate-600 leading-relaxed font-medium">
            Lugol’s solution contains iodine and potassium iodide (\(I_3^-\)). In refined industrial flours (maida), the natural wheat protective aleurone layer and fibrous cell walls are destroyed by high-speed roller crushing, exposing free amylose coils that trap iodine molecules into a dark blue-black complex. In contrast, authentic cold-stoneground whole wheat flour retains intact cell fiber matrices, wheat germ lipids, and outer pericarp bran, maintaining its warm golden-amber hue.
          </p>
        </div>
      </div>
    </div>
  );
};

