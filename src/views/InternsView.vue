<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import DataTable from '../components/DataTable.vue';
import PageHeader from '../components/PageHeader.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { api, type Intern, type InternshipType, type Status } from '../services/api';
import { dateShort } from '../utils/format';
import { filterInterns, type InternFilters, type InternSortOption, normalizeDivision, sortInterns, uniqueDivisions, uniqueTeams } from '../utils/internFilters';

const interns = ref<Intern[]>([]);
const search = ref('');
const type = ref<InternFilters['type']>('');
const division = ref<InternFilters['division']>('');
const team = ref('');
const status = ref<InternFilters['status']>('');
const sortBy = ref<InternSortOption>('startDateDesc');
const isFormOpen = ref(false);
const editingId = ref('');
const feedback = ref('');
const saving = ref(false);
const loading = ref(false);

interface InternForm {
  name: string;
  type: InternshipType;
  institution: string;
  major: string;
  division: string;
  team: string;
  position: string;
  leader: string;
  location: string;
  startDate: string;
  endDate: string;
  manualStatus: Status | '';
  phone: string;
  email: string;
  notes: string;
}

const emptyForm = (): InternForm => ({
  name: '',
  type: 'INSTITUTION',
  institution: '',
  major: '',
  division: '',
  team: '',
  position: '',
  leader: '',
  location: 'Bandung',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
  manualStatus: '',
  phone: '',
  email: '',
  notes: '',
});

const form = reactive<InternForm>(emptyForm());

const divisionOptions = computed(() => uniqueDivisions(interns.value));
const teamOptions = computed(() => uniqueTeams(interns.value, division.value));

const rows = computed(() =>
  sortInterns(
    filterInterns(interns.value, {
      search: search.value,
      type: type.value,
      division: division.value,
      team: team.value,
      status: status.value,
    }),
    sortBy.value,
  ).map((item) => ({
      id: item.id,
      Nama: item.name,
      Tipe: item.type,
      Instansi: item.institution,
      Divisi: normalizeDivision(item.division) || item.division,
      Tim: item.team,
      Posisi: item.position,
      Leader: item.leader,
      Masuk: dateShort(item.startDate),
      Selesai: dateShort(item.endDate),
      Durasi: item.durationLabel,
      Status: item.status,
      Aksi: item.id,
    })),
);

