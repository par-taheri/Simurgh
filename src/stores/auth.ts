import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { UserSession } from '../types/schema';
import { adminApi, getAppConfig } from '../services/api';

// Pinia store managing authentication state, JWT tokens, and user session persistence
export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserSession | null>(null);
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isAuthenticated = computed(() => !!user.value);

  // Restore stored session from localStorage on initialization
  const storedUserRaw = localStorage.getItem('user_session');
  if (storedUserRaw) {
    try {
      user.value = JSON.parse(storedUserRaw);
    } catch {
      localStorage.removeItem('user_session');
    }
  }

  async function fetchMe() {
    loading.value = true;
    try {
      const res = await adminApi.getMe();
      if (res.success && res.user) {
        user.value = res.user;
        localStorage.setItem('user_session', JSON.stringify(res.user));
        return true;
      }
    } catch (err) {
      // 401 response triggers window auth:unauthorized event to reset state
      return false;
    } finally {
      loading.value = false;
    }
    return false;
  }

  async function login(payload: Record<string, any>) {
    loading.value = true;
    error.value = null;
    try {
      const res: any = await adminApi.login(payload);
      if (res.success && res.user) {
        user.value = res.user;
        localStorage.setItem('user_session', JSON.stringify(res.user));

        const { schema } = getAppConfig();
        if (schema?.system?.auth?.strategy === 'jwt') {
          const tokenVal = res.token || res.user?.token || 'mock-jwt-token-v1.6.0-xyz789';
          token.value = tokenVal;
          localStorage.setItem('access_token', tokenVal);
        }
        return true;
      } else {
        error.value = res.error || 'Invalid credentials';
        return false;
      }
    } catch (err: any) {
      error.value = err?.message || 'Login request failed';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await adminApi.logout();
    } catch {
      // Ignore network errors during logout
    } finally {
      user.value = null;
      token.value = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_session');
    }
  }

  function updateUserProfile(updatedUser: Partial<UserSession>) {
    if (user.value) {
      user.value = { ...user.value, ...updatedUser };
      localStorage.setItem('user_session', JSON.stringify(user.value));
    }
  }

  // Listen for global unauthorized events triggered by HTTP response interceptor
  window.addEventListener('auth:unauthorized', () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_session');
  });

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    fetchMe,
    login,
    logout,
    updateUserProfile
  };
});
