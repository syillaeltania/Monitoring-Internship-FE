<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import DataTable from '../components/DataTable.vue';
import PageHeader from '../components/PageHeader.vue';
import StatCard from '../components/StatCard.vue';
import { api, type Status } from '../services/api';
import { rupiah } from '../utils/format';
import { divisionCategories } from '../utils/internFilters';
import {
  buildCsv,
  buildExcel,
  filterReportInterns,
  participantHeaders,
  participantRows,
  reportKinds,
  reportMonthOptions,
  summarizeReportInterns,
  type ReportFilters,
  type ReportKind,
} from '../utils/reporting';

const today = new Date();
const reportKind = ref<ReportKind>('participants');
const status = ref('');
const exportStatus = ref('');
const loading = ref(false);
const interns = ref<any[]>([]);
const costs = ref<any>({ rows: [] });
const replacement = ref<any[]>([]);
const completion = ref<any[]>([]);
const filters = reactive<ReportFilters>({
  year: '',
  endYear: '',
  month: '',
  division: '',
  type: '',
  status: '',
  leader: '',
});

const yearOptions = computed(() => {
  const years = new Set<number>([2024, 2025, 2026, 2027, today.getFullYear()]);
  interns.value.forEach((intern) => {
    years.add(new Date(intern.startDate).getFullYear());
    years.add(new Date(intern.endDate).getFullYear());
  });
  return [...years].sort((a, b) => b - a);
});
const filteredInterns = computed(() => filterReportInterns(interns.value, filters));
const summary = computed(() => summarizeReportInterns(filteredInterns.value));
const selectedKind = computed(() => reportKinds.find((item) => item.value === reportKind.value) ?? reportKinds[0]);
const selectedCostMonth = computed(() => filters.month || String(today.getMonth() + 1));

const reportColumns = computed(() => {
  if (reportKind.value === 'cost') return ['Peserta', 'Tipe', 'Divisi', 'Gaji Pokok', 'Uang Makan', 'Total'];
  if (reportKind.value === 'replacement') return ['Divisi', 'Tim', 'Leader', 'Instansi Aktif', 'Profesional Aktif', 'Minimum', 'Selesai Terdekat', 'Status'];
  if (reportKind.value === 'checklist') return ['Peserta', 'Divisi', 'Tim', 'Progress', 'Status Final'];
  return participantHeaders;
});

const reportRows = computed<Record<string, unknown>[]>(() => {
  if (reportKind.value === 'cost') {
    return (costs.value.rows ?? []).map((item: any) => ({
      id: `${item.internId}-${item.year}-${item.month}`,
      Peserta: item.intern?.name ?? '-',
      Tipe: item.intern?.type ?? '-',
      Divisi: item.intern?.normalizedDivision ?? item.intern?.division ?? '-',
      'Gaji Pokok': rupiah(item.baseSalary ?? 0),
      'Uang Makan': rupiah(item.totalMealAllowance ?? 0),
      Total: rupiah(item.totalMonthlyCost ?? 0),
    }));
  }

  if (reportKind.value === 'replacement') {
    const division = filters.division;
    const leader = filters.leader.trim().toLowerCase();
    return replacement.value
      .filter((item) => !division || item.division === division || (division === 'NB' && item.division === 'NEW BUSINESS'))
      .filter((item) => !leader || (item.leader ?? '').toLowerCase().includes(leader))
      .map((item) => ({
        id: item.id,
        Divisi: item.division,
        Tim: item.team,
        Leader: item.leader ?? '-',
        'Instansi Aktif': item.activeInstitutionCount ?? 0,
        'Profesional Aktif': item.activeProfessionalCount ?? 0,
        Minimum: item.minimumInstitutionNeed ?? 1,
        'Selesai Terdekat': item.soonestEndDate ? new Date(item.soonestEndDate).toLocaleDateString('id-ID') : '-',
        Status: item.replacementStatus,
      }));
  }

  if (reportKind.value === 'checklist') {
    const allowedIds = new Set(filteredInterns.value.map((intern) => intern.id));
    return completion.value
      .filter((item) => allowedIds.has(item.internId))
      .map((item) => ({
        id: item.id,
        Peserta: item.intern?.name ?? '-',
        Divisi: item.intern?.division ?? '-',
        Tim: item.intern?.team ?? '-',
        Progress: `${item.completedItems ?? checklistProgress(item)} / 12`,
        'Status Final': item.finalStatus ?? '-',
      }));
  }

  return participantRows(filteredInterns.value).map((row, index) =>
    Object.fromEntries([['id', filteredInterns.value[index]?.id ?? index], ...participantHeaders.map((header, headerIndex) => [header, row[headerIndex]])]),
  );
});

