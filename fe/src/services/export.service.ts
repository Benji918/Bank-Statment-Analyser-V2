import api from './api'
import { saveAs } from 'file-saver'

export const exportService = {
    async exportPdf(statementId: string): Promise<void> {
        const response = await api.get(`/exports/${statementId}/pdf`, { responseType: 'blob' })
        saveAs(new Blob([response.data], { type: 'application/pdf' }), `insight_${statementId}.pdf`)
    },

    async exportExcel(statementId: string): Promise<void> {
        const response = await api.get(`/exports/${statementId}/excel`, { responseType: 'blob' })
        saveAs(
            new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
            `insight_${statementId}.xlsx`
        )
    },

    async exportJson(statementId: string): Promise<void> {
        const response = await api.get(`/exports/${statementId}/json`, { responseType: 'blob' })
        saveAs(new Blob([response.data], { type: 'application/json' }), `insight_${statementId}.json`)
    },
}
