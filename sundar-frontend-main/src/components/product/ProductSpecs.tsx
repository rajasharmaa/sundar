import React from 'react';
import {
  Settings, Package, Gauge, Thermometer, Award, Factory
} from 'lucide-react';

interface Specification {
  key: string;
  value: string;
}

interface ProductSpecsProps {
  product: {
    category: string;
    specifications?: Specification[];
    material?: string;

    bagSize?: string;
    weight?: string;
    printType?: string;
    closure?: string;
  };
  language: 'en' | 'hi';
}

export const ProductSpecs: React.FC<ProductSpecsProps> = ({ product, language }) => {
  const isHindi = language === 'hi';

  // Generate specifications lists
  const specifications = React.useMemo(() => {
    const specs: any[] = [];

    // First, add specifications from the specifications array if available
    if (product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0) {
      product.specifications.forEach((spec) => {
        specs.push({
          icon: Settings,
          label: spec.key,
          value: spec.value,
          color: 'text-green-500'
        });
      });
    }

    // Then add default specifications if not already covered
    if (!specs.some(s => s.label === (isHindi ? 'सामग्री' : 'Material')) && product.material) {
      specs.push({ icon: Package, label: isHindi ? 'सामग्री' : 'Material', value: product.material, color: 'text-green-500' });
    }
    if (!specs.some(s => s.label === (isHindi ? 'श्रेणी' : 'Category'))) {
      specs.push({
        icon: Settings,
        label: isHindi ? 'श्रेणी' : 'Category',
        value: product.category || (isHindi ? 'औद्योगिक घटक' : 'Industrial Components'),
        color: '-green-'
      });
    }
    if (product.bagSize && !specs.some(s => s.label === (isHindi ? 'बैग का आकार' : 'Bag Size'))) {
      specs.push({ icon: Package, label: isHindi ? 'बैग का आकार' : 'Bag Size', value: product.bagSize, color: '-green-' });
    }
    if (product.weight && !specs.some(s => s.label === (isHindi ? 'वजन' : 'Weight (GSM/g)'))) {
      specs.push({ icon: Gauge, label: isHindi ? 'वजन' : 'Weight (GSM/g)', value: product.weight, color: '-green-' });
    }
    if (product.printType && !specs.some(s => s.label === (isHindi ? 'मुद्रण प्रकार' : 'Print Type'))) {
      specs.push({ icon: Settings, label: isHindi ? 'मुद्रण प्रकार' : 'Print Type', value: product.printType, color: 'text-pink-500' });
    }
    if (product.closure && !specs.some(s => s.label === (isHindi ? 'क्लोजर' : 'Closure'))) {
      specs.push({ icon: Factory, label: isHindi ? 'क्लोजर' : 'Closure', value: product.closure, color: 'text-teal-500' });
    }


    return specs;
  }, [product, isHindi]);

  return (
    <div id="product-specifications" className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-100/30 p-6 sm:p-8 md:p-10 space-y-6">
      <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
        <Settings className="w-5 h-5 text-green-600" />
        {isHindi ? 'विशेष विवरण' : 'Technical Specifications'}
      </h3>

      {/* Specs Table */}
      {product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-lg bg-white mb-6 custom-scrollbar">
          <table className="w-full min-w-[400px] divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  {isHindi ? 'विनिर्देश विशेषता' : 'Specification Attribute'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  {isHindi ? 'मान' : 'Value'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 font-medium">
              {product.specifications.map((spec, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-sm font-extrabold text-slate-800">{spec.key}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-slate-400 text-sm font-medium italic mb-6">
          {isHindi ? 'कैटलॉग में अभी तक कोई विस्तृत पैरामीटर निर्दिष्ट नहीं हैं।' : 'No detailed parameters specified in catalogs yet.'}
        </p>
      )}

      {/* Physical Properties Grid */}
      {specifications.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">
            {isHindi ? 'मुख्य भौतिक गुण' : 'Core Physical Properties'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {specifications.map((spec, index) => (
              <div
                key={index}
                className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 hover:border-cyan-400 hover:shadow-xl transition-all duration-300 flex items-start gap-3"
              >
                <div className={`p-2 rounded-xl bg-white border border-slate-200 shadow-sm ${spec.color} shrink-0`}>
                  <spec.icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">{spec.label}</span>
                  <div className="text-sm sm:text-base font-extrabold text-slate-800 break-words">{spec.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
