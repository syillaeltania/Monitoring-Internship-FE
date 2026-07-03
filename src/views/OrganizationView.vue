<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import { api, type Intern } from '../services/api';
import { dateShort } from '../utils/format';
import { buildOrganizationDropPayload } from '../utils/organizationMapping';
import { getPlacementKey } from '../utils/replacementScheduler';

const activeInterns = ref<Intern[]>([]);
const draggedInternId = ref('');
const dropTargetKey = ref('');
const savingInternId = ref('');
const mappingFeedback = ref('');

const divisionLabels: Record<string, string> = {
  CORE: 'CORPORATE OPERATIONS RESOURCE ENHANCEMENT (CORE)',
  BUSDEV: 'BUSINESS DEVELOPMENT & PARTNERSHIP (BUSDEV)',
  TELCO: 'TELCO SEGMENT DELIVERY (TELCO)',
  'NEW BUSINESS': 'NEW BUSINESS & LEVERAGE SEGMENT DELIVERY (NEW BUSINESS)',
  MSOS: 'MAINTENANCE & SUPPORT OPERATION SERVICES (MSOS)',
};

const divisionLeaders: Record<string, string> = {
  CORE: 'Wakil Direktur x Chief CORE',
  BUSDEV: 'Chief - Irvan Hasbi Taufiq',
  TELCO: 'Chief - Andi Setiya Wardana',
  'NEW BUSINESS': 'Chief - Arief Hermawan',
  MSOS: 'Chief - Tatang Firdaus',
};

