<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import DataTable from '../components/DataTable.vue';
import PageHeader from '../components/PageHeader.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { api } from '../services/api';

const checklist = ref<any[]>([]);
const selectedInternId = ref('');
const selectedChecklist = computed(() => checklist.value.find((entry) => entry.internId === selectedInternId.value));
const feedback = ref('');
const saving = ref(false);
const loading = ref(false);
const checklistItems = [
  { key: 'companyLaptopReturned', label: 'Pengembalian laptop perusahaan' },
  { key: 'idCardReturned', label: 'Pengembalian name tag / ID card' },
  { key: 'companyEmailClosed', label: 'Penutupan akses akun Email perusahaan' },
  { key: 'gitAccountClosed', label: 'Penutupan Git Account' },
  { key: 'knowledgeAccountClosed', label: 'Penutupan Akun knowledge.neuron.id' },
  { key: 'handoverCompleted', label: 'Seluruh pekerjaan magang telah diselesaikan dan dilakukan serah terima / Transfer Knowledge' },
  { key: 'financeCleared', label: 'Koperasi / Keuangan' },
  { key: 'reportApproved', label: 'ACC laporan magang dari Leader dan HCM' },
  { key: 'academyAccountClosed', label: 'Penutupan akun academy.neuron.id' },
  { key: 'leaderAssessmentFilled', label: 'Pengisian Form Penilaian Leader' },
  { key: 'internFeedbackFilled', label: 'Pengisian Form Feedback oleh anggota magang' },
  { key: 'workGroupsLeft', label: 'Leave dari grup yang berkaitan dengan pekerjaan di Neuron' },
] as const;
type ChecklistKey = (typeof checklistItems)[number]['key'];
const form = reactive<Record<ChecklistKey, boolean> & { notes: string }>(emptyForm());
const rows = computed(() =>
  checklist.value.map((item) => ({
    id: item.id,
    internId: item.internId,
    Peserta: item.intern?.name,
    Divisi: item.intern?.division,
    Tim: item.intern?.team,
    Progress: `${completedCount(item)} / ${checklistItems.length}`,
    Status: item.finalStatus,
    Aksi: item.internId,
  })),
);

async function loadChecklist() {
  loading.value = true;
  try {
    checklist.value = await api.completion();
  } finally {
    loading.value = false;
  }
}

function selectChecklist(row: Record<string, unknown>) {
  const item = checklist.value.find((entry) => entry.internId === row.internId);
  if (!item) return;
  selectedInternId.value = item.internId;
  Object.assign(form, {
    ...Object.fromEntries(checklistItems.map((checklistItem) => [checklistItem.key, Boolean(item[checklistItem.key])])),
    notes: item.notes ?? '',
  });
  feedback.value = '';
}

function closeModal() {
  selectedInternId.value = '';
  Object.assign(form, emptyForm());
  feedback.value = '';
}

async function saveChecklist() {
  if (!selectedInternId.value) {
    feedback.value = 'Pilih peserta terlebih dahulu.';
    return;
  }
  saving.value = true;
  feedback.value = '';
  try {
    await api.updateCompletion(selectedInternId.value, { ...form });
    await loadChecklist();
    feedback.value = 'Checklist berhasil diperbarui.';
    closeModal();
  } catch {
    feedback.value = 'Checklist belum bisa disimpan. Periksa koneksi backend.';
  } finally {
    saving.value = false;
  }
}

function emptyForm() {
  return Object.fromEntries([
    ...checklistItems.map((item) => [item.key, false]),
    ['notes', ''],
  ]) as Record<ChecklistKey, boolean> & { notes: string };
}

function completedCount(item: Record<string, unknown>) {
  return checklistItems.filter((checklistItem) => item[checklistItem.key] === true).length;
}

const selectedProgress = computed(() => ({
  done: completedCount(form),
  total: checklistItems.length,
}));

const rowClass = (row: Record<string, unknown>) => (row.internId === selectedInternId.value ? 'bg-blue-50 hover:bg-blue-50' : '');

onMounted(loadChecklist);
</script>

<template>
  <PageHeader title="Checklist Penyelesaian" subtitle="Kontrol administrasi saat peserta selesai magang." />
  <DataTable
    :columns="['Peserta', 'Divisi', 'Tim', 'Progress', 'Status', 'Aksi']"
    :rows="rows"
    :loading="loading"
    empty-message="Tidak ada checklist peserta aktif."
    :row-class="rowClass"
  >
    <template #Status="{ row }"><StatusBadge :value="String(row.Status)" /></template>
    <template #Aksi="{ row }">
      <button class="action-secondary px-3 py-1.5 text-xs text-navy" @click="selectChecklist(row)">Edit</button>
    </template>
  </DataTable>

  <div v-if="selectedChecklist" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
    <form class="w-full max-w-2xl rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-panel transition duration-200" @submit.prevent="saveChecklist">
      <div class="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-ink">Edit Checklist Penyelesaian</h2>
          <p class="mt-1 text-sm text-slate-500">
            {{ selectedChecklist.intern?.name ?? 'Peserta' }} · {{ selectedChecklist.intern?.division ?? '-' }} / {{ selectedChecklist.intern?.team ?? '-' }}
          </p>
        </div>
        <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-navy">
          {{ selectedProgress.done }} / {{ selectedProgress.total }}
        </span>
      </div>

      <div class="grid max-h-[52vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
        <label v-for="item in checklistItems" :key="item.key" class="flex items-start gap-3 rounded-md border border-slate-200 p-3 text-sm font-semibold text-slate-700 transition duration-200 hover:border-emerald-200 hover:bg-emerald-50/60">
          <input v-model="form[item.key]" type="checkbox" class="mt-1" />
          <span>{{ item.label }}</span>
        </label>
      </div>

      <label class="mt-4 block text-sm font-semibold text-slate-600">
        Notes
        <textarea v-model="form.notes" class="control mt-2 min-h-24 w-full" placeholder="Catatan penyelesaian magang"></textarea>
      </label>
      <p v-if="feedback" class="mt-3 text-sm text-red-600">{{ feedback }}</p>

      <div class="mt-6 flex justify-end gap-3">
        <button type="button" class="action-secondary" @click="closeModal">Batal</button>
        <button type="submit" class="action-success" :disabled="saving">
          {{ saving ? 'Menyimpan...' : 'Simpan Checklist' }}
        </button>
      </div>
    </form>
  </div>
</template>
