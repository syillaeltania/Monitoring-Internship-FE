<script setup lang="ts">
defineProps<{ value: string }>();
</script>

<template>
  <span
    class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="{
      'bg-[#A8E9BE] text-[#174A2E]': ['ACTIVE', 'ON_GOING', 'COVERED', 'Lengkap'].includes(value),
      'bg-[#EEF2FF] text-[#3158E8]': ['PLANNED', 'WAITING_JOIN'].includes(value),
      'bg-[#F5F0E7] text-[#77736F]': ['COMPLETED'].includes(value),
      'bg-[#FFE8E2] text-[#C64632]': ['TERMINATED', 'URGENT_EMPTY'].includes(value),
      'bg-[#FFF5C8] text-[#8A6A00]': ['NEEDS_REPLACEMENT', 'Belum Lengkap'].includes(value),
    }"
  >
    {{ value.replaceAll('_', ' ') }}
  </span>
</template>
