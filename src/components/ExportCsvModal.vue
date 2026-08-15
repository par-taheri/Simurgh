<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9990] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        @click.self="closeModal"
      >
        <div
          :dir="schemaStore.direction"
          class="bg-[#0b101d] border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl p-6 relative space-y-5 select-none animate-in zoom-in-95 duration-200"
          :class="[schemaStore.activeLocale === 'fa' ? 'text-right' : 'text-left']"
        >
          <!-- Close Modal Button -->
          <button
            type="button"
            @click="closeModal"
            class="absolute top-5 z-20 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            :class="[schemaStore.activeLocale === 'fa' ? 'left-5' : 'right-5']"
            :title="schemaStore.activeLocale === 'fa' ? 'بستن' : 'Close'"
          >
            <X class="w-5 h-5" />
          </button>

          <!-- Modal Header -->
          <div class="flex items-center gap-3.5" :class="[schemaStore.activeLocale === 'fa' ? 'pl-12 text-right' : 'pr-12 text-left']">
            <div class="w-10 h-10 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
              <FileSpreadsheet class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0" :class="[schemaStore.activeLocale === 'fa' ? 'text-right' : 'text-left']">
              <h3 class="font-bold text-base text-slate-100 flex items-center gap-2" :class="[schemaStore.activeLocale === 'fa' ? 'text-right' : 'text-left']">
                <span>{{ schemaStore.activeLocale === 'fa' ? 'تنظیمات خروجی فایل CSV' : 'Export CSV Settings' }}</span>
              </h3>
              <p class="text-xs text-slate-400 mt-0.5 leading-normal" :class="[schemaStore.activeLocale === 'fa' ? 'text-right' : 'text-left']">
                {{ schemaStore.activeLocale === 'fa' ? 'فیلدهای مورد نظر خود را برای قرارگیری در فایل خروجی انتخاب کنید' : 'Select fields to include in the exported CSV file' }}
              </p>
            </div>
          </div>

          <!-- Selection Controls Bar -->
          <div class="flex items-center justify-between pt-1 text-xs">
            <span class="text-slate-400 font-medium">
              {{ schemaStore.activeLocale === 'fa' ? 'انتخاب شده:' : 'Selected:' }}
              <strong class="text-emerald-400 font-mono">{{ selectedFields.length }}</strong>
              {{ schemaStore.activeLocale === 'fa' ? 'از' : 'of' }}
              <strong class="text-slate-300 font-mono">{{ availableFields.length }}</strong>
            </span>

            <div class="flex items-center gap-3">
              <button
                type="button"
                @click="selectAll"
                class="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1 transition-colors"
              >
                <CheckSquare class="w-3.5 h-3.5" />
                <span>{{ schemaStore.activeLocale === 'fa' ? 'انتخاب همه' : 'Select All' }}</span>
              </button>
              <span class="text-slate-700">|</span>
              <button
                type="button"
                @click="deselectAll"
                class="text-slate-400 hover:text-slate-300 font-medium cursor-pointer flex items-center gap-1 transition-colors"
              >
                <Square class="w-3.5 h-3.5" />
                <span>{{ schemaStore.activeLocale === 'fa' ? 'عدم انتخاب همه' : 'Deselect All' }}</span>
              </button>
            </div>
          </div>

          <!-- Fields Checklist Grid -->
          <div class="max-h-60 overflow-y-auto custom-scrollbar bg-slate-950/80 p-3 rounded-2xl border border-slate-800/90 space-y-1.5">
            <label
              v-for="field in availableFields"
              :key="field.name"
              class="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900/90 border border-transparent hover:border-slate-800 transition-all cursor-pointer group"
            >
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  :value="field.name"
                  v-model="selectedFields"
                  class="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500/30 focus:ring-offset-0 cursor-pointer"
                />
                <span class="text-xs font-semibold text-slate-200 group-hover:text-white">
                  {{ resolveLabel(field.label, schemaStore.activeLocale) }}
                </span>
              </div>
              <span class="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {{ field.name }}
              </span>
            </label>
          </div>

          <!-- BOM Encoding Option -->
          <div class="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="includeBOM"
              v-model="includeBOM"
              class="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer"
            />
            <label for="includeBOM" class="text-xs text-slate-300 cursor-pointer select-none">
              {{ schemaStore.activeLocale === 'fa' ? 'افزودن BOM برای پشتیبانی کامل از زبان فارسی در Excel' : 'Include UTF-8 BOM for Persian Excel support' }}
            </label>
          </div>

          <!-- Modal Action Buttons -->
          <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer transition-colors"
            >
              {{ schemaStore.activeLocale === 'fa' ? 'انصراف' : 'Cancel' }}
            </button>

            <button
              type="button"
              @click="handleExport"
              :disabled="selectedFields.length === 0"
              class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Download class="w-4 h-4" />
              <span>{{ schemaStore.activeLocale === 'fa' ? 'دانلود فایل CSV' : 'Download CSV File' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSchemaStore } from '../stores/schema';
import { useUiStore } from '../stores/ui';
import { resolveLabel } from '../utils/resolveLabel';
import type { ResourceMeta, FieldMeta } from '../types/schema';
import {
  X,
  FileSpreadsheet,
  Download,
  CheckSquare,
  Square
} from 'lucide-vue-next';

const props = defineProps<{
  modelValue: boolean;
  resource: ResourceMeta | null;
  records: any[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const schemaStore = useSchemaStore();
const uiStore = useUiStore();

const selectedFields = ref<string[]>([]);
const includeBOM = ref(true);

const availableFields = computed<FieldMeta[]>(() => {
  if (!props.resource) return [];
  // Exclude non-exportable action fields if any
  return props.resource.fields.filter(f => (f.display_as as string) !== 'actions');
});

watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen && availableFields.value.length > 0) {
      // Default select all fields on open
      selectedFields.value = availableFields.value.map(f => f.name);
    }
  }
);

