// src/utils/clientCodeValidator.ts

const SALT = 'segmentor_salt_2024';

// Simple hashing function using built-in string methods
function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

interface ValidationResult {
  valid: boolean;
  effects: string[];
  message: string;
}

export function validateCode(code: string): ValidationResult {
    console.log('Validating code:', code, 'Hash:', hashCode(code + SALT));
  const hashedCode = hashCode(code + SALT);
  
  // Known valid code hashes
  const premiumCodeHashes = [
    "eba57384", 
    "6c2c06bb", 
    "a12feac1", 
    "4f7d3e2a",
    "19fbde4f", 
  ];

  const logoCodeHashes = [
    "2893efb4",
    "6935e34e", 
    "2cd4d614", 
    "5d0a5fde", 
    "55ea8b",   
    "f01ffe08",
    "4f1eb86d",
  ];

  // Other feature code hashes
  const featureCodeHashes = [
    "a36af37f", 
    "1ae88e27", 
    "c73c4734", 
    "6656a34a", 
  ];

  // Logic for validation
  const isCustomLogoCode = code.startsWith('SM-MY-LOGO-');
  
  // Validate the code
  let effects: string[] = [];
  let message = '';

  if (premiumCodeHashes.includes(hashedCode)) {
    effects.push('premium');
    message = 'Premium features unlocked successfully';
  } else if (logoCodeHashes.includes(hashedCode)) {
    if (hashedCode === "55ea8b") {
      effects.push('HIDE_WATERMARK');
      message = 'Watermark has been hidden';
    } else if (hashedCode === "f01ffe08") {
      effects.push('SHOW_WATERMARK');
      message = 'Watermark has been shown';
    } else {
      effects.push('logo');
      message = 'Logo settings updated successfully';
    }
  } else if (featureCodeHashes.includes(hashedCode)) {
    effects.push('feature');
    message = 'Feature activated successfully';
  } else if (isCustomLogoCode) {
    // Extract the URL part after "SM-MY-LOGO-"
    const logoUrl = code.substring('SM-MY-LOGO-'.length);
    
    if (logoUrl && logoUrl.length > 0) {
      effects.push('CUSTOM_LOGO');
      effects.push(`CUSTOM_LOGO_URL:${logoUrl}`);
      message = `Custom logo set successfully: ${logoUrl}`;
    } else {
      return { 
        valid: false, 
        effects: [],
        message: 'Invalid custom logo code - no URL provided' 
      };
    }
  } else {
    return { 
      valid: false, 
      effects: [],
      message: 'Invalid code' 
    };
  }

  return { 
    valid: true, 
    effects,
    message
  };
}

// Store activated codes in localStorage for persistence
export function storeActivatedCode(code: string, effects: string[]): void {
  try {
    const storedCodes = localStorage.getItem('activated_codes') || '{}';
    const activatedCodes = JSON.parse(storedCodes);
    
    // Store with timestamp
    activatedCodes[code] = {
      effects,
      activatedAt: Date.now()
    };
    
    localStorage.setItem('activated_codes', JSON.stringify(activatedCodes));
  } catch (error) {
    console.error('Error storing activated code:', error);
  }
}

// Load all activated effects
export function loadActivatedEffects(): Set<string> {
  try {
    const storedCodes = localStorage.getItem('activated_codes') || '{}';
    const activatedCodes = JSON.parse(storedCodes);
    
    const effects = new Set<string>();
    
    Object.values(activatedCodes).forEach((codeData: any) => {
      if (Array.isArray(codeData.effects)) {
        codeData.effects.forEach((effect: string) => effects.add(effect));
      }
    });
    
    return effects;
  } catch (error) {
    console.error('Error loading activated effects:', error);
    return new Set();
  }
}