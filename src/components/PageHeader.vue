<script setup lang="ts">
defineProps<{ title: string; subtitle: string }>();
</script>

<template>
  <div class="mb-5 flex flex-col gap-3 sm:mb-6 md:flex-row md:items-end md:justify-between">
    <div class="min-w-0">
      <h2 class="text-xl font-semibold leading-tight text-ink sm:text-2xl">{{ title }}</h2>
      <p class="mt-1 max-w-3xl text-sm text-slate-500">{{ subtitle }}</p>
    </div>
    <div class="flex shrink-0 flex-wrap gap-2">
      <slot />
    </div>
  </div>
</template>
