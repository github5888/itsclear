import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, RotateCcw, CheckCircle2 } from 'lucide-react';

export interface PackOption {
  id: string;
  name: string;
  tagline: string;
  image: string;
  backImage: string;
  badge: string;
  protein: string;
  origin: string;
  price1kg: number;
  price5kg: number;
  price10kg: number;
  mrp5kg: number;
  highlights: string[];
}

export const HERO_PACKS: PackOption[] = [
  {
    id: 'khapli-single',
    name: 'itsclear™ Khapli Atta (Ancient Grain)',
    tagline: '100% Khapli Wheat • Naturally Low-GI • Standup Pouch with Handle',
    image: '/images/products/khapli-bori-only.png',
    backImage: '/images/products/khapli-bori-back.png',
    badge: '100% Khapli Wheat',
    protein: '14.5g Protein',
    origin: 'Solapur, Maharashtra',
    price1kg: 95,
    price5kg: 440,
    price10kg: 849,
    mrp5kg: 520,
    highlights: ['Diabetic Friendly Low-GI (42)', 'Gentle Soluble Gluten', 'Punched Carry Handle']
  },
  {
    id: 'protein-single',
    name: 'itsclear™ High Protein Atta (36% Protein)',
    tagline: '36g Protein Per 100g • Whole Wheat + Golden Soya + Roasted Peanut',
    image: '/images/products/protein-bori-only.png',
    backImage: '/images/products/protein-bori-back.png',
    badge: '36% Protein',
    protein: '36.0g Protein',
    origin: 'Malwa, MP',
    price1kg: 115,
    price5kg: 495,
    price10kg: 960,
    mrp5kg: 599,
    highlights: ['60% Wheat • 30% Soya • 10% Peanut', 'Builds Stronger Muscles', 'Supports Immunity']
  },
  {
    id: 'khapli-sizes',
    name: 'itsclear™ Khapli 4-Pack Sizes Lineup',
    tagline: '1kg, 2kg, 5kg & 10kg Family Sacks • 100% Pure Stoneground',
    image: '/images/products/khapli-sizes-grid-bori-only.png',
    backImage: '/images/products/khapli-bori-back.png',
    badge: '1kg - 10kg Sizes',
    protein: '14.5g Protein',
    origin: 'Direct Farm Harvest',
    price1kg: 95,
    price5kg: 440,
    price10kg: 849,
    mrp5kg: 520,
    highlights: ['All 4 Sizes Available', 'Zero Maida or Bleach', '14-Hr Soft Rotis']
  },
  {
    id: 'khapli-badges',
    name: 'itsclear™ Khapli 4-Health Badges Edition',
    tagline: 'High Protein • Rich in Nutrition • Good for Health • Natural Ingredients',
    image: '/images/products/khapli-sizes-badges-bori-only.png',
    backImage: '/images/products/khapli-bori-back.png',
    badge: '4 Badges Certified',
    protein: '14.5g Protein',
    origin: 'Certified Organic Tracts',
    price1kg: 95,
    price5kg: 440,
    price10kg: 849,
    mrp5kg: 520,
    highlights: ['4 Certified Health Pillars', 'Metabolic Health Support', 'Triple-Washed Grains']
  },
  {
    id: 'protein-duo',
    name: 'itsclear™ Protein Duo (5kg & 10kg Bags)',
    tagline: 'Master High-Protein Bags with Wheat, Soya & Peanut Flour Bowls',
    image: '/images/products/protein-attas-duo-bori-only.png',
    backImage: '/images/products/protein-bori-back.png',
    badge: '36g Protein Duo',
    protein: '36.0g Protein',
    origin: 'Indore & Malwa',
    price1kg: 115,
    price5kg: 495,
    price10kg: 960,
    mrp5kg: 599,
    highlights: ['36g Protein Per 100g', '5kg & 10kg Master Packs', 'Keeps You Energized']
  }
];

interface Hero3DSceneProps {
  activePackIndex?: number;
  onPackChange?: (index: number) => void;
  onAddToCart?: (pack: PackOption, size: string, price: number) => void;
}

