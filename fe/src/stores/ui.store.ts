import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    duration?: number
}

export const useUiStore = defineStore('ui', () => {
    const isGlobalLoading = ref(false)
    const toasts = ref<Toast[]>([])
    const activeModal = ref<string | null>(null)

    function showToast(message: string, type: Toast['type'] = 'info', duration = 4000): void {
        const id = Date.now().toString()
        toasts.value.push({ id, message, type, duration })
        setTimeout(() => removeToast(id), duration)
    }

    function removeToast(id: string): void {
        toasts.value = toasts.value.filter((t) => t.id !== id)
    }

    function openModal(name: string): void {
        activeModal.value = name
    }

    function closeModal(): void {
        activeModal.value = null
    }

    return { isGlobalLoading, toasts, activeModal, showToast, removeToast, openModal, closeModal }
})
