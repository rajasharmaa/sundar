import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Upload, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { catalogService, Catalog } from '@/services/catalogService';

export function CatalogManagement() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [isUploadingCatalog, setIsUploadingCatalog] = useState(false);
  const [externalCatalogName, setExternalCatalogName] = useState('');
  const [externalCatalogUrl, setExternalCatalogUrl] = useState('');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setIsCatalogLoading(true);
        const activeCatalog = await catalogService.getActive();
        setCatalog(activeCatalog);
      } catch (err) {
        console.error('Failed to fetch catalog:', err);
      } finally {
        setIsCatalogLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const handleCatalogUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    try {
      setIsUploadingCatalog(true);
      const updatedCatalog = await catalogService.upload(file);
      setCatalog(updatedCatalog);
      toast.success('Catalog uploaded successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload catalog');
    } finally {
      setIsUploadingCatalog(false);
    }
  };

  const handleExternalCatalogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalCatalogName || !externalCatalogUrl) {
      toast.error('Please fill in both name and URL');
      return;
    }

    try {
      setIsUploadingCatalog(true);
      const updatedCatalog = await catalogService.setUrl(externalCatalogName, externalCatalogUrl);
      setCatalog(updatedCatalog);
      setExternalCatalogName('');
      setExternalCatalogUrl('');
      toast.success('Catalog URL updated successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update catalog URL');
    } finally {
      setIsUploadingCatalog(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black tracking-tight text-slate-900">PDF Catalogs</h2>
        <p className="text-slate-500 font-medium">Manage downloadable product catalogs and brochures for your clients.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catalog status card */}
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100 text-green-700 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Active Catalog</CardTitle>
                <CardDescription className="text-xs font-medium mt-0.5">Customer-facing download file</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isCatalogLoading ? (
              <div className="py-2 space-y-2">
                <div className="h-4 bg-slate-100 animate-pulse rounded w-3/4" />
                <div className="h-3 bg-slate-100 animate-pulse rounded w-1/2" />
              </div>
            ) : catalog ? (
              <div className="py-2">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-slate-800 break-words" title={catalog.name}>{catalog.name}</p>
                </div>
                <a
                  href={catalog.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:text-green-700 font-bold inline-flex items-center gap-1.5 mt-2 hover:underline bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  View PDF <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div className="py-6 text-center">
                <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">No custom catalog uploaded.<br/>Standard fallback is active.</p>
              </div>
            )}
          </CardContent>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>System Status</span>
            <span className="flex items-center gap-2 text-emerald-600 font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Active
            </span>
          </div>
        </Card>

        {/* PDF file upload card */}
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Upload New PDF</CardTitle>
            <CardDescription className="text-xs font-medium">Replace current catalog with a newly uploaded PDF document.</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-green-500 bg-slate-50 hover:bg-green-50/50 rounded-xl p-8 cursor-pointer transition-all duration-200 group">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform duration-200">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-green-500 transition-colors" />
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-green-700 transition-colors">
                  {isUploadingCatalog ? 'Uploading...' : 'Click to select PDF'}
                </span>
                <span className="text-xs text-slate-400 font-medium mt-1">Maximum file size: 20MB</span>
              </div>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleCatalogUpload}
                disabled={isUploadingCatalog || isCatalogLoading}
              />
            </label>
          </CardContent>
        </Card>

        {/* External URL configuration card */}
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Set External Link</CardTitle>
            <CardDescription className="text-xs font-medium">Link to a PDF hosted on Google Drive, AWS, or other service.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleExternalCatalogSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Display Name</label>
                <Input
                  placeholder="e.g. Products 2026-27"
                  value={externalCatalogName}
                  onChange={(e) => setExternalCatalogName(e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                  disabled={isUploadingCatalog || isCatalogLoading}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">External URL</label>
                <Input
                  placeholder="https://..."
                  value={externalCatalogUrl}
                  onChange={(e) => setExternalCatalogUrl(e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                  disabled={isUploadingCatalog || isCatalogLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md hover:shadow-lg"
                disabled={isUploadingCatalog || isCatalogLoading || !externalCatalogName || !externalCatalogUrl}
              >
                Save External Link
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
