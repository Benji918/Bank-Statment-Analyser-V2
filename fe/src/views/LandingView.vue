<script setup lang="ts">
import { useRouter } from 'vue-router'
import LogoIcon from '@/components/layout/LogoIcon.vue'
import RedactionIllustration from '@/components/redaction/RedactionIllustration.vue'
import InsightIllustration from '@/components/insights/InsightIllustration.vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([PieChart, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer])

const router = useRouter()

// Mock data for the charts (Sleeker colors)
const categoryOption = {
  backgroundColor: 'transparent',
  tooltip: { trigger: 'item', textStyle: { fontFamily: 'Outfit' } },
  series: [
    {
      name: 'Spending',
      type: 'pie',
      radius: ['60%', '80%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 15,
        borderColor: '#050505',
        borderWidth: 4
      },
      label: { show: false },
      data: [
        { value: 1048, name: 'Housing', itemStyle: { color: '#0055FF' } },
        { value: 735, name: 'Food', itemStyle: { color: '#0088FF' } },
        { value: 580, name: 'Transport', itemStyle: { color: '#00AAFF' } },
        { value: 484, name: 'Savings/Invest', itemStyle: { color: '#00CCFF' } },
        { value: 300, name: 'Lifestyle', itemStyle: { color: '#66EEFF' } }
      ]
    }
  ]
}

const cashflowOption = {
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis', textStyle: { fontFamily: 'Outfit' } },
  grid: { left: '5%', right: '5%', bottom: '5%', containLabel: true },
  xAxis: {
    type: 'category',
    data: ['JAN', 'FEB', 'MAR', 'APR', 'MAY'],
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#555', fontSize: 10, fontWeight: 700, margin: 15 }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#111' } },
    axisLabel: { show: false }
  },
  series: [
    {
      name: 'Clean Income',
      type: 'bar',
      barWidth: '40%',
      data: [4200, 4500, 4100, 4800, 4600],
      itemStyle: { 
        color: '#0099FF', 
        borderRadius: [8, 8, 0, 0],
        shadowBlur: 20,
        shadowColor: 'rgba(0,153,255,0.2)'
      }
    },
    {
      name: 'Expenses',
      type: 'bar',
      barWidth: '40%',
      data: [3100, 2800, 3500, 2900, 3200],
      itemStyle: { color: '#111', borderRadius: [8, 8, 0, 0], borderColor: '#222', borderWidth: 1 }
    }
  ]
}
</script>

