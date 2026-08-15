<template>
  <div class="min-h-screen w-full bg-[#070a12] flex items-center justify-center p-4 font-sans relative overflow-hidden" :dir="schemaStore.direction">
    <!-- Ambient Background Glows -->
    <div class="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

    <!-- Login Card Container -->
    <div class="w-full max-w-md bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
      <!-- App Brand Logo & Title -->
      <div class="text-center space-y-2">
        <img
          :src="schemaStore.logoUrl"
          alt="Logo"
          class="w-16 h-16 mx-auto object-contain drop-shadow-[0_0_15px_rgba(79,70,229,0.3)]"
        />
        <h1 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {{ systemTitle }}
        </h1>
        <p class="text-xs text-slate-400 font-sans">
          {{ schemaStore.activeLocale === 'fa' ? `ورود به سامانه مدیریت پویای پروتکل سیمرغ v${schemaStore.schema?.$schema_version || '1.6.0'}` : 'Sign in to Simurgh Protocol Admin Dashboard' }}
        </p>
      </div>

      <!-- Quick Demo Credentials Box -->
      <div
        v-if="showDemoCredentials"
        class="bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-3.5 space-y-2 text-xs"
      >
        <div class="flex items-center justify-between text-indigo-300 font-semibold">
          <span class="flex items-center gap-1.5">
            <Key class="w-3.5 h-3.5 text-indigo-400" />
            <span>{{ schemaStore.activeLocale === 'fa' ? 'اطلاعات ورود دمو:' : 'Demo Credentials:' }}</span>
          </span>
          <span class="text-[10px] text-indigo-400 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700/50">admin@demo.com</span>
        </div>
        <p class="text-[11px] text-slate-300 leading-relaxed">
          {{ schemaStore.activeLocale === 'fa' ? 'نام کاربری: admin@demo.com | کلمه عبور: admin123' : 'Username: admin@demo.com | Password: admin123' }}
        </p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div v-for="field in loginFields" :key="field.name" class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            {{ typeof field.label === 'object' ? field.label[schemaStore.activeLocale] || field.label['en'] : field.label }}
          </label>
          <div class="relative">
            <component :is="field.type === 'password' ? Lock : User" class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
            <input
              :type="field.type"
              v-model="formData[field.name]"
              :required="field.required"
              :placeholder="field.placeholder ? (typeof field.placeholder === 'object' ? field.placeholder[schemaStore.activeLocale] || field.placeholder['en'] : field.placeholder) : ''"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors pl-9 rtl:pl-3.5 rtl:pr-9"
              :class="field.type === 'password' ? 'font-mono' : 'font-sans'"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <LogIn class="w-4 h-4" />
          <span>{{ authStore.loading ? (schemaStore.activeLocale === 'fa' ? 'در حال احراز هویت...' : 'Authenticating...') : (schemaStore.activeLocale === 'fa' ? 'ورود به پنل مدیریت' : 'Sign In') }}</span>
        </button>
      </form>

      <!-- Language & Direction Toggle Footer -->
      <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>{{ schemaStore.activeLocale === 'fa' ? 'زبان سامانه:' : 'Language:' }}</span>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="schemaStore.setLocale('fa')"
            :class="['px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-colors', schemaStore.activeLocale === 'fa' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white']"
          >
            فارسی (RTL)
          </button>
          <button
            type="button"
            @click="schemaStore.setLocale('en')"
            :class="['px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-colors', schemaStore.activeLocale === 'en' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white']"
          >
            English (LTR)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useSchemaStore } from '../stores/schema';
import { useUiStore } from '../stores/ui';
import { Shield, Key, User, Lock, LogIn } from 'lucide-vue-next';

const authStore = useAuthStore();
const schemaStore = useSchemaStore();
const uiStore = useUiStore();

const formData = reactive<Record<string, any>>({});

const systemTitle = computed(() => {
  return schemaStore.systemTitle;
});

const showDemoCredentials = computed(() => {
  return schemaStore.schema?.system?.auth?.show_demo_credentials !== false;
});

const loginFields = computed(() => {
  return schemaStore.schema?.system?.auth?.login_fields || [];
});

async function handleLogin() {
  const success = await authStore.login(formData);
  if (success) {
    uiStore.addToast(
      'success',
      schemaStore.activeLocale === 'fa' ? 'ورود موفقیت‌آمیز' : 'Welcome Back',
      schemaStore.activeLocale === 'fa' ? 'با موفقیت وارد پنل مدیریت شدید.' : 'Successfully logged into dashboard.'
    );
  } else {
    uiStore.addToast('error', 'Login Failed', authStore.error || 'Invalid credentials');
  }
}
</script>
