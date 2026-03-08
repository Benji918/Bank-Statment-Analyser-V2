<script setup lang="ts">
import { useUiStore, type Toast } from '@/stores/ui.store'

const uiStore = useUiStore()

const typeConfig: Record<Toast['type'], { bg: string; icon: string }> = {
  success: { bg: 'bg-green-900/80 border-green-700', icon: '✓' },
  error: { bg: 'bg-red-900/80 border-red-700', icon: '✕' },
  warning: { bg: 'bg-yellow-900/80 border-yellow-700', icon: '⚠' },
  info: { bg: 'bg-blue-900/80 border-blue-700', icon: 'ℹ' },
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in uiStore.toasts"
          :key="toast.id"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md text-white text-sm font-medium pointer-events-auto shadow-lg min-w-[280px] max-w-sm',
            typeConfig[toast.type].bg,
          ]"
        >
          <span class="text-base flex-shrink-0">{{ typeConfig[toast.type].icon }}</span>
          <span class="flex-1">{{ toast.message }}</span>
          <button
            @click="uiStore.removeToast(toast.id)"
            class="flex-shrink-0 text-white/60 hover:text-white transition-colors"
          >✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(100%); }
.toast-leave-to { opacity: 0; transform: translateX(100%); }
</style>
