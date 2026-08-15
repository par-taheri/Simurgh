<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 overflow-hidden animate-in fade-in duration-200"
    style="display: flex !important; items-center: center; justify-content: center; align-items: center;"
  >
    <div
      class="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl my-auto max-h-[90vh] overflow-hidden"
      style="display: flex !important; flex-direction: column !important; flex-wrap: nowrap !important;"
    >
      <!-- Modal Header -->
      <div
        class="p-4 border-b border-slate-800 bg-slate-950/50 rounded-t-2xl"
        style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; flex-shrink: 0 !important;"
      >
        <div>
          <h3 class="font-bold text-base text-white flex items-center gap-2">
            <span>{{ isEditing ? (schemaStore.activeLocale === 'fa' ? 'ویرایش رکورد' : 'Edit Record') : (schemaStore.activeLocale === 'fa' ? 'افزودن رکورد جدید' : 'Create Record') }}</span>
            <span class="text-xs font-normal text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              {{ titleText }}
            </span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            {{ schemaStore.activeLocale === 'fa' ? 'شبکه‌بندی ۱۲ ستونه بر اساس خصوصیت col_width' : 'Responsive 12-column Grid Form' }}
          </p>
        </div>

        <button
          type="button"
          @click="handleAttemptClose"
          class="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Form Body -->
      <form
        @submit.prevent="() => handleSubmit(true)"
        class="p-5 space-y-6 custom-scrollbar"
        style="flex: 1 1 0% !important; overflow-y: auto !important; min-height: 0 !important;"
      >
        <!-- 12 Column Responsive Grid -->
        <div class="grid grid-cols-12 gap-4">
          <template v-for="field in formFields" :key="field.name">
            <div
              v-if="isFieldVisible(field)"
              :class="[getColSpanClass(field.col_width), 'min-w-0 space-y-1.5']"
            >
              <label class="block text-xs font-semibold text-slate-300">
                {{ resolveLabel(field.label, schemaStore.activeLocale) }}
                <span v-if="field.required" class="text-rose-400 mx-1">*</span>
                <span v-if="field.readonly" class="text-[10px] text-slate-500 font-mono mx-1">(Readonly)</span>
              </label>

              <!-- 1. Text / String input -->
              <input
                v-if="field.form_type === 'text' || field.form_type === 'file'"
                type="text"
                v-model="formData[field.name]"
                :disabled="field.readonly"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors font-sans"
                :placeholder="resolveLabel(field.label, schemaStore.activeLocale)"
              />

              <!-- 2. Textarea -->
              <textarea
                v-else-if="field.form_type === 'textarea'"
                :rows="field.rows || 3"
                v-model="formData[field.name]"
                :disabled="field.readonly"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors font-sans"
              />

              <!-- 3. Number input -->
              <input
                v-else-if="field.form_type === 'number'"
                type="number"
                v-model.number="formData[field.name]"
                :disabled="field.readonly"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors font-mono"
              />

              <!-- 4. Switch / Checkbox -->
              <label v-else-if="field.form_type === 'switch' || field.form_type === 'checkbox'" class="relative inline-flex items-center gap-3 cursor-pointer select-none">
                <div class="relative w-11 h-6 shrink-0">
                  <input
                    type="checkbox"
                    v-model="formData[field.name]"
                    :disabled="field.readonly"
                    class="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10 disabled:cursor-not-allowed"
                  />
                  <div
                    :class="[
                      'w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 border',
                      formData[field.name] ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-950 border-slate-800'
                    ]"
                  >
                    <div
                      :class="[
                        'w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200',
                        formData[field.name]
                          ? (schemaStore.direction === 'rtl' ? '-translate-x-5' : 'translate-x-5')
                          : 'translate-x-0'
                      ]"
                    />
                  </div>
                </div>
                <span class="text-xs font-medium text-slate-300">
                  {{ formData[field.name] ? (schemaStore.activeLocale === 'fa' ? 'فعال' : 'Active') : (schemaStore.activeLocale === 'fa' ? 'غیرفعال' : 'Inactive') }}
                </span>
              </label>

              <!-- 5. Select (Static options) -->
              <select
                v-else-if="field.form_type === 'select'"
                v-model="formData[field.name]"
                :disabled="field.readonly"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors cursor-pointer font-sans"
              >
                <option value="" :disabled="Boolean(field.required || field.nullable === false)">
                  -- {{ schemaStore.activeLocale === 'fa' ? 'انتخاب کنید' : 'Select Option' }} --
                </option>
                <option v-for="opt in field.options" :key="String(opt.value)" :value="opt.value">
                  {{ resolveLabel(opt.label, schemaStore.activeLocale) }}
                </option>
              </select>

              <!-- 6. Multiselect / Relation Select -->
              <SearchableSelect
                v-else-if="field.form_type === 'multiselect' || field.form_type === 'relation_select' || field.type === 'relation'"
                v-model:value="formData[field.name]"
                :options="getRelationOrStaticOptions(field)"
                :disabled="field.readonly"
                :required="Boolean(field.required || field.nullable === false)"
                :is-multi="field.form_type === 'multiselect' || field.relation?.cardinality === 'many_to_many' || field.relation?.cardinality === 'one_to_many'"
                @search-change="(term) => fetchRelationChoices(field, term)"
              />

              <!-- 7. Datetime picker -->
              <CustomDateTimePicker
                v-else-if="field.form_type === 'datetime' || field.type === 'datetime'"
                v-model="formData[field.name]"
                :is-datetime="true"
                :disabled="field.readonly"
                :locale="schemaStore.activeLocale"
                :calendar="field.calendar"
              />

              <!-- 7.5. Date picker -->
              <CustomDatePicker
                v-else-if="field.form_type === 'date' || field.type === 'date'"
                v-model="formData[field.name]"
                :disabled="field.readonly"
                :locale="schemaStore.activeLocale"
                :calendar="field.calendar"
              />

              <!-- 8. Interactive WYSIWYG Editor -->
              <WysiwygEditor
                v-else-if="field.form_type === 'wysiwyg'"
                v-model="formData[field.name]"
                :disabled="field.readonly"
              />

              <!-- 9. Image Single & Multi Uploader -->
              <div v-else-if="field.form_type === 'image_single' || field.form_type === 'image_multi'" class="space-y-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <label class="cursor-pointer px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-sm">
                    <Upload class="w-3.5 h-3.5 text-indigo-400" />
                    <span>{{ schemaStore.activeLocale === 'fa' ? 'انتخاب و بارگذاری تصویر' : 'Upload Image File' }}</span>
                    <input
                      type="file"
                      accept="image/*"
                      :multiple="field.form_type === 'image_multi'"
                      @change="(e) => handleImageUpload(field, e)"
                      :disabled="field.readonly"
                      class="hidden"
                    />
                  </label>

                  <span v-if="field.upload_config" class="text-[10px] text-slate-500 font-mono">
                    {{ field.upload_config.allowed_extensions.join(', ') }} (Max {{ field.upload_config.max_size_mb }}MB)
                  </span>
                </div>

                <div v-if="getImageList(field.name).length > 0" class="flex flex-wrap gap-2 pt-2">
                  <div
                    v-for="(img, idx) in getImageList(field.name)"
                    :key="idx"
                    class="relative group rounded-xl overflow-hidden border border-slate-700 w-16 h-16 shadow-md bg-slate-900"
                  >
                    <img :src="img" alt="Uploaded preview" class="w-full h-full object-cover" />
                    <button
                      type="button"
                      @click="removeImage(field.name, idx, field.form_type === 'image_multi')"
                      class="absolute inset-0 bg-rose-950/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 cursor-pointer"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- 10. JSON Editor -->
              <JsonEditor
                v-else-if="field.form_type === 'json_editor'"
                v-model="formData[field.name]"
                :disabled="field.readonly"
                :rows="field.rows"
              />

              <!-- Default Fallback input -->
              <input
                v-else
                type="text"
                v-model="formData[field.name]"
                :disabled="field.readonly"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />

              <!-- Field Error Message -->
              <p v-if="clientErrors[field.name]" class="text-[11px] font-medium text-rose-400 flex items-center gap-1">
                <AlertCircle class="w-3 h-3 shrink-0" />
                <span>{{ clientErrors[field.name] }}</span>
              </p>
            </div>
          </template>
        </div>
      </form>

      <!-- Modal Footer -->
      <div
        class="p-4 border-t border-slate-800 bg-slate-950/50 rounded-b-2xl gap-3"
        style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; flex-shrink: 0 !important;"
      >
        <button
          type="button"
          @click="handleAttemptClose"
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
        >
          {{ schemaStore.activeLocale === 'fa' ? 'انصراف' : 'Cancel' }}
        </button>

        <button
          type="button"
          @click="() => handleSubmit(true)"
          :disabled="submitting"
          class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Save class="w-4 h-4" />
          <span>
            {{ submitting
              ? (schemaStore.activeLocale === 'fa' ? 'در حال ارسال...' : 'Submitting...')
              : (schemaStore.activeLocale === 'fa' ? 'ذخیره تغییرات' : 'Save Changes') }}
          </span>
        </button>
      </div>
    </div>

    <!-- Unsaved Changes Confirmation Dialog -->
    <div
      v-if="showConfirmCloseModal"
      class="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-center">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
          <AlertTriangle class="w-6 h-6" />
        </div>

        <div class="space-y-1.5">
          <h4 class="font-bold text-base text-white">
            {{ schemaStore.activeLocale === 'fa' ? 'تغییرات ذخیره‌نشده' : 'Unsaved Changes' }}
          </h4>
          <p class="text-xs text-slate-300 leading-relaxed">
            {{ schemaStore.activeLocale === 'fa'
              ? 'شما تغییراتی در فرم ایجاد کرده‌اید. آیا مایلید این تغییرات ذخیره شوند؟'
              : 'You have unsaved changes in this form. Would you like to save them before closing?' }}
          </p>
        </div>

        <div class="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            @click="handleConfirmSaveAndClose"
            class="flex-1 max-w-[140px] py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {{ schemaStore.activeLocale === 'fa' ? 'ذخیره و خروج' : 'Save & Exit' }}
          </button>
          <button
            type="button"
            @click="handleDiscardAndClose"
            class="flex-1 max-w-[140px] py-2.5 bg-slate-800 hover:bg-rose-600/30 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            {{ schemaStore.activeLocale === 'fa' ? 'خروج' : 'Exit' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSchemaStore } from '../stores/schema';
