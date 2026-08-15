<template>
  <div class="json-editor-container">
    <textarea
      ref="textareaRef"
      v-model="textValue"
      :disabled="disabled"
      class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500 disabled:opacity-50 custom-scrollbar"
      :class="{'border-rose-500': hasError}"
      :rows="rows || 8"
      dir="ltr"
      @blur="formatJson"
    ></textarea>
    <div v-if="hasError" class="text-rose-400 text-[10px] mt-1 flex items-center gap-1">
      <AlertCircle class="w-3 h-3" />
      <span>Invalid JSON Format</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { AlertCircle } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: any;
  disabled?: boolean;
  rows?: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
}>();

const textValue = ref('');
const hasError = ref(false);

const parseValue = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return val;
    }
  }
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return String(val);
  }
};

onMounted(() => {
  textValue.value = parseValue(props.modelValue);
});

watch(() => props.modelValue, (newVal) => {
  try {
    const currentParsed = textValue.value ? JSON.parse(textValue.value) : null;
    const newParsed = typeof newVal === 'string' && newVal ? JSON.parse(newVal) : newVal;
    if (JSON.stringify(currentParsed) !== JSON.stringify(newParsed)) {
      textValue.value = parseValue(newVal);
    }
  } catch {
    textValue.value = parseValue(newVal);
  }
}, { deep: true });

watch(textValue, (newText) => {
  if (!newText.trim()) {
    hasError.value = false;
    emit('update:modelValue', null);
    return;
  }
  
  try {
    const parsed = JSON.parse(newText);
    hasError.value = false;
    emit('update:modelValue', parsed);
  } catch {
    hasError.value = true;
  }
});

function formatJson() {
  if (!textValue.value.trim()) return;
  try {
    const parsed = JSON.parse(textValue.value);
    textValue.value = JSON.stringify(parsed, null, 2);
    hasError.value = false;
  } catch {
    hasError.value = true;
  }
}
</script>
