import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO/MetaTags';
import { api } from '@/services/api/api-client';
import logger from '@/lib/logger';
import { Product } from '@/types';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import BannerCarousel from '@/components/BannerCarousel';

// New Modular Components
import HeroSection from '@/components/home/HeroSection';
import CompanyIntroduction from '@/components/home/CompanyIntroduction';
import ProductCategories from '@/components/home/ProductCategories';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import ManufacturingCapability from '@/components/home/ManufacturingCapability';
import ProductionProcess from '@/components/home/ProductionProcess';
import IndustriesServed from '@/components/home/IndustriesServed';
import QualityTechnology from '@/components/home/QualityTechnology';
import CustomPackaging from '@/components/home/CustomPackaging';
import CompanyTimeline from '@/components/home/CompanyTimeline';
import FinalCTA from '@/components/home/FinalCTA';
import Testimonials from '@/components/home/Testimonials';
import ClientLogos from '@/components/home/ClientLogos';

// Newly Added Components
import CertificationsShowcase from '@/components/home/CertificationsShowcase';
import MachineryShowcase from '@/components/home/MachineryShowcase';
import ProductionCapacityDashboard from '@/components/home/ProductionCapacityDashboard';
import ProductSpecsComparison from '@/components/home/ProductSpecsComparison';
import FactoryVideoSection from '@/components/home/FactoryVideoSection';
import GoogleMapSection from '@/components/home/GoogleMapSection';

// Lazy load heavy existing components
const FeaturedProductsSlider = lazy(() => import('@/components/FeaturedProductsSlider'));
const MediaGallery = lazy(() => import('@/components/MediaGallery'));
const ShopSlider = lazy(() => import('@/components/ShopSlider'));

interface HomepageCategory {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  productCount?: number;
  trending?: boolean;
  productImages?: string[];
}

const isSafeImage = (url?: string): boolean => {
  if (!url) return false;
  return /^\//.test(url) || /^https?:\/\//.test(url);
};

const Index = () => {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();

  const [categories, setCategories] = useState<HomepageCategory[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dynamic data from API
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        const [cats, prods] = await Promise.all([
          api.categories.getAll(),
          api.products.getAll()
        ]);

        const prodList = Array.isArray(prods) ? prods : (prods as any)?.data || [];

        if (Array.isArray(cats)) {
          const enrichedCats = cats.map(cat => {
            const catProds = prodList.filter((p: any) => {
              if (typeof p.category === 'string') return p.category === cat._id || p.category === cat.name;
              return p.category?._id === cat._id || p.category?.name === cat.name;
            });
            const allImages = catProds.flatMap((p: any) => p.images || (p.image ? [p.image] : [])).filter(isSafeImage);
            return {
              ...cat,
              productImages: allImages.length > 0 ? allImages : undefined
            };
          });
          setCategories(enrichedCats);
        }

        // Filter for featured products
        const featuredProds = prodList.filter((p: any) => p.featured === true);
        setFeaturedProducts(featuredProds.slice(0, 8)); // Show top 8
      } catch (err) {
        logger.error('Failed to fetch home data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const companyInfo = {
    name: 'Sundar Corporation',
    phone: '+91 98930 53053, +91 98260 53653',
    since: 2017,
    address: 'Panchmukhi Hanuman Mandir Rd, Musakhedi, Indore, MP 452001',
    stats: {
      clients: '1500+',
      experience: '8+',
    }
  };

  return (
    <>
      <SEO
        title="Sundar Corporation - Premium Packaging Manufacturer"
        description={`Leading manufacturer of high-quality HDPE bags, PP woven sacks, and industrial packaging solutions since ${companyInfo.since}. ISO certified.`}
        keywords="packaging manufacturer, HDPE bags, PP bags, woven sacks, BOPP bags, jumbo bags, bulk bags, industrial packaging"
      />

      <Navbar />

      <main className="relative z-10 w-full overflow-x-hidden">
        {/* Section 01 */}
        <HeroSection companyInfo={companyInfo} />

        {/* Section 02 */}
        <CompanyIntroduction />

        {/* Section 03 */}
        <ProductCategories categories={categories} isLoading={isLoading} />

        {/* Section 04 */}
        <WhyChooseUs />

        {/* Section 05: NEW Certifications */}
        <CertificationsShowcase />

        {/* Section 06 */}
        <ManufacturingCapability companyInfo={companyInfo} categoriesCount={categories.length} />

        {/* Section 07 */}
        <ProductionProcess />

        {/* Section 08: NEW Machinery */}
        <MachineryShowcase />

        {/* Section 09 */}
        <IndustriesServed />

        {/* Section 10 - Featured Products from existing CMS */}
        {featuredProducts && featuredProducts.length > 0 && (
          <div className="py-24 bg-white">
            <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse rounded-3xl" />}>
              <FeaturedProductsSlider products={featuredProducts} />
            </Suspense>
          </div>
        )}

        {/* Banners from Settings */}
        {settings?.banners && settings.banners.filter((b: any) => b.isActive && b.image && (b.placement === 'home_middle' || !b.placement)).length > 0 && (
          <div className="bg-offwhite py-12">
            <div className="max-w-7xl mx-auto px-6">
              <BannerCarousel banners={settings.banners.filter((b: any) => b.placement === 'home_middle' || !b.placement)} />
            </div>
          </div>
        )}

        {/* Section 11: NEW Product Specs Comparison */}
        <ProductSpecsComparison />

        {/* Section 12: NEW Factory Video */}
        <FactoryVideoSection />

        {/* Section 13 - Media Gallery */}
        <Suspense fallback={<div className="h-64 bg-navy animate-pulse" />}>
          <MediaGallery />
        </Suspense>

        {/* Section 14 */}
        <CustomPackaging />

        {/* Section 15 - Testimonials */}
        <Testimonials />

        {/* Section 16 - Client Logos */}
        <ClientLogos />

        {/* Section 17: NEW Google Maps */}
        <GoogleMapSection />

        {/* Section 18 */}
        <FinalCTA />
      </main>

      <Footer />
    </>
  );
};

export default Index;