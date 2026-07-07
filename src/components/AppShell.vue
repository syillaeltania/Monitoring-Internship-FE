<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../services/api';
import { useAuthStore } from '../stores/auth';
import {
  countNotifications,
  notificationSeverityClass,
  notificationSeverityLabel,
  type AppNotification,
} from '../utils/notifications';

const navSections = [
  {
    label: 'Overview',
    items: [
      ['/', 'Dashboard'],
      ['/reports', 'Report'],
    ],
  },
  {
    label: 'Monitoring',
    items: [
      ['/interns', 'Peserta'],
      ['/costs', 'Cost'],
      ['/replacement', 'Pergantian'],
      ['/plans', 'Rencana'],
      ['/profiling-qa', 'Profiling QA'],
      ['/completion', 'Checklist'],
      ['/organization', 'Pemetaan'],
    ],
  },
];

const nav = navSections.flatMap((section) => section.items);

const navIconPath: Record<string, string> = {
  '/': 'M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z',
  '/reports': 'M5 3h14v18H5V3Zm4 5h6M9 12h6M9 16h3',
  '/interns': 'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm-11 9a7 7 0 0 1 14 0',
  '/costs': 'M12 3v18M17 7.5c0-1.4-1.8-2.5-4-2.5s-4 1.1-4 2.5 1.8 2.5 4 2.5 4 1.1 4 2.5-1.8 2.5-4 2.5-4-1.1-4-2.5',
  '/replacement': 'M7 7h10M7 12h10M7 17h6M4 4h16v16H4V4Z',
  '/plans': 'M7 3v4M17 3v4M4 8h16M6 12h4M6 16h7M5 5h14v16H5V5Z',
  '/profiling-qa': 'M12 2l-5.5 3v6.5c0 4.5 2.5 8.5 5.5 10.5 3-2 5.5-6 5.5-10.5V5L12 2zm-1 13.5l-3-3 1.4-1.4 1.6 1.6 3.6-3.6 1.4 1.4-5 5z',
  '/completion': 'M5 12l4 4L19 6M4 4h16v16H4V4Z',
  '/organization': 'M12 4v4M6 12h12M6 12v6M18 12v6M12 8v4M4 18h4M10 18h4M16 18h4',
};

const notifications = ref<AppNotification[]>([]);
const notificationDrawerOpen = ref(false);
const auth = useAuthStore();
const router = useRouter();

const notificationCount = computed(() =>
  countNotifications(notifications.value),
);

onMounted(async () => {
  notifications.value = await api.notifications();
});

async function signOut() {
  await auth.signOut();
  router.replace('/sign-in');
}
</script>

