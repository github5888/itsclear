import { Product, Coupon, UserReview } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'itsclear-khapli-ancient',
    name: 'itsclear Khapli Atta',
    subTitle: '100% Khapli Wheat Ancient Flour (Diabetic Friendly)',
    category: 'khapli',
    tagline: '100% Khapli Wheat • Ancient Emmer Grain • Naturally Low-GI',
    description: 'Milled from 100% pure ancient Khapli (Emmer) wheat grains as depicted on our packaging. Naturally low in glycemic index, high in coarse fiber, and packed with ancient minerals. Ideal for diabetic glucose balance, gut vitality, and soft rotis without any preservatives, maida, or bleaching chemicals.',
    origin: 'Solapur & Sangli, Maharashtra',
    harvestSeason: 'Spring 2026',
    labTestBatch: 'CLR-KH-8841',
    purityScore: 100,
    featured: true,
    rating: 5.0,
    reviewCount: 342,
    images: [
      '/images/products/khapli-single.jpg',
      '/images/products/khapli-bori-only.png',
      '/images/products/khapli-sizes-badges-bori-only.png',
      '/images/products/khapli-sizes-grid-bori-only.png'
    ],
    modelType: 'atta-kraft',
    themeColor: '#0b192c',
    secondaryColor: '#d97706',
    flourType: '100% Khapli Wheat (Triticum Dicoccum)',
    millingSpeed: 'Cold Stone Ground (<27°C)',
    rotiSoftnessScore: 10,
    composition: '100% Ancient Emmer Khapli Wheat',
    packageBadges: [
      '100% Khapli Wheat',
      'High Protein',
      'Rich in Nutrition',
      'Good for Health',
      'Natural Ingredients'
    ],
    variants: [
      { id: 'var-kh1-1k', size: '1 kg', weightInKg: 1, price: 95, originalPrice: 115, inStock: true, stockCount: 50 },
      { id: 'var-kh1-2k', size: '2 kg', weightInKg: 2, price: 185, originalPrice: 220, inStock: true, stockCount: 45 },
      { id: 'var-kh1-5k', size: '5 kg', weightInKg: 5, price: 440, originalPrice: 520, inStock: true, stockCount: 85 },
      { id: 'var-kh1-10k', size: '10 kg', weightInKg: 10, price: 849, originalPrice: 999, inStock: true, stockCount: 40 }
    ],
    nutrition: {
      energy: '348 kcal',
      protein: '14.5 g',
      carbs: '65.4 g',
      fat: '2.1 g',
      fiber: '14.2 g',
      iron: '5.2 mg',
      glycemicIndex: 'Low GI (42)'
    },
    benefits: [
      '100% Khapli Wheat with low glycemic index prevents sugar spikes',
      'Gentle water-soluble gluten structure — zero bloating or heaviness',
      'Rich in polyphenols and magnesium for metabolic health',
      'Traditional heirloom grain grown with zero chemical pesticides'
    ],
    certifications: ['Ancient Grain Seal', 'Low-GI Certified', 'Non-GMO Heritage Grain', 'FSSAI Approved']
  },
  {
    id: 'itsclear-high-protein',
    name: 'itsclear Premium High Protein Atta',
    subTitle: 'High Protein Whole Wheat Flour (36% Protein)',
    category: 'multigrain',
    tagline: '36% Protein • 36g Protein Per 100g • Whole Wheat, Soya & Peanut',
    description: 'itsclear Premium High Protein Whole Wheat Flour is crafted with exactly 36g protein per 100g, blending 60% whole wheat atta, 30% golden soya flour, and 10% roasted peanuts. Formulated to build stronger muscles, support immunity, deliver natural goodness, and promote heart health with zero added maida.',
    origin: 'Malwa & Indore, Madhya Pradesh',
    harvestSeason: 'Harvest 2026',
    labTestBatch: 'CLR-HP-9204',
    purityScore: 100,
    featured: true,
    rating: 4.9,
    reviewCount: 388,
    images: [
      '/images/products/protein-single.jpg',
      '/images/products/protein-bori-only.png',
      '/images/products/protein-attas-duo-bori-only.png'
    ],
    modelType: 'atta-pouch',
    themeColor: '#0b192c',
    secondaryColor: '#d97706',
    flourType: 'High Protein Whole Wheat Flour Blend',
    millingSpeed: 'Slow Cold Chakki Milling (<28°C)',
    rotiSoftnessScore: 9,
    composition: '60% Wheat Atta • 30% Soya Flour • 10% Peanut',
    packageBadges: [
      '36% Protein',
      '36g Protein Per 100g',
      '60% Wheat Atta • 30% Soya Flour • 10% Peanut',
      'Builds Stronger Muscles',
      'Supports Immunity',
      'Natural Goodness',
      'Good for Heart Health',
      '100% Whole Wheat',
      'Rich in Fiber',
      'No Added Maida',
      'Keeps You Energized Longer'
    ],
    variants: [
      { id: 'var-hp-1k', size: '1 kg', weightInKg: 1, price: 115, originalPrice: 140, inStock: true, stockCount: 65 },
      { id: 'var-hp-2k', size: '2 kg', weightInKg: 2, price: 220, originalPrice: 270, inStock: true, stockCount: 50 },
      { id: 'var-hp-5k', size: '5 kg', weightInKg: 5, price: 495, originalPrice: 599, inStock: true, stockCount: 120 },
      { id: 'var-hp-10k', size: '10 kg', weightInKg: 10, price: 960, originalPrice: 1150, inStock: true, stockCount: 80 }
    ],
    nutrition: {
      energy: '388 kcal',
      protein: '36.0 g',
      carbs: '48.5 g',
      fat: '6.8 g',
      fiber: '14.5 g',
      iron: '6.4 mg'
    },
    benefits: [
      '36g plant-based protein per 100g from wheat, soya, and roasted peanuts',
      'Builds stronger muscles and accelerates post-workout recovery',
      'Supports natural immunity and heart health with unsaturated plant fats',
      'Zero added maida, 100% unadulterated whole grain nourishment'
    ],
    certifications: ['High Protein Certified 36g', 'Zero Maida Verified', 'FSSAI License 10022026001248']
  },
  {
    id: 'itsclear-khapli-family-pack',
    name: 'itsclear Khapli Atta 4-Pack',
    subTitle: '1kg, 2kg, 5kg, 10kg Khapli Complete Range',
    category: 'khapli',
    tagline: '1kg, 2kg, 5kg & 10kg Lineup • 100% Pure Khapli Wheat',
    description: 'The complete size collection of itsclear Khapli Atta. Featuring 1kg & 2kg seal pouches for compact storage, and 5kg & 10kg family pouches with ergonomic carry handles. Milled from 100% Khapli wheat for daily family nutrition.',
    origin: 'Solapur & Sangli, Maharashtra',
    harvestSeason: 'Spring 2026',
    labTestBatch: 'CLR-KH-8841-B',
    purityScore: 100,
    featured: true,
    rating: 5.0,
    reviewCount: 274,
    images: [
      '/images/products/khapli-sizes-grid.jpg',
      '/images/products/khapli-sizes-grid-bori-only.png',
      '/images/products/khapli-sizes-badges-bori-only.png',
      '/images/products/khapli-bori-only.png'
    ],
    modelType: 'atta-kraft',
    themeColor: '#0b192c',
    secondaryColor: '#d97706',
    flourType: '100% Khapli Ancient Flour',
    millingSpeed: 'Cold Stone Ground (<27°C)',
    rotiSoftnessScore: 10,
    composition: '100% Khapli Wheat (All 4 Pack Sizes Available)',
    packageBadges: [
      '100% Khapli Wheat',
      '1kg • 2kg • 5kg • 10kg Range',
      'High Protein',
      'Zero Maida'
    ],
    variants: [
      { id: 'var-khg-1k', size: '1 kg', weightInKg: 1, price: 95, originalPrice: 115, inStock: true, stockCount: 60 },
      { id: 'var-khg-2k', size: '2 kg', weightInKg: 2, price: 185, originalPrice: 220, inStock: true, stockCount: 50 },
      { id: 'var-khg-5k', size: '5 kg', weightInKg: 5, price: 440, originalPrice: 520, inStock: true, stockCount: 90 },
      { id: 'var-khg-10k', size: '10 kg', weightInKg: 10, price: 849, originalPrice: 999, inStock: true, stockCount: 65 }
    ],
    nutrition: {
      energy: '348 kcal',
      protein: '14.5 g',
      carbs: '65.4 g',
      fat: '2.1 g',
      fiber: '14.2 g',
      iron: '5.2 mg'
    },
    benefits: [
      'Ideal for all family sizes — choose trial 1kg up to bulk 10kg sack',
      'Punched carry handles make 5kg and 10kg bags effortless to carry',
      'Zip-lock seals keep stoneground freshness locked in',
      'Guaranteed 100% pure Khapli wheat with zero blending'
    ],
    certifications: ['Ancient Grain Seal', 'Low-GI Certified', 'FSSAI Approved']
  },
  {
    id: 'itsclear-khapli-badges-edition',
    name: 'itsclear Khapli Atta (4 Health Pack)',
    subTitle: 'High Protein • Rich in Nutrition • Health Focused Range',
    category: 'khapli',
    tagline: 'High Protein • Rich in Nutrition • Good for Health • Natural Ingredients',
    description: 'Officially certified across four gold health benchmarks: High Protein, Rich in Nutrition, Good for Health, and 100% Natural Ingredients. Triple-checked under batch CLR-KH-8841 for zero chemical residues and 100% bran integrity.',
    origin: 'Solapur & Sangli, Maharashtra',
    harvestSeason: 'Spring 2026',
    labTestBatch: 'CLR-KH-8841-C',
    purityScore: 100,
    featured: true,
    rating: 4.9,
    reviewCount: 198,
    images: [
      '/images/products/khapli-sizes-badges.jpg',
      '/images/products/khapli-sizes-badges-bori-only.png',
      '/images/products/khapli-bori-only.png'
    ],
    modelType: 'atta-kraft',
    themeColor: '#0b192c',
    secondaryColor: '#d97706',
    flourType: '100% Ancient Emmer Khapli',
    millingSpeed: 'Cold Stone Ground (<27°C)',
    rotiSoftnessScore: 9,
    composition: '100% Ancient Emmer Khapli Wheat',
    packageBadges: [
      'High Protein',
      'Rich in Nutrition',
      'Good for Health',
      'Natural Ingredients',
      '100% Khapli Wheat'
    ],
    variants: [
      { id: 'var-khb-5k', size: '5 kg (Handle)', weightInKg: 5, price: 440, originalPrice: 520, inStock: true, stockCount: 45 },
      { id: 'var-khb-10k', size: '10 kg (Handle)', weightInKg: 10, price: 849, originalPrice: 999, inStock: true, stockCount: 80 },
      { id: 'var-khb-1k', size: '1 kg Pouch', weightInKg: 1, price: 95, originalPrice: 115, inStock: true, stockCount: 40 },
      { id: 'var-khb-2k', size: '2 kg Pouch', weightInKg: 2, price: 185, originalPrice: 220, inStock: true, stockCount: 35 }
    ],
    nutrition: {
      energy: '348 kcal',
      protein: '14.5 g',
      carbs: '65.4 g',
      fat: '2.1 g',
      fiber: '14.2 g',
      iron: '5.2 mg'
    },
    benefits: [
      'Validated for four core wellness pillars directly on package',
      'Helps maintain steady blood sugar throughout active workdays',
      'Traditional stone-ground process preserves grain germ & natural vitamins',
      '100% non-GMO ancient seeds direct from certified organic farmers'
    ],
    certifications: ['4-Badge Health Verified', 'Zero Pesticide Certified', 'FSSAI License']
  },
  {
    id: 'itsclear-protein-duo-packs',
    name: 'itsclear Premium High Protein Atta Duo (5kg & 10kg)',
    subTitle: '60% Wheat Atta • 30% Soya • 10% Peanut Duo',
    category: 'multigrain',
    tagline: '36g Protein Per 100g • Master Bags with Soya & Roasted Peanuts',
    description: 'The heavyweight protein champion: itsclear Premium Atta in 5kg and 10kg master bags with heavy-duty handles. Formulated with 60% stoneground wheat atta, 30% golden soya flour, and 10% roasted peanuts delivering 36g protein per 100g. Builds stronger muscles, supports immunity, and keeps you energized longer.',
    origin: 'Malwa & Indore, Madhya Pradesh',
    harvestSeason: 'Harvest 2026',
    labTestBatch: 'CLR-HP-9204-D',
    purityScore: 100,
    featured: true,
    rating: 5.0,
    reviewCount: 312,
    images: [
      '/images/products/protein-attas-duo-bori-only.png',
      '/images/products/protein-bori-only.png'
    ],
    modelType: 'atta-pouch',
    themeColor: '#0b192c',
    secondaryColor: '#d97706',
    flourType: 'High Protein Blend (Wheat, Soya, Peanut)',
    millingSpeed: 'Stone Chakki Milled (<28°C)',
    rotiSoftnessScore: 9,
    composition: '60% Wheat Atta • 30% Soya Flour • 10% Peanut',
    packageBadges: [
      '36g Protein Per 100g',
      'Builds Stronger Muscles',
      'Supports Immunity',
      'Natural Goodness',
      'Good for Heart Health',
      'No Added Maida',
      '100% Whole Wheat',
      'Rich in Fiber'
    ],
    variants: [
      { id: 'var-hpduo-5k', size: '5 kg Bag (Carry Handle)', weightInKg: 5, price: 495, originalPrice: 599, inStock: true, stockCount: 150 },
      { id: 'var-hpduo-10k', size: '10 kg Bag (Carry Handle)', weightInKg: 10, price: 960, originalPrice: 1150, inStock: true, stockCount: 95 }
    ],
    nutrition: {
      energy: '388 kcal',
      protein: '36.0 g',
      carbs: '48.5 g',
      fat: '6.8 g',
      fiber: '14.5 g',
      iron: '6.4 mg'
    },
    benefits: [
      'Dual pack options: 5kg for couples, 10kg for fitness enthusiasts',
      'Punched handle makes lifting and pouring effortless',
      'Natural plant proteins without whey powders or synthetic isolates',
      'Rotis roll out soft, aromatic, and keep energy high throughout the day'
    ],
    certifications: ['36g Protein Verified', 'Heart Health Tested', 'FSSAI Approved']
  },
  {
    id: 'itsclear-khapli-10k-handle',
    name: 'itsclear Khapli Atta 10 kg Family Pack with Handle',
    subTitle: '100% Khapli Wheat 10kg Carry Handle Bag',
    category: 'khapli',
    tagline: '10 kg Net Weight • Ergonomic Carry Handle • 100% Khapli Wheat',
    description: 'Our most popular monthly family pack of itsclear Khapli Atta. Delivers 10 kg of stoneground ancient emmer wheat in a premium standup pouch with a reinforced punched carry handle. Provides a month of low-GI, high-fiber, maida-free rotis for your entire family.',
    origin: 'Solapur & Sangli, Maharashtra',
    harvestSeason: 'Spring 2026',
    labTestBatch: 'CLR-KH-8841-10K',
    purityScore: 100,
    featured: true,
    rating: 4.9,
    reviewCount: 420,
    images: [
      '/images/products/khapli-sizes-badges-bori-only.png',
      '/images/products/khapli-bori-only.png'
    ],
    modelType: 'atta-kraft',
    themeColor: '#0b192c',
    secondaryColor: '#d97706',
    flourType: '100% Khapli Ancient Flour',
    millingSpeed: 'Cold Stone Ground (<27°C)',
    rotiSoftnessScore: 10,
    composition: '100% Ancient Emmer Khapli Wheat',
    packageBadges: [
      '10 kg Net Weight',
      'Punched Carry Handle',
      '100% Khapli Wheat',
      'High Protein',
      'Rich in Nutrition'
    ],
    variants: [
      { id: 'var-kh10-single', size: '10 kg Carry Handle Bag', weightInKg: 10, price: 849, originalPrice: 999, inStock: true, stockCount: 75 },
      { id: 'var-kh10-combo2', size: '20 kg (2x 10kg Bags)', weightInKg: 20, price: 1649, originalPrice: 1998, inStock: true, stockCount: 30 }
    ],
    nutrition: {
      energy: '348 kcal',
      protein: '14.5 g',
      carbs: '65.4 g',
      fat: '2.1 g',
      fiber: '14.2 g',
      iron: '5.2 mg'
    },
    benefits: [
      'Heavy-duty puncture-resistant bag with comfortable handle',
      'Zero maida, zero bleaching agents, 100% bran retention',
      'Guaranteed soft rotis that stay fresh in tiffins for over 14 hours',
      'Direct farm-to-mill freshness delivered in 24 hours'
    ],
    certifications: ['Ancient Grain Seal', 'FSSAI License 10022026001248']
  },
  {
    id: 'itsclear-mustard-oil-coldpressed',
    name: 'itsclear Cold Pressed Mustard Oil',
    subTitle: '100% Pure Kachi Ghani Sarson Ka Tel (Wooden Kohlu Pressed)',
    category: 'oil',
    tagline: 'Cold Pressed • Wooden Kohlu • High Pungency • Zero Argemone',
    description: 'itsclear Cold Pressed Mustard Oil is traditionally extracted from premium grade-1 black and yellow mustard seeds using slow wooden kohlus below 35°C. Rich in natural pungency, natural allyl isothiocyanate, and monounsaturated fatty acids (MUFA), this golden-amber oil adds authentic aroma and high smoke point goodness to everyday Indian cooking.',
    origin: 'Bharatpur & Alwar, Rajasthan',
    harvestSeason: 'Winter Harvest 2026',
    labTestBatch: 'CLR-OIL-7104',
    purityScore: 100,
    featured: true,
    rating: 4.9,
    reviewCount: 218,
    images: [
      '/images/products/mustard-oil-bottle.jpg',
      '/images/products/mustard-oil-pouch.jpg'
    ],
    modelType: 'oil-bottle',
    themeColor: '#0c1523',
    secondaryColor: '#ea580c',
    extractionMethod: 'Wooden Kohlu Cold Pressed (<35°C)',
    seedVariety: 'Single-Origin Rajasthan Black Mustard Seeds',
    smokePoint: '250°C (Ideal for High-Heat Indian Cooking)',
    storageInstructions: 'Store in a cool, dry place away from direct sunlight',
    packageBadges: [
      '100% Cold Pressed',
      'Wooden Kohlu',
      'Natural Pungency',
      'Zero Argemone',
      'Unrefined & Unfiltered'
    ],
    variants: [
      { id: 'oil-500ml-btl', size: '500 ml (Glass Bottle)', weightInKg: 0.5, volumeInMl: 500, price: 145, originalPrice: 175, inStock: true, stockCount: 80 },
      { id: 'oil-1l-pouch', size: '1 Litre (Pouch)', weightInKg: 1, volumeInMl: 1000, price: 245, originalPrice: 290, inStock: true, stockCount: 120 },
      { id: 'oil-1l-btl', size: '1 Litre (Glass Bottle)', weightInKg: 1, volumeInMl: 1000, price: 275, originalPrice: 320, inStock: true, stockCount: 60 },
      { id: 'oil-5l-can', size: '5 Litre (Kitchen Tin)', weightInKg: 5, volumeInMl: 5000, price: 1290, originalPrice: 1499, inStock: true, stockCount: 35 }
    ],
    nutrition: {
      energy: '884 kcal',
      protein: '0 g',
      carbs: '0 g',
      fat: '100 g',
      mufa: '60 g',
      pufa: '21 g',
      omega3: '10 g'
    },
    benefits: [
      'Slow wooden kohlu cold pressing preserves natural volatile pungency',
      'High smoke point (250°C) perfect for deep frying, tadka and pickling',
      'Rich in heart-healthy MUFA and balanced Omega-3 to Omega-6 ratio',
      '100% single-origin mustard seeds with zero argemone or chemical bleaching'
    ],
    certifications: ['Kachi Ghani Cold-Pressed Certified', 'Zero Argemone Tested', 'FSSAI Grade-1', 'Non-GMO Seeds'],
    isActive: true
  },
  {
    id: 'itsclear-desi-ghee-bilona',
    name: 'itsclear Traditional Desi Ghee',
    subTitle: '100% Pure Danedaar Cow Desi Ghee (Traditional Bilona Churned)',
    category: 'ghee',
    tagline: 'Traditional Bilona • Curd Churned • Danedaar Texture • Rich Golden Aroma',
    description: 'itsclear Traditional Desi Ghee is prepared using the revered Vedic Bilona method: fresh A2 whole milk is cultured into curd, slowly churned with wooden bilonas, and hand-simmered on low flame. The result is pure, aromatic, golden danedaar ghee rich in butyric acid and fat-soluble vitamins (A, D, E, K), with zero preservatives or vegetable oils.',
    origin: 'Mathura & Braj Region, Uttar Pradesh',
    harvestSeason: 'Fresh Farm Batch 2026',
    labTestBatch: 'CLR-GHEE-4819',
    purityScore: 100,
    featured: true,
    rating: 5.0,
    reviewCount: 176,
    images: [
      '/images/products/desi-ghee-jar.jpg',
      '/images/products/desi-ghee-pouch.jpg'
    ],
    modelType: 'ghee-jar',
    themeColor: '#0c1523',
    secondaryColor: '#f59e0b',
    churningMethod: 'Traditional Two-Way Wooden Bilona Curd Churning',
    gheeTexture: 'Aromatic Golden Danedaar Granules',
    storageInstructions: 'Store in a dry container at room temperature. Do not refrigerate.',
    packageBadges: [
      'Bilona Curd Churned',
      'Golden Danedaar',
      'Zero Preservatives',
      '100% Pure Cow Ghee',
      'A2 Whole Milk Cultured'
    ],
    variants: [
      { id: 'ghee-500ml-jar', size: '500 ml (Glass Jar)', weightInKg: 0.5, volumeInMl: 500, price: 549, originalPrice: 649, inStock: true, stockCount: 75 },
      { id: 'ghee-1l-pouch', size: '1 Litre (Pouch)', weightInKg: 1, volumeInMl: 1000, price: 980, originalPrice: 1150, inStock: true, stockCount: 90 },
      { id: 'ghee-1l-jar', size: '1 Litre (Glass Jar)', weightInKg: 1, volumeInMl: 1000, price: 1049, originalPrice: 1250, inStock: true, stockCount: 50 }
    ],
    nutrition: {
      energy: '897 kcal',
      protein: '0 g',
      carbs: '0 g',
      fat: '99.7 g',
      saturatedFat: '65 g',
      cholesterol: '190 mg',
      vitaminA: '300 mcg'
    },
    benefits: [
      'Cultured curd bilona method makes ghee naturally lactose & casein free',
      'High content of butyric acid supports healthy gut lining & digestion',
      'Rich golden danedaar texture with intoxicating traditional aroma',
      'Zero palm oil, zero vanaspati, and zero synthetic coloring agents'
    ],
    certifications: ['Traditional Bilona Certified', 'Pure Milk Fat 99.7%', 'FSSAI Approved', 'Zero Adulteration Verified'],
    isActive: true
  },
  {
    id: 'itsclear-kitchen-combo-trio',
    name: 'itsclear Kitchen Essentials Trio',
    subTitle: '5kg Khapli Atta + 1L Mustard Oil + 500ml Desi Ghee',
    category: 'combos',
    tagline: 'Stoneground Atta + Cold-Pressed Oil + Bilona Desi Ghee (Save ₹215)',
    description: 'The ultimate daily Indian kitchen staples box. Contains 5kg stoneground Khapli Wheat Atta (for soft, low-GI rotis), 1 Litre wooden kohlu cold-pressed Mustard Oil (for flavorful cooking), and 500ml traditional Bilona Desi Ghee (golden danedaar). Farm fresh, pure and unadulterated.',
    origin: 'Maharashtra, Rajasthan & Uttar Pradesh',
    harvestSeason: 'Harvest 2026',
    labTestBatch: 'CLR-CMB-1092',
    purityScore: 100,
    featured: true,
    rating: 5.0,
    reviewCount: 88,
    images: [
      '/images/products/khapli-sizes-grid.jpg',
      '/images/products/mustard-oil-bottle.jpg',
      '/images/products/desi-ghee-jar.jpg'
    ],
    modelType: 'atta-sack',
    themeColor: '#0c1523',
    secondaryColor: '#ea580c',
    comboItems: [
      '1 × 5kg itsclear Khapli Wheat Atta (Bori)',
      '1 × 1 Litre itsclear Cold-Pressed Mustard Oil',
      '1 × 500ml itsclear Traditional Bilona Desi Ghee (Glass Jar)'
    ],
    packageBadges: [
      'Kitchen Trio Combo',
      'Save ₹215',
      '100% Natural Staples',
      'Free EV Express Delivery'
    ],
    variants: [
      { id: 'var-cmb-trio', size: 'Family Trio Pack', weightInKg: 6.5, price: 1199, originalPrice: 1414, inStock: true, stockCount: 40 }
    ],
    nutrition: {
      energy: '480 kcal avg',
      protein: '16.5 g',
      carbs: '55.0 g',
      fat: '18.0 g',
      fiber: '12.0 g'
    },
    benefits: [
      'Complete daily grocery essentials in one convenient box',
      'Saves ₹215 compared to individual item prices',
      'Freshly packed directly from single-origin certified farms',
      'Priority 2-hour EV express delivery right to your kitchen'
    ],
    certifications: ['Triple Lab Certified Batch', 'Zero Maida & Zero Adulteration', 'FSSAI Approved'],
    isActive: true
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'CLEAR50',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 499,
    description: 'Get 10% OFF on all fresh itsclear stoneground atta orders above ₹499'
  },
  {
    code: 'FIRSTCHAKKI',
    discountType: 'fixed',
    discountValue: 50,
    minOrderValue: 299,
    description: 'Flat ₹50 OFF on your first fresh chakki order above ₹299'
  },
  {
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 49,
    minOrderValue: 199,
    description: 'Free Express Delivery on orders above ₹199'
  },
  {
    code: 'PURITY100',
    discountType: 'fixed',
    discountValue: 100,
    minOrderValue: 799,
    description: 'Flat ₹100 instant discount on family atta sacks above ₹799'
  },
  {
    code: 'KHAPLIVIP',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 999,
    description: '15% VIP discount on monthly orders above ₹999'
  },
  {
    code: 'PUREGRAIN',
    discountType: 'fixed',
    discountValue: 75,
    minOrderValue: 599,
    description: 'Flat ₹75 instant discount on pure stoneground atta orders above ₹599'
  },
  {
    code: 'PROTEINMAX',
    discountType: 'percentage',
    discountValue: 12,
    minOrderValue: 699,
    description: '12% OFF on itsclear 36% Protein Atta bags above ₹699'
  }
];

