<script setup lang="ts">
import { useRouter } from 'vue-router'
import LogoIcon from '@/components/layout/LogoIcon.vue'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-black text-white selection:bg-[#0000EE] selection:text-white pb-32">
    <!-- Navbar -->
    <nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div class="flex items-center gap-3">
        <LogoIcon class="w-8 h-8 drop-shadow-[0_0_8px_rgba(0,153,255,0.5)]" />
        <span class="font-heading font-extrabold text-xl tracking-wide">IntelliBank</span>
      </div>
      <div class="flex items-center gap-4">
        <button @click="router.push('/login')" class="text-sm font-medium text-gray-300 hover:text-white transition-colors">
          Log in
        </button>
        <button @click="router.push('/register')" class="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-heading font-semibold bg-white text-[#0000EE] hover:bg-gray-100 transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          <LogoIcon class="w-4 h-4" />
          Get Started
        </button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-40 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center text-center relative">
      <!-- Background Glow -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#0000EE]/20 to-[#0099FF]/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111] border border-[#333] mb-8 shadow-lg">
        <span class="w-2 h-2 rounded-full bg-[#0099FF] animate-pulse"></span>
        <span class="text-xs font-medium text-gray-300 uppercase tracking-widest">Powered by LLaMA 3</span>
      </div>
      
      <h1 class="text-5xl md:text-7xl font-heading font-extrabold tracking-tight leading-[1.1] mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 max-w-4xl">
        Unlock Financial Intelligence,<br />Completely Private.
      </h1>
      
      <p class="text-lg md:text-xl text-gray-400 max-w-2xl font-body leading-relaxed mb-12">
        A cutting-edge financial statement analyser that strips out personal data 
        <strong class="text-white font-semibold">locally</strong>, 
        giving you deep AI-driven insights without compromising your privacy.
      </p>

      <div class="flex flex-col sm:flex-row items-center gap-4">
        <button @click="router.push('/register')" class="px-8 py-4 rounded-full font-heading font-bold text-lg bg-white text-[#0000EE] hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center gap-3">
          Start for free
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </div>
      
      <div class="mt-8 text-sm text-gray-500 flex items-center gap-2">
        <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        No credit card required
      </div>
    </section>

    <!-- Visual Dashboard Preview / Stats -->
    <section class="max-w-6xl mx-auto px-4 mt-16 relative z-10">
      <div class="rounded-2xl border border-[#222] bg-[#0a0a0a] p-2 shadow-2xl overflow-hidden relative group">
        <!-- Abstract UI Mockup -->
        <div class="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a] z-10 pointer-events-none translate-y-20"></div>
        
        <div class="bg-[#111] border border-[#222] rounded-xl overflow-hidden flex flex-col h-[500px]">
          <!-- Mockup Header -->
          <div class="h-12 border-b border-[#222] flex items-center px-4 gap-2 bg-[#141414]">
            <div class="flex gap-1.5">
              <div class="w-3 h-3 rounded-full bg-[#333]"></div>
              <div class="w-3 h-3 rounded-full bg-[#333]"></div>
              <div class="w-3 h-3 rounded-full bg-[#333]"></div>
            </div>
          </div>
          
          <!-- Mockup Body -->
          <div class="flex-1 p-8 flex gap-8 opacity-80 group-hover:opacity-100 transition-opacity duration-1000">
            <!-- Sidebar -->
            <div class="w-48 hidden md:flex flex-col gap-4">
              <div class="h-8 bg-[#222] rounded w-full"></div>
              <div class="h-4 bg-[#222] rounded w-3/4"></div>
              <div class="h-4 bg-[#222] rounded w-5/6"></div>
              <div class="h-4 bg-[#222] rounded w-2/3"></div>
            </div>
            
            <!-- Main content -->
            <div class="flex-1 flex flex-col gap-6">
              <!-- KPI Cards -->
              <div class="grid grid-cols-3 gap-4">
                <div class="h-28 bg-[#1a1a1a] rounded-xl border border-[#222] p-4 flex flex-col justify-end">
                  <div class="h-3 bg-[#333] rounded w-1/3 mb-2"></div>
                  <div class="h-6 bg-[#444] rounded w-1/2"></div>
                </div>
                <div class="h-28 bg-[#1a1a1a] rounded-xl border border-[#222] p-4 flex flex-col justify-end">
                  <div class="h-3 bg-[#333] rounded w-1/3 mb-2"></div>
                  <div class="h-6 bg-[#444] rounded w-1/2"></div>
                </div>
                <div class="h-28 bg-[#1a1a1a] rounded-xl border border-[#222] p-4 flex flex-col justify-end shadow-[0_0_30px_rgba(0,153,255,0.1)] border-[#0099FF]/30">
                  <div class="h-3 bg-[#0099FF]/50 rounded w-1/3 mb-2"></div>
                  <div class="h-6 bg-[#0099FF]/80 rounded w-1/2"></div>
                </div>
              </div>
              
              <!-- Chart area -->
              <div class="flex-1 bg-[#1a1a1a] rounded-xl border border-[#222] p-6 relative overflow-hidden">
                <!-- Fake Chart bars -->
                <div class="absolute bottom-6 left-6 right-6 h-48 flex items-end gap-2 justify-between">
                  <div class="w-12 bg-gray-800 rounded-t-md h-[40%]"></div>
                  <div class="w-12 bg-[#0000EE] rounded-t-md h-[70%]"></div>
                  <div class="w-12 bg-gray-800 rounded-t-md h-[30%]"></div>
                  <div class="w-12 bg-[#0000EE] rounded-t-md h-[85%] relative">
                    <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0099FF] text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">AI Insight</div>
                    <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#0099FF]"></div>
                  </div>
                  <div class="w-12 bg-gray-800 rounded-t-md h-[50%]"></div>
                  <div class="w-12 bg-gray-800 rounded-t-md h-[60%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="max-w-7xl mx-auto px-4 py-32 grid md:grid-cols-3 gap-12 text-center md:text-left">
      <div>
        <div class="w-12 h-12 rounded-2xl bg-[#111] border border-[#333] flex items-center justify-center text-xl mb-6 mx-auto md:mx-0 shadow-lg">🛡️</div>
        <h3 class="font-heading font-bold text-2xl text-white mb-3 tracking-wide">Client-Side Redaction</h3>
        <p class="text-gray-400 leading-relaxed font-body">
          We use WebAssembly to identify and black out PII instances (names, account numbers) directly in your browser. Raw documents never touch our servers.
        </p>
      </div>
      <div>
        <div class="w-12 h-12 rounded-2xl bg-[#111] border border-[#333] flex items-center justify-center text-xl mb-6 mx-auto md:mx-0 shadow-lg">🧠</div>
        <h3 class="font-heading font-bold text-2xl text-white mb-3 tracking-wide">LLaMA 3 Intelligence</h3>
        <p class="text-gray-400 leading-relaxed font-body">
          Your anonymised transactions are parsed by state-of-the-art open source AI models. Discover spending habits, recurring fees, and anomalous charges.
        </p>
      </div>
      <div>
        <div class="w-12 h-12 rounded-2xl bg-[#111] border border-[#333] flex items-center justify-center text-xl mb-6 mx-auto md:mx-0 shadow-lg">📊</div>
        <h3 class="font-heading font-bold text-2xl text-white mb-3 tracking-wide">Visual Dashboards</h3>
        <p class="text-gray-400 leading-relaxed font-body">
          Instantly understand your financial health through beautiful, interactive charts. Stop staring at rows of data and start seeing the big picture.
        </p>
      </div>
    </section>
  </div>
</template>
