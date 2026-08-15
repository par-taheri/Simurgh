<template>
  <div ref="containerRef" class="relative w-full select-none">
    <!-- Input Trigger Field -->
    <div
      @click="togglePicker"
      :class="[
        'w-full bg-slate-950 border rounded-xl py-2.5 px-3.5 text-xs text-slate-100 flex items-center justify-between gap-2 transition-all cursor-pointer font-mono group shadow-sm',
        isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800 hover:border-slate-700',
        disabled ? 'opacity-50 pointer-events-none' : ''
      ]"
    >
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <CalendarClock v-if="isDatetime" class="w-4 h-4 text-indigo-400 shrink-0" />
        <Calendar v-else class="w-4 h-4 text-indigo-400 shrink-0" />
        <span v-if="displayFormatted" class="truncate text-slate-100 font-medium">
          {{ displayFormatted }}
        </span>
        <span v-else class="text-slate-500 truncate font-sans">
          {{ placeholder || (isDatetime ? (locale === 'fa' ? 'انتخاب تاریخ و زمان...' : 'Select date & time...') : (locale === 'fa' ? 'انتخاب تاریخ...' : 'Select date...')) }}
        </span>
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <!-- Calendar Mode Badge -->
        <span class="px-1.5 py-0.5 text-[10px] rounded bg-slate-900 border border-slate-800 text-indigo-300 font-sans flex items-center gap-1">
          <Sun v-if="calendarType === 'jalali'" class="w-2.5 h-2.5 text-amber-400" />
          <Globe v-else class="w-2.5 h-2.5 text-sky-400" />
          {{ calendarType === 'jalali' ? 'شمسی' : 'میلادی' }}
        </span>
      </div>
    </div>

    <!-- Dropdown Popover Picker (Teleported to Body for floating popup) -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isOpen"
          ref="popoverRef"
          :style="popoverStyle"
          :dir="locale === 'fa' ? 'rtl' : 'ltr'"
          class="fixed z-[9999] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto max-h-[calc(100vh-2rem)] bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-4 text-slate-100 divide-y divide-slate-800/80 backdrop-blur-xl select-none custom-scrollbar"
        >
          <!-- Top Header: Mode Toggle + Navigation -->
          <div class="pb-3 flex flex-col gap-2.5">
            <div class="flex items-center justify-between">
              <!-- Calendar Type Switcher (Jalali vs Gregorian) -->
              <div class="inline-flex p-0.5 bg-slate-950 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  @click="setCalendarType('jalali')"
                  :class="[
                    'px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1',
                    calendarType === 'jalali' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  ]"
                >
                  <Sun class="w-3 h-3 text-amber-300" />
                  شمسی
                </button>
                <button
                  type="button"
                  @click="setCalendarType('gregorian')"
                  :class="[
                    'px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1',
                    calendarType === 'gregorian' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  ]"
                >
                  <Globe class="w-3 h-3 text-sky-300" />
                  میلادی
                </button>
              </div>

              <!-- Quick "Today / Now" button -->
              <button
                type="button"
                @click="selectToday"
                class="px-2.5 py-1 text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-all font-medium flex items-center gap-1"
              >
                <Sparkles class="w-3 h-3" />
                {{ calendarType === 'jalali' ? 'امروز' : 'Today' }}
              </button>
            </div>

            <!-- Month / Year Controls -->
            <div class="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                @click="prevMonth"
                class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                :title="locale === 'fa' ? 'ماه قبل' : 'Previous Month'"
              >
                <ChevronRight v-if="locale === 'fa'" class="w-4 h-4" />
                <ChevronLeft v-else class="w-4 h-4" />
              </button>

              <div class="flex items-center gap-1.5 text-xs font-bold font-sans">
                <span
                  @click="changeView('months')"
                  class="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  {{ currentView === 'years' ? '' : currentMonthName }}
                </span>
                <span
                  @click="changeView('years')"
                  class="text-slate-300 font-mono hover:text-white transition-colors cursor-pointer"
                >
                  <template v-if="currentView === 'years'">
                    {{ decadeStart }} - {{ decadeStart + 11 }}
                  </template>
                  <template v-else>
                    {{ currentYearDisplay }}
                  </template>
                </span>
              </div>

              <button
                type="button"
                @click="nextMonth"
                class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                :title="locale === 'fa' ? 'ماه بعد' : 'Next Month'"
              >
                <ChevronLeft v-if="locale === 'fa'" class="w-4 h-4" />
                <ChevronRight v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Calendar Body (Days / Months / Years) -->
          <div class="overflow-hidden min-h-[240px] -m-2 p-2">
            <Transition :name="transitionName" mode="out-in">
              <!-- Days View -->
              <div v-if="currentView === 'days'" :key="`days-${calendarType}-${viewJalaliYear}-${viewJalaliMonth}-${viewGregYear}-${viewGregMonth}`" class="w-full">
                <!-- Days of Week Header -->
                <div class="py-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400">
                  <span v-for="dayName in weekDayHeaderNames" :key="dayName" class="py-1">
                    {{ dayName }}
                  </span>
                </div>
                <!-- Calendar Days Grid -->
                <div class="py-2 grid grid-cols-7 gap-1 text-center">
                  <button
                    v-for="(day, idx) in calendarGrid"
                    :key="idx"
                    type="button"
                    @click="onDayClick(day)"
                    :disabled="!day.inCurrentMonth"
                    :class="[
                      'h-8 text-xs font-mono rounded-lg flex items-center justify-center transition-all cursor-pointer relative',
                      !day.inCurrentMonth ? 'text-slate-600 cursor-not-allowed opacity-30' : 'hover:bg-slate-800 text-slate-200',
                      day.isSelected ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/40 hover:bg-indigo-500' : '',
                      day.isToday && !day.isSelected ? 'ring-1 ring-indigo-400 text-indigo-300 font-bold bg-indigo-950/30' : ''
                    ]"
                  >
                    <span>{{ day.dayNumber }}</span>
                    <span v-if="day.isToday && !day.isSelected" class="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-400"></span>
                  </button>
                </div>
              </div>

              <!-- Months View -->
              <div v-else-if="currentView === 'months'" :key="`months-${calendarType}-${viewJalaliYear}-${viewGregYear}`" class="w-full py-4 grid grid-cols-3 gap-2 text-center content-start">
                <button
                  v-for="(month, idx) in monthsGrid"
                  :key="idx"
                  type="button"
                  @click="onMonthClick(idx)"
                  :class="[
                    'h-10 text-sm font-bold rounded-lg flex items-center justify-center transition-all cursor-pointer text-slate-200',
                    isMonthSelected(idx) ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 hover:bg-indigo-500' : 'hover:bg-slate-800'
                  ]"
                >
                  {{ month }}
                </button>
              </div>

              <!-- Years View -->
              <div v-else-if="currentView === 'years'" :key="`years-${calendarType}-${decadeStart}`" class="w-full py-4 grid grid-cols-3 gap-2 text-center content-start">
                <button
                  v-for="year in yearsGrid"
                  :key="year"
                  type="button"
                  @click="onYearClick(year)"
                  :class="[
                    'h-10 text-sm font-mono font-bold rounded-lg flex items-center justify-center transition-all cursor-pointer text-slate-200',
                    isYearSelected(year) ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 hover:bg-indigo-500' : 'hover:bg-slate-800'
                  ]"
                >
                  {{ year }}
                </button>
              </div>
            </Transition>
          </div>

          <!-- Time Picker Section (if Datetime) -->
          <div v-if="isDatetime" class="pt-3 mt-1 flex flex-col gap-2">
            <div class="flex items-center justify-between text-xs font-medium text-slate-400">
              <span class="flex items-center gap-1">
                <Clock class="w-3.5 h-3.5 text-indigo-400" />
                {{ locale === 'fa' ? 'زمان (ساعت : دقیقه)' : 'Time (HH : MM)' }}
              </span>
            </div>

            <div class="flex items-center justify-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <!-- Hour -->
              <div class="flex flex-col items-center">
                <button @click="changeHour(1)" type="button" class="p-1 hover:text-indigo-400 text-slate-500 transition-colors">
                  <ChevronUp class="w-4 h-4" />
                </button>
                <input
                  type="text"
                  v-model="selectedHour"
                  @blur="onTimeBlur"
                  @input="onTimeInput"
                  class="w-12 text-center bg-slate-900 border border-slate-700 rounded-lg py-1 text-sm font-bold font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                  maxlength="2"
                />
                <button @click="changeHour(-1)" type="button" class="p-1 hover:text-indigo-400 text-slate-500 transition-colors">
                  <ChevronDown class="w-4 h-4" />
                </button>
              </div>

              <span class="text-xl font-bold font-mono text-slate-500 animate-pulse">:</span>

              <!-- Minute -->
              <div class="flex flex-col items-center">
                <button @click="changeMinute(1)" type="button" class="p-1 hover:text-indigo-400 text-slate-500 transition-colors">
                  <ChevronUp class="w-4 h-4" />
                </button>
                <input
                  type="text"
                  v-model="selectedMinute"
                  @blur="onTimeBlur"
                  @input="onTimeInput"
                  class="w-12 text-center bg-slate-900 border border-slate-700 rounded-lg py-1 text-sm font-bold font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                  maxlength="2"
                />
                <button @click="changeMinute(-1)" type="button" class="p-1 hover:text-indigo-400 text-slate-500 transition-colors">
                  <ChevronDown class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import {
  Calendar,
  CalendarClock,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Globe,
  Sun,
  Sparkles
} from 'lucide-vue-next';
import {
  JalaliDate,
  gregorianToJalali,
  jalaliToGregorian,
  jalaliMonthLength,
  JALALI_MONTH_NAMES,
  jalaliToDate,
  toPersianDigits,
  formatJalaliLong,
  parseAnyTimestampToDate
} from '../utils/jalali';

