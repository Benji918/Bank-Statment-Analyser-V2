<script setup lang="ts">
import { useRouter } from 'vue-router'
import LogoIcon from '@/components/layout/LogoIcon.vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([PieChart, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer])

const router = useRouter()

// Mock chart data for landing page visuals
const categoryOption = {
  backgroundColor: 'transparent',
  tooltip: { trigger: 'item' },
  series: [
    {
      name: 'Spending',
      type: 'pie',
      radius: ['60%', '85%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#000',
        borderWidth: 2
      },
      label: { show: false },
      data: [
        { value: 1048, name: 'Housing', itemStyle: { color: '#0000EE' } },
        { value: 735, name: 'Food', itemStyle: { color: '#0099FF' } },
        { value: 580, name: 'Transport', itemStyle: { color: '#33BBFF' } },
        { value: 484, name: 'Savings', itemStyle: { color: '#66CCFF' } },
        { value: 300, name: 'Other', itemStyle: { color: '#99DDFF' } }
      ]
    }
  ]
}

const cashflowOption = {
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    axisLine: { lineStyle: { color: '#333' } }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#222' } },
    axisLabel: { show: false }
  },
  series: [
    {
      name: 'Income',
      type: 'bar',
      data: [4200, 4500, 4100, 4800, 4600],
      itemStyle: { color: '#0099FF', borderRadius: [4, 4, 0, 0] }
    },
    {
      name: 'Expenses',
      type: 'bar',
      data: [3100, 2800, 3500, 2900, 3200],
      itemStyle: { color: '#0000EE', borderRadius: [4, 4, 0, 0] }
    }
  ]
}
</script>

