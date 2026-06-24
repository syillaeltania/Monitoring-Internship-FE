<script setup lang="ts">
defineProps<{ value: string }>();
</script>

<template>
  <span
    class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="{
      'bg-emerald-50 text-emerald-700': ['ACTIVE', 'ON_GOING', 'COVERED', 'Lengkap'].includes(value),
      'bg-blue-50 text-blue-700': ['PLANNED', 'WAITING_JOIN'].includes(value),
      'bg-slate-100 text-slate-600': ['COMPLETED'].includes(value),
      'bg-red-50 text-red-700': ['TERMINATED', 'URGENT_EMPTY'].includes(value),
      'bg-amber-50 text-amber-700': ['NEEDS_REPLACEMENT', 'Belum Lengkap'].includes(value),
    }"
  >
    {{ value.replaceAll('_', ' ') }}
  </span>
</template>
