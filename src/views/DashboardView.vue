<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import StatCard from '../components/StatCard.vue';
import SimpleChart from '../components/SimpleChart.vue';
import { api } from '../services/api';
import { rupiah } from '../utils/format';

const dashboard = ref<any>(null);

onMounted(async () => {
  dashboard.value = await api.dashboard();
});
</script>

<template>
  <PageHeader title="Dashboard Utama" subtitle="Ringkasan aktif, rencana, selesai, risiko tim kosong, estimasi cost, dan notifikasi lifecycle." />

  <div v-if="dashboard" class="space-y-6">
    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total Aktif" :value="dashboard.summary.activeTotal" />
      <StatCard label="Instansi Aktif" :value="dashboard.summary.activeInstitution" tone="green" />
      <StatCard label="Profesional Aktif" :value="dashboard.summary.activeProfessional" />
      <StatCard label="Peserta Selesai" :value="dashboard.summary.completedTotal" />
      <StatCard label="Rencana Magang" :value="dashboard.summary.plannedTotal" />
      <StatCard label="Selesai 30 Hari" :value="dashboard.summary.endingIn30Days" tone="orange" />
      <StatCard label="Tim Berisiko" :value="dashboard.summary.riskyTeams" tone="red" />
      <StatCard label="Cost Bulan Ini" :value="rupiah(dashboard.summary.currentMonthCost)" tone="green" />
    </section>

    <section class="grid gap-4 xl:grid-cols-3">
      <SimpleChart title="Magang per Divisi" type="bar" :data="dashboard.charts.byDivision" value-format="count" />
      <SimpleChart title="Magang per Tipe" type="pie" :data="dashboard.charts.byType" value-format="count" />
      <SimpleChart title="Cost per Bulan" type="line" :data="dashboard.charts.monthlyCost" value-format="currency" />
    </section>

    <section class="panel p-5">
      <h3 class="mb-4 text-sm font-semibold text-ink">Notifikasi</h3>
      <div class="grid gap-3 md:grid-cols-2">
        <div v-for="item in dashboard.notifications" :key="item.title" class="rounded-md border border-slate-200 p-4">
          <p class="text-sm font-semibold text-ink">{{ item.title }}</p>
          <p class="mt-1 text-xs text-slate-500">{{ item.description ?? item.type }}</p>
        </div>
      </div>
    </section>
  </div>
</template>