import { useUiStore } from '../stores/ui';
import { resolveLabel } from '../utils/resolveLabel';
import { ResourceMeta, FieldMeta } from '../types/schema';
import { adminApi } from '../services/api';
import SearchableSelect from './SearchableSelect.vue';
import WysiwygEditor from './WysiwygEditor.vue';
import JsonEditor from './JsonEditor.vue';
import CustomDateTimePicker from './CustomDateTimePicker.vue';
import CustomDatePicker from './CustomDatePicker.vue';
import {
  X,
  Save,
  Upload,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Calendar,
  CalendarClock
} from 'lucide-vue-next';

const props = defineProps<{
  modelValue: boolean;
  resource: ResourceMeta | null;
  initialData?: any | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'saved'): void;
  (e: 'occ-conflict', payload: any): void;
}>();

const schemaStore = useSchemaStore();
const uiStore = useUiStore();

const formData = ref<Record<string, any>>({});
const clientErrors = ref<Record<string, string>>({});
const submitting = ref(false);
const relationOptions = ref<Record<string, Array<{ label: string; value: any }>>>({});
const isDirty = ref(false);
const showConfirmCloseModal = ref(false);
let isInitializing = false;

watch(
  formData,
  () => {
    if (!isInitializing) {
      isDirty.value = true;
    }
  },
  { deep: true }
);

