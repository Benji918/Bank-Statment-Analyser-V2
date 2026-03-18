<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import StatementStatusBadge from '@/components/statements/StatementStatusBadge.vue'
import StatementTagBadge from '@/components/statements/StatementTagBadge.vue'
import { statementsService } from '@/services/statements.service'
import { useStatementsStore } from '@/stores/statements.store'
import { useAnalysisStore } from '@/stores/analysis.store'
import { usePolling } from '@/composables/usePolling'
import { useUiStore } from '@/stores/ui.store'
import type { Statement } from '@/types/statement.types'
import { formatDate, formatFileSize } from '@/utils/formatters'
import ConfirmDeleteModal from '@/components/statements/ConfirmDeleteModal.vue'

const route = useRoute()
const router = useRouter()
const analysisStore = useAnalysisStore()
const statementsStore = useStatementsStore()
const uiStore = useUiStore()

const statementId = route.params.id as string
const statement = ref<Statement | null>(null)
const isLoading = ref(true)

const wsProgress = ref(0)
const wsMessage = ref('')
const wsConn = ref<WebSocket | null>(null)

function startWebsocket(jobId: string) {
  if (wsConn.value) wsConn.value.close()
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'
  const wsUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://') + `/analysis/${jobId}/ws`
  
  wsConn.value = new WebSocket(wsUrl)
  wsConn.value.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data)
      if (data.progress !== undefined) wsProgress.value = data.progress
      if (data.message !== undefined) wsMessage.value = data.message
      
      // If we see 100%, we can force success immediately instead of waiting for next poll
      if (data.progress === 100 && statement.value) {
        statement.value.status = 'done'
      }
    } catch {
      // ignore parse errors
    }
  }
}

const { status: jobStatus, startPolling } = usePolling(
  () => analysisStore.pollAnalysisStatus(statementId).then((j) => j.status),
  (s) => s === 'done' || s === 'error' || s === 'failed'
)

watch(jobStatus, (newStatus) => {
  if (statement.value && newStatus !== 'pending') {
    statement.value.status = newStatus as any
  }
})

onMounted(async () => {
  try {
    statement.value = await statementsService.get(statementId)
    // If we land on the page and it's already analyzing, setup polling and WS
    if (statement.value.status === 'analysing' || statement.value.status === 'redacting') {
      startPolling()
      const job = await analysisStore.pollAnalysisStatus(statementId)
      if (job?.id) startWebsocket(job.id)
    }
  } catch {
    uiStore.showToast('Failed to load statement', 'error')
  } finally {
    isLoading.value = false
  }
})

async function runAnalysis() {
  try {
    const job = await analysisStore.triggerAnalysis(statementId)
    if (statement.value) {
      statement.value.status = 'analysing'
    }
    uiStore.showToast('Analysis started', 'info')
    
    // Use the actual `job.id` directly if `analysisStore.triggerAnalysis` returns `AnalysisResult`
    // but the store casts it as AnalysisJob, we access `job_id` dynamically just in case.
    const actualJobId = (job as any).job_id || job.id
    if (actualJobId) startWebsocket(actualJobId)
    
    startPolling()
  } catch {
    uiStore.showToast('Failed to start analysis', 'error')
  }
}

function viewInsights() {
  router.push(`/statements/${statementId}/insights`)
}

const showDeleteModal = ref(false)

async function confirmDelete() {
  try {
    await statementsStore.deleteStatement(statementId)
    router.push('/statements')
  } catch {
    // Store already handles error toasts
  } finally {
    showDeleteModal.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-black transition-colors duration-500">
    <AppSidebar />
    <div class="flex-1 ml-60 flex flex-col">
      <AppHeader />
      <main class="flex-1 p-8 max-w-3xl">
        <div v-if="isLoading" class="flex justify-center py-20">
          <div class="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>

        <template v-else-if="statement">
          <!-- Metadata -->
          <div class="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 mb-6">
            <div class="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 class="font-heading text-xl font-bold text-white">{{ statement.filename }}</h2>
                <p class="text-gray-400 text-sm mt-1">
                  {{ statement.bank_name ?? 'Unknown Bank' }} · {{ statement.statement_month ?? 'Unknown Period' }}
                </p>
              </div>
              <StatementStatusBadge :status="statement.status" />
            </div>
            <div class="flex flex-wrap gap-2 mb-4">
              <StatementTagBadge v-for="tag in statement.tags" :key="tag" :tag="tag" />
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-400">
              <div>Uploaded: <span class="text-white">{{ formatDate(statement.uploaded_at) }}</span></div>
              <div v-if="statement.file_size_bytes">Size: <span class="text-white">{{ formatFileSize(statement.file_size_bytes) }}</span></div>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-3">
            <button
              v-if="statement.status === 'done'"
              @click="viewInsights"
              class="w-full py-3 bg-white text-[#0000EE] rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              View Financial Insights →
            </button>

            <button
              v-else-if="['redacted', 'uploaded'].includes(statement.status)"
              @click="runAnalysis"
              class="w-full py-3 bg-[#0000EE] text-white rounded-full font-semibold hover:bg-blue-800 transition-colors"
            >
              Run AI Analysis
            </button>

            <div
              v-else-if="['analysing', 'redacting'].includes(statement.status)"
              class="text-center py-10 px-6 bg-[#1a1a1a] rounded-[2.5rem] border border-gray-800 transition-all"
            >
              <div class="relative w-16 h-16 mx-auto mb-6">
                <div class="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-[#0099FF] border-t-transparent rounded-full animate-spin"></div>
              </div>
              
              <h3 class="text-white text-xl font-heading font-black tracking-wide mb-2">
                {{ wsMessage || (statement.status === 'redacting' ? 'Redacting Document...' : 'Analysing Data...') }}
              </h3>
              
              <div class="max-w-md mx-auto mt-6 bg-black/50 rounded-full h-3 border border-gray-800 overflow-hidden relative">
                <div 
                  class="bg-gradient-to-r from-[#0000EE] to-[#0099FF] h-full rounded-full transition-all duration-700 ease-out relative" 
                  :style="{ width: `${wsProgress || (statement.status === 'redacting' ? 20 : 0)}%` }"
                >
                  <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <p class="text-gray-400 text-xs font-black uppercase tracking-widest mt-4">{{ wsProgress || (statement.status === 'redacting' ? 20 : 0) }}% COMPLETE</p>
            </div>

            <div
              v-else-if="statement.status === 'error'"
              class="p-4 bg-red-900/20 border border-red-700/40 rounded-xl text-red-300 text-sm"
            >
              ✕ Processing failed. Please try re-uploading your statement.
            </div>

            <!-- Delete Button -->
            <button
              @click="showDeleteModal = true"
              class="w-full py-3 bg-transparent border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-full font-semibold transition-colors mt-4"
            >
              Delete Statement
            </button>
          </div>
        </template>
      </main>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal 
      :is-open="showDeleteModal"
      :filename="statement?.filename"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>