interface CalendarDayItem {
  gDate: Date; // standard JS Date object
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null;
    isDatetime?: boolean;
    disabled?: boolean;
    placeholder?: string;
    locale?: 'fa' | 'en' | string;
    calendar?: 'jalali' | 'gregorian';
  }>(),
  {
    modelValue: null,
    isDatetime: false,
    disabled: false,
    placeholder: '',
    locale: 'fa'
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | string | null): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const popoverRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const popoverStyle = ref<Record<string, string>>({});

const currentView = ref<'days' | 'months' | 'years'>('days');
const transitionName = ref('picker-zoom');

// Mode: 'jalali' | 'gregorian'
const calendarType = ref<'jalali' | 'gregorian'>(
  props.calendar || (props.locale === 'fa' ? 'jalali' : 'gregorian')
);

watch(() => props.calendar, (newCal) => {
  if (newCal) {
    calendarType.value = newCal;
  }
});

// Internal JS Date selected
const selectedDate = ref<Date>(new Date());
// Initial time (00:00)
const selectedHour = ref<string>('00');
const selectedMinute = ref<string>('00');

// Viewing Jalali State
const viewJalaliYear = ref<number>(1405);
const viewJalaliMonth = ref<number>(1); // 1-12

// Viewing Gregorian State
const viewGregYear = ref<number>(new Date().getFullYear());
const viewGregMonth = ref<number>(new Date().getMonth()); // 0-11

