import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ShieldCheck, Play, RotateCcw } from 'lucide-react';

export const PurityLab3DScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [testingProgress, setTestingProgress] = useState(100);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xfaf9f5, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const greenLaser = new THREE.SpotLight(0x10b981, 4, 15, Math.PI / 8);
    greenLaser.position.set(-3, 3, 2);
    scene.add(greenLaser);

    const goldLamp = new THREE.PointLight(0xf59e0b, 2.2, 10);
    goldLamp.position.set(3, 2, 2);
    scene.add(goldLamp);

    // LAB TABLE
    const tableGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.15, 32);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.1 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -1.1;
    scene.add(table);

    // Glowing calibration grid ring
    const gridRing = new THREE.Mesh(
      new THREE.RingGeometry(2.1, 2.15, 48),
      new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide })
    );
    gridRing.rotation.x = -Math.PI / 2;
    gridRing.position.y = -1.02;
    scene.add(gridRing);

    // 3D GLASS CONICAL FLASK
    const flaskGroup = new THREE.Group();
    scene.add(flaskGroup);

    // Flask cone
    const coneGeo = new THREE.ConeGeometry(0.9, 1.3, 32, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      roughness: 0.1,
      ior: 1.52,
      transparent: true
    });
    const cone = new THREE.Mesh(coneGeo, glassMat);
    cone.position.y = -0.15;
    flaskGroup.add(cone);

    // Flask neck
    const neckGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.7, 32, 1, true);
    const neck = new THREE.Mesh(neckGeo, glassMat);
    neck.position.y = 0.8;
    flaskGroup.add(neck);

    // Flask lip
    const lipGeo = new THREE.TorusGeometry(0.24, 0.03, 12, 32);
    const lip = new THREE.Mesh(lipGeo, glassMat);
    lip.rotation.x = Math.PI / 2;
    lip.position.y = 1.15;
    flaskGroup.add(lip);

    // Testing Sample liquid (Golden cold pressed oil)
    const liquidGeo = new THREE.ConeGeometry(0.78, 0.8, 32);
    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85
    });
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = -0.4;
    flaskGroup.add(liquid);

    // Falling Drops of Pure Extract
    const dropsCount = 6;
    const dropGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const dropMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6, roughness: 0.2 });
    const drops: THREE.Mesh[] = [];

    for (let i = 0; i < dropsCount; i++) {
      const drop = new THREE.Mesh(dropGeo, dropMat);
      drop.position.set(0, 1.3 + i * 0.45, 0);
      flaskGroup.add(drop);
      drops.push(drop);
    }

    // LASER SCANNER BEAM
    const laserBeamGeo = new THREE.CylinderGeometry(0.015, 0.015, 3.2, 16);
    const laserBeamMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.8 });
    const laserBeam = new THREE.Mesh(laserBeamGeo, laserBeamMat);
    laserBeam.rotation.z = Math.PI / 4;
    laserBeam.position.set(-0.8, 0.2, 0);
    scene.add(laserBeam);

    // ANIMATION
    let clock = new THREE.Clock();
    let reqId: number;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Slow flask rotation
      flaskGroup.rotation.y = time * 0.4;

      // Laser scanning pulsation
      laserBeam.rotation.x = Math.sin(time * 3) * 0.15;
      laserBeamMat.opacity = 0.5 + Math.sin(time * 8) * 0.3;

      // Drops falling into flask
      drops.forEach((d, idx) => {
        d.position.y -= 0.015;
        if (d.position.y < -0.3) {
          d.position.y = 1.6;
        }
      });

      // Liquid subtle wave
      liquid.scale.x = 1 + Math.sin(time * 4) * 0.02;
      liquid.scale.z = 1 + Math.cos(time * 4) * 0.02;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTestingProgress(10);
    const interval = setInterval(() => {
      setTestingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulating(false);
          return 100;
        }
        return prev + 15;
      });
    }, 250);
  };

  return (
    <div className="relative w-full h-[360px] md:h-[420px] rounded-3xl overflow-hidden bg-gradient-to-b from-slate-50 to-emerald-50/20 border border-slate-200 shadow-xl">
      <div ref={mountRef} className="w-full h-full" />

      {/* Real-time Spectrometer HUD */}
      <div className="absolute top-4 left-4 z-10 p-3.5 rounded-2xl bg-white/95 border border-slate-200 backdrop-blur-md max-w-xs shadow-xl text-slate-800">
        <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>itsclear Atta Spectrometer</span>
        </div>
        <div className="text-[11px] space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Maida & Added Starch:</span>
            <span className="text-emerald-700 font-bold">0.00% (Negative)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Moisture Content:</span>
            <span className="text-amber-700 font-bold">10.2% (Optimal &lt; 12%)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Natural Coarse Bran:</span>
            <span className="text-emerald-700 font-bold">100% Retained</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2.5">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Laser Spectral Scan</span>
            <span className="text-emerald-700 font-bold">{testingProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
              style={{ width: `${testingProgress}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="mt-2.5 w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-60 shadow-md"
        >
          {isSimulating ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Molecular Purity...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Live Purity Test</span>
            </>
          )}
        </button>
      </div>

      {/* Certification Badge */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/95 border border-emerald-500/40 text-xs text-emerald-800 font-bold backdrop-blur-md shadow-md">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>NABL Accredited • itsclear Batch CLR-SH-2026</span>
      </div>
    </div>
  );
};

