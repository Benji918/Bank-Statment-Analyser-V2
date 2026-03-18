<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { InsightData } from '@/types/insight.types'
import { useInsightCharts } from '@/composables/useInsightCharts'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{ data: InsightData; forcedTheme?: 'light' | 'dark' }>()
const { getTopMerchantsOption } = useInsightCharts(props.data, props.forcedTheme)
const option = computed(() => getTopMerchantsOption())
</script>

<template>
  <div>
    <h3 v-if="!forcedTheme" class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-[#0099FF]"></span> Top Transaction Counterparties
    </h3>
    <div class="h-[280px]">
      <VChart :option="option" autoresize />
    </div>
  </div>
</template>
