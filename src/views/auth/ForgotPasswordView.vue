<script setup lang="ts">
import { reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import AuthLayout from '../../components/auth/AuthLayout.vue';
import { useAuthStore } from '../../stores/auth';
import { isValidEmail } from '../../utils/authValidation';

const auth = useAuthStore();
const form = reactive({ email: '' });
const error = ref('');
const success = ref('');
const submitting = ref(false);

async function submit() {
  error.value = !form.email ? 'Email wajib diisi.' : !isValidEmail(form.email) ? 'Format email belum valid.' : '';
  success.value = '';
  if (error.value) return;
  submitting.value = true;
  try {
    await auth.resetPassword(form.email.trim());
    success.value = 'Reset link sudah dikirim. Silakan cek inbox email Anda.';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Reset link belum bisa dikirim.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <AuthLayout title="Reset your password" subtitle="Enter your email and we’ll send you a reset link.">
    <form class="space-y-5" @submit.prevent="submit">
      <label class="block text-sm font-semibold text-[#111827]" for="email">
        Email
        <input id="email" v-model="form.email" type="email" autocomplete="email" class="mt-2 h-12 w-full rounded-xl border border-[#D1D5DB] bg-white px-3 text-sm outline-none transition focus:border-[#3158E8] focus:ring-2 focus:ring-[#3158E8]/10" />
        <span v-if="error" class="mt-1 block text-xs font-medium text-[#DC2626]">{{ error }}</span>
      </label>
      <p v-if="success" class="rounded-xl bg-green-50 px-3 py-2 text-sm font-medium text-[#16A34A]">{{ success }}</p>
      <button class="h-12 w-full rounded-xl bg-[#3158E8] text-sm font-semibold text-white transition hover:bg-[#2749C8] disabled:cursor-not-allowed disabled:opacity-60" :disabled="submitting">
        {{ submitting ? 'Sending...' : 'Send Reset Link' }}
      </button>
      <RouterLink class="block text-center text-sm font-semibold text-[#3158E8]" to="/sign-in">Back to Sign In</RouterLink>
    </form>
  </AuthLayout>
</template>