function selectAll() {
  selectedFields.value = availableFields.value.map(f => f.name);
}

function deselectAll() {
  selectedFields.value = [];
}

function closeModal() {
  emit('update:modelValue', false);
}

function getOptionLabel(field: FieldMeta, val: any): string {
  if (!field.options) return String(val ?? '');
  const opt = field.options.find(o => String(o.value) === String(val));
  return opt ? resolveLabel(opt.label, schemaStore.activeLocale) : String(val ?? '');
}

function formatValueForCsv(field: FieldMeta, val: any, row: any): string {
  if (val === null || val === undefined) return '';

  // Handle boolean
  if (typeof val === 'boolean') {
    return val
      ? (schemaStore.activeLocale === 'fa' ? 'فعال' : 'Active')
      : (schemaStore.activeLocale === 'fa' ? 'غیرفعال' : 'Inactive');
  }

  // Handle options dynamically from schema
  if (field.options && field.options.length > 0) {
    if (Array.isArray(val)) {
      return val.map(v => getOptionLabel(field, v)).filter(Boolean).join(' - ');
    }
    return getOptionLabel(field, val);
  }

  // Handle relation display fields dynamically e.g. author_id_display, category_ids_display
  const displayKey = field.relation?.display_key || `${field.name}_display`;
  if (row && row[displayKey] !== undefined && row[displayKey] !== null) {
    const displayVal = row[displayKey];
    if (Array.isArray(displayVal)) return displayVal.join(' - ');
    return String(displayVal);
  }

  if (Array.isArray(val)) {
    return val.join(' - ');
  }

  return String(val);
}

function handleExport() {
  if (selectedFields.value.length === 0 || !props.resource) return;

  const activeFields = availableFields.value.filter(f => selectedFields.value.includes(f.name));

  // Build CSV Header row using localized field titles
  const headerRow = activeFields.map(f => `"${resolveLabel(f.label, schemaStore.activeLocale).replace(/"/g, '""')}"`).join(',');

  // Build CSV Data rows
  const dataRows = props.records.map(row => {
    return activeFields
      .map(field => {
        const rawVal = row[field.name];
        const formattedStr = formatValueForCsv(field, rawVal, row);
        // Escape double quotes inside values
        return `"${String(formattedStr).replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  const csvContent = (includeBOM.value ? '\uFEFF' : '') + [headerRow, ...dataRows].join('\n');

  // Trigger browser download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const filename = `${props.resource.name || 'export'}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  uiStore.addToast(
    'success',
    schemaStore.activeLocale === 'fa' ? 'خروجی CSV با موفقیت دریافت شد' : 'CSV Export Downloaded',
    schemaStore.activeLocale === 'fa' ? `فایل ${filename} با ${selectedFields.value.length} فیلد دانلود گردید.` : `Export file downloaded.`
  );

  closeModal();
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
