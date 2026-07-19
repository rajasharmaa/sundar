import React from 'react';
import { getOptimizedUrl } from '@/lib/utils';

interface SizeOption {
  size: string;
  price_100_percent: number;
  price_50_percent: number;
}

interface Specification {
  label: string;
  value: string;
}

interface ProductPrintTemplateProps {
  product: {
    name: string;
    description: string;
    material?: string;
    standards?: string;
    pressureRating?: string;
    brand?: string;
    productCode?: string;
    id: string;
    image?: string;
    sizeOptions?: SizeOption[];
  };
  specifications: Specification[];
  salesPhone: string;
  salesEmail: string;
}

export const ProductPrintTemplate: React.FC<ProductPrintTemplateProps> = ({
  product,
  specifications,
  salesPhone,
  salesEmail
}) => {
  return (
    <div id="product-print-area" className="hidden print:block p-8 space-y-6">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #product-print-area, #product-print-area * {
            visibility: visible !important;
          }
          #product-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: block !important;
            color: #000 !important;
            background: #fff !important;
          }
        }
      `}</style>
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Damodar Traders</h1>
          <p className="text-xs text-gray-500">Quality & Trust - B2B Specification Sheet</p>
        </div>
        <div className="text-right text-xs">
          {/* Issue 5: Use configurable SALES_PHONE and SALES_EMAIL variables */}
          <p>Phone: {salesPhone}</p>
          <p>Email: {salesEmail}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 pt-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{product.name}</h2>
          <p className="text-sm text-gray-600 mt-2">{product.description}</p>
          <div className="mt-4 space-y-1 text-xs">
            {product.material && <p><strong>Material:</strong> {product.material}</p>}
            {product.standards && <p><strong>Standards:</strong> {product.standards}</p>}
            {product.pressureRating && <p><strong>Pressure Rating:</strong> {product.pressureRating}</p>}
            {product.brand && <p><strong>Brand:</strong> {product.brand}</p>}
            {product.productCode && <p><strong>Product Code:</strong> {product.productCode}</p>}
            <p><strong>Product ID:</strong> {product.id}</p>
          </div>
        </div>
        <div className="flex justify-center items-center">
          {product.image && (
            <img
              src={getOptimizedUrl(product.image)}
              className="max-h-48 object-contain rounded-lg border"
              alt={product.name}
            />
          )}
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-sm font-bold border-b pb-1 mb-2">Technical Specifications</h3>
        <table className="w-full text-left text-xs border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Parameter</th>
              <th className="p-2 border">Value</th>
            </tr>
          </thead>
          <tbody>
            {specifications.map((spec, idx) => (
              <tr key={idx}>
                <td className="p-2 border font-medium">{spec.label}</td>
                <td className="p-2 border">{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {product.sizeOptions && product.sizeOptions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-bold border-b pb-1 mb-2">Available Size & Price List</h3>
          <table className="w-full text-left text-xs border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Size</th>
                <th className="p-2 border">Standard Rate</th>
                <th className="p-2 border">Wholesale Rate</th>
              </tr>
            </thead>
            <tbody>
              {product.sizeOptions.map((opt, idx) => (
                <tr key={idx}>
                  <td className="p-2 border font-bold">{opt.size}</td>
                  <td className="p-2 border">₹{opt.price_100_percent.toFixed(2)}</td>
                  <td className="p-2 border">₹{opt.price_50_percent.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
