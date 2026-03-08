<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useAuthStore } from '@/stores/auth.store'
import { insightsService } from '@/services/insights.service'
import type { InsightSummary } from '@/types/insight.types'
import { formatDate, formatPeriod } from '@/utils/formatters'

const authStore = useAuthStore()
const insightSummaries = ref<InsightSummary[]>([])
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    insightSummaries.value = await insightsService.list()
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="flex min-h-screen bg-black">
    <AppSidebar />
    <div class="flex-1 ml-60 flex flex-col">
      <AppHeader />
      <main class="flex-1 p-8 max-w-3xl">
        <h2 class="font-heading text-2xl font-bold text-white mb-6">Settings</h2>

        <!-- Profile Section -->
        <div class="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 mb-6">
          <h3 class="font-heading font-semibold text-white mb-4">Profile</h3>
          <div class="space-y-4">
            <div>
              <label class="text-xs text-gray-400 uppercase tracking-wider">Email</label>
              <p class="text-white mt-1">{{ authStore.user?.email ?? '—' }}</p>
            </div>
            <div>
              <label class="text-xs text-gray-400 uppercase tracking-wider">Full Name</label>
              <p class="text-white mt-1">{{ authStore.user?.full_name ?? '—' }}</p>
            </div>
          </div>
        </div>

        <!-- Recent Insights -->
        <div class="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <h3 class="font-heading font-semibold text-white mb-4">Insight History</h3>
          <div v-if="isLoading" class="text-gray-400 text-sm">Loading…</div>
          <div v-else-if="insightSummaries.length === 0" class="text-gray-400 text-sm">No insights yet.</div>
          <div v-else class="space-y-2">
            <div
              v-for="summary in insightSummaries"
              :key="summary.id"
              class="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-gray-800 text-sm"
            >
              <span class="text-white">{{ summary.period ? formatPeriod(summary.period) : 'Unknown Period' }}</span>
              <span class="text-gray-500">{{ formatDate(summary.created_at) }}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
