<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useStatementsStore } from '@/stores/statements.store'
import type { InsightData } from '@/types/insight.types'
import { formatCurrency } from '@/utils/formatters'

import SpendingByCategoryChart from '@/components/insights/SpendingByCategoryChart.vue'
import IncomeVsExpenseChart from '@/components/insights/IncomeVsExpenseChart.vue'
import TopMerchantsChart from '@/components/insights/TopMerchantsChart.vue'
import RecurringTransactionsList from '@/components/insights/RecurringTransactionsList.vue'

const props = defineProps<{
  isOpen: boolean
  statementId: string
  insightData: InsightData
}>()

const emit = defineEmits<{ (e: 'close'): void }>()
const store = useStatementsStore()
const isGenerating = ref(false)

const statement = computed(() => {
  return store.statements.find(s => s.id === props.statementId)
})

onMounted(() => {
  // Inject html2pdf.js dynamically
  if (!document.getElementById('html2pdf-script')) {
    const script = document.createElement('script')
    script.id = 'html2pdf-script'
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
    document.head.appendChild(script)
  }
})

async function confirmDownload() {
  isGenerating.value = true
  // @ts-ignore
  if (!window.html2pdf) {
    alert("PDF generator is still loading, please hold on and click again.")
    isGenerating.value = false
    return
  }
  
  const element = document.getElementById('pdf-report-content')
  if (!element) return

  const opt = {
    margin:       0, // We handle margins inside the element
    filename:     `Financial-Report-${props.statementId.slice(0,8)}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { 
      scale: 2, // Scale 2 is more stable for alignment than 4
      useCORS: true,
      letterRendering: true,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      windowWidth: 760, // Match the element width exactly
    },
    jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['css', 'avoid-all'], before: '.page-break' }
  }
  
  // @ts-ignore
  await window.html2pdf().set(opt).from(element).save()
  isGenerating.value = false
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[100] bg-black/80 backdrop-blur flex flex-col items-center p-4 lg:p-10 overflow-hidden animate-fade-in">
      <div class="w-full max-w-[900px] flex items-center justify-between bg-[#1a1a1a] p-4 rounded-2xl border border-gray-800 shrink-0 mb-6 shadow-2xl">
        <h3 class="text-white font-bold tracking-wide ml-2">📄 Report Preview</h3>
        <div class="flex gap-2">
          <button @click="emit('close')" class="px-5 py-2.5 text-gray-400 font-semibold hover:text-white transition-colors" :disabled="isGenerating">Cancel</button>
          <button @click="confirmDownload" class="px-5 py-2.5 bg-[#0099FF] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors" :disabled="isGenerating">
            <span v-if="isGenerating" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Download PDF
          </button>
        </div>
      </div>
      
      <!-- Preview Wrapper -->
      <div class="w-full max-w-[900px] flex-1 overflow-auto custom-scrollbar rounded-xl shadow-2xl bg-[#0b0b0b] border border-gray-800 flex justify-center py-8">
        <!-- Exact PDF Layout Element: Fixed width (760px) -->
        <div 
          id="pdf-report-content" 
          class="bg-white text-black font-sans relative force-light shrink-0" 
          style="width: 760px; min-height: 1080px; padding: 50px; font-family: 'Outfit', sans-serif; box-sizing: border-box;"
        >
          <!-- Header -->
          <div class="border-b-4 border-[#0000EE]/10 pb-4 mb-6 flex justify-between items-end">
            <div>
              <h1 class="text-3xl font-black text-[#0000EE] mb-1 tracking-tight">Financial Analysis</h1>
              <p class="text-slate-500 font-bold text-base">{{ statement?.filename || 'Document' }}</p>
            </div>
            <div class="text-right text-xs text-slate-400">
              <p>Period: <span class="text-slate-900 font-bold">{{ statement?.statement_month || 'N/A' }}</span></p>
              <p>ID: <span class="text-slate-900 font-bold">{{ statementId.slice(0,8) }}...</span></p>
              <p>Generated: <span class="text-slate-900 font-bold">{{ new Date().toLocaleDateString() }}</span></p>
            </div>
          </div>
          
          <!-- Key Metrics -->
          <div class="flex justify-between gap-4 mb-8">
            <div class="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-xl">
              <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.1em] mb-1">Total Income</p>
              <p class="text-2xl font-black text-emerald-600">{{ formatCurrency(insightData.total_income, insightData.currency) }}</p>
            </div>
            <div class="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-xl">
              <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.1em] mb-1">Total Expenses</p>
              <p class="text-2xl font-black text-red-600">{{ formatCurrency(insightData.total_expenses, insightData.currency) }}</p>
            </div>
            <div class="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-xl">
              <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.1em] mb-1">Net Balance</p>
              <p class="text-2xl font-black" :class="insightData.net_balance >= 0 ? 'text-[#0000EE]' : 'text-red-500'">
                {{ formatCurrency(insightData.net_balance, insightData.currency) }}
              </p>
            </div>
          </div>
          
          <!-- Charts Box -->
          <div class="mb-8" style="page-break-inside: avoid;">
            <h2 class="text-lg font-black mb-4 border-b border-slate-100 pb-1 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#0099FF]"></span> Analysis Overview
            </h2>
            <div class="flex gap-4">
              <div class="flex-1">
                 <h3 class="text-[9px] font-black text-center uppercase tracking-widest text-slate-400 mb-2">Spending by Category</h3>
                 <SpendingByCategoryChart :data="insightData" forced-theme="light" style="width: 100%; height: 240px;" />
              </div>
              <div class="flex-1">
                 <h3 class="text-[9px] font-black text-center uppercase tracking-widest text-slate-400 mb-2">Cashflow Velocity</h3>
                 <IncomeVsExpenseChart :data="insightData" forced-theme="light" style="width: 100%; height: 240px;" />
              </div>
            </div>
          </div>

          <!-- Top Merchants -->
          <div class="mb-8" style="page-break-inside: avoid;">
            <h2 class="text-lg font-black mb-4 border-b border-slate-100 pb-1 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#0099FF]"></span> Merchant Distribution
            </h2>
            <div style="width: 100%; height: 320px;">
               <TopMerchantsChart :data="insightData" forced-theme="light" />
            </div>
          </div>

          <!-- Recurring Activity -->
          <div class="mb-10 p-8 bg-slate-50 rounded-3xl border border-slate-100" style="page-break-inside: avoid;">
            <RecurringTransactionsList :data="insightData" />
          </div>

          <!-- Smart Insights -->
          <div style="page-break-inside: avoid;">
            <h2 class="text-xl font-bold mb-4 border-b border-gray-100 pb-2">Actionable AI Insights</h2>
            <ul class="space-y-3 pl-2">
              <li v-for="(insight, idx) in insightData.actionable_insights" :key="idx" class="flex gap-3 text-sm text-slate-700">
                <span class="text-[#0000EE] font-bold">•</span>
                <span class="leading-relaxed">{{ insight }}</span>
              </li>
            </ul>
          </div>
          
        </div>
      </div>
    </div>
  </Teleport>
</template>
