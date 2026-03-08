import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Statement, StatementUpdate } from '@/types/statement.types'
import { statementsService } from '@/services/statements.service'

export const useStatementsStore = defineStore('statements', () => {
    const statements = ref<Statement[]>([])
    const selectedStatement = ref<Statement | null>(null)
    const filters = ref<{ tags: string[]; status: string; dateRange: [string, string] | null }>({
        tags: [],
        status: '',
        dateRange: null,
    })
    const isLoading = ref(false)

    async function fetchStatements(): Promise<void> {
        isLoading.value = true
        try {
            statements.value = await statementsService.list()
        } finally {
            isLoading.value = false
        }
    }

    async function uploadStatement(file: File, metadata?: Partial<StatementUpdate>): Promise<Statement> {
        isLoading.value = true
        try {
            const newStatement = await statementsService.upload(file, metadata)
            statements.value.unshift(newStatement)
            return newStatement
        } finally {
            isLoading.value = false
        }
    }

    async function updateTags(id: string, tags: string[]): Promise<void> {
        const updated = await statementsService.update(id, { tags })
        const idx = statements.value.findIndex((s) => s.id === id)
        if (idx !== -1) statements.value[idx] = updated
    }

    async function deleteStatement(id: string): Promise<void> {
        await statementsService.delete(id)
        statements.value = statements.value.filter((s) => s.id !== id)
    }

    return {
        statements,
        selectedStatement,
        filters,
        isLoading,
        fetchStatements,
        uploadStatement,
        updateTags,
        deleteStatement,
    }
})
