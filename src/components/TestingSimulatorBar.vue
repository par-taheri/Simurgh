<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="uiStore.isSimulatorOpen"
        class="fixed inset-0 z-[9990] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        @click.self="uiStore.isSimulatorOpen = false"
      >
        <div
          class="bg-[#0b101d] border border-slate-800 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-6 relative text-right rtl:text-right ltr:text-left select-none animate-in zoom-in-95 duration-200"
        >
          <!-- Close Modal X Button -->
          <button
            type="button"
            @click="uiStore.isSimulatorOpen = false"
            class="absolute top-5 left-5 rtl:left-5 rtl:right-auto ltr:right-5 ltr:left-auto text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            :title="schemaStore.activeLocale === 'fa' ? 'بستن' : 'Close'"
          >
            <X class="w-5 h-5" />
          </button>

          <!-- Modal Title & Subtitle Header -->
          <div class="text-center space-y-2 pt-2">
            <h3 class="font-bold text-sm sm:text-base text-amber-400 tracking-tight flex items-center justify-center gap-2">
              <Sun class="w-5 h-5 text-amber-400 animate-spin-slow shrink-0" />
              <span>پنل شبیه‌ساز تست پروتکل سیمرغ و کدهای خطا (Simurgh Protocol v1.6.0 Sandbox)</span>
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed max-w-xl mx-auto">
              برای ارزیابی دقیق رفتار موتور فرانت‌اند در برابر کدهای مختلف پاسخ سرور (بر اساس سند PRD)، یکی از گزینه‌های زیر را انتخاب کنید:
            </p>
          </div>

          <!-- Horizontal Option Buttons Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
            <!-- Normal OK (Green Button) -->
            <button
              type="button"
              @click="handleSelectCode(null)"
              :class="[
                'p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group text-center',
                uiStore.activeSimulatedError === null
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400'
                  : 'bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-500/60 shadow-md'
              ]"
            >
              <RotateCcw class="w-5 h-5 text-white transition-transform group-hover:-rotate-90" />
              <span class="font-bold text-xs whitespace-nowrap">نرمال (OK)</span>
            </button>

            <!-- Server 500 Button -->
            <button
              type="button"
              @click="handleSelectCode('500')"
              :class="[
                'p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group text-center',
                uiStore.activeSimulatedError === '500'
                  ? 'bg-rose-950 text-rose-200 border-rose-500 shadow-lg shadow-rose-900/40 ring-2 ring-rose-500'
                  : 'bg-[#180a0e] hover:bg-rose-950/80 text-rose-300 border-rose-900/60'
              ]"
            >
              <AlertTriangle class="w-5 h-5 text-rose-400 transition-transform group-hover:scale-110" />
              <span class="font-bold text-xs whitespace-nowrap">Server 500</span>
            </button>

            <!-- Unauth 401 Button -->
            <button
              type="button"
              @click="handleSelectCode('401')"
              :class="[
                'p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group text-center',
                uiStore.activeSimulatedError === '401'
                  ? 'bg-blue-950 text-blue-200 border-blue-500 shadow-lg shadow-blue-900/40 ring-2 ring-blue-500'
                  : 'bg-[#0a1322] hover:bg-blue-950/80 text-blue-300 border-blue-900/60'
              ]"
            >
              <ShieldAlert class="w-5 h-5 text-blue-400 transition-transform group-hover:scale-110" />
              <span class="font-bold text-xs whitespace-nowrap">Unauth 401</span>
            </button>

            <!-- RateLimit 429 Button -->
            <button
              type="button"
              @click="handleSelectCode('429')"
              :class="[
                'p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group text-center',
                uiStore.activeSimulatedError === '429'
                  ? 'bg-purple-950 text-purple-200 border-purple-500 shadow-lg shadow-purple-900/40 ring-2 ring-purple-500'
                  : 'bg-[#150b20] hover:bg-purple-950/80 text-purple-300 border-purple-900/60'
              ]"
            >
              <Bug class="w-5 h-5 text-purple-400 transition-transform group-hover:scale-110" />
              <span class="font-bold text-xs whitespace-nowrap">RateLimit 429</span>
            </button>

            <!-- Valid 422 Button -->
            <button
              type="button"
              @click="handleSelectCode('422')"
              :class="[
                'p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group text-center',
                uiStore.activeSimulatedError === '422'
                  ? 'bg-indigo-950 text-indigo-200 border-indigo-500 shadow-lg shadow-indigo-900/40 ring-2 ring-indigo-500'
                  : 'bg-[#130f26] hover:bg-indigo-950/80 text-indigo-300 border-indigo-900/60'
              ]"
            >
              <AlertTriangle class="w-5 h-5 text-indigo-400 transition-transform group-hover:scale-110" />
              <span class="font-bold text-xs whitespace-nowrap">Valid 422</span>
            </button>

            <!-- OCC 409 Button -->
            <button
              type="button"
              @click="handleSelectCode('409')"
              :class="[
                'p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group text-center',
                uiStore.activeSimulatedError === '409'
                  ? 'bg-amber-950 text-amber-200 border-amber-500 shadow-lg shadow-amber-900/40 ring-2 ring-amber-500'
                  : 'bg-[#201509] hover:bg-amber-950/80 text-amber-300 border-amber-900/60'
              ]"
            >
              <ShieldAlert class="w-5 h-5 text-amber-400 transition-transform group-hover:scale-110" />
              <span class="font-bold text-xs whitespace-nowrap">OCC 409</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useUiStore } from '../stores/ui';
import { useSchemaStore } from '../stores/schema';
import {
  Sun,
  X,
  RotateCcw,
  AlertTriangle,
  ShieldAlert,
  Bug
} from 'lucide-vue-next';

const uiStore = useUiStore();
const schemaStore = useSchemaStore();

function handleSelectCode(code: string | null) {
  uiStore.setSimulatedErrorCode(code);

  if (!code) {
    uiStore.addToast(
      'success',
      'تست هدر خطا غیرفعال شد',
      'تمام درخواست‌های بعدی به صورت نرمال (HTTP 200) پردازش خواهند شد.'
    );
  } else {
    let desc = `درخواست بعدی که ارسال شود، پاسخ HTTP ${code} دریافت خواهد کرد.`;
    if (code === '401') desc = 'درخواست بعدی که ارسال شود، پاسخ HTTP 401 (Unauthenticated) دریافت خواهد کرد.';
    if (code === '409') desc = 'درخواست بعدی که ارسال شود، پاسخ HTTP 409 (OCC Conflict) دریافت خواهد کرد.';
    if (code === '422') desc = 'درخواست بعدی که ارسال شود، پاسخ HTTP 422 (Validation Error) دریافت خواهد کرد.';
    if (code === '429') desc = 'درخواست بعدی که ارسال شود، پاسخ HTTP 429 (Rate Limit Exceeded) دریافت خواهد کرد.';
    if (code === '500') desc = 'درخواست بعدی که ارسال شود، پاسخ HTTP 500 دریافت خواهد کرد.';

    uiStore.addToast(
      'warning',
      `تست هدر خطا تنظیم شد: ${code}`,
      desc
    );
  }

  // Close modal after selection
  uiStore.isSimulatorOpen = false;
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