const divisionOrder = ['CORE', 'BUSDEV', 'TELCO', 'NEW BUSINESS', 'MSOS'];
const teamDefinitions: Record<string, Array<{ title: string; subtitle?: string; role: string; leader: string; matchTeams: string[] }>> = {
  CORE: [
    { title: 'Finance', role: 'Coordinator', leader: 'Irena Marchelina', matchTeams: ['FINANCE'] },
    { title: 'HCM', role: 'Coordinator', leader: 'Ryan Nurochman', matchTeams: ['HCM'] },
    { title: 'Corporate Legal & Compliance', role: 'Coordinator', leader: 'Rangga Nurmaula K', matchTeams: ['CLC'] },
    { title: 'Logistic & Support Internal', role: 'Coordinator', leader: 'M Solehudin', matchTeams: ['LOGISTIC', 'LOGISTIK', 'LOG'] },
  ],
  BUSDEV: [
    { title: 'SMART', role: 'Coordinator', leader: 'Rahadi Aji', matchTeams: ['SMART (PR)', 'SMART (Admin)', 'SMART (Webdev)', 'SMART'] },
    { title: 'AM', role: 'PIC', leader: 'Fajar', matchTeams: ['AM', 'AM (QA)', 'AM (TW)'] },
    { title: 'RISTECH', role: 'Coordinator', leader: 'Julyan Widianto', matchTeams: ['RISTECH'] },
    { title: 'AI Dev', subtitle: 'Under RISTECH', role: 'PIC', leader: 'Arrival Dwi Sentosa', matchTeams: ['AI Dev', 'AI Development'] },
    { title: 'DOOR', subtitle: 'Under RISTECH', role: 'PIC', leader: 'M Ramdhani Lukman', matchTeams: ['DOOR'] },
  ],
  TELCO: [
    { title: 'TELCO 1', subtitle: 'SC ONE; ONE Portal; DMS; EPC; PEFITA, PPT', role: 'PM', leader: 'Arif Maulana', matchTeams: ['TELCO-1'] },
    { title: 'TELCO 2', subtitle: 'CXOne, MIA, MyDITA, NOFITA, INDRI, Shortlink TIkm.id', role: 'PM', leader: 'Ridho Hidayat', matchTeams: ['TELCO-2'] },
    { title: 'TELCO 3', subtitle: 'MyTech APK dan BE; MyStaff APK dan BE; UT Online EBIS; UT Online Retail; UT Online Mobile; BROMO; NADIA; IDMT', role: 'PM', leader: 'Fitrian Wahyu', matchTeams: ['TELCO-3'] },
  ],
  'NEW BUSINESS': [
    { title: 'NEWBUSS 1', subtitle: 'TELKOMSEL: FMC Dashboard Sprint 8; Enhancement Dashboard PPMB; Migration Data', role: 'PM', leader: 'Arief Hermawan', matchTeams: ['NB-1 (TSEL)', 'NB-1'] },
    { title: 'NEWBUSS 2', subtitle: 'TSEL: SIFA, Dashboard Vision', role: 'PM', leader: 'Hafiz Kharisma', matchTeams: ['NB-2 (TSEL)', 'NB-2 (PGN)', 'NB-2'] },
    { title: 'NEWBUSS 3', subtitle: 'PGN Billing', role: 'PM', leader: 'Indra Firdaus', matchTeams: ['NB-3 (PGN Billing)', 'NB-3 (PGN Biliing)', 'NB-3'] },
    { title: 'NEWBUSS 4', subtitle: 'PEGADAIAN', role: 'PM', leader: 'Yusuf Eka Andora', matchTeams: ['NB-4 (Pegadaian)', 'NB-4'] },
    { title: 'NEWBUSS 5', subtitle: 'ERP', role: 'PM', leader: 'Farid Firmansyah', matchTeams: ['NB-5 (ERP)', 'NB-5'] },
    { title: 'NEWBUSS 6', subtitle: 'DATA SOLUTION: ETL & AI IMPLEMENTATOR', role: 'PM', leader: 'Rijal Permana', matchTeams: ['NB-6', 'DATA SOLUTION'] },
  ],
  MSOS: [
    { title: 'SQ', role: 'Coor', leader: 'Agung Laksono', matchTeams: ['SQ', 'Software Quality'] },
    { title: 'MSO 1', subtitle: 'MSO SCOne - Telkom', role: 'Coor', leader: 'Randy Maulana', matchTeams: ['MSO 1'] },
    { title: 'MSO 2', subtitle: 'NCX WIB; MSO BPO - Telkom', role: 'Coor', leader: 'Phitias Dasa', matchTeams: ['MSO 2'] },
    { title: 'MSO 3', subtitle: 'MSO OPO - Telkom', role: 'Coor', leader: 'Andri Budi Santoso', matchTeams: ['MSO 3'] },
    { title: 'MSO 4', subtitle: 'MSO TSEL', role: 'Coor', leader: 'Sekar Pangestuti', matchTeams: ['MSO 4'] },
    { title: 'MSO 5', subtitle: 'MSO TSEL', role: 'Coor', leader: 'Indra Nugraha', matchTeams: ['MSO 5'] },
    { title: 'MSO 6', subtitle: 'MSO Telin; MSO PGN; MSO Pegadaian', role: 'Coor', leader: 'Fachrurrozy Al-Hafiz', matchTeams: ['MSO 6', 'MSOS'] },
  ],
};
const daysUntil = (value: string) => Math.ceil((new Date(value).getTime() - new Date().getTime()) / 86400000);
const teamKey = (division: string, team: string) => getPlacementKey(division, team);

const teamsByDivision = computed(() => {
  const internsByPlacement = new Map<string, Intern[]>();

  activeInterns.value.forEach((intern) => {
    const key = getPlacementKey(intern.division, intern.team, intern.position);
    internsByPlacement.set(key, [...(internsByPlacement.get(key) ?? []), intern]);
  });

  return divisionOrder.map((division) => ({
    division,
    label: divisionLabels[division] ?? division,
    leader: divisionLeaders[division] ?? '-',
    teams: (teamDefinitions[division] ?? []).map((team) => {
      const interns = team.matchTeams.flatMap((matchTeam) => internsByPlacement.get(teamKey(division, matchTeam)) ?? []);
      return {
        ...team,
        interns: [...new Map(interns.map((intern) => [intern.id, intern])).values()].sort(
          (a, b) => (a.position || '').localeCompare(b.position || '') || a.name.localeCompare(b.name),
        ),
      };
    }),
    total: (teamDefinitions[division] ?? []).reduce((sum, team) => {
      const count = new Set(team.matchTeams.flatMap((matchTeam) => (internsByPlacement.get(teamKey(division, matchTeam)) ?? []).map((intern) => intern.id))).size;
      return sum + count;
    }, 0),
  }));
});

