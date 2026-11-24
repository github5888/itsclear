import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Camera, Navigation, Zap } from 'lucide-react';

interface Delivery3DSceneProps {
  trackingStep?: number; // 1 to 5
}

export const Delivery3DScene: React.FC<Delivery3DSceneProps> = ({ trackingStep = 4 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraAngle, setCameraAngle] = useState<'follow' | 'side' | 'top'>('follow');
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 350;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xfaf9f5, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.8, 2.2, 5.0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(5, 10, 5);
    sun.castShadow = true;
    scene.add(sun);

    // Green Eco Ambient Glow
    const greenGlow = new THREE.PointLight(0x10b981, 1.8, 10);
    greenGlow.position.set(0, 0.5, 0);
    scene.add(greenGlow);

    // ROAD
    const roadWidth = 4.0;
    const roadLength = 40.0;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    scene.add(road);

    // Road Stripes
    const stripeCount = 12;
    const stripes: THREE.Mesh[] = [];
    const stripeGeo = new THREE.PlaneGeometry(0.12, 1.4);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    for (let i = 0; i < stripeCount; i++) {
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.01, (i - stripeCount / 2) * 3.2);
      stripes.push(stripe);
      scene.add(stripe);
    }

    // 3D ELECTRIC DELIVERY VAN
    const vanGroup = new THREE.Group();
    scene.add(vanGroup);

    // Van Cabin (Front)
    const cabGeo = new THREE.BoxGeometry(1.2, 0.9, 1.0);
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.3, metalness: 0.2 });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, 0.65, 0.8);
    cab.castShadow = true;
    vanGroup.add(cab);

    // Windshield
    const windshieldGeo = new THREE.PlaneGeometry(1.0, 0.5);
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.85, roughness: 0.1 });
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 0.75, 1.31);
    vanGroup.add(windshield);

    // Van Cargo Box (Rear)
    const cargoGeo = new THREE.BoxGeometry(1.25, 1.25, 2.0);
    const cargoMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const cargo = new THREE.Mesh(cargoGeo, cargoMat);
    cargo.position.set(0, 0.85, -0.6);
    cargo.castShadow = true;
    vanGroup.add(cargo);

    // Cargo itsclear Branding Side Decal
    const decalCanvas = document.createElement('canvas');
    decalCanvas.width = 512;
    decalCanvas.height = 256;
    const dctx = decalCanvas.getContext('2d');
    if (dctx) {
      dctx.fillStyle = '#064e3b';
      dctx.fillRect(0, 0, 512, 256);
      dctx.strokeStyle = '#f59e0b';
      dctx.lineWidth = 10;
      dctx.strokeRect(15, 15, 482, 226);
      dctx.fillStyle = '#f59e0b';
      dctx.font = 'bold 38px sans-serif';
      dctx.textAlign = 'center';
      dctx.fillText('ITSCLEAR™', 256, 95);
      dctx.fillStyle = '#ffffff';
      dctx.font = '22px sans-serif';
      dctx.fillText('Fresh Chakki Atta EV Express', 256, 155);
      dctx.fillStyle = '#34d399';
      dctx.font = 'bold 20px sans-serif';
      dctx.fillText('Cold Stone Milled • Zero Carbon', 256, 200);
    }
    const decalTex = new THREE.CanvasTexture(decalCanvas);
    const decalMat = new THREE.MeshBasicMaterial({ map: decalTex });

    const rightDecal = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.95), decalMat);
    rightDecal.position.set(0.63, 0.85, -0.6);
    rightDecal.rotation.y = Math.PI / 2;
    vanGroup.add(rightDecal);

    const leftDecal = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.95), decalMat);
    leftDecal.position.set(-0.63, 0.85, -0.6);
    leftDecal.rotation.y = -Math.PI / 2;
    vanGroup.add(leftDecal);

    // Headlights
    const lightGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftLight = new THREE.Mesh(lightGeo, lightMat);
    leftLight.rotation.x = Math.PI / 2;
    leftLight.position.set(-0.4, 0.45, 1.32);
    vanGroup.add(leftLight);

    const rightLight = new THREE.Mesh(lightGeo, lightMat);
    rightLight.rotation.x = Math.PI / 2;
    rightLight.position.set(0.4, 0.45, 1.32);
    vanGroup.add(rightLight);

    // Spotlights shooting forward
    const spotL = new THREE.SpotLight(0xffffff, 4, 12, Math.PI / 6, 0.4);
    spotL.position.set(-0.4, 0.45, 1.32);
    spotL.target.position.set(-0.4, 0, 8);
    scene.add(spotL);
    scene.add(spotL.target);

    const spotR = new THREE.SpotLight(0xffffff, 4, 12, Math.PI / 6, 0.4);
    spotR.position.set(0.4, 0.45, 1.32);
    spotR.target.position.set(0.4, 0, 8);
    scene.add(spotR);
    scene.add(spotR.target);

    // 4 3D Spinning Wheels
    const wheels: THREE.Mesh[] = [];
    const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 20);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
    const wheelPositions = [
      [-0.62, 0.24, 0.7],
      [0.62, 0.24, 0.7],
      [-0.62, 0.24, -1.0],
      [0.62, 0.24, -1.0]
    ];

    wheelPositions.forEach(p => {
      const wheel = new THREE.Mesh(wheelGeo, tireMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(p[0], p[1], p[2]);
      wheel.castShadow = true;
      vanGroup.add(wheel);
      wheels.push(wheel);

      // Hubcap
      const hubGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.17, 12);
      const hubMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8 });
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.rotation.z = Math.PI / 2;
      hub.position.set(p[0], p[1], p[2]);
      vanGroup.add(hub);
    });

    // ANIMATION
    let clock = new THREE.Clock();
    let reqId: number;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Road stripes motion (simulating vehicle speed)
      const speed = 12.0;
      stripes.forEach(st => {
        st.position.z += speed * delta;
        if (st.position.z > roadLength / 2) {
          st.position.z -= roadLength;
        }
      });

      // Spin wheels
      wheels.forEach(w => {
        w.rotation.x -= speed * 3.5 * delta;
      });

      // Subtle suspension vibration
      vanGroup.position.y = Math.sin(time * 25) * 0.015;
      vanGroup.rotation.z = Math.sin(time * 12) * 0.005;

      // Adjust camera by selected perspective
      if (cameraRef.current) {
        if (cameraAngle === 'follow') {
          cameraRef.current.position.set(2.4, 2.0, 4.4);
          cameraRef.current.lookAt(0, 0.6, 0.2);
        } else if (cameraAngle === 'side') {
          cameraRef.current.position.set(4.5, 1.2, 0);
          cameraRef.current.lookAt(0, 0.6, 0);
        } else {
          cameraRef.current.position.set(0.1, 5.5, 0.1);
          cameraRef.current.lookAt(0, 0, 0);
        }
      }

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
  }, [cameraAngle]);

  return (
    <div className="relative w-full h-[280px] md:h-[340px] rounded-3xl overflow-hidden bg-gradient-to-b from-slate-50 to-amber-50/30 border border-slate-200 shadow-lg">
      <div ref={mountRef} className="w-full h-full" />

      {/* Camera switcher */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-md">
        <button
          onClick={() => setCameraAngle('follow')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
            cameraAngle === 'follow' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Follow Van</span>
        </button>

        <button
          onClick={() => setCameraAngle('side')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
            cameraAngle === 'side' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Side View</span>
        </button>

        <button
          onClick={() => setCameraAngle('top')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
            cameraAngle === 'top' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Satellite</span>
        </button>
      </div>

      {/* Live EV Badge */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/95 border border-emerald-500/40 text-xs text-emerald-800 font-bold backdrop-blur-md shadow-md">
        <Zap className="w-4 h-4 text-emerald-600 fill-emerald-500 animate-pulse" />
        <span>EV Fleet #DL-01-EV-4419 • Speed: 38 km/h</span>
      </div>
    </div>
  );
};

