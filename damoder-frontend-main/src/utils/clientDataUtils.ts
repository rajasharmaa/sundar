/**
 * Client Data Collection Utilities
 * Automatically collect user data for inquiry tracking
 */

/**
 * Get device type from user agent
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const ua = navigator.userAgent.toLowerCase();
  
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet/i.test(ua)) return 'tablet';
  return 'desktop';
};

/**
 * Get browser information
 */
export const getBrowserInfo = (): string => {
  const ua = navigator.userAgent;
  
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('SamsungBrowser') > -1) return 'Samsung Internet';
  if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
  if (ua.indexOf('Trident') > -1) return 'Internet Explorer';
  if (ua.indexOf('Edge') > -1) return 'Edge';
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1) return 'Safari';
  
  return 'Unknown';
};

/**
 * Get operating system
 */
export const getOS = (): string => {
  const platform = navigator.platform.toLowerCase();
  const ua = navigator.userAgent.toLowerCase();
  
  if (platform.indexOf('win') > -1) return 'Windows';
  if (platform.indexOf('mac') > -1) return 'macOS';
  if (platform.indexOf('linux') > -1) return 'Linux';
  if (ua.indexOf('android') > -1) return 'Android';
  if (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1) return 'iOS';
  
  return 'Unknown';
};

/**
 * Get IP address using ipify API (free, no rate limit)
 */
export const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Get location from IP using ip-api.com (free, 45 req/min)
 */
export const getLocationFromIP = async (ip?: string): Promise<{
  city: string;
  state: string;
  country: string;
  countryCode: string;
  isp: string;
}> => {
  try {
    const url = ip 
      ? `http://ip-api.com/json/${ip}?fields=city,region,country,countryCode,isp,status,message`
      : `http://ip-api.com/json/?fields=city,region,country,countryCode,isp,status,message`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        city: data.city || 'Unknown',
        state: data.region || 'Unknown',
        country: data.country || 'Unknown',
        countryCode: data.countryCode || 'XX',
        isp: data.isp || 'Unknown ISP'
      };
    }
    
    return {
      city: 'Unknown',
      state: 'Unknown',
      country: 'Unknown',
      countryCode: 'XX',
      isp: 'Unknown ISP'
    };
  } catch (error) {
    return {
      city: 'Unknown',
      state: 'Unknown',
      country: 'Unknown',
      countryCode: 'XX',
      isp: 'Unknown ISP'
    };
  }
};

/**
 * Collect all client data at once
 */
export const collectClientData = async () => {
  const deviceType = getDeviceType();
  const browser = getBrowserInfo();
  const os = getOS();
  const userAgent = navigator.userAgent;
  
  let ip = 'Unknown';
  let location = {
    city: 'Unknown',
    state: 'Unknown',
    country: 'Unknown',
    countryCode: 'XX',
    isp: 'Unknown ISP'
  };
  
  try {
    [ip, location] = await Promise.all([
      getClientIP(),
      getLocationFromIP()
    ]);
  } catch (error) {
    // Silently handle errors - client data is optional
  }
  
  return {
    ipAddress: ip,
    deviceType,
    browser,
    os,
    userAgent,
    city: location.city,
    state: location.state,
    country: location.country,
    countryCode: location.countryCode,
    isp: location.isp
  };
};

/**
 * Get current page URL
 */
export const getCurrentPageUrl = (): string => {
  return window.location.href;
};

/**
 * Get referrer URL
 */
export const getReferrer = (): string => {
  return document.referrer || 'Direct';
};
