<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import DataTable from '../components/DataTable.vue';
import PageHeader from '../components/PageHeader.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { api } from '../services/api';
import { dateShort } from '../utils/format';
import { filterPlansByStatus, getPlanDisplayStatus, isCompletedPlan, sortPlans, type PlanSortMode } from '../utils/planFilters';

const plans = ref<any[]>([]);
const sortMode = ref<PlanSortMode>('joinDateAsc');
const statusFilter = ref('');
const editingPlan = ref<any | null>(null);
const showCreateForm = ref(false);
const statusDraft = ref('');
const isSaving = ref(false);
const isCreating = ref(false);
const loading = ref(false);
const emptyPlanForm = () => ({
  name: '',
  type: 'INSTITUTION',
  institution: '',
  major: '',
  targetDivision: '',
  targetTeam: '',
  leader: '',
  acceptanceLetterDate: '',
  plannedStartDate: '',
  plannedEndDate: '',
  documentStatus: '',
  onboardingStatus: '',
  phone: '',
  notes: '',
});
const planForm = ref(emptyPlanForm());
const processStatusOptions = [
  'REQUEST_RECEIVED',
  'SCREENING',
  'ACCEPTED',
  'ACCEPTANCE_LETTER_SENT',
  'WAITING_JOIN',
  'ACTIVE',
  'COMPLETED',
  'COMPLETION_CHECKLIST_DONE',
];
const statusFilterOptions = ['', 'REQUEST_RECEIVED', 'SCREENING', 'ACCEPTED', 'ACCEPTANCE_LETTER_SENT', 'WAITING_JOIN', 'ON_GOING', 'ACTIVE', 'COMPLETED', 'COMPLETION_CHECKLIST_DONE'];
const sortedPlans = computed(() => sortPlans(filterPlansByStatus(plans.value, statusFilter.value), sortMode.value));
const rows = computed(() =>
  sortedPlans.value.map((item) => ({
    id: item.id,
    Nama: item.name,
    Tipe: item.type,
    Instansi: item.institution,
    Jurusan: item.major,
    Divisi: item.targetDivision || '-',
    Tim: item.targetTeam || '-',
    Leader: item.leader || '-',
    Masuk: dateShort(item.plannedStartDate),
    Selesai: dateShort(item.plannedEndDate),
    Proses: getPlanDisplayStatus(item),
    _rawProcessStatus: item.processStatus,
    _isCompleted: isCompletedPlan(item),
  })),
);
const planRowClass = (row: Record<string, unknown>) =>
  row._isCompleted ? '!bg-[#17315f] text-white' : '';
const planCellClass = (row: Record<string, unknown>) => (row._isCompleted ? '!text-white' : '');
const openEdit = (row: Record<string, unknown>) => {
  editingPlan.value = plans.value.find((plan) => plan.id === row.id) ?? null;
  statusDraft.value = String(row._rawProcessStatus || row.Proses || 'WAITING_JOIN');
};
const closeEdit = () => {
  editingPlan.value = null;
  statusDraft.value = '';
};
const openCreate = () => {
  planForm.value = emptyPlanForm();
  showCreateForm.value = true;
};
const closeCreate = () => {
  showCreateForm.value = false;
  planForm.value = emptyPlanForm();
};
const savePlanStatus = async () => {
  if (!editingPlan.value) return;
  isSaving.value = true;
  try {
    const { data } = await api.updatePlanStatus(editingPlan.value.id, { processStatus: statusDraft.value });
    plans.value = plans.value.map((plan) => (plan.id === data.id ? data : plan));
    closeEdit();
  } finally {
    isSaving.value = false;
  }
};
const createPlan = async () => {
  isCreating.value = true;
  try {
    const { data } = await api.createPlan(planForm.value);
    plans.value = [...plans.value, data];
    closeCreate();
  } finally {
    isCreating.value = false;
  }
};
async function loadPlans() {
  loading.value = true;
  try {
    plans.value = await api.plans();
  } finally {
    loading.value = false;
  }
}

onMounted(loadPlans);
</script>

