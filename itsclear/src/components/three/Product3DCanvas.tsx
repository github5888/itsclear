import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Product } from '../../types';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Sun,
  Sparkles,
  Eye,
  Layers,
  Ruler,
  ShieldCheck,
  Check,
  X,
  Lock,
  Flame,
  ArrowRight
} from 'lucide-react';

interface Product3DCanvasProps {
  product: Product;
  autoRotate?: boolean;
  interactive?: boolean;
  className?: string;
  height?: string;
  showControls?: boolean;
}

export const Product3DCanvas: React.FC<Product3DCanvasProps> = ({
  product,
  autoRotate = true,
  interactive = true,
  className = '',
  height = 'h-96',
  showControls = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [lightMode, setLightMode] = useState<'warm' | 'studio' | 'sun'>('warm');
  const [xrayMode, setXrayMode] = useState(false);
  const [scaleCompareMode, setScaleCompareMode] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<'handle' | 'germ' | 'stone' | 'lab' | null>(null);
  const [activeAngle, setActiveAngle] = useState<'front' | 'back' | 'side' | 'top' | 'free'>('front');

  // References to keep between renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const isDraggingRef = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const reqAnimIdRef = useRef<number | null>(null);

  // Smooth cinematic lerp targets
  const targetRotationRef = useRef<{ y: number; x: number } | null>(null);
  const targetCameraRef = useRef<{ y: number; z: number } | null>(null);

  // Camera presets
  const handleSetPresetAngle = (preset: 'front' | 'back' | 'side' | 'top') => {
    setActiveAngle(preset);
    setIsRotating(false);
    if (preset === 'front') {
      targetRotationRef.current = { y: 0, x: 0 };
      targetCameraRef.current = { y: 0.5, z: scaleCompareMode ? 5.8 : 4.2 };
    } else if (preset === 'back') {
      targetRotationRef.current = { y: Math.PI, x: 0 };
      targetCameraRef.current = { y: 0.5, z: scaleCompareMode ? 5.8 : 4.2 };
    } else if (preset === 'side') {
      targetRotationRef.current = { y: Math.PI / 2, x: 0 };
      targetCameraRef.current = { y: 0.3, z: scaleCompareMode ? 5.8 : 4.0 };
    } else if (preset === 'top') {
      targetRotationRef.current = { y: 0, x: 0.42 };
      targetCameraRef.current = { y: 1.3, z: scaleCompareMode ? 5.4 : 3.6 };
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const heightVal = container.clientHeight || 400;

    // SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / heightVal, 0.1, 100);
    const initialZ = scaleCompareMode ? 5.8 : 4.2;
    camera.position.set(0, 0.5, initialZ);
    cameraRef.current = camera;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, heightVal);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75));
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // BALANCED STUDIO LIGHTING (REDUCED GLARE)
    const ambientLight = new THREE.AmbientLight(
      lightMode === 'studio' ? 0xf0f6ff : lightMode === 'sun' ? 0xfffaed : 0xffffff,
      0.65
    );
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(
      lightMode === 'warm' ? 0xfffaed : lightMode === 'sun' ? 0xffe29a : 0xf0f6ff,
      0.85
    );
    mainLight.position.set(4, 6, 5);
    mainLight.castShadow = !isMobile;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(
      new THREE.Color(product.themeColor).convertSRGBToLinear(),
      0.35
    );
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xffffff, 0.30, 10);
    fillLight.position.set(0, 3, 3);
    scene.add(fillLight);

    // GROUND SHADOW PEDESTAL
    const groundWidth = scaleCompareMode ? 4.2 : 1.7;
    const groundGeo = new THREE.CylinderGeometry(groundWidth, groundWidth * 1.08, 0.08, 36);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.35,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1.25;
    ground.receiveShadow = true;
    scene.add(ground);

    // Subtle glow ring under pedestal
    const ringGeo = new THREE.RingGeometry(groundWidth * 0.94, groundWidth, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(xrayMode ? 0x06b6d4 : product.themeColor),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -1.2;
    scene.add(ring);

    // MODEL GROUP
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    // BUILD POUCH(ES)
    const textureLoader = new THREE.TextureLoader();
    const hasRealPhoto = product.images && product.images.length > 0 && product.images[0].startsWith('/images/');
    const labelTexture = hasRealPhoto
      ? textureLoader.load(product.images[0])
      : createProceduralLabel(product.name, product.category.toUpperCase(), product.category, product.themeColor);

    if (hasRealPhoto && labelTexture instanceof THREE.Texture) {
      labelTexture.colorSpace = THREE.SRGBColorSpace;
      labelTexture.generateMipmaps = true;
    }

    const backImagePath = product.id.includes('protein')
      ? '/images/products/protein-bori-back.png'
      : '/images/products/khapli-bori-back.png';
    const backTexture = hasRealPhoto
      ? textureLoader.load(backImagePath)
      : createProceduralBackLabel(product);
    if (backTexture instanceof THREE.Texture) {
      backTexture.colorSpace = THREE.SRGBColorSpace;
      backTexture.generateMipmaps = true;
    }

    const sideGussetTex = textureLoader.load('/images/products/bori-side-gusset.png');
    sideGussetTex.colorSpace = THREE.SRGBColorSpace;
    sideGussetTex.generateMipmaps = true;

    // Helper to build a single standalone pouch mesh
    function buildPouchUnit(scale = 1.0, posX = 0, posY = -0.05, posZ = 0) {
      const unitGroup = new THREE.Group();
      unitGroup.scale.set(scale, scale, scale);
      unitGroup.position.set(posX, posY, posZ);

      const pouchWidth = 1.45;
      const pouchHeight = 1.95;
      const segments = 32;

      // Realistic volumetric depth
      const getFlourDepth = (ny: number) => {
        if (ny > 0.78) {
          return { dc: 0.05, de: 0.025 };
        } else if (ny > 0.40) {
          const t = (ny - 0.40) / 0.38;
          return {
            dc: 0.34 * (1 - t) + 0.05 * t,
            de: 0.22 * (1 - t) + 0.025 * t
          };
        } else {
          const normY = (ny + 1.0) / 1.40;
          const belly = Math.sin(Math.pow(normY, 0.7) * Math.PI);
          return {
            dc: 0.36 + 0.14 * belly,
            de: 0.22 + 0.10 * belly
          };
        }
      };

      // Front Face
      const frontGeo = new THREE.PlaneGeometry(pouchWidth, pouchHeight, segments, segments);
      const pos = frontGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const nx = x / (pouchWidth / 2);
        const ny = y / (pouchHeight / 2);
        const { dc, de } = getFlourDepth(ny);
        pos.setZ(i, de + (dc - de) * Math.cos((nx * Math.PI) / 2));
      }
      frontGeo.computeVertexNormals();

      const frontMat = new THREE.MeshStandardMaterial({
        map: labelTexture,
        roughness: xrayMode ? 0.2 : 0.58,
        metalness: xrayMode ? 0.3 : 0.02,
        transparent: xrayMode,
        opacity: xrayMode ? 0.38 : 1.0,
        side: THREE.FrontSide
      });
      const frontMesh = new THREE.Mesh(frontGeo, frontMat);
      frontMesh.castShadow = !xrayMode;
      unitGroup.add(frontMesh);

      // Back Face
      const backGeo = new THREE.PlaneGeometry(pouchWidth, pouchHeight, segments, segments);
      const bPos = backGeo.attributes.position;
      for (let i = 0; i < bPos.count; i++) {
        const x = bPos.getX(i);
        const y = bPos.getY(i);
        const nx = x / (pouchWidth / 2);
        const ny = y / (pouchHeight / 2);
        const { dc, de } = getFlourDepth(ny);
        bPos.setZ(i, -(de + (dc - de) * Math.cos((nx * Math.PI) / 2)));
      }
      backGeo.computeVertexNormals();

      const backMat = new THREE.MeshStandardMaterial({
        map: backTexture,
        roughness: xrayMode ? 0.2 : 0.65,
        metalness: xrayMode ? 0.3 : 0.0,
        transparent: xrayMode,
        opacity: xrayMode ? 0.38 : 1.0,
        side: THREE.FrontSide
      });
      const backMesh = new THREE.Mesh(backGeo, backMat);
      backMesh.rotation.y = Math.PI;
      backMesh.castShadow = !xrayMode;
      unitGroup.add(backMesh);

      // Left Gusset Strip
      const buildGusset = (isRight: boolean) => {
        const gGeo = new THREE.BufferGeometry();
        const verts: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];
        const wx = (pouchWidth / 2) * (isRight ? 1 : -1);

        for (let j = 0; j <= segments; j++) {
          const v = j / segments;
          const y = -pouchHeight / 2 + v * pouchHeight;
          const ny = y / (pouchHeight / 2);
          const { de } = getFlourDepth(ny);

          verts.push(wx, y, de);
          verts.push(wx - (isRight ? 1 : -1) * de * 0.2, y, 0.0);
          verts.push(wx, y, -de);

          uvs.push(0.0, v);
          uvs.push(0.5, v);
          uvs.push(1.0, v);

          if (j < segments) {
            const b = j * 3;
            if (!isRight) {
              indices.push(b, b + 3, b + 1);
              indices.push(b + 1, b + 3, b + 4);
              indices.push(b + 1, b + 4, b + 2);
              indices.push(b + 2, b + 4, b + 5);
            } else {
              indices.push(b, b + 1, b + 3);
              indices.push(b + 1, b + 4, b + 3);
              indices.push(b + 1, b + 2, b + 4);
              indices.push(b + 2, b + 5, b + 4);
            }
          }
        }
        gGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        gGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        gGeo.setIndex(indices);
        gGeo.computeVertexNormals();

        const gMat = new THREE.MeshStandardMaterial({
          map: sideGussetTex,
          roughness: 0.40,
          metalness: 0.05,
          transparent: xrayMode,
          opacity: xrayMode ? 0.35 : 1.0,
          side: THREE.DoubleSide
        });
        return new THREE.Mesh(gGeo, gMat);
      };

      unitGroup.add(buildGusset(false));
      unitGroup.add(buildGusset(true));

      // Stand-up Bottom Base Cap
      const bottomGeo = new THREE.BufferGeometry();
      const bVerts: number[] = [];
      const bUvs: number[] = [];
      const bIdx: number[] = [];
      const by = -pouchHeight / 2;
      const { dc: bdc, de: bde } = getFlourDepth(-1.0);

      bVerts.push(0, by, 0);
      bUvs.push(0.5, 0.5);

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = (pouchWidth / 2) * Math.cos(theta);
        const nx = x / (pouchWidth / 2);
        const curZ = (bde + (bdc - bde) * Math.abs(Math.sin((nx * Math.PI) / 2))) * Math.sin(theta);
        bVerts.push(x, by, curZ);
        bUvs.push(0.5 + 0.5 * Math.cos(theta), 0.5 + 0.5 * Math.sin(theta));
        if (i > 0) bIdx.push(0, i, i + 1);
      }
      bottomGeo.setAttribute('position', new THREE.Float32BufferAttribute(bVerts, 3));
      bottomGeo.setAttribute('uv', new THREE.Float32BufferAttribute(bUvs, 2));
      bottomGeo.setIndex(bIdx);
      bottomGeo.computeVertexNormals();

      const bottomMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.6,
        metalness: 0.1,
        transparent: xrayMode,
        opacity: xrayMode ? 0.4 : 1.0,
        side: THREE.DoubleSide
      });
      const bottomMesh = new THREE.Mesh(bottomGeo, bottomMat);
      unitGroup.add(bottomMesh);

      // X-Ray Mode Inner Grain Anatomy Core
      if (xrayMode) {
        // 1. Golden Living Germ (Center nucleus)
        const germGeo = new THREE.SphereGeometry(0.24, 16, 16);
        const germMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xd97706,
          emissiveIntensity: 0.8,
          roughness: 0.2
        });
        const germMesh = new THREE.Mesh(germGeo, germMat);
        germMesh.position.set(0, -0.15, 0);
        unitGroup.add(germMesh);

        // 2. Coarse Bran Layer (Outer fiber shell wireframe)
        const branGeo = new THREE.SphereGeometry(0.48, 16, 16);
        const branMat = new THREE.MeshBasicMaterial({
          color: 0xeab308,
          wireframe: true,
          transparent: true,
          opacity: 0.7
        });
        const branMesh = new THREE.Mesh(branGeo, branMat);
        branMesh.position.set(0, -0.15, 0);
        unitGroup.add(branMesh);

        // 3. Starchy Endosperm Glow Cloud
        const endoGeo = new THREE.SphereGeometry(0.36, 16, 16);
        const endoMat = new THREE.MeshBasicMaterial({
          color: 0xfef08a,
          transparent: true,
          opacity: 0.35
        });
        const endoMesh = new THREE.Mesh(endoGeo, endoMat);
        endoMesh.position.set(0, -0.15, 0);
        unitGroup.add(endoMesh);
      }

      return unitGroup;
    }

    if (scaleCompareMode) {
      // 4 POUCHES SIDE BY SIDE: 1kg, 2kg, 5kg, 10kg
      const pack1k = buildPouchUnit(0.56, -1.65, -0.42, 0);
      const pack2k = buildPouchUnit(0.74, -0.72, -0.25, 0);
      const pack5k = buildPouchUnit(1.0, 0.35, 0, 0);
      const pack10k = buildPouchUnit(1.26, 1.68, 0.26, 0);

      modelGroup.add(pack1k);
      modelGroup.add(pack2k);
      modelGroup.add(pack5k);
      modelGroup.add(pack10k);
    } else {
      // Standard single 5kg master pouch
      const singlePouch = buildPouchUnit(1.0, 0, -0.05, 0);
      modelGroup.add(singlePouch);
    }

    // FLOATING GRAIN PARTICLES
    const particleCount = xrayMode ? 45 : 28;
    const particleGeo = new THREE.SphereGeometry(0.024, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(xrayMode ? 0xf59e0b : product.themeColor),
      transparent: true,
      opacity: xrayMode ? 0.9 : 0.7
    });
    const particles: THREE.Mesh[] = [];
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(particleGeo, particleMat);
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = (scaleCompareMode ? 2.4 : 1.3) + Math.random() * 0.8;
      p.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2,
        Math.sin(angle) * radius
      );
      particles.push(p);
      scene.add(p);
    }

    // ANIMATION LOOP (WITH SMOOTH LERP INTERPOLATION & PAUSE WHEN OFFSCREEN)
    let clock = new THREE.Clock();
    let isVisible = true;
    let observer: IntersectionObserver | null = null;

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
      }, { threshold: 0.05 });
      observer.observe(container);
    }

    const animate = () => {
      reqAnimIdRef.current = requestAnimationFrame(animate);
      if (!isVisible) return; // Skip 3D render when out of screen for fast 60fps scrolling
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth cinematic rotation towards target preset
      if (targetRotationRef.current && modelGroupRef.current) {
        const curY = modelGroupRef.current.rotation.y;
        const curX = modelGroupRef.current.rotation.x;
        const diffY = targetRotationRef.current.y - curY;
        const diffX = targetRotationRef.current.x - curX;

        modelGroupRef.current.rotation.y += diffY * 0.12;
        modelGroupRef.current.rotation.x += diffX * 0.12;

        if (Math.abs(diffY) < 0.005 && Math.abs(diffX) < 0.005) {
          modelGroupRef.current.rotation.y = targetRotationRef.current.y;
          modelGroupRef.current.rotation.x = targetRotationRef.current.x;
          targetRotationRef.current = null;
        }
      } else if (isRotating && !isDraggingRef.current && modelGroupRef.current) {
        modelGroupRef.current.rotation.y += delta * 0.45;
      }

      // Smooth camera interpolation towards target distance
      if (targetCameraRef.current && cameraRef.current) {
        const curZ = cameraRef.current.position.z;
        const curY = cameraRef.current.position.y;
        const diffZ = targetCameraRef.current.z - curZ;
        const diffY = targetCameraRef.current.y - curY;

        cameraRef.current.position.z += diffZ * 0.12;
        cameraRef.current.position.y += diffY * 0.12;

        if (Math.abs(diffZ) < 0.01 && Math.abs(diffY) < 0.01) {
          cameraRef.current.position.z = targetCameraRef.current.z;
          cameraRef.current.position.y = targetCameraRef.current.y;
          targetCameraRef.current = null;
        }
      }

      // Gentle floating levitation
      if (modelGroupRef.current && !scaleCompareMode) {
        modelGroupRef.current.position.y = Math.sin(elapsed * 1.6) * 0.04;
      }

      // Particles orbit
      particles.forEach((p, idx) => {
        p.position.y += Math.sin(elapsed * 2 + idx) * 0.002;
        p.rotation.y += 0.01;
      });

      renderer.render(scene, camera);
    };
    animate();

    // INTERACTION HANDLERS
    const handleMouseDown = (e: MouseEvent) => {
      if (!interactive) return;
      isDraggingRef.current = true;
      targetRotationRef.current = null; // cancel active preset lerp
      setActiveAngle('free');
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive || !isDraggingRef.current || !modelGroupRef.current) return;
      const deltaX = e.clientX - prevMousePos.current.x;
      const deltaY = e.clientY - prevMousePos.current.y;

      modelGroupRef.current.rotation.y += deltaX * 0.01;
      modelGroupRef.current.rotation.x = Math.max(
        -0.3,
        Math.min(0.3, modelGroupRef.current.rotation.x + deltaY * 0.005)
      );

      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!interactive || !cameraRef.current) return;
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.002;
      const minZ = scaleCompareMode ? 3.5 : 2.2;
      const maxZ = scaleCompareMode ? 7.5 : 6.0;
      cameraRef.current.position.z = Math.max(
        minZ,
        Math.min(maxZ, cameraRef.current.position.z + zoomFactor)
      );
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!interactive || e.touches.length !== 1) return;
      isDraggingRef.current = true;
      targetRotationRef.current = null;
      setActiveAngle('free');
      prevMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!interactive || !isDraggingRef.current || !modelGroupRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePos.current.x;
      const deltaY = e.touches[0].clientY - prevMousePos.current.y;

      modelGroupRef.current.rotation.y += deltaX * 0.015;
      modelGroupRef.current.rotation.x = Math.max(
        -0.3,
        Math.min(0.3, modelGroupRef.current.rotation.x + deltaY * 0.008)
      );

      prevMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElem.addEventListener('wheel', handleWheel, { passive: false });
    domElem.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      if (reqAnimIdRef.current) cancelAnimationFrame(reqAnimIdRef.current);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElem.removeEventListener('wheel', handleWheel);
      domElem.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [product, lightMode, xrayMode, scaleCompareMode]);

  // Procedural fallback labels
  function createProceduralLabel(title: string, subtitle: string, category: string, primaryColor: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#fefbf6');
    grad.addColorStop(1, '#eee7d8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 12;
    ctx.strokeRect(18, 18, 476, 476);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 256, 250);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  function createProceduralBackLabel(prod: Product) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.fillStyle = '#fefbf6';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, 480, 480);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // Camera reset
  const handleResetCamera = () => {
    handleSetPresetAngle('front');
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const factor = direction === 'in' ? -0.4 : 0.4;
    const minZ = scaleCompareMode ? 3.5 : 2.2;
    const maxZ = scaleCompareMode ? 7.5 : 6.0;
    cameraRef.current.position.z = Math.max(minZ, Math.min(maxZ, cameraRef.current.position.z + factor));
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-orange-50/20 via-white to-slate-50 border border-slate-200/90 shadow-xl ${height} ${className}`}>
      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        title="Click and drag to rotate • Scroll to zoom"
      />

      {/* TOP HEADER CONTROLS BAR (Apple/Nike Style) */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-2 pointer-events-none">
        {/* Left Badges */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/95 border border-slate-200/80 backdrop-blur-md text-xs font-black text-slate-900 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>Interactive 3D Pouch</span>
          </div>

          {/* Light Mode Switcher */}
          <button
            onClick={() => {
              const modes: ('warm' | 'studio' | 'sun')[] = ['warm', 'studio', 'sun'];
              const next = modes[(modes.indexOf(lightMode) + 1) % modes.length];
              setLightMode(next);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-slate-200/80 backdrop-blur-md text-xs font-bold text-slate-700 hover:text-slate-950 transition-all shadow-2xs"
            title="Switch Ambiance"
          >
            <Sun className="w-3.5 h-3.5 text-orange-500" />
            <span className="capitalize hidden sm:inline">{lightMode} Light</span>
          </button>
        </div>

        {/* Right Feature Toggles: X-Ray & Scale Comparison */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* X-Ray Grain Anatomy Button */}
          <button
            onClick={() => {
              setXrayMode(!xrayMode);
              if (scaleCompareMode) setScaleCompareMode(false);
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
              xrayMode
                ? 'bg-cyan-600 text-white font-black shadow-cyan-500/30'
                : 'bg-white/95 border border-slate-200/80 text-slate-700 hover:text-slate-950 hover:border-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Grain X-Ray</span>
          </button>

          {/* 4-Pack Scale Comparison Button */}
          <button
            onClick={() => {
              setScaleCompareMode(!scaleCompareMode);
              if (xrayMode) setXrayMode(false);
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
              scaleCompareMode
                ? 'bg-orange-500 text-slate-950 font-black shadow-orange-500/30'
                : 'bg-white/95 border border-slate-200/80 text-slate-700 hover:text-slate-950 hover:border-slate-300'
            }`}
          >
            <Ruler className="w-3.5 h-3.5 text-orange-600" />
            <span>Scale (1k-10k)</span>
          </button>
        </div>
      </div>

      {/* SCALE COMPARISON LABELS OVERLAY (When Active) */}
      {scaleCompareMode && (
        <div className="absolute top-16 left-4 right-4 z-10 pointer-events-none">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white/95 border border-slate-200/80 shadow-2xs backdrop-blur-md">
              <span className="block text-xs font-black text-slate-900">1 kg Trial</span>
              <span className="text-[10px] text-slate-500 block">18 cm • 36 Rotis</span>
            </div>
            <div className="p-2 rounded-xl bg-white/95 border border-slate-200/80 shadow-2xs backdrop-blur-md">
              <span className="block text-xs font-black text-slate-900">2 kg Kitchen</span>
              <span className="text-[10px] text-slate-500 block">25 cm • 72 Rotis</span>
            </div>
            <div className="p-2 rounded-xl bg-orange-50 border border-orange-300 shadow-2xs backdrop-blur-md">
              <span className="block text-xs font-black text-orange-950">5 kg Bag</span>
              <span className="text-[10px] text-orange-700 block font-bold">34 cm • 180 Rotis</span>
            </div>
            <div className="p-2 rounded-xl bg-white/95 border border-slate-200/80 shadow-2xs backdrop-blur-md">
              <span className="block text-xs font-black text-slate-900">10 kg Handle</span>
              <span className="text-[10px] text-slate-500 block">44 cm • 360 Rotis</span>
            </div>
          </div>
        </div>
      )}

      {/* X-RAY GRAIN ANATOMY INFO OVERLAY (When Active) */}
      {xrayMode && (
        <div className="absolute top-16 left-6 z-10 pointer-events-auto max-w-xs animate-fade-in">
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/40 text-white backdrop-blur-xl shadow-2xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Whole Grain Anatomy</span>
              </span>
              <button onClick={() => setXrayMode(false)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-start space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                <div>
                  <strong className="text-amber-300">Coarse Bran (Fiber):</strong>
                  <p className="text-[11px] text-slate-300">100% retained. Aids smooth digestion with zero constipation.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 mt-1 shrink-0" />
                <div>
                  <strong className="text-yellow-300">Living Germ (Heart Vitality):</strong>
                  <p className="text-[11px] text-slate-300">Preserved below 28°C. Packed with natural Vitamin E &amp; healthy oils.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-1 shrink-0" />
                <div>
                  <strong className="text-cyan-300">Endosperm (Complex Carbs):</strong>
                  <p className="text-[11px] text-slate-300">Low-GI energy release without sugar spikes. 0% Added Maida.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 INTERACTIVE 3D HOTSPOTS (When not in scale/xray mode) */}
      {!scaleCompareMode && !xrayMode && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Hotspot 1: Handle & Zipper (Top) */}
          <div className="absolute top-[18%] left-[50%] -translate-x-1/2 pointer-events-auto">
            <button
              onClick={() => setActiveHotspot(activeHotspot === 'handle' ? null : 'handle')}
              className="group relative flex items-center justify-center"
              title="Airtight Zipper & Handle"
            >
              <span className="absolute w-6 h-6 rounded-full bg-orange-500/40 animate-ping" />
              <span className="w-5 h-5 rounded-full bg-orange-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-lg border border-white">
                1
              </span>
            </button>

            {activeHotspot === 'handle' && (
              <div className="absolute left-1/2 -translate-x-1/2 top-8 w-64 p-3.5 rounded-2xl bg-slate-950/95 border border-slate-700 text-white shadow-2xl backdrop-blur-xl animate-fade-in z-20">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800">
                  <h5 className="font-black text-xs text-orange-400">Airtight Zipper &amp; Handle</h5>
                  <button onClick={() => setActiveHotspot(null)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Double-welded airtight freshness seal prevents oxidation and humidity. Reinforced punched handle makes carrying 5kg &amp; 10kg effortless.
                </p>
              </div>
            )}
          </div>

          {/* Hotspot 2: Whole Grain Belly (Center) */}
          <div className="absolute top-[48%] left-[38%] pointer-events-auto">
            <button
              onClick={() => setActiveHotspot(activeHotspot === 'germ' ? null : 'germ')}
              className="group relative flex items-center justify-center"
              title="100% Bran & Germ Retained"
            >
              <span className="absolute w-6 h-6 rounded-full bg-emerald-500/40 animate-ping" />
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shadow-lg border border-white">
                2
              </span>
            </button>

            {activeHotspot === 'germ' && (
              <div className="absolute left-6 top-0 w-64 p-3.5 rounded-2xl bg-slate-950/95 border border-slate-700 text-white shadow-2xl backdrop-blur-xl animate-fade-in z-20">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800">
                  <h5 className="font-black text-xs text-emerald-400">100% Whole Grain Bulk</h5>
                  <button onClick={() => setActiveHotspot(null)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Full heavy belly holds 5kg/10kg of pure stoneground flour. Retains live wheat germ &amp; coarse dietary bran with zero maida blending.
                </p>
              </div>
            )}
          </div>

          {/* Hotspot 3: Purity Lab Seal (Lower Left) */}
          <div className="absolute top-[68%] left-[28%] pointer-events-auto">
            <button
              onClick={() => setActiveHotspot(activeHotspot === 'lab' ? null : 'lab')}
              className="group relative flex items-center justify-center"
              title="NABL Lab Batch Certificate"
            >
              <span className="absolute w-6 h-6 rounded-full bg-blue-500/40 animate-ping" />
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shadow-lg border border-white">
                3
              </span>
            </button>

            {activeHotspot === 'lab' && (
              <div className="absolute left-6 top-0 w-64 p-3.5 rounded-2xl bg-slate-950/95 border border-slate-700 text-white shadow-2xl backdrop-blur-xl animate-fade-in z-20">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800">
                  <h5 className="font-black text-xs text-blue-400">Batch #{product.labTestBatch}</h5>
                  <button onClick={() => setActiveHotspot(null)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Lab verified 100% Zero Added Maida and Zero Bleaching Agents (Benzoyl Peroxide free). Origin: {product.origin}.
                </p>
              </div>
            )}
          </div>

          {/* Hotspot 4: Cold Stone Base (Bottom Edge) */}
          <div className="absolute top-[78%] right-[32%] pointer-events-auto">
            <button
              onClick={() => setActiveHotspot(activeHotspot === 'stone' ? null : 'stone')}
              className="group relative flex items-center justify-center"
              title="Cold Stoneground < 28°C"
            >
              <span className="absolute w-6 h-6 rounded-full bg-amber-500/40 animate-ping" />
              <span className="w-5 h-5 rounded-full bg-amber-600 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-lg border border-white">
                4
              </span>
            </button>

            {activeHotspot === 'stone' && (
              <div className="absolute right-6 bottom-0 w-64 p-3.5 rounded-2xl bg-slate-950/95 border border-slate-700 text-white shadow-2xl backdrop-blur-xl animate-fade-in z-20">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800">
                  <h5 className="font-black text-xs text-amber-400">Cold Chakki Milled &lt;28°C</h5>
                  <button onClick={() => setActiveHotspot(null)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Slow rotation on emery stones keeps grain temperatures below 28°C, retaining delicate natural sweetness, minerals, and live enzymes.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM FLOATING CAMERA PRESET DOCK (Apple & B&O Benchmark) */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Preset Angle Buttons */}
        <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-white/95 border border-slate-200/90 shadow-lg backdrop-blur-md pointer-events-auto">
          <button
            onClick={() => handleSetPresetAngle('front')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeAngle === 'front'
                ? 'bg-slate-950 text-white shadow-2xs font-black'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Front
          </button>

          <button
            onClick={() => handleSetPresetAngle('side')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeAngle === 'side'
                ? 'bg-slate-950 text-white shadow-2xs font-black'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            5kg Side
          </button>

          <button
            onClick={() => handleSetPresetAngle('back')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeAngle === 'back'
                ? 'bg-slate-950 text-white shadow-2xs font-black'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Nutrition Back
          </button>

          <button
            onClick={() => handleSetPresetAngle('top')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeAngle === 'top'
                ? 'bg-slate-950 text-white shadow-2xs font-black'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Handle
          </button>
        </div>

        {/* Orbit & Zoom Controls */}
        {showControls && (
          <div className="flex items-center space-x-1 bg-white/95 border border-slate-200/90 backdrop-blur-md p-1 rounded-2xl shadow-lg pointer-events-auto">
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`p-2 rounded-xl text-xs transition-all ${
                isRotating
                  ? 'bg-orange-500 text-slate-950 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={isRotating ? 'Pause auto-rotation' : 'Start auto-rotation'}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin-slow' : ''}`} />
            </button>

            <button
              onClick={() => handleZoom('in')}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleZoom('out')}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleResetCamera}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              title="Reset View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
