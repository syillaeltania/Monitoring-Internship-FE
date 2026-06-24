<script setup lang="ts">
defineProps<{ title: string; subtitle: string }>();
</script>

<template>
  <div class="mb-6 flex flex-col gap-3 sm:mb-8 md:flex-row md:items-end md:justify-between">
    <div class="min-w-0">
      <h2 class="text-2xl font-bold leading-tight text-ink sm:text-[30px]">{{ title }}</h2>
      <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{{ subtitle }}</p>
    </div>
    <div class="flex shrink-0 flex-wrap gap-2">
      <slot />
    </div>
  </div>
</template>
