<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import StatCard from '../components/StatCard.vue';
import SimpleChart from '../components/SimpleChart.vue';
import DataTable from '../components/DataTable.vue';
import Modal from '../components/Modal.vue';
import Combobox from '../components/Combobox.vue';
import { api } from '../services/api';
import { dateShort } from '../utils/format';
import { divisionCategories } from '../utils/internFilters';

const issues = ref<any[]>([]);
const analytics = ref<any>(null);
const loading = ref(false);
const status = ref('');
const selectedInternString = ref('');

const today = new Date();
const yearOptions = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i);
const monthOptions = [
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

const filters = reactive({
  year: String(today.getFullYear()),
  month: '',
  division: '',
});

async function loadData() {
  loading.value = true;
  try {
    const [issuesData, analyticsData] = await Promise.all([
      api.issues(filters),
      api.issuesAnalytics(filters),
    ]);
    
    // Map pie chart labels
    if (analyticsData.charts && analyticsData.charts.byType) {
      analyticsData.charts.byType = analyticsData.charts.byType.map((item: any) => ({
        ...item,
        name: issueTypeLabels[item.name] || item.name,
      }));
    }
    
    issues.value = issuesData;
    analytics.value = analyticsData;
  } catch (err: any) {
    status.value = err?.message || 'Gagal memuat data isu.';
  } finally {
    loading.value = false;
  }
}

watch(() => [filters.year, filters.month, filters.division], loadData);

onMounted(loadData);

const issueTypeLabels: Record<string, string> = {
  ADMINISTRASI: 'Administrasi',
  KEHADIRAN: 'Kedisiplinan',
  PERFORMA: 'Performa',
  PERILAKU: 'Perilaku',
  RESIGN: 'Resign',
  LAINNYA: 'Lainnya',
};

const statusLabels: Record<string, string> = {
  OPEN: 'Open (Belum Ditangani)',
  IN_PROGRESS: 'In Progress (Sedang Ditangani)',
  RESOLVED: 'Resolved (Selesai)',
};

const rows = computed(() =>
  issues.value.map((issue) => ({
    _id: issue.id,
    Peserta: issue.intern.name,
    Instansi: issue.intern.institution || '-',
    Divisi: issue.intern.division,
    Tim: issue.intern.team,
    'Jenis Isu': (Array.isArray(issue.type) ? issue.type : [issue.type]).map((t: string) => issueTypeLabels[t] || t).join(', '),
    'Tgl Lapor': dateShort(issue.reportedDate),
    Status: issue.status,
    'Tindak Lanjut': issue.followUpAction || '-',
  }))
);

// Detail modal (read-only)
const isDetailOpen = ref(false);
const detailIssue = ref<any>(null);

function openDetailModal(row: any) {
  const issue = issues.value.find((i: any) => i.id === row._id);
  if (!issue) return;
  detailIssue.value = issue;
  isDetailOpen.value = true;
}

// Form
const isModalOpen = ref(false);
const form = reactive({
  id: '',
  internId: '',
  type: [] as string[],
  description: '',
  reportedDate: new Date().toISOString().slice(0, 10),
  followUpAction: '',
  status: 'OPEN',
});

const internOptions = ref<any[]>([]);
const internStringOptions = computed(() => internOptions.value.map(i => `${i.name} (${i.team})`));

watch(selectedInternString, (val) => {
  const found = internOptions.value.find(i => `${i.name} (${i.team})` === val);
  if (found) form.internId = found.id;
});

async function openAddModal() {
  // Load active interns for dropdown
  const allInterns = await api.interns();
  internOptions.value = allInterns.map(i => ({ id: i.id, name: i.name, team: i.team }));
  
  form.id = '';
  form.internId = '';
  selectedInternString.value = '';
  form.type = [];
  form.description = '';
  form.reportedDate = new Date().toISOString().slice(0, 10);
  form.followUpAction = '';
  form.status = 'OPEN';
  isModalOpen.value = true;
}

// Chart click modal
const isChartDetailOpen = ref(false);
const chartDetailTitle = ref('');
const chartDetailList = ref<any[]>([]);

function handleChartClick(name: string, title: string) {
  let matchedIssues = [];
  if (title === 'Isu per Divisi') {
    matchedIssues = issues.value.filter((i: any) => i.intern.division === name);
    chartDetailTitle.value = `Peserta dengan isu di Divisi: ${name}`;
  } else if (title === 'Top 5 Instansi Bermasalah') {
    matchedIssues = issues.value.filter((i: any) => (i.intern.institution || 'Lainnya') === name);
    chartDetailTitle.value = `Peserta dengan isu dari Instansi: ${name}`;
  } else {
    return;
  }
  
  // Get unique interns
  const uniqueInterns = new Map();
  matchedIssues.forEach((i: any) => {
    if (!uniqueInterns.has(i.intern.id)) {
      uniqueInterns.set(i.intern.id, i.intern);
    }
  });
  
  chartDetailList.value = Array.from(uniqueInterns.values());
  isChartDetailOpen.value = true;
}

function openEditModal(row: any) {
  const issue = issues.value.find((i: any) => i.id === row._id);
  if (!issue) return;

  form.id = issue.id;
  form.internId = issue.internId;
  form.type = Array.isArray(issue.type) ? [...issue.type] : [issue.type];
  form.description = issue.description;
  form.reportedDate = new Date(issue.reportedDate).toISOString().slice(0, 10);
  form.followUpAction = issue.followUpAction || '';
  form.status = issue.status;
  
  internOptions.value = [{ id: issue.internId, name: issue.intern.name, team: issue.intern.team }];
  selectedInternString.value = `${issue.intern.name} (${issue.intern.team})`;
  isModalOpen.value = true;
}

const saving = ref(false);

async function saveIssue() {
  if (!form.internId) {
    status.value = 'Silakan pilih peserta terlebih dahulu.';
    return;
  }
  if (form.type.length === 0) {
    status.value = 'Silakan pilih minimal 1 jenis isu.';
    return;
  }
  saving.value = true;
  status.value = '';
  try {
    if (form.id) {
      await api.updateIssue(form.id, form);
    } else {
      await api.createIssue(form);
    }
    isModalOpen.value = false;
    await loadData();
  } catch (err: any) {
    status.value = err?.response?.data?.message || err?.message || 'Gagal menyimpan isu.';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <PageHeader title="Manajemen Isu" subtitle="Pantau permasalahan peserta magang, identifikasi pola, dan tangani dengan cepat." />

  <div class="mb-5 flex flex-wrap items-center gap-4">
    <select v-model="filters.month" class="control !w-auto min-w-[160px] pr-8">
      <option value="">Semua Bulan</option>
      <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
    </select>
    <select v-model="filters.year" class="control !w-auto min-w-[100px] pr-8">
      <option v-for="y in yearOptions" :key="y" :value="String(y)">{{ y }}</option>
    </select>
    <select v-model="filters.division" class="control !w-auto min-w-[160px] pr-8">
      <option value="">Semua Divisi</option>
      <option v-for="d in divisionCategories" :key="d" :value="d">{{ d }}</option>
    </select>
    <button class="action-primary ml-auto" @click="openAddModal">+ Tambah Isu</button>
  </div>

  <div v-if="analytics" class="space-y-6">
    <section class="grid gap-4 sm:grid-cols-3">
      <StatCard :label="filters.month ? 'Total Isu Bulan Ini' : 'Total Isu Tahun Ini'" :value="analytics.summary.totalIssues" tone="orange" />
      <StatCard label="Tingkat Isu (Issue Rate)" :value="analytics.summary.issueRate.toFixed(1) + '%'" tone="red" />
      <StatCard label="Isu Belum Selesai" :value="analytics.summary.unresolvedIssues" tone="slate" />
    </section>

    <section>
      <SimpleChart :title="`Tren Isu Sepanjang Tahun ${filters.year}`" type="line" :data="analytics.charts.trend" value-format="count" tone="cyan" />
    </section>

    <section class="grid gap-4 xl:grid-cols-3">
      <SimpleChart title="Distribusi Jenis Isu" type="pie" :data="analytics.charts.byType" value-format="count" tone="orange" />
      <SimpleChart title="Isu per Divisi" type="bar" :data="analytics.charts.byDivision" value-format="count" tone="red" @bar-click="handleChartClick" class="cursor-pointer" />
      <SimpleChart title="Top 5 Instansi Bermasalah" type="bar" :data="analytics.charts.byInstitution" value-format="count" tone="slate" @bar-click="handleChartClick" class="cursor-pointer" />
    </section>
  </div>

  <div class="panel mt-6">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <th class="px-4 py-3">Peserta</th>
            <th class="px-4 py-3">Instansi</th>
            <th class="px-4 py-3">Divisi</th>
            <th class="px-4 py-3">Tim</th>
            <th class="px-4 py-3">Jenis Isu</th>
            <th class="px-4 py-3">Tgl Lapor</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row._id" class="border-b border-slate-100 transition-colors hover:bg-slate-50">
            <td class="px-4 py-3 font-medium">{{ row.Peserta }}</td>
            <td class="px-4 py-3">{{ row.Instansi }}</td>
            <td class="px-4 py-3">{{ row.Divisi }}</td>
            <td class="px-4 py-3">{{ row.Tim }}</td>
            <td class="px-4 py-3">{{ row['Jenis Isu'] }}</td>
            <td class="px-4 py-3">{{ row['Tgl Lapor'] }}</td>
            <td class="px-4 py-3">
              <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="{
                'bg-red-100 text-red-700': row.Status === 'OPEN',
                'bg-amber-100 text-amber-700': row.Status === 'IN_PROGRESS',
                'bg-green-100 text-green-700': row.Status === 'RESOLVED',
              }">{{ statusLabels[row.Status] || row.Status }}</span>
            </td>
            <td class="px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <button class="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200" @click="openDetailModal(row)">Detail</button>
                <button class="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100" @click="openEditModal(row)">Edit</button>
              </div>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="8" class="px-4 py-8 text-center text-sm text-slate-400">Belum ada data isu.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <Modal :is-open="isModalOpen" title="Detail Isu" @close="isModalOpen = false">
    <form @submit.prevent="saveIssue" class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-semibold">Peserta</label>
        <Combobox
          v-if="!form.id"
          v-model="selectedInternString"
          :options="internStringOptions"
          :max-items="5"
          placeholder="Cari nama peserta..."
          required
        />
        <input v-else type="text" class="control" :value="selectedInternString" disabled />
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold">Jenis Isu (bisa pilih lebih dari 1)</label>
        <div class="mt-1 grid grid-cols-2 gap-2">
          <label v-for="(label, key) in issueTypeLabels" :key="key" class="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors" :class="form.type.includes(key) ? 'border-blue-400 bg-blue-50 font-medium text-blue-700' : 'hover:bg-slate-50'">
            <input type="checkbox" :value="key" v-model="form.type" class="accent-blue-500" />
            {{ label }}
          </label>
        </div>
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold">Tgl Lapor / Kejadian</label>
        <input v-model="form.reportedDate" type="date" class="control" required />
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold">Deskripsi Singkat</label>
        <textarea v-model="form.description" class="control" rows="2" required></textarea>
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold">Status</label>
        <select v-model="form.status" class="control" required>
          <option value="OPEN">Open (Belum Ditangani)</option>
          <option value="IN_PROGRESS">In Progress (Sedang Ditangani)</option>
          <option value="RESOLVED">Resolved (Selesai)</option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold">Tindak Lanjut (Follow Up)</label>
        <textarea v-model="form.followUpAction" class="control" rows="2" placeholder="Catatan tindakan HCM/Leader..."></textarea>
      </div>

      <p v-if="status" class="text-sm font-medium text-red-600">{{ status }}</p>

      <div class="flex justify-end gap-3 pt-4">
        <button type="button" class="action-secondary" @click="isModalOpen = false">Batal</button>
        <button type="submit" class="action-primary" :disabled="saving">{{ saving ? 'Menyimpan...' : 'Simpan Isu' }}</button>
      </div>
    </form>
  </Modal>

  <!-- Detail Modal (Read-Only) -->
  <Modal :is-open="isDetailOpen" title="Detail Lengkap Isu" @close="isDetailOpen = false">
    <div v-if="detailIssue" class="space-y-4 text-sm">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <p class="text-xs font-semibold uppercase text-slate-400">Peserta</p>
          <p class="mt-1 font-medium">{{ detailIssue.intern.name }}</p>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase text-slate-400">Tim</p>
          <p class="mt-1">{{ detailIssue.intern.team }}</p>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase text-slate-400">Divisi</p>
          <p class="mt-1">{{ detailIssue.intern.division }}</p>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase text-slate-400">Instansi</p>
          <p class="mt-1">{{ detailIssue.intern.institution || '-' }}</p>
        </div>
      </div>

      <hr class="border-slate-200" />

      <div>
        <p class="text-xs font-semibold uppercase text-slate-400">Jenis Isu</p>
        <div class="mt-1 flex flex-wrap gap-1.5">
          <span v-for="t in (Array.isArray(detailIssue.type) ? detailIssue.type : [detailIssue.type])" :key="t" class="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">{{ issueTypeLabels[t] || t }}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <p class="text-xs font-semibold uppercase text-slate-400">Tgl Lapor</p>
          <p class="mt-1">{{ dateShort(detailIssue.reportedDate) }}</p>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase text-slate-400">Status</p>
          <span class="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="{
            'bg-red-100 text-red-700': detailIssue.status === 'OPEN',
            'bg-amber-100 text-amber-700': detailIssue.status === 'IN_PROGRESS',
            'bg-green-100 text-green-700': detailIssue.status === 'RESOLVED',
          }">{{ statusLabels[detailIssue.status] || detailIssue.status }}</span>
        </div>
      </div>

      <div>
        <p class="text-xs font-semibold uppercase text-slate-400">Deskripsi</p>
        <p class="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3">{{ detailIssue.description }}</p>
      </div>

      <div>
        <p class="text-xs font-semibold uppercase text-slate-400">Tindak Lanjut (Follow Up)</p>
        <p class="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3">{{ detailIssue.followUpAction || 'Belum ada tindak lanjut.' }}</p>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="action-secondary" @click="isDetailOpen = false">Tutup</button>
        <button type="button" class="action-primary" @click="isDetailOpen = false; openEditModal({ _id: detailIssue.id })">Edit Isu</button>
      </div>
    </div>
  </Modal>

  <!-- Chart Click Detail Modal -->
  <Modal :is-open="isChartDetailOpen" :title="chartDetailTitle" @close="isChartDetailOpen = false">
    <div class="space-y-4">
      <p class="text-sm text-slate-500">Berikut adalah daftar peserta unik (tidak duplikat) yang menyumbang angka pada metrik ini:</p>
      
      <div v-if="chartDetailList.length > 0" class="max-h-[60vh] overflow-y-auto rounded-lg border border-slate-200">
        <ul class="divide-y divide-slate-100">
          <li v-for="intern in chartDetailList" :key="intern.id" class="flex items-center gap-3 p-3 text-sm hover:bg-slate-50">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
              {{ intern.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-semibold text-slate-700">{{ intern.name }}</p>
              <p class="text-xs text-slate-500">{{ intern.team }} &bull; {{ intern.division }}</p>
            </div>
          </li>
        </ul>
      </div>
      <p v-else class="py-4 text-center text-sm text-slate-400">Tidak ada data peserta ditemukan.</p>

      <div class="flex justify-end pt-2">
        <button type="button" class="action-secondary" @click="isChartDetailOpen = false">Tutup</button>
      </div>
    </div>
  </Modal>
</template>
