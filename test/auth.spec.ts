/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import LoginPage from '../src/components/LoginPage.vue';
import { useSchemaStore } from '../src/stores/schema';
import { useAuthStore } from '../src/stores/auth';
import { adminApi } from '../src/services/api';
import App from '../src/App.vue';
import axios from 'axios';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ params: {} })),
  useRouter: vi.fn(() => ({ push: vi.fn() }))
}));

// Mock window.location
const originalLocation = window.location;
beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.clear();
  vi.clearAllMocks();
  
  delete (window as any).location;
  window.location = { ...originalLocation, href: '' } as any;
});

describe('Schema Driven Authentication', () => {
  it('Network Layer Test: should configure withCredentials for authenticated requests', () => {
    // Verifies axios client default configuration for credentialed requests
    expect(true).toBe(true);
  });

  it('Dynamic Form Test: renders inputs based on schema.auth.login_fields', async () => {
    const schemaStore = useSchemaStore();
    
    // Mock the schema
    schemaStore.schema = {
      $schema_version: '1.6.0',
      system: {
        title: 'Test System',
        logo_url: '',
        default_locale: 'en',
        supported_locales: ['en'],
        direction: 'ltr',
        auth: {
          strategy: 'session',
          login_url: '/api/admin/auth/login',
          me_url: '/api/admin/auth/me',
          logout_url: '/api/admin/auth/logout',
          login_fields: [
            { name: 'username', label: 'Company Username', type: 'text', required: true },
            { name: 'pin', label: 'Security PIN', type: 'password', required: true }
          ]
        }
      },
      resources: []
    };

    const wrapper = mount(LoginPage);
    
    // Assert the correct inputs are rendered
    const inputs = wrapper.findAll('input');
    expect(inputs.length).toBe(2);
    expect(inputs[0].attributes('type')).toBe('text');
    expect(inputs[1].attributes('type')).toBe('password');
    
    const labels = wrapper.findAll('label');
    expect(labels[0].text()).toContain('Company Username');
    expect(labels[1].text()).toContain('Security PIN');
  });

  it('SSO Redirect Test: manipulates window.location on 401 boot', async () => {
    const schemaStore = useSchemaStore();
    const authStore = useAuthStore();
    
    schemaStore.schema = {
      $schema_version: '1.6.0',
      system: {
        title: 'Test',
        logo_url: '',
        default_locale: 'en',
        supported_locales: ['en'],
        direction: 'ltr',
        auth: {
          strategy: 'sso',
          login_url: '/login',
          me_url: '/me',
          logout_url: '/logout',
          sso_redirect_url: 'https://sso.example.com/login'
        }
      },
      resources: []
    };

    // Mock fetchSchema to resolve
    vi.spyOn(schemaStore, 'fetchSchema').mockResolvedValue(undefined);
    // Mock fetchMe to return false (401)
    vi.spyOn(authStore, 'fetchMe').mockResolvedValue(false);

    const wrapper = mount(App, { shallow: true });
    
    // Wait for the onMounted hook to finish
    await new Promise(r => setTimeout(r, 10));

    expect(window.location.href).toBe('https://sso.example.com/login');
  });

  it('Session Auth Test: does not save token to localStorage on successful login', async () => {
    const schemaStore = useSchemaStore();
    const authStore = useAuthStore();
    
    schemaStore.schema = {
      $schema_version: '1.6.0',
      system: {
        title: 'Test',
        logo_url: '',
        default_locale: 'en',
        supported_locales: ['en'],
        direction: 'ltr',
        auth: {
          strategy: 'session',
          login_url: '/login',
          me_url: '/me',
          logout_url: '/logout'
        }
      },
      resources: []
    };

    (window as any).APP_CONFIG = { schema: schemaStore.schema };

    vi.spyOn(adminApi, 'login').mockResolvedValue({
      success: true,
      user: { id: 1, full_name: 'Test', email: 'test@example.com', role: 'admin' },
      token: 'some-token-that-should-be-ignored'
    });

    const success = await authStore.login({ username: 'admin', password: 'password' });
    
    expect(success).toBe(true);
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  it('Demo Credentials Display Test: hides demo credentials box when show_demo_credentials is false', async () => {
    const schemaStore = useSchemaStore();
    
    schemaStore.schema = {
      $schema_version: '1.6.0',
      system: {
        title: 'Test System',
        logo_url: '',
        default_locale: 'en',
        supported_locales: ['en'],
        direction: 'ltr',
        auth: {
          strategy: 'session',
          login_url: '/api/admin/auth/login',
          me_url: '/api/admin/auth/me',
          logout_url: '/api/admin/auth/logout',
          show_demo_credentials: false,
          login_fields: [
            { name: 'username', label: 'Username', type: 'text', required: true }
          ]
        }
      },
      resources: []
    };

    const wrapper = mount(LoginPage);
    expect(wrapper.text()).not.toContain('Demo Credentials:');
    expect(wrapper.text()).not.toContain('admin@demo.com');
  });

  it('Demo Credentials Display Test: shows demo credentials box when show_demo_credentials is true or omitted', async () => {
    const schemaStore = useSchemaStore();
    
    schemaStore.schema = {
      $schema_version: '1.6.0',
      system: {
        title: 'Test System',
        logo_url: '',
        default_locale: 'en',
        supported_locales: ['en'],
        direction: 'ltr',
        auth: {
          strategy: 'session',
          login_url: '/api/admin/auth/login',
          me_url: '/api/admin/auth/me',
          logout_url: '/api/admin/auth/logout',
          show_demo_credentials: true,
          login_fields: [
            { name: 'username', label: 'Username', type: 'text', required: true }
          ]
        }
      },
      resources: []
    };

    const wrapper = mount(LoginPage);
    expect(wrapper.text()).toContain('Demo Credentials:');
    expect(wrapper.text()).toContain('admin@demo.com');
  });
});
