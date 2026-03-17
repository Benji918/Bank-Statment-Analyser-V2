<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
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
  if (insightData.value) return // Already loaded
  
  try {
    const currentStatus = await insightsStore.pollAnalysisStatus(statementId)
    if (currentStatus === 'done') {
      await insightsStore.fetchInsights(statementId)
    } else if (currentStatus !== 'error') {
      startPolling()
    }
  } catch (err) {
    uiStore.showToast('Failed to fetch status or insights', 'error')
  }
})

watch(jobStatus, async (newStatus) => {
  if (newStatus === 'done' && !insightData.value) {
    try {
      await insightsStore.fetchInsights(statementId)
    } catch {
      uiStore.showToast('Failed to load insights', 'error')
    }
  }
})
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-black transition-colors duration-500">
    <AppSidebar />
    <div 
      class="flex-1 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      :class="uiStore.isSidebarCollapsed ? 'ml-20' : 'ml-64'"
    >
      <AppHeader />
      <main class="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 translate-y-0 animate-fade-in">
          <div>
            <h2 class="font-heading text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Financial <span class="text-[#0099FF]">Insights</span>
            </h2>
            <p class="text-slate-500 dark:text-gray-400 text-sm font-medium mt-1">
              AI-powered analysis of your spending patterns and habits.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <ExportMenu :statement-id="statementId" />
          </div>
        </div>

        <!-- Loading/polling state -->
        <div v-if="isPolling && !insightData" class="flex flex-col items-center justify-center py-32 animate-fade-in">
          <div class="relative w-20 h-20 mb-8">
            <div class="absolute inset-0 border-4 border-[#0099FF]/20 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-[#0099FF] border-t-transparent rounded-full animate-spin"></div>
            <div class="absolute inset-4 bg-[#0099FF]/10 rounded-full animate-pulse blur-sm"></div>
          </div>
          <h3 class="text-slate-900 dark:text-white font-heading text-xl font-bold mb-2">Generating AI insights…</h3>
          <p class="text-slate-500 dark:text-gray-400 text-sm max-w-xs text-center">
            Our AI engine is processing your transactions to identify patterns.
          </p>
        </div>

        <!-- Error state -->
        <div v-else-if="jobStatus === 'error' && !insightData"
          class="p-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-3xl text-red-600 dark:text-red-400 animate-scale-up"
        >
          <div class="flex items-center gap-4">
            <span class="text-3xl">⚠️</span>
            <div>
              <h4 class="font-bold">Analysis Failed</h4>
              <p class="text-sm opacity-80">There was an error processing this statement. Please try again.</p>
            </div>
          </div>
        </div>

        <!-- Insights loaded -->
        <div v-else-if="insightData" class="space-y-8 pb-12">
          <!-- Summary Cards Section -->
          <div class="animate-slide-in" style="animation-delay: 0.1s">
            <InsightsSummaryCard :data="insightData" />
          </div>
          
          <!-- Charts Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-in" style="animation-delay: 0.2s">
            <div class="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#1a1a1a] rounded-3xl p-6 shadow-sm hover:shadow-xl transition-shadow duration-500 overflow-hidden">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-[#0099FF]"></span> Spending by Category
              </h3>
              <SpendingByCategoryChart :data="insightData" />
            </div>
            <div class="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#1a1a1a] rounded-3xl p-6 shadow-sm hover:shadow-xl transition-shadow duration-500 overflow-hidden">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Cashflow Velocity
              </h3>
              <IncomeVsExpenseChart :data="insightData" />
            </div>
          </div>

          <!-- Lists Section -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-in" style="animation-delay: 0.3s">
            <div class="lg:col-span-2 space-y-8">
              <div class="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#1a1a1a] rounded-3xl p-6 shadow-sm">
                <TopMerchantsChart :data="insightData" />
              </div>
              <div class="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#1a1a1a] rounded-3xl p-6 shadow-sm">
                <RecurringTransactionsList :data="insightData" />
              </div>
            </div>
            <div class="space-y-8">
              <div class="bg-gradient-to-br from-[#0099FF] to-[#0000EE] rounded-3xl p-6 text-white shadow-lg shadow-[#0099FF]/20 overflow-hidden relative group">
                <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <h3 class="text-xl font-black mb-4 flex items-center gap-2">
                  <span>💡</span> Smart Insights
                </h3>
                <ActionableInsightsList :data="insightData" />
              </div>
              <UnusualTransactionsAlert :data="insightData" />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