const totalResources = computed(() => activeInterns.value.length);

function dragPayload(division: string, team: { title: string; matchTeams: string[]; leader: string }) {
  return buildOrganizationDropPayload(division, team);
}

function onDragStart(event: DragEvent, intern: Intern) {
  draggedInternId.value = intern.id;
  event.dataTransfer?.setData('text/plain', intern.id);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  mappingFeedback.value = '';
}

function onDragEnd() {
  draggedInternId.value = '';
  dropTargetKey.value = '';
}

async function onDrop(event: DragEvent, division: string, team: { title: string; matchTeams: string[]; leader: string }) {
  const internId = event.dataTransfer?.getData('text/plain') || draggedInternId.value;
  const intern = activeInterns.value.find((item) => item.id === internId);
  if (!intern) return;

  const payload = dragPayload(division, team);
  const isSameMapping = intern.division === payload.division && intern.team === payload.team && (intern.leader ?? '') === payload.leader;
  if (isSameMapping) {
    onDragEnd();
    return;
  }

  const previousInterns = [...activeInterns.value];
  savingInternId.value = intern.id;
  mappingFeedback.value = `Memindahkan ${intern.name} ke ${payload.division} / ${payload.team}...`;
  activeInterns.value = activeInterns.value.map((item) => (item.id === intern.id ? { ...item, ...payload } : item));

  try {
    const { data } = await api.updateIntern(intern.id, payload);
    activeInterns.value = activeInterns.value.map((item) => (item.id === intern.id ? { ...item, ...data } : item));
    mappingFeedback.value = `${intern.name} berhasil dipindahkan ke ${payload.division} / ${payload.team}.`;
  } catch {
    activeInterns.value = previousInterns;
    mappingFeedback.value = `Mapping ${intern.name} belum bisa disimpan. Periksa koneksi backend.`;
  } finally {
    savingInternId.value = '';
    onDragEnd();
  }
}

onMounted(async () => {
  const data: any = await api.organization();
  activeInterns.value = data.activeInterns;
});
</script>

