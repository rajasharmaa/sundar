import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Product, SizeOption, Specification } from '@/types';
import { PRODUCT_CATEGORIES } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Upload,
  Sparkles,
  Tag,
  FileText,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import toast from 'react-hot-toast';

const sizeOptionSchema = z.object({
  size: z.string().min(1, 'Size is required'),
  price_100_percent: z.coerce.number().min(0, '100% price must be positive'),
  price_50_percent: z.coerce.number().min(0, '50% price must be positive'),
  availability: z.boolean().default(true),
  stock: z.coerce.number().min(0).default(0),
});

const specificationSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  productCode: z.string().optional(),
  description: z.string().optional(),
  sizeOptions: z.array(sizeOptionSchema).min(1, 'At least one size option is required'),
  discount: z.coerce.number().min(0).max(100).optional().or(z.literal(0).transform(() => undefined)),
  material: z.string().optional(),
  pressureRating: z.string().optional(),
  temperatureRange: z.string().optional(),
  standards: z.string().optional(),
  application: z.string().optional(),
  specifications: z.array(specificationSchema).optional(),
  featured: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductDetailProps {
  product?: Product;
  initialImage?: File;
  initialImages?: File[];
  onBack: () => void;
  onSave: (data: ProductFormData & { image?: File, images?: File[] }) => Promise<void>;
  isLoading?: boolean;
}

// Helper type for size option with backward compatibility
interface SizeOptionWithLegacy extends SizeOption {
  price?: number; // Legacy field for backward compatibility
}

