import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { AlertTriangle, Home, ArrowLeft, Package, Phone } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import IndustrialBackground from "@/components/IndustrialBackground";
import logger from "@/lib/logger";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    logger.error(`404 Error: Route not found - ${location.pathname}`);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Sundar Corporation</title>
        <meta name="description" content="The page you are looking for does not exist. Return to Sundar Corporation home page." />
      </Helmet>

      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10 min-h-[75vh] flex items-center justify-center pt-28 pb-20 px-6">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-xl w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/95 backdrop-blur-xl border border-green-100 rounded-[3rem] p-8 md:p-12 shadow-2xl text-center"
          >
            <div className="inline-flex p-4 bg-red-50 text-red-600 rounded-2xl mb-6 shadow-lg shadow-red-100">
              <AlertTriangle className="w-12 h-12" />
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-gray-900 leading-none tracking-tighter uppercase mb-4">
              404
            </h1>

            <h2 className="text-xl md:text-2xl font-black text-gray-800 uppercase tracking-tighter mb-4">
              PAGE NOT FOUND
            </h2>

            <p className="text-gray-500 font-medium leading-relaxed mb-10 max-w-sm mx-auto">
              Oops! The link you followed might be broken, or the page has been moved. Let's get you back on track.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="w-full py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all duration-300 shadow-xl hover:shadow-green-200 flex items-center justify-center gap-3 active:scale-[0.98] uppercase tracking-wider text-xs"
              >
                <Home size={16} />
                <span>Return to Homepage</span>
              </Link>

              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/products"
                  className="py-4 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold rounded-2xl border border-gray-200 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  <Package size={14} />
                  <span>Products</span>
                </Link>
                <Link
                  to="/contact"
                  className="py-4 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold rounded-2xl border border-gray-200 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  <Phone size={14} />
                  <span>Contact</span>
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <Link
                to={-1 as any}
                className="inline-flex items-center gap-2 text-xs font-bold text-green-600 hover:text-green-800 transition-colors uppercase tracking-wider"
              >
                <ArrowLeft size={12} />
                <span>Go back to previous page</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default NotFound;