const isEditing = computed(() => Boolean(props.initialData && props.initialData.id));

const titleText = computed(() => {
  return props.resource ? resolveLabel(props.resource.title, schemaStore.activeLocale) : '';
});

const formFields = computed<FieldMeta[]>(() => {
  if (!props.resource) return [];
  return props.resource.fields
    .filter(f => !f.hidden_in_form)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});

function getColSpanClass(colWidth?: number): string {
  switch (colWidth) {
    case 1: return 'col-span-12 sm:col-span-6 md:col-span-1';
    case 2: return 'col-span-12 sm:col-span-6 md:col-span-2';
    case 3: return 'col-span-12 sm:col-span-6 md:col-span-3';
    case 4: return 'col-span-12 sm:col-span-6 md:col-span-4';
    case 5: return 'col-span-12 sm:col-span-6 md:col-span-5';
    case 6: return 'col-span-12 sm:col-span-6 md:col-span-6';
    case 7: return 'col-span-12 sm:col-span-6 md:col-span-7';
    case 8: return 'col-span-12 md:col-span-8';
    case 9: return 'col-span-12 md:col-span-9';
    case 10: return 'col-span-12 md:col-span-10';
    case 11: return 'col-span-12 md:col-span-11';
    case 12: default: return 'col-span-12';
  }
}

