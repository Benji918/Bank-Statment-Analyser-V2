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

const props = defineProps<{ data: InsightData }>()
const { getTopMerchantsOption } = useInsightCharts(props.data)
const option = computed(() => getTopMerchantsOption())
</script>

<template>
  <div class="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800">
    <h3 class="font-heading font-semibold text-white mb-4">Top Merchants</h3>
    <VChart :option="option" autoresize style="height: 280px;" />
  </div>
</template>
