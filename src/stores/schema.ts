import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { RootSchemaPayload, ResourceMeta, LanguageCode, Direction, CustomFontMeta } from '../types/schema';
import { adminApi } from '../services/api';
import { resolveLabel, isSchemaVersionSupported } from '../utils/resolveLabel';
import { getAppConfig } from '../services/api';

// Helper function to inject dynamic @font-face CSS rules into <head>
function injectCustomFonts(fonts?: CustomFontMeta[]) {
  if (typeof document === 'undefined') return;

  let styleEl = document.getElementById('simurgh-custom-fonts') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'simurgh-custom-fonts';
    document.head.appendChild(styleEl);
  }

  if (!fonts || fonts.length === 0) {
    styleEl.textContent = '';
    return;
  }

  const cssRules = fonts.map(font => {
    const formatAttr = font.format ? ` format('${font.format}')` : '';
    return `@font-face { font-family: '${font.name}'; src: url('${font.url}')${formatAttr}; font-display: swap; }`;
  }).join('\n');

  styleEl.textContent = cssRules;
}

// Pinia store managing the active Simurgh Protocol schema, active locale, direction, and resource selection
export const useSchemaStore = defineStore('schema', () => {
  const schema = ref<RootSchemaPayload | null>(null);
  const loading = ref(true);
  const bootError = ref<string | null>(null);
  const activeLocale = ref<LanguageCode>('en');
  const direction = ref<Direction>('ltr');
  const activeResourceName = ref<string>('');

  const logoUrl = computed<string>(() => {
    return schema.value?.system?.logo_url || '/simurgh-logo.svg';
  });

  const systemTitle = computed<string>(() => {
    if (schema.value?.system?.title) {
      return resolveLabel(schema.value.system.title, activeLocale.value) || 'Simurgh Panel';
    }
    return 'Simurgh Panel';
  });

  const resources = computed<ResourceMeta[]>(() => {
    return schema.value?.resources || [];
  });

  const sidebarResources = computed<ResourceMeta[]>(() => {
    return resources.value.filter(
      r => r.display_in_sidebar !== false && r.permissions?.can_view !== false
    );
  });

  const activeResource = computed<ResourceMeta | null>(() => {
    if (!activeResourceName.value || !resources.value.length) return null;
    return (
      resources.value.find(
        r => r.plural_name === activeResourceName.value || r.name === activeResourceName.value
      ) || null
    );
  });

  // Loads and validates protocol schema from embedded script tag or API endpoint
  async function fetchSchema() {
    loading.value = true;
    bootError.value = null;

    try {
      const data = await adminApi.getSchema();

      // Validate schema protocol SemVer major version compatibility
      const versionCheck = isSchemaVersionSupported(data.$schema_version);
      if (versionCheck.isMajorMismatch) {
        bootError.value = versionCheck.message || 'Fatal schema protocol version mismatch';
        loading.value = false;
        return;
      }

      schema.value = data;

      // Apply initial System Locale and Direction with fallbacks
      const initialLocale = data.system?.default_locale || 'en';
      const initialDir = data.system?.direction || 'ltr';
      setLocale(initialLocale);
      setDirection(initialDir);

      // Select first authorized resource
      if (!activeResourceName.value && sidebarResources.value.length > 0) {
        const first = sidebarResources.value[0];
        activeResourceName.value = first.plural_name || first.name;
      }
    } catch (err: any) {
      bootError.value =
        err?.message ||
        'Failed to parse embedded schema tag (<script id="simurgh-schema">)';
    } finally {
      loading.value = false;
    }
  }

  function setLocale(newLocale: LanguageCode) {
    activeLocale.value = newLocale;
    document.documentElement.lang = newLocale;
    const newDir: Direction = newLocale === 'fa' || newLocale === 'ar' ? 'rtl' : 'ltr';
    setDirection(newDir);
    document.title = systemTitle.value;
  }

  function setDirection(newDir: Direction) {
    direction.value = newDir;
    document.documentElement.dir = newDir;
  }

  function toggleDirection() {
    setDirection(direction.value === 'rtl' ? 'ltr' : 'rtl');
  }

  function setActiveResource(resourceName: string) {
    activeResourceName.value = resourceName;
  }

  // Watch custom_fonts in schema and inject @font-face rules dynamically
  watch(
    () => schema.value?.system?.custom_fonts,
    (customFonts) => {
      injectCustomFonts(customFonts);
    },
    { immediate: true, deep: true }
  );

  return {
    schema,
    loading,
    bootError,
    activeLocale,
    direction,
    activeResourceName,
    logoUrl,
    systemTitle,
    resources,
    sidebarResources,
    activeResource,
    fetchSchema,
    setLocale,
    setDirection,
    toggleDirection,
    setActiveResource
  };
});
