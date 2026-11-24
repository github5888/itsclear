module.exports = {
  initialProducts: [
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
        { id: 'var-kh1-1k', size: '1 kg Net Weight', weightInKg: 1, price: 95, originalPrice: 115, inStock: true, stockCount: 50 },
        { id: 'var-kh1-2k', size: '2 kg Net Weight', weightInKg: 2, price: 185, originalPrice: 220, inStock: true, stockCount: 45 },
        { id: 'var-kh1-5k', size: '5 kg Net Weight (Carry Handle)', weightInKg: 5, price: 440, originalPrice: 520, inStock: true, stockCount: 85 },
        { id: 'var-kh1-10k', size: '10 kg Net Weight (Carry Handle)', weightInKg: 10, price: 849, originalPrice: 999, inStock: true, stockCount: 40 }
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
      reviewCount: 298,
      images: [
        '/images/products/protein-single.jpg',
        '/images/products/protein-bori-only.png',
        '/images/products/protein-attas-duo-bori-only.png'
      ],
      modelType: 'atta-sack',
      themeColor: '#1c1917',
      secondaryColor: '#f59e0b',
      flourType: '60% Whole Wheat + 30% Soya + 10% Peanut',
      millingSpeed: 'Precision Emery Stone Milling (<28°C)',
      rotiSoftnessScore: 9,
      composition: '60% Wheat Atta • 30% Soya Flour • 10% Peanut',
      packageBadges: [
        '36% Protein',
        'Stronger Muscles',
        'Immunity Support',
        'Natural Goodness',
        'Promotes Heart Health'
      ],
      variants: [
        { id: 'var-hp-1k', size: '1 kg Trial Pouch', weightInKg: 1, price: 110, originalPrice: 130, inStock: true, stockCount: 60 },
        { id: 'var-hp-2k', size: '2 kg Kitchen Pack', weightInKg: 2, price: 210, originalPrice: 250, inStock: true, stockCount: 50 },
        { id: 'var-hp-5k', size: '5 kg Power Sack', weightInKg: 5, price: 495, originalPrice: 599, inStock: true, stockCount: 120 },
        { id: 'var-hp-10k', size: '10 kg Family Sack', weightInKg: 10, price: 950, originalPrice: 1150, inStock: true, stockCount: 35 }
      ],
      nutrition: {
        energy: '372 kcal',
        protein: '36.0 g',
        carbs: '48.2 g',
        fat: '5.8 g',
        fiber: '12.4 g',
        iron: '6.4 mg',
        glycemicIndex: 'Medium-Low GI (48)'
      },
      benefits: [
        'Clinically measured 36g plant protein per 100g for active muscle recovery',
        'Roasted peanut meal delivers natural heart-healthy mono-unsaturated lipids',
        'De-fatted soya provides rich essential amino acid profile without digestive load',
        'Whole grain wheat base retains natural bran fiber for steady digestive fullness'
      ],
      certifications: ['High-Protein Certified', 'FSSAI Approved Lab Batch', 'Zero Maida Guarantee', 'Zero Chemical Bleach']
    },
    {
      id: 'itsclear-khapli-family-pack',
      name: 'itsclear Khapli Atta (Family Pack)',
      subTitle: '100% Ancient Khapli Wheat — Available in 1kg, 2kg, 5kg, 10kg',
      category: 'khapli',
      tagline: 'Ancient Grain • Pure Stoneground • 4 Family Size Variants',
      description: 'The authentic itsclear Khapli Atta range as showcased across all size variants. Stoneground under 27°C on emery stones. Naturally unhybridized grain from Sangli and Solapur farmers.',
      origin: 'Solapur & Sangli, Maharashtra',
      harvestSeason: 'Spring 2026',
      labTestBatch: 'CLR-KH-8842',
      purityScore: 100,
      featured: true,
      rating: 4.9,
      reviewCount: 184,
      images: [
        '/images/products/khapli-sizes-grid.jpg',
        '/images/products/khapli-sizes-grid-bori-only.png',
        '/images/products/khapli-sizes-badges-bori-only.png',
        '/images/products/khapli-bori-only.png'
      ],
      modelType: 'atta-kraft',
      themeColor: '#0b192c',
      secondaryColor: '#d97706',
      flourType: '100% Ancient Emmer Khapli Grain',
      millingSpeed: 'Cold Stone Ground (<27°C)',
      rotiSoftnessScore: 10,
      composition: '100% Pure Khapli Grain',
      packageBadges: [
        '100% Khapli Wheat',
        'High Protein',
        'Rich in Nutrition',
        'Natural Ingredients'
      ],
      variants: [
        { id: 'var-khg-1k', size: '1 kg Pack', weightInKg: 1, price: 95, originalPrice: 115, inStock: true, stockCount: 80 },
        { id: 'var-khg-2k', size: '2 kg Pack', weightInKg: 2, price: 185, originalPrice: 220, inStock: true, stockCount: 65 },
        { id: 'var-khg-5k', size: '5 kg Carry Bag', weightInKg: 5, price: 440, originalPrice: 520, inStock: true, stockCount: 90 },
        { id: 'var-khg-10k', size: '10 kg Master Sack', weightInKg: 10, price: 849, originalPrice: 999, inStock: true, stockCount: 45 }
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
        'All 4 pack sizes milled fresh to order',
        'Low glycemic index ideal for senior citizens and sugar management',
        'Zero chemical bleach or synthetic preservatives'
      ],
      certifications: ['Ancient Grain Seal', 'FSSAI Approved']
    },
    {
      id: 'itsclear-khapli-badges-edition',
      name: 'itsclear Khapli Atta (Certified Pure Edition)',
      subTitle: 'Five-Point Certified Ancient Wheat Flour',
      category: 'khapli',
      tagline: 'High Protein • Rich in Nutrition • Good for Health • Natural Ingredients',
      description: 'Our certified edition itsclear Khapli flour highlighting all five health pillars: 100% Khapli Wheat, High Protein, Rich in Nutrition, Good for Health, and Natural Ingredients.',
      origin: 'Sangli, Maharashtra',
      harvestSeason: 'Spring 2026',
      labTestBatch: 'CLR-KH-8845',
      purityScore: 100,
      featured: false,
      rating: 5.0,
      reviewCount: 96,
      images: [
        '/images/products/khapli-sizes-badges-bori-only.png',
        '/images/products/khapli-bori-only.png'
      ],
      modelType: 'atta-kraft',
      themeColor: '#0b192c',
      secondaryColor: '#d97706',
      flourType: '100% Ancient Emmer Wheat',
      millingSpeed: 'Cold Stone Ground (<27°C)',
      rotiSoftnessScore: 10,
      composition: '100% Khapli Wheat',
      packageBadges: [
        '100% Khapli Wheat',
        'High Protein',
        'Rich in Nutrition',
        'Good for Health',
        'Natural Ingredients'
      ],
      variants: [
        { id: 'var-khb-5k', size: '5 kg Bag', weightInKg: 5, price: 440, originalPrice: 520, inStock: true, stockCount: 70 },
        { id: 'var-khb-10k', size: '10 kg Bag', weightInKg: 10, price: 849, originalPrice: 999, inStock: true, stockCount: 30 }
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
        'Verified ancient unhybridized grain batch',
        'Gentle on gut and zero heaviness after meals'
      ],
      certifications: ['FSSAI Approved', 'Non-GMO Heritage Seal']
    },
    {
      id: 'itsclear-protein-duo-packs',
      name: 'itsclear High Protein Atta (Twin Harvest Pack)',
      subTitle: 'Dual Milling Batch (Wheat + Soya + Roasted Peanut)',
      category: 'multigrain',
      tagline: '36% Protein • 36g Protein Per 100g • Duo Master Packs',
      description: 'Duo pack edition featuring our 36% protein formulation. Designed for fitness enthusiasts, weight training households, and families looking for complete natural plant-protein without synthetic whey powder.',
      origin: 'Malwa Plateau, Madhya Pradesh',
      harvestSeason: 'Harvest 2026',
      labTestBatch: 'CLR-HP-9208',
      purityScore: 100,
      featured: false,
      rating: 4.8,
      reviewCount: 142,
      images: [
        '/images/products/protein-attas-duo-bori-only.png',
        '/images/products/protein-bori-only.png'
      ],
      modelType: 'atta-sack',
      themeColor: '#1c1917',
      secondaryColor: '#f59e0b',
      flourType: '60% Whole Wheat, 30% Soya, 10% Peanut',
      millingSpeed: 'Slow Stone Ground (<28°C)',
      rotiSoftnessScore: 9,
      composition: 'Whole Wheat Atta 60%, Soya 30%, Peanut 10%',
      packageBadges: [
        '36% Protein',
        'Stronger Muscles',
        'Natural Goodness'
      ],
      variants: [
        { id: 'var-hpduo-5k', size: '5 kg Bag (Carry Handle)', weightInKg: 5, price: 495, originalPrice: 599, inStock: true, stockCount: 85 },
        { id: 'var-hpduo-10k', size: '10 kg (2x 5kg Duo)', weightInKg: 10, price: 950, originalPrice: 1150, inStock: true, stockCount: 40 }
      ],
      nutrition: {
        energy: '372 kcal',
        protein: '36.0 g',
        carbs: '48.2 g',
        fat: '5.8 g',
        fiber: '12.4 g',
        iron: '6.4 mg',
        glycemicIndex: 'Low GI'
      },
      benefits: [
        'Natural plant protein blend with zero isolate powders',
        'Ideal for athletic households and high protein diet plans'
      ],
      certifications: ['FSSAI Approved', 'Lab Bio-Assay Tested']
    },
    {
      id: 'itsclear-khapli-10k-handle',
      name: 'itsclear Khapli Atta 10 kg Master Carry Pack',
      subTitle: '100% Khapli Wheat 10kg Carry Handle Bag (Monthly Household Supply)',
      category: 'khapli',
      tagline: '10 kg Net Weight • Ergonomic Carry Handle • 100% Khapli Wheat',
      description: 'Our flagship 10kg household sack with built-in ergonomic carry handle. Milled slow on stone chakkis to provide a full monthly supply of authentic low-GI Khapli wheat for a family of 4-6 members.',
      origin: 'Solapur & Sangli, Maharashtra',
      harvestSeason: 'Spring 2026',
      labTestBatch: 'CLR-KH-8850',
      purityScore: 100,
      featured: true,
      rating: 5.0,
      reviewCount: 215,
      images: [
        '/images/products/khapli-bori-only.png',
        '/images/products/khapli-sizes-badges-bori-only.png'
      ],
      modelType: 'atta-kraft',
      themeColor: '#0b192c',
      secondaryColor: '#d97706',
      flourType: '100% Khapli Wheat (Emmer)',
      millingSpeed: 'Cold Stone Ground (<27°C)',
      rotiSoftnessScore: 10,
      composition: '100% Ancient Emmer Wheat',
      packageBadges: [
        '100% Khapli Wheat',
        'High Protein',
        'Rich in Nutrition',
        'Good for Health',
        'Natural Ingredients'
      ],
      variants: [
        { id: 'var-kh10-10k', size: '10 kg Carry Handle Bag', weightInKg: 10, price: 849, originalPrice: 999, inStock: true, stockCount: 75 },
        { id: 'var-kh10-20k', size: '20 kg (2x 10kg Bags)', weightInKg: 20, price: 1650, originalPrice: 1999, inStock: true, stockCount: 30 }
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
        'Ergonomic heavy-duty carry handle for easy kitchen storage',
        'Bags are airtight moisture-barrier sealed to preserve fresh stone milling aroma'
      ],
      certifications: ['Ancient Grain Seal', 'FSSAI Approved']
    }
  ],

  initialCoupons: [
    { code: 'CLEAR50', discountType: 'percentage', discountValue: 10, minOrderValue: 499, description: '10% OFF on all fresh stoneground orders above ₹499' },
    { code: 'FIRSTCHAKKI', discountType: 'flat', discountValue: 50, minOrderValue: 299, description: 'Flat ₹50 OFF on your first fresh chakki order above ₹299' },
    { code: 'FREESHIP', discountType: 'flat', discountValue: 49, minOrderValue: 199, description: 'Free Express Delivery on orders above ₹199' },
    { code: 'PURITY100', discountType: 'flat', discountValue: 100, minOrderValue: 799, description: 'Flat ₹100 OFF on family sacks above ₹799' },
    { code: 'KHAPLIVIP', discountType: 'percentage', discountValue: 15, minOrderValue: 999, description: '15% VIP discount on monthly orders above ₹999' },
    { code: 'PUREGRAIN', discountType: 'flat', discountValue: 75, minOrderValue: 599, description: 'Flat ₹75 OFF on pure stoneground atta orders above ₹599' },
    { code: 'PROTEINMAX', discountType: 'percentage', discountValue: 12, minOrderValue: 699, description: '12% OFF on High Protein Atta packs above ₹699' }
  ]
};

