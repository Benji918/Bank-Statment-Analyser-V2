<script setup lang="ts">
import type { InsightData } from '@/types/insight.types'
import { formatCurrency } from '@/utils/formatters'
defineProps<{ data: InsightData }>()
</script>

<template>
  <div class="p-6 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-amber-500/30 dark:border-amber-500/20 shadow-sm relative overflow-hidden">
    <div class="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
    <h3 class="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 relative z-10">
      <span class="text-amber-500">⚠</span> Unusual Transactions
    </h3>
    <div v-if="data.unusual_transactions.length === 0" class="text-slate-500 dark:text-gray-400 text-sm italic relative z-10">No unusual transactions flagged.</div>
    <div class="space-y-4 relative z-10">
      <div
        v-for="t in data.unusual_transactions"
        :key="t.description"
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl"
      >
        <div class="flex-1 min-w-0">
          <p class="text-slate-900 dark:text-white text-sm font-bold truncate">{{ t.description }}</p>
          <div class="mt-1 flex items-center">
            <span class="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full truncate">{{ t.flag.replace(/_/g, ' ') }}</span>
          </div>
        </div>
        <span class="text-amber-700 dark:text-amber-400 font-black tabular-nums border-t border-amber-200 dark:border-amber-500/20 sm:border-0 pt-2 sm:pt-0">{{ formatCurrency(t.amount) }}</span>
      </div>
    </div>
  </div>
</template>
