<template>
  <!-- Schema Loading Screen -->
  <div v-if="schemaStore.loading" class="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
    <Loader2 class="w-16 h-16 text-indigo-500 animate-spin" />
    <div class="mt-4 text-slate-300 font-semibold text-base">
      Loading Simurgh Panel...
    </div>
    <div class="text-xs text-slate-500 mt-1">
      Validating protocol schema (Simurgh v1.6.0)
    </div>
  </div>

  <!-- Schema Error View -->
  <div v-else-if="schemaStore.bootError" class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    <div class="bg-slate-900 text-slate-100 border border-rose-800 rounded-2xl max-w-lg full-width p-6 text-center shadow-2xl">
      <AlertCircle class="w-14 h-14 text-rose-500 mx-auto mb-3" />
      <div class="text-xl font-bold text-white mb-2">Schema Protocol Error</div>
      <p class="text-xs text-rose-300 bg-rose-950/50 p-3 rounded-xl border border-rose-900 mb-4 leading-relaxed font-mono">
        {{ schemaStore.bootError }}
      </p>
      <button
        type="button"
        @click="schemaStore.fetchSchema()"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer"
      >
        Retry Protocol Handshake
      </button>
    </div>
  </div>

  <!-- Authentication View -->
  <LoginPage v-else-if="!authStore.isAuthenticated" />

  <!-- Main Dashboard Portal -->
  <div v-else :dir="schemaStore.direction" class="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-y-auto custom-scrollbar font-sans selection:bg-indigo-500 selection:text-white">
    <TestingSimulatorBar v-if="isDev" />
    <Header />

    <div class="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row items-stretch gap-4 md:gap-6 p-3 sm:p-4 md:p-6">
      <Sidebar />

      <!-- Main Page Content Area -->
      <main class="flex-1 min-w-0 flex flex-col">
        <DynamicDataTable
          ref="dataTableRef"
          :resource="schemaStore.activeResource"
          @open-form="handleOpenForm"
        />
      </main>
    </div>

    <!-- Modals Orchestration -->
    <DynamicFormModal
      v-model="isFormOpen"
      :resource="schemaStore.activeResource"
      :initial-data="editingRecord"
      @saved="handleFormSaved"
      @occ-conflict="handleOccConflict"
    />

    <ConcurrencyConflictModal
      v-model="isOccModalOpen"
      :unsaved-data="occUnsavedData"
      :server-data="occServerData"
      @resolved="handleOccResolved"
    />

    <SchemaInspectorModal v-model="uiStore.isSchemaInspectorOpen" />

    <UserProfileModal v-model="uiStore.isUserProfileModalOpen" />

    <!-- Toast Notifications Floating Stack -->
    <div class="fixed bottom-6 right-6 rtl:right-6 rtl:left-auto ltr:left-6 ltr:right-auto z-[9999] space-y-3 max-w-md pointer-events-none">
      <div
        v-for="t in uiStore.toasts"
        :key="t.id"
        class="pointer-events-auto relative p-4 rtl:pl-9 rtl:pr-4 ltr:pr-9 ltr:pl-4 rounded-2xl shadow-2xl flex items-start gap-3 border text-xs transition-all animate-in slide-in-from-bottom-5 duration-300"
        :class="{
          'bg-[#064e3b]/95 text-emerald-100 border-emerald-600/80': t.type === 'success',
          'bg-[#2d0a12]/95 text-rose-100 border-rose-700/80': t.type === 'error',
          'bg-[#281307]/95 text-amber-100 border-amber-700/80': t.type === 'warning',
          'bg-[#0f172a]/95 text-indigo-100 border-indigo-700/80': t.type === 'info'
        }"
      >
        <CheckCircle2 v-if="t.type === 'success'" class="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
        <AlertCircle v-else-if="t.type === 'error'" class="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
        <AlertTriangle v-else-if="t.type === 'warning'" class="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <Info v-else class="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />

        <div class="grow text-right rtl:text-right ltr:text-left">
          <div class="font-bold text-sm text-slate-100">{{ t.title }}</div>
          <div v-if="t.message" class="opacity-90 mt-1 text-xs leading-relaxed text-slate-300">{{ t.message }}</div>
        </div>

        <!-- Absolutely Pinned Close Button at Top Corner -->
        <button
          type="button"
          class="absolute top-3 left-3 rtl:left-3 rtl:right-auto ltr:right-3 ltr:left-auto text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          @click="uiStore.removeToast(t.id)"
          :title="schemaStore.activeLocale === 'fa' ? 'بستن' : 'Close'"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useSchemaStore } from './stores/schema';
import { useUiStore } from './stores/ui';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Loader2
} from 'lucide-vue-next';

import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';
import DynamicDataTable from './components/DynamicDataTable.vue';
import DynamicFormModal from './components/DynamicFormModal.vue';
import ConcurrencyConflictModal from './components/ConcurrencyConflictModal.vue';
import SchemaInspectorModal from './components/SchemaInspectorModal.vue';
import TestingSimulatorBar from './components/TestingSimulatorBar.vue';
import LoginPage from './components/LoginPage.vue';
import UserProfileModal from './components/UserProfileModal.vue';

const route = useRoute();
const router = useRouter();

const authStore = useAuthStore();
const schemaStore = useSchemaStore();
const uiStore = useUiStore();

// Form Modal State
const isFormOpen = ref(false);
const editingRecord = ref<any | null>(null);
const dataTableRef = ref<any | null>(null);

// OCC Conflict Modal State
const isOccModalOpen = ref(false);
const occUnsavedData = ref<Record<string, any>>({});
const occServerData = ref<Record<string, any>>({});

const isDev = import.meta.env.DEV;

onMounted(async () => {
  await schemaStore.fetchSchema();
  if (schemaStore.bootError) return;

  const authStrategy = schemaStore.schema?.system?.auth?.strategy;
  const isAuthenticated = await authStore.fetchMe();

  if (!isAuthenticated && authStrategy === 'sso') {
    const ssoUrl = schemaStore.schema?.system?.auth?.sso_redirect_url;
    if (ssoUrl) {
      window.location.href = ssoUrl;
    }
  }
});

// Update favicon dynamically from schema system logo_url
watch(
  () => schemaStore.schema?.system?.logo_url,
  newLogoUrl => {
    if (newLogoUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.head.appendChild(link);
      }
      link.href = newLogoUrl;
    }
  },
  { immediate: true }
);

// Route synchronization with active resource name
watch(
  () => route.params.resource,
  newResourceName => {
    if (newResourceName && typeof newResourceName === 'string') {
      schemaStore.setActiveResource(newResourceName);
    }
  }
);

watch(
  () => schemaStore.activeResourceName,
  newResourceName => {
    if (newResourceName && route.params.resource !== newResourceName) {
      router.push(`/admin/${newResourceName}`);
    }
  }
);

function handleOpenForm(record: any | null = null) {
  editingRecord.value = record;
  isFormOpen.value = true;
}

function handleFormSaved() {
  editingRecord.value = null;
  if (dataTableRef.value && typeof dataTableRef.value.refresh === 'function') {
    dataTableRef.value.refresh();
  }
}

function handleOccConflict(payload: { unsavedData: Record<string, any>; serverData: Record<string, any> }) {
  occUnsavedData.value = payload.unsavedData;
  occServerData.value = payload.serverData;
  isOccModalOpen.value = true;
}

function handleOccResolved() {
  occUnsavedData.value = {};
  occServerData.value = {};
}
</script>