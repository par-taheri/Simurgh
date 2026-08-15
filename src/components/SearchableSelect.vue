<template>
  <div ref="containerRef" class="relative w-full">
    <!-- Trigger Button -->
    <button
      type="button"
      :disabled="disabled"
      @click="isOpen = !isOpen"
      class="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 flex items-center justify-between gap-2 transition-all disabled:opacity-50 text-right rtl:text-right ltr:text-left shadow-sm cursor-pointer"
    >
      <span :class="['truncate', !value || (Array.isArray(value) && value.length === 0) ? 'text-slate-500' : 'text-slate-200 font-medium']">
        {{ displayText }}
      </span>

      <div class="flex items-center gap-1 shrink-0">
        <span
          v-if="!required && ((isMulti && Array.isArray(value) && value.length > 0) || (!isMulti && value !== null && value !== undefined && value !== ''))"
          @click.stop="clearSelection"
          class="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white cursor-pointer"
          :title="schemaStore.activeLocale === 'fa' ? 'حذف انتخاب (Null)' : 'Clear selection'"
        >
          <X class="w-3 h-3" />
        </span>
        <ChevronDown :class="['w-4 h-4 text-slate-400 transition-transform duration-200', isOpen ? 'rotate-180 text-indigo-400' : '']" />
      </div>
    </button>

    <!-- Dropdown Popup containing Search input inside -->
    <div
      v-if="isOpen"
      class="absolute top-full left-0 right-0 mt-1.5 z-50 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 space-y-2 max-h-64 flex flex-col"
    >
      <!-- Inside-Dropdown Search Bar -->
      <div class="relative p-1">
        <Search class="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto pointer-events-none" />
        <input
          type="text"
          ref="searchInputRef"
          v-model="searchTerm"
          @input="handleSearchInput"
          :placeholder="schemaStore.activeLocale === 'fa' ? 'جستجو در گزینه‌ها...' : 'Search options...'"
          class="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 pl-3 pr-8 rtl:pr-8 rtl:pl-3 ltr:pl-8 ltr:pr-3 font-sans"
        />
      </div>

      <!-- Options List -->
      <div class="overflow-y-auto custom-scrollbar space-y-0.5 flex-1 max-h-44 pr-1">
        <button
          v-if="!isMulti && !required && !searchTerm"
          type="button"
          @click="selectOption(null)"
          :class="[
            'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-right rtl:text-right ltr:text-left cursor-pointer',
            value === null || value === undefined || value === ''
              ? 'bg-slate-800 text-slate-300 border border-slate-700'
              : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
          ]"
        >
          <span class="italic">-- {{ schemaStore.activeLocale === 'fa' ? 'بدون انتخاب (Null)' : 'None (Null)' }} --</span>
          <Check v-if="value === null || value === undefined || value === ''" class="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        </button>

        <template v-if="filteredOptions.length > 0">
          <button
            v-for="opt in filteredOptions"
            :key="String(opt.value)"
            type="button"
            @click="selectOption(opt.value)"
            :class="[
              'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-right rtl:text-right ltr:text-left cursor-pointer',
              isOptionSelected(opt.value)
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            ]"
          >
            <span class="truncate">{{ opt.label }}</span>
            <Check v-if="isOptionSelected(opt.value)" class="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          </button>
        </template>

        <div v-else class="p-4 text-center text-xs text-slate-500">
          {{ schemaStore.activeLocale === 'fa' ? 'هیچ گزینه‌ای یافت نشد' : 'No options found' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { Search, ChevronDown, Check, X } from 'lucide-vue-next';
import { useSchemaStore } from '../stores/schema';

interface OptionItem {
  value: any;
  label: string;
}

const props = withDefaults(
  defineProps<{
    options?: OptionItem[];
    value?: any;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    isMulti?: boolean;
  }>(),
  {
    options: () => [],
    value: null,
    placeholder: '',
    disabled: false,
    required: false,
    isMulti: false
  }
);

const emit = defineEmits<{
  (e: 'update:value', val: any): void;
  (e: 'change', val: any): void;
  (e: 'search-change', term: string): void;
}>();

const schemaStore = useSchemaStore();
const isOpen = ref(false);
const searchTerm = ref('');
const containerRef = ref<HTMLDivElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);

function handleClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

watch(isOpen, newOpen => {
  if (newOpen) {
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
});

const filteredOptions = computed(() => {
  const term = searchTerm.value.toLowerCase();
  return (props.options || []).filter(opt =>
    opt.label.toLowerCase().includes(term)
  );
});

const displayText = computed(() => {
  if (props.isMulti) {
    const selectedArr = Array.isArray(props.value) ? props.value : [];
    if (selectedArr.length === 0) {
      return props.placeholder || (schemaStore.activeLocale === 'fa' ? 'انتخاب دسته‌بندی‌ها...' : 'Select categories...');
    }
    const labels = (props.options || [])
      .filter(o => selectedArr.includes(o.value))
      .map(o => o.label);
    return labels.length > 0
      ? labels.join(' ، ')
      : `${selectedArr.length} مورد انتخاب شده`;
  } else {
    if (props.value === null || props.value === undefined || props.value === '') {
      return props.placeholder || (schemaStore.activeLocale === 'fa' ? 'انتخاب گزینه...' : 'Select option...');
    }
    const found = (props.options || []).find(o => String(o.value) === String(props.value));
    return found ? found.label : String(props.value);
  }
});

function isOptionSelected(optVal: any): boolean {
  if (props.isMulti) {
    return Array.isArray(props.value) && props.value.includes(optVal);
  }
  return String(props.value) === String(optVal);
}

function handleSearchInput(e: Event) {
  const term = (e.target as HTMLInputElement).value;
  searchTerm.value = term;
  emit('search-change', term);
}

function selectOption(optVal: any) {
  if (props.isMulti) {
    const currentArr = Array.isArray(props.value) ? props.value : [];
    const next = currentArr.includes(optVal)
      ? currentArr.filter(v => v !== optVal)
      : [...currentArr, optVal];
    emit('update:value', next);
    emit('change', next);
  } else {
    emit('update:value', optVal);
    emit('change', optVal);
    isOpen.value = false;
  }
}

function clearSelection() {
  const cleared = props.isMulti ? [] : null;
  emit('update:value', cleared);
  emit('change', cleared);
}
</script>
