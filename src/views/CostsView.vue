<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import DataTable from '../components/DataTable.vue';
import PageHeader from '../components/PageHeader.vue';
import SimpleChart from '../components/SimpleChart.vue';
import StatCard from '../components/StatCard.vue';
import { api } from '../services/api';
import { rupiah } from '../utils/format';
import { buildCostQuery, defaultCostFilters, monthOptions } from '../utils/costFilters';
import { divisionCategories } from '../utils/internFilters';

const data = ref<any>({ rows: [], byDivision: [], byType: [], total: 0 });
const filters = reactive(defaultCostFilters());
const years = [2024, 2025, 2026, 2027];
const editingCost = ref<any>(null);
const costForm = reactive({
  baseSalary: 0,
  totalMealAllowance: 0,
});
const feedback = ref('');
const saving = ref(false);
const loading = ref(false);

const selectedMonthLabel = computed(() => monthOptions.find((month) => month.value === filters.month)?.label ?? '-');
const participantCount = computed(() => data.value.rows.length);
const averageCost = computed(() => (participantCount.value ? Math.round(data.value.total / participantCount.value) : 0));
const topDivision = computed(() => [...data.value.byDivision].sort((a: any, b: any) => b.value - a.value)[0]);
const topType = computed(() => [...data.value.byType].sort((a: any, b: any) => b.value - a.value)[0]);
const highCostRows = computed(() =>
  [...data.value.rows]
    .sort((a: any, b: any) => (b.totalMonthlyCost ?? 0) - (a.totalMonthlyCost ?? 0))
    .slice(0, 3),
);
const typeSummary = computed(() =>
  data.value.byType.map((item: any) => ({
    ...item,
    percentage: data.value.total ? Math.round((item.value / data.value.total) * 100) : 0,
  })),
);
const wisdomItems = computed(() => {
  if (!participantCount.value) {
    return ['Tidak ada cost pada filter ini. Periksa periode atau status peserta.'];
  }

  const items = [
    `Prioritaskan review budget ${topDivision.value?.name ?? 'divisi terbesar'} karena kontribusinya paling tinggi.`,
    `Validasi ${highCostRows.value[0]?.intern?.name ?? 'peserta cost terbesar'} sebagai cost peserta tertinggi periode ini.`,
  ];

  if ((topType.value?.name ?? '') === 'PROFESSIONAL') {
    items.push('Pisahkan monitoring gaji pokok profesional dari uang makan instansi agar variance budget lebih mudah ditelusuri.');
  } else {
    items.push('Pantau perubahan uang makan instansi karena volume peserta akan langsung memengaruhi total cost.');
  }

  return items;
});

const tableRows = computed(() =>
  data.value.rows.map((item: any) => ({
    id: `${item.internId}-${item.year}-${item.month}`,
    internId: item.internId,
    month: item.month,
    year: item.year,
    rawBaseSalary: item.baseSalary ?? 0,
    rawMealAllowance: item.totalMealAllowance ?? 0,
    Peserta: item.intern?.name ?? '-',
    Tipe: item.intern?.type ?? '-',
    Divisi: item.intern?.normalizedDivision ?? item.intern?.division ?? '-',
    'Gaji Pokok': rupiah(item.baseSalary ?? 0),
    'Uang Makan': rupiah(item.totalMealAllowance ?? 0),
    Total: rupiah(item.totalMonthlyCost ?? 0),
    Aksi: item.internId,
  })),
);

async function loadCosts() {
  loading.value = true;
  try {
    data.value = await api.costs(buildCostQuery(filters));
  } finally {
    loading.value = false;
  }
}

function openEditCost(row: Record<string, any>) {
  editingCost.value = row;
  costForm.baseSalary = Number(row.rawBaseSalary ?? 0);
  costForm.totalMealAllowance = Number(row.rawMealAllowance ?? 0);
  feedback.value = '';
}

async function saveCost() {
  if (!editingCost.value) {
    feedback.value = 'Pilih data cost terlebih dahulu.';
    return;
  }

  saving.value = true;
  feedback.value = '';
  try {
    await api.updateCost(editingCost.value.internId, Number(editingCost.value.year), Number(editingCost.value.month), {
      baseSalary: Number(costForm.baseSalary || 0),
      totalMealAllowance: Number(costForm.totalMealAllowance || 0),
    });
    await loadCosts();
    feedback.value = 'Cost berhasil diperbarui.';
    editingCost.value = null;
  } catch {
    feedback.value = 'Cost belum bisa disimpan. Periksa koneksi backend.';
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  await loadCosts();
});

watch(filters, async () => {
  editingCost.value = null;
  await loadCosts();
});
</script>

