const { Category } = require('../models');

const defaultCategories = [
  {
    id: 'cat-atta',
    slug: 'atta',
    name: 'Premium Stoneground Atta',
    description: '100% whole grain stoneground attas with intact germ and zero maida.',
    imageUrl: '/images/products/khapli-single.jpg',
    icon: 'Wheat',
    sortOrder: 1,
    isActive: true,
    eligibleForSubscription: true,
    attributeSchema: [
      { key: 'flourType', label: 'Flour Variety', type: 'text', placeholder: 'e.g. 100% Khapli Ancient Whole Wheat' },
      { key: 'millingSpeed', label: 'Milling Spec', type: 'text', placeholder: 'e.g. Cold Stone Ground (<28°C)' },
      { key: 'rotiSoftnessScore', label: 'Roti Softness Score (1-10)', type: 'number', placeholder: '10' },
      { key: 'composition', label: 'Grain Composition', type: 'text', placeholder: 'e.g. 100% Emmer Wheat' }
    ],
    seo: {
      title: 'Buy Cold Stoneground Atta Online | ItsClear',
      description: 'Explore unadulterated cold chakki fresh stoneground flours.'
    }
  },
  {
    id: 'cat-oil',
    slug: 'oil',
    name: 'Cold-Pressed Mustard Oil',
    description: 'Authentic yellow & black mustard oil pressed in traditional wooden kohlu.',
    imageUrl: '/images/products/mustard-oil-pouch.jpg',
    icon: 'Droplets',
    sortOrder: 2,
    isActive: true,
    eligibleForSubscription: true,
    attributeSchema: [
      { key: 'extractionMethod', label: 'Extraction Method', type: 'text', placeholder: 'e.g. Traditional Wooden Kohlu (Kachi Ghani)' },
      { key: 'seedVariety', label: 'Seed Variety', type: 'text', placeholder: 'e.g. Grade-1 Natural Mustard Seeds' },
      { key: 'smokePoint', label: 'Smoke Point', type: 'text', placeholder: 'e.g. High Smoke Point 250°C' }
    ],
    seo: {
      title: 'Kachi Ghani Mustard Oil | ItsClear',
      description: 'Pure cold-pressed mustard oil with pungent natural aroma and zero chemical processing.'
    }
  },
  {
    id: 'cat-ghee',
    slug: 'ghee',
    name: 'Desi A2 Bilona Ghee',
    description: 'Hand-churned curd bilona ghee packed in glass jars and zipper pouches.',
    imageUrl: '/images/products/desi-ghee-pouch.jpg',
    icon: 'Flame',
    sortOrder: 3,
    isActive: true,
    eligibleForSubscription: true,
    attributeSchema: [
      { key: 'churningMethod', label: 'Churning Method', type: 'text', placeholder: 'e.g. Traditional Vedic Bilona Churning from Curd' },
      { key: 'gheeTexture', label: 'Texture & Tone', type: 'text', placeholder: 'e.g. Golden Danedaar (Granular)' },
      { key: 'storageInstructions', label: 'Storage Instructions', type: 'text', placeholder: 'e.g. Store in cool, dry place away from sunlight' }
    ],
    seo: {
      title: 'Pure Desi Bilona Ghee | ItsClear',
      description: 'Vedic bilona desi ghee made from curd churning.'
    }
  },
  {
    id: 'cat-combos',
    slug: 'combos',
    name: 'Pantry Essentials & Combos',
    description: 'Curated natural food bundles combining fresh flour, oil, and ghee.',
    imageUrl: '/images/products/khapli-4pack.jpg',
    icon: 'Layers',
    sortOrder: 4,
    isActive: true,
    eligibleForSubscription: false,
    attributeSchema: [
      { key: 'comboItems', label: 'Combo Items (comma separated)', type: 'text', placeholder: '5kg Khapli Atta, 1L Mustard Oil, 500g Ghee' },
      { key: 'packageBadges', label: 'Promotional Badges', type: 'text', placeholder: 'Pantry Saver, Free Delivery' }
    ],
    seo: {
      title: 'Kitchen Grocery Combos | ItsClear',
      description: 'Handpicked pantry bundles for healthy households.'
    }
  }
];

async function seedCategoriesIfEmpty() {
  try {
    for (const cat of defaultCategories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        { $setOnInsert: cat },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.error('Error seeding default categories:', err.message);
  }
}

module.exports = { seedCategoriesIfEmpty, defaultCategories };
