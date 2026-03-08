<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import StatementCard from '@/components/statements/StatementCard.vue'
import { useStatementsStore } from '@/stores/statements.store'
import { useInsightsStore } from '@/stores/insights.store'

const router = useRouter()
const statementsStore = useStatementsStore()
const insightsStore = useInsightsStore()

onMounted(() => statementsStore.fetchStatements())

const recentStatements = ref(statementsStore.statements.slice(0, 5))
</script>

<template>
  <div class="flex min-h-screen bg-black">
    <AppSidebar />
    <div class="flex-1 ml-60 flex flex-col">
      <AppHeader />
      <main class="flex-1 p-8">
        <!-- KPI Row -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div class="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Statements</p>
            <p class="text-3xl font-heading font-bold text-white">{{ statementsStore.statements.length }}</p>
          </div>
          <div class="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Analysed</p>
            <p class="text-3xl font-heading font-bold text-white">
              {{ statementsStore.statements.filter(s => s.status === 'done').length }}
            </p>
          </div>
          <div class="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Pending</p>
            <p class="text-3xl font-heading font-bold text-white">
              {{ statementsStore.statements.filter(s => ['uploaded','redacting','redacted','analysing'].includes(s.status)).length }}
            </p>
          </div>
        </div>

        <!-- Recent Statements -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-heading text-xl font-semibold text-white">Recent Statements</h2>
            <RouterLink to="/statements" class="text-link text-sm hover:underline">View all</RouterLink>
          </div>

          <div v-if="statementsStore.isLoading" class="flex justify-center py-12">
            <div class="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>

          <div
            v-else-if="statementsStore.statements.length === 0"
            class="p-12 text-center bg-[#1a1a1a] rounded-xl border border-gray-800 border-dashed"
          >
            <p class="text-4xl mb-4">📄</p>
            <p class="text-white font-heading font-semibold text-lg">No statements yet</p>
            <p class="text-gray-400 text-sm mt-1 mb-6">Upload your first bank statement to get started</p>
            <RouterLink
              to="/statements/upload"
              class="inline-flex items-center px-6 py-2.5 bg-white text-[#0000EE] rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              + Upload Statement
            </RouterLink>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <StatementCard
              v-for="s in statementsStore.statements.slice(0, 6)"
              :key="s.id"
              :statement="s"
              @click="router.push(`/statements/${s.id}`)"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
