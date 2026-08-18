// 🔐 Enhanced Security Constants
const COMMON_PASSWORDS_DEFAULT = [
  // Common weak passwords
  'password', '123456', 'qwerty', 'admin', 'welcome',
  'password123', 'letmein', 'monkey', 'dragon', 'sunshine',
  'master', 'hello', 'freedom', 'whatever', 'qazwsx',
  'trustno1', '654321', 'superman', '1qaz2wsx', 'qwertyuiop',
  '1234567890', '12345678', '123123', '111111', 'passw0rd',
  // Business-specific weak passwords
  'sundar', 'corporation', 'industrial', 'supplies',
  'company', 'business', 'work123', 'office',
  // Keyboard patterns
  'asdfgh', 'zxcvbn', '123456789', '987654321'
];

const COMMON_PASSWORDS = process.env.COMMON_PASSWORDS
  ? process.env.COMMON_PASSWORDS.split(',').map(p => p.trim().toLowerCase())
  : COMMON_PASSWORDS_DEFAULT;

// 🔒 Character class definitions for validation
const CHARACTER_CLASSES = {
  UPPERCASE: /[A-Z]/,
  LOWERCASE: /[a-z]/,
  NUMBERS: /\d/,
  SPECIAL: /[!@#$%^&*(),.?":{}|<>[\]\\/_+=~-]/,
  UNICODE: /[\u0080-\uFFFF]/ // Extended Unicode characters
};

// 🔐 Validation thresholds
const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 12, // Increased from 8 for better security
  MAX_LENGTH: 128,
  MIN_CHARACTER_CLASSES: 4, // Must include uppercase, lowercase, number, special
  MAX_REPEATING_CHARS: 2,   // No more than 2 consecutive identical characters
  MAX_SEQUENTIAL_CHARS: 3   // No more than 3 sequential characters (abc, 123)
};

/**
 * 🔐 Enhanced password validation with comprehensive security checks
 * @param {string} password - The password to validate
 * @returns {{isValid: boolean, validations: Object, score: number, feedback: string[]}}
 */
function validatePassword(password) {
  if (typeof password !== 'string') {
    return {
      isValid: false,
      validations: {},
      score: 0,
      feedback: ['Password must be a string']
    };
  }

  // 🔒 Basic structure validation
  const validations = {
    // Length requirements
    minLength: password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH,
    maxLength: password.length <= PASSWORD_REQUIREMENTS.MAX_LENGTH,

    // Character diversity
    hasUppercase: CHARACTER_CLASSES.UPPERCASE.test(password),
    hasLowercase: CHARACTER_CLASSES.LOWERCASE.test(password),
    hasNumber: CHARACTER_CLASSES.NUMBERS.test(password),
    hasSpecial: CHARACTER_CLASSES.SPECIAL.test(password),

    // Security restrictions
    noSpaces: !/\s/.test(password),
    notCommon: !COMMON_PASSWORDS.includes(password.toLowerCase()),
    noRepeatingChars: !/(.)\1{PASSWORD_REQUIREMENTS.MAX_REPEATING_CHARS,}/.test(password),

    // Advanced pattern detection
    noSequentialChars: !hasSequentialCharacters(password),
    noKeyboardPatterns: !hasKeyboardPatterns(password),
    sufficientEntropy: calculatePasswordEntropy(password) >= 60
  };

  // 🔐 Calculate character class diversity score
  const characterClasses = [
    validations.hasUppercase,
    validations.hasLowercase,
    validations.hasNumber,
    validations.hasSpecial
  ].filter(Boolean).length;

  validations.minCharacterClasses = characterClasses >= PASSWORD_REQUIREMENTS.MIN_CHARACTER_CLASSES;

  // 🔐 Overall validity check
  const isValid = Object.values(validations).every(v => v === true);

  // 🔒 Password strength scoring (0-100)
  const score = calculatePasswordScore(password, validations);

  // 🔐 Generate user feedback
  const feedback = generatePasswordFeedback(validations, password);

  return {
    isValid,
    validations,
    score,
    feedback,
    characterClasses
  };
}

