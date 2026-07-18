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
      <StatCard label="Total Aktif" :value="dashboard.summary.activeTotal" to="/interns" />
      <StatCard label="Instansi Aktif" :value="dashboard.summary.activeInstitution" tone="green" to="/interns" />
      <StatCard label="Profesional Aktif" :value="dashboard.summary.activeProfessional" tone="indigo" to="/interns" />
      <StatCard label="Peserta Selesai" :value="dashboard.summary.completedTotal" tone="slate" to="/completion" />
      <StatCard label="Rencana Magang" :value="dashboard.summary.plannedTotal" tone="cyan" to="/plans" />
      <StatCard label="Selesai 30 Hari" :value="dashboard.summary.endingIn30Days" tone="orange" to="/replacement" />
      <StatCard label="Tim Berisiko" :value="dashboard.summary.riskyTeams" tone="red" to="/replacement" />
      <StatCard label="Cost Bulan Ini" :value="rupiah(dashboard.summary.currentMonthCost)" tone="green" to="/costs" />
    </section>

    <section class="grid gap-4 xl:grid-cols-3">
      <SimpleChart title="Magang per Divisi" type="bar" :data="dashboard.charts.byDivision" value-format="count" tone="green" />
      <SimpleChart title="Magang per Tipe" type="pie" :data="dashboard.charts.byType" value-format="count" tone="indigo" />
      <SimpleChart title="Cost per Bulan" type="line" :data="dashboard.charts.monthlyCost" value-format="currency" tone="cyan" />
    </section>
  </div>
</template>
