<script setup lang="ts">
import type { InsightData } from '@/types/insight.types'
import { formatCurrency, formatPercentage } from '@/utils/formatters'

defineProps<{ data: InsightData }>()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Income Card -->
    <div class="p-8 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-[#1a1a1a] shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
      <div class="absolute -right-10 -top-10 w-32 h-32 bg-[#0099FF]/10 rounded-full blur-2xl group-hover:bg-[#0099FF]/20 transition-colors duration-500"></div>
      <p class="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-[#0099FF]"></span> Total Income
      </p>
      <p class="text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight">{{ formatCurrency(data.total_income, data.currency) }}</p>
      <p class="text-sm font-bold text-[#0099FF] mt-3">{{ data.currency }} Activity</p>
    </div>

    <!-- Expenses Card -->
    <div class="p-8 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-[#1a1a1a] shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
      <div class="absolute -right-10 -top-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-colors duration-500"></div>
      <p class="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Total Expenses
      </p>
      <p class="text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight">{{ formatCurrency(data.total_expenses, data.currency) }}</p>
      <p class="text-sm font-bold text-red-500 mt-3">{{ formatPercentage(100 - data.savings_rate_percent) }} of income</p>
    </div>

    <!-- Net Balance Card -->
    <div class="p-8 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-[#1a1a1a] shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
      <div class="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
      <p class="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Net Balance
      </p>
      <p :class="['text-4xl font-heading font-black tracking-tight', data.net_balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500']">
        {{ formatCurrency(data.net_balance, data.currency) }}
      </p>
      <p :class="['text-sm font-bold mt-3', data.net_balance >= 0 ? 'text-emerald-500' : 'text-red-500']">
        {{ formatPercentage(data.savings_rate_percent) }} savings rate
      </p>
    </div>
  </div>
</template>
