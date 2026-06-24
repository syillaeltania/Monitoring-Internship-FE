<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { pageSizeOptions, paginateRows } from '../utils/pagination';

const props = defineProps<{
  columns: string[];
  rows: Record<string, unknown>[];
  rowClass?: (row: Record<string, unknown>) => string;
  cellClass?: (row: Record<string, unknown>, column: string) => string;
}>();
const currentPage = ref(1);
const pageSize = ref<(typeof pageSizeOptions)[number]>(10);
const pagination = computed(() => paginateRows(props.rows, currentPage.value, pageSize.value));

watch(
  () => [props.rows.length, pageSize.value],
  () => {
    currentPage.value = 1;
  },
);

watch(pagination, (value) => {
  currentPage.value = value.currentPage;
});
</script>

<template>
  <div class="panel overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th v-for="column in columns" :key="column" class="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
              {{ column }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          <tr
            v-for="(row, index) in pagination.rows"
            :key="String(row.id ?? index)"
            class="hover:bg-slate-50"
            :class="props.rowClass?.(row)"
          >
            <td
              v-for="column in columns"
              :key="column"
              class="whitespace-nowrap px-4 py-3 text-slate-700"
              :class="props.cellClass?.(row, column)"
            >
              <slot :name="column" :row="row">{{ row[column] }}</slot>
            </td>
          </tr>
          <tr v-if="pagination.totalRows === 0">
            <td :colspan="columns.length" class="px-4 py-8 text-center text-slate-500">Data belum tersedia.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex flex-col gap-3 border-t border-slate-100 bg-white px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
      <div class="flex items-center gap-2">
        <span>Tampilkan</span>
        <select v-model.number="pageSize" class="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-ink">
          <option v-for="option in pageSizeOptions" :key="option" :value="option">{{ option }}</option>
        </select>
        <span>data</span>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <span>{{ pagination.startIndex }}-{{ pagination.endIndex }} dari {{ pagination.totalRows }}</span>
        <div class="flex items-center gap-2">
          <button
            class="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="pagination.currentPage <= 1"
            @click="currentPage -= 1"
          >
            Sebelumnya
          </button>
          <span class="min-w-20 text-center">Hal {{ pagination.currentPage }} / {{ pagination.totalPages }}</span>
          <button
            class="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="pagination.currentPage >= pagination.totalPages"
            @click="currentPage += 1"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
