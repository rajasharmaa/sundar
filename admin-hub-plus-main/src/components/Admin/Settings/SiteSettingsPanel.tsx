import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { settingsService } from '@/services/settingsService';
import { toast } from '@/hooks/use-toast';
import {
  Settings, Upload, Image as ImageIcon, Users, Globe,
  MapPin, Loader2, Save, RotateCcw
} from 'lucide-react';
import type { SiteSettings, BannerSettings } from '@/types';

export function SiteSettingsPanel() {
  const { settings: fetchedSettings, isLoading, refetch: refetchSettings } = useSiteSettings();
  const [settingsForm, setSettingsForm] = useState<SiteSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    if (fetchedSettings) {
      setSettingsForm(JSON.parse(JSON.stringify(fetchedSettings)));
    }
  }, [fetchedSettings]);

  const handleImageUpload = async (file: File, type: 'logo' | 'founderImage' | 'previewImage' | number | string) => {
    const fieldId = typeof type === 'number' ? `slide-${type}` : type;
    try {
      setUploadingField(fieldId);
      const formData = new FormData();
      formData.append('file', file);

      const res = await settingsService.upload(formData);
      if (res && res.success && res.url) {
        setSettingsForm(prev => {
          if (!prev) return null;
          const next = { ...prev };
          if (type === 'logo') {
            next.logo = res.url;
          } else if (type === 'founderImage') {
            next.founderImage = res.url;
          } else if (type === 'previewImage') {
            next.virtualTour.previewImage = res.url;
          } else if (type === 'manufacturingImage' || type === 'aboutUsBanner' || type === 'contactUsBanner' || type === 'productsBanner') {
            (next as any)[type] = res.url;
          } else if (typeof type === 'number') {
            next.shopPhotos = [...next.shopPhotos];
            next.shopPhotos[type] = {
              ...next.shopPhotos[type],
              image: res.url
            };
          } else if (typeof type === 'string' && type.startsWith('banner-')) {
            const index = parseInt(type.split('-')[1]);
            next.banners = [...(next.banners || [])];
            if (next.banners[index]) {
              next.banners[index].image = res.url;
            }
          }
          return next;
        });
        toast({
          title: 'Success',
          description: 'Image uploaded successfully.',
        });
      }
    } catch (err) {
      console.error('Failed to upload settings image:', err);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload image to storage.',
        variant: 'destructive'
      });
    } finally {
      setUploadingField(null);
    }
  };

  const handleSaveSettings = async () => {
    if (!settingsForm) return;
    try {
      setIsSaving(true);
      const res = await settingsService.update(settingsForm);
      if (res && res.success) {
        toast({
          title: 'Settings Saved',
          description: 'Site configurations updated successfully.',
        });
        refetchSettings();
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast({
        title: 'Error Saving Settings',
        description: 'Failed to update site configurations.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (fetchedSettings) {
      setSettingsForm(JSON.parse(JSON.stringify(fetchedSettings)));
      toast({
        title: 'Reset Completed',
        description: 'Reverted all unsaved modifications.',
      });
    }
  };

  if (isLoading || !settingsForm) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-green-600 animate-spin-slow" />
            Global Site Settings
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Dynamically configure images, virtual tour links, maps, and sliders across the website.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-green-600/20 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Brand Identity & Logo Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-green-600" />
              Brand Identity (Logo)
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl w-32 h-32 flex items-center justify-center overflow-hidden shrink-0 relative group">
                <img
                  src={settingsForm.logo || '/logo.png'}
                  alt="Logo Preview"
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>

              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Corporate Logo URL
                  </label>
                  <input
                    type="url"
                    placeholder="Enter corporate logo image URL..."
                    value={settingsForm.logo}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logo: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 bg-slate-50"
                  />
                </div>

                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Or Upload File:
                  </span>

                  <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs rounded-xl border border-green-200 transition-colors w-max">
                    {uploadingField === 'logo' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Choose Logo Image
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingField !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'logo');
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Supported formats: PNG (transparent recommended), JPG, WebP. Max size: 5MB.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Founder Portrait Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-indigo-600" />
              Founder Profile Image
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
              <div className="p-1 bg-slate-50 border border-slate-200 rounded-2xl w-32 h-32 flex items-center justify-center overflow-hidden shrink-0 relative group">
                <img
                  src={settingsForm.founderImage || '/Screenshot 2026-01-01 191041.png'}
                  alt="Founder Preview"
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>

              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Founder Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="Enter founder image URL..."
                    value={settingsForm.founderImage}
                    onChange={(e) => setSettingsForm({ ...settingsForm, founderImage: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 bg-slate-50"
                  />
                </div>

                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Or Upload File:
                  </span>

                  <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs rounded-xl border border-green-200 transition-colors w-max">
                    {uploadingField === 'founderImage' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Choose Portrait Image
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingField !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'founderImage');
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Best aspect ratio: 1:1 or vertical portrait format.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Showroom settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
          <Globe className="w-5 h-5 text-emerald-600" />
          360° Showroom Virtual Tour & Google Maps Embed
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cover Preview Image */}
          <div className="md:col-span-1 space-y-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Showroom Cover Preview Image
            </label>

            <div className="p-1 bg-slate-50 border border-slate-200 rounded-2xl aspect-[4/3] flex items-center justify-center overflow-hidden relative group">
              <img
                src={settingsForm.virtualTour.previewImage}
                alt="Showroom Cover Preview"
                className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>

            <input
              type="url"
              placeholder="Paste preview image URL..."
              value={settingsForm.virtualTour.previewImage}
              onChange={(e) => setSettingsForm({
                ...settingsForm,
                virtualTour: { ...settingsForm.virtualTour, previewImage: e.target.value }
              })}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-green-500 bg-slate-50"
            />

            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Or Upload File:
              </span>

              <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs rounded-xl border border-green-200 transition-colors w-full">
                {uploadingField === 'previewImage' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 animate-pulse" />
                    Choose Cover Image
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingField !== null}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'previewImage');
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Iframe URLs */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Google Maps Embed Iframe URL
              </label>
              <textarea
                rows={3}
                required
                placeholder="Enter iframe src URL: e.g. https://www.google.com/maps/embed?pb=..."
                value={settingsForm.virtualTour.iframeUrl}
                onChange={(e) => {
                  let val = e.target.value;
                  const match = val.match(/src=["']([^"']+)["']/);
                  if (match) {
                    val = match[1];
                  }
                  setSettingsForm({
                    ...settingsForm,
                    virtualTour: { ...settingsForm.virtualTour, iframeUrl: val }
                  });
                }}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 bg-slate-50 resize-none"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">
                Found on Google Maps: Share &rarr; Embed a map &rarr; Extract URL from the `src` attribute inside the `&lt;iframe&gt;`.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Google Maps Photosphere Redirection URL
              </label>
              <input
                type="url"
                required
                placeholder="Enter direct URL to photosphere or map page link..."
                value={settingsForm.virtualTour.googleMapsUrl}
                onChange={(e) => setSettingsForm({
                  ...settingsForm,
                  virtualTour: { ...settingsForm.virtualTour, googleMapsUrl: e.target.value }
                })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 bg-slate-50"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">
                The link opened when visitors click the "Open in Google Maps" or "Explore in 3D Photosphere" red buttons.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Facility Slides */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
          <MapPin className="w-5 h-5 text-rose-600" />
          Facility Slides (ShopSlider - 4 Slots)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsForm.shopPhotos.map((slide, idx) => (
            <div key={idx} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="p-1 bg-white border border-slate-200 rounded-xl w-24 h-24 flex items-center justify-center overflow-hidden shrink-0 relative group">
                  <img
                    src={slide.image}
                    alt={`Slide ${idx + 1}`}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-green-600 bg-green-50 border border-green-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      Slide Slot {idx + 1}
                    </span>
                  </div>

                  <input
                    type="url"
                    placeholder="Enter slide image URL..."
                    value={slide.image}
                    onChange={(e) => {
                      const nextPhotos = [...settingsForm.shopPhotos];
                      nextPhotos[idx] = { ...nextPhotos[idx], image: e.target.value };
                      setSettingsForm({ ...settingsForm, shopPhotos: nextPhotos });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-green-500 bg-white"
                  />

                  <div className="space-y-1">
                    <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs rounded-xl border border-green-200 transition-colors w-full">
                      {uploadingField === `slide-${idx}` ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Uploading Slide...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          Upload Slide Image
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingField !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, idx);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Slide Caption Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Strategic Warehouse"
                    value={slide.caption}
                    onChange={(e) => {
                      const nextPhotos = [...settingsForm.shopPhotos];
                      nextPhotos[idx] = { ...nextPhotos[idx], caption: e.target.value };
                      setSettingsForm({ ...settingsForm, shopPhotos: nextPhotos });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-green-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Slide Description Text
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide a detailed description of this facility..."
                    value={slide.description}
                    onChange={(e) => {
                      const nextPhotos = [...settingsForm.shopPhotos];
                      nextPhotos[idx] = { ...nextPhotos[idx], description: e.target.value };
                      setSettingsForm({ ...settingsForm, shopPhotos: nextPhotos });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-green-500 bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Banners Management */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            Dynamic Banners (Homepage Slider)
          </h3>
          <button
            onClick={() => {
              const newBanner: BannerSettings = {
                id: crypto.randomUUID(),
                image: '',
                title: '',
                subtitle: '',
                buttonText: 'Shop Now',
                buttonLink: '/products',
                isActive: true,
                placement: 'home_middle',
                bannerType: 'abstract_split',
                themeColor: 'blue',
                textAlign: 'left'
              };
              setSettingsForm({
                ...settingsForm,
                banners: [...(settingsForm.banners || []), newBanner]
              });
            }}
            type="button"
            className="px-4 py-2 bg-purple-50 text-purple-700 font-bold text-xs uppercase tracking-wider rounded-xl border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            + Add New Banner
          </button>
        </div>

        <div className="space-y-6">
          {(!settingsForm.banners || settingsForm.banners.length === 0) ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-sm font-medium text-slate-500">No banners added yet. The default hero section will be displayed.</p>
            </div>
          ) : (
            settingsForm.banners.map((banner, idx) => (
              <div key={banner.id || idx} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 relative group">
                <button
                  type="button"
                  onClick={() => {
                    const nextBanners = [...settingsForm.banners];
                    nextBanners.splice(idx, 1);
                    setSettingsForm({ ...settingsForm, banners: nextBanners });
                  }}
                  className="absolute top-4 right-4 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-200"
                >
                  Remove Banner
                </button>
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Banner Image */}
                  <div className="w-full lg:w-1/3 space-y-3">
                    <div className="aspect-[21/9] bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative">
                      {banner.image ? (
                        <img 
                          src={banner.image} 
                          alt={`Banner ${idx}`} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <span className="text-xs font-bold text-slate-400">No Image</span>
                      )}
                    </div>
                    <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs rounded-xl border border-green-200 transition-colors w-full">
                      {uploadingField === `banner-${idx}` ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                      ) : (
                        <><Upload className="w-3.5 h-3.5" /> Upload Banner Image</>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingField !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, `banner-${idx}`);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Banner Content */}
                  <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Banner Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Grand Diwali Sale"
                        value={banner.title}
                        onChange={(e) => {
                          const nextBanners = [...settingsForm.banners];
                          nextBanners[idx] = { ...nextBanners[idx], title: e.target.value };
                          setSettingsForm({ ...settingsForm, banners: nextBanners });
                        }}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 bg-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subtitle</label>
                      <input
                        type="text"
                        placeholder="e.g. Flat 20% off on all industrial bags"
                        value={banner.subtitle}
                        onChange={(e) => {
                          const nextBanners = [...settingsForm.banners];
                          nextBanners[idx] = { ...nextBanners[idx], subtitle: e.target.value };
                          setSettingsForm({ ...settingsForm, banners: nextBanners });
                        }}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Button Text</label>
                      <input
                        type="text"
                        placeholder="e.g. Shop Now"
                        value={banner.buttonText}
                        onChange={(e) => {
                          const nextBanners = [...settingsForm.banners];
                          nextBanners[idx] = { ...nextBanners[idx], buttonText: e.target.value };
                          setSettingsForm({ ...settingsForm, banners: nextBanners });
                        }}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Button Link</label>
                      <input
                        type="text"
                        placeholder="e.g. /products"
                        value={banner.buttonLink}
                        onChange={(e) => {
                          const nextBanners = [...settingsForm.banners];
                          nextBanners[idx] = { ...nextBanners[idx], buttonLink: e.target.value };
                          setSettingsForm({ ...settingsForm, banners: nextBanners });
                        }}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 bg-white"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Banner Placement</label>
                      <select
                        value={banner.placement || 'home_middle'}
                        onChange={(e) => {
                          const nextBanners = [...settingsForm.banners];
                          nextBanners[idx] = { ...nextBanners[idx], placement: e.target.value as any };
                          setSettingsForm({ ...settingsForm, banners: nextBanners });
                        }}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 bg-white"
                      >
                        <option value="home_middle">Homepage (Under Why Choose Us)</option>
                        <option value="contact_page">Contact Us Page</option>
                        <option value="popup">Popup Modal (Global)</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Banner Style</label>
                      <select
                        value={banner.bannerType || 'abstract_split'}
                        onChange={(e) => {
                          const nextBanners = [...settingsForm.banners];
                          nextBanners[idx] = { ...nextBanners[idx], bannerType: e.target.value as any };
                          setSettingsForm({ ...settingsForm, banners: nextBanners });
                        }}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 bg-white"
                      >
                        <option value="abstract_split">Abstract Split (Modern 3D)</option>
                        <option value="full_image">Full Image (Classic Hero)</option>
                      </select>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Theme Color</label>
                      <select
                        value={banner.themeColor || 'blue'}
                        onChange={(e) => {
                          const nextBanners = [...settingsForm.banners];
                          nextBanners[idx] = { ...nextBanners[idx], themeColor: e.target.value as any };
                          setSettingsForm({ ...settingsForm, banners: nextBanners });
                        }}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 bg-white"
                      >
                        <option value="blue">Blue (Corporate)</option>
                        <option value="green">Green (Vibrant)</option>
                        <option value="red">Red (Alert/Hot)</option>
                        <option value="dark">Dark (Premium Slate)</option>
                      </select>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Text Alignment</label>
                      <select
                        value={banner.textAlign || 'left'}
                        onChange={(e) => {
                          const nextBanners = [...settingsForm.banners];
                          nextBanners[idx] = { ...nextBanners[idx], textAlign: e.target.value as any };
                          setSettingsForm({ ...settingsForm, banners: nextBanners });
                        }}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 bg-white"
                      >
                        <option value="left">Left Aligned</option>
                        <option value="center">Center Aligned</option>
                        <option value="right">Right Aligned</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 flex items-center gap-3 pt-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={banner.isActive}
                          onChange={(e) => {
                            const nextBanners = [...settingsForm.banners];
                            nextBanners[idx] = { ...nextBanners[idx], isActive: e.target.checked };
                            setSettingsForm({ ...settingsForm, banners: nextBanners });
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                        />
                        Banner is Active
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Global Page Banners */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
          <ImageIcon className="w-5 h-5 text-indigo-600" />
          Global Page Banners
        </h3>
        <p className="text-sm text-slate-500 font-medium mb-6">
          Customize the background images for various pages across the website.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { id: 'manufacturingImage', label: 'Manufacturing & Global Background', desc: 'Used in Products, Manufacturing, and various home sections.' },
            { id: 'aboutUsBanner', label: 'About Us Banner', desc: 'Hero background for the About Us page.' },
            { id: 'contactUsBanner', label: 'Contact Us Banner', desc: 'Hero background for the Contact page.' },
            { id: 'productsBanner', label: 'Products Banner', desc: 'Hero background for the Products page.' }
          ].map((field) => (
            <div key={field.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="p-1 bg-white border border-slate-200 rounded-xl w-32 h-20 flex items-center justify-center overflow-hidden shrink-0 relative group">
                  <img
                    src={(settingsForm as any)[field.id] || '/placeholder.svg'}
                    alt={field.label}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>

                <div className="flex-1 w-full space-y-2">
                  <span className="block text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
                    {field.label}
                  </span>
                  
                  <input
                    type="url"
                    placeholder="Enter image URL..."
                    value={(settingsForm as any)[field.id] || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, [field.id]: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-green-500 bg-white"
                  />

                  <div className="space-y-1">
                    <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors w-full">
                      {uploadingField === field.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          Upload Image
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingField !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, field.id as any);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                {field.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Action Footer */}
      <div className="flex justify-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <button
          type="button"
          onClick={handleReset}
          disabled={isSaving}
          className="px-6 py-3 border border-slate-200 hover:bg-slate-50 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
        >
          Reset Changes
        </button>
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-10 py-3 bg-green-600 text-white hover:bg-green-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Settings...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Site Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
