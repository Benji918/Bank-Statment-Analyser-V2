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
  <div class="h-[300px]">
    <VChart :option="option" autoresize />
  </div>
</template>
