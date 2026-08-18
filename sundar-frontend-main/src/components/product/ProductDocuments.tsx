import React from 'react';
import { Download, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SizeOption {
  size: string;
  price_100_percent: number;
  price_50_percent: number;
}

interface ProductDocumentsProps {
  product: {
    id: string;
    name: string;
    category: string;
    description: string;
    material?: string;
    standards?: string;
    pressureRating?: string;
    temperatureRange?: string;
    application?: string;
    sizeOptions?: SizeOption[];
  };
  language: 'en' | 'hi';
  salesPhone: string;
  salesEmail: string;
}

export const ProductDocuments: React.FC<ProductDocumentsProps> = ({
  product,
  language,
  salesPhone,
  salesEmail
}) => {
  const { toast } = useToast();
  const isHindi = language === 'hi';

  const documents = [
    { name: 'Technical_Datasheet_DT.pdf', label: isHindi ? 'तकनीकी डेटाशीट (PDF)' : 'Technical Datasheet (PDF)', size: '2.4 MB' },
    { name: 'Installation_Safety_Guide.pdf', label: isHindi ? 'स्थापना एवं सुरक्षा गाइड (PDF)' : 'Installation & Safety Guide (PDF)', size: '1.8 MB' },
    { name: 'ASTM_Compliance_Certificate.pdf', label: isHindi ? 'गुणवत्ता अनुपालन प्रमाण पत्र (PDF)' : 'Material Compliance Certificate (PDF)', size: '1.1 MB' },
    { name: 'Product_Bulk_Supply_Catalog.pdf', label: isHindi ? 'उत्पाद आपूर्ति कैटलॉग (PDF)' : 'Bulk Supply Catalog (PDF)', size: '4.7 MB' }
  ];

  // Issue 6: Fake Download Feature - Trigger real client-side dynamic text download
  const handleDownload = (docName: string, docLabel: string) => {
    try {
      const formattedSpecs = [
        product.material ? `Material: ${product.material}` : '',
        (product as any).bagSize ? `Bag Size: ${(product as any).bagSize}` : '',
        (product as any).weight ? `Weight: ${(product as any).weight}` : '',
        (product as any).printType ? `Print Type: ${(product as any).printType}` : '',
        (product as any).closure ? `Closure: ${(product as any).closure}` : '',
      ].filter(Boolean).join('\n');

      const sizeList = product.sizeOptions && product.sizeOptions.length > 0
        ? product.sizeOptions.map(opt => `  - Size: ${opt.size} | Standard Rate: INR ${opt.price_100_percent.toFixed(2)} | Wholesale Rate: INR ${opt.price_50_percent.toFixed(2)}`).join('\n')
        : '  - Standard Size Only (Pricing on Request)';

      const content = `======================================================================
Sundar Corporation - OFFICIAL PRODUCT SPECIFICATION LOG
======================================================================
Document Name: ${docLabel}
Original File: ${docName}
Timestamp: ${new Date().toLocaleString()}

----------------------------------------------------------------------
PRODUCT PROFILE
----------------------------------------------------------------------
Product ID:   ${product.id}
Product Name: ${product.name}
Category:     ${product.category}
Description:  ${product.description}

----------------------------------------------------------------------
TECHNICAL SPECIFICATIONS
----------------------------------------------------------------------
${formattedSpecs || 'No detailed technical parameters defined.'}

----------------------------------------------------------------------
AVAILABLE SIZES & RATES
----------------------------------------------------------------------
${sizeList}

----------------------------------------------------------------------
CONTACT ASSISTANCE
----------------------------------------------------------------------
Contact Phone: ${salesPhone}
Support Email: ${salesEmail}
Website:       https://Sundar CorporationCorporation.com

Address:
1st floor, 37 Ellora plaza, 3, Maharani Rd, Indore, MP 452007
======================================================================
Thank you for partnering with Sundar Corporation. For project-level custom sizing,
please contact our Lead Technical Consultant (Priya Sharma).
======================================================================`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Convert .pdf extension to .txt file for readability and correct format
      const downloadName = docName.replace('.pdf', `_SpecSheet_${product.id.slice(-8)}.txt`);
      a.download = downloadName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);

      toast({
        title: isHindi ? 'डाउनलोड शुरू हुआ' : 'Download Started',
        description: `${downloadName} ${isHindi ? 'सफलतापूर्वक सहेजा गया' : 'downloaded successfully'}.`,
        duration: 3000,
      });
    } catch (err) {
      console.error('File generation error:', err);
      toast({
        title: isHindi ? 'डाउनलोड विफल' : 'Download Failed',
        description: isHindi ? 'फ़ाइल उत्पन्न नहीं की जा सकी' : 'Could not generate specifications sheet.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div id="product-documents" className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-100/30 p-6 sm:p-8 md:p-10 space-y-6">
      <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
        <Download className="w-5 h-5 text-green-600" />
        {isHindi ? 'दस्तावेज़ और डाउनलोड' : 'Product Documents & Downloads'}
      </h3>
      <p className="text-slate-500 text-sm font-medium">
        {isHindi
          ? 'परियोजना योजना और स्थापना के लिए आधिकारिक तकनीकी विनिर्देश शीट और अनुपालन प्रमाण पत्र डाउनलोड करें।'
          : 'Download official technical specification sheets and compliance certificates for project planning and installation.'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {documents.map((doc, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 hover:border-green-300 rounded-2xl transition-all group cursor-pointer"
            onClick={() => handleDownload(doc.name, doc.label)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-800 block group-hover:text-green-700 transition-colors leading-tight">
                  {doc.label}
                </span>
                <span className="text-xs text-slate-400 font-bold tracking-wide">{doc.size}</span>
              </div>
            </div>
            <div className="p-2 text-slate-400 group-hover:text-green-600 transition-colors">
              <ChevronRight className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