<template>
  <PageHeader title="Rencana Magang" subtitle="Peserta diterima atau sudah dikirim surat penerimaan namun belum join.">
    <button class="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white" @click="openCreate">Tambah Peserta</button>
  </PageHeader>

  <section class="panel mb-4 p-4">
    <div class="grid gap-3 lg:grid-cols-[1fr_260px_260px]">
      <div>
        <p class="text-sm font-semibold text-ink">Filter Rencana</p>
        <p class="mt-1 text-xs text-slate-500">Urutkan dan pantau peserta berdasarkan status proses join.</p>
      </div>
      <select v-model="statusFilter" class="control">
        <option v-for="status in statusFilterOptions" :key="status || 'all'" :value="status">
          {{ status ? status.replaceAll('_', ' ') : 'Semua status proses' }}
        </option>
      </select>
      <select v-model="sortMode" class="control">
        <option value="joinDateAsc">Terdekat akan join</option>
        <option value="joinDateDesc">Terlama akan join</option>
      </select>
    </div>
  </section>

  <DataTable
    :columns="['Nama', 'Tipe', 'Instansi', 'Jurusan', 'Divisi', 'Tim', 'Leader', 'Masuk', 'Selesai', 'Proses', 'Aksi']"
    :rows="rows"
    :loading="loading"
    empty-message="Tidak ada rencana magang yang sesuai filter."
    :row-class="planRowClass"
    :cell-class="planCellClass"
  >
    <template #Proses="{ row }">
      <span v-if="row._isCompleted" class="inline-flex rounded-full border border-white/40 px-2.5 py-1 text-xs font-semibold text-white">
        {{ String(row.Proses).replaceAll('_', ' ') }}
      </span>
      <StatusBadge v-else :value="String(row.Proses)" />
    </template>
    <template #Aksi="{ row }">
      <button
        class="rounded-md border px-3 py-1.5 text-xs font-semibold transition"
        :class="row._isCompleted ? 'border-white/40 text-white hover:bg-white/10' : 'border-slate-200 text-ink hover:bg-slate-50'"
        @click="openEdit(row)"
      >
        Edit
      </button>
    </template>
  </DataTable>

  <div v-if="editingPlan" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
    <form class="w-full max-w-md rounded-lg bg-white p-5 shadow-xl" @submit.prevent="savePlanStatus">
      <div class="mb-5">
        <h2 class="text-lg font-semibold text-ink">Edit Status Rencana</h2>
        <p class="mt-1 text-sm text-slate-500">{{ editingPlan.name }} · {{ editingPlan.targetDivision || 'Belum mapping divisi' }} / {{ editingPlan.targetTeam || 'Belum mapping tim' }}</p>
      </div>
      <label class="block text-sm font-semibold text-slate-600" for="plan-status">Status proses</label>
      <select id="plan-status" v-model="statusDraft" class="control mt-2 w-full">
        <option v-for="status in processStatusOptions" :key="status" :value="status">{{ status.replaceAll('_', ' ') }}</option>
      </select>
      <p class="mt-3 text-xs text-slate-500">
        ON GOING tampil otomatis jika tanggal berjalan sudah berada di periode masuk sampai selesai.
      </p>
      <div class="mt-6 flex justify-end gap-3">
        <button type="button" class="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-ink" @click="closeEdit">Batal</button>
        <button type="submit" class="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" :disabled="isSaving">
          {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
        </button>
      </div>
    </form>
  </div>

  <div v-if="showCreateForm" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
    <form class="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl" @submit.prevent="createPlan">
      <div class="mb-5">
        <h2 class="text-lg font-semibold text-ink">Tambah Peserta Rencana</h2>
        <p class="mt-1 text-sm text-slate-500">Status awal akan tersimpan sebagai WAITING JOIN.</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block text-sm font-semibold text-slate-600">
          Nama
          <input v-model="planForm.name" required class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Tipe magang
          <select v-model="planForm.type" class="control mt-2 w-full">
            <option value="INSTITUTION">Instansi</option>
            <option value="PROFESSIONAL">Profesional</option>
          </select>
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Asal instansi
          <input v-model="planForm.institution" class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Jurusan
          <input v-model="planForm.major" class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Divisi tujuan
          <span class="ml-1 text-xs font-medium text-slate-400">(opsional)</span>
          <input v-model="planForm.targetDivision" class="control mt-2 w-full" placeholder="Diisi setelah mapping peserta" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Tim tujuan
          <span class="ml-1 text-xs font-medium text-slate-400">(opsional)</span>
          <input v-model="planForm.targetTeam" class="control mt-2 w-full" placeholder="Diisi setelah mapping peserta" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Leader
          <span class="ml-1 text-xs font-medium text-slate-400">(opsional)</span>
          <input v-model="planForm.leader" class="control mt-2 w-full" placeholder="Diisi setelah mapping peserta" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Nomor HP
          <input v-model="planForm.phone" class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Tanggal surat penerimaan
          <input v-model="planForm.acceptanceLetterDate" type="date" class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Tanggal rencana masuk
          <input v-model="planForm.plannedStartDate" required type="date" class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Tanggal rencana selesai
          <input v-model="planForm.plannedEndDate" required type="date" class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Status dokumen
          <input v-model="planForm.documentStatus" class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Status onboarding
          <input v-model="planForm.onboardingStatus" class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600 sm:col-span-2">
          Notes
          <textarea v-model="planForm.notes" class="control mt-2 min-h-24 w-full"></textarea>
        </label>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button type="button" class="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-ink" @click="closeCreate">Batal</button>
        <button type="submit" class="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" :disabled="isCreating">
          {{ isCreating ? 'Menyimpan...' : 'Simpan' }}
        </button>
      </div>
    </form>
  </div>
</template>
