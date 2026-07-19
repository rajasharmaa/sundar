// src/pages/UIDemo.tsx - Demo page showcasing new UI components
import { useState } from 'react';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Package, 
  Layers, 
  Wrench,
  Zap,
  Filter,
  User,
  Bell
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import { 
  Card3D, 
  ProductCard3D, 
  CategoryCard3D 
} from '@/components/ui/3d-card';
import { 
  AnimatedButton, 
  IconButton, 
  SocialButton 
} from '@/components/ui/animated-button';
import { 
  ProductHoverCard 
} from '@/components/ui/hover-card-3d';
import { 
  ParallaxSection, 
  HeroParallax, 
  StatsParallax 
} from '@/components/ParallaxSection';
import { 
  PremiumCardSkeleton,
  PremiumStatsSkeleton,
  PremiumSearchSkeleton
} from '@/components/loaders/PremiumSkeleton';
import {
  WishlistEmptyState,
  CartEmptyState,
  SearchEmptyState
} from '@/components/EmptyState';
import { PageTransition, StaggeredContent } from '@/components/PageTransition';
import { useReducedMotion } from '@/hooks/useAnimations';

const UIDemo = () => {
  const [isLoading, setIsLoading] = useState(true);
  const reducedMotion = useReducedMotion();

  // Simulate loading
  setTimeout(() => setIsLoading(false), 1500);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <PremiumSearchSkeleton />
          <div className="my-6">
            <PremiumStatsSkeleton />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <PremiumCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <IndustrialBackground />
        <Navbar />
        
        <main className="relative z-10 pb-[100px] lg:pb-0">
          {/* Hero Section */}
          <HeroParallax
            title="Premium UI Components"
            subtitle="Experience the next generation of interactive design with smooth animations and micro-interactions"
            ctaText="Explore Components"
            floatingElements={[
              <div key="1" className="w-4 h-4 bg-white/20 rounded-full" />,
              <div key="2" className="w-6 h-6 bg-white/20 rounded-full" />,
              <div key="3" className="w-3 h-3 bg-white/20 rounded-full" />
            ]}
          />

          {/* Stats Section */}
          <StatsParallax
            stats={[
              { value: "50+", label: "Components", icon: <Package className="w-6 h-6" /> },
              { value: "100%", label: "Performance", icon: <Zap className="w-6 h-6" /> },
              { value: "60fps", label: "Smooth Animations", icon: <Star className="w-6 h-6" /> },
              { value: "Mobile", label: "Responsive", icon: <Layers className="w-6 h-6" /> }
            ]}
            title="Why Choose Our UI Kit?"
          />

          {/* 3D Cards Demo */}
          <ParallaxSection 
            className="py-20"
            speed={0.2}
            intensity={30}
          >
            <div className="container mx-auto px-4">
              <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
                3D Interactive Cards
              </h2>
              
              <StaggeredContent staggerDelay={0.1}>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                  <ProductCard3D
                    image="/placeholder.svg"
                    title="Premium Steel Pipe"
                    description="High-quality industrial steel pipes for construction and manufacturing"
                    price="₹2,499"
                    badge="Best Seller"
                    actionButton={
                      <IconButton
                        icon={<Heart className="w-5 h-5" />}
                        variant="outline"
                        className="bg-white/80 backdrop-blur-sm w-10 h-10"
                      />
                    }
                  />
                  
                  <ProductCard3D
                    image="/placeholder.svg"
                    title="Industrial Valve Set"
                    description="Complete valve assembly for industrial applications"
                    price="₹5,999"
                    badge="New Arrival"
                    actionButton={
                      <IconButton
                        icon={<ShoppingCart className="w-5 h-5" />}
                        variant="primary"
                        className="shadow-lg w-10 h-10"
                      />
                    }
                  />
                  
                  <ProductCard3D
                    image="/placeholder.svg"
                    title="Pipe Fitting Kit"
                    description="Essential fittings for plumbing and pipeline systems"
                    price="₹1,299"
                    actionButton={
                      <AnimatedButton variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                        View Details
                      </AnimatedButton>
                    }
                  />
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <CategoryCard3D
                    icon={<Layers className="w-6 h-6" />}
                    title="Pipes"
                    description="Steel, copper, and PVC pipes for all applications"
                    count={24}
                    isTrending
                  />
                  
                  <CategoryCard3D
                    icon={<Wrench className="w-6 h-6" />}
                    title="Fittings"
                    description="Connectors, joints, and adapters"
                    count={18}
                  />
                  
                  <CategoryCard3D
                    icon={<Filter className="w-6 h-6" />}
                    title="Valves"
                    description="Control and regulation valves"
                    count={12}
                  />
                  
                  <CategoryCard3D
                    icon={<Zap className="w-6 h-6" />}
                    title="Accessories"
                    description="Tools and additional components"
                    count={36}
                  />
                </div>
              </StaggeredContent>
            </div>
          </ParallaxSection>

          {/* Buttons Demo */}
          <ParallaxSection 
            className="py-20 bg-white"
            speed={0.1}
            intensity={20}
          >
            <div className="container mx-auto px-4">
              <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
                Animated Buttons
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card3D className="p-8 text-center">
                  <h3 className="font-semibold mb-6 text-gray-900">Standard Variants</h3>
                  <div className="space-y-4">
                    <AnimatedButton variant="primary" className="w-full">
                      Primary Button
                    </AnimatedButton>
                    <AnimatedButton variant="secondary" className="w-full">
                      Secondary Button
                    </AnimatedButton>
                    <AnimatedButton variant="outline" className="w-full">
                      Outline Button
                    </AnimatedButton>
                  </div>
                </Card3D>
                
                <Card3D className="p-8 text-center">
                  <h3 className="font-semibold mb-6 text-gray-900">Icon Buttons</h3>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <IconButton icon={<Heart className="w-5 h-5" />} variant="primary" />
                    <IconButton icon={<ShoppingCart className="w-5 h-5" />} variant="secondary" />
                    <IconButton icon={<User className="w-5 h-5" />} variant="outline" />
                    <IconButton icon={<Bell className="w-5 h-5" />} variant="ghost" />
                  </div>
                </Card3D>
                
                <Card3D className="p-8 text-center">
                  <h3 className="font-semibold mb-6 text-gray-900">Social Buttons</h3>
                  <div className="space-y-3">
                    <SocialButton platform="google" iconOnly />
                    <SocialButton platform="facebook" className="h-9" />
                    <SocialButton platform="whatsapp" className="h-9" />
                  </div>
                </Card3D>
              </div>
            </div>
          </ParallaxSection>

          {/* Hover Cards Demo */}
          <ParallaxSection 
            className="py-20"
            speed={0.15}
            intensity={25}
          >
            <div className="container mx-auto px-4">
              <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
                Hover Interactions
              </h2>
              
              <div className="max-w-2xl mx-auto">
                <Card3D className="p-8">
                  <h3 className="font-semibold mb-6 text-gray-900">Product Hover Preview</h3>
                  <div className="space-y-4">
                    <ProductHoverCard
                      productName="Industrial Steel Flange"
                      productDescription="Heavy-duty steel flange for industrial pipeline connections with corrosion-resistant coating"
                      price="₹1,899"
                      rating={4.8}
                      image="/placeholder.svg"
                      features={["Corrosion Resistant", "High Pressure Rating", "Easy Installation"]}
                      onQuickView={() => { /* Quick view handler */ }}
                    />
                  </div>
                </Card3D>
              </div>
            </div>
          </ParallaxSection>

          {/* Empty States Demo */}
          <ParallaxSection 
            className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50"
            speed={0.1}
            intensity={15}
          >
            <div className="container mx-auto px-4">
              <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
                Empty States
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <Card3D>
                  <div className="p-8">
                    <WishlistEmptyState 
                      onBrowseProducts={() => { /* Browse products handler */ }}
                    />
                  </div>
                </Card3D>
                
                <Card3D>
                  <div className="p-8">
                    <CartEmptyState 
                      onShopNow={() => { /* Shop now handler */ }}
                    />
                  </div>
                </Card3D>
                
                <Card3D>
                  <div className="p-8">
                    <SearchEmptyState 
                      searchTerm="steel pipes"
                      onClearSearch={() => { /* Clear search handler */ }}
                    />
                  </div>
                </Card3D>
              </div>
            </div>
          </ParallaxSection>

          {/* Performance Info */}
          <ParallaxSection 
            className="py-16 bg-gray-900 text-white"
            speed={0.05}
            intensity={10}
          >
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-8">Performance Optimized</h2>
              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div>
                  <div className="text-2xl font-bold mb-2">60 FPS</div>
                  <div className="text-gray-300">Smooth animations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-2">GPU Accelerated</div>
                  <div className="text-gray-300">Hardware optimized</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-2">Reduced Motion</div>
                  <div className="text-gray-300">Accessibility focused</div>
                </div>
              </div>
              {reducedMotion && (
                <div className="mt-8 p-4 bg-yellow-500/20 rounded-lg inline-block">
                  <p className="text-yellow-200">Reduced motion mode is active</p>
                </div>
              )}
            </div>
          </ParallaxSection>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

// Eye icon component (missing from lucide-react imports)
const Eye = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

export default UIDemo;