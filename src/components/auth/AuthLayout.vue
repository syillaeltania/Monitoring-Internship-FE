<script setup lang="ts">
defineProps<{ title: string; subtitle: string }>();
</script>

<template>
  <div class="relative min-h-screen w-full overflow-hidden bg-[#0f172a] font-['DM_Sans'] text-slate-900">
    <!-- Animated Background Elements -->
    <div class="absolute -left-[10%] top-[-10%] h-[500px] w-[500px] animate-pulse rounded-full bg-blue-600/30 blur-[120px] duration-1000"></div>
    <div class="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] animate-pulse rounded-full bg-indigo-500/20 blur-[150px] delay-700 duration-1000"></div>
    <div class="absolute left-[40%] top-[20%] h-[400px] w-[400px] animate-pulse rounded-full bg-purple-500/20 blur-[100px] delay-1000 duration-1000"></div>

    <!-- Main Container -->
    <div class="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
      <div class="w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl lg:grid lg:grid-cols-[1.2fr_1fr]">
        
        <!-- Left Section (Premium Dark/Gradient) -->
        <section class="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <!-- Inner Decorative Gradient -->
          <div class="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-900/40 to-slate-950"></div>
          <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

          <div class="relative z-10">
            <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md">
              <span class="h-2 w-2 rounded-full bg-blue-400"></span>
              <span class="text-xs font-semibold tracking-wide text-blue-100">Neuron HCM</span>
            </div>
            
            <h1 class="mt-8 text-5xl font-extrabold leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              Monitoring<br />Internship
            </h1>
            <p class="mt-6 max-w-md text-lg leading-relaxed text-slate-300">
              Manage internship lifecycle, placement, cost, and progress in one unified, intelligent workspace.
            </p>
          </div>

          <!-- Glassmorphism Cards Decor -->
          <div class="relative z-10 mt-12 grid grid-cols-2 gap-4">
            <div class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg transition-all hover:bg-white/10">
              <div class="mb-4 h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <p class="text-2xl font-bold text-white group-hover:scale-105 transition-transform">98%</p>
              <p class="mt-1 text-xs font-medium text-slate-400">Placement Success</p>
            </div>
            <div class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg transition-all hover:bg-white/10">
              <div class="mb-4 h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <svg class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <p class="text-2xl font-bold text-white group-hover:scale-105 transition-transform">500+</p>
              <p class="mt-1 text-xs font-medium text-slate-400">Active Interns</p>
            </div>
          </div>
        </section>

        <!-- Right Section (Form) -->
        <main class="flex flex-col justify-center bg-white p-8 sm:p-12 lg:p-16">
          <div class="w-full max-w-[420px] mx-auto">
            <div class="mb-10 lg:hidden">
              <div class="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1">
                <span class="h-2 w-2 rounded-full bg-blue-600"></span>
                <span class="text-xs font-bold tracking-wide text-blue-700">Neuron HCM</span>
              </div>
              <p class="mt-4 text-2xl font-bold text-slate-900">Monitoring Internship</p>
            </div>
            
            <h2 class="text-3xl font-bold tracking-tight text-slate-900">{{ title }}</h2>
            <p class="mt-3 text-sm leading-relaxed text-slate-500">{{ subtitle }}</p>
            
            <div class="mt-10">
              <slot />
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
