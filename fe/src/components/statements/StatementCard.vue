<script setup lang="ts">
import type { Statement } from '@/types/statement.types'
import { formatDate, formatFileSize } from '@/utils/formatters'
import StatementStatusBadge from './StatementStatusBadge.vue'
import StatementTagBadge from './StatementTagBadge.vue'
import { useStatementsStore } from '@/stores/statements.store'

defineProps<{ statement: Statement }>()
const emit = defineEmits<{ (e: 'click', id: string): void }>()
const store = useStatementsStore()

const onDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this statement?')) {
    await store.deleteStatement(id)
  }
}

const onRetry = async (id: string) => {
  await store.retryAnalysis(id)
}
</script>

<template>
  <div
    class="p-5 bg-[#1a1a1a] rounded-xl border border-gray-800 hover:border-gray-600 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    @click="emit('click', statement.id)"
  >
    <div class="flex items-start justify-between gap-4 mb-3">
      <div class="flex-1 min-w-0">
        <p class="text-white font-medium truncate text-sm">{{ statement.filename }}</p>
        <p class="text-gray-500 text-xs mt-0.5">
          {{ statement.bank_name ?? 'Unknown Bank' }} · {{ statement.statement_month ?? 'Unknown Period' }}
        </p>
      </div>
      <StatementStatusBadge :status="statement.status" />
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <StatementTagBadge v-for="tag in statement.tags" :key="tag" :tag="tag" />
    </div>

    <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
      <span class="text-xs text-gray-500">{{ formatDate(statement.uploaded_at) }}</span>
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-500" v-if="statement.file_size_bytes">
          {{ formatFileSize(statement.file_size_bytes) }}
        </span>
        
        <button v-if="statement.status === 'error'" @click.stop="onRetry(statement.id)" class="text-xs flex items-center gap-1 font-semibold text-[#0099FF] hover:text-[#0000EE] transition-colors" title="Retry Analysis">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          Retry
        </button>

        <button @click.stop="onDelete(statement.id)" class="text-gray-500 hover:text-red-500 transition-colors" title="Delete Statement">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>
