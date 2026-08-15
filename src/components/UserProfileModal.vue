<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[9990] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      @click.self="closeModal"
    >
      <div
        :dir="schemaStore.direction"
        class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden select-none animate-in zoom-in-95 duration-200 my-auto"
      >
        <!-- Modal Header Banner -->
        <div class="h-28 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 relative p-4 flex items-start justify-between">
          <div class="flex items-center gap-2">
            <div class="inline-flex items-center gap-1.5 bg-slate-950/50 backdrop-blur-md border border-white/10 text-white px-3 py-1 rounded-full text-xs font-semibold">
              <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
              <span>{{ authStore.user?.role || 'User' }}</span>
            </div>
            <span class="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{{ schemaStore.activeLocale === 'fa' ? 'فعال' : 'Active' }}</span>
            </span>
          </div>

          <button
            type="button"
            @click="closeModal"
            class="p-1.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 text-white/80 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Profile Header Section -->
        <div class="px-6 pb-2 relative pt-0">
          <div class="flex items-end justify-between -mt-10 mb-4">
            <!-- Avatar -->
            <div class="w-20 h-20 rounded-2xl bg-slate-950 p-1 shadow-2xl border-2 border-indigo-500/40 overflow-hidden relative group">
              <img
                v-if="authStore.user?.avatar"
                :src="authStore.user.avatar"
                alt="Avatar"
                class="w-full h-full rounded-xl object-cover"
              />
              <div v-else class="w-full h-full rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold text-2xl border border-indigo-500/30">
                <User class="w-9 h-9" />
              </div>
            </div>

            <!-- Header Quick Info -->
            <div class="pt-11 pb-1 text-end">
              <h3 class="font-bold text-lg text-white leading-snug">
                {{ authStore.user?.full_name || (schemaStore.activeLocale === 'fa' ? 'کاربر سیستم' : 'System User') }}
              </h3>
              <p class="text-xs text-slate-400 font-mono mt-0.5">
                {{ authStore.user?.email || '' }}
              </p>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="flex items-center border-b border-slate-800 gap-2 mb-5">
            <button
              type="button"
              @click="activeTab = 'info'"
              :class="[
                'pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer px-1',
                activeTab === 'info'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              ]"
            >
              <User class="w-4 h-4" />
              <span>{{ schemaStore.activeLocale === 'fa' ? 'اطلاعات کاربری' : 'Profile Info' }}</span>
            </button>

            <button
              type="button"
              @click="activeTab = 'password'"
              :class="[
                'pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer px-1',
                activeTab === 'password'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              ]"
            >
              <KeyRound class="w-4 h-4" />
              <span>{{ schemaStore.activeLocale === 'fa' ? 'تغییر رمز عبور' : 'Change Password' }}</span>
            </button>
          </div>

          <!-- TAB 1: Profile Info -->
          <div v-if="activeTab === 'info'" class="space-y-4">
            <form @submit.prevent="handleSaveProfile" class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">
                  {{ schemaStore.activeLocale === 'fa' ? 'نام و نام خانوادگی' : 'Full Name' }}
                </label>
                <input
                  v-model="profileFullName"
                  type="text"
                  required
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">
                  {{ schemaStore.activeLocale === 'fa' ? 'پست الکترونیکی' : 'Email Address' }}
                </label>
                <input
                  :value="authStore.user?.email || ''"
                  type="email"
                  disabled
                  class="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>

              <div class="pt-2 flex justify-end">
                <button
                  type="submit"
                  :disabled="isSavingProfile"
                  class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 v-if="!isSavingProfile" class="w-3.5 h-3.5" />
                  <Loader2 v-else class="w-3.5 h-3.5 animate-spin" />
                  <span>{{ schemaStore.activeLocale === 'fa' ? 'ذخیره اطلاعات' : 'Save Changes' }}</span>
                </button>
              </div>
            </form>

            <!-- Role Permissions List (Dynamic based on user permissions) -->
            <div v-if="authStore.user?.permissions && authStore.user.permissions.length > 0" class="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
              <span class="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                {{ schemaStore.activeLocale === 'fa' ? 'سطوح دسترسی مدیریت:' : 'System Permissions:' }}
              </span>

              <div class="flex flex-wrap gap-2 text-xs">
                <span
                  v-for="(perm, idx) in authStore.user.permissions"
                  :key="idx"
                  class="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl font-medium"
                >
                  {{ typeof perm === 'object' ? resolveLabel(perm, schemaStore.activeLocale) : String(perm) }}
                </span>
              </div>
            </div>
          </div>

          <!-- TAB 2: Change Password -->
          <div v-else-if="activeTab === 'password'" class="space-y-4">
            <form @submit.prevent="handleChangePassword" class="space-y-3.5">
              <!-- Current Password -->
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">
                  {{ schemaStore.activeLocale === 'fa' ? 'رمز عبور فعلی' : 'Current Password' }}
                </label>
                <div class="relative">
                  <input
                    v-model="oldPassword"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    required
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors pr-9"
                  />
                  <button
                    type="button"
                    @click="showCurrentPassword = !showCurrentPassword"
                    class="absolute inset-y-0 end-0 px-2.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    <Eye v-if="!showCurrentPassword" class="w-3.5 h-3.5" />
                    <EyeOff v-else class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <!-- New Password -->
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">
                  {{ schemaStore.activeLocale === 'fa' ? 'رمز عبور جدید' : 'New Password' }}
                </label>
                <div class="relative">
                  <input
                    v-model="newPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    required
                    minlength="8"
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors pr-9"
                  />
                  <button
                    type="button"
                    @click="showNewPassword = !showNewPassword"
                    class="absolute inset-y-0 end-0 px-2.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    <Eye v-if="!showNewPassword" class="w-3.5 h-3.5" />
                    <EyeOff v-else class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Password Strength Meter -->
                <div v-if="newPassword" class="mt-2 space-y-1">
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="text-slate-400">
                      {{ schemaStore.activeLocale === 'fa' ? 'قدرت رمز عبور:' : 'Password Strength:' }}
                    </span>
                    <span
                      :class="[
                        'font-bold',
                        passwordStrength === 'weak' ? 'text-rose-400' :
                        passwordStrength === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                      ]"
                    >
                      {{
                        passwordStrength === 'weak'
                          ? (schemaStore.activeLocale === 'fa' ? 'ضعیف' : 'Weak')
                          : passwordStrength === 'medium'
                          ? (schemaStore.activeLocale === 'fa' ? 'متوسط' : 'Medium')
                          : (schemaStore.activeLocale === 'fa' ? 'قوی' : 'Strong')
                      }}
                    </span>
                  </div>
                  <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    <div
                      class="h-full transition-all duration-300"
                      :class="[
                        passwordStrength === 'weak' ? 'w-1/3 bg-rose-500' :
                        passwordStrength === 'medium' ? 'w-2/3 bg-amber-500' : 'w-full bg-emerald-500'
                      ]"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Confirm New Password -->
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">
                  {{ schemaStore.activeLocale === 'fa' ? 'تکرار رمز عبور جدید' : 'Confirm New Password' }}
                </label>
                <div class="relative">
                  <input
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    required
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors pr-9"
                  />
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute inset-y-0 end-0 px-2.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    <Eye v-if="!showConfirmPassword" class="w-3.5 h-3.5" />
                    <EyeOff v-else class="w-3.5 h-3.5" />
                  </button>
                </div>
                <p v-if="passwordMismatchError" class="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle class="w-3 h-3 shrink-0" />
                  <span>{{ passwordMismatchError }}</span>
                </p>
              </div>

              <div class="pt-2 flex justify-end">
                <button
                  type="submit"
                  :disabled="isChangingPassword || !!passwordMismatchError"
                  class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Lock v-if="!isChangingPassword" class="w-3.5 h-3.5" />
                  <Loader2 v-else class="w-3.5 h-3.5 animate-spin" />
                  <span>{{ schemaStore.activeLocale === 'fa' ? 'تغییر رمز عبور' : 'Update Password' }}</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 mt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer transition-colors"
            >
              {{ schemaStore.activeLocale === 'fa' ? 'بستن' : 'Close' }}
            </button>

            <button
              type="button"
              @click="handleLogout"
              class="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <LogOut class="w-4 h-4" />
              <span>{{ schemaStore.activeLocale === 'fa' ? 'خروج از حساب کاربری' : 'Logout' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useSchemaStore } from '../stores/schema';
import { useUiStore } from '../stores/ui';
import { adminApi } from '../services/api';
import { resolveLabel } from '../utils/resolveLabel';
import {
  ShieldCheck,
  X,
  User,
  LogOut,
  KeyRound,
  CheckCircle2,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-vue-next';

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const authStore = useAuthStore();
const schemaStore = useSchemaStore();
const uiStore = useUiStore();

const activeTab = ref<'info' | 'password'>('info');

// Profile Form State
const profileFullName = ref('');
const isSavingProfile = ref(false);

// Password Form State
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const isChangingPassword = ref(false);

// Sync user state on open
watch(
  () => authStore.user,
  user => {
    if (user) {
      profileFullName.value = user.full_name || '';
    }
  },
  { immediate: true }
);

// Computed Password Strength
const passwordStrength = computed(() => {
  const p = newPassword.value;
  if (!p) return 'weak';
  if (p.length >= 10 && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) {
    return 'strong';
  }
  if (p.length >= 8) {
    return 'medium';
  }
  return 'weak';
});

// Computed Password Mismatch
const passwordMismatchError = computed(() => {
  if (newPassword.value && confirmPassword.value && newPassword.value !== confirmPassword.value) {
    return schemaStore.activeLocale === 'fa'
      ? 'رمز عبور جدید و تکرار آن یکسان نیستند.'
      : 'New password and confirmation do not match.';
  }
  return '';
});

// Save Profile Info Handler
async function handleSaveProfile() {
  if (!profileFullName.value.trim()) return;

  isSavingProfile.value = true;
  await new Promise(res => setTimeout(res, 400));

  if (authStore.user) {
    authStore.user.full_name = profileFullName.value;
  }

  isSavingProfile.value = false;
  uiStore.addToast(
    'success',
    schemaStore.activeLocale === 'fa' ? 'پروفایل به‌روزرسانی شد' : 'Profile Updated',
    schemaStore.activeLocale === 'fa'
      ? 'اطلاعات حساب کاربری با موفقیت ذخیره شد.'
      : 'Your account profile details were saved successfully.'
  );
}

// Change Password Handler
async function handleChangePassword() {
  if (!oldPassword.value || !newPassword.value || passwordMismatchError.value) return;
  isChangingPassword.value = true;

  try {
    await adminApi.updatePassword({
      old_password: oldPassword.value,
      new_password: newPassword.value
    });

    oldPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';

    uiStore.addToast(
      'success',
      schemaStore.activeLocale === 'fa' ? 'رمز عبور تغییر یافت' : 'Password Changed',
      schemaStore.activeLocale === 'fa'
        ? 'رمز عبور حساب کاربری شما با موفقیت بروز شد.'
        : 'Your account password has been updated successfully.'
    );
  } catch (error: any) {
    uiStore.addToast(
      'error',
      schemaStore.activeLocale === 'fa' ? 'خطا در تغییر رمز' : 'Password Update Failed',
      error.message || 'An error occurred while changing the password.'
    );
  } finally {
    isChangingPassword.value = false;
  }
}

function handleLogout() {
  authStore.logout();
  uiStore.addToast('info', 'Logged Out', 'You have been logged out.');
  closeModal();
}

function closeModal() {
  emit('update:modelValue', false);
}
</script>
