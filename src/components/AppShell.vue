<script setup lang="ts">
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
  </div>
</template>