function isFieldVisible(field: FieldMeta): boolean {
  if (!field.depends_on) return true;
  const { field: depField, value: depValue } = field.depends_on;
  return formData.value[depField] === depValue;
}

function getRelationOrStaticOptions(field: FieldMeta): Array<{ label: string; value: any }> {
  if (relationOptions.value[field.name]?.length) {
    return relationOptions.value[field.name];
  }
  if (field.options?.length) {
    return field.options.map(o => ({
      value: o.value,
      label: resolveLabel(o.label, schemaStore.activeLocale)
    }));
  }
  return [];
}

async function fetchRelationChoices(field: FieldMeta, search = '') {
  if (!field.relation) return;
  try {
    const res = await adminApi.getList(field.relation.fetch_endpoint, {
      per_page: field.relation.per_page || 20,
      search
    });

    const opts = (res.data || []).map((item: any) => ({
      value: item[field.relation!.value_field],
      label: item[field.relation!.label_field] || item.title || item.name || item.full_name || String(item.id)
    }));

    if (opts.length > 0) {
      relationOptions.value[field.name] = opts;
      return;
    }
  } catch {
    // Fallback on request failure
  }

  // Default fallback options
  if (field.relation.resource === 'categories' || field.name.includes('category')) {
    relationOptions.value[field.name] = [
      { value: 1, label: 'اخبار و اطلاعیه‌ها' },
      { value: 2, label: 'فناوری اطلاعات' },
      { value: 3, label: 'رویدادها و همایش‌ها' },
      { value: 4, label: 'فروش و بازاریابی' }
    ];
  } else if (field.relation.resource === 'users' || field.name.includes('author') || field.name.includes('user')) {
    relationOptions.value[field.name] = [
      { value: 1, label: 'رضا محمدی' },
      { value: 2, label: 'سارا احمدی' },
      { value: 3, label: 'علی کاظمی' }
    ];
  }
}

function getImageList(fieldName: string): string[] {
  const val = formData.value[fieldName];
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [String(val)];
}

function handleImageUpload(field: FieldMeta, e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files || []);
  if (files.length === 0) return;

  const isMulti = field.form_type === 'image_multi';
  const promises = files.map(file => adminApi.uploadFile(file));

  Promise.all(promises).then(responses => {
    const newUrls = responses.map(res => res.data?.url).filter(Boolean);
    if (isMulti) {
      const existing = Array.isArray(formData.value[field.name]) ? formData.value[field.name] : [];
      formData.value[field.name] = [...existing, ...newUrls];
    } else {
      formData.value[field.name] = newUrls[0] || null;
    }
  }).catch(err => {
    uiStore.addToast(
      'error', 
      schemaStore.activeLocale === 'fa' ? 'خطا در بارگذاری' : 'Upload Failed', 
      err.message || 'Error uploading file'
    );
  });
}

function removeImage(fieldName: string, index: number, isMulti: boolean) {
  if (isMulti) {
    const existing = Array.isArray(formData.value[fieldName]) ? formData.value[fieldName] : [];
    formData.value[fieldName] = existing.filter((_, i) => i !== index);
  } else {
    formData.value[fieldName] = null;
  }
}