<template>
  <div class="min-h-screen bg-black text-white font-primary selection:bg-[#0099FF] selection:text-white pb-20 overflow-x-hidden">
    <!-- Navigation Overlay -->
    <nav class="fixed top-0 left-0 right-0 z-[100] px-8 py-6 flex items-center justify-between border-b border-white/[0.03] bg-black/50 backdrop-blur-xl">
      <div class="flex items-center gap-4 group cursor-pointer" @click="router.push('/')">
        <div class="w-10 h-10 p-2.5 bg-[#0a0a0a] border border-white/10 rounded-2xl flex items-center justify-center group-hover:border-[#0099FF]/50 transition-all duration-500 shadow-2xl">
          <LogoIcon />
        </div>
        <span class="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">IntelliBank</span>
      </div>
      
      <div class="flex items-center gap-4">
        <button @click="router.push('/login')" class="px-5 py-2 text-sm font-bold text-gray-500 hover:text-white transition-all">
          LOG IN
        </button>
        <button @click="router.push('/register')" class="group relative px-6 py-2.5 rounded-2xl text-xs font-black tracking-widest bg-white text-black hover:bg-[#0099FF] hover:text-white transition-all duration-300 shadow-xl shadow-blue-600/10 overflow-hidden">
          <span class="relative z-10">GET STARTED</span>
          <div class="absolute inset-0 bg-[#0099FF] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-32 pb-40 px-6 overflow-hidden">
      <!-- Ambient Lighting -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[700px] bg-[#0055FF]/10 rounded-full blur-[180px] pointer-events-none opacity-40"></div>
      <div class="absolute -bottom-1/4 -right-1/4 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[160px] pointer-events-none"></div>

      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center relative z-10 px-6">
        <!-- Text Content -->
        <div class="lg:col-span-7 flex flex-col items-start text-left">
          <!-- Badge -->
          <div class="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-8 backdrop-blur-md shadow-2xl transform hover:scale-105 transition-transform cursor-pointer">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0099FF] opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0099FF]"></span>
            </span>
            <span class="text-[11px] font-black text-[#0099FF] uppercase tracking-[0.25em]">S-Tier Financial Intelligence</span>
          </div>

          <h1 class="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10">
            AI INSIGHTS WITHOUT <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#0099FF] via-white to-gray-500 uppercase italic">Sacrificing Trust.</span>
          </h1>

          <p class="text-xl text-gray-400 max-w-2xl font-medium leading-relaxed mb-12 opacity-80">
            We utilize <span class="text-white font-bold">PDFrest technology</span> to scrub your statements before analysis. Your sensitive data is redacted to ensure your identity remains 100% private and secure.
          </p>

          <div class="flex flex-col sm:flex-row items-center gap-8">
            <button @click="router.push('/register')" class="group px-12 py-5 rounded-[2.5rem] font-black text-xl bg-white text-black hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-[0_30px_60px_-20px_rgba(255,255,255,0.15)] flex items-center gap-4 relative overflow-hidden">
               <span class="relative z-10 uppercase tracking-widest text-xs">Analyze FOR FREE</span>
               <svg class="w-4 h-4 relative z-10 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </div>

        <!-- Animation/Illustration -->
        <div class="lg:col-span-5 hidden lg:block">
           <InsightIllustration />
        </div>
      </div>
    </section>

    <!-- Interactive Redaction Demo -->
    <section class="py-40 px-6 max-w-7xl mx-auto border-y border-white/[0.03] bg-gradient-to-b from-transparent via-blue-950/5 to-transparent">
       <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div class="inline-block px-4 py-1.5 rounded-full bg-[#0099FF]/10 text-[#0099FF] text-[10px] font-black tracking-widest uppercase mb-8">THE SHIELD ENGINE</div>
            <h2 class="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">Your data, <br /><span class="text-gray-600">anonymized in real-time.</span></h2>
            <p class="text-gray-400 text-xl leading-relaxed mb-12">
               Our system leverages <span class="text-white font-bold">PDFrest redaction technology</span> to scrub sensitive data before your statements are ever analyzed. By identifying PII (Personally Identifiable Information) early, we ensure that only secure, anonymized data reaches our analysis pipeline.
            </p>
            <ul class="space-y-6">
               <li v-for="item in ['Names & Account Numbers', 'Addresses & Locations', 'Transaction IDs & Contact Info']" :key="item" class="flex items-center gap-4 group">
                  <div class="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#0099FF] group-hover:scale-125 transition-all">
                     <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span class="text-lg font-bold text-gray-300">{{ item }}</span>
               </li>
            </ul>
          </div>
          <div>
             <RedactionIllustration />
          </div>
       </div>
    </section>

    <!-- Insights Showcase -->
    <section class="py-40 px-6 max-w-7xl mx-auto">
      <div class="text-center mb-32">
        <h2 class="text-5xl md:text-7xl font-black mb-8 tracking-tighter">Beyond basic numbers.</h2>
        <p class="text-gray-400 text-xl max-w-3xl mx-auto font-medium">We transform redacted transactions into clean, structured intelligence via our secure analysis pipeline.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <!-- Card 1 -->
        <div class="lg:col-span-12 p-12 bg-white/[0.02] border border-white/5 rounded-[4rem] group hover:border-[#0099FF]/40 transition-all duration-700 relative overflow-hidden backdrop-blur-sm">
           <div class="absolute -top-40 -right-40 w-96 h-96 bg-[#0099FF]/10 rounded-full blur-[100px] pointer-events-none"></div>
           <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                 <h3 class="text-4xl font-black mb-6">Smart Flow Discovery</h3>
                 <p class="text-gray-400 text-lg leading-relaxed mb-10 italic">"Identify recurring subscriptions, unexpected fees, and optimize your monthly burn rate without exposing your identity."</p>
                 <div class="flex gap-4">
                    <div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex-1">
                       <div class="text-[#0099FF] text-2xl font-black mb-1">98%</div>
                       <div class="text-[10px] text-gray-500 uppercase font-black">AI Tag Accuracy</div>
                    </div>
                    <!-- <div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex-1">
                       <div class="text-[#0099FF] text-2xl font-black mb-1">0ms</div>
                       <div class="text-[10px] text-gray-500 uppercase font-black">Local Storage</div>
                    </div> -->
                 </div>
              </div>
              <div class="h-[350px]">
                 <VChart :option="cashflowOption" autoresize />
              </div>
           </div>
        </div>

        <!-- Card 2 -->
        <div class="lg:col-span-5 p-10 bg-white/[0.02] border border-white/5 rounded-[4rem] group hover:border-[#0099FF]/40 transition-all duration-700 relative overflow-hidden">
           <div class="relative z-10 flex flex-col h-full">
              <h3 class="text-3xl font-black mb-8">Spending DNA</h3>
              <div class="h-[300px] w-full">
                 <VChart :option="categoryOption" autoresize />
              </div>
              <div class="mt-10 flex gap-3 flex-wrap">
                 <span class="px-5 py-2 bg-[#0099FF]/10 text-[#0099FF] rounded-2xl text-[10px] font-black uppercase tracking-widest">Fixed Costs</span>
                 <span class="px-5 py-2 bg-white/5 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5">Discretionary</span>
              </div>
           </div>
        </div>

        <!-- Card 3 -->
        <div class="lg:col-span-7 p-10 bg-[#0099FF] rounded-[4rem] text-black relative flex items-center justify-center overflow-hidden">
           <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
           <div class="relative z-10 text-center">
              <h3 class="text-4xl md:text-5xl font-black mb-6 tracking-tight">The PDFrest <br /> Advantage.</h3>
              <p class="text-black/70 text-lg font-bold max-w-md mx-auto mb-10">We leverage industry-leading redaction tools to ensure your privacy is never compromised during the analysis process.</p>
              <button @click="router.push('/register')" class="px-10 py-4 bg-black text-white rounded-full font-black text-lg hover:scale-110 active:scale-95 transition-all">
                Try Prototype
              </button>
           </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <!-- <section class="py-60 px-6 text-center">
      <div class="max-w-5xl mx-auto p-20 bg-white/[0.02] border border-white/10 rounded-[5rem] shadow-2xl relative overflow-hidden backdrop-blur-3xl group">
        <div class="absolute inset-0 bg-gradient-to-br from-[#0099FF]/5 via-transparent to-transparent opacity-50"></div>
        <h2 class="text-6xl md:text-8xl font-black mb-12 tracking-tighter leading-tight relative z-10">
          Clarity. Privacy. <br />
          <span class="text-[#0099FF]">Everything.</span>
        </h2>
        <button @click="router.push('/register')" class="bg-white text-black px-16 py-7 rounded-[2.5rem] font-black text-3xl hover:bg-[#0099FF] hover:text-white hover:scale-110 active:scale-95 transition-all duration-500 shadow-2xl relative z-10">
           BUILD YOUR PROFILE
        </button>
        <div class="mt-12 text-[10px] text-gray-600 uppercase tracking-[0.4em] font-black relative z-10">Verified S-Tier Redaction Engine • 2026 Edition</div>
      </div>
    </section> -->


  </div>
</template>

<style scoped>
/* Use the Outfit font imported in index.html */
div, span, h1, h2, h3, h4, p, button, a {
  font-family: 'Outfit', sans-serif;
}

.tracking-tighter {
  letter-spacing: -0.05em;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.float-animation {
  animation: float 6s ease-in-out infinite;
}
</style>