<template>
  <div class="min-h-screen min-w-0 bg-[#0D1429] p-2 sm:p-3 lg:p-4">
    <div
      class="flex min-h-[calc(100vh-32px)] flex-col gap-4 sm:min-h-[calc(100vh-48px)] sm:gap-6 lg:min-h-[calc(100vh-64px)] lg:flex-row lg:gap-6"
    >
      <!-- Sidebar: flat, no floating card treatment -->
      <aside
        class="hidden w-[260px] shrink-0 bg-[#0D1429] text-white lg:block"
      >
        <div class="border-b border-white/10 px-3 py-6">
          <p class="text-xs uppercase tracking-[0.18em] text-white/55">
            HCM System
          </p>
          <h1 class="mt-3 text-xl font-semibold leading-snug">
            Monitoring Internship
          </h1>
        </div>

        <nav class="space-y-6 py-5">
          <section
            v-for="section in navSections"
            :key="section.label"
          >
            <p
              class="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40"
            >
              {{ section.label }}
            </p>

            <div class="space-y-1">
              <RouterLink
                v-for="[path, label] in section.items"
                :key="path"
                :to="path"
                custom
                v-slot="{ href, navigate, isActive }"
              >
                <a
                  :href="href"
                  class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition duration-200"
                  :class="
                    isActive
                      ? 'bg-[#3158E8]/18 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  "
                  @click="navigate"
                >
                  <svg
                    class="h-4 w-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path :d="navIconPath[path]" />
                  </svg>

                  <span>{{ label }}</span>
                </a>
              </RouterLink>
            </div>
          </section>
        </nav>
      </aside>

      <!-- Main content: floating workspace -->
      <div
        class="flex min-w-0 flex-1 flex-col rounded-[28px] bg-[#FBF8F1] px-4 py-5 shadow-[0_12px_32px_rgba(16,22,42,0.10)] sm:px-6 sm:py-6 lg:px-8 lg:py-8"
      >
        <!-- Header: integrated, not a separate card -->
        <header
          class="flex min-h-16 items-center justify-between gap-3 border-b border-[#D6CEC3] pb-5 sm:gap-4"
        >
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase text-[#61B982]">
              Neuron HCM
            </p>
            <p class="truncate text-base font-semibold text-ink sm:text-xl">
              Internship Lifecycle Control
            </p>
          </div>

          <div class="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              class="relative h-10 rounded-full border border-[#D6CEC3] bg-[#FBF8F1] px-3 text-sm font-semibold text-ink transition hover:border-[#3158E8]/35 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#3158E8]/15"
              aria-label="Buka notifikasi"
              @click="notificationDrawerOpen = true"
            >
              Notif

              <span
                v-if="notificationCount"
                class="absolute -right-2 -top-2 min-w-5 rounded-full bg-[#FF684F] px-1.5 text-center text-xs font-bold leading-5 text-white"
              >
                {{ notificationCount > 99 ? '99+' : notificationCount }}
              </span>
            </button>

            <select class="control hidden w-36 sm:block">
              <option>{{ auth.displayRole }}</option>
            </select>

            <div
              class="h-10 w-10 shrink-0 rounded-full bg-[#8CE0AE] text-center text-sm font-bold leading-10 text-[#10162A]"
              :title="auth.displayName"
            >
              HC
            </div>
            <button class="action-secondary hidden px-3 py-2 text-xs sm:inline-flex" type="button" @click="signOut">
              Sign Out
            </button>
          </div>
        </header>

        <!-- Mobile navigation -->
        <nav
          class="my-4 flex gap-2 overflow-x-auto border-b border-[#D6CEC3] pb-4 lg:hidden"
        >
          <RouterLink
            v-for="[path, label] in nav"
            :key="path"
            :to="path"
            class="shrink-0 rounded-xl px-3 py-2 text-sm font-semibold text-[#77736F] transition hover:bg-[#F5F0E7] hover:text-ink"
            active-class="bg-[#0D1429] text-white hover:bg-[#0D1429] hover:text-white"
          >
            {{ label }}
          </RouterLink>
        </nav>

        <!-- Existing page content -->
        <main class="min-w-0 flex-1 pt-5 sm:pt-6">
          <RouterView />
        </main>
      </div>
    </div>
  </div>

  <!-- Notification overlay -->
  <div
    v-if="notificationDrawerOpen"
    class="fixed inset-0 z-40 bg-[#0D1429]/55"
    aria-hidden="true"
    @click="notificationDrawerOpen = false"
  ></div>

  <!-- Notification drawer -->
  <aside
    class="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] transform flex-col rounded-l-3xl border-l border-[#D6CEC3] bg-[#FBF8F1] shadow-panel transition-transform duration-200"
    :class="notificationDrawerOpen ? 'translate-x-0' : 'translate-x-full'"
    aria-label="Daftar notifikasi HCM"
  >
    <div class="flex items-start justify-between gap-4 border-b border-[#D6CEC3] p-5">
      <div>
        <p class="text-xs font-semibold uppercase text-[#61B982]">
          Notifikasi HCM
        </p>
        <h2 class="mt-1 text-lg font-semibold text-ink">
          {{ notificationCount }} notifikasi aktif
        </h2>
      </div>

      <button
        type="button"
        class="action-secondary px-3 py-2"
        @click="notificationDrawerOpen = false"
      >
        Tutup
      </button>
    </div>

    <div class="flex-1 space-y-3 overflow-y-auto p-5">
      <div
        v-if="!notificationCount"
        class="rounded-lg border border-dashed border-slate-200 p-6 text-center"
      >
        <p class="text-sm font-semibold text-ink">Tidak ada notifikasi</p>
        <p class="mt-1 text-sm text-slate-500">
          Semua reminder lifecycle sedang aman.
        </p>
      </div>

      <div
        v-for="(item, index) in notifications"
        :key="`${item.type ?? 'notif'}-${item.title}-${index}`"
        class="rounded-lg border border-slate-200 p-4 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm font-semibold leading-6 text-ink">
            {{ item.title }}
          </p>

          <span
            class="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1"
            :class="notificationSeverityClass(item.severity)"
          >
            {{ notificationSeverityLabel(item.severity) }}
          </span>
        </div>

        <p class="mt-2 text-sm leading-6 text-slate-600">
          {{ item.description ?? item.type ?? '-' }}
        </p>
      </div>
    </div>
  </aside>
</template>
