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
    const isSidebarCollapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')
    const theme = ref<'light' | 'dark'>( (localStorage.getItem('theme') as 'light' | 'dark') || 'dark')

    function showToast(message: string, type: Toast['type'] = 'info', duration = 4000): void {
        const id = Date.now().toString()
        toasts.value.push({ id, message, type, duration })
        setTimeout(() => removeToast(id), duration)
    }

    function removeToast(id: string): void {
        toasts.value = toasts.value.filter((t) => t.id !== id)
    }

    function toggleSidebar(): void {
        isSidebarCollapsed.value = !isSidebarCollapsed.value
        localStorage.setItem('sidebar-collapsed', String(isSidebarCollapsed.value))
    }

    function toggleTheme(): void {
        theme.value = theme.value === 'light' ? 'dark' : 'light'
        localStorage.setItem('theme', theme.value)
        updateThemeClass()
    }

    function updateThemeClass(): void {
        if (theme.value === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    function openModal(name: string): void {
        activeModal.value = name
    }

    function closeModal(): void {
        activeModal.value = null
    }

    return { 
        isGlobalLoading, 
        toasts, 
        activeModal, 
        isSidebarCollapsed, 
        theme,
        showToast, 
        removeToast, 
        toggleSidebar, 
        toggleTheme,
        updateThemeClass,
        openModal, 
        closeModal 
    }
})