export const Hero3DScene: React.FC<Hero3DSceneProps> = ({
  activePackIndex: externalPackIndex,
  onPackChange,
  onAddToCart
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [internalPackIndex, setInternalPackIndex] = useState(0);
  const packIndex = externalPackIndex !== undefined ? externalPackIndex : internalPackIndex;
  const currentPack = HERO_PACKS[packIndex];

  const [selectedSize, setSelectedSize] = useState<'1kg' | '5kg' | '10kg'>('5kg');

  // References for Three.js state
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const backMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const resetRotationRef = useRef<(() => void) | null>(null);

  const handleSelectPack = (index: number) => {
    setInternalPackIndex(index);
    if (onPackChange) onPackChange(index);
  };

  // Update textures on pack index change
  useEffect(() => {
    if (!materialRef.current) return;
    const loader = new THREE.TextureLoader();
    const newFrontTex = loader.load(currentPack.image);
    newFrontTex.colorSpace = THREE.SRGBColorSpace;
    newFrontTex.generateMipmaps = true;
    materialRef.current.map = newFrontTex;
    materialRef.current.needsUpdate = true;

    if (backMaterialRef.current) {
      const newBackTex = loader.load(currentPack.backImage);
      newBackTex.colorSpace = THREE.SRGBColorSpace;
      newBackTex.generateMipmaps = true;
      backMaterialRef.current.map = newBackTex;
      backMaterialRef.current.needsUpdate = true;
    }
  }, [packIndex]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const width = container.clientWidth || 550;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0.05, 4.0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile, // Disable expensive antialiasing on mobile for high FPS
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75));
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ==========================================
    // BALANCED STUDIO LIGHTING (NO OVEREXPOSURE)
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xfffbeb, 0.65);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 0.90);
    keyLight.position.set(3.5, 6, 4.5);
    keyLight.castShadow = !isMobile;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xfff7ed, 0.30, 12);
    fillLight.position.set(-3.5, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xd97706, 0.40);
    rimLight.position.set(-2, 3, -3);
    scene.add(rimLight);

    // ==========================================
    // CLEAN STUDIO PEDESTAL & SHADOW
    // ==========================================
    const floorGeo = new THREE.PlaneGeometry(6, 6);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.16 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.16;
    floor.receiveShadow = true;
    scene.add(floor);

    // Marble Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.35, 1.45, 0.06, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.05
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.18;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Golden Edge Ring
    const ringGeo = new THREE.RingGeometry(1.30, 1.35, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -1.145;
    scene.add(ring);

    // ==========================================
    // TRUE 3D VOLUMETRIC STANDUP FLOUR BORI
    // (5kg Heavy Atta Belly with Solid Side Gussets)
    // ==========================================
    const pouchWidth = 1.43;
    const pouchHeight = 1.94;
    const segments = 32;

    // Realistic Flour Depth Profile (Heavy 5kg belly at lower half, sealed flat zipper at top)
    const getFlourPouchDepth = (ny: number) => {
      // ny ranges from -1.0 (bottom base) to +1.0 (top carry handle)
      if (ny > 0.55) {
        // Above zipper: flat laminate sheet with carry handle cutout
        const taper = Math.max(0, 1 - (ny - 0.55) / 0.45);
        return {
          dc: 0.02 * taper,
          de: 0.005 * taper
        };
      } else {
        // Heavy stoneground flour settles into lower belly!
        const t = (ny + 1.0) / 1.55; // 0 at bottom base, 1 at zipper
        const flourBulge = Math.sin(Math.pow(t, 0.72) * Math.PI);
        let dc = 0.16 + 0.12 * flourBulge; // Center half-depth: 0.16 at bottom up to 0.28 at belly (0.56 total thickness!)
        let de = 0.10 + 0.08 * flourBulge; // Side edge half-depth: 0.10 up to 0.18 (0.36 total side width!)
        if (t > 0.75) {
          const zipTaper = (1.0 - t) / 0.25;
          dc = 0.02 + (dc - 0.02) * zipTaper;
          de = 0.005 + (de - 0.005) * zipTaper;
        }
        return { dc, de };
      }
    };

    // Front / Back Face Geometry Builder with plump volumetric bulge
    const createVolumetricPouchFaceGeo = (width = pouchWidth, height = pouchHeight, segs = segments, isBack = false) => {
      const geo = new THREE.PlaneGeometry(width, height, segs, segs);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const nx = x / (width / 2);
        const ny = y / (height / 2);

        const { dc, de } = getFlourPouchDepth(ny);
        // Plump cosine belly across the width
        const z = de + (dc - de) * Math.cos((nx * Math.PI) / 2);
        pos.setZ(i, isBack ? -z : z);
      }
      geo.computeVertexNormals();
      return geo;
    };

    // Side Gusset Bellows Strip Builder (Connects Front Face to Back Face)
    const createSideGussetStripGeo = (width = pouchWidth, height = pouchHeight, segsY = segments, isRight = false) => {
      const geo = new THREE.BufferGeometry();
      const vertices: number[] = [];
      const uvs: number[] = [];
      const indices: number[] = [];

      const wx = (width / 2) * (isRight ? 1 : -1);
      const creaseSign = isRight ? 1 : -1;

      for (let j = 0; j <= segsY; j++) {
        const v = j / segsY;
        const y = -height / 2 + v * height;
        const ny = y / (height / 2);
        const { de } = getFlourPouchDepth(ny);

        // 3 vertices across the side gusset:
        // Front edge, center V-crease fold, back edge
        vertices.push(wx, y, de);
        vertices.push(wx + creaseSign * de * 0.15, y, 0.0);
        vertices.push(wx, y, -de);

        uvs.push(0.0, v);
        uvs.push(0.5, v);
        uvs.push(1.0, v);

        if (j < segsY) {
          const b = j * 3;
          if (!isRight) {
            // Left gusset outward normals
            indices.push(b, b + 3, b + 1);
            indices.push(b + 1, b + 3, b + 4);
            indices.push(b + 1, b + 4, b + 2);
            indices.push(b + 2, b + 4, b + 5);
          } else {
            // Right gusset outward normals
            indices.push(b, b + 1, b + 3);
            indices.push(b + 1, b + 4, b + 3);
            indices.push(b + 1, b + 2, b + 4);
            indices.push(b + 2, b + 5, b + 4);
          }
        }
      }

      geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      return geo;
    };

    // Bottom Gusset Base Builder (Caps the bottom of the sack)
    const createBottomGussetGeo = (width = pouchWidth, height = pouchHeight) => {
      const geo = new THREE.BufferGeometry();
      const vertices: number[] = [];
      const indices: number[] = [];
      const bSegs = 32;
      const by = -height / 2;

      vertices.push(0, by, 0); // Center point
      for (let i = 0; i <= bSegs; i++) {
        const theta = (i / bSegs) * Math.PI * 2;
        const bx = (width / 2) * Math.cos(theta);
        const bz = 0.16 * Math.sin(theta); // 0.32 total bottom girth
        vertices.push(bx, by, bz);
        if (i > 0) {
          indices.push(0, i, i + 1);
        }
      }
      geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      return geo;
    };

    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const textureLoader = new THREE.TextureLoader();
    const frontTex = textureLoader.load(currentPack.image);
    frontTex.colorSpace = THREE.SRGBColorSpace;
    frontTex.generateMipmaps = true;

    // 1. Front Face (Heavy Plump Flour Belly + Transparent Handle Punch)
    const frontGeo = createVolumetricPouchFaceGeo(pouchWidth, pouchHeight, segments, false);
    const frontMat = new THREE.MeshStandardMaterial({
      map: frontTex,
      transparent: true,
      alphaTest: 0.15,
      depthWrite: true,
      roughness: 0.68,
      metalness: 0.0,
      side: THREE.FrontSide
    });
    materialRef.current = frontMat;

    const frontMesh = new THREE.Mesh(frontGeo, frontMat);
    frontMesh.position.set(0, -0.15, 0);
    frontMesh.castShadow = true;
    frontMesh.receiveShadow = true;
    stageGroup.add(frontMesh);

    // 2. Back Face (Matching Silhouette + Nutrition Facts + Transparent Handle Punch)
    const backTex = textureLoader.load(currentPack.backImage);
    backTex.colorSpace = THREE.SRGBColorSpace;
    backTex.generateMipmaps = true;

    const backGeo = createVolumetricPouchFaceGeo(pouchWidth, pouchHeight, segments, false);
    const backMat = new THREE.MeshStandardMaterial({
      map: backTex,
      transparent: true,
      alphaTest: 0.15,
      depthWrite: true,
      roughness: 0.72,
      metalness: 0.0,
      side: THREE.FrontSide
    });
    backMaterialRef.current = backMat;

    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.rotation.y = Math.PI;
    backMesh.position.set(0, -0.15, 0);
    backMesh.castShadow = true;
    stageGroup.add(backMesh);

    // 3. Side Gusset Texture & Meshes (Left & Right Walls - 100% Solid Volumetric Bulk)
    const sideGussetTex = textureLoader.load('/images/products/bori-side-gusset.png');
    sideGussetTex.colorSpace = THREE.SRGBColorSpace;
    sideGussetTex.generateMipmaps = true;

    const sideGussetMat = new THREE.MeshStandardMaterial({
      map: sideGussetTex,
      roughness: 0.55,
      metalness: 0.02,
      side: THREE.FrontSide
    });

    const leftGussetGeo = createSideGussetStripGeo(pouchWidth, pouchHeight, segments, false);
    const leftGussetMesh = new THREE.Mesh(leftGussetGeo, sideGussetMat);
    leftGussetMesh.position.set(0, -0.15, 0);
    leftGussetMesh.castShadow = true;
    stageGroup.add(leftGussetMesh);

    const rightGussetGeo = createSideGussetStripGeo(pouchWidth, pouchHeight, segments, true);
    const rightGussetMesh = new THREE.Mesh(rightGussetGeo, sideGussetMat);
    rightGussetMesh.position.set(0, -0.15, 0);
    rightGussetMesh.castShadow = true;
    stageGroup.add(rightGussetMesh);

    // 4. Bottom Base Gusset Seal
    const bottomGussetGeo = createBottomGussetGeo(pouchWidth, pouchHeight);
    const bottomGussetMat = new THREE.MeshStandardMaterial({
      color: 0x152536,
      roughness: 0.5,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const bottomGussetMesh = new THREE.Mesh(bottomGussetGeo, bottomGussetMat);
    bottomGussetMesh.position.set(0, -0.15, 0);
    bottomGussetMesh.receiveShadow = true;
    stageGroup.add(bottomGussetMesh);

    // 5. Authentic Golden Farm Wheat Kernels on Pedestal (Direct Chakki Feel)
    const wheatGrainsGroup = new THREE.Group();
    const grainGeometry = new THREE.SphereGeometry(0.038, 10, 10);
    grainGeometry.scale(0.85, 0.45, 2.0); // Realistic elongated wheat kernel
    const grainMaterial = new THREE.MeshStandardMaterial({
      color: 0xe59b2a, // Golden amber wheat kernel
      roughness: 0.32,
      metalness: 0.08
    });

    const grainSpills = [
      [-0.65, -1.14, 0.55, 0.4],
      [-0.45, -1.14, 0.75, -0.8],
      [0.55, -1.14, 0.65, 1.2],
      [0.72, -1.14, 0.42, -0.3],
      [-0.85, -1.14, 0.25, 0.9],
      [0.85, -1.14, -0.2, -1.1],
      [-0.3, -1.14, 0.88, 0.1],
      [0.35, -1.14, 0.82, -0.6],
      [-0.55, -1.14, -0.65, 0.7],
      [0.60, -1.14, -0.55, -0.9],
      [-0.15, -1.14, 0.92, 1.5],
      [0.20, -1.14, 0.90, -1.3]
    ];
    grainSpills.forEach(([gx, gy, gz, rot]) => {
      const gMesh = new THREE.Mesh(grainGeometry, grainMaterial);
      gMesh.position.set(gx, gy, gz);
      gMesh.rotation.y = rot;
      gMesh.rotation.z = 0.05;
      gMesh.castShadow = true;
      gMesh.receiveShadow = true;
      wheatGrainsGroup.add(gMesh);
    });
    scene.add(wheatGrainsGroup);

    // Subtle Golden Sparkles
    const particleCount = isMobile ? 14 : 35;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4.0;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3.0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ==========================================
    // INTERACTIVE CONTROLS
    // ==========================================
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let rotY = 0;
    let rotX = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;

    resetRotationRef.current = () => {
      rotY = 0;
      rotX = 0;
      targetTiltX = 0;
      targetTiltY = 0;
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetTiltX = x * 0.24;
      targetTiltY = y * 0.15;

      if (isDragging) {
        const deltaX = e.clientX - prevX;
        const deltaY = e.clientY - prevY;
        rotY += deltaX * 0.012;
        rotX += deltaY * 0.008;
        rotX = Math.max(-0.35, Math.min(0.35, rotX));
        prevX = e.clientX;
        prevY = e.clientY;
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevX;
        const deltaY = e.touches[0].clientY - prevY;
        rotY += deltaX * 0.012;
        rotX += deltaY * 0.008;
        rotX = Math.max(-0.35, Math.min(0.35, rotX));
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      }
    };
    const handleTouchEnd = () => {
      isDragging = false;
    };
    domElem.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    // ANIMATION LOOP (PAUSE WHEN OFFSCREEN FOR 60FPS MOBILE PERFORMANCE)
    let reqId: number;
    let clock = new THREE.Clock();
    let isVisible = true;
    let observer: IntersectionObserver | null = null;

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
        },
        { threshold: 0.05 }
      );
      observer.observe(container);
    }

    const animate = () => {
      reqId = requestAnimationFrame(animate);

      // Skip render calculations when out of viewport for instant mobile speed
      if (!isVisible) return;

      const time = clock.getElapsedTime();

      // Gentle floating levitation
      stageGroup.position.y = Math.sin(time * 1.5) * 0.035;

      if (!isDragging) {
        const idleSway = Math.sin(time * 0.8) * 0.12;
        stageGroup.rotation.y += (rotY + idleSway + targetTiltX - stageGroup.rotation.y) * 0.08;
        stageGroup.rotation.x += (rotX - targetTiltY - stageGroup.rotation.x) * 0.08;
      } else {
        stageGroup.rotation.y = rotY;
        stageGroup.rotation.x = rotX;
      }

      const posArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 1] += 0.003;
        if (posArr[i * 3 + 1] > 2.0) {
          posArr[i * 3 + 1] = -2.0;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      camera.position.x += (targetTiltX * 0.4 - camera.position.x) * 0.05;
      camera.position.y += (0.05 + targetTiltY * 0.25 - camera.position.y) * 0.05;
      camera.lookAt(0, -0.15, 0);

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
      if (observer) observer.disconnect();
      domElem.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElem.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  const currentPrice =
    selectedSize === '1kg'
      ? currentPack.price1kg
      : selectedSize === '5kg'
      ? currentPack.price5kg
      : currentPack.price10kg;

  return (
    <div className="w-full relative flex flex-col items-center">
      {/* 3D Showcase Frame - CLEAN, ONLY THE BORI */}
      <div className="relative w-full h-[400px] sm:h-[460px] lg:h-[510px] xl:h-[540px] rounded-3xl overflow-hidden bg-gradient-to-b from-amber-50/30 via-white to-amber-50/15 border border-amber-200/70 shadow-lg group transition-all select-none flex items-center justify-center">
        {/* Subtle Warm Ambiance Radial Glow behind bori */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-amber-200/10 to-transparent blur-2xl pointer-events-none" />

        {/* The WebGL Canvas (Hosts strictly the isolated 3D bori) */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Responsive Bottom Drag Prompt with Integrated Reset */}
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/95 border border-amber-300/80 backdrop-blur-md text-[11px] sm:text-xs font-bold text-slate-800 shadow-md z-10 max-w-[94%] select-none">
          <RotateCw className="w-3.5 h-3.5 text-amber-600 animate-spin-slow shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">Drag to inspect authentic pack</span>
          <span className="sm:hidden whitespace-nowrap">Drag to rotate</span>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (resetRotationRef.current) resetRotationRef.current();
            }}
            className="flex items-center space-x-1 text-slate-600 hover:text-orange-600 font-bold transition-colors cursor-pointer shrink-0 active:scale-95"
            title="Reset to Front View"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 5-Photo Interactive Thumbnail Selector Dock */}
      <div className="w-full mt-3 p-1.5 sm:p-2 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto scrollbar-thin">
        {HERO_PACKS.map((pack, idx) => (
          <button
            key={pack.id}
            onClick={() => handleSelectPack(idx)}
            className={`flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              packIndex === idx
                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400 scale-[1.02]'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
            }`}
          >
            <img
              src={pack.image}
              alt={pack.name}
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-md shrink-0"
            />
            <div className="text-left">
              <p className="leading-tight font-black whitespace-nowrap text-[11px] sm:text-xs">{pack.badge}</p>
              <p className="text-[10px] opacity-80 font-semibold">{pack.protein}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Integrated Fast Action Bar (Select Size & Add to Basket) */}
      <div className="w-full mt-3 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-white to-emerald-500/10 border border-amber-300 shadow-md flex flex-col gap-2.5">
        {/* Size Selection Chips */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 w-full">
          <span className="text-xs font-bold text-slate-800 mr-1 hidden sm:inline shrink-0">Pack Size:</span>
          {(['1kg', '5kg', '10kg'] as const).map((sz) => (
            <button
              key={sz}
              onClick={() => setSelectedSize(sz)}
              className={`flex-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSize === sz
                  ? 'bg-slate-950 text-amber-400 shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {sz === '5kg' ? '5 kg (Bori)' : sz === '10kg' ? '10 kg (Sack)' : '1 kg Pouch'}
            </button>
          ))}
        </div>

        {/* Live Price & Add to Basket Action */}
        <div className="flex items-center justify-between w-full pt-1 border-t border-amber-200/50 gap-2">
          <div className="text-left min-w-0">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-lg sm:text-xl font-black text-slate-950">₹{currentPrice}</span>
              {selectedSize === '5kg' && (
                <span className="text-xs text-slate-400 line-through">₹{currentPack.mrp5kg}</span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-700 flex items-center space-x-1 truncate">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Free 2-Hour EV Delivery</span>
            </span>
          </div>

          <button
            onClick={() => {
              if (onAddToCart) {
                onAddToCart(currentPack, selectedSize, currentPrice);
              }
            }}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/25 flex items-center space-x-1.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <span>Add to Basket</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