/**
 * 🔐 Checks for sequential characters (abc, 123, etc.)
 * @param {string} password
 * @returns {boolean}
 */
function hasSequentialCharacters(password) {
  const lowerPassword = password.toLowerCase();

  // Check letter sequences
  for (let i = 0; i <= lowerPassword.length - PASSWORD_REQUIREMENTS.MAX_SEQUENTIAL_CHARS; i++) {
    const substring = lowerPassword.substring(i, i + PASSWORD_REQUIREMENTS.MAX_SEQUENTIAL_CHARS);
    if (isSequentialString(substring)) return true;
  }

  return false;
}

/**
 * 🔐 Checks if a string is sequential (abc, 123, etc.)
 * @param {string} str
 * @returns {boolean}
 */
function isSequentialString(str) {
  if (str.length < 2) return false;

  // Check ascending sequence
  let isAscending = true;
  for (let i = 1; i < str.length; i++) {
    if (str.charCodeAt(i) !== str.charCodeAt(i - 1) + 1) {
      isAscending = false;
      break;
    }
  }

  // Check descending sequence
  let isDescending = true;
  for (let i = 1; i < str.length; i++) {
    if (str.charCodeAt(i) !== str.charCodeAt(i - 1) - 1) {
      isDescending = false;
      break;
    }
  }

  return isAscending || isDescending;
}

/**
 * 🔐 Detects common keyboard patterns
 * @param {string} password
 * @returns {boolean}
 */
function hasKeyboardPatterns(password) {
  const lowerPassword = password.toLowerCase();
  const keyboardPatterns = [
    'qwerty', 'asdfgh', 'zxcvbn', '123456', '098765',
    'qwertz', 'qazwsx', 'wsxedc', 'edcrfv', 'rfvtgb'
  ];

  return keyboardPatterns.some(pattern =>
    lowerPassword.includes(pattern) ||
    lowerPassword.includes(pattern.split('').reverse().join(''))
  );
}

/**
 * 🔐 Calculates password entropy
 * @param {string} password
 * @returns {number}
 */
function calculatePasswordEntropy(password) {
  if (!password) return 0;

  const charsetSize = [
    CHARACTER_CLASSES.UPPERCASE.test(password) ? 26 : 0,
    CHARACTER_CLASSES.LOWERCASE.test(password) ? 26 : 0,
    CHARACTER_CLASSES.NUMBERS.test(password) ? 10 : 0,
    CHARACTER_CLASSES.SPECIAL.test(password) ? 32 : 0,
    CHARACTER_CLASSES.UNICODE.test(password) ? 1000 : 0 // Approximation
  ].reduce((sum, val) => sum + val, 0);

  return Math.log2(Math.pow(charsetSize, password.length));
}

/**
 * 🔐 Calculates password strength score (0-100)
 * @param {string} password
 * @param {Object} validations
 * @returns {number}
 */