export const SAMPLE_REVIEWS: UserReview[] = [
  {
    id: 'rev-01',
    productId: 'itsclear-khapli-ancient',
    userName: 'Rajesh Sharma',
    userCity: 'Gomti Nagar, Lucknow',
    rating: 5,
    date: '2026-10-24',
    comment: 'The Khapli Atta is incredible! My blood glucose levels have stayed perfectly stable for the past 3 weeks. The rotis are super soft, and the carry handle on the 5kg pack is very convenient.',
    verifiedPurchase: true
  },
  {
    id: 'rev-02',
    productId: 'itsclear-high-protein',
    userName: 'Vikram Malhotra',
    userCity: 'Hazratganj, Lucknow',
    rating: 5,
    date: '2026-10-22',
    comment: '36g protein per 100g is genuinely phenomenal for whole wheat atta. The addition of soya flour and roasted peanuts gives the rotis a wonderful nutty aroma. Highly recommended for fitness enthusiasts!',
    verifiedPurchase: true
  },
  {
    id: 'rev-03',
    productId: 'itsclear-khapli-family-pack',
    userName: 'Sunita Verma',
    userCity: 'Indira Nagar, Lucknow',
    rating: 5,
    date: '2026-10-18',
    comment: 'Ordered the 10kg Khapli pack. The packaging is exactly as shown in the photos — clean navy handle, thick pouch, zero moisture. Rotis stay soft all day in lunchboxes!',
    verifiedPurchase: true
  }
];
