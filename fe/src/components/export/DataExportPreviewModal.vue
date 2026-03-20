<script setup lang="ts">
import { computed } from 'vue'
import type { InsightData } from '@/types/insight.types'
import { useExport } from '@/composables/useExport'
import { formatCurrency } from '@/utils/formatters'

const props = defineProps<{
  isOpen: boolean
  type: 'excel' | 'json'
  statementId: string
  insightData: InsightData
}>()

const emit = defineEmits<{ (e: 'close'): void }>()
const { downloadExcel, downloadJson } = useExport(props.statementId)

const jsonContent = computed(() => {
  return JSON.stringify(props.insightData, null, 2)
})

const handleDownload = async () => {
  if (props.type === 'excel') {
    await downloadExcel()
  } else {
    await downloadJson()
  }
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center p-4 lg:p-10 overflow-hidden animate-fade-in">
      <!-- Modal Header -->
      <div class="w-full max-w-5xl flex items-center justify-between bg-[#111] p-5 rounded-t-3xl border-x border-t border-white/5 shadow-2xl">
        <div class="flex items-center gap-4">
          <div :class="['w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg', type === 'excel' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500']">
            {{ type === 'excel' ? '📊' : '{ }' }}
          </div>
          <div>
            <h3 class="text-white font-black tracking-tight text-xl uppercase italic">{{ type }} Export Preview</h3>
            <p class="text-gray-500 text-[10px] font-black tracking-[0.2em] uppercase">Document ID: {{ statementId.slice(0, 12) }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <button @click="emit('close')" class="px-6 py-2.5 text-gray-500 font-bold hover:text-white transition-all uppercase text-xs tracking-widest">Cancel</button>
          <button @click="handleDownload" class="px-8 py-3 bg-white text-black rounded-2xl font-black flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5">
             <span class="uppercase text-xs tracking-[0.2em]">Confirm & Download</span>
          </button>
        </div>
      </div>

      <!-- Preview Body -->
      <div class="w-full max-w-5xl flex-1 bg-[#050505] border-x border-b border-white/5 rounded-b-3xl overflow-hidden relative">
        <div class="absolute inset-0 overflow-auto p-10 custom-scrollbar mt-[1px]">
          
          <!-- JSON PREVIEW -->
          <div v-if="type === 'json'" class="relative">
             <div class="absolute top-0 right-0 px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] text-gray-400 font-mono">APPLICATION/JSON</div>
             <pre class="text-emerald-400 font-mono text-sm leading-relaxed p-6 rounded-2xl bg-black border border-white/5 select-all">{{ jsonContent }}</pre>
          </div>

          <!-- EXCEL PREVIEW (Simulated Tables) -->
          <div v-if="type === 'excel'" class="space-y-12">
            <!-- Sheet 1: Summary -->
            <div class="space-y-4">
               <div class="flex items-center gap-4 mb-2">
                  <span class="px-3 py-1 bg-white/5 text-gray-500 rounded text-[10px] font-black tracking-widest uppercase">SHEET 1: SUMMARY</span>
               </div>
               <div class="rounded-2xl border border-white/10 overflow-hidden">
                  <table class="w-full text-left text-sm">
                    <thead class="bg-white/5 text-gray-500 font-black uppercase text-[10px] tracking-widest">
                       <tr>
                          <th class="px-6 py-4">Metric</th>
                          <th class="px-6 py-4">Value</th>
                       </tr>
                    </thead>
                    <tbody class="text-gray-300 font-medium">
                       <tr class="border-t border-white/5">
                          <td class="px-6 py-4">Total Income</td>
                          <td class="px-6 py-4 text-emerald-500 font-bold">{{ formatCurrency(insightData.total_income, insightData.currency) }}</td>
                       </tr>
                       <tr class="border-t border-white/5">
                          <td class="px-6 py-4">Total Expenses</td>
                          <td class="px-6 py-4 text-red-500 font-bold">{{ formatCurrency(insightData.total_expenses, insightData.currency) }}</td>
                       </tr>
                       <tr class="border-t border-white/5">
                          <td class="px-6 py-4">Net Balance</td>
                          <td class="px-6 py-4 font-bold" :class="insightData.net_balance >= 0 ? 'text-blue-500' : 'text-red-500'">{{ formatCurrency(insightData.net_balance, insightData.currency) }}</td>
                       </tr>
                       <tr class="border-t border-white/5">
                          <td class="px-6 py-4">Savings Rate</td>
                          <td class="px-6 py-4 text-emerald-500">{{ insightData.savings_rate_percent }}%</td>
                       </tr>
                    </tbody>
                  </table>
               </div>
            </div>

            <!-- Sheet 2: Categorization -->
            <div class="space-y-4">
               <div class="flex items-center gap-4 mb-2">
                  <span class="px-3 py-1 bg-white/5 text-gray-500 rounded text-[10px] font-black tracking-widest uppercase">SHEET 2: CATEGORIZATION</span>
               </div>
               <div class="rounded-2xl border border-white/10 overflow-hidden">
                  <table class="w-full text-left text-sm">
                    <thead class="bg-white/5 text-gray-500 font-black uppercase text-[10px] tracking-widest">
                       <tr>
                          <th class="px-6 py-4">Category</th>
                          <th class="px-6 py-4">Total Amount</th>
                       </tr>
                    </thead>
                    <tbody class="text-gray-300 font-medium font-mono text-xs">
                       <tr v-for="(amount, category) in insightData.spending_by_category" :key="category" class="border-t border-white/5">
                          <td class="px-6 py-4">{{ category }}</td>
                          <td class="px-6 py-4">{{ formatCurrency(amount, insightData.currency) }}</td>
                       </tr>
                    </tbody>
                  </table>
               </div>
            </div>

            <!-- Sheet 3: Top Merchants -->
            <div class="space-y-4">
               <div class="flex items-center gap-4 mb-2">
                  <span class="px-3 py-1 bg-white/5 text-gray-500 rounded text-[10px] font-black tracking-widest uppercase">SHEET 3: MERCHANT ANALYSIS</span>
               </div>
               <div class="rounded-2xl border border-white/10 overflow-hidden">
                  <table class="w-full text-left text-sm">
                    <thead class="bg-white/5 text-gray-500 font-black uppercase text-[10px] tracking-widest">
                       <tr>
                          <th class="px-6 py-4">Merchant Name</th>
                          <th class="px-6 py-4">Transaction Count</th>
                          <th class="px-6 py-4">Total Spending</th>
                       </tr>
                    </thead>
                    <tbody class="text-gray-300 font-medium text-xs">
                       <tr v-for="m in insightData.top_merchants" :key="m.name" class="border-t border-white/5">
                          <td class="px-6 py-4 font-black">{{ m.name }}</td>
                          <td class="px-6 py-4">{{ m.count }}</td>
                          <td class="px-6 py-4 font-bold text-white">{{ formatCurrency(m.total, insightData.currency) }}</td>
                       </tr>
                    </tbody>
                  </table>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #050505;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #222;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #333;
}
</style>
