<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const scanLinePosition = ref(0)
const activeStep = ref(0) // 0: scanning, 1: detecting, 2: redacting, 3: secured
let animationId: number | null = null

const animate = () => {
  scanLinePosition.value = (scanLinePosition.value + 0.3) % 100
  
  // Dynamic step updates based on scan position
  if (scanLinePosition.value < 25) activeStep.value = 0
  else if (scanLinePosition.value < 50) activeStep.value = 1
  else if (scanLinePosition.value < 75) activeStep.value = 2
  else activeStep.value = 3
  
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  animate()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})

const statementLines = [
  { label: 'Date', value: '14 APR 2026', pii: false },
  { label: 'Merchant', value: 'AMAZON.COM*MBR SHIP', pii: false },
  { label: 'Cardholder', value: 'BENJAMIN T. REYNOLDS', pii: true, type: 'NAME' },
  { label: 'Account', value: 'ENDING IN *4492', pii: true, type: 'ACCOUNT' },
  { label: 'Location', value: '128 BEACON ST, BOSTON', pii: true, type: 'ADDRESS' },
  { label: 'Amount', value: '-$14.99', pii: false },
]

const getStatusColor = (step: number) => {
  switch(step) {
    case 0: return 'text-blue-400'
    case 1: return 'text-yellow-400'
    case 2: return 'text-red-400'
    case 3: return 'text-emerald-400'
    default: return 'text-gray-400'
  }
}

const getStatusText = (step: number) => {
  switch(step) {
    case 0: return 'ANALYZING DOM'
    case 1: return 'PII DETECTED'
    case 2: return 'STRIPPING DATA'
    case 3: return 'CLEAN OUTPUT'
    default: return ''
  }
}
</script>

<template>
  <div class="relative w-full max-w-2xl mx-auto rounded-[3rem] border border-white/10 bg-[#080808] p-1 shadow-3xl overflow-hidden group">
    <!-- Inner Container with subtle texture -->
    <div class="relative rounded-[2.8rem] bg-black p-10 overflow-hidden">
      <!-- Background Grid -->
      <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 20px 20px;"></div>
      
      <!-- Top Bar -->
      <div class="relative z-10 flex items-center justify-between mb-12">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-[#0099FF]/10 border border-[#0099FF]/20 flex items-center justify-center">
            <svg class="w-6 h-6 text-[#0099FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h4 class="text-sm font-black text-white tracking-widest uppercase">Shield Protocol</h4>
            <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Status: <span :class="getStatusColor(activeStep)">{{ getStatusText(activeStep) }}</span></p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
            <div v-for="i in 4" :key="i" 
                 class="w-1.5 h-1.5 rounded-full transition-all duration-300"
                 :class="activeStep >= i-1 ? 'bg-[#0099FF] shadow-[0_0_8px_#0099FF]' : 'bg-white/10'">
            </div>
        </div>
      </div>

      <!-- Statement Content -->
      <div class="relative z-10 space-y-4">
        <div 
          v-for="(line, idx) in statementLines" 
          :key="idx"
          class="group/line relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-500"
          :class="[
            line.pii && scanLinePosition > (idx * 15) ? 'bg-[#0099FF]/5 border-[#0099FF]/20' : 'bg-white/[0.02] border-white/5',
            line.pii && scanLinePosition > (idx * 15 + 10) ? 'blur-[0.5px]' : ''
          ]"
        >
          <div class="flex flex-col">
            <span class="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">{{ line.label }}</span>
            <div class="relative">
              <span class="text-sm font-mono font-medium" :class="line.pii ? 'text-gray-300' : 'text-gray-400'">
                {{ line.value }}
              </span>
              
              <!-- Redaction Overlay -->
              <div 
                v-if="line.pii" 
                class="absolute inset-0 bg-black flex items-center transition-all duration-500"
                :style="{ clipPath: `inset(0 0 0 ${Math.max(0, Math.min(100, (scanLinePosition - idx*10) * 5))}%)` }"
              >
                <div class="flex gap-1">
                   <div v-for="b in 12" :key="b" class="w-2 h-4 bg-[#0099FF]/40 rounded-sm animate-pulse" :style="{ animationDelay: `${b*100}ms` }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Detection Tag -->
          <div v-if="line.pii" class="overflow-hidden">
            <div 
              class="px-3 py-1 rounded-lg bg-[#0099FF]/10 border border-[#0099FF]/30 text-[9px] font-black text-[#0099FF] transition-all duration-500"
              :class="scanLinePosition > (idx * 15) ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'"
            >
              {{ line.type }}
            </div>
          </div>
        </div>
      </div>

      <!-- Scanning Indicator -->
      <div 
        class="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0099FF] to-transparent z-20 pointer-events-none"
        :style="{ top: `${scanLinePosition}%`, boxShadow: '0 0 20px #0099FF' }"
      >
        <div class="absolute right-8 -top-6 px-2 py-0.5 bg-[#0099FF] text-white text-[8px] font-black rounded uppercase">Scanning</div>
      </div>

      <!-- Footer Stats -->
      <div class="mt-12 pt-8 border-t border-white/5 flex justify-between items-center relative z-10">
        <div class="flex gap-8">
           <div>
              <div class="text-xs font-black text-white">256-BIT</div>
              <div class="text-[9px] text-gray-600 font-bold uppercase">Encryption</div>
           </div>
           <div>
              <div class="text-xs font-black text-white">5ms</div>
              <div class="text-[9px] text-gray-600 font-bold uppercase">Latency</div>
           </div>
        </div>
        <div class="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
           <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
           <span class="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Secure</span>
        </div>
      </div>
      
      <!-- Ambient Glow -->
      <div class="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[#0099FF]/5 rounded-full blur-[120px] pointer-events-none"></div>
    </div>
  </div>
</template>

<style scoped>
.shadow-3xl {
  box-shadow: 0 0 80px -20px rgba(0, 153, 255, 0.2);
}

font-mono {
  font-family: 'Space Mono', monospace;
}
</style>
