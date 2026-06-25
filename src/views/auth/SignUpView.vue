<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import AuthLayout from '../../components/auth/AuthLayout.vue';
import PasswordInput from '../../components/auth/PasswordInput.vue';
import { useAuthStore } from '../../stores/auth';
import { isValidEmail, passwordChecklist, validatePasswordPair } from '../../utils/authValidation';

const auth = useAuthStore();
const form = reactive({ fullName: '', email: '', password: '', confirmPassword: '' });
const errors = reactive({ fullName: '', email: '', password: '', confirmPassword: '', form: '' });
const submitting = ref(false);
const confirmationMessage = ref('');
const rules = computed(() => passwordChecklist(form.password));

function validate() {
  errors.fullName = !form.fullName.trim() ? 'Full name wajib diisi.' : '';
  errors.email = !form.email ? 'Email wajib diisi.' : !isValidEmail(form.email) ? 'Format email belum valid.' : '';
  const passwordErrors = validatePasswordPair(form.password, form.confirmPassword);
  errors.password = passwordErrors.filter((item) => !item.includes('Konfirmasi')).join(' ');
  errors.confirmPassword = passwordErrors.find((item) => item.includes('Konfirmasi')) ?? '';
  errors.form = '';
  return !errors.fullName && !errors.email && !errors.password && !errors.confirmPassword;
}

async function submit() {
  if (!validate()) return;
  submitting.value = true;
  try {
    await auth.signUp(form.fullName.trim(), form.email.trim(), form.password);
    confirmationMessage.value = 'Account berhasil dibuat. Jika email confirmation aktif, silakan cek inbox untuk verifikasi.';
  } catch (error) {
    errors.form = error instanceof Error ? error.message : 'Account belum bisa dibuat. Silakan coba lagi.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <AuthLayout title="Create your account" subtitle="Start managing internship operations in one workspace.">
    <div v-if="confirmationMessage" class="rounded-2xl border border-green-100 bg-green-50 p-5">
      <p class="text-sm font-semibold text-[#16A34A]">{{ confirmationMessage }}</p>
      <RouterLink class="mt-4 inline-flex text-sm font-semibold text-[#3158E8]" to="/sign-in">Back to Sign In</RouterLink>
    </div>

    <form v-else class="space-y-5" @submit.prevent="submit">
      <label class="block text-sm font-semibold text-[#111827]" for="full-name">
        Full name
        <input id="full-name" v-model="form.fullName" autocomplete="name" class="mt-2 h-12 w-full rounded-xl border border-[#D1D5DB] bg-white px-3 text-sm outline-none transition focus:border-[#3158E8] focus:ring-2 focus:ring-[#3158E8]/10" />
        <span v-if="errors.fullName" class="mt-1 block text-xs font-medium text-[#DC2626]">{{ errors.fullName }}</span>
      </label>

      <label class="block text-sm font-semibold text-[#111827]" for="email">
        Email
        <input id="email" v-model="form.email" type="email" autocomplete="email" class="mt-2 h-12 w-full rounded-xl border border-[#D1D5DB] bg-white px-3 text-sm outline-none transition focus:border-[#3158E8] focus:ring-2 focus:ring-[#3158E8]/10" />
        <span v-if="errors.email" class="mt-1 block text-xs font-medium text-[#DC2626]">{{ errors.email }}</span>
      </label>

      <PasswordInput id="password" v-model="form.password" label="Password" autocomplete="new-password" :error="errors.password" />
      <div class="grid gap-1 text-xs text-[#6B7280]">
        <span :class="rules.minLength ? 'text-[#16A34A]' : ''">Minimum 8 characters</span>
        <span :class="rules.uppercase ? 'text-[#16A34A]' : ''">At least one uppercase letter</span>
        <span :class="rules.lowercase ? 'text-[#16A34A]' : ''">At least one lowercase letter</span>
        <span :class="rules.number ? 'text-[#16A34A]' : ''">At least one number</span>
      </div>
      <PasswordInput id="confirm-password" v-model="form.confirmPassword" label="Confirm password" autocomplete="new-password" :error="errors.confirmPassword" />

      <p v-if="errors.form" class="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-[#DC2626]">{{ errors.form }}</p>

      <button class="h-12 w-full rounded-xl bg-[#3158E8] text-sm font-semibold text-white transition hover:bg-[#2749C8] disabled:cursor-not-allowed disabled:opacity-60" :disabled="submitting">
        {{ submitting ? 'Creating account...' : 'Create Account' }}
      </button>
      <p class="text-center text-sm text-[#6B7280]">
        Already have an account?
        <RouterLink class="font-semibold text-[#3158E8]" to="/sign-in">Sign in</RouterLink>
      </p>
    </form>
  </AuthLayout>
</template>