function calculatePasswordScore(password, validations) {
  let score = 0;

  // Base score from length (up to 30 points)
  score += Math.min(30, (password.length / PASSWORD_REQUIREMENTS.MIN_LENGTH) * 15);

  // Character diversity (up to 40 points)
  const classes = [
    validations.hasUppercase,
    validations.hasLowercase,
    validations.hasNumber,
    validations.hasSpecial
  ].filter(Boolean).length;
  score += classes * 10;

  // Entropy bonus (up to 20 points)
  const entropy = calculatePasswordEntropy(password);
  score += Math.min(20, entropy / 5);

  // Penalty for weak patterns (-20 points max)
  if (!validations.notCommon) score -= 15;
  if (!validations.noSequentialChars) score -= 10;
  if (!validations.noKeyboardPatterns) score -= 10;
  if (!validations.noRepeatingChars) score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 🔐 Generates user-friendly feedback for password issues
 * @param {Object} validations
 * @param {string} password
 * @returns {string[]}
 */
function generatePasswordFeedback(validations, password) {
  const feedback = [];

  if (!validations.minLength) {
    feedback.push(`Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long`);
  }

  if (!validations.maxLength) {
    feedback.push(`Password must not exceed ${PASSWORD_REQUIREMENTS.MAX_LENGTH} characters`);
  }

  const missingClasses = [];
  if (!validations.hasUppercase) missingClasses.push('uppercase letters');
  if (!validations.hasLowercase) missingClasses.push('lowercase letters');
  if (!validations.hasNumber) missingClasses.push('numbers');
  if (!validations.hasSpecial) missingClasses.push('special characters');

  if (missingClasses.length > 0) {
    feedback.push(`Include: ${missingClasses.join(', ')}`);
  }

  if (!validations.noSpaces) {
    feedback.push('Remove spaces from password');
  }

  if (!validations.notCommon) {
    feedback.push('Avoid common passwords like "password" or "123456"');
  }

  if (!validations.noRepeatingChars) {
    feedback.push(`Avoid repeating characters more than ${PASSWORD_REQUIREMENTS.MAX_REPEATING_CHARS} times`);
  }

  if (!validations.noSequentialChars) {
    feedback.push('Avoid sequential characters like "abc" or "123"');
  }

  if (!validations.noKeyboardPatterns) {
    feedback.push('Avoid keyboard patterns like "qwerty"');
  }

  // Strength indicator
  const score = calculatePasswordScore(password, validations);
  if (score < 50) {
    feedback.push('🔴 Weak password - consider making it stronger');
  } else if (score < 80) {
    feedback.push('🟡 Medium strength password');
  } else {
    feedback.push('🟢 Strong password!');
  }

  return feedback;
}

/**
 * Validates an email address format (RFC 5322 compliant)
 * @param {string} email 
 * @returns {boolean}
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;

  // More comprehensive email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates Indian phone number format
 * @param {string} phone 
 * @returns {boolean}
 */
function validateIndianPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;

  // Remove spaces, dashes, parentheses
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  // Indian mobile: 10 digits starting with 6-9
  const indianMobileRegex = /^[6-9]\d{9}$/;
  // Landline: 2-4 digit area code + 6-8 digit number
  const landlineRegex = /^[2-9]\d{1,3}[2-9]\d{5,7}$/;

  return indianMobileRegex.test(cleanPhone) || landlineRegex.test(cleanPhone);
}

/**
 * Validates Indian PIN code
 * @param {string|number} pin 
 * @returns {boolean}
 */
function validateIndianPin(pin) {
  if (!pin) return false;
  const pinStr = String(pin);
  return /^\d{6}$/.test(pinStr) && pinStr !== '000000';
}

/**
 * Validates URL format
 * @param {string} url 
 * @returns {boolean}
 */