// Weekday headers
const weekDayHeaderNames = computed(() => {
  if (calendarType.value === 'jalali') {
    // Shanbeh to Jomeh (Saturday -> Friday)
    return ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  }
  return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
});

// Month Name
const currentMonthName = computed(() => {
  if (calendarType.value === 'jalali') {
    return JALALI_MONTH_NAMES[viewJalaliMonth.value - 1];
  }
  const d = new Date(viewGregYear.value, viewGregMonth.value, 1);
  return d.toLocaleString('en-US', { month: 'long' });
});

// Year Display
const currentYearDisplay = computed(() => {
  if (calendarType.value === 'jalali') {
    return String(viewJalaliYear.value);
  }
  return String(viewGregYear.value);
});

// Formatted label in trigger input
const displayFormatted = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') return '';
  try {
    const d = parseAnyTimestampToDate(props.modelValue);
    if (!d || isNaN(d.getTime())) return String(props.modelValue);

    const pad = (n: number) => String(n).padStart(2, '0');
    const timePart = props.isDatetime ? ` - ${pad(d.getHours())}:${pad(d.getMinutes())}` : '';

    if (calendarType.value === 'jalali') {
      const j = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
      return `${j.jy}/${pad(j.jm)}/${pad(j.jd)}${timePart}`;
    } else {
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}${timePart}`;
    }
  } catch {
    return String(props.modelValue);
  }
});

// Sync from modelValue
function syncFromModelValue() {
  if (props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== '') {
    const parsed = parseAnyTimestampToDate(props.modelValue);
    if (parsed && !isNaN(parsed.getTime())) {
      selectedDate.value = new Date(parsed);
      const j = gregorianToJalali(parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate());
      viewJalaliYear.value = j.jy;
      viewJalaliMonth.value = j.jm;

      viewGregYear.value = parsed.getFullYear();
      viewGregMonth.value = parsed.getMonth();

      selectedHour.value = String(parsed.getHours()).padStart(2, '0');
      selectedMinute.value = String(parsed.getMinutes()).padStart(2, '0');
      return;
    }
  }

  // Default to today with 00:00 time
  const now = new Date();
  selectedDate.value = new Date(now);
  const j = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  viewJalaliYear.value = j.jy;
  viewJalaliMonth.value = j.jm;

  viewGregYear.value = now.getFullYear();
  viewGregMonth.value = now.getMonth();

  selectedHour.value = '00';
  selectedMinute.value = '00';
}

watch(() => props.modelValue, syncFromModelValue, { immediate: true });

function setCalendarType(type: 'jalali' | 'gregorian') {
  calendarType.value = type;
  // Sync view state from selected date
  const d = selectedDate.value;
  const j = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  viewJalaliYear.value = j.jy;
  viewJalaliMonth.value = j.jm;
  viewGregYear.value = d.getFullYear();
  viewGregMonth.value = d.getMonth();
}

// Calendar Grid Generator
const calendarGrid = computed<CalendarDayItem[]>(() => {
  const days: CalendarDayItem[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sel = new Date(selectedDate.value);
  sel.setHours(0, 0, 0, 0);

  if (calendarType.value === 'jalali') {
    // --- JALALI CALENDAR GRID ---
    const jy = viewJalaliYear.value;
    const jm = viewJalaliMonth.value;
    const totalDays = jalaliMonthLength(jy, jm);

    // First day of current Jalali month in Gregorian JS Date
    const firstDayGDate = jalaliToDate(jy, jm, 1);
    // JS Day: 0=Sunday, 1=Monday... 6=Saturday
    // Iranian Saturday-based offset: Shanbeh=0, Yekshanbeh=1 ... Jomeh=6
    const startOffset = (firstDayGDate.getDay() + 1) % 7;

    // Previous month padding
    const prevJm = jm === 1 ? 12 : jm - 1;
    const prevJy = jm === 1 ? jy - 1 : jy;
    const prevTotalDays = jalaliMonthLength(prevJy, prevJm);

    for (let i = startOffset - 1; i >= 0; i--) {
      const jd = prevTotalDays - i;
      const gDate = jalaliToDate(prevJy, prevJm, jd);
      days.push({
        gDate,
        dayNumber: jd,
        inCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    // Current month days
    for (let jd = 1; jd <= totalDays; jd++) {
      const gDate = jalaliToDate(jy, jm, jd);
      const gNormalized = new Date(gDate);
      gNormalized.setHours(0, 0, 0, 0);

      days.push({
        gDate,
        dayNumber: jd,
        inCurrentMonth: true,
        isToday: gNormalized.getTime() === today.getTime(),
        isSelected: gNormalized.getTime() === sel.getTime()
      });
    }

    // Next month padding (up to 42 cells)
    const remaining = 42 - days.length;
    const nextJm = jm === 12 ? 1 : jm + 1;
    const nextJy = jm === 12 ? jy + 1 : jy;

    for (let jd = 1; jd <= remaining; jd++) {
      const gDate = jalaliToDate(nextJy, nextJm, jd);
      days.push({
        gDate,
        dayNumber: jd,
        inCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }
  } else {
    // --- GREGORIAN CALENDAR GRID ---
    const gy = viewGregYear.value;
    const gm = viewGregMonth.value;

    const firstDay = new Date(gy, gm, 1);
    const lastDay = new Date(gy, gm + 1, 0);
    const startDayOfWeek = firstDay.getDay(); // Sunday = 0
    const totalDays = lastDay.getDate();

    const prevMonthLastDay = new Date(gy, gm, 0).getDate();

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(gy, gm - 1, prevMonthLastDay - i);
      days.push({
        gDate: d,
        dayNumber: d.getDate(),
        inCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(gy, gm, i);
      const dNorm = new Date(d);
      dNorm.setHours(0, 0, 0, 0);

      days.push({
        gDate: d,
        dayNumber: i,
        inCurrentMonth: true,
        isToday: dNorm.getTime() === today.getTime(),
        isSelected: dNorm.getTime() === sel.getTime()
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(gy, gm + 1, i);
      days.push({
        gDate: d,
        dayNumber: i,
        inCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }
  }

  return days;
});

function prevMonth() {
  transitionName.value = 'picker-slide-prev';
  if (currentView.value === 'days') {
    if (calendarType.value === 'jalali') {
      if (viewJalaliMonth.value === 1) {
        viewJalaliMonth.value = 12;
        viewJalaliYear.value--;
      } else {
        viewJalaliMonth.value--;
      }
    } else {
      if (viewGregMonth.value === 0) {
        viewGregMonth.value = 11;
        viewGregYear.value--;
      } else {
        viewGregMonth.value--;
      }
    }
  } else if (currentView.value === 'months') {
    if (calendarType.value === 'jalali') {
      viewJalaliYear.value--;
    } else {
      viewGregYear.value--;
    }
  } else if (currentView.value === 'years') {
    if (calendarType.value === 'jalali') {
      viewJalaliYear.value -= 12;
    } else {
      viewGregYear.value -= 12;
    }
  }
}

function nextMonth() {
  transitionName.value = 'picker-slide-next';
  if (currentView.value === 'days') {
    if (calendarType.value === 'jalali') {
      if (viewJalaliMonth.value === 12) {
        viewJalaliMonth.value = 1;
        viewJalaliYear.value++;
      } else {
        viewJalaliMonth.value++;
      }
    } else {
      if (viewGregMonth.value === 11) {
        viewGregMonth.value = 0;
        viewGregYear.value++;
      } else {
        viewGregMonth.value++;
      }
    }
  } else if (currentView.value === 'months') {
    if (calendarType.value === 'jalali') {
      viewJalaliYear.value++;
    } else {
      viewGregYear.value++;
    }
  } else if (currentView.value === 'years') {
    if (calendarType.value === 'jalali') {
      viewJalaliYear.value += 12;
    } else {
      viewGregYear.value += 12;
    }
  }
}

function changeView(view: 'days' | 'months' | 'years') {
  if (currentView.value === view) return;
  transitionName.value = 'picker-zoom';
  currentView.value = view;
}

const monthsGrid = computed(() => {
  if (calendarType.value === 'jalali') {
    return JALALI_MONTH_NAMES;
  }
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(viewGregYear.value, i, 1);
    return d.toLocaleString('en-US', { month: 'short' });
  });
});

const decadeStart = computed(() => {
  const year = calendarType.value === 'jalali' ? viewJalaliYear.value : viewGregYear.value;
  return year - (year % 12);
});

const yearsGrid = computed(() => {
  const start = decadeStart.value;
  return Array.from({ length: 12 }, (_, i) => start + i);
});

function isMonthSelected(idx: number) {
  if (calendarType.value === 'jalali') {
    return viewJalaliMonth.value === idx + 1;
  }
  return viewGregMonth.value === idx;
}

function isYearSelected(year: number) {
  if (calendarType.value === 'jalali') {
    return viewJalaliYear.value === year;
  }
  return viewGregYear.value === year;
}

function onMonthClick(idx: number) {
  if (calendarType.value === 'jalali') {
    viewJalaliMonth.value = idx + 1;
  } else {
    viewGregMonth.value = idx;
  }
  changeView('days');
}

function onYearClick(year: number) {
  if (calendarType.value === 'jalali') {
    viewJalaliYear.value = year;
  } else {
    viewGregYear.value = year;
  }
  changeView('months');
}

// On user clicking a day
function onDayClick(day: CalendarDayItem) {
  if (!day.inCurrentMonth) return;
  selectedDate.value = new Date(day.gDate);
  emitSelectedValue();

  // If date-only mode, close popup immediately on click
  if (!props.isDatetime) {
    isOpen.value = false;
  }
}

function selectToday() {
  const now = new Date();
  selectedDate.value = new Date(now);

  const j = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  viewJalaliYear.value = j.jy;
  viewJalaliMonth.value = j.jm;

  viewGregYear.value = now.getFullYear();
  viewGregMonth.value = now.getMonth();

  emitSelectedValue();
  if (!props.isDatetime) {
    isOpen.value = false;
  }
}

// Time Adjustments
function setTimePreset(preset: string) {
  const [h, m] = preset.split(':');
  selectedHour.value = h;
  selectedMinute.value = m;
  emitSelectedValue();
}

function changeHour(delta: number) {
  let h = parseInt(selectedHour.value, 10) || 0;
  h = (h + delta + 24) % 24;
  selectedHour.value = String(h).padStart(2, '0');
  emitSelectedValue();
}

function changeMinute(delta: number) {
  let m = parseInt(selectedMinute.value, 10) || 0;
  m = (m + delta + 60) % 60;
  selectedMinute.value = String(m).padStart(2, '0');
  emitSelectedValue();
}

function onTimeBlur() {
  let h = parseInt(selectedHour.value, 10);
  if (isNaN(h) || h < 0) h = 0;
  if (h > 23) h = 23;
  selectedHour.value = String(h).padStart(2, '0');

  let m = parseInt(selectedMinute.value, 10);
  if (isNaN(m) || m < 0) m = 0;
  if (m > 59) m = 59;
  selectedMinute.value = String(m).padStart(2, '0');

  emitSelectedValue();
}

function onTimeInput() {
  emitSelectedValue();
}

// Emits value directly to parent as ISO 8601 string
function emitSelectedValue() {
  const d = new Date(selectedDate.value);
  const hour = parseInt(selectedHour.value, 10) || 0;
  const minute = parseInt(selectedMinute.value, 10) || 0;
  d.setHours(hour, minute, 0, 0);

  const isoString = d.toISOString();
  emit('update:modelValue', isoString);
}

function togglePicker() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    currentView.value = 'days';
    transitionName.value = 'picker-zoom';
    syncFromModelValue();
    nextTick(() => {
      updatePopoverPosition();
      requestAnimationFrame(() => {
        updatePopoverPosition();
      });
    });
  }
}

function clearValue() {
  emit('update:modelValue', null);
}

// Positioning logic (detect space above vs below)
function updatePopoverPosition() {
  if (!containerRef.value || !isOpen.value) return;

  const rect = containerRef.value.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;

  const actualHeight = popoverRef.value?.offsetHeight || (props.isDatetime ? 450 : 340);
  const popoverWidth = Math.min(320, window.innerWidth - 24);

  // If space below is insufficient and space above is greater -> pop UPWARDS
  const openUp = spaceBelow < actualHeight && spaceAbove > spaceBelow;

  let top = 0;
  if (openUp) {
    top = rect.top - actualHeight - 8;
    if (top < 12) top = 12;
  } else {
    top = rect.bottom + 8;
    if (top + actualHeight > window.innerHeight - 12) {
      top = Math.max(12, window.innerHeight - actualHeight - 12);
    }
  }

  let left = rect.left;
  if (props.locale === 'fa') {
    left = rect.right - popoverWidth;
  }

  if (left < 12) left = 12;
  if (left + popoverWidth > window.innerWidth - 12) {
    left = window.innerWidth - popoverWidth - 12;
  }

  popoverStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    width: `${popoverWidth}px`
  };
}

watch(isOpen, (newVal) => {
  if (newVal) {
    window.addEventListener('scroll', updatePopoverPosition, true);
    window.addEventListener('resize', updatePopoverPosition);
  } else {
    window.removeEventListener('scroll', updatePopoverPosition, true);
    window.removeEventListener('resize', updatePopoverPosition);
  }
});

// Click outside handler
function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node;
  if (
    containerRef.value &&
    !containerRef.value.contains(target) &&
    popoverRef.value &&
    !popoverRef.value.contains(target)
  ) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  window.removeEventListener('scroll', updatePopoverPosition, true);
  window.removeEventListener('resize', updatePopoverPosition);
});
</script>

<style scoped>
/* View Mode Transitions */
.picker-zoom-enter-active,
.picker-zoom-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.picker-zoom-enter-from {
  opacity: 0;
  transform: scale(0.92);
}
.picker-zoom-leave-to {
  opacity: 0;
  transform: scale(1.06);
}

/* Slide Next Transition */
.picker-slide-next-enter-active,
.picker-slide-next-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.picker-slide-next-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.picker-slide-next-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Slide Prev Transition */
.picker-slide-prev-enter-active,
.picker-slide-prev-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.picker-slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.picker-slide-prev-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
