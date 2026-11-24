const express = require('express');
const router = express.Router();
const { Category, Product } = require('../models');
const { requireAdmin } = require('../middleware/auth');

function formatDoc(doc) {
  if (!doc) return null;
  return typeof doc.toObject === 'function' ? doc.toObject() : doc;
}

// 1. GET PUBLIC ACTIVE CATEGORIES (Sorted by sortOrder)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    res.json(categories.map(formatDoc));
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// 2. GET ALL CATEGORIES FOR ADMIN (Includes inactive, with product count)
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 });
    const formatted = await Promise.all(
      categories.map(async (cat) => {
        const item = formatDoc(cat);
        const productCount = await Product.countDocuments({
          $or: [{ category: cat.slug }, { categoryId: cat.id }]
        });
        return { ...item, productCount };
      })
    );
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching admin categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// 3. GET SINGLE CATEGORY BY SLUG OR ID
router.get('/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const category = await Category.findOne({
      $or: [{ slug: slugOrId }, { id: slugOrId }]
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(formatDoc(category));
  } catch (err) {
    console.error('Error fetching category:', err);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// 4. CREATE NEW CATEGORY (Admin Only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      imageUrl,
      icon,
      sortOrder,
      isActive,
      eligibleForSubscription,
      attributeSchema,
      seo
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const existing = await Category.findOne({ slug: cleanSlug });
    if (existing) {
      return res.status(400).json({ error: `Category with slug "${cleanSlug}" already exists` });
    }

    const id = 'cat-' + cleanSlug + '-' + Date.now().toString(36).slice(2, 6);

    const created = await Category.create({
      id,
      slug: cleanSlug,
      name: name.trim(),
      description: description || '',
      imageUrl: imageUrl || '',
      icon: icon || 'Package',
      sortOrder: Number(sortOrder || 0),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      eligibleForSubscription: eligibleForSubscription !== undefined ? Boolean(eligibleForSubscription) : true,
      attributeSchema: Array.isArray(attributeSchema) ? attributeSchema : [],
      seo: seo || { title: '', description: '' }
    });

    res.status(201).json(formatDoc(created));
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Failed to create category: ' + err.message });
  }
});

// 5. UPDATE CATEGORY (Admin Only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Category.findOne({ $or: [{ id }, { slug: id }] });
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updates = { ...req.body };
    delete updates.id; // Preserve primary ID
    if (updates.slug) {
      updates.slug = updates.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const updated = await Category.findOneAndUpdate(
      { _id: existing._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json(formatDoc(updated));
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Failed to update category: ' + err.message });
  }
});

// 6. REORDER CATEGORIES BATCH (Admin Only)
router.patch('/reorder', requireAdmin, async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, sortOrder }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    await Promise.all(
      items.map(item =>
        Category.findOneAndUpdate(
          { $or: [{ id: item.id }, { slug: item.id }] },
          { $set: { sortOrder: Number(item.sortOrder) } }
        )
      )
    );

    const categories = await Category.find().sort({ sortOrder: 1 });
    res.json(categories.map(formatDoc));
  } catch (err) {
    console.error('Error reordering categories:', err);
    res.status(500).json({ error: 'Failed to reorder categories' });
  }
});

// 7. DELETE CATEGORY (Admin Only - Safe Check)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await Category.findOne({ $or: [{ id }, { slug: id }] });
    if (!cat) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Safety check: Do not delete if products are assigned
    const assignedProducts = await Product.countDocuments({
      $or: [{ category: cat.slug }, { categoryId: cat.id }]
    });

    if (assignedProducts > 0) {
      return res.status(409).json({
        error: `Cannot delete category "${cat.name}". It is assigned to ${assignedProducts} product(s). Please reassign or deactivate it instead.`
      });
    }

    await Category.deleteOne({ _id: cat._id });
    res.json({ success: true, message: `Category "${cat.name}" deleted successfully.` });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
