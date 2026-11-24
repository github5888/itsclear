import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { api } from '../../../services/api';
import { HeroBannerSlide, HomepageSectionConfig } from '../../../types';
import {
  FileText,
  Sparkles,
  Plus,
  Trash2,
  Save,
  Upload,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Layers,
  CheckCircle2,
  X,
  ExternalLink,
  Loader2
} from 'lucide-react';

export const AdminContentView: React.FC = () => {
  const { notify } = useStore();
  const [activeTab, setActiveTab] = useState<'hero' | 'sections' | 'announcement'>('hero');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Hero Banners State
  const [heroBanners, setHeroBanners] = useState<HeroBannerSlide[]>([]);

  // 2. Homepage Sections State
  const [sections, setSections] = useState<HomepageSectionConfig[]>([]);

  // 3. Announcement Bar State
  const [announcement, setAnnouncement] = useState({
    message: 'Fresh Cold Chakki Delivery in Lucknow • Free Shipping ≥ ₹499 • 100% Pure, Cold-Processed & Unadulterated',
    couponBadge: 'Use code CLEAR50 for 10% OFF',
    isVisible: true
  });

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const [heroRes, sectionsRes, annRes] = await Promise.all([
        api.getContent('hero_banners').catch(() => null),
        api.getContent('homepage_sections').catch(() => null),
        api.getContent('announcement_bar').catch(() => null)
      ]);

      if (heroRes && Array.isArray(heroRes.data)) setHeroBanners(heroRes.data);
      if (sectionsRes && Array.isArray(sectionsRes.data)) setSections(sectionsRes.data);
      if (annRes && annRes.data) setAnnouncement(annRes.data);
    } catch (err: any) {
      notify('Content Load Error', err.message || 'Could not fetch CMS data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleSaveHeroBanners = async () => {
    setIsSaving(true);
    try {
      await api.updateContent('hero_banners', heroBanners);
      notify('CMS Updated', 'Hero banner slides saved successfully.', 'success');
    } catch (err: any) {
      notify('Save Failed', err.message || 'Could not save hero banners.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSections = async () => {
    setIsSaving(true);
    try {
      await api.updateContent('homepage_sections', sections);
      notify('CMS Updated', 'Homepage section arrangement saved.', 'success');
    } catch (err: any) {
      notify('Save Failed', err.message || 'Could not save section arrangement.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAnnouncement = async () => {
    setIsSaving(true);
    try {
      await api.updateContent('announcement_bar', announcement);
      notify('CMS Updated', 'Header announcement strip saved.', 'success');
    } catch (err: any) {
      notify('Save Failed', err.message || 'Could not save announcement bar.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddHeroSlide = () => {
    const newSlide: HeroBannerSlide = {
      id: 'banner-' + Date.now().toString(36),
      badge: 'NATURAL ESSENTIALS',
      headline: 'Pure Cold-Processed Food Staples',
      subtitle: 'Cold stoneground atta, wooden kohlu mustard oil & Vedic bilona desi ghee.',
      primaryCtaText: 'Shop Collection',
      primaryCtaLink: '/shop',
      imageUrl: '/images/products/khapli-single.jpg',
      isActive: true
    };
    setHeroBanners(prev => [...prev, newSlide]);
  };

  const handleRemoveHeroSlide = (idx: number) => {
    setHeroBanners(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMoveHeroSlide = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= heroBanners.length) return;
    const copy = [...heroBanners];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setHeroBanners(copy);
  };

  const handleToggleSectionVisibility = (id: string) => {
    setSections(prev =>
      prev.map(s => (s.id === id ? { ...s, isVisible: !s.isVisible } : s))
    );
  };

  const handleMoveSection = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const copy = [...sections];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setSections(copy);
  };

  const handleImageUploadForSlide = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await api.uploadImage(file);
      if (res && res.url) {
        setHeroBanners(prev =>
          prev.map((b, i) => (i === idx ? { ...b, imageUrl: res.url } : b))
        );
        notify('Image Uploaded', 'Slide visual asset updated.', 'success');
      }
    } catch (err: any) {
      notify('Upload Failed', err.message || 'Could not upload slide image.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4 text-orange-500" />
            <span>Storefront Visual CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Website Content Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Hero banners, arrange homepage sections, and update announcement promotions
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CMS TABS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            activeTab === 'hero' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Hero Carousel Banners ({heroBanners.length})
        </button>
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            activeTab === 'sections' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Homepage Sections Arrangement
        </button>
        <button
          onClick={() => setActiveTab('announcement')}
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            activeTab === 'announcement' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Header Announcement Bar
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. TAB 1: HERO CAROUSEL BANNERS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900">Homepage Hero Carousel Slides</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddHeroSlide}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slide</span>
              </button>
              <button
                onClick={handleSaveHeroBanners}
                disabled={isSaving}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Banners'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {heroBanners.map((slide, idx) => (
              <div key={slide.id || idx} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-slate-900 text-xs">Slide #{idx + 1}</span>
                    <span className="font-mono text-[10px] text-slate-400">({slide.id})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {idx > 0 && (
                      <button
                        onClick={() => handleMoveHeroSlide(idx, 'up')}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {idx < heroBanners.length - 1 && (
                      <button
                        onClick={() => handleMoveHeroSlide(idx, 'down')}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveHeroSlide(idx)}
                      className="p-1 rounded-md text-rose-500 hover:bg-rose-50"
                      title="Remove Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Headline Text *</label>
                    <input
                      type="text"
                      value={slide.headline}
                      onChange={e => {
                        const val = e.target.value;
                        setHeroBanners(prev => prev.map((b, i) => i === idx ? { ...b, headline: val } : b));
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={slide.badge || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setHeroBanners(prev => prev.map((b, i) => i === idx ? { ...b, badge: val } : b));
                      }}
                      placeholder="e.g. NATURAL FOOD ESSENTIALS"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block font-bold text-slate-700 mb-1">Subtitle Prose</label>
                  <input
                    type="text"
                    value={slide.subtitle}
                    onChange={e => {
                      const val = e.target.value;
                      setHeroBanners(prev => prev.map((b, i) => i === idx ? { ...b, subtitle: val } : b));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs items-center">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Image URL / Visual</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={slide.imageUrl}
                        onChange={e => {
                          const val = e.target.value;
                          setHeroBanners(prev => prev.map((b, i) => i === idx ? { ...b, imageUrl: val } : b));
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                      />
                      <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold shrink-0 cursor-pointer flex items-center space-x-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input type="file" accept="image/*" onChange={e => handleImageUploadForSlide(idx, e)} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 pt-4 sm:pt-0">
                    <label className="flex items-center space-x-2 font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slide.isActive}
                        onChange={e => {
                          const val = e.target.checked;
                          setHeroBanners(prev => prev.map((b, i) => i === idx ? { ...b, isActive: val } : b));
                        }}
                        className="rounded-md text-orange-500"
                      />
                      <span>Slide Active</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. TAB 2: HOMEPAGE SECTIONS MANAGER
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">Homepage Component Structure</h3>
              <p className="text-[11px] text-slate-500">Show/hide and reorder sections displayed on the customer homepage</p>
            </div>
            <button
              onClick={handleSaveSections}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Arrangement'}</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs divide-y divide-slate-100">
            {sections.map((section, idx) => (
              <div key={section.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-slate-400 font-bold">#{idx + 1}</span>
                  <div>
                    <span className="font-bold text-slate-900 block">{section.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">id: {section.id}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleToggleSectionVisibility(section.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                      section.isVisible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {section.isVisible ? 'Visible' : 'Hidden'}
                  </button>

                  <div className="flex items-center space-x-1">
                    {idx > 0 && (
                      <button
                        onClick={() => handleMoveSection(idx, 'up')}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {idx < sections.length - 1 && (
                      <button
                        onClick={() => handleMoveSection(idx, 'down')}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. TAB 3: HEADER ANNOUNCEMENT BAR
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'announcement' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 max-w-2xl">
          <div>
            <h3 className="text-sm font-black text-slate-900">Header Announcement Strip</h3>
            <p className="text-[11px] text-slate-500">The scrolling or fixed promo message displayed at the very top of every page</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Announcement Message *</label>
              <textarea
                rows={2}
                value={announcement.message}
                onChange={e => setAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Promotional Coupon Badge Text</label>
              <input
                type="text"
                value={announcement.couponBadge}
                onChange={e => setAnnouncement(prev => ({ ...prev, couponBadge: e.target.value }))}
                placeholder="e.g. Use code CLEAR50 for 10% OFF"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              />
            </div>

            <label className="flex items-center space-x-2 font-bold text-slate-700 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={announcement.isVisible}
                onChange={e => setAnnouncement(prev => ({ ...prev, isVisible: e.target.checked }))}
                className="rounded-md text-orange-500"
              />
              <span>Announcement Bar Visible</span>
            </label>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSaveAnnouncement}
                disabled={isSaving}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Announcement'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
