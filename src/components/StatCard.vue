<script setup lang="ts">
defineProps<{ label: string; value: string | number; tone?: 'navy' | 'green' | 'orange' | 'red' }>();
</script>

<template>
  <div class="panel p-5">
    <p class="text-sm font-medium text-slate-500">{{ label }}</p>
    <p
      class="mt-3 text-3xl font-semibold"
      :class="{
        'text-navy': !tone || tone === 'navy',
        'text-success': tone === 'green',
        'text-warning': tone === 'orange',
        'text-danger': tone === 'red',
      }"
    >
      {{ value }}
    </p>
  </div>
</template>
