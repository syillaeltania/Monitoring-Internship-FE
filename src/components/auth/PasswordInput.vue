<script setup lang="ts">
import { ref } from 'vue';

defineProps<{ id: string; label: string; modelValue: string; error?: string; autocomplete?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
const visible = ref(false);
</script>

<template>
  <label class="block text-sm font-semibold text-[#111827]" :for="id">
    {{ label }}
    <span class="relative mt-2 block">
      <input
        :id="id"
        :type="visible ? 'text' : 'password'"
        :value="modelValue"
        :autocomplete="autocomplete ?? 'current-password'"
        class="h-12 w-full rounded-xl border border-[#D1D5DB] bg-white px-3 pr-20 text-sm outline-none transition focus:border-[#3158E8] focus:ring-2 focus:ring-[#3158E8]/10"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#3158E8] hover:bg-[#EEF2FF]"
        :aria-label="visible ? 'Sembunyikan password' : 'Tampilkan password'"
        @click="visible = !visible"
      >
        {{ visible ? 'Hide' : 'Show' }}
      </button>
    </span>
    <span v-if="error" class="mt-1 block text-xs font-medium text-[#DC2626]">{{ error }}</span>
  </label>
</template>
