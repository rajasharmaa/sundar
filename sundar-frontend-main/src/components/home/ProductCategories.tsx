import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProductCategoriesProps {
  categories: any[];
  isLoading: boolean;
}

const FALLBACK_CATEGORIES = [
  { name: 'Masterbatch Manufacturer', slug: 'masterbatch', image: '/assets/masterbatch.png' },
  { name: 'PP Woven Bags Manufacturer', slug: 'pp-woven-bags', image: '/assets/pp-woven-bags.png' },
  { name: 'BOPP Laminated Bags Manufacturer', slug: 'bopp-laminated-bags', image: '/assets/bopp-laminated.png' },
  { name: 'BOPP/PP Block Bottom Bags', slug: 'block-bottom-bags', image: '/assets/bopp-pp-block-bottom.png' },
  { name: 'FIBC Bags', slug: 'fibc-bags', image: '/assets/fibc-bags.png' },
  { name: 'Geo-Textile Fabrics', slug: 'geo-textile', image: '/assets/geo-textile.png' },
  { name: 'Flexible Packaging', slug: 'flexible-packaging', image: '/assets/flexible-packaging.png' },
  { name: 'PP Woven Fabrics', slug: 'pp-woven-fabrics', image: '/assets/pp-woven-fabrics.png' },
  { name: 'PP Multifilament Yarn', slug: 'pp-multifilament-yarn', image: '/assets/pp-yarn.png' }
];

const ProductCategories: React.FC<ProductCategoriesProps> = ({ categories, isLoading }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  // Use DB categories if available and sufficient, otherwise use the specific 9-grid fallback
  const displayCategories = categories && categories.length >= 9
    ? categories.slice(0, 9)
    : FALLBACK_CATEGORIES;

  return (
    <section ref={containerRef} className="py-24 bg-[#FDFBF7] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">

          {/* Left Text Column */}
          <div className="w-full lg:w-[40%] text-left space-y-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl font-serif font-bold text-[#0B2023] leading-tight"
            >
              One of the largest <br />
              manufacturer of Packaging <br />
              Products
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-xl md:text-2xl text-gray-700 font-light leading-relaxed"
            >
              We <strong className="font-bold">specialize in the production of PP packaging products</strong>, including polypropylene (PP) woven bags, FIBC bags, BOPP bags, block bottom valve bags, and more.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-sm text-gray-600 leading-loose max-w-lg"
            >
              Our extensive range of PP packaging products, coupled with our emphasis on timely delivery and personalized customer service, sets us apart as industry leaders. From geotextiles to specialized containers, we offer comprehensive solutions tailored to suit diverse business needs. Join us in shaping a sustainable future while redefining packaging standards, one client at a time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="pt-4"
            >
              <Link
                to="/products"
                className="inline-flex items-center text-[#22c55e] font-bold text-sm tracking-wide hover:opacity-80 transition-opacity"
              >
                View all Products <ChevronRight className="w-4 h-4 ml-1" strokeWidth={3} />
              </Link>
            </motion.div>
          </div>

          {/* Right Grid Column */}
          <div className="w-full lg:w-[60%] relative">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 relative z-10">
              {isLoading ? (
                [...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white shadow-sm rounded-xl h-[180px] animate-pulse" />
                ))
              ) : (
                displayCategories.map((category, index) => {
                  const name = category.name || '';
                  const slug = category.slug || category._id || name.toLowerCase().replace(/\s+/g, '-');

                  // Use local fallback images if backend image is not provided
                  const imageSrc = category.image || category.productImages?.[0] || `/assets/${slug}.png`;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <Link
                        to={`/category/${slug}`}
                        className="group flex flex-col items-center justify-center bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 h-[180px] md:h-[200px] p-6 text-center border border-transparent hover:border-gray-50"
                      >
                        <div className="h-[80px] w-full flex items-center justify-center mb-4 transition-transform duration-500 group-hover:-translate-y-1">
                          <img
                            src={imageSrc}
                            alt={name}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              // If image is missing, show a fallback or hide
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="text-xs md:text-[13px] font-bold text-[#0B2023] leading-snug group-hover:text-[#22c55e] transition-colors line-clamp-2 px-2">
                          {name}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Background decoration removed for clean corporate look */}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProductCategories;

