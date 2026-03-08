<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import InsightsSummaryCard from '@/components/insights/InsightsSummaryCard.vue'
import SpendingByCategoryChart from '@/components/insights/SpendingByCategoryChart.vue'
import IncomeVsExpenseChart from '@/components/insights/IncomeVsExpenseChart.vue'
import TopMerchantsChart from '@/components/insights/TopMerchantsChart.vue'
import RecurringTransactionsList from '@/components/insights/RecurringTransactionsList.vue'
import ActionableInsightsList from '@/components/insights/ActionableInsightsList.vue'
import UnusualTransactionsAlert from '@/components/insights/UnusualTransactionsAlert.vue'
import ExportMenu from '@/components/export/ExportMenu.vue'
import { useInsightsStore } from '@/stores/insights.store'
import { useUiStore } from '@/stores/ui.store'
import { usePolling } from '@/composables/usePolling'

const route = useRoute()
const insightsStore = useInsightsStore()
const uiStore = useUiStore()
const statementId = route.params.id as string

const { status: jobStatus, startPolling, isPolling } = usePolling(
  () => insightsStore.pollAnalysisStatus(statementId),
  (s) => s === 'done' || s === 'error'
)

const insightData = computed(() => insightsStore.insightsByStatementId[statementId])

onMounted(async () => {
  const currentStatus = insightsStore.analysisJobStatus[statementId]
  if (currentStatus === 'done' || insightData.value) {
    try {
      await insightsStore.fetchInsights(statementId)
    } catch {
      uiStore.showToast('Failed to load insights', 'error')
    }
  } else {
    startPolling()
  }
})
</script>

<template>
  <div class="flex min-h-screen bg-black">
    <AppSidebar />
    <div class="flex-1 ml-60 flex flex-col">
      <AppHeader />
      <main class="flex-1 p-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-heading text-2xl font-bold text-white">Financial Insights</h2>
          <ExportMenu :statement-id="statementId" />
        </div>

        <!-- Loading/polling state -->
        <div v-if="isPolling && !insightData" class="text-center py-20">
          <div class="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p class="text-white font-heading font-semibold">Generating AI insights…</p>
          <p class="text-gray-400 text-sm mt-1">This can take up to 60 seconds with LLaMA 3.</p>
        </div>

        <!-- Error state -->
        <div v-else-if="jobStatus === 'error' && !insightData"
          class="p-6 bg-red-900/20 border border-red-700/40 rounded-xl text-red-300"
        >
          Analysis failed. Please retry from the statement detail page.
        </div>

        <!-- Insights loaded -->
        <div v-else-if="insightData" class="space-y-6">
          <InsightsSummaryCard :data="insightData" />
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingByCategoryChart :data="insightData" />
            <IncomeVsExpenseChart :data="insightData" />
          </div>
          <TopMerchantsChart :data="insightData" />
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecurringTransactionsList :data="insightData" />
            <ActionableInsightsList :data="insightData" />
          </div>
          <UnusualTransactionsAlert :data="insightData" />
        </div>
      </main>
    </div>
  </div>
</template>
