<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import DataTable from '../components/DataTable.vue';
import PageHeader from '../components/PageHeader.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { api, type Intern } from '../services/api';
import { dateShort } from '../utils/format';

const interns = ref<Intern[]>([]);
const search = ref('');
const yearFilter = ref('2025');
const statusFilter = ref('all');
const sortMode = ref('oldest');
const isFormOpen = ref(false);
const editingId = ref('');
const saving = ref(false);
const loading = ref(false);

const form = reactive({
  qaSelfLearning: false,
  qaPretestScore: 0 as number | null,
  qaPosttestScore: 0 as number | null,
  qaNotes: '',
});

const qaInterns = computed(() => {
  const filtered = interns.value.filter(
    (i) => String(i.position).toUpperCase().includes('QA')
  ).filter((i) => {
    if (yearFilter.value && yearFilter.value !== 'all') {
      const year = new Date(i.startDate).getFullYear().toString();
      if (year !== yearFilter.value) return false;
    }
    if (statusFilter.value && statusFilter.value !== 'all') {
      if (String(i.status).toUpperCase() !== String(statusFilter.value).toUpperCase()) return false;
    }
    if (!search.value) return true;
    const q = search.value.toLowerCase();
    return i.name?.toLowerCase().includes(q) || i.team?.toLowerCase().includes(q) || i.institution?.toLowerCase().includes(q);
  });
  
  return filtered.sort((a, b) => {
    const timeA = new Date(a.startDate).getTime();
    const timeB = new Date(b.startDate).getTime();
    return sortMode.value === 'oldest' ? timeA - timeB : timeB - timeA;
  });
});

function calculateGap(pre: number | null | undefined, post: number | null | undefined) {
  if (pre == null || post == null) return '-';
  if (pre < post) return 'NAIK';
  if (pre > post) return 'TURUN';
  return 'SAMA';
}

const rows = computed(() =>
  qaInterns.value.map((item) => ({
    id: item.id,
    Periode: 'TW-' + (new Date(item.startDate).getMonth() < 3 ? '1' : new Date(item.startDate).getMonth() < 6 ? '2' : new Date(item.startDate).getMonth() < 9 ? '3' : '4') + ' - ' + new Date(item.startDate).getFullYear(),
    Tim: item.team,
    Instansi: item.institution,
    Nama: item.name,
    Posisi: item.position,
    Status: item.status,
    'Join Date': dateShort(item.startDate),
    'End Date': dateShort(item.endDate),
    'Self Learning': item.qaSelfLearning ? 'Sudah' : 'Belum',
    'Nilai Pretest': item.qaPretestScore ?? '-',
    'Nilai Posttest': item.qaPosttestScore ?? '-',
    Gap: calculateGap(item.qaPretestScore, item.qaPosttestScore),
    Aksi: item.id,
  }))
);

async function loadInterns() {
  loading.value = true;
  try {
    interns.value = await api.interns();
  } finally {
    loading.value = false;
  }
}

function openEdit(row: Record<string, unknown>) {
  const intern = interns.value.find((item) => item.id === row.id);
  if (!intern) return;
  form.qaSelfLearning = intern.qaSelfLearning ?? false;
  form.qaPretestScore = intern.qaPretestScore ?? null;
  form.qaPosttestScore = intern.qaPosttestScore ?? null;
  form.qaNotes = intern.qaNotes ?? '';
  editingId.value = intern.id;
  isFormOpen.value = true;
}

async function submitForm() {
  saving.value = true;
  try {
    const payload = { ...form };
    const { data } = await api.updateIntern(editingId.value, payload);
    interns.value = interns.value.map((intern) => (intern.id === data.id ? data : intern));
    isFormOpen.value = false;
  } catch (error) {
    alert('Gagal menyimpan data.');
  } finally {
    saving.value = false;
  }
}

onMounted(loadInterns);
</script>