<template>
  <PageHeader title="Pemetaan Organisasi" subtitle="Struktur penempatan magang aktif berdasarkan divisi, tim, leader, dan peserta." />
  <p v-if="mappingFeedback" class="mb-4 rounded-[14px] border border-[#3158E8]/20 bg-[#EEF2FF] px-4 py-3 text-sm font-semibold text-[#3158E8]">
    {{ mappingFeedback }}
  </p>

  <section class="overflow-x-auto rounded-[24px] border border-[#D6CEC3] bg-[#FBF8F1]">
    <div class="min-w-[1120px] space-y-8 p-6">
      <div class="rounded-md border border-slate-200 bg-white/95 p-5 shadow-sm">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase text-[#77736F]">Total resources</p>
            <p class="text-3xl font-bold text-ink">{{ totalResources }}</p>
          </div>
          <div class="flex flex-wrap justify-end gap-3 text-xs text-[#77736F]">
            <span class="inline-flex items-center gap-2"><i class="h-3 w-3 rounded-sm bg-[#EEF2FF] ring-1 ring-[#3158E8]/20"></i>Magang Instansi</span>
            <span class="inline-flex items-center gap-2"><i class="h-3 w-3 rounded-sm bg-[#ECF8EF] ring-1 ring-[#A8E9BE]"></i>Magang Profesional</span>
            <span class="inline-flex items-center gap-2"><i class="h-3 w-3 rounded-sm bg-[#FFF5C8] ring-1 ring-[#F7D95D]"></i>Selesai <= 30 hari</span>
          </div>
        </div>

        <div class="grid grid-cols-3 items-start gap-5">
          <div class="mt-12">
            <div class="border border-slate-800 bg-blue-700 px-4 py-2 text-center text-xs font-bold text-white">WAKIL DIREKTUR</div>
            <div class="border border-t-0 border-slate-800 bg-white px-4 py-2 text-center text-sm text-ink">Agung Widyanga</div>
          </div>

          <div>
            <div class="border border-slate-800 bg-blue-700 px-4 py-2 text-center text-xs font-bold text-white">DIREKTUR UTAMA / CEO</div>
            <div class="border border-t-0 border-slate-800 bg-white px-4 py-2 text-center text-sm text-ink">Sriyanto</div>
          </div>

          <div class="mt-12">
            <div class="border border-slate-800 bg-blue-700 px-4 py-2 text-center text-xs font-bold text-white">SEKRETARIS</div>
            <div class="border border-t-0 border-slate-800 bg-white px-4 py-2 text-center text-sm text-ink">Sifa Marcella</div>
          </div>
        </div>
      </div>

      <section v-for="division in teamsByDivision" :key="division.division" class="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
        <div class="bg-blue-600 px-5 py-2 text-center text-sm font-bold text-white">{{ division.label }}</div>
        <div class="flex items-center justify-between border-b border-slate-300 bg-blue-50 px-5 py-2 text-sm text-ink">
          <span class="font-semibold">{{ division.leader }}</span>
          <span class="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">{{ division.total }} peserta aktif</span>
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 p-5">
          <article
            v-for="team in division.teams"
            :key="team.title"
            class="overflow-hidden rounded-sm border bg-white text-xs shadow-sm transition"
            :class="dropTargetKey === `${division.division}-${team.title}` ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-700'"
            @dragover.prevent="dropTargetKey = `${division.division}-${team.title}`"
            @dragleave="dropTargetKey = ''"
            @drop.prevent="onDrop($event, division.division, team)"
          >
            <div class="flex min-h-[86px] flex-col items-center justify-center bg-slate-950 px-3 py-3 text-center font-bold leading-snug text-white">
              <span class="text-sm">{{ team.title }}</span>
              <span v-if="team.subtitle" class="mt-1 text-[11px] font-semibold text-white/85">{{ team.subtitle }}</span>
            </div>
            <div class="grid grid-cols-[78px_1fr] border-b border-slate-300 bg-pink-50 font-semibold text-slate-700">
              <div class="border-r border-slate-300 px-2 py-2">{{ team.role }}</div>
              <div class="break-words px-2 py-2">{{ team.leader }}</div>
            </div>

            <div v-if="team.interns.length" class="divide-y divide-slate-200">
              <div
                v-for="intern in team.interns"
                :key="intern.id"
                draggable="true"
                class="grid cursor-grab grid-cols-[62px_1fr] items-stretch transition active:cursor-grabbing"
                :class="daysUntil(intern.endDate) <= 30 ? 'bg-yellow-100' : intern.type === 'PROFESSIONAL' ? 'bg-emerald-50' : 'bg-cyan-50'"
                @dragstart="onDragStart($event, intern)"
                @dragend="onDragEnd"
              >
                <div class="border-r border-slate-300 px-2 py-2 font-semibold leading-snug text-slate-700">{{ intern.position || '-' }}</div>
                <div class="px-2 py-2 leading-snug text-slate-800">
                  <p class="break-words font-semibold">{{ intern.name }}</p>
                  <p class="mt-1 text-[11px] text-slate-500">{{ intern.institution || '-' }} · {{ dateShort(intern.endDate) }}</p>
                  <p v-if="savingInternId === intern.id" class="mt-1 text-[10px] font-semibold text-navy">Menyimpan mapping...</p>
                </div>
              </div>
            </div>

            <div v-else class="bg-slate-50 px-3 py-6 text-center text-xs font-semibold text-slate-400">
              Belum ada peserta aktif
            </div>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>
