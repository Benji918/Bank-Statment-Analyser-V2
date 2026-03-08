<script setup lang="ts">
import type { InsightData } from '@/types/insight.types'
import { formatCurrency } from '@/utils/formatters'
defineProps<{ data: InsightData }>()
</script>

<template>
  <div class="p-6 bg-[#1a1a1a] rounded-xl border border-yellow-700/40">
    <h3 class="font-heading font-semibold text-yellow-300 mb-4">⚠ Unusual Transactions</h3>
    <div v-if="data.unusual_transactions.length === 0" class="text-gray-400 text-sm">No unusual transactions flagged.</div>
    <div class="space-y-3">
      <div
        v-for="t in data.unusual_transactions"
        :key="t.description"
        class="flex items-center justify-between p-3 bg-yellow-900/10 border border-yellow-700/20 rounded-lg"
      >
        <div>
          <p class="text-white text-sm font-medium">{{ t.description }}</p>
          <span class="px-2 py-0.5 bg-yellow-700/30 text-yellow-300 text-xs rounded-full capitalize">{{ t.flag.replace(/_/g, ' ') }}</span>
        </div>
        <span class="text-yellow-300 font-mono font-semibold">{{ formatCurrency(t.amount) }}</span>
      </div>
    </div>
  </div>
</template>
