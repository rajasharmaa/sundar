import { ENV_CONFIG } from '../config/environment';

/**
 * Helper to download the currently active industrial catalog.
 * Supports dynamically uploaded PDFs and external document URLs from the database.
 * Downloads the file directly without navigating away from the current page.
 */
export const getActiveCatalogInfo = () => {
  if (typeof window === 'undefined') {
    return { name: 'Sundar Corporation Default Catalog (PDF)', type: 'default' };
  }
  
  const uploadedUrl = localStorage.getItem('Sundar Corporation_uploaded_catalog_url');
  const uploadedName = localStorage.getItem('Sundar Corporation_uploaded_catalog_name');
  
  if (uploadedUrl) {
    return { name: uploadedUrl, type: 'url', url: uploadedUrl };
  }
  
  if (uploadedName) {
    return { name: uploadedName, type: 'local' };
  }
  
  return { name: 'Sundar Corporation Default Catalog (PDF)', type: 'default' };
};

/**
 * Triggers a file download via a temporary hidden anchor element.
 */
const triggerDownload = (url: string, filename: string = 'Sundar Corporation-Corporation-Catalog.pdf') => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  // Clean up after a short delay
  setTimeout(() => {
    document.body.removeChild(a);
  }, 1000);
};

export const downloadCatalog = async () => {
  const fallbackUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  const uploadedUrl = typeof window !== 'undefined' ? localStorage.getItem('Sundar Corporation_uploaded_catalog_url') : null;
  const uploadedLocal = typeof window !== 'undefined' ? localStorage.getItem('Sundar Corporation_uploaded_catalog') : null;

  // 1. If we already have a URL in localStorage, download immediately
  if (uploadedUrl) {
    triggerDownload(uploadedUrl);
    return true;
  }
  if (uploadedLocal) {
    triggerDownload(uploadedLocal);
    return true;
  }

  // 2. Fetch the active catalog URL from the backend, then download
  const apiUrl = ENV_CONFIG.API_URL;
  try {
    const res = await fetch(`${apiUrl}/catalog`);
    if (!res.ok) throw new Error('Response status error');
    const result = await res.json();
    if (result && result.success && result.data && result.data.url) {
      triggerDownload(result.data.url, result.data.name ? `${result.data.name}.pdf` : undefined);
    } else {
      triggerDownload(fallbackUrl);
    }
  } catch (err) {
    console.error('Failed to load dynamic catalog link:', err);
    triggerDownload(fallbackUrl);
  }

  return true;
};
