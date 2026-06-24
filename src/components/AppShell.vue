<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { api } from '../services/api';
import {
  countNotifications,
  notificationSeverityClass,
  notificationSeverityLabel,
  type AppNotification,
} from '../utils/notifications';

const nav = [
  ['/', 'Dashboard'],
  ['/interns', 'Peserta'],
  ['/costs', 'Cost'],
  ['/replacement', 'Pergantian'],
  ['/plans', 'Rencana'],
  ['/completion', 'Checklist'],
  ['/organization', 'Pemetaan'],
  ['/reports', 'Report'],
];

const notifications = ref<AppNotification[]>([]);
const notificationDrawerOpen = ref(false);
const notificationCount = computed(() => countNotifications(notifications.value));

onMounted(async () => {
  notifications.value = await api.notifications();
});
</script>

<template>
  <div class="min-h-screen min-w-0 bg-mist">
    <aside class="fixed inset-y-0 left-0 z-10 hidden w-64 border-r border-slate-200 bg-navy text-white lg:block">
      <div class="border-b border-white/10 p-6">
        <p class="text-sm uppercase tracking-wider text-white/60">HCM System</p>
        <h1 class="mt-2 text-xl font-semibold">Monitoring Internship</h1>
      </div>
      <nav class="space-y-1 p-4">
        <RouterLink
          v-for="[path, label] in nav"
          :key="path"
          :to="path"
          custom
          v-slot="{ href, navigate, isActive }"
        >
          <a
            :href="href"
            class="block rounded-md px-4 py-3 text-sm font-medium transition"
            :class="
              isActive
                ? 'bg-white text-navy shadow-sm'
                : 'text-white/75 hover:bg-white/10 hover:text-white'
            "
            @click="navigate"
          >
            {{ label }}
          </a>
        </RouterLink>
      </nav>
    </aside>

    <div class="min-w-0 lg:pl-64">
      <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div class="flex min-h-16 items-center justify-between gap-3 px-4 sm:gap-4 sm:px-5 lg:px-8">
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase text-success">Neuron HCM</p>
            <p class="truncate text-base font-semibold text-ink sm:text-lg">Internship Lifecycle Control</p>
          </div>
          <div class="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              class="relative h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-ink transition hover:border-navy/30 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy/15"
              aria-label="Buka notifikasi"
              @click="notificationDrawerOpen = true"
            >
              Notif
              <span
                v-if="notificationCount"
                class="absolute -right-2 -top-2 min-w-5 rounded-full bg-red-600 px-1.5 text-center text-xs font-bold leading-5 text-white"
              >
                {{ notificationCount > 99 ? '99+' : notificationCount }}
              </span>
            </button>
            <select class="control hidden w-36 sm:block">
              <option>HCM Staff</option>
              <option>HCM Leader</option>
            </select>
            <div class="h-9 w-9 shrink-0 rounded-full bg-success text-center text-sm font-bold leading-9 text-white">HC</div>
          </div>
        </div>
        <nav class="flex gap-2 overflow-x-auto border-t border-slate-100 px-3 py-2 sm:px-4 lg:hidden">
          <RouterLink
            v-for="[path, label] in nav"
            :key="path"
            :to="path"
          class="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-navy"
          active-class="bg-navy text-white hover:bg-navy hover:text-white"
        >
            {{ label }}
          </RouterLink>
        </nav>
      </header>
      <main class="min-w-0 p-4 sm:p-5 lg:p-8">
        <RouterView />
      </main>
    </div>

    <div
      v-if="notificationDrawerOpen"
      class="fixed inset-0 z-40 bg-slate-950/30"
      aria-hidden="true"
      @click="notificationDrawerOpen = false"
    ></div>
    <aside
      class="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] transform flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-200"
      :class="notificationDrawerOpen ? 'translate-x-0' : 'translate-x-full'"
      aria-label="Daftar notifikasi HCM"
    >
      <div class="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
        <div>
          <p class="text-xs font-semibold uppercase text-success">Notifikasi HCM</p>
          <h2 class="mt-1 text-lg font-semibold text-ink">{{ notificationCount }} notifikasi aktif</h2>
        </div>
        <button
          type="button"
          class="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy/15"
          @click="notificationDrawerOpen = false"
        >
          Tutup
        </button>
      </div>
      <div class="flex-1 space-y-3 overflow-y-auto p-5">
        <div v-if="!notificationCount" class="rounded-lg border border-dashed border-slate-200 p-6 text-center">
          <p class="text-sm font-semibold text-ink">Tidak ada notifikasi</p>
          <p class="mt-1 text-sm text-slate-500">Semua reminder lifecycle sedang aman.</p>
        </div>
        <div
          v-for="(item, index) in notifications"
          :key="`${item.type ?? 'notif'}-${item.title}-${index}`"
          class="rounded-lg border border-slate-200 p-4 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <p class="text-sm font-semibold leading-6 text-ink">{{ item.title }}</p>
            <span
              class="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1"
              :class="notificationSeverityClass(item.severity)"
            >
              {{ notificationSeverityLabel(item.severity) }}
            </span>
          </div>
          <p class="mt-2 text-sm leading-6 text-slate-600">{{ item.description ?? item.type ?? '-' }}</p>
        </div>
      </div>
    </aside>
  </div>
</template>
