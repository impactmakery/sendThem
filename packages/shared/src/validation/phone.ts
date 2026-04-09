/**
 * Israeli phone number normalization and validation.
 *
 * Handles formats:
 * - 05X-XXXXXXX → +9725XXXXXXXX
 * - 05XXXXXXXX  → +9725XXXXXXXX
 * - 972-5X-XXXXXXX → +9725XXXXXXXX
 * - +9725XXXXXXXX (already correct)
 */

const ISRAELI_MOBILE_LOCAL = /^0(5[0-9])[-\s]?(\d{3})[-\s]?(\d{4})$/;
const ISRAELI_MOBILE_INTL_NO_PLUS = /^972(5[0-9])[-\s]?(\d{3})[-\s]?(\d{4})$/;
const ISRAELI_MOBILE_INTL = /^\+972(5[0-9])[-\s]?(\d{3})[-\s]?(\d{4})$/;
const GENERIC_INTL = /^\+[1-9]\d{6,14}$/;

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string | null;
  wasAutoCorrected: boolean;
  error: string | null;
}

export function normalizeIsraeliPhone(raw: string): PhoneValidationResult {
  const cleaned = raw.trim().replace(/[-\s()]/g, '');

  // Already in +972 format
  const intlMatch = cleaned.match(/^\+972(5\d)(\d{7})$/);
  if (intlMatch) {
    return {
      isValid: true,
      normalized: `+972${intlMatch[1]}${intlMatch[2]}`,
      wasAutoCorrected: false,
      error: null,
    };
  }

  // 972 without plus
  const intlNoPlusMatch = cleaned.match(/^972(5\d)(\d{7})$/);
  if (intlNoPlusMatch) {
    return {
      isValid: true,
      normalized: `+972${intlNoPlusMatch[1]}${intlNoPlusMatch[2]}`,
      wasAutoCorrected: true,
      error: null,
    };
  }

  // Local format 05XXXXXXXX
  const localMatch = cleaned.match(/^0(5\d)(\d{7})$/);
  if (localMatch) {
    return {
      isValid: true,
      normalized: `+972${localMatch[1]}${localMatch[2]}`,
      wasAutoCorrected: true,
      error: null,
    };
  }

  // Generic international number (non-Israeli)
  if (GENERIC_INTL.test(cleaned)) {
    return {
      isValid: true,
      normalized: cleaned,
      wasAutoCorrected: false,
      error: null,
    };
  }

  return {
    isValid: false,
    normalized: null,
    wasAutoCorrected: false,
    error: 'Invalid phone number format',
  };
}
