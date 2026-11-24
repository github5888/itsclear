const express = require('express');
const router = express.Router();
const { Product, Order } = require('../models');
const { requireAdmin } = require('../middleware/auth');

// Helper to format product document to consistent JSON object
function formatProduct(p) {
  if (!p) return null;
  return typeof p.toObject === 'function' ? p.toObject() : p;
}

// 1. GET ALL PRODUCTS (Public: Active & Published)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {
      status: { $ne: 'archived' },
      isActive: { $ne: false }
    };

    if (category && category !== 'all') {
      filter.$or = [{ category }, { categoryId: category }];
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const products = await Product.find(filter).sort({ featured: -1, sortOrder: 1, rating: -1 });
    res.json(products.map(formatProduct));
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// 1B. GET ALL PRODUCTS FOR ADMIN (Includes Drafts & Archived)
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.$or = [{ category }, { categoryId: category }];
    }
    if (status && status !== 'all') {
      filter.status = status;
    }

    const products = await Product.find(filter).sort({ featured: -1, sortOrder: 1, createdAt: -1 });
    res.json(products.map(formatProduct));
  } catch (err) {
    console.error('Error fetching admin products:', err);
    res.status(500).json({ error: 'Failed to fetch admin products' });
  }
});

// 2. GET SINGLE PRODUCT BY ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(formatProduct(product));
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// 3. CREATE NEW PRODUCT (Admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const p = req.body;
    const id = p.id || 'itsclear-' + (p.name || 'grain').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30) + '-' + Date.now().toString(36);

    let gallery = Array.isArray(p.gallery) ? p.gallery : [];
    let images = Array.isArray(p.images) ? p.images : [];
    if (gallery.length === 0 && images.length > 0) {
      gallery = images.map((url, idx) => ({
        id: `img-${Date.now().toString(36)}-${idx}`,
        url,
        alt: `${p.name || 'Product'} view ${idx + 1}`,
        isPrimary: idx === 0,
        sortOrder: idx
      }));
    } else if (gallery.length > 0 && (!images || images.length === 0)) {
      const sorted = [...gallery].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      images = sorted.map(g => g.url);
    }

    const created = await Product.create({
      id,
      name: p.name || 'New itsclear Atta',
      subTitle: p.subTitle || '',
      category: p.category || 'atta',
      categoryId: p.categoryId || null,
      status: p.status || 'published',
      sortOrder: p.sortOrder !== undefined ? Number(p.sortOrder) : 0,
      relatedProductIds: Array.isArray(p.relatedProductIds) ? p.relatedProductIds : [],
      customAttributes: typeof p.customAttributes === 'object' && p.customAttributes !== null ? p.customAttributes : {},
      tagline: p.tagline || '',
      description: p.description || '',
      origin: p.origin || 'Sehore, Madhya Pradesh',
      harvestSeason: p.harvestSeason || 'Harvest 2026',
      labTestBatch: p.labTestBatch || 'CLR-' + Math.floor(1000 + Math.random() * 9000),
      purityScore: p.purityScore !== undefined ? p.purityScore : 100,
      featured: Boolean(p.featured),
      rating: p.rating || 5.0,
      reviewCount: p.reviewCount || 0,
      images,
      gallery,
      seo: typeof p.seo === 'object' && p.seo !== null ? p.seo : {
        metaTitle: `${p.name || 'Product'} | itsclear 100% Pure & Unadulterated`,
        metaDescription: p.tagline || p.subTitle || '',
        keywords: [p.category || 'grocery', 'itsclear', 'stoneground', 'chakki']
      },
      modelType: p.modelType || 'atta-kraft',
      themeColor: p.themeColor || '#0b192c',
      secondaryColor: p.secondaryColor || '#d97706',
      flourType: p.flourType || '',
      millingSpeed: p.millingSpeed || 'Cold Stone Ground (<27°C)',
      rotiSoftnessScore: p.rotiSoftnessScore !== undefined ? p.rotiSoftnessScore : 10,
      extractionMethod: p.extractionMethod || '',
      seedVariety: p.seedVariety || '',
      churningMethod: p.churningMethod || '',
      gheeTexture: p.gheeTexture || '',
      storageInstructions: p.storageInstructions || '',
      smokePoint: p.smokePoint || '',
      comboItems: Array.isArray(p.comboItems) ? p.comboItems : [],
      isActive: p.isActive !== undefined ? Boolean(p.isActive) : true,
      composition: p.composition || '',
      packageBadges: Array.isArray(p.packageBadges) ? p.packageBadges : [],
      variants: Array.isArray(p.variants) ? p.variants : [],
      nutrition: typeof p.nutrition === 'object' && p.nutrition !== null ? p.nutrition : {},
      benefits: Array.isArray(p.benefits) ? p.benefits : [],
      certifications: Array.isArray(p.certifications) ? p.certifications : []
    });

    res.status(201).json(formatProduct(created));
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// 4. UPDATE PRODUCT (Admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const p = req.body;

    const existing = await Product.findOne({ id });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let gallery = p.gallery !== undefined ? p.gallery : existing.gallery;
    let images = p.images !== undefined ? p.images : existing.images;
    if (p.gallery && (!p.images || p.images.length === 0)) {
      const sorted = [...gallery].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      images = sorted.map(g => g.url);
    }

    const updated = await Product.findOneAndUpdate(
      { id },
      {
        $set: {
          name: p.name !== undefined ? p.name : existing.name,
          subTitle: p.subTitle !== undefined ? p.subTitle : existing.subTitle,
          category: p.category !== undefined ? p.category : existing.category,
          categoryId: p.categoryId !== undefined ? p.categoryId : existing.categoryId,
          status: p.status !== undefined ? p.status : existing.status,
          sortOrder: p.sortOrder !== undefined ? Number(p.sortOrder) : existing.sortOrder,
          relatedProductIds: p.relatedProductIds !== undefined ? p.relatedProductIds : existing.relatedProductIds,
          customAttributes: p.customAttributes !== undefined ? p.customAttributes : existing.customAttributes,
          tagline: p.tagline !== undefined ? p.tagline : existing.tagline,
          description: p.description !== undefined ? p.description : existing.description,
          origin: p.origin !== undefined ? p.origin : existing.origin,
          harvestSeason: p.harvestSeason !== undefined ? p.harvestSeason : existing.harvestSeason,
          labTestBatch: p.labTestBatch !== undefined ? p.labTestBatch : existing.labTestBatch,
          purityScore: p.purityScore !== undefined ? p.purityScore : existing.purityScore,
          featured: p.featured !== undefined ? Boolean(p.featured) : existing.featured,
          rating: p.rating !== undefined ? p.rating : existing.rating,
          reviewCount: p.reviewCount !== undefined ? p.reviewCount : existing.reviewCount,
          images,
          gallery,
          seo: p.seo !== undefined ? p.seo : existing.seo,
          modelType: p.modelType !== undefined ? p.modelType : existing.modelType,
          themeColor: p.themeColor !== undefined ? p.themeColor : existing.themeColor,
          secondaryColor: p.secondaryColor !== undefined ? p.secondaryColor : existing.secondaryColor,
          flourType: p.flourType !== undefined ? p.flourType : existing.flourType,
          millingSpeed: p.millingSpeed !== undefined ? p.millingSpeed : existing.millingSpeed,
          rotiSoftnessScore: p.rotiSoftnessScore !== undefined ? p.rotiSoftnessScore : existing.rotiSoftnessScore,
          extractionMethod: p.extractionMethod !== undefined ? p.extractionMethod : existing.extractionMethod,
          seedVariety: p.seedVariety !== undefined ? p.seedVariety : existing.seedVariety,
          churningMethod: p.churningMethod !== undefined ? p.churningMethod : existing.churningMethod,
          gheeTexture: p.gheeTexture !== undefined ? p.gheeTexture : existing.gheeTexture,
          storageInstructions: p.storageInstructions !== undefined ? p.storageInstructions : existing.storageInstructions,
          smokePoint: p.smokePoint !== undefined ? p.smokePoint : existing.smokePoint,
          comboItems: p.comboItems !== undefined ? p.comboItems : existing.comboItems,
          isActive: p.isActive !== undefined ? Boolean(p.isActive) : existing.isActive,
          composition: p.composition !== undefined ? p.composition : existing.composition,
          packageBadges: p.packageBadges !== undefined ? p.packageBadges : existing.packageBadges,
          variants: p.variants !== undefined ? p.variants : existing.variants,
          nutrition: p.nutrition !== undefined ? p.nutrition : existing.nutrition,
          benefits: p.benefits !== undefined ? p.benefits : existing.benefits,
          certifications: p.certifications !== undefined ? p.certifications : existing.certifications,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    res.json(formatProduct(updated));
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// 4B. QUICK STATUS TOGGLE (Admin Only)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, isActive } = req.body;
    const update = { updatedAt: new Date() };
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      update.status = status;
    }
    if (isActive !== undefined) {
      update.isActive = Boolean(isActive);
    }

    const updated = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $set: update },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(formatProduct(updated));
  } catch (err) {
    console.error('Error toggling product status:', err);
    res.status(500).json({ error: 'Failed to update product status' });
  }
});

