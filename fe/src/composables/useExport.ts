import { exportService } from '@/services/export.service'
import { useUiStore } from '@/stores/ui.store'

export function useExport(statementId: string) {
    const uiStore = useUiStore()

    async function downloadPdf(): Promise<void> {
        try {
            await exportService.exportPdf(statementId)
            uiStore.showToast('PDF report downloaded successfully', 'success')
        } catch {
            uiStore.showToast('Failed to download PDF report', 'error')
        }
    }

    async function downloadExcel(): Promise<void> {
        try {
            await exportService.exportExcel(statementId)
            uiStore.showToast('Excel report downloaded successfully', 'success')
        } catch {
            uiStore.showToast('Failed to download Excel report', 'error')
        }
    }

    async function downloadJson(): Promise<void> {
        try {
            await exportService.exportJson(statementId)
            uiStore.showToast('JSON export downloaded successfully', 'success')
        } catch {
            uiStore.showToast('Failed to download JSON export', 'error')
        }
    }

    return { downloadPdf, downloadExcel, downloadJson }
}