export function ProductDetailEnhanced({ product, initialImage, initialImages = [], onBack, onSave, isLoading }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(initialImage || null);
  const [selectedImages, setSelectedImages] = useState<File[]>(initialImages);
  
  // existing images from product + preview URLs for new images
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const [retainedImages, setRetainedImages] = useState<string[]>([]);
  
  useEffect(() => {
    if (product?.images?.length) {
      setRetainedImages(product.images.map((img: any) => img.url));
    } else if (product?.image) {
      setRetainedImages([product.image]);
    } else {
      setRetainedImages([]);
    }
  }, [product]);

  useEffect(() => {
    const urls: string[] = [...retainedImages];
    
    let cleanupUrls: string[] = [];

    if (selectedImages.length > 0) {
      const newUrls = selectedImages.map(file => URL.createObjectURL(file));
      urls.push(...newUrls);
      cleanupUrls = newUrls;
    } else if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      urls.push(url);
      cleanupUrls = [url];
    }
    
    setPreviewUrls(urls);

    return () => {
      cleanupUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [retainedImages, selectedImage, selectedImages]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'sizes' | 'specs'>('basic');

  const categoriesList = PRODUCT_CATEGORIES;

  // Default values for new products
  const getDefaultValues = useCallback((): Partial<ProductFormData> => {
    if (product) {
      return {
        name: product.name || '',
        category: product.category || 'pipes',
        brand: product.brand || '',
        productCode: product.productCode || '',
        description: product.description || '',
        sizeOptions: product.sizeOptions?.length 
          ? (product.sizeOptions as any[]).map(s => ({
              size: s.size || '',
              price_100_percent: s.price_100_percent ?? s.price ?? 0,
              price_50_percent: s.price_50_percent ?? 0,
              availability: s.availability ?? true,
              stock: s.stock ?? 0
            }))
          : [{ 
              size: '', 
              price_100_percent: 0, 
              price_50_percent: 0, 
              availability: true, 
              stock: 0 
            }],
        discount: product.discount ?? undefined,
        material: product.material || '',
        pressureRating: product.pressureRating || '',
        temperatureRange: product.temperatureRange || '',
        standards: product.standards || '',
        application: product.application || '',
        specifications: product.specifications && typeof product.specifications === 'object'
          ? (Array.isArray(product.specifications)
            ? (product.specifications as any[]).map(spec => {
                if (spec && typeof spec === 'object' && 'key' in spec && 'value' in spec) {
                  return { key: spec.key || '', value: spec.value || '' };
                }
                const entries = Object.entries(spec).filter(([k]) => k !== '_id' && k !== 'key' && k !== 'value');
                if (entries.length > 0) {
                  return { key: entries[0][0], value: String(entries[0][1]) };
                }
                return { key: '', value: '' };
              })
            : Object.entries(product.specifications).map(([key, value]) => ({ key, value: String(value) })))
          : [{ key: '', value: '' }],
        featured: product.featured ?? false,
      };
    }
    
    // Smart defaults for new products
    return {
      name: '',
      category: 'G.I. Fittings',
      brand: '',
      productCode: '',
      description: '',
      sizeOptions: [
        { size: '1/2 inch', price_100_percent: 100, price_50_percent: 50, availability: true, stock: 0 },
        { size: '3/4 inch', price_100_percent: 150, price_50_percent: 75, availability: true, stock: 0 },
        { size: '1 inch', price_100_percent: 200, price_50_percent: 100, availability: true, stock: 0 },
      ],
      discount: undefined,
      material: '',
      pressureRating: '',
      temperatureRange: '',
      standards: '',
      application: '',
      specifications: [{ key: '', value: '' }],
      featured: false,
    };
  }, [product]);

  const formMethods = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: getDefaultValues(),
    mode: 'onChange',
  });

  const { 
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = formMethods;

  useEffect(() => {
    reset(getDefaultValues());
    setSelectedImages([]);
  }, [product, getDefaultValues, reset]);

  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
    control,
    name: 'sizeOptions',
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: 'specifications',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files]);
    }
  };
  
  const removeImage = (index: number) => {
    if (index < retainedImages.length) {
      setRetainedImages(prev => prev.filter((_, i) => i !== index));
    } else {
      const newImagesIndex = index - retainedImages.length;
      setSelectedImages(prev => prev.filter((_, i) => i !== newImagesIndex));
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSaving(true);
    try {
      const filteredSpecifications = data.specifications?.filter(
        spec => spec.key.trim() !== '' || spec.value.trim() !== ''
      ) || [];

      const specMap: Record<string, string> = {};
      filteredSpecifications.forEach(spec => {
        if (spec.key.trim() !== '') {
          specMap[spec.key.trim()] = spec.value;
        }
      });

      await onSave({
        ...data,
        specifications: Object.keys(specMap).length > 0 ? specMap : undefined,
        images: selectedImages,
        retainedImages: retainedImages,
      } as any);
      
      if (!product) {
        reset(getDefaultValues());
        setSelectedImages([]);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.error('❌ Form validation errors:', errors);
    toast.error('Form validation failed. Please check all fields.');
  };

  const category = watch('category');
  const brand = watch('brand');
  const productCode = watch('productCode');

  const addSizeRow = () => {
    appendSize({ size: '', price_100_percent: 0, price_50_percent: 0, availability: true, stock: 0 });
  };

  const addSpecificationRow = () => {
    appendSpec({ key: '', value: '' });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack} size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
        <h2 className="text-2xl font-bold">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
      </div>

      <div className="flex gap-2 mb-6 border-b">
        <Button variant={activeTab === 'basic' ? 'default' : 'ghost'} onClick={() => setActiveTab('basic')}>Basic Info</Button>
        <Button variant={activeTab === 'sizes' ? 'default' : 'ghost'} onClick={() => setActiveTab('sizes')}>Sizes & Prices</Button>
        <Button variant={activeTab === 'specs' ? 'default' : 'ghost'} onClick={() => setActiveTab('specs')}>Specifications</Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {/* Image Upload */}
            <Card>
              <CardContent className="pt-6">
                <Label className="mb-3 flex items-center gap-2 font-semibold">
                  <ImageIcon className="w-4 h-4" />
                  Product Images
                </Label>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {previewUrls.map((url, index) => (
                      <div key={url} className="relative group aspect-square rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                        <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/50 transition-colors">
                      <label htmlFor="images" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                        <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground font-medium text-center px-1">Add Image</span>
                        <input id="images" type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Toggle */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="featuredToggle" className="font-semibold">Featured Product</Label>
                    <p className="text-sm text-muted-foreground">
                      Show on homepage
                    </p>
                  </div>
                  <Switch
                    id="featuredToggle"
                    checked={watch('featured')}
                    onCheckedChange={(checked) => setValue('featured', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            {!product && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Quick Tip</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Default values have been pre-filled. You can modify any field before saving.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Form Fields */}
          <div className="lg:col-span-2">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      name="name"
                      placeholder="e.g., G.I. ELBOW (ISI)"
                      className={errors.name ? 'border-destructive' : ''}
                      autoComplete="off"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={category}
                        onValueChange={(value) => setValue('category', value)}
                      >
                        <SelectTrigger id="category" className={errors.category ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesList.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-destructive">{errors.category.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        {...register('brand')}
                        name="brand"
                        placeholder="e.g., Apollo, Astral"
                        autoComplete="organization"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productCode">Product Code</Label>
                    <Input
                      id="productCode"
                      {...register('productCode')}
                      name="productCode"
                      placeholder="e.g., GI-ELBOW-001"
                      autoComplete="off"
                    />
                    <p className="text-xs text-muted-foreground">
                      Unique identifier for inventory management
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      name="description"
                      placeholder="Enter product description..."
                      rows={4}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="material">Material</Label>
                      <Input
                        id="material"
                        {...register('material')}
                        name="material"
                        placeholder="e.g., Galvanized Iron"
                        autoComplete="off"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        {...register('discount')}
                        name="discount"
                        placeholder="0"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sizes & Prices Tab */}
            {activeTab === 'sizes' && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Size Options & Pricing</h3>
                    <Button type="button" onClick={addSizeRow} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Size
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {sizeFields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-12 gap-3 items-end p-4 border rounded-lg bg-muted/50">
                        <div className="col-span-4 space-y-2">
                          <Label htmlFor={`sizeOptions.${index}.size`}>Size *</Label>
                          <Input
                            id={`sizeOptions.${index}.size`}
                            {...register(`sizeOptions.${index}.size`)}
                            name={`sizeOptions.${index}.size`}
                            placeholder="e.g., 1/2 inch"
                            className={errors.sizeOptions?.[index]?.size ? 'border-destructive' : ''}
                          />
                          {errors.sizeOptions?.[index]?.size && (
                            <p className="text-xs text-destructive">{errors.sizeOptions[index].size?.message}</p>
                          )}
                        </div>

                        <div className="col-span-3 space-y-2">
                          <Label htmlFor={`sizeOptions.${index}.price_100_percent`}>100% Price (₹) *</Label>
                          <Input
                            id={`sizeOptions.${index}.price_100_percent`}
                            {...register(`sizeOptions.${index}.price_100_percent`, { valueAsNumber: true })}
                            name={`sizeOptions.${index}.price_100_percent`}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Standard price"
                            className={errors.sizeOptions?.[index]?.price_100_percent ? 'border-destructive' : ''}
                          />
                          {errors.sizeOptions?.[index]?.price_100_percent && (
                            <p className="text-xs text-destructive">{errors.sizeOptions[index].price_100_percent?.message}</p>
                          )}
                        </div>

                        <div className="col-span-3 space-y-2">
                          <Label htmlFor={`sizeOptions.${index}.price_50_percent`}>50% Price (₹) *</Label>
                          <Input
                            id={`sizeOptions.${index}.price_50_percent`}
                            {...register(`sizeOptions.${index}.price_50_percent`, { valueAsNumber: true })}
                            name={`sizeOptions.${index}.price_50_percent`}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Wholesale price"
                            className={errors.sizeOptions?.[index]?.price_50_percent ? 'border-destructive' : ''}
                          />
                          {errors.sizeOptions?.[index]?.price_50_percent && (
                            <p className="text-xs text-destructive">{errors.sizeOptions[index].price_50_percent?.message}</p>
                          )}
                        </div>

                        <div className="col-span-2 space-y-2">
                          <Label htmlFor={`sizeOptions.${index}.stock`}>Stock</Label>
                          <Input
                            id={`sizeOptions.${index}.stock`}
                            {...register(`sizeOptions.${index}.stock`, { valueAsNumber: true })}
                            name={`sizeOptions.${index}.stock`}
                            type="number"
                            min="0"
                            placeholder="0"
                          />
                        </div>

                        <div className="col-span-2 space-y-2">
                          <Label htmlFor={`sizeOptions.${index}.availability`} className="flex items-center gap-2">
                            Available
                            <input
                              id={`sizeOptions.${index}.availability`}
                              name={`sizeOptions.${index}.availability`}
                              type="checkbox"
                              {...register(`sizeOptions.${index}.availability`)}
                              className="rounded"
                            />
                          </Label>
                        </div>

                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSize(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {errors.sizeOptions && (
                    <p className="text-sm text-destructive">{errors.sizeOptions.message}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specs' && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Technical Specifications</h3>
                    <Button type="button" onClick={addSpecificationRow} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Spec
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {specFields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-5 space-y-2">
                          <Label htmlFor={`specifications.${index}.key`}>Property</Label>
                          <Input
                            id={`specifications.${index}.key`}
                            {...register(`specifications.${index}.key`)}
                            name={`specifications.${index}.key`}
                            placeholder="e.g., Pressure Rating"
                            className={errors.specifications?.[index]?.key ? 'border-destructive' : ''}
                            autoComplete="off"
                          />
                          {errors.specifications?.[index]?.key && (
                            <p className="text-xs text-destructive">{errors.specifications[index].key?.message}</p>
                          )}
                        </div>

                        <div className="col-span-6 space-y-2">
                          <Label htmlFor={`specifications.${index}.value`}>Value</Label>
                          <Input
                            id={`specifications.${index}.value`}
                            {...register(`specifications.${index}.value`)}
                            name={`specifications.${index}.value`}
                            placeholder="e.g., 10-15 kg/cm²"
                            className={errors.specifications?.[index]?.value ? 'border-destructive' : ''}
                            autoComplete="off"
                          />
                          {errors.specifications?.[index]?.value && (
                            <p className="text-xs text-destructive">{errors.specifications[index].value?.message}</p>
                          )}
                        </div>

                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSpec(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="pressureRating">Pressure Rating</Label>
                      <Input
                        id="pressureRating"
                        {...register('pressureRating')}
                        name="pressureRating"
                        placeholder="e.g., 10-15 kg/cm²"
                        autoComplete="off"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="temperatureRange">Temperature Range</Label>
                      <Input
                        id="temperatureRange"
                        {...register('temperatureRange')}
                        name="temperatureRange"
                        placeholder="e.g., -20°C to 120°C"
                        autoComplete="off"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="standards">Standards</Label>
                      <Input
                        id="standards"
                        {...register('standards')}
                        name="standards"
                        placeholder="e.g., IS / ISO / DIN"
                        autoComplete="off"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="application">Application</Label>
                      <Input
                        id="application"
                        {...register('application')}
                        name="application"
                        placeholder="e.g., Water supply, Drainage"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || isLoading} className="gap-2">
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ProductDetailEnhanced;
