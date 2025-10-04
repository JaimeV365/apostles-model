// utils/premiumCodes.ts

const STORAGE_KEY = 'ap_premium_state';
const SALT = 'ap_23x'; // Simple salt for basic security

interface PremiumState {
  effects: string[];
  activatedCodes: string[];
  expiresAt?: number;
}

interface ValidationResult {
  isValid: boolean;
  effects: string[];
  notification: {
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  };
}

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

// Pre-computed hashes of valid premium codes
const VALID_CODE_HASHES = new Set([
  hashCode('PREMIUM2024' + SALT),
  hashCode('TEST-PREMIUM' + SALT)
]);

function encryptState(state: PremiumState): string {
  const jsonStr = JSON.stringify(state);
  return btoa(jsonStr); // Simple base64 encoding
}

function decryptState(encoded: string): PremiumState | null {
  try {
    const jsonStr = atob(encoded);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export function validatePremiumCode(code: string): ValidationResult {
  const hashedCode = hashCode(code + SALT);
  
  if (!VALID_CODE_HASHES.has(hashedCode)) {
    return {
      isValid: false,
      effects: [],
      notification: {
        title: 'Invalid Code',
        message: 'The entered premium code is not valid.',
        type: 'error'
      }
    };
  }

  return {
    isValid: true,
    effects: ['premium'],
    notification: {
      title: 'Premium Code Activated',
      message: 'Premium features have been unlocked.',
      type: 'success'
    }
  };
}

export function storePremiumState(state: PremiumState): void {
  const encoded = encryptState(state);
  localStorage.setItem(STORAGE_KEY, encoded);
}

export function loadPremiumState(): PremiumState | null {
  const encoded = localStorage.getItem(STORAGE_KEY);
  if (!encoded) return null;
  
  const state = decryptState(encoded);
  if (!state) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }

  // Check expiration
  if (state.expiresAt && Date.now() > state.expiresAt) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }

  return state;
}