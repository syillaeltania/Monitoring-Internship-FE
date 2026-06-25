<script setup lang="ts">
defineProps<{ title: string; subtitle: string }>();
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] px-4 py-8 font-['DM_Sans'] text-[#111827] sm:px-6 lg:px-8">
    <div class="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl overflow-hidden rounded-[24px] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.10)] lg:grid-cols-[1fr_520px]">
      <section class="hidden bg-[#0D1429] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p class="text-lg font-semibold">Neuron HCM</p>
          <h1 class="mt-6 max-w-md text-4xl font-bold leading-tight tracking-[-0.02em]">Monitoring Internship</h1>
          <p class="mt-4 max-w-md text-sm leading-6 text-white/70">
            Manage internship lifecycle, placement, cost, and progress in one workspace.
          </p>
        </div>
        <div class="grid grid-cols-3 gap-3 opacity-80">
          <span class="h-20 rounded-2xl border border-white/10"></span>
          <span class="h-20 rounded-full border border-white/10"></span>
          <span class="h-20 rounded-2xl border border-white/10 bg-white/5"></span>
        </div>
      </section>

      <main class="flex items-center justify-center p-6 sm:p-10">
        <div class="w-full max-w-[460px]">
          <div class="mb-8 lg:hidden">
            <p class="text-lg font-semibold text-[#0D1429]">Neuron HCM</p>
            <p class="mt-1 text-sm text-[#6B7280]">Monitoring Internship</p>
          </div>
          <h2 class="text-3xl font-bold tracking-[-0.02em] text-[#111827]">{{ title }}</h2>
          <p class="mt-2 text-sm leading-6 text-[#6B7280]">{{ subtitle }}</p>
          <div class="mt-8">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
