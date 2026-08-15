<template>
  <header class="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 px-3 sm:px-6 py-2.5 shadow-lg">
    <div class="w-full flex items-center justify-between gap-2 sm:gap-4 min-w-0">
      <!-- Branding & Navigation Toggle -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          type="button"
          @click="uiStore.toggleSidebar()"
          class="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          :title="schemaStore.activeLocale === 'fa' ? 'تغییر وضعیت منوی کناری' : 'Toggle Sidebar'"
          aria-label="Toggle sidebar menu"
        >
          <Menu class="w-5 h-5" />
        </button>

        <img
          :src="schemaStore.logoUrl"
          alt="System Logo"
          class="w-7 h-7 sm:w-9 sm:h-9 object-contain shrink-0"
        />

        <div class="min-w-0 flex-1 hidden sm:block">
          <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <h1 class="font-bold text-xs sm:text-base md:text-lg text-slate-100 tracking-tight truncate">
              {{ titleText }}
            </h1>
            <span class="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 font-mono">
              <ShieldCheck class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              v{{ schemaStore.schema?.$schema_version || '1.6.0' }}
            </span>
          </div>
          <p v-if="schemaStore.schema?.system?.subtitle || schemaStore.schema?.system?.description" class="text-[10px] sm:text-[11px] text-slate-400 truncate">
            {{ resolveLabel(schemaStore.schema?.system?.subtitle || schemaStore.schema?.system?.description, schemaStore.activeLocale) }}
          </p>
        </div>
      </div>

      <!-- Quick Actions, Controls & User Session -->
      <div class="flex items-center gap-1 sm:gap-2 shrink-0">
        <!-- Desktop Quick Actions (visible md and up) -->
        <div class="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <!-- Refresh Schema Button -->
          <button
            type="button"
            @click="schemaStore.fetchSchema()"
            class="px-2 sm:px-2.5 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            :title="schemaStore.activeLocale === 'fa' ? 'فراخوانی مجدد اسکیما' : 'Reload Schema'"
          >
            <RefreshCw class="w-4 h-4 text-sky-400 shrink-0" />
            <span class="hidden lg:inline">{{ schemaStore.activeLocale === 'fa' ? 'بازخوانی' : 'Reload' }}</span>
          </button>

          <!-- Schema Inspector Modal Toggle Button -->
          <button
            type="button"
            @click="uiStore.isSchemaInspectorOpen = true"
            class="px-2 sm:px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            title="مشاهده و ویرایش اسکیمای خام JSON"
          >
            <Code2 class="w-4 h-4 text-indigo-400 shrink-0" />
            <span class="hidden lg:inline">{{ schemaStore.activeLocale === 'fa' ? 'اسکیما' : 'Schema' }}</span>
          </button>

          <!-- Test Errors Simulator Toggle Button -->
          <button
            v-if="isDev"
            type="button"
            @click="uiStore.isSimulatorOpen = !uiStore.isSimulatorOpen"
            class="px-2 sm:px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            title="شبیه‌ساز خطاها و پروپوزال‌های پروتکل سیمرغ"
          >
            <Bug class="w-4 h-4 text-amber-400 shrink-0" />
            <span class="hidden lg:inline">{{ schemaStore.activeLocale === 'fa' ? 'تست خطا' : 'Errors' }}</span>
          </button>
        </div>

        <!-- Direction Toggle Button (RTL / LTR) - visible md and up -->
        <button
          type="button"
          @click="schemaStore.toggleDirection()"
          class="hidden md:flex p-1.5 sm:px-2 sm:py-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/50 transition-colors text-xs font-medium items-center gap-1 cursor-pointer"
          :title="schemaStore.direction === 'rtl' ? 'تغییر به LTR' : 'Switch to RTL'"
        >
          <AlignRight v-if="schemaStore.direction === 'rtl'" class="w-4 h-4 text-emerald-400 shrink-0" />
          <AlignLeft v-else class="w-4 h-4 text-emerald-400 shrink-0" />
          <span class="uppercase text-[10px] font-mono font-bold text-slate-400 inline">{{ schemaStore.direction }}</span>
        </button>

        <!-- Mobile Dev Tools Toggle Button (< md) -->
        <button
          type="button"
          @click="isMobileToolsOpen = !isMobileToolsOpen"
          :class="[
            'md:hidden p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer',
            isMobileToolsOpen || uiStore.isSimulatorOpen
              ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50'
              : 'bg-slate-800/80 text-slate-300 border-slate-700/70 hover:text-white'
          ]"
          :title="schemaStore.activeLocale === 'fa' ? 'ابزارهای توسعه' : 'Dev Tools'"
        >
          <X v-if="isMobileToolsOpen" class="w-4 h-4" />
          <Wrench v-else class="w-4 h-4" />
        </button>

        <!-- Locale Switcher Pills -->
        <div class="flex items-center bg-slate-950/80 rounded-xl p-0.5 border border-slate-800">
          <button
            type="button"
            @click="schemaStore.setLocale('en')"
            :class="[
              'px-1.5 sm:px-2 py-1 text-[11px] rounded-lg font-bold transition-all cursor-pointer',
              schemaStore.activeLocale === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            EN
          </button>
          <button
            type="button"
            @click="schemaStore.setLocale('fa')"
            :class="[
              'px-1.5 sm:px-2 py-1 text-[11px] rounded-lg font-bold transition-all cursor-pointer',
              schemaStore.activeLocale === 'fa' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            FA
          </button>
        </div>

        <!-- User Profile Pill Button -->
        <button
          type="button"
          @click="uiStore.isUserProfileModalOpen = true"
          class="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 rounded-xl border border-slate-700/70 transition-all group shrink-0 cursor-pointer"
          title="مدیریت پروفایل کاربری"
        >
          <div class="relative shrink-0">
            <img
              v-if="authStore.user?.avatar"
              :src="authStore.user.avatar"
              :alt="authStore.user.full_name"
              class="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/50"
            />
            <div
              v-else
              class="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-xs shrink-0"
            >
              {{ getInitials(authStore.user?.full_name) }}
            </div>
            <span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-slate-900" />
          </div>

          <div class="hidden sm:flex flex-col items-start text-right rtl:text-right ltr:text-left">
            <span class="text-xs font-bold leading-tight">{{ authStore.user?.full_name || 'رضا محمدی' }}</span>
            <span class="text-[10px] text-indigo-400 font-mono capitalize">{{ authStore.user?.role || 'Admin' }}</span>
          </div>

          <ChevronDown class="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors hidden sm:block" />
        </button>

        <!-- Quick Logout Button -->
        <button
          type="button"
          @click="handleLogout"
          class="p-2 bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/80 hover:border-rose-500/40 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-sm"
          :title="schemaStore.activeLocale === 'fa' ? 'خروج از حساب کاربری' : 'Sign Out'"
        >
          <LogOut class="w-4 h-4 shrink-0" />
        </button>
      </div>
    </div>

    <!-- Mobile Dev Tools Collapsible Secondary Bar -->
    <div
      v-if="isMobileToolsOpen"
      class="md:hidden mt-2 pt-2 border-t border-slate-800 flex items-center justify-between gap-2 overflow-x-auto pb-1 custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-200"
    >
      <div class="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 w-full justify-around">
        <!-- Reload -->
        <button
          type="button"
          @click="schemaStore.fetchSchema()"
          class="px-2 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
        >
          <RefreshCw class="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>{{ schemaStore.activeLocale === 'fa' ? 'بازخوانی' : 'Reload' }}</span>
        </button>

        <!-- Schema Inspector -->
        <button
          type="button"
          @click="uiStore.isSchemaInspectorOpen = true; isMobileToolsOpen = false;"
          class="px-2 py-1.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg transition-all text-xs font-medium flex items-center gap-1 cursor-pointer"
        >
          <Code2 class="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>{{ schemaStore.activeLocale === 'fa' ? 'اسکیما' : 'Schema' }}</span>
        </button>

        <!-- Error Simulator -->
        <button
          v-if="isDev"
          type="button"
          @click="uiStore.isSimulatorOpen = !uiStore.isSimulatorOpen"
          class="px-2 py-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg transition-all text-xs font-medium flex items-center gap-1 cursor-pointer"
        >
          <Bug class="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{{ schemaStore.activeLocale === 'fa' ? 'تست خطا' : 'Errors' }}</span>
        </button>

        <!-- Direction Toggle -->
        <button
          type="button"
          @click="schemaStore.toggleDirection()"
          class="px-2 py-1.5 bg-slate-800/80 text-slate-300 hover:text-white rounded-lg border border-slate-700/50 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
        >
          <AlignRight v-if="schemaStore.direction === 'rtl'" class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <AlignLeft v-else class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span class="uppercase text-[10px] font-mono font-bold text-slate-400">{{ schemaStore.direction }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useSchemaStore } from '../stores/schema';
import { useUiStore } from '../stores/ui';
import { resolveLabel } from '../utils/resolveLabel';
import {
  RefreshCw,
  Code2,
  Bug,
  AlignLeft,
  AlignRight,
  Menu,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Wrench,
  X
} from 'lucide-vue-next';

const authStore = useAuthStore();
const schemaStore = useSchemaStore();
const uiStore = useUiStore();

const isDev = import.meta.env.DEV;

const isMobileToolsOpen = ref(false);

const titleText = computed(() => {
  return schemaStore.systemTitle;
});

function getInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

async function handleLogout() {
  await authStore.logout();
}
</script>
