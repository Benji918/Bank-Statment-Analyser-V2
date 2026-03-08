<script setup lang="ts">
import type { InsightData } from '@/types/insight.types'
defineProps<{ data: InsightData }>()
</script>

<template>
  <div class="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800">
    <h3 class="font-heading font-semibold text-white mb-4">💡 Actionable Insights</h3>
    <div v-if="data.actionable_insights.length === 0" class="text-gray-400 text-sm">No recommendations available.</div>
    <ul class="space-y-3">
      <li
        v-for="(insight, i) in data.actionable_insights"
        :key="i"
        class="flex gap-3 p-3 bg-accent/5 border border-accent/20 rounded-lg hover:border-accent/40 transition-colors"
      >
        <span class="text-accent text-lg flex-shrink-0">→</span>
        <p class="text-gray-300 text-sm leading-relaxed">{{ insight }}</p>
      </li>
    </ul>
  </div>
</template>
