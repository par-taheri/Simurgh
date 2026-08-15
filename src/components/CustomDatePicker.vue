<template>
  <CustomDateTimePicker
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :disabled="disabled"
    :placeholder="placeholder"
    :locale="locale"
    :calendar="calendar"
    :is-datetime="false"
  />
</template>

<script setup lang="ts">
import CustomDateTimePicker from './CustomDateTimePicker.vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null;
    disabled?: boolean;
    placeholder?: string;
    locale?: string;
    calendar?: 'jalali' | 'gregorian';
  }>(),
  {
    modelValue: null,
    disabled: false,
    placeholder: '',
    locale: 'fa'
  }
);

defineEmits<{
  (e: 'update:modelValue', value: number | string | null): void;
}>();
</script>
