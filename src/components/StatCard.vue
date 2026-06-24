<script setup lang="ts">
import { toneAccentClass, toneTextClass, toneWidgetClass, type ToneKey } from '../utils/designSystem';

defineProps<{ label: string; value: string | number; tone?: ToneKey }>();
</script>

<template>
  <div class="panel group relative overflow-hidden p-5 transition duration-300 hover:shadow-lg" :class="toneWidgetClass(tone)">
    <div class="absolute inset-x-0 top-0 h-1" :class="toneAccentClass(tone)"></div>
    <div class="flex items-start justify-between gap-3">
      <p class="text-sm font-semibold text-slate-600">{{ label }}</p>
      <span class="h-2.5 w-2.5 rounded-full opacity-80 transition duration-300 group-hover:scale-125" :class="toneAccentClass(tone)"></span>
    </div>
    <p
      class="mt-3 break-words text-3xl font-semibold tracking-normal transition duration-300"
      :class="toneTextClass(tone)"
    >
      {{ value }}
    </p>
  </div>
</template>
