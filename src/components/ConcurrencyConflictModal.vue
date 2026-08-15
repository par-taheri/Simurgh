<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      dir="ltr"
      class="fixed inset-0 z-[999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        :dir="schemaStore.direction"
        class="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-3xl w-full shadow-2xl flex flex-col my-auto max-h-[90vh] shrink-0"
      >
        <!-- Modal Header -->
        <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 rounded-t-2xl">
          <div class="flex items-center gap-2.5 text-rose-400">
            <AlertTriangle class="w-6 h-6 shrink-0" />
            <div>
              <h3 class="font-bold text-base text-white">
                Optimistic Concurrency Conflict (OCC 409)
              </h3>
              <p class="text-xs text-rose-300/80">
                داده‌های این رکورد توسط کاربر دیگری تغییر یافته است
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="closeModal"
            class="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Warning Banner -->
        <div class="bg-rose-950/40 text-rose-200 p-4 border-b border-rose-900/50 text-xs leading-relaxed">
          این رکورد همزمان در سمت سرور ویرایش شده است. برای جلوگیری از از دست رفتن تغییرات، مقایسه زنده زیر را بررسی کنید.
        </div>

        <!-- Side-by-Side Diff View -->
        <div class="p-4 overflow-y-auto custom-scrollbar flex-1 max-h-[50vh] space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Unsaved Local Data -->
            <div class="bg-slate-950 p-3.5 rounded-xl border border-indigo-500/30 space-y-2">
              <div class="text-xs font-bold text-indigo-400 uppercase flex items-center justify-between">
                <span>تغییرات محلی شما (Unsaved)</span>
                <span class="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">Local</span>
              </div>
              <pre class="text-[11px] font-mono text-slate-200 bg-slate-900 p-2.5 rounded-lg overflow-x-auto border border-slate-800 max-h-56">{{ JSON.stringify(unsavedData, null, 2) }}</pre>
            </div>

            <!-- Current Server Data -->
            <div class="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 space-y-2">
              <div class="text-xs font-bold text-amber-400 uppercase flex items-center justify-between">
                <span>نسخه سرور فعلی (Server Version)</span>
                <span class="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-mono">Server</span>
              </div>
              <pre class="text-[11px] font-mono text-slate-200 bg-slate-900 p-2.5 rounded-lg overflow-x-auto border border-slate-800 max-h-56">{{ JSON.stringify(serverData, null, 2) }}</pre>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-4 border-t border-slate-800 bg-slate-950/50 rounded-b-2xl flex items-center justify-between gap-3">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
          >
            انصراف و لغو تغییرات
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="handleReload"
              class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw class="w-4 h-4" />
              <span>بارگذاری نسخه جدید سرور</span>
            </button>

            <button
              type="button"
              @click="handleForceOverwrite"
              class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Zap class="w-4 h-4" />
              <span>بازنویسی اجباری (Force Overwrite)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useSchemaStore } from '../stores/schema';
import { useUiStore } from '../stores/ui';
import { adminApi } from '../services/api';
import { AlertTriangle, X, RefreshCw, Zap } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: boolean;
  unsavedData: Record<string, any>;
  serverData: Record<string, any>;
}>();

const emit = defineEmits(['update:modelValue', 'resolved']);

const schemaStore = useSchemaStore();
const uiStore = useUiStore();

async function handleForceOverwrite() {
  if (!schemaStore.activeResource) return;
  try {
    const apiPath = schemaStore.activeResource.api_path;
    await adminApi.updateRecord(
      apiPath,
      props.unsavedData.id,
      props.unsavedData
    );
    uiStore.addToast('warning', 'بازنویسی اجباری انجام شد', 'رکورد با موفقیت بر روی سرور جایگزین گردید.');
    emit('resolved');
    closeModal();
  } catch (err: any) {
    uiStore.addToast('error', 'خطا در بازنویسی', err?.message);
  }
}

function handleReload() {
  uiStore.addToast('info', 'داده سرور جایگزین شد', 'تغییرات محلی لغو شد و اطلاعات جدید سرور دریافت گردید.');
  emit('resolved');
  closeModal();
}

function closeModal() {
  emit('update:modelValue', false);
}
</script>
