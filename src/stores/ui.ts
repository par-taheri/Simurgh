import { defineStore } from 'pinia';
import { ref } from 'vue';
import { setSimulatedError, getSimulatedError } from '../services/api';

// Toast notification payload interface
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  countdown?: number;
}

// Pinia store managing UI state, sidebar visibility, modals, toasts, and testing error simulation
export const useUiStore = defineStore('ui', () => {
  const isSidebarMobileOpen = ref(false);
  const isSidebarCollapsed = ref(false);
  const isSchemaInspectorOpen = ref(false);
  const isSimulatorOpen = ref(false);
  const isUserProfileModalOpen = ref(false);
  const activeSimulatedError = ref<string | null>(getSimulatedError());
  const toasts = ref<ToastMessage[]>([]);

  function toggleSidebarMobile() {
    isSidebarMobileOpen.value = !isSidebarMobileOpen.value;
  }

  function toggleSidebar() {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      isSidebarMobileOpen.value = !isSidebarMobileOpen.value;
    } else {
      isSidebarCollapsed.value = !isSidebarCollapsed.value;
    }
  }

  function setSimulatedErrorCode(code: string | null) {
    activeSimulatedError.value = code;
    setSimulatedError(code);
  }

  function addToast(
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string,
    countdown?: number
  ) {
    const id = `toast_${Date.now()}_${Math.random()}`;
    toasts.value.push({ id, type, title, message, countdown });

    if (countdown === undefined) {
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    }
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }

  return {
    isSidebarMobileOpen,
    isSidebarCollapsed,
    isSchemaInspectorOpen,
    isSimulatorOpen,
    isUserProfileModalOpen,
    activeSimulatedError,
    toasts,
    toggleSidebarMobile,
    toggleSidebar,
    setSimulatedErrorCode,
    addToast,
    removeToast
  };
});
