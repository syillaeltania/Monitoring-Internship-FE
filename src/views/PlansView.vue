<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Combobox from '../components/Combobox.vue';
import DataTable from '../components/DataTable.vue';
import PageHeader from '../components/PageHeader.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { api, type Intern } from '../services/api';
import { dateShort } from '../utils/format';
import { buildPlanFormFromPlan, emptyPlanForm } from '../utils/planForm';
import { filterPlansByStatus, getPlanDisplayStatus, isCompletedPlan, sortPlans, type PlanSortMode } from '../utils/planFilters';
import { uniqueDivisions, uniqueTeams, uniqueLeaders } from '../utils/internFilters';

const plans = ref<any[]>([]);
const interns = ref<Intern[]>([]);
const sortMode = ref<PlanSortMode>('statusPriority');
const statusFilter = ref('');
const editingPlan = ref<any | null>(null);
const showCreateForm = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const isCreating = ref(false);
const loading = ref(false);
const planForm = ref(emptyPlanForm());
const editPlanForm = ref(emptyPlanForm());
const processStatusOptions = [
  'WAITING_JOIN',
  'ACTIVE',
  'COMPLETED',
];
const statusFilterOptions = ['', 'WAITING_JOIN', 'ON_GOING', 'COMPLETED'];
const searchQuery = ref('');
const searchField = ref('all');

const divisionOptions = computed(() => uniqueDivisions(interns.value));
const formTeamOptions = computed(() => uniqueTeams(interns.value, planForm.value.targetDivision));
const formLeaderOptions = computed(() => uniqueLeaders(interns.value, planForm.value.targetTeam));
const editTeamOptions = computed(() => uniqueTeams(interns.value, editPlanForm.value.targetDivision));
const editLeaderOptions = computed(() => uniqueLeaders(interns.value, editPlanForm.value.targetTeam));

const sortedPlans = computed(() => {
  const filtered = filterPlansByStatus(plans.value, statusFilter.value).filter(plan => {
    if (!searchQuery.value) return true;
    const q = searchQuery.value.toLowerCase();
    
    if (searchField.value === 'name') return plan.name && plan.name.toLowerCase().includes(q);
    if (searchField.value === 'team') return plan.targetTeam && plan.targetTeam.toLowerCase().includes(q);
    if (searchField.value === 'division') return plan.targetDivision && plan.targetDivision.toLowerCase().includes(q);
    if (searchField.value === 'leader') return plan.leader && plan.leader.toLowerCase().includes(q);
    if (searchField.value === 'institution') return plan.institution && plan.institution.toLowerCase().includes(q);
    
    return (
      (plan.name && plan.name.toLowerCase().includes(q)) ||
      (plan.targetTeam && plan.targetTeam.toLowerCase().includes(q)) ||
      (plan.targetDivision && plan.targetDivision.toLowerCase().includes(q)) ||
      (plan.leader && plan.leader.toLowerCase().includes(q)) ||
      (plan.institution && plan.institution.toLowerCase().includes(q))
    );
  });
  return sortPlans(filtered, sortMode.value);
});
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
  row._isCompleted ? 'bg-transparent hover:bg-slate-50/50' : '';