async function loadInterns() {
  loading.value = true;
  try {
    interns.value = await api.interns();
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  Object.assign(form, emptyForm());
  editingId.value = '';
  feedback.value = '';
}

function openCreate() {
  resetForm();
  isFormOpen.value = true;
}

function toDateInput(value: string) {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}

function openEdit(row: Record<string, unknown>) {
  const intern = interns.value.find((item) => item.id === row.id);
  if (!intern) return;
  Object.assign(form, {
    name: intern.name ?? '',
    type: intern.type,
    institution: intern.institution ?? '',
    major: intern.major ?? '',
    division: intern.division ?? '',
    team: intern.team ?? '',
    position: intern.position ?? '',
    leader: intern.leader ?? '',
    location: intern.location ?? '',
    startDate: toDateInput(intern.startDate),
    endDate: toDateInput(intern.endDate),
    manualStatus: intern.status === 'TERMINATED' ? 'TERMINATED' : '',
    phone: intern.phone ?? '',
    email: intern.email ?? '',
    notes: intern.notes ?? '',
  });
  editingId.value = intern.id;
  feedback.value = '';
  isFormOpen.value = true;
}

function validateForm() {
  if (!form.name.trim()) return 'Nama wajib diisi.';
  if (!form.division.trim()) return 'Divisi wajib diisi.';
  if (!form.team.trim()) return 'Tim wajib diisi.';
  if (!form.startDate || !form.endDate) return 'Tanggal masuk dan selesai wajib diisi.';
  if (new Date(form.endDate) < new Date(form.startDate)) return 'Tanggal selesai tidak boleh lebih awal dari tanggal masuk.';
  return '';
}

async function submitForm() {
  const error = validateForm();
  if (error) {
    feedback.value = error;
    return;
  }

  saving.value = true;
  feedback.value = '';
  try {
    const payload = { ...form, manualStatus: form.manualStatus || null };
    if (editingId.value) {
      await api.updateIntern(editingId.value, payload);
      feedback.value = 'Data peserta berhasil diperbarui.';
    } else {
      await api.createIntern(payload);
      feedback.value = 'Data peserta berhasil ditambahkan.';
      resetForm();
    }
    await loadInterns();
  } catch {
    feedback.value = 'Data belum bisa disimpan. Periksa koneksi backend atau kemungkinan data duplikat.';
  } finally {
    saving.value = false;
  }
}

async function deleteIntern(row: Record<string, unknown>) {
  const intern = interns.value.find((item) => item.id === row.id);
  if (!intern) return;
  if (!window.confirm(`Hapus data ${intern.name}?`)) return;

  try {
    await api.deleteIntern(intern.id);
    await loadInterns();
    feedback.value = 'Data peserta berhasil dihapus.';
    if (editingId.value === intern.id) {
      isFormOpen.value = false;
      resetForm();
    }
  } catch {
    feedback.value = 'Data belum bisa dihapus. Periksa koneksi backend.';
  }
}

onMounted(loadInterns);

watch(division, () => {
  if (team.value && !teamOptions.value.includes(team.value)) {
    team.value = '';
  }
});
</script>

<template>
  <PageHeader title="Master Data Peserta" subtitle="CRUD dan monitoring data peserta magang instansi maupun profesional.">
    <button class="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white" @click="openCreate">Tambah Peserta</button>
  </PageHeader>

  <section v-if="isFormOpen" class="panel mb-4 p-5">
    <div class="mb-4 flex items-center justify-between gap-3">
      <h2 class="text-sm font-semibold text-ink">{{ editingId ? 'Edit Peserta' : 'Tambah Peserta' }}</h2>
      <button class="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600" @click="isFormOpen = false">Tutup</button>
    </div>
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <input v-model="form.name" class="control" placeholder="Nama" />
      <select v-model="form.type" class="control">
        <option value="INSTITUTION">Instansi</option>
        <option value="PROFESSIONAL">Profesional</option>
      </select>
      <input v-model="form.institution" class="control" placeholder="Asal instansi" />
      <input v-model="form.major" class="control" placeholder="Jurusan" />
      <input v-model="form.division" class="control" placeholder="Divisi" />
      <input v-model="form.team" class="control" placeholder="Tim" />
      <input v-model="form.position" class="control" placeholder="Posisi" />
      <input v-model="form.leader" class="control" placeholder="Leader / PIC" />
      <input v-model="form.location" class="control" placeholder="Lokasi" />
      <input v-model="form.startDate" class="control" type="date" />
      <input v-model="form.endDate" class="control" type="date" />
      <select v-model="form.manualStatus" class="control">
        <option value="">Status otomatis</option>
        <option value="TERMINATED">Terminated</option>
      </select>
      <input v-model="form.phone" class="control" placeholder="Nomor HP" />
      <input v-model="form.email" class="control" type="email" placeholder="Email" />
      <textarea v-model="form.notes" class="control min-h-24 md:col-span-2" placeholder="Notes" />
    </div>
    <div class="mt-4 flex flex-wrap items-center gap-3">
      <button class="rounded-md bg-success px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" :disabled="saving" @click="submitForm">
        {{ saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Peserta' }}
      </button>
      <button v-if="editingId" class="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700" @click="openCreate">Buat Baru</button>
      <p v-if="feedback" class="text-sm text-slate-600">{{ feedback }}</p>
    </div>
  </section>

  <div class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
    <input v-model="search" class="control" placeholder="Cari nama" />
    <select v-model="type" class="control">
      <option value="">Semua tipe</option>
      <option value="INSTITUTION">Instansi</option>
      <option value="PROFESSIONAL">Profesional</option>
    </select>
    <select v-model="division" class="control">
      <option value="">Semua divisi</option>
      <option v-for="item in divisionOptions" :key="item" :value="item">{{ item }}</option>
    </select>
    <select v-model="team" class="control">
      <option value="">Semua tim</option>
      <option v-for="item in teamOptions" :key="item" :value="item">{{ item }}</option>
    </select>
    <select v-model="status" class="control">
      <option value="">Semua status</option>
      <option value="ACTIVE">Aktif</option>
      <option value="PLANNED">Rencana</option>
      <option value="COMPLETED">Selesai</option>
      <option value="TERMINATED">Terminated</option>
    </select>
    <select v-model="sortBy" class="control">
      <option value="startDateDesc">Join terbaru</option>
      <option value="startDateAsc">Join terlama</option>
      <option value="endDateDesc">Selesai terbaru</option>
      <option value="endDateAsc">Selesai terlama</option>
    </select>
  </div>

  <p v-if="feedback && !isFormOpen" class="mb-3 text-sm text-slate-600">{{ feedback }}</p>

  <DataTable
    :columns="['Nama', 'Tipe', 'Instansi', 'Divisi', 'Tim', 'Posisi', 'Leader', 'Masuk', 'Selesai', 'Durasi', 'Status', 'Aksi']"
    :rows="rows"
    :loading="loading"
    empty-message="Tidak ada peserta yang sesuai dengan filter."
  >
    <template #Status="{ row }"><StatusBadge :value="String(row.Status)" /></template>
    <template #Aksi="{ row }">
      <div class="flex gap-2">
        <button class="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-navy" @click="openEdit(row)">Edit</button>
        <button class="rounded-md border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700" @click="deleteIntern(row)">Hapus</button>
      </div>
    </template>
  </DataTable>
</template>
