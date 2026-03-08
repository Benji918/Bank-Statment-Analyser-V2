<script setup lang="ts">
import type { InsightData } from '@/types/insight.types'
import { formatCurrency, formatPercentage } from '@/utils/formatters'

defineProps<{ data: InsightData }>()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div class="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 hover:border-accent/40 transition-colors">
      <p class="text-xs text-gray-400 font-primary mb-1 uppercase tracking-wider">Total Income</p>
      <p class="text-2xl font-heading font-bold text-white">{{ formatCurrency(data.total_income, data.currency) }}</p>
      <p class="text-xs text-accent mt-1">{{ data.currency }}</p>
    </div>
    <div class="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 hover:border-red-500/40 transition-colors">
      <p class="text-xs text-gray-400 font-primary mb-1 uppercase tracking-wider">Total Expenses</p>
      <p class="text-2xl font-heading font-bold text-white">{{ formatCurrency(data.total_expenses, data.currency) }}</p>
      <p class="text-xs text-red-400 mt-1">{{ formatPercentage(100 - data.savings_rate_percent) }} of income</p>
    </div>
    <div class="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 hover:border-green-500/40 transition-colors">
      <p class="text-xs text-gray-400 font-primary mb-1 uppercase tracking-wider">Net Balance</p>
      <p
        :class="['text-2xl font-heading font-bold', data.net_balance >= 0 ? 'text-green-400' : 'text-red-400']"
      >
        {{ formatCurrency(data.net_balance, data.currency) }}
      </p>
      <p class="text-xs text-green-400 mt-1">{{ formatPercentage(data.savings_rate_percent) }} savings rate</p>
    </div>
  </div>
</template>
