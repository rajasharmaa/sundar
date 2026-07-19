"use strict";
const axios = require('axios');
/**
 * Get client IP address from request
 */
const getClientIP = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.ip ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        '127.0.0.1';
};
/**
 * Detect device type from user agent
 */
const getDeviceType = (userAgent) => {
    if (!userAgent)
        return 'desktop';
    const ua = userAgent.toLowerCase();
    if (/mobile/i.test(ua))
        return 'mobile';
    if (/tablet/i.test(ua))
        return 'tablet';
    return 'desktop';
};
/**
 * Extract browser information from user agent
 */
const getBrowserInfo = (userAgent) => {
    if (!userAgent)
        return 'Unknown';
    const ua = userAgent;
    if (ua.indexOf('Firefox') > -1)
        return 'Firefox';
    if (ua.indexOf('SamsungBrowser') > -1)
        return 'Samsung Internet';
    if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1)
        return 'Opera';
    if (ua.indexOf('Trident') > -1)
        return 'Internet Explorer';
    if (ua.indexOf('Edge') > -1)
        return 'Edge';
    if (ua.indexOf('Chrome') > -1)
        return 'Chrome';
    if (ua.indexOf('Safari') > -1)
        return 'Safari';
    return 'Unknown';
};
/**
 * Get operating system from user agent
 */
const getOS = (userAgent) => {
    if (!userAgent)
        return 'Unknown';
    const ua = userAgent.toLowerCase();
    if (ua.indexOf('win') > -1)
        return 'Windows';
    if (ua.indexOf('mac') > -1)
        return 'macOS';
    if (ua.indexOf('linux') > -1)
        return 'Linux';
    if (ua.indexOf('android') > -1)
        return 'Android';
    if (ua.indexOf('ios') > -1 || ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1)
        return 'iOS';
    return 'Unknown';
};
/**
 * Get location data from IP using free ip-api.com
 * Rate limit: 45 requests per minute (free tier)
 */
const getLocationFromIP = async (ip) => {
    try {
        // Skip for localhost
        if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
            return {
                city: 'Local',
                state: 'Local',
                country: 'Localhost',
                countryCode: 'XX',
                isp: 'Local Network'
            };
        }
        const response = await axios.get(`http://ip-api.com/json/${ip}`, {
            timeout: 3000,
            params: {
                fields: 'city,region,country,countryCode,isp,status,message'
            }
        });
        const data = response.data;
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
    }
    catch (error) {
        console.error('IP Geolocation error:', error.message);
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
 * Collect all client information from request
 */
const collectClientData = async (req) => {
    const userAgent = req.headers['user-agent'] || '';
    const ip = getClientIP(req);
    const [deviceType, browser, os, location] = await Promise.all([
        Promise.resolve(getDeviceType(userAgent)),
        Promise.resolve(getBrowserInfo(userAgent)),
        Promise.resolve(getOS(userAgent)),
        getLocationFromIP(ip)
    ]);
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
module.exports = {
    getClientIP,
    getDeviceType,
    getBrowserInfo,
    getOS,
    getLocationFromIP,
    collectClientData
};
