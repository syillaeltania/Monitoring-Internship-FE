<script setup lang="ts">
defineProps<{ title: string; subtitle: string }>();
</script>

<template>
  <div class="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
    <div>
      <h2 class="text-2xl font-semibold text-ink">{{ title }}</h2>
      <p class="mt-1 max-w-3xl text-sm text-slate-500">{{ subtitle }}</p>
    </div>
    <slot />
  </div>
</template>
