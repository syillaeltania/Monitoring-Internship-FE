<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AppShell from './components/AppShell.vue';
import { useAuthStore } from './stores/auth';

const route = useRoute();
const auth = useAuthStore();
const isAuthPage = computed(() => Boolean(route.meta.public));

onMounted(() => {
  auth.initializeAuth();
});
</script>

<template>
  <div v-if="!auth.initialized" class="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-sm font-semibold text-[#6B7280]">
    Loading session...
  </div>
  <RouterView v-else-if="isAuthPage" />
  <AppShell v-else />
</template>
