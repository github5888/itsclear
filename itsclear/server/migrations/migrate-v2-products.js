const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/itsclear';

function generateSku(product, variant, index) {
  if (variant.sku && variant.sku.trim() !== '') {
    return variant.sku.toUpperCase().trim();
  }
  const cleanId = (product.id || 'prod')
    .replace(/^itsclear-/, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toUpperCase();
  const cleanSize = (variant.size || `VAR-${index + 1}`)
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
  return `CLR-${cleanId}-${cleanSize}`;
}

async function runMigration() {
  console.log('🔄 Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  const db = mongoose.connection.db;
  const productsCol = db.collection('products');

  const products = await productsCol.find({}).toArray();
  console.log(`📦 Found ${products.length} products to verify and migrate.`);

  let updatedCount = 0;

  for (const p of products) {
    const updates = {};
    let needsUpdate = false;

    // 1. Migrate Images to Gallery
    const existingImages = Array.isArray(p.images) ? p.images : [];
    let gallery = Array.isArray(p.gallery) ? p.gallery : [];

    if (gallery.length === 0 && existingImages.length > 0) {
      gallery = existingImages.map((imgUrl, idx) => ({
        id: `img-${Date.now().toString(36)}-${idx}`,
        url: imgUrl,
        alt: `${p.name} - View ${idx + 1}`,
        isPrimary: idx === 0,
        sortOrder: idx
      }));
      updates.gallery = gallery;
      needsUpdate = true;
    } else if (gallery.length > 0) {
      // Ensure at least one primary image exists
      const hasPrimary = gallery.some(g => g.isPrimary);
      if (!hasPrimary) {
        gallery[0].isPrimary = true;
        updates.gallery = gallery;
        needsUpdate = true;
      }
    }

    // Keep images array synchronized with gallery for full backward compatibility
    if (gallery.length > 0) {
      const sortedGallery = [...gallery].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      const syncImages = sortedGallery.map(g => g.url);
      if (JSON.stringify(syncImages) !== JSON.stringify(p.images)) {
        updates.images = syncImages;
        needsUpdate = true;
      }
    }

    // 2. Standardize Variants
    if (Array.isArray(p.variants)) {
      let variantsModified = false;
      const updatedVariants = p.variants.map((v, vIdx) => {
        const variantObj = { ...v };
        
        // Ensure unique variant ID
        if (!variantObj.id) {
          variantObj.id = `v-${(v.size || vIdx).toString().toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36)}-${vIdx}`;
          variantsModified = true;
        }

        // Standardize SKU
        const sku = generateSku(p, variantObj, vIdx);
        if (variantObj.sku !== sku) {
          variantObj.sku = sku;
          variantsModified = true;
        }

        // Initialize reserved stock
        if (variantObj.reservedStock === undefined) {
          variantObj.reservedStock = 0;
          variantsModified = true;
        }

        // Initialize low stock threshold
        if (variantObj.lowStockThreshold === undefined) {
          variantObj.lowStockThreshold = 15;
          variantsModified = true;
        }

        // Ensure stockCount and inStock are numbers & booleans
        const currentStock = Number(variantObj.stockCount !== undefined ? variantObj.stockCount : 50);
        if (variantObj.stockCount !== currentStock) {
          variantObj.stockCount = currentStock;
          variantsModified = true;
        }
        const isInStock = currentStock > 0;
        if (variantObj.inStock !== isInStock) {
          variantObj.inStock = isInStock;
          variantsModified = true;
        }

        // Unit field (kg, g, L, ml)
        if (!variantObj.unit) {
          const sizeStr = (variantObj.size || '').toLowerCase();
          if (sizeStr.includes('kg')) variantObj.unit = 'kg';
          else if (sizeStr.includes('g') && !sizeStr.includes('kg')) variantObj.unit = 'g';
          else if (sizeStr.includes('l') && !sizeStr.includes('ml')) variantObj.unit = 'L';
          else if (sizeStr.includes('ml')) variantObj.unit = 'ml';
          else variantObj.unit = 'pack';
          variantsModified = true;
        }

        return variantObj;
      });

      if (variantsModified) {
        updates.variants = updatedVariants;
        needsUpdate = true;
      }
    }

    // 3. Status and SEO fields
    if (!p.status) {
      updates.status = 'published';
      needsUpdate = true;
    }
    if (p.isActive === undefined) {
      updates.isActive = true;
      needsUpdate = true;
    }
    if (!p.seo || !p.seo.metaTitle) {
      updates.seo = {
        metaTitle: `${p.name} | itsclear 100% Pure & Unadulterated`,
        metaDescription: p.tagline || p.subTitle || `Buy authentic ${p.name} direct from certified single-origin farms. Fresh stoneground delivery in Lucknow.`,
        keywords: [p.category || 'grocery', 'itsclear', 'pure', 'unadulterated', p.name.toLowerCase()]
      };
      needsUpdate = true;
    }

    if (needsUpdate) {
      updates.updatedAt = new Date();
      await productsCol.updateOne({ _id: p._id }, { $set: updates });
      updatedCount++;
      console.log(`  ✓ Updated product [${p.id}]: ${p.name} (Gallery: ${gallery.length}, Variants: ${p.variants?.length})`);
    } else {
      console.log(`  • Product [${p.id}]: ${p.name} is already up to date.`);
    }
  }

  console.log(`\n🎉 Migration Complete! Successfully migrated ${updatedCount} of ${products.length} products.`);
  await mongoose.disconnect();
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
