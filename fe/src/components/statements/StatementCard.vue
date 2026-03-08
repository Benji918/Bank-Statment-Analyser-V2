<script setup lang="ts">
import type { Statement } from '@/types/statement.types'
import { formatDate, formatFileSize } from '@/utils/formatters'
import StatementStatusBadge from './StatementStatusBadge.vue'
import StatementTagBadge from './StatementTagBadge.vue'

defineProps<{ statement: Statement }>()
const emit = defineEmits<{ (e: 'click', id: string): void }>()
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
      <span class="text-xs text-gray-500" v-if="statement.file_size_bytes">
        {{ formatFileSize(statement.file_size_bytes) }}
      </span>
    </div>
  </div>
</template>
