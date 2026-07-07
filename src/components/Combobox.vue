<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  modelValue: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const isOpen = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const listRef = ref<HTMLUListElement | null>(null);

const filteredOptions = computed(() => {
  const query = props.modelValue.toLowerCase();
  return props.options.filter(opt => opt.toLowerCase().includes(query));
});

const selectOption = (opt: string) => {
  emit('update:modelValue', opt);
  isOpen.value = false;
};

const handleInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
  isOpen.value = true;
};

const close = (e: MouseEvent) => {
  if (
    inputRef.value && !inputRef.value.contains(e.target as Node) &&
    listRef.value && !listRef.value.contains(e.target as Node)
  ) {
    isOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', close));
onUnmounted(() => document.removeEventListener('click', close));
</script>

<template>
  <div class="relative w-full">
    <input
      ref="inputRef"
      type="text"
      :value="modelValue"
      @input="handleInput"
      @focus="isOpen = true"
      class="control w-full"
      :placeholder="placeholder"
      :required="required"
    />
    <ul
      v-show="isOpen && filteredOptions.length > 0"
      ref="listRef"
      class="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1.5 shadow-xl scrollbar-thin scrollbar-thumb-slate-200"
    >
      <li
        v-for="opt in filteredOptions"
        :key="opt"
        @click="selectOption(opt)"
        class="cursor-pointer px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-blue-50 hover:text-navy"
      >
        {{ opt }}
      </li>
    </ul>
  </div>
</template>
