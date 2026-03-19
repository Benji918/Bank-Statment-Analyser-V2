<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LogoIcon from '@/components/layout/LogoIcon.vue'

const isLoaded = ref(false)
onMounted(() => {
  isLoaded.value = true
})

// Data points for the animation (positioning adjusted for larger scale)
const nodes = [
  { label: 'Statements', color: 'bg-blue-500', pos: { top: '5%', left: '0%' } },
  { label: 'PDFrest Scrub', color: 'bg-emerald-500', pos: { top: '25%', right: '5%' } },
  { label: 'Secure AI', color: 'bg-[#0099FF]', pos: { bottom: '20%', left: '10%' } },
  { label: 'Insights', color: 'bg-white', pos: { bottom: '10%', right: '0%' } }
]
</script>

<template>
  <div class="relative w-full h-[600px] flex items-center justify-center p-12 overflow-visible">
    <!-- Center Orb (Bigger) -->
    <div class="relative w-80 h-80 flex items-center justify-center">
      <!-- Glows -->
      <div class="absolute inset-0 bg-[#0099FF]/15 rounded-full blur-[100px] animate-pulse"></div>
      <div class="absolute inset-0 bg-blue-600/5 rounded-full blur-[140px] delay-700"></div>
      
      <!-- Outer Rotating Rings -->
      <div class="absolute inset-0 border-2 border-[#0099FF]/20 rounded-full animate-[spin_12s_linear_infinite]">
         <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#0099FF] rounded-full shadow-[0_0_20px_#0099FF] flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-full animate-ping"></div>
         </div>
      </div>
      
      <div class="absolute inset-8 border border-white/5 rounded-full animate-[spin_20s_linear_infinite_reverse]">
         <div class="absolute -bottom-2 left-1/4 w-3 h-3 bg-white/30 rounded-full blur-sm"></div>
      </div>

      <div class="absolute inset-16 border border-[#0099FF]/10 rounded-full animate-[spin_8s_linear_infinite]">
         <div class="absolute top-1/2 -right-1.5 w-2 h-2 bg-[#0099FF]/40 rounded-full"></div>
      </div>
      
      <!-- Core Icon (LogoIcon) -->
      <div class="relative z-20 w-32 h-32 transform transition-all duration-700 hover:scale-110">
         <!-- Ambient lighting behind the logo -->
         <div class="absolute inset-0 bg-[#0099FF]/10 rounded-full blur-2xl"></div>
         
         <div class="relative w-full h-full bg-[#050505] border border-white/10 rounded-[3rem] p-6 shadow-2xl flex items-center justify-center">
            <LogoIcon />
         </div>
         
         <!-- Status Indicators -->
         <div class="absolute -top-4 -right-4 px-3 py-1 rounded-full bg-[#0099FF] text-white text-[8px] font-black uppercase tracking-widest shadow-lg animate-bounce">
            Active
         </div>
      </div>
    </div>

    <!-- Floating Cards (More spread out) -->
    <div 
      v-for="(node, idx) in nodes" 
      :key="idx"
      class="absolute p-5 rounded-2xl bg-[#080808] border border-white/10 shadow-3xl transition-all duration-1000 flex items-center gap-4 backdrop-blur-xl group hover:border-[#0099FF]/40"
      :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'"
      :style="{ ...node.pos, transitionDelay: `${idx * 150}ms` }"
    >
      <div class="relative">
        <div :class="['w-3 h-3 rounded-full', node.color]"></div>
        <div :class="['absolute inset-0 rounded-full animate-ping opacity-40', node.color]"></div>
      </div>
      <span class="text-xs font-black uppercase text-gray-400 tracking-[0.2em]">{{ node.label }}</span>
      
      <!-- Subtle particle effect on hover -->
      <div class="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden rounded-2xl">
         <div class="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
      </div>
    </div>

    <!-- Enhanced Connecting Rays -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-10">
      <defs>
         <linearGradient id="rayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stop-color="#0099FF" />
            <stop offset="1" stop-color="transparent" />
         </linearGradient>
      </defs>
      <line x1="15%" y1="15%" x2="50%" y2="50%" stroke="url(#rayGradient)" stroke-width="1" stroke-dasharray="10 10" />
      <line x1="85%" y1="30%" x2="50%" y2="50%" stroke="url(#rayGradient)" stroke-width="1" stroke-dasharray="10 10" />
      <line x1="20%" y1="75%" x2="50%" y2="50%" stroke="url(#rayGradient)" stroke-width="1" stroke-dasharray="10 10" />
      <line x1="90%" y1="85%" x2="50%" y2="50%" stroke="url(#rayGradient)" stroke-width="1" stroke-dasharray="10 10" />
    </svg>
  </div>
</template>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.shadow-3xl {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}
</style>
