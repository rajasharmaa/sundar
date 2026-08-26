import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, TrendingUp, Filter, Search, Tag, Share2, Clock } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import ScrollReveal from '@/components/ScrollReveal';

const Blog = () => {
   const [activeCategory, setActiveCategory] = useState('All');

   const categories = ['All', 'Industry News', 'Packaging Guides', 'Sustainability', 'Custom Printing'];

   const posts = [
      {
         id: 1,
         title: 'Choosing the Right Bag Material: HDPE vs PP vs BOPP',
         excerpt: 'A comprehensive guide on selecting the best woven bag material for your agricultural or industrial packaging needs.',
         category: 'Packaging Guides',
         date: 'May 12, 2024',
         author: 'Sundar Corp',
         readTime: '8 min read',
         image: 'https://images.unsplash.com/photo-1605335198944-6725287e02df?auto=format&fit=crop&q=80'
      },
      {
         id: 2,
         title: 'How BOPP Lamination Enhances Brand Visibility',
         excerpt: 'Learn how multicolor BOPP printed bags can transform your retail packaging and increase shelf appeal.',
         category: 'Custom Printing',
         date: 'May 05, 2024',
         author: 'Packaging Team',
         readTime: '6 min read',
         image: 'https://images.unsplash.com/photo-1594897030264-ab7d87efc473?auto=format&fit=crop&q=80'
      },
      {
         id: 3,
         title: 'Sustainable Packaging: The Future of Woven Bags',
         excerpt: 'How the woven sack industry is adopting recyclable materials and sustainable manufacturing practices.',
         category: 'Sustainability',
         date: 'April 28, 2024',
         author: 'Quality Dept',
         readTime: '10 min read',
         image: 'https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&q=80'
      }
   ];

   return (
      <>
         <Helmet>
            <title>Blog & Insights - Sundar Corporation | Packaging News</title>
            <meta name="description" content="Stay updated with the latest packaging industry news, technical guides, and insights from Sundar Corporation." />
         </Helmet>

         <IndustrialBackground />
         <Navbar />

         <main className="relative z-10 pt-24 pb-20">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 mb-20">
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-16"
               >
                  <h1 className="text-5xl md:text-8xl font-black text-gray-900 leading-none tracking-tighter uppercase mb-6">
                     INDUSTRIAL <span className="text-blue-600">INSIGHTS</span>
                  </h1>
                  <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
                     Expert perspectives on packaging systems, polymer technology, and manufacturing trends.
                  </p>
               </motion.div>

               {/* Featured Post */}
               <ScrollReveal distance={40}>
                  <div className="relative group bg-white rounded-[4rem] overflow-hidden shadow-2xl border border-gray-100 mb-20">
                     <div className="flex flex-col lg:flex-row">
                        <div className="lg:w-1/2 overflow-hidden">
                           <img
                              src="https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&q=80&w=1200"
                              alt="Featured Post"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 min-h-[400px]"
                           />
                        </div>
                        <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center">
                           <div className="flex items-center gap-3 mb-6">
                              <span className="px-4 py-1.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-full">Featured</span>
                              <span className="text-gray-400 text-sm font-bold flex items-center gap-2">
                                 <Clock size={14} /> 12 min read
                              </span>
                           </div>
                           <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-none tracking-tighter uppercase mb-6 group-hover:text-blue-600 transition-colors">
                              The Future of BOPP in Sustainable Industrial Packaging
                           </h2>
                           <p className="text-gray-600 text-lg font-medium leading-relaxed mb-10">
                              As industries move towards greener practices, we analyze how material selection
                              impacts long-term sustainability and operational efficiency.
                           </p>
                           <button className="flex items-center gap-4 text-gray-900 font-black uppercase tracking-widest text-sm group/btn">
                              <span>Read Full Article</span>
                              <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center group-hover/btn:bg-blue-600 group-hover/btn:translate-x-2 transition-all">
                                 <ArrowRight size={18} />
                              </div>
                           </button>
                        </div>
                     </div>
                  </div>
               </ScrollReveal>
            </section>

            {/* Filter Section */}
            <section className="max-w-7xl mx-auto px-6 mb-16">
               <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-gray-100 pb-8">
                  <div className="flex flex-wrap justify-center gap-4">
                     {categories.map((cat) => (
                        <button
                           key={cat}
                           onClick={() => setActiveCategory(cat)}
                           className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat
                                 ? 'bg-gray-900 text-white shadow-lg'
                                 : 'bg-white text-gray-400 hover:bg-gray-50'
                              }`}
                        >
                           {cat}
                        </button>
                     ))}
                  </div>
                  <div className="relative w-full md:w-80">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                     <input
                        type="text"
                        placeholder="Search articles..."
                        className="w-full pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-medium"
                     />
                  </div>
               </div>
            </section>

            {/* Blog Grid */}
            <section className="max-w-7xl mx-auto px-6 mb-32">
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {posts.map((post, i) => (
                     <ScrollReveal key={post.id} delay={i * 0.1} distance={30}>
                        <article className="group h-full">
                           <div className="relative overflow-hidden rounded-[3rem] mb-8 shadow-lg">
                              <img
                                 src={post.image}
                                 alt={post.title}
                                 className="w-full aspect-[4/3] object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute top-6 left-6">
                                 <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-black uppercase tracking-widest rounded-full shadow-sm">
                                    {post.category}
                                 </span>
                              </div>
                           </div>
                           <div className="px-4">
                              <div className="flex items-center gap-4 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                                 <span className="flex items-center gap-2"><Calendar size={14} /> {post.date}</span>
                                 <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                 <span className="flex items-center gap-2"><User size={14} /> {post.author}</span>
                              </div>
                              <h3 className="text-2xl font-black text-gray-900 leading-tight tracking-tighter uppercase mb-4 group-hover:text-blue-600 transition-colors">
                                 {post.title}
                              </h3>
                              <p className="text-gray-600 font-medium leading-relaxed mb-6">
                                 {post.excerpt}
                              </p>
                              <button className="flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-xs group-hover:gap-4 transition-all">
                                 <span>Read More</span>
                                 <ArrowRight size={14} />
                              </button>
                           </div>
                        </article>
                     </ScrollReveal>
                  ))}
               </div>
            </section>

            {/* Newsletter Section */}
            <section className="max-w-7xl mx-auto px-6">
               <ScrollReveal delay={0.2} distance={40}>
                  <div className="relative bg-blue-600 rounded-[4rem] p-12 lg:p-24 overflow-hidden text-center">
                     <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[120px] -mr-64 -mt-64" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white rounded-full blur-[120px] -ml-64 -mb-64" />
                     </div>
                     <div className="relative z-10 max-w-2xl mx-auto">
                        <TrendingUp className="text-white/50 mx-auto mb-8" size={48} />
                        <h2 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tighter uppercase mb-6">
                           GET INDUSTRIAL <br /> UPDATES
                        </h2>
                        <p className="text-blue-100 font-medium mb-10 text-lg">
                           Subscribe to our newsletter and never miss an update on new standards, products, and technical insights.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-4">
                           <input
                              type="email"
                              placeholder="Enter your email address"
                              className="flex-1 px-8 py-5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 transition-all font-bold"
                           />
                           <button className="px-10 py-5 bg-white text-blue-600 font-black rounded-2xl hover:bg-gray-100 transition-all shadow-xl uppercase tracking-widest text-xs">
                              Subscribe
                           </button>
                        </form>
                     </div>
                  </div>
               </ScrollReveal>
            </section>
         </main>

         <Footer />
      </>
   );
};

export default Blog;

