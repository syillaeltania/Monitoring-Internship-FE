<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthLayout from '../../components/auth/AuthLayout.vue';
import PasswordInput from '../../components/auth/PasswordInput.vue';
import { useAuthStore } from '../../stores/auth';
import { validatePasswordPair } from '../../utils/authValidation';

const auth = useAuthStore();
const router = useRouter();
const form = reactive({ password: '', confirmPassword: '' });
const errors = reactive({ password: '', confirmPassword: '', form: '' });
const submitting = ref(false);

function validate() {
  const passwordErrors = validatePasswordPair(form.password, form.confirmPassword);
  errors.password = passwordErrors.filter((item) => !item.includes('Konfirmasi')).join(' ');
  errors.confirmPassword = passwordErrors.find((item) => item.includes('Konfirmasi')) ?? '';
  errors.form = '';
  return !errors.password && !errors.confirmPassword;
}

async function submit() {
  if (!validate()) return;
  submitting.value = true;
  try {
    await auth.updatePassword(form.password);
    await auth.signOut();
    router.replace('/sign-in');
  } catch (error) {
    errors.form = error instanceof Error ? error.message : 'Password belum bisa diperbarui.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <AuthLayout title="Set a new password" subtitle="Choose a secure password for your account.">
    <form class="space-y-5" @submit.prevent="submit">
      <PasswordInput id="new-password" v-model="form.password" label="New password" autocomplete="new-password" :error="errors.password" />
      <PasswordInput id="confirm-password" v-model="form.confirmPassword" label="Confirm new password" autocomplete="new-password" :error="errors.confirmPassword" />
      <p v-if="errors.form" class="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-[#DC2626]">{{ errors.form }}</p>
      <button class="h-12 w-full rounded-xl bg-[#3158E8] text-sm font-semibold text-white transition hover:bg-[#2749C8] disabled:cursor-not-allowed disabled:opacity-60" :disabled="submitting">
        {{ submitting ? 'Updating...' : 'Update Password' }}
      </button>
    </form>
  </AuthLayout>
</template>
