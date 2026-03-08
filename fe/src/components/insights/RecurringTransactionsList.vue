<script setup lang="ts">
import type { InsightData } from '@/types/insight.types'
import { formatCurrency } from '@/utils/formatters'
defineProps<{ data: InsightData }>()
</script>

<template>
  <div class="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800">
    <h3 class="font-heading font-semibold text-white mb-4">Recurring Transactions</h3>
    <div class="space-y-3">
      <div>
        <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Debits</p>
        <div v-if="data.recurring_debits.length === 0" class="text-gray-500 text-sm">None detected</div>
        <div
          v-for="t in data.recurring_debits"
          :key="t.description"
          class="flex justify-between items-center py-2 border-b border-gray-800 text-sm"
        >
          <div>
            <p class="text-white">{{ t.description }}</p>
            <p class="text-gray-500 text-xs capitalize">{{ t.frequency }}</p>
          </div>
          <span class="text-red-400 font-mono">-{{ formatCurrency(t.amount) }}</span>
        </div>
      </div>
      <div class="mt-4">
        <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Credits</p>
        <div v-if="data.recurring_credits.length === 0" class="text-gray-500 text-sm">None detected</div>
        <div
          v-for="t in data.recurring_credits"
          :key="t.description"
          class="flex justify-between items-center py-2 border-b border-gray-800 text-sm"
        >
          <div>
            <p class="text-white">{{ t.description }}</p>
            <p class="text-gray-500 text-xs capitalize">{{ t.frequency }}</p>
          </div>
          <span class="text-green-400 font-mono">+{{ formatCurrency(t.amount) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
