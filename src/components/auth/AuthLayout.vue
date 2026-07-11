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
        <!-- Left Section (Illustration) -->
        <section class="relative hidden overflow-hidden bg-[#0f172a] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div class="relative z-10">
            <div class="inline-flex items-center gap-2 font-bold text-white text-xl">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">N</span>
              Neuron HCM
            </div>
          </div>
          
          <div class="relative z-10 mt-12 flex-1 flex flex-col items-center justify-center text-center">
            <h1 class="text-4xl font-extrabold leading-[1.3] tracking-tight text-white mb-8">
              Manage Internships<br/>Like A Pro.<br/>From Anywhere.
            </h1>
            <img src="/login-illustration-dark.png" alt="3D Illustration" class="w-full max-w-[400px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
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