const planCellClass = (row: Record<string, unknown>) => (row._isCompleted ? '!text-[#77736F] opacity-70' : '');
const openEdit = (row: Record<string, unknown>) => {
  editingPlan.value = plans.value.find((plan) => plan.id === row.id) ?? null;
  if (editingPlan.value) {
    let status = editingPlan.value.processStatus;
    if (status === 'COMPLETION_CHECKLIST_DONE') {
      status = 'COMPLETED';
    } else if (status !== 'COMPLETED' && status !== 'ACTIVE' && status !== 'WAITING_JOIN') {
      status = 'WAITING_JOIN';
    }
    editPlanForm.value = buildPlanFormFromPlan({
      ...editingPlan.value,
      processStatus: status,
    });
  } else {
    editPlanForm.value = emptyPlanForm();
  }
};
const closeEdit = () => {
  editingPlan.value = null;
  editPlanForm.value = emptyPlanForm();
};
const openCreate = () => {
  planForm.value = emptyPlanForm();
  showCreateForm.value = true;
};
const closeCreate = () => {
  showCreateForm.value = false;
  planForm.value = emptyPlanForm();
};
const savePlan = async () => {
  if (!editingPlan.value) return;
  isSaving.value = true;
  try {
    const { data } = await api.updatePlan(editingPlan.value.id, editPlanForm.value);
    plans.value = plans.value.map((plan) => (plan.id === data.id ? data : plan));
    closeEdit();
  } finally {
    isSaving.value = false;
  }
};
const deletePlan = async () => {
  if (!editingPlan.value) return;
  if (!window.confirm(`Hapus rencana magang untuk ${editingPlan.value.name}?`)) return;
  isDeleting.value = true;
  try {
    await api.deletePlan(editingPlan.value.id);
    plans.value = plans.value.filter((plan) => plan.id !== editingPlan.value.id);
    closeEdit();
  } catch (error) {
    alert('Gagal menghapus rencana magang.');
  } finally {
    isDeleting.value = false;
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
    const [plansData, internsData] = await Promise.all([api.plans(), api.interns()]);
    plans.value = plansData;
    interns.value = internsData;
  } finally {
    loading.value = false;
  }
}

onMounted(loadPlans);
</script>