<template>
  <div class="min-h-screen bg-black text-white selection:bg-[#0099FF] selection:text-white pb-20 overflow-x-hidden">
    <!-- Navbar -->
    <nav class="fixed top-0 left-0 right-0 z-50 px-8 py-5 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-2xl">
      <div class="flex items-center gap-3 group cursor-pointer" @click="router.push('/')">
        <div class="w-10 h-10 p-2 bg-gradient-to-br from-[#111] to-black border border-white/10 rounded-xl flex items-center justify-center group-hover:border-[#0099FF]/50 transition-all duration-500 shadow-lg shadow-blue-900/10">
          <LogoIcon />
        </div>
        <span class="font-heading font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">IntelliBank</span>
      </div>
      <div class="flex items-center gap-6">
        <button @click="router.push('/login')" class="text-sm font-medium text-gray-400 hover:text-white transition-all">
          Log in
        </button>
        <button @click="router.push('/register')" class="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-heading font-bold bg-white text-[#0000EE] hover:bg-[#0099FF] hover:text-white transition-all transform hover:scale-105 shadow-xl shadow-blue-600/10">
          <LogoIcon class="w-4 h-4" />
          Get Started
        </button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-48 pb-32 px-6 overflow-hidden">
      <!-- Massive Background Atmosphere -->
      <div class="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[#0000EE]/10 rounded-full blur-[160px] pointer-events-none opacity-50"></div>
      <div class="absolute top-1/2 -right-1/4 w-[600px] h-[600px] bg-[#0099FF]/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div class="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-10 backdrop-blur-md shadow-2xl">
          <span class="flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#0099FF] opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-[#0099FF]"></span>
          </span>
          <span class="text-[10px] font-bold text-[#0099FF] uppercase tracking-[0.2em]">Next-Gen Financial Intelligence</span>
        </div>

        <h1 class="text-6xl md:text-8xl font-heading font-extrabold tracking-tighter leading-[0.95] mb-10 max-w-5xl">
          AI Insights That <br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#0099FF] to-white">Shield Your Identity.</span>
        </h1>

        <p class="text-lg md:text-2xl text-gray-400 max-w-3xl font-body leading-relaxed mb-14 mx-auto">
          IntelliBank uses advanced <strong class="text-white">PII Redaction</strong> to clean your statements before they ever touch the cloud. Gain powerful LLaMA 3 insights without exposing a single personal detail.
        </p>

        <div class="flex flex-col sm:flex-row items-center gap-6">
          <button @click="router.push('/register')" class="px-10 py-5 rounded-full font-heading font-black text-xl bg-white text-[#0000EE] hover:bg-gray-100 transition-all hover:scale-110 active:scale-95 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.2)] flex items-center gap-3">
            Analyze for free
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Value Showcase: The Charts -->
    <section class="py-32 px-6 max-w-7xl mx-auto">
      <div class="text-center mb-24">
        <h2 class="text-4xl md:text-6xl font-heading font-extrabold mb-6 tracking-tight">Turn raw data into clarity.</h2>
        <p class="text-gray-400 text-lg max-w-2xl mx-auto">We transform your anonymised transactions into actionable intelligence through a lens of deep privacy.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <!-- Feature 1: Cashflow -->
        <div class="lg:col-span-7 p-8 bg-[#0a0a0a] border border-white/5 rounded-[2rem] relative overflow-hidden group hover:border-[#0099FF]/30 transition-all duration-700">
          <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
            <LogoIcon class="w-32 h-32" />
          </div>
          <div class="relative z-10">
            <h3 class="text-2xl font-heading font-bold mb-2">Smart Cashflow Analysis</h3>
            <p class="text-gray-500 text-sm mb-8 max-w-md">Instantly identify income patterns and spending spikes with AI-tagged transaction categories.</p>
            <div class="h-[280px]">
              <VChart :option="cashflowOption" autoresize />
            </div>
          </div>
        </div>

        <!-- Feature 2: Categories -->
        <div class="lg:col-span-5 p-8 bg-[#0a0a0a] border border-white/5 rounded-[2rem] relative overflow-hidden group hover:border-[#0099FF]/30 transition-all duration-700">
          <div class="relative z-10 flex flex-col h-full">
            <h3 class="text-2xl font-heading font-bold mb-2">Spending DNA</h3>
            <p class="text-gray-500 text-sm mb-8">A high-fidelity breakdown of where your money actually goes.</p>
            <div class="flex-1 flex items-center justify-center">
              <div class="w-full h-[240px]">
                <VChart :option="categoryOption" autoresize />
              </div>
            </div>
            <div class="mt-6 flex gap-2 flex-wrap">
              <span class="px-3 py-1 bg-[#0000EE]/20 text-[#0099FF] rounded-full text-[10px] font-bold uppercase tracking-wider">Housing</span>
              <span class="px-3 py-1 bg-[#111] text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-wider">Groceries</span>
              <span class="px-3 py-1 bg-[#111] text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-wider">Tech</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Metric 1 -->
        <div class="p-8 bg-[#0a0a0a] border border-white/5 rounded-[2rem] text-center hover:bg-[#111] transition-colors">
          <div class="text-[#0099FF] text-4xl font-heading font-black mb-2">99.8%</div>
          <div class="text-white text-lg font-bold mb-2">Redaction Accuracy</div>
          <p class="text-gray-500 text-xs">Proprietary logic identifies names, IBANs, and addresses locally.</p>
        </div>
        <!-- Metric 2 -->
        <div class="p-8 bg-[#0a0a0a] border border-white/5 rounded-[2rem] text-center hover:bg-[#111] transition-colors">
          <div class="text-[#0099FF] text-4xl font-heading font-black mb-2">&lt; 30s</div>
          <div class="text-white text-lg font-bold mb-2">AI Processing</div>
          <p class="text-gray-500 text-xs">Ollama-powered LLaMA 3 analysis happens in near real-time.</p>
        </div>
        <!-- Metric 3 -->
        <div class="p-8 bg-[#0a0a0a] border border-white/5 rounded-[2rem] text-center hover:bg-[#111] transition-colors">
          <div class="text-[#0099FF] text-4xl font-heading font-black mb-2">100%</div>
          <div class="text-white text-lg font-bold mb-2">Cloud Private</div>
          <p class="text-gray-500 text-xs">Only cleaned, non-identifiable data reaches the analysis cloud.</p>
        </div>
      </div>
    </section>

    <!-- How it works (Narrative) -->
    <section class="py-32 bg-[#050505] border-y border-white/5 px-6">
      <div class="max-w-5xl mx-auto">
        <div class="flex flex-col md:flex-row gap-16 items-center">
          <div class="flex-1">
            <h2 class="text-4xl md:text-5xl font-heading font-extrabold mb-10 tracking-tight">The Privacy Journey</h2>
            
            <div class="space-y-12">
              <div class="flex gap-6">
                <div class="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#111] border border-white/10 flex items-center justify-center font-heading font-bold text-[#0099FF]">1</div>
                <div>
                  <h4 class="text-xl font-bold mb-2">Secure Upload</h4>
                  <p class="text-gray-400 text-sm leading-relaxed">Your statements are loaded directly into our secure staging environment, encrypted at rest immediately.</p>
                </div>
              </div>
              
              <div class="flex gap-6">
                <div class="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#0000EE] border border-[#0099FF]/50 flex items-center justify-center font-heading font-bold text-white shadow-lg shadow-blue-600/20">2</div>
                <div>
                  <h4 class="text-xl font-bold mb-2">PII Scrubbing (The Shield)</h4>
                  <p class="text-gray-400 text-sm leading-relaxed">Our redaction engine scans the document for Personal Identifiable Information. Everything from your name to your account numbers is blacked out.</p>
                </div>
              </div>

              <div class="flex gap-6">
                <div class="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#111] border border-white/10 flex items-center justify-center font-heading font-bold text-[#0099FF]">3</div>
                <div>
                  <h4 class="text-xl font-bold mb-2">Cloud AI Analysis</h4>
                  <p class="text-gray-400 text-sm leading-relaxed">The <strong class="text-white">scrubbed data</strong> is sent to our Ollama Cloud. LLaMA 3 analyzes the transactions to find recurring costs, unusual spending, and more.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex-1 w-full max-w-md">
            <!-- Redaction Vis -->
            <div class="p-6 bg-black border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div class="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
              <div class="space-y-3 font-mono text-[10px]">
                <div class="flex justify-between border-b border-white/5 pb-1">
                  <span class="text-gray-600">TRANSACTION DATA</span>
                  <span class="text-[#0099FF]">REDACTED STATE</span>
                </div>
                <div class="flex justify-between items-center bg-white/5 p-2 rounded">
                  <span class="text-gray-400">John Doe Corp Payment</span>
                  <span class="bg-black px-4 py-1.5 rounded border border-white/20 text-[#0099FF]">████████</span>
                </div>
                <div class="flex justify-between items-center bg-white/5 p-2 rounded">
                  <span class="text-gray-400">Rent - 123 Main St, NY</span>
                  <span class="bg-black px-4 py-1.5 rounded border border-white/20 text-[#0099FF]">████████</span>
                </div>
                <div class="flex justify-between items-center bg-white/5 p-2 rounded">
                  <span class="text-gray-400">ATM Withdrawal - #8291</span>
                  <span class="bg-black px-4 py-1.5 rounded border border-white/20 text-[#0099FF]">████████</span>
                </div>
                <div class="pt-4 text-center">
                  <span class="text-[9px] text-gray-600">REDACTION COMPLETE</span>
                </div>
              </div>
              <!-- Floating "Privacy" Badge -->
              <div class="absolute -bottom-6 -right-6 w-32 h-32 bg-[#0099FF]/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer CTA -->
    <section class="pt-40 pb-20 px-6 text-center">
      <div class="max-w-3xl mx-auto p-12 bg-gradient-to-br from-[#0a0a0a] to-black border border-white/10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
        <h2 class="text-4xl font-heading font-extrabold mb-8 tracking-tight">Ready for a clearer perspective?</h2>
        <button @click="router.push('/register')" class="bg-white text-[#0000EE] px-12 py-5 rounded-full font-heading font-black text-xl hover:scale-110 active:scale-95 transition-all shadow-2xl">
          Get Started Now
        </button>
        <div class="mt-8 text-xs text-gray-500 uppercase tracking-widest font-bold">Privacy Guaranteed by Local Redaction</div>
      </div>
    </section>

    <!-- Simple Footer -->
    <footer class="mt-20 px-8 py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="flex items-center gap-2">
        <LogoIcon class="w-6 h-6 grayscale opacity-40" />
        <span class="text-gray-600 font-bold text-sm">© 2026 IntelliBank. All rights reserved.</span>
      </div>
      <div class="flex gap-8 text-xs text-gray-600 font-bold uppercase tracking-widest">
        <a href="#" class="hover:text-white transition-colors">Privacy</a>
        <a href="#" class="hover:text-white transition-colors">Security</a>
        <a href="#" class="hover:text-white transition-colors">Github</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.font-heading {
  font-family: 'GT Walsheim', sans-serif;
}
.font-body {
  font-family: 'Inter', sans-serif;
}
</style>
