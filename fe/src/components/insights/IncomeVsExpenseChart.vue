<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { InsightData } from '@/types/insight.types'
import { useInsightCharts } from '@/composables/useInsightCharts'

use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const props = defineProps<{ data: InsightData }>()
const { getIncomeVsExpenseOption } = useInsightCharts(props.data)
const option = computed(() => getIncomeVsExpenseOption())
</script>

<template>
  <div class="h-[280px]">
    <VChart :option="option" autoresize />
  </div>
</template>
