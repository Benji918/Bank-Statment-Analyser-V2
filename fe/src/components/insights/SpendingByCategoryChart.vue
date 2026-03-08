<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { InsightData } from '@/types/insight.types'
import { useInsightCharts } from '@/composables/useInsightCharts'

use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const props = defineProps<{ data: InsightData }>()
const { getSpendingByCategoryOption } = useInsightCharts(props.data)
const option = computed(() => getSpendingByCategoryOption())
</script>

<template>
  <div class="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800">
    <h3 class="font-heading font-semibold text-white mb-4">Spending by Category</h3>
    <VChart :option="option" autoresize style="height: 300px;" />
  </div>
</template>
