import { LocalizedLabel, LanguageCode } from '../types/schema';

// Resolves a localized label string or object based on the active locale with fallbacks
export function resolveLabel(label: LocalizedLabel | undefined | null, locale: LanguageCode = 'en'): string {
  if (!label) return '';
  if (typeof label === 'string') return label;

  if (typeof label === 'object' && label !== null) {
    if (label[locale]) {
      return label[locale];
    }
    // Fallback resolution order: en -> fa -> first available key
    if (label['en']) return label['en'];
    if (label['fa']) return label['fa'];
    const keys = Object.keys(label);
    if (keys.length > 0) return label[keys[0]];
  }

  return String(label);
}

// Validates schema version compatibility against Simurgh Protocol v1.6.x
export function isSchemaVersionSupported(version: string): {
  supported: boolean;
  isMajorMismatch: boolean;
  message?: string;
} {
  if (!version) return { supported: false, isMajorMismatch: true, message: 'Missing $schema_version property in schema response.' };

  const parts = version.replace(/^v/, '').split('.');
  const major = parseInt(parts[0], 10);
  const minor = parseInt(parts[1], 10);

  if (major !== 1) {
    return {
      supported: false,
      isMajorMismatch: true,
      message: `Fatal schema version mismatch: Protocol major version ${major}.x is incompatible with expected 1.6.x engine.`
    };
  }

  if (minor !== 6) {
    return {
      supported: true,
      isMajorMismatch: false,
      message: `Minor version variance (${version}). Operating under SemVer-tolerant protocol mode.`
    };
  }

  return { supported: true, isMajorMismatch: false };
}