<template>
  <PageHeader title="Monitoring Cost" subtitle="Perhitungan uang makan, gaji pokok, total cost per peserta, divisi, tipe, dan keseluruhan." />
  <div class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
    <select v-model.number="filters.month" class="control">
      <option v-for="month in monthOptions" :key="month.value" :value="month.value">{{ month.label }}</option>
    </select>
    <select v-model.number="filters.year" class="control">
      <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
    </select>
    <select v-model="filters.type" class="control">
      <option value="">Semua tipe</option>
      <option value="INSTITUTION">Instansi</option>
      <option value="PROFESSIONAL">Profesional</option>
    </select>
    <select v-model="filters.division" class="control">
      <option value="">Semua divisi</option>
      <option v-for="division in divisionCategories" :key="division" :value="division">{{ division }}</option>
    </select>
    <select v-model="filters.status" class="control">
      <option value="">Semua status</option>
      <option value="ACTIVE">Aktif</option>
      <option value="PLANNED">Rencana</option>
      <option value="COMPLETED">Selesai</option>
      <option value="TERMINATED">Terminated</option>
    </select>
  </div>
  <div class="mb-6 grid gap-4 lg:grid-cols-3">
    <StatCard label="Total Cost Keseluruhan" :value="rupiah(data.total)" tone="green" />
    <SimpleChart title="Cost per Divisi" type="bar" :data="data.byDivision" tone="green" />
    <SimpleChart title="Cost per Tipe" type="pie" :data="data.byType" tone="indigo" />
  </div>

  <section class="mb-6 grid gap-4 xl:grid-cols-4">
    <article class="panel border-cyan-100 bg-cyan-50 p-5">
      <p class="text-xs font-semibold uppercase text-cyan-700">Data</p>
      <h2 class="mt-2 text-lg font-semibold text-ink">{{ selectedMonthLabel }} {{ filters.year }}</h2>
      <div class="mt-4 space-y-3 text-sm text-slate-600">
        <div class="flex justify-between gap-3"><span>Peserta terhitung</span><strong class="text-ink">{{ participantCount }}</strong></div>
        <div class="flex justify-between gap-3"><span>Filter tipe</span><strong class="text-ink">{{ filters.type || 'Semua' }}</strong></div>
        <div class="flex justify-between gap-3"><span>Filter divisi</span><strong class="text-ink">{{ filters.division || 'Semua' }}</strong></div>
      </div>
    </article>

    <article class="panel border-emerald-100 bg-emerald-50 p-5">
      <p class="text-xs font-semibold uppercase text-success">Information</p>
      <h2 class="mt-2 text-lg font-semibold text-ink">{{ rupiah(data.total) }}</h2>
      <div class="mt-4 space-y-3 text-sm text-slate-600">
        <div class="flex justify-between gap-3"><span>Average cost</span><strong class="text-ink">{{ rupiah(averageCost) }}</strong></div>
        <div v-for="item in typeSummary" :key="item.name" class="flex justify-between gap-3">
          <span>{{ item.name }}</span>
          <strong class="text-ink">{{ item.percentage }}%</strong>
        </div>
      </div>
    </article>

    <article class="panel border-indigo-100 bg-indigo-50 p-5">
      <p class="text-xs font-semibold uppercase text-indigo-700">Knowledge</p>
      <h2 class="mt-2 text-lg font-semibold text-ink">{{ topDivision?.name ?? '-' }}</h2>
      <p class="mt-1 text-sm text-slate-500">Divisi dengan cost terbesar: {{ rupiah(topDivision?.value ?? 0) }}</p>
      <div class="mt-4 space-y-2 text-sm text-slate-600">
        <p v-for="row in highCostRows" :key="row.id" class="flex justify-between gap-3">
          <span>{{ row.intern?.name }}</span>
          <strong class="text-ink">{{ rupiah(row.totalMonthlyCost ?? 0) }}</strong>
        </p>
      </div>
    </article>

    <article class="panel border-amber-100 bg-amber-50 p-5">
      <p class="text-xs font-semibold uppercase text-amber-700">Wisdom</p>
      <h2 class="mt-2 text-lg font-semibold text-ink">Rekomendasi HCM</h2>
      <ul class="mt-4 space-y-3 text-sm text-slate-600">
        <li v-for="item in wisdomItems" :key="item" class="border-l-2 border-success pl-3">{{ item }}</li>
      </ul>
    </article>
  </section>

  <section v-if="editingCost" class="panel mb-4 p-5">
    <div class="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 class="text-sm font-semibold text-ink">Edit Cost</h2>
        <p class="mt-1 text-sm text-slate-500">{{ editingCost.Peserta }} - {{ editingCost.Divisi }} - {{ editingCost.month }}/{{ editingCost.year }}</p>
      </div>
      <button class="action-secondary px-3 py-2" @click="editingCost = null">Tutup</button>
    </div>
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <input v-model.number="costForm.baseSalary" class="control" type="number" min="0" placeholder="Gaji Pokok" />
      <input v-model.number="costForm.totalMealAllowance" class="control" type="number" min="0" placeholder="Uang Makan" />
      <div class="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-ink">
        Total {{ rupiah(Number(costForm.baseSalary || 0) + Number(costForm.totalMealAllowance || 0)) }}
      </div>
    </div>
    <div class="mt-4 flex flex-wrap items-center gap-3">
      <button class="action-success" :disabled="saving" @click="saveCost">
        {{ saving ? 'Menyimpan...' : 'Simpan Cost' }}
      </button>
      <p v-if="feedback" class="text-sm text-slate-600">{{ feedback }}</p>
    </div>
  </section>
  <p v-else-if="feedback" class="mb-3 text-sm text-slate-600">{{ feedback }}</p>

  <DataTable
    :columns="['Peserta', 'Tipe', 'Divisi', 'Gaji Pokok', 'Uang Makan', 'Total', 'Aksi']"
    :rows="tableRows"
    :loading="loading"
    empty-message="Tidak ada cost pada periode atau filter ini."
  >
    <template #Aksi="{ row }">
      <button class="action-secondary px-3 py-1.5 text-xs text-navy" @click="openEditCost(row)">Edit</button>
    </template>
  </DataTable>
</template>
