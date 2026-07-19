import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api/api-client';
import { SiteSettings } from '@/types';
import logger from '@/lib/logger';

export const DEFAULT_SETTINGS: SiteSettings = {
  logo: '/logo.png',
  founderImage: '/Screenshot 2026-01-01 191041.png',
  virtualTour: {
    previewImage: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepjyX6xJHm-216BZ1vzDXikePTc4uDDEnZhL4oTgHcpAGvPKmcceZzpyXMPoytyKoTC6sCMqpqMmDljZ9WR6RNAVOexJZiBRFUprFFh4pnKrC6OQUDbqsWgJmeZDXtjxHVur_6O=s1360-w1360-h1020-rw',
    iframeUrl: 'https://www.google.com/maps/embed?pb=!4v1712345678901!6m8!1m7!1sCAoSLEFGMVFpcE5fYzJXNkVHdF9Qb2tqTjBYYmhRZUxWQkZGNGRiS1RrVGNMZ3p3!2m2!1d22.717964!2d75.857387!3f339.9!4f0!5f0.7820865974627469',
    googleMapsUrl: 'https://www.google.com/local/place/fid/0x3962fd11bc280595:0xffd5a99f38fa3a02/photosphere?iu=https://lh3.googleusercontent.com/gps-cs-s/APNQkAH3zS9KNKBpaUEnvLKTl0CspSSuOyJyOuzW-KERYNPHjT06rOFSE0U7FxktNcYGm3fy3ldzkNlSVaWxQ4X1_bHj-Von_NIxN9gBOIKyJkswYiW_smhjel-RLS-ux1rlaidrXCdG%3Dw160-h106-k-no-pi0-ya339.9-ro-0-fo100&ik=CAoSF0NJSE0wb2dLRUlDQWdJRFNuZTd2clFF'
  },
  shopPhotos: [
    {
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweqgLB9yVgiMyQhTQR76qltycH7dCvQbyaLD68eqONCZxOhkKi3QY0eVh5-CmdWucsgVECLETk-NK1DT738kZB-qrADr6QNf6zF7VnzF0O35xBZqL_RFBUjNhU5-hYzXDk3V1A5D=s1360-w1360-h1020-rw',
      caption: 'Main Showroom',
      description: 'Experience our extensive range of premium industrial fittings.'
    },
    {
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweofwt3aI2ZzdlAuOiwzd00uT4cWGzHn5zwXQSUoZKS3OX_la-MjcY8U0sA6zaRBGxDvnHYCloIHkmsFQ4I8XeucpIJp5DPytZw9mBZ5qvoW2SnW8jqHQoTjpOE1Nd_z23mQR0nN=s1360-w1360-h1020-rw',
      caption: 'Product Showcase',
      description: 'Precision-engineered products for every industrial need.'
    },
    {
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepjyX6xJHm-216BZ1vzDXikePTc4uDDEnZhL4oTgHcpAGvPKmcceZzpyXMPoytyKoTC6sCMqpqMmDljZ9WR6RNAVOexJZiBRFUprFFh4pnKrC6OQUDbqsWgJmeZDXtjxHVur_6O=s1360-w1360-h1020-rw',
      caption: 'Smart Warehouse',
      description: 'Strategic storage ensuring lightning-fast delivery pan-India.'
    },
    {
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweqzzQ_prGTZtQplO5rJTK1Vd8RkGpbv8ao3uw1WwxZXFsWh2MH3Bx_OHcCneuO-dA0d1iK5UwteeHMt-Or3ALlmhmkpD2AaqY4fnKApr8-XHcpI7Crtck_JoPFri36IsZdxdaY=s1360-w1360-h1020-rw',
      caption: 'Quality Lab',
      description: 'Rigorous testing to maintain our legacy of trust since 2011.'
    }
  ],
  banners: []
};

export const useSiteSettings = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      try {
        const response = await api.settings.get();
        if (response && response.success && response.data) {
          return response.data;
        }
        return DEFAULT_SETTINGS;
      } catch (err) {
        logger.error('Failed to fetch site settings in useSiteSettings', err);
        return DEFAULT_SETTINGS;
      }
    },
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  const settings = data || DEFAULT_SETTINGS;

  return {
    settings,
    isLoading,
    error,
    refetch
  };
};