<template>
  <PageHeader title="Rencana Magang" subtitle="Peserta diterima atau sudah dikirim surat penerimaan namun belum join.">
    <button class="action-primary" @click="openCreate">Tambah Peserta</button>
  </PageHeader>

  <section class="panel mb-4 p-4">
    <div class="grid items-center gap-3 lg:grid-cols-[1fr_2fr_1.5fr_1.8fr]">
      <div>
        <p class="text-sm font-semibold text-ink">Filter Rencana</p>
        <p class="mt-1 text-xs text-slate-500">Urutkan dan pantau peserta berdasarkan status proses join.</p>
      </div>
      <div class="flex">
        <select v-model="searchField" class="control w-28 rounded-r-none border-r-0 bg-slate-50 px-2 py-1.5 pr-8 focus:z-10 focus:ring-1">
          <option value="all">Semua</option>
          <option value="name">Nama</option>
          <option value="team">Tim</option>
          <option value="division">Divisi</option>
          <option value="leader">Leader</option>
          <option value="institution">Instansi</option>
        </select>
        <input v-model="searchQuery" class="control w-full rounded-l-none focus:z-10 focus:ring-1" placeholder="Pencarian..." />
      </div>
      <select v-model="statusFilter" class="control pr-8">
        <option v-for="status in statusFilterOptions" :key="status || 'all'" :value="status">
          {{ status ? status.replaceAll('_', ' ') : 'Semua status proses' }}
        </option>
      </select>
      <select v-model="sortMode" class="control pr-8">
        <option value="statusPriority">Status Aktif Terlebih Dahulu</option>
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
      <StatusBadge :value="String(row.Proses)" />
    </template>
    <template #Aksi="{ row }">
      <button
        class="rounded-md border px-3 py-1.5 text-xs font-semibold transition duration-200"
        :class="row._isCompleted ? 'border-white/40 text-white hover:bg-white/10' : 'border-slate-200 text-ink hover:bg-slate-50'"
        @click="openEdit(row)"
      >
        Edit
      </button>
    </template>
  </DataTable>

  <div v-if="editingPlan" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
    <form class="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-panel transition duration-200" @submit.prevent="savePlan">
      <div class="mb-5">
        <h2 class="text-lg font-semibold text-ink">Edit Rencana Magang</h2>
        <p class="mt-1 text-sm text-slate-500">Ubah data rencana, mapping, tanggal, dokumen, onboarding, dan status proses.</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block text-sm font-semibold text-slate-600">
          Nama
          <input v-model="editPlanForm.name" required class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Tipe magang
          <select v-model="editPlanForm.type" class="control mt-2 w-full">
            <option value="INSTITUTION">Instansi</option>
            <option value="PROFESSIONAL">Profesional</option>
          </select>
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Asal instansi
          <input v-model="editPlanForm.institution" class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Jurusan
          <input v-model="editPlanForm.major" class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Divisi tujuan
          <span class="ml-1 text-xs font-medium text-slate-400">(opsional)</span>
          <Combobox v-model="editPlanForm.targetDivision" :options="divisionOptions" placeholder="Diisi setelah mapping peserta" class="mt-2" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Tim tujuan
          <span class="ml-1 text-xs font-medium text-slate-400">(opsional)</span>
          <Combobox v-model="editPlanForm.targetTeam" :options="editTeamOptions" placeholder="Diisi setelah mapping peserta" class="mt-2" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Leader
          <span class="ml-1 text-xs font-medium text-slate-400">(opsional)</span>
          <Combobox v-model="editPlanForm.leader" :options="editLeaderOptions" placeholder="Diisi setelah mapping peserta" class="mt-2" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Nomor HP
          <input v-model="editPlanForm.phone" class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Tanggal surat penerimaan
          <input v-model="editPlanForm.acceptanceLetterDate" type="date" class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Tanggal rencana masuk
          <input v-model="editPlanForm.plannedStartDate" required type="date" class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Tanggal rencana selesai
          <input v-model="editPlanForm.plannedEndDate" required type="date" class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Status dokumen
          <input v-model="editPlanForm.documentStatus" class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Status onboarding
          <input v-model="editPlanForm.onboardingStatus" class="control mt-2 w-full" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Status proses
          <select v-model="editPlanForm.processStatus" class="control mt-2 w-full">
            <option v-for="status in processStatusOptions" :key="status" :value="status">{{ status === 'ACTIVE' ? 'ON GOING' : status.replaceAll('_', ' ') }}</option>
          </select>
        </label>
        <label class="block text-sm font-semibold text-slate-600 sm:col-span-2">
          Notes
          <textarea v-model="editPlanForm.notes" class="control mt-2 min-h-24 w-full"></textarea>
        </label>
      </div>

      <p class="mt-3 text-xs text-slate-500">
        ON GOING tampil otomatis jika tanggal berjalan sudah berada di periode masuk sampai selesai.
      </p>
      <div class="mt-6 flex justify-between items-center">
        <button
          type="button"
          class="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-red-100 hover:shadow-md disabled:opacity-50"
          :disabled="isDeleting"
          @click="deletePlan"
        >
          {{ isDeleting ? 'Menghapus...' : 'Hapus Rencana' }}
        </button>
        <div class="flex gap-3">
          <button type="button" class="action-secondary" @click="closeEdit">Batal</button>
          <button type="submit" class="action-primary" :disabled="isSaving">
            {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </form>
  </div>

  <div v-if="showCreateForm" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
    <form class="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-panel transition duration-200" @submit.prevent="createPlan">
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
          <Combobox v-model="planForm.targetDivision" :options="divisionOptions" placeholder="Diisi setelah mapping peserta" class="mt-2" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Tim tujuan
          <span class="ml-1 text-xs font-medium text-slate-400">(opsional)</span>
          <Combobox v-model="planForm.targetTeam" :options="formTeamOptions" placeholder="Diisi setelah mapping peserta" class="mt-2" />
        </label>
        <label class="block text-sm font-semibold text-slate-600">
          Leader
          <span class="ml-1 text-xs font-medium text-slate-400">(opsional)</span>
          <Combobox v-model="planForm.leader" :options="formLeaderOptions" placeholder="Diisi setelah mapping peserta" class="mt-2" />
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
        <button type="button" class="action-secondary" @click="closeCreate">Batal</button>
        <button type="submit" class="action-primary" :disabled="isCreating">
          {{ isCreating ? 'Menyimpan...' : 'Simpan' }}
        </button>
      </div>
    </form>
  </div>
</template>