function validateUrl(url) {
  if (!url || typeof url !== 'string') return false;

  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * 🔐 Enhanced search query sanitization with security focus
 * @param {string} query 
 * @param {Object} options
 * @returns {string}
 */
function sanitizeSearchQuery(query, options = {}) {
  const defaults = {
    maxLength: 100,
    allowUnicode: true,
    escapeHtml: true,
    removeSpecial: true
  };

  const config = { ...defaults, ...options };

  if (!query || typeof query !== 'string') return '';

  let sanitized = query;

  // 🔒 Length limitation
  sanitized = sanitized.substring(0, config.maxLength);

  // 🔐 Remove or escape dangerous characters
  if (config.removeSpecial) {
    // Remove control characters and dangerous symbols
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, ''); // Control chars
    sanitized = sanitized.replace(/[<>]/g, ''); // HTML tags
    sanitized = sanitized.replace(/["']/g, ''); // Quotes
    sanitized = sanitized.replace(/[{}]/g, ''); // Braces
    sanitized = sanitized.replace(/[()]/g, ''); // Parentheses
  }

  // 🔐 HTML entity encoding if requested
  if (config.escapeHtml) {
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  // 🔒 Unicode normalization if needed
  if (!config.allowUnicode) {
    sanitized = sanitized.replace(/[^\x20-\x7E]/g, '');
  }

  return sanitized.trim();
}

/**
 * 🔐 Comprehensive input sanitization for XSS prevention
 * @param {string} input 
 * @param {Object} options
 * @returns {string}
 */
function sanitizeInput(input, options = {}) {
  const defaults = {
    encodeHtml: true,
    removeScripts: true,
    removeUrls: false,
    maxLength: 1000
  };

  const config = { ...defaults, ...options };

  if (!input || typeof input !== 'string') return '';

  let sanitized = input;

  // 🔒 Length restriction
  sanitized = sanitized.substring(0, config.maxLength);

  // 🔐 Remove dangerous patterns
  if (config.removeScripts) {
    // Remove script tags and event handlers
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/vbscript:/gi, '');
    sanitized = sanitized.replace(/data:/gi, '');
  }

  // 🔐 Encode HTML entities
  if (config.encodeHtml) {
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // 🔐 Remove control characters
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized.trim();
}

/**
 * 🔐 Sanitize rich text content with allowed tags
 * @param {string} html 
 * @param {string[]} allowedTags
 * @returns {string}
 */
function sanitizeHtml(html, allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br']) {
  if (!html || typeof html !== 'string') return '';

  // 🔐 Remove all tags first
  let sanitized = html.replace(/<[^>]*>?/gm, '');

  // 🔐 Re-add allowed tags with proper escaping
  allowedTags.forEach(tag => {
    const regex = new RegExp(`&lt;(${tag})&gt;(.*?)&lt;\\/\\1&gt;`, 'gi');
    sanitized = sanitized.replace(regex, '<$1>$2</$1>');
  });

  // 🔐 Handle self-closing tags
  const selfClosingRegex = new RegExp(`&lt;(${allowedTags.join('|')})\\s*/?&gt;`, 'gi');
  sanitized = sanitized.replace(selfClosingRegex, '<$1 />');

  return sanitized;
}

/**
 * 🔐 Validate and sanitize numeric input
 * @param {*} value 
 * @param {Object} options
 * @returns {number|null}
 */
function sanitizeNumber(value, options = {}) {
  const defaults = {
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
    integer: false
  };

  const config = { ...defaults, ...options };

  // Convert to number
  const num = Number(value);

  // Validate
  if (isNaN(num) || !isFinite(num)) return null;
  if (num < config.min || num > config.max) return null;

  // Return integer or float
  return config.integer ? Math.floor(num) : num;
}

/**
 * 🔐 Sanitize and validate array input
 * @param {*} input 
 * @param {Function} validator
 * @returns {Array}
 */
function sanitizeArray(input, validator = null) {
  if (!Array.isArray(input)) return [];

  let sanitized = input
    .filter(item => item != null) // Remove null/undefined
    .slice(0, 100); // Limit array size

  if (validator && typeof validator === 'function') {
    sanitized = sanitized.filter(validator);
  }

  return sanitized;
}

/**
 * Validates MongoDB ObjectId
 * @param {string} id 
 * @returns {boolean}
 */
function validateObjectId(id) {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
}

module.exports = {
  // Validation functions
  validatePassword,
  validateEmail,
  validateIndianPhone,
  validateIndianPin,
  validateUrl,
  validateObjectId,

  // Sanitization functions
  sanitizeSearchQuery,
  sanitizeInput,
  sanitizeHtml,
  sanitizeNumber,
  sanitizeArray,

  // Security constants
  COMMON_PASSWORDS,
  CHARACTER_CLASSES,
  PASSWORD_REQUIREMENTS
};