<template>
  <PageHeader title="Profiling Magang QA" subtitle="Pemantauan nilai training dan performa peserta magang instansi khusus posisi QA.">
    <!-- No global actions needed for now -->
  </PageHeader>

  <section class="panel mb-4 flex flex-col gap-4 p-4 md:flex-row md:items-end">
    <div class="flex-1">
      <p class="text-sm font-semibold text-ink">Cari Peserta QA</p>
      <input v-model="search" type="text" class="control mt-2 max-w-sm" placeholder="Nama, Tim, atau Instansi..." />
    </div>
    <div>
      <p class="text-sm font-semibold text-ink">Tahun</p>
      <select v-model="yearFilter" class="control mt-2">
        <option value="all">Semua Tahun</option>
        <option value="2024">2024</option>
        <option value="2025">2025</option>
        <option value="2026">2026</option>
      </select>
    </div>
    <div>
      <p class="text-sm font-semibold text-ink">Status</p>
      <select v-model="statusFilter" class="control mt-2">
        <option value="all">Semua Status</option>
        <option value="ACTIVE">Active</option>
        <option value="TERMINATED">Terminated</option>
      </select>
    </div>
    <div>
      <p class="text-sm font-semibold text-ink">Urutkan</p>
      <select v-model="sortMode" class="control mt-2">
        <option value="oldest">Terlama - Terbaru</option>
        <option value="newest">Terbaru - Terlama</option>
      </select>
    </div>
  </section>

  <DataTable
    :columns="['Periode', 'Tim', 'Instansi', 'Nama', 'Posisi', 'Status', 'Join Date', 'End Date', 'Self Learning', 'Nilai Pretest', 'Nilai Posttest', 'Gap', 'Aksi']"
    :rows="rows"
    :loading="loading"
    empty-message="Tidak ada data magang QA."
  >
    <template #Status="{ row }">
      <StatusBadge :value="String(row.Status)" />
    </template>
    <template #Gap="{ row }">
      <span v-if="row.Gap === 'NAIK'" class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5"><path fill-rule="evenodd" d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 0-5.594 5.203.75.75 0 0 1-1.139.093L7 10.06l-4.72 4.72a.75.75 0 0 1-1.06-1.061l5.25-5.25a.75.75 0 0 1 1.06 0l3.074 3.073a20.923 20.923 0 0 1 5.545-4.931l-3.042-.815a.75.75 0 0 1-.53-.919Z" clip-rule="evenodd" /></svg>
        NAIK
      </span>
      <span v-else-if="row.Gap === 'TURUN'" class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5"><path fill-rule="evenodd" d="M12.577 15.122a.75.75 0 0 1-1.449.387l-1.281-4.78a.75.75 0 0 1 .531-.919l4.78-1.281a.75.75 0 0 1 .919.53l-3.042.815a20.923 20.923 0 0 1-5.545-4.931l-3.074 3.073a.75.75 0 0 1-1.06 0l-5.25-5.25a.75.75 0 1 1 1.06-1.06L7 6.438l3.153 3.152a.75.75 0 0 1 1.139.093 19.407 19.407 0 0 0 5.594 5.203l-.81-3.022a.75.75 0 0 1 1.449-.387l1.281 4.78a.75.75 0 0 1-.531.919l-4.78 1.281a.75.75 0 0 1-.919-.53Z" clip-rule="evenodd" /></svg>
        TURUN
      </span>
      <span v-else-if="row.Gap === 'SAMA'" class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5"><path fill-rule="evenodd" d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" clip-rule="evenodd" /></svg>
        SAMA
      </span>
      <span v-else class="text-slate-400 font-medium">-</span>
    </template>
    <template #Aksi="{ row }">
      <button class="action-secondary text-xs" @click="openEdit(row)">Edit Nilai</button>
    </template>
  </DataTable>

  <!-- Modal Edit Nilai -->
  <div v-if="isFormOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
    <div class="flex max-h-full w-full max-w-md flex-col rounded-2xl bg-white shadow-xl">
      <div class="flex items-center justify-between border-b border-[#E5DDD2] px-6 py-4">
        <h2 class="text-lg font-bold text-ink">Update Nilai QA</h2>
        <button class="text-slate-400 hover:text-ink" @click="isFormOpen = false">✕</button>
      </div>
      <div class="overflow-y-auto p-6">
        <form id="qaForm" @submit.prevent="submitForm" class="space-y-4">
          <div class="flex items-center gap-3">
            <input id="sl" type="checkbox" v-model="form.qaSelfLearning" class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <label for="sl" class="text-sm font-semibold text-ink">Sudah Self Learning?</label>
          </div>
          <div>
            <label class="mb-1 block text-sm font-semibold text-ink">Nilai Pretest</label>
            <input v-model.number="form.qaPretestScore" type="number" class="control" placeholder="Contoh: 92" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-semibold text-ink">Nilai Posttest</label>
            <input v-model.number="form.qaPosttestScore" type="number" class="control" placeholder="Contoh: 98" />
          </div>
        </form>
      </div>
      <div class="flex items-center justify-end gap-3 border-t border-[#E5DDD2] bg-[#FBF8F1] px-6 py-4 rounded-b-2xl">
        <button class="action-secondary" @click="isFormOpen = false" :disabled="saving">Batal</button>
        <button type="submit" form="qaForm" class="action-primary" :disabled="saving">
          {{ saving ? 'Menyimpan...' : 'Simpan Nilai' }}
        </button>
      </div>
    </div>
  </div>
</template>
