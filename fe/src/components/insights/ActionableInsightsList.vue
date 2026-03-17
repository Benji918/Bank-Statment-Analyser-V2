<script setup lang="ts">
import type { InsightData } from '@/types/insight.types'
defineProps<{ data: InsightData }>()
</script>

<template>
  <div>
    <div v-if="data.actionable_insights.length === 0" class="text-white/70 text-sm italic">No recommendations available.</div>
    <ul class="space-y-3">
      <li
        v-for="(insight, i) in data.actionable_insights"
        :key="i"
        class="flex gap-4 p-4 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-colors backdrop-blur-sm"
      >
        <span class="text-white font-black text-lg flex-shrink-0 mt-0.5">→</span>
        <p class="text-white text-sm leading-relaxed font-medium">{{ insight }}</p>
      </li>
    </ul>
  </div>
</template>
