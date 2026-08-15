<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[9990] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      @click.self="closeModal"
    >
      <div
        :dir="schemaStore.direction"
        class="bg-[#0b101d] border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col my-auto max-h-[90vh] overflow-hidden select-none animate-in zoom-in-95 duration-200"
      >
        <!-- Header -->
        <div class="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
          <div class="flex items-center gap-3.5" :class="[schemaStore.activeLocale === 'fa' ? 'text-right' : 'text-left']">
            <div class="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm">
              <Code2 class="w-5 h-5" />
            </div>
            <div :class="[schemaStore.activeLocale === 'fa' ? 'text-right' : 'text-left']">
              <h3 class="font-bold text-base text-white flex items-center gap-2">
                <span>{{ schemaStore.activeLocale === 'fa' ? 'مشاهده اسکیمای پروتکل سیمرغ v1.6.0' : 'Simurgh Protocol v1.6.0 Schema Viewer' }}</span>
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ schemaStore.activeLocale === 'fa' ? 'بازرسی ساختار اسکیمای فعال سامانه' : 'Read-only JSON schema structure inspection' }}
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="closeModal"
            class="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            :title="schemaStore.activeLocale === 'fa' ? 'بستن' : 'Close'"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-3 flex flex-col">
          <div class="flex items-center justify-between shrink-0">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              ROOT SCHEMA SPECIFICATION JSON
            </span>

            <button
              type="button"
              @click="copySchemaJson"
              class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700/60"
            >
              <Copy class="w-3.5 h-3.5" />
              <span>{{ isCopied ? (schemaStore.activeLocale === 'fa' ? 'کپی شد!' : 'Copied!') : (schemaStore.activeLocale === 'fa' ? 'کپی JSON' : 'Copy JSON') }}</span>
            </button>
          </div>

          <!-- Code Display Textarea (Read-only) -->
          <textarea
            v-model="rawJsonText"
            readonly
            dir="ltr"
            class="w-full flex-1 min-h-[380px] bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500/50 leading-relaxed custom-scrollbar text-left ltr:text-left rtl:text-left resize-none"
            placeholder="JSON Schema display..."
          />
        </div>

        <!-- Footer Actions Bar -->
        <div class="p-4 border-t border-slate-800 bg-slate-950/50 shrink-0 flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            @click="closeModal"
            class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            {{ schemaStore.activeLocale === 'fa' ? 'بستن' : 'Close' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSchemaStore } from '../stores/schema';
import { useUiStore } from '../stores/ui';
import { Code2, X, Copy } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const schemaStore = useSchemaStore();
const uiStore = useUiStore();

const rawJsonText = ref('');
const isCopied = ref(false);

watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen && schemaStore.schema) {
      isCopied.value = false;
      rawJsonText.value = JSON.stringify(schemaStore.schema, null, 2);
    }
  }
);

function copySchemaJson() {
  navigator.clipboard.writeText(rawJsonText.value);
  isCopied.value = true;
  uiStore.addToast('info', 'Copied to Clipboard', 'Schema JSON payload copied.');
  setTimeout(() => {
    isCopied.value = false;
  }, 2000);
}

function closeModal() {
  emit('update:modelValue', false);
}
</script>