// 4C. DUPLICATE PRODUCT (Admin Only)
router.post('/:id/duplicate', requireAdmin, async (req, res) => {
  try {
    const existing = await Product.findOne({ id: req.params.id });
    if (!existing) {
      return res.status(404).json({ error: 'Product to duplicate not found' });
    }

    const doc = existing.toObject();
    delete doc._id;
    delete doc.__v;

    const timestamp = Date.now().toString(36);
    const newId = `itsclear-${(doc.name || 'product').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}-copy-${timestamp}`;
    
    // Duplicate variants with new SKUs & IDs
    const newVariants = (doc.variants || []).map((v, idx) => ({
      ...v,
      id: `v-${timestamp}-${idx}`,
      sku: `${v.sku || 'SKU'}-COPY-${timestamp}`.toUpperCase()
    }));

    const duplicated = await Product.create({
      ...doc,
      id: newId,
      name: `${doc.name} (Copy)`,
      status: 'draft',
      variants: newVariants,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json(formatProduct(duplicated));
  } catch (err) {
    console.error('Error duplicating product:', err);
    res.status(500).json({ error: 'Failed to duplicate product' });
  }
});

// 4D. BULK UPDATE PRODUCTS (Admin Only)
router.patch('/bulk/status', requireAdmin, async (req, res) => {
  try {
    const { productIds, status, category, isActive } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'productIds array is required' });
    }

    const updateFields = { updatedAt: new Date() };
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      updateFields.status = status;
    }
    if (category) {
      updateFields.category = category;
    }
    if (isActive !== undefined) {
      updateFields.isActive = Boolean(isActive);
    }

    const result = await Product.updateMany(
      { id: { $in: productIds } },
      { $set: updateFields }
    );

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (err) {
    console.error('Error in bulk product update:', err);
    res.status(500).json({ error: 'Failed to bulk update products' });
  }
});

// 5. DELETE PRODUCT WITH ORDER SAFETY CHECK (Admin Only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    // Safety check: Prevent deleting product if existing customer orders reference it
    const orderCount = await Order.countDocuments({
      $or: [
        { 'items.product.id': id },
        { 'items.productId': id }
      ]
    });

    if (orderCount > 0) {
      return res.status(400).json({
        error: `Cannot permanently delete product because ${orderCount} existing customer order(s) reference it. Please set the status to 'archived' instead to preserve customer order history.`,
        hasOrders: true,
        orderCount
      });
    }

    const deleted = await Product.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product permanently deleted', id });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
