<script setup lang="ts">
import { reactive, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import AuthLayout from '../../components/auth/AuthLayout.vue';
import PasswordInput from '../../components/auth/PasswordInput.vue';
import { useAuthStore } from '../../stores/auth';
import { isValidEmail } from '../../utils/authValidation';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const form = reactive({ email: '', password: '', remember: true });
const errors = reactive({ email: '', password: '', form: '' });
const submitting = ref(false);

function validate() {
  errors.email = !form.email ? 'Email wajib diisi.' : !isValidEmail(form.email) ? 'Format email belum valid.' : '';
  errors.password = !form.password ? 'Password wajib diisi.' : '';
  errors.form = '';
  return !errors.email && !errors.password;
}

async function submit() {
  if (!validate()) return;
  submitting.value = true;
  try {
    await auth.signIn(form.email.trim(), form.password);
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
    router.replace(redirect);
  } catch (error) {
    errors.form = error instanceof Error ? error.message : 'Email atau password tidak sesuai.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <AuthLayout title="Welcome back" subtitle="Sign in to continue to Monitoring Internship.">
    <form class="space-y-5" @submit.prevent="submit">
      <label class="block text-sm font-semibold text-[#111827]" for="email">
        Email
        <input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          class="mt-2 h-12 w-full rounded-xl border border-[#D1D5DB] bg-white px-3 text-sm outline-none transition focus:border-[#3158E8] focus:ring-2 focus:ring-[#3158E8]/10"
        />
        <span v-if="errors.email" class="mt-1 block text-xs font-medium text-[#DC2626]">{{ errors.email }}</span>
      </label>

      <PasswordInput id="password" v-model="form.password" label="Password" :error="errors.password" />

      <div class="flex items-center justify-between gap-3 text-sm">
        <label class="flex items-center gap-2 text-[#6B7280]">
          <input v-model="form.remember" type="checkbox" class="h-4 w-4 rounded border-[#D1D5DB]" />
          Remember me
        </label>
        <RouterLink class="font-semibold text-[#3158E8]" to="/forgot-password">Forgot password?</RouterLink>
      </div>

      <p v-if="errors.form" class="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-[#DC2626]">{{ errors.form }}</p>

      <button class="h-12 w-full rounded-xl bg-[#3158E8] text-sm font-semibold text-white transition hover:bg-[#2749C8] disabled:cursor-not-allowed disabled:opacity-60" :disabled="submitting">
        {{ submitting ? 'Signing in...' : 'Sign In' }}
      </button>

      <p class="text-center text-sm text-[#6B7280]">
        Don’t have an account?
        <RouterLink class="font-semibold text-[#3158E8]" to="/sign-up">Create account</RouterLink>
      </p>
    </form>
  </AuthLayout>
</template>