async function loadCosts() {
  costs.value = await api.costs({
    month: selectedCostMonth.value,
    year: filters.year,
    type: filters.type,
    division: filters.division,
    status: filters.status,
  });
}

async function loadData() {
  loading.value = true;
  try {
    const [internData, replacementData, completionData] = await Promise.all([api.interns(), api.replacement(), api.completion()]);
    interns.value = internData;
    replacement.value = replacementData;
    completion.value = completionData;
    await loadCosts();
  } finally {
    loading.value = false;
  }
}

async function importExcel() {
  status.value = 'Import berjalan...';
  try {
    const { data } = await api.importExcel();
    status.value = data.message ?? 'Import selesai.';
    await loadData();
  } catch {
    status.value = 'Backend belum siap atau database belum terkoneksi.';
  }
}

function checklistProgress(item: Record<string, unknown>) {
  const ignored = new Set(['id', 'internId', 'intern', 'finalStatus', 'notes', 'createdAt', 'updatedAt']);
  return Object.entries(item).filter(([key, value]) => !ignored.has(key) && value === true).length;
}

function exportCsv() {
  exportStatus.value = 'Menyiapkan export CSV...';
  const rows = reportRows.value.map((row) => reportColumns.value.map((column) => row[column] as string | number | null | undefined));
  const csv = buildCsv(reportColumns.value, rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `report-${reportKind.value}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  exportStatus.value = `Export CSV selesai: ${reportRows.value.length} data.`;
}

function exportExcel() {
  exportStatus.value = 'Menyiapkan export Excel...';
  const rows = reportRows.value.map((row) => reportColumns.value.map((column) => row[column] as string | number | null | undefined));
  buildExcel(reportColumns.value, rows, `report-${reportKind.value}-${new Date().toISOString().slice(0, 10)}`);
  exportStatus.value = `Export Excel selesai: ${reportRows.value.length} data.`;
}

function exportPdf() {
  exportStatus.value = 'Gunakan dialog print browser untuk menyimpan sebagai PDF.';
  window.print();
}

watch(
  () => [reportKind.value, filters.year, filters.month, filters.type, filters.division, filters.status],
  async () => {
    if (reportKind.value === 'cost') await loadCosts();
  },
);

onMounted(loadData);
</script>

<template>
  <PageHeader title="Report" subtitle="Pusat laporan dan export data monitoring internship untuk HCM dan management." />

  <div class="mb-5 grid gap-4 xl:grid-cols-[1.2fr_2fr]">
    <section class="panel p-5">
      <h3 class="text-sm font-semibold text-ink">Import Excel</h3>
      <p class="mt-2 text-sm text-slate-500">Gunakan saat perlu reload data dari workbook master.</p>
      <button class="action-primary mt-4" @click="importExcel">Import Workbook</button>
      <p v-if="status" class="mt-3 text-sm text-slate-600">{{ status }}</p>
    </section>

    <section class="panel p-5">
      <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 class="text-sm font-semibold text-ink">Export Report</h3>
          <p class="mt-2 text-sm text-slate-500">{{ selectedKind.description }}</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button class="action-secondary" @click="exportExcel">Excel</button>
          <button class="action-secondary" @click="exportCsv">CSV</button>
          <button class="action-secondary" @click="exportPdf">PDF</button>
        </div>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <select v-model="reportKind" class="control">
          <option v-for="item in reportKinds" :key="item.value" :value="item.value">{{ item.label }}</option>
        </select>
        <select v-model="filters.month" class="control">
          <option v-for="month in reportMonthOptions" :key="month.value" :value="month.value">{{ month.label }}</option>
        </select>
        <select v-model="filters.year" class="control">
          <option value="">Semua Tahun Mulai</option>
          <option v-for="year in yearOptions" :key="year" :value="String(year)">Mulai: {{ year }}</option>
        </select>
        <select v-model="filters.endYear" class="control">
          <option value="">Semua Tahun Selesai</option>
          <option v-for="year in yearOptions" :key="year" :value="String(year)">Selesai: {{ year }}</option>
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
      <input v-model="filters.leader" class="control mt-3" placeholder="Filter leader / PIC" />
      <p v-if="exportStatus" class="mt-3 text-sm text-slate-600">{{ exportStatus }}</p>
    </section>
  </div>

  <section class="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
    <StatCard label="Data Tampil" :value="reportRows.length" tone="navy" />
    <StatCard label="Peserta Terfilter" :value="summary.total" tone="slate" />
    <StatCard label="Instansi" :value="summary.institution" tone="green" />
    <StatCard label="Profesional" :value="summary.professional" tone="indigo" />
    <StatCard label="Aktif" :value="summary.active" tone="cyan" />
  </section>

  <DataTable :columns="reportColumns" :rows="reportRows" :loading="loading" empty-message="Tidak ada data report yang sesuai filter." />
</template>
