<script setup lang="ts">
import type { InsightData } from '@/types/insight.types'
import { formatCurrency } from '@/utils/formatters'
defineProps<{ data: InsightData }>()
</script>

<template>
  <div>
    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-indigo-500"></span> Recurring Activity
    </h3>
    <div class="space-y-6">
      <div>
        <p class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3">Outgoing</p>
        <div v-if="data.recurring_debits.length === 0" class="text-slate-400 dark:text-gray-500 text-sm italic">No recurring debits found.</div>
        <div class="space-y-1">
          <div
            v-for="t in data.recurring_debits"
            :key="t.description"
            class="flex justify-between items-center py-3 border-b border-slate-100 dark:border-[#1a1a1a] last:border-0 group"
          >
            <div>
              <p class="text-slate-900 dark:text-white font-bold group-hover:text-[#0099FF] transition-colors">{{ t.description }}</p>
              <p class="text-slate-500 dark:text-gray-500 text-[10px] font-black uppercase tracking-tighter mt-0.5">{{ t.frequency }}</p>
            </div>
            <span class="text-rose-500 dark:text-rose-400 font-black tabular-nums">-{{ formatCurrency(t.amount) }}</span>
          </div>
        </div>
      </div>
      <div>
        <p class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3">Incoming</p>
        <div v-if="data.recurring_credits.length === 0" class="text-slate-400 dark:text-gray-500 text-sm italic">No recurring credits found.</div>
        <div class="space-y-1">
          <div
            v-for="t in data.recurring_credits"
            :key="t.description"
            class="flex justify-between items-center py-3 border-b border-slate-100 dark:border-[#1a1a1a] last:border-0 group"
          >
            <div>
              <p class="text-slate-900 dark:text-white font-bold group-hover:text-emerald-500 transition-colors">{{ t.description }}</p>
              <p class="text-slate-500 dark:text-gray-500 text-[10px] font-black uppercase tracking-tighter mt-0.5">{{ t.frequency }}</p>
            </div>
            <span class="text-emerald-600 dark:text-emerald-400 font-black tabular-nums">+{{ formatCurrency(t.amount) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
