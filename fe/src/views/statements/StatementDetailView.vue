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
    // If we land on the page and it's already analyzing, start polling automatically
    if (statement.value.status === 'analysing' || statement.value.status === 'redacting') {
      startPolling()
    }
  } catch {
    uiStore.showToast('Failed to load statement', 'error')
  } finally {
    isLoading.value = false
  }
})

async function runAnalysis() {
  try {
    await analysisStore.triggerAnalysis(statementId)
    if (statement.value) {
      statement.value.status = 'analysing'
    }
    uiStore.showToast('Analysis started', 'info')
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
    uiStore.showToast('Statement deleted', 'success')
    router.push('/statements')
  } catch {
    uiStore.showToast('Failed to delete statement', 'error')
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
              class="text-center py-6 bg-[#1a1a1a] rounded-xl border border-gray-800"
            >
              <div class="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p class="text-white text-sm font-medium capitalize">{{ statement.status }}…</p>
              <p class="text-gray-400 text-xs mt-1">This may take a minute. The page will update automatically.</p>
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
