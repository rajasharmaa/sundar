import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, ArrowLeft, Clock, Share2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import ScrollReveal from '@/components/ScrollReveal';

// Mock data: In a real app this would be fetched based on the slug
export const blogPosts = [
  {
    id: 1,
    slug: 'choosing-right-bag-material-hdpe-pp-bopp',
    title: 'Choosing the Right Bag Material: HDPE vs PP vs BOPP',
    excerpt: 'A comprehensive guide on selecting the best woven bag material for your agricultural or industrial packaging needs.',
    content: `
      <p>When selecting the right packaging material for industrial and agricultural use, the choice often comes down to High-Density Polyethylene (HDPE), Polypropylene (PP), and Biaxially Oriented Polypropylene (BOPP). Each offers unique properties tailored to specific applications.</p>
      
      <h2>Understanding HDPE (High-Density Polyethylene)</h2>
      <p>HDPE is renowned for its high tensile strength and resistance to moisture and chemicals. It's an excellent choice for heavy-duty applications where durability is paramount. HDPE woven sacks are commonly used for packing grains, fertilizers, and industrial chemicals because they prevent moisture ingress while providing exceptional tear resistance.</p>
      
      <h2>The Versatility of PP (Polypropylene) Woven Bags</h2>
      <p>Polypropylene woven bags are the workhorses of the packaging industry. They are lightweight, flexible, and offer excellent resistance to stress and cracking. PP bags are widely utilized in the agricultural sector for packing rice, wheat, pulses, and animal feed. Their breathability ensures that perishable goods remain fresh during transit.</p>
      
      <h2>BOPP Bags: The Premium Retail Choice</h2>
      <p>Biaxially Oriented Polypropylene (BOPP) bags combine the strength of woven PP with high-quality, vibrant printing capabilities. The BOPP film is laminated onto the woven fabric, creating a smooth surface ideal for high-resolution graphics. This makes BOPP bags the preferred choice for premium retail packaging, such as pet food, premium seeds, and consumer goods, where brand visibility is crucial.</p>
      
      <h2>Conclusion</h2>
      <p>Choosing the right material depends entirely on your product's requirements. If you need maximum durability, HDPE is your best bet. For general agricultural use, PP woven sacks offer the perfect balance of cost and performance. For retail shelf appeal, BOPP is unmatched.</p>
    `,
    category: 'Packaging Guides',
    date: 'May 12, 2024',
    author: 'Sundar Corp',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1605335198944-6725287e02df?auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    slug: 'bopp-lamination-enhances-brand-visibility',
    title: 'How BOPP Lamination Enhances Brand Visibility',
    excerpt: 'Learn how multicolor BOPP printed bags can transform your retail packaging and increase shelf appeal.',
    content: '<p>BOPP Lamination is a game-changer...</p>',
    category: 'Custom Printing',
    date: 'May 05, 2024',
    author: 'Packaging Team',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1594897030264-ab7d87efc473?auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    slug: 'sustainable-packaging-future-woven-bags',
    title: 'Sustainable Packaging: The Future of Woven Bags',
    excerpt: 'How the woven sack industry is adopting recyclable materials and sustainable manufacturing practices.',
    content: '<p>Sustainability is becoming a core focus...</p>',
    category: 'Sustainability',
    date: 'April 28, 2024',
    author: 'Quality Dept',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&q=80'
  }
];

const BlogArticle = () => {
  const { slug } = useParams();
  
  // Find the post by slug, fallback to first post if not found (for demo)
  const post = blogPosts.find(p => p.slug === slug) || blogPosts[0];

  return (
    <>
      <Helmet>
        <title>{post.title} | Sundar Corporation Blog</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <Link to="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-bold uppercase tracking-widest text-xs">
              <ArrowLeft size={16} /> Back to Blog
            </Link>
          </div>

          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="px-4 py-1.5 bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest rounded-full shadow-sm inline-block mb-6">
                {post.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight tracking-tighter uppercase mb-8">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm font-bold uppercase tracking-widest border-y border-gray-200 py-4">
                <span className="flex items-center gap-2"><Calendar size={16} /> {post.date}</span>
                <span className="flex items-center gap-2"><User size={16} /> {post.author}</span>
                <span className="flex items-center gap-2"><Clock size={16} /> {post.readTime}</span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="rounded-[3rem] overflow-hidden shadow-2xl mb-16">
              <img src={post.image} alt={post.title} className="w-full h-auto aspect-video object-cover" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div 
              className="prose prose-lg prose-blue max-w-none text-gray-700 font-medium leading-relaxed prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-a:text-blue-600 prose-img:rounded-3xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </ScrollReveal>

          <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="font-bold uppercase tracking-widest text-xs text-gray-400">Share this article:</span>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BlogArticle;
