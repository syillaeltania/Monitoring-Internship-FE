<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import DataTable from '../components/DataTable.vue';
import PageHeader from '../components/PageHeader.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { api, type Intern } from '../services/api';
import { buildReplacementBoard, buildSchedulerRows, getMonthInterns, getReplacementCellTone, type ReplacementBoardColumn, type ReplacementBoardItem } from '../utils/replacementScheduler';
import { replacementTabs, type ReplacementTabKey } from '../utils/replacementTabs';

const replacement = ref<any[]>([]);
const interns = ref<Intern[]>([]);
const selectedYear = ref(2026);
const loading = ref(false);
const activeTab = ref<ReplacementTabKey>('scheduler');
const monthLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
const visibleDivisions = ref<Record<string, boolean>>({});

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-');
const formatDays = (value: number | null) => (value === null ? '-' : value < 0 ? 'Lewat periode' : `${value} hari`);

const timelineItems = computed(() => buildSchedulerRows(replacement.value, interns.value));
const replacementBoard = computed(() => buildReplacementBoard(timelineItems.value, interns.value));
const boardColumns: Array<{ key: ReplacementBoardColumn; title: string; tone: string }> = [
  { key: 'urgent', title: 'Urgent / Kosong', tone: 'border-red-200 bg-red-50 text-red-700' },
  { key: 'h30', title: 'Habis <= 30 Hari', tone: 'border-amber-200 bg-amber-50 text-amber-700' },
  { key: 'h90', title: 'Habis <= 90 Hari', tone: 'border-yellow-200 bg-yellow-50 text-yellow-700' },
  { key: 'safe', title: 'Aman', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
];

const yearOptions = computed(() => {
  const years = new Set<number>([2024, 2025, 2026, 2027]);
  interns.value.forEach((intern) => {
    years.add(new Date(intern.startDate).getFullYear());
    years.add(new Date(intern.endDate).getFullYear());
  });
  return [...years].sort((a, b) => a - b);
});

const summary = computed(() => ({
  urgent: replacementBoard.value.urgent.length,
  h30: replacementBoard.value.h30.length,
  h90: replacementBoard.value.h90.length,
  needs: replacementBoard.value.urgent.length + replacementBoard.value.h30.length + replacementBoard.value.h90.length,
  safe: replacementBoard.value.safe.length,
  monitored: timelineItems.value.length,
}));

const timelineByDivision = computed(() => {
  const groups = new Map<string, typeof timelineItems.value>();
  timelineItems.value.forEach((item) => {
    const division = item.division || '-';
    groups.set(division, [...(groups.get(division) ?? []), item]);
  });
  return [...groups.entries()].map(([division, items]) => ({ division, items }));
});

const rows = computed(() =>
  timelineItems.value.map((item) => ({
    id: item.id,
    Divisi: item.division,
    Tim: item.team,
    Leader: item.leader,
    'Instansi Aktif': item.activeInstitutionCount,
    'Profesional Aktif': item.activeProfessionalCount,
    Minimum: item.minimumInstitutionNeed,
    'Selesai Terdekat': formatDate(item.soonestEndDate),
    Status: item.replacementStatus,
    Kandidat: item.replacementCandidate || '-',
    PIC: item.hcmPic || '-',
  })),
);

const firstName = (name: string) => name.split(' ')[0] ?? name;
const monthInterns = (item: any, monthIndex: number) => getMonthInterns(item, interns.value, selectedYear.value, monthIndex);
const cellTone = (item: any, monthIndex: number) => getReplacementCellTone(item, interns.value, selectedYear.value, monthIndex);
const toggleDivision = (division: string) => {
  visibleDivisions.value = {
    ...visibleDivisions.value,
    [division]: visibleDivisions.value[division] === false,
  };
};
const isDivisionVisible = (division: string) => visibleDivisions.value[division] !== false;
const boardCardClass = (item: ReplacementBoardItem) => {
  if (item.replacementStatus === 'URGENT_EMPTY') return 'border-red-100 bg-red-50';
  if (item.daysLeft !== null && item.daysLeft <= 30) return 'border-amber-100 bg-amber-50';
  if (item.daysLeft !== null && item.daysLeft <= 90) return 'border-yellow-100 bg-yellow-50';
  return 'border-emerald-100 bg-white';
};

onMounted(async () => {
  loading.value = true;
  try {
    const [replacementData, internData] = await Promise.all([api.replacement(), api.interns()]);
    replacement.value = replacementData;
    interns.value = internData;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <PageHeader title="Monitoring Pergantian Magang" subtitle="Memantau minimal kebutuhan magang instansi per tim dan risiko replacement." />

  <section class="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
    <div class="panel p-5">
      <p class="text-sm font-medium text-slate-500">Urgent / Kosong</p>
      <p class="mt-3 text-3xl font-semibold text-danger">{{ summary.urgent }}</p>
    </div>
    <div class="panel p-5">
      <p class="text-sm font-medium text-slate-500">Habis <= 30 Hari</p>
      <p class="mt-3 text-3xl font-semibold text-warning">{{ summary.h30 }}</p>
    </div>
    <div class="panel p-5">
      <p class="text-sm font-medium text-slate-500">Habis <= 90 Hari</p>
      <p class="mt-3 text-3xl font-semibold text-warning">{{ summary.h90 }}</p>
    </div>
    <div class="panel p-5">
      <p class="text-sm font-medium text-slate-500">Total Butuh Follow Up</p>
      <p class="mt-3 text-3xl font-semibold text-navy">{{ summary.needs }}</p>
    </div>
    <div class="panel p-5">
      <p class="text-sm font-medium text-slate-500">Tim Terpantau</p>
      <p class="mt-3 text-3xl font-semibold text-success">{{ summary.monitored }}</p>
    </div>
  </section>

  <section class="panel mb-5 p-2">
    <div class="flex gap-2 overflow-x-auto">
      <button
        v-for="tab in replacementTabs"
        :key="tab.key"
        class="min-w-fit rounded-md px-4 py-3 text-left text-sm font-semibold transition"
        :class="activeTab === tab.key ? 'bg-navy text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-navy'"
        @click="activeTab = tab.key"
      >
        <span class="block">{{ tab.label }}</span>
        <span class="mt-1 block text-xs font-medium opacity-75">{{ tab.description }}</span>
      </button>
    </div>
  </section>

  <section v-if="activeTab === 'kanban'" class="panel mb-5 p-4 sm:p-5">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-sm font-semibold text-ink">Kanban Risiko Replacement</h2>
        <p class="mt-1 text-sm text-slate-500">Prioritas follow up berdasarkan tim kosong dan peserta instansi yang akan selesai.</p>
      </div>
      <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-navy">{{ summary.needs }} follow up aktif</span>
    </div>

    <div class="grid gap-4 xl:grid-cols-4">
      <div v-for="column in boardColumns" :key="column.key" class="rounded-md border border-slate-200 bg-slate-50/70 p-3">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h3 class="text-sm font-semibold text-ink">{{ column.title }}</h3>
          <span class="rounded-full border px-2.5 py-1 text-xs font-semibold" :class="column.tone">
            {{ replacementBoard[column.key].length }}
          </span>
        </div>

        <div v-if="replacementBoard[column.key].length" class="space-y-3">
          <article
            v-for="item in replacementBoard[column.key]"
            :key="item.id"
            class="rounded-md border p-4 shadow-sm"
            :class="boardCardClass(item)"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-ink">{{ item.division }} / {{ item.team }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ item.leader || 'Leader belum diisi' }}</p>
              </div>
              <StatusBadge :value="item.replacementStatus" />
            </div>

            <div class="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p class="text-slate-500">Aktif</p>
                <p class="mt-1 font-semibold text-ink">{{ item.activeInstitutionCount }} instansi</p>
              </div>
              <div>
                <p class="text-slate-500">Sisa waktu</p>
                <p class="mt-1 font-semibold text-ink">{{ formatDays(item.daysLeft) }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-slate-500">Selesai terdekat</p>
                <p class="mt-1 font-semibold text-ink">{{ item.endingInternName }} · {{ formatDate(item.soonestEndDate) }}</p>
              </div>
            </div>

            <div class="mt-4 rounded-md bg-white/70 p-3 text-xs text-slate-600">
              <p><span class="font-semibold">Kandidat:</span> {{ item.replacementCandidate || '-' }}</p>
              <p class="mt-1"><span class="font-semibold">PIC HCM:</span> {{ item.hcmPic || '-' }}</p>
            </div>
          </article>
        </div>
        <p v-else class="rounded-md border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
          Tidak ada tim pada kategori ini.
        </p>
      </div>
    </div>
  </section>

  <section v-if="activeTab === 'scheduler'" class="panel mb-5 p-4 sm:p-5">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-sm font-semibold text-ink">Scheduler Pergantian Magang</h2>
        <p class="mt-1 text-sm text-slate-500">Matrix bulanan seperti worksheet pergantian: tim, posisi, dan peserta aktif per bulan.</p>
      </div>
      <select v-model.number="selectedYear" class="control w-32">
        <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
      </select>
    </div>

    <div class="space-y-4">
      <div v-for="group in timelineByDivision" :key="group.division" class="overflow-hidden rounded-md border border-slate-200">
        <button class="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left" @click="toggleDivision(group.division)">
          <div>
            <p class="text-sm font-semibold text-ink">{{ group.division }}</p>
            <p class="mt-1 text-xs text-slate-500">{{ group.items.length }} tim terpantau</p>
          </div>
          <span class="text-sm font-semibold text-navy">{{ isDivisionVisible(group.division) ? 'Tutup' : 'Buka' }}</span>
        </button>

        <div v-if="isDivisionVisible(group.division)" class="overflow-x-auto pb-3">
          <div class="min-w-[1396px] overflow-hidden">
            <div class="grid grid-cols-[48px_120px_136px_repeat(12,minmax(92px,1fr))] bg-slate-50 text-xs font-semibold text-ink">
              <div class="row-span-2 flex items-center justify-center border-b border-r border-slate-300 p-3 text-center">No</div>
              <div class="row-span-2 flex items-center border-b border-r border-slate-300 p-3">Team</div>
              <div class="row-span-2 flex items-center border-b border-r border-slate-300 p-3">Position / Leader</div>
              <div class="col-span-12 border-b border-slate-300 bg-amber-900 p-2 text-center text-white">{{ selectedYear }}</div>
              <template v-for="month in monthLabels" :key="month">
                <div class="border-b border-r border-slate-300 bg-amber-700 p-2 text-center text-white last:border-r-0">{{ month }}</div>
              </template>
            </div>

            <div
              v-for="(item, index) in group.items"
              :key="item.id"
              class="grid min-h-20 grid-cols-[48px_120px_136px_repeat(12,minmax(92px,1fr))] text-xs"
            >
              <div class="flex items-center justify-center border-b border-r border-slate-300 bg-slate-50 font-semibold text-slate-600">{{ index + 1 }}</div>
              <div class="flex items-center border-b border-r border-slate-300 bg-slate-100 p-3 font-semibold text-slate-700">{{ item.team }}</div>
              <div class="flex items-center border-b border-r border-slate-300 bg-slate-50 p-3 text-slate-700">{{ item.notes || item.leader || '-' }}</div>

              <div
                v-for="(_, monthIndex) in monthLabels"
                :key="monthIndex"
                class="border-b border-r border-slate-300 p-2 last:border-r-0"
                :class="{
                  'bg-white': cellTone(item, monthIndex) === 'empty',
                  'bg-slate-200': cellTone(item, monthIndex) === 'active',
                  'bg-yellow-200': cellTone(item, monthIndex) === 'ending',
                  'bg-slate-500 text-white': cellTone(item, monthIndex) === 'multi',
                }"
              >
                <div v-if="monthInterns(item, monthIndex).length" class="space-y-1 leading-snug">
                  <p v-for="(intern, internIndex) in monthInterns(item, monthIndex)" :key="intern.id">
                    {{ internIndex + 1 }}. {{ intern.institution || '-' }} - {{ firstName(intern.name) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section v-if="activeTab === 'table'" class="space-y-4">
    <DataTable
      :columns="['Divisi', 'Tim', 'Leader', 'Instansi Aktif', 'Profesional Aktif', 'Minimum', 'Selesai Terdekat', 'Status', 'Kandidat', 'PIC']"
      :rows="rows"
      :loading="loading"
      empty-message="Tidak ada data kebutuhan replacement."
    >
      <template #Status="{ row }"><StatusBadge :value="String(row.Status)" /></template>
    </DataTable>
  </section>
</template>