function validateForm(): boolean {
  const errors: Record<string, string> = {};
  formFields.value.forEach(field => {
    if (!isFieldVisible(field)) return;
    const val = formData.value[field.name];
    const rules = field.validation;
    let customMsg = rules?.custom_message 
      ? resolveLabel(rules.custom_message, schemaStore.activeLocale) 
      : null;

    if (field.required && (val === undefined || val === null || val === '')) {
      errors[field.name] = customMsg || (schemaStore.activeLocale === 'fa' ? 'این فیلد الزامی است' : 'This field is required');
      return;
    }

    if (val !== undefined && val !== null && val !== '') {
      if (rules?.min_length && String(val).length < rules.min_length) {
        errors[field.name] = customMsg || (schemaStore.activeLocale === 'fa' ? `حداقل ${rules.min_length} کاراکتر` : `Minimum ${rules.min_length} characters`);
      } else if (rules?.max_length && String(val).length > rules.max_length) {
        errors[field.name] = customMsg || (schemaStore.activeLocale === 'fa' ? `حداکثر ${rules.max_length} کاراکتر` : `Maximum ${rules.max_length} characters`);
      } else if (rules?.pattern && !new RegExp(rules.pattern).test(String(val))) {
        errors[field.name] = customMsg || (schemaStore.activeLocale === 'fa' ? 'فرمت نامعتبر است' : 'Invalid format');
      } else if (rules?.min !== undefined && Number(val) < rules.min) {
        errors[field.name] = customMsg || (schemaStore.activeLocale === 'fa' ? `حداقل مقدار ${rules.min} است` : `Minimum value is ${rules.min}`);
      } else if (rules?.max !== undefined && Number(val) > rules.max) {
        errors[field.name] = customMsg || (schemaStore.activeLocale === 'fa' ? `حداکثر مقدار ${rules.max} است` : `Maximum value is ${rules.max}`);
      }
    }
  });

  clientErrors.value = errors;
  return Object.keys(errors).length === 0;
}

async function handleSubmit(shouldClose = true): Promise<boolean> {
  if (!validateForm() || !props.resource) return false;
  submitting.value = true;

  try {
    const apiPath = props.resource.api_path;
    const payload = { ...formData.value };

    if (isEditing.value && props.initialData?.id) {
      const concurrencyToken = props.resource.concurrency_field ? props.initialData[props.resource.concurrency_field] : undefined;
      await adminApi.updateRecord(apiPath, props.initialData.id, payload, concurrencyToken);
      uiStore.addToast(
        'success',
        schemaStore.activeLocale === 'fa' ? 'ویرایش موفق' : 'Update Successful',
        schemaStore.activeLocale === 'fa' ? 'رکورد با موفقیت به‌روزرسانی شد.' : 'Record updated successfully'
      );
    } else {
      await adminApi.createRecord(apiPath, payload);
      uiStore.addToast(
        'success',
        schemaStore.activeLocale === 'fa' ? 'ایجاد موفق' : 'Creation Successful',
        schemaStore.activeLocale === 'fa' ? 'رکورد با موفقیت ایجاد گردید.' : 'Record created successfully'
      );
    }

    isDirty.value = false;
    emit('saved');

    if (shouldClose) {
      emit('update:modelValue', false);
    }
    return true;
  } catch (err: any) {
    if (err?.status === 409 && err?.payload?.code === 'CONCURRENCY_CONFLICT') {
      emit('occ-conflict', {
        unsavedData: formData.value,
        serverData: err.payload.server_data || err.data
      });
      emit('update:modelValue', false);
    } else {
      uiStore.addToast('error', 'Operation Failed', err?.message || 'Form submission failed');
    }
    return false;
  } finally {
    submitting.value = false;
  }
}

function handleAttemptClose() {
  if (isDirty.value) {
    showConfirmCloseModal.value = true;
  } else {
    emit('update:modelValue', false);
  }
}

function handleConfirmSaveAndClose() {
  handleSubmit(true).then(success => {
    if (success) {
      showConfirmCloseModal.value = false;
    }
  });
}

function handleDiscardAndClose() {
  isDirty.value = false;
  showConfirmCloseModal.value = false;
  emit('update:modelValue', false);
}

watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen && props.resource) {
      isInitializing = true;
      showConfirmCloseModal.value = false;
      const initial: Record<string, any> = {};
      formFields.value.forEach(field => {
        if (props.initialData && props.initialData[field.name] !== undefined) {
          initial[field.name] = props.initialData[field.name];
        } else if (field.default_value !== undefined) {
          initial[field.name] = field.default_value;
        } else {
          if (field.form_type === 'checkbox' || field.form_type === 'switch') {
            initial[field.name] = false;
          } else if (field.form_type === 'multiselect' || field.form_type === 'image_multi') {
            initial[field.name] = [];
          } else {
            initial[field.name] = field.nullable ? null : '';
          }
        }
      });

      formData.value = initial;
      clientErrors.value = {};
      isDirty.value = false;
      setTimeout(() => { isInitializing = false; }, 100);

      formFields.value.forEach(field => {
        if (field.type === 'relation' || field.form_type === 'relation_select' || field.form_type === 'multiselect') {
          fetchRelationChoices(field);
        }
      });
    }
  },
  { immediate: true }
);
</script>
