<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { pageSizeOptions, paginateRows } from '../utils/pagination';

const props = defineProps<{
  columns: string[];
  rows: Record<string, unknown>[];
  loading?: boolean;
  emptyMessage?: string;
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
          <tr v-if="props.loading" v-for="index in pageSize" :key="`loading-${index}`">
            <td v-for="column in columns" :key="column" class="whitespace-nowrap px-4 py-3">
              <div class="h-4 w-full max-w-32 animate-pulse rounded bg-slate-100"></div>
            </td>
          </tr>
          <tr
            v-else
            v-for="(row, index) in pagination.rows"
            :key="String(row.id ?? index)"
            class="transition duration-200 hover:bg-blue-50/50"
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
          <tr v-if="!props.loading && pagination.totalRows === 0">
            <td :colspan="columns.length" class="px-4 py-12 text-center">
              <div class="mx-auto flex max-w-md flex-col items-center gap-2">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <span class="text-lg font-semibold">-</span>
                </div>
                <p class="text-sm font-semibold text-slate-600">{{ props.emptyMessage ?? 'Data belum tersedia.' }}</p>
                <p class="text-xs text-slate-400">Ubah filter atau tambahkan data baru jika diperlukan.</p>
              </div>
            </td>
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
        <span>{{ props.loading ? 'Memuat data...' : `${pagination.startIndex}-${pagination.endIndex} dari ${pagination.totalRows}` }}</span>
        <div class="flex items-center gap-2">
          <button
            class="action-secondary px-3 py-1.5"
            :disabled="pagination.currentPage <= 1"
            @click="currentPage -= 1"
          >
            Sebelumnya
          </button>
          <span class="min-w-20 text-center">Hal {{ pagination.currentPage }} / {{ pagination.totalPages }}</span>
          <button
            class="action-secondary px-3 py-1.5"
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
