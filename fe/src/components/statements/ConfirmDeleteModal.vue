<script setup lang="ts">
defineProps<{
  isOpen: boolean
  filename?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
      <div class="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-up" @click.stop>
        <div class="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
          <span class="text-red-500 text-2xl font-black">!</span>
        </div>
        
        <h3 class="text-2xl font-heading font-black text-center text-slate-900 dark:text-white mb-2">Delete Statement?</h3>
        
        <p class="text-center text-slate-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
          Are you sure you want to delete <span class="font-bold text-slate-700 dark:text-gray-300">{{ filename || 'this statement' }}</span>? This action is permanent and will remove all associated financial insights.
        </p>

        <div class="flex gap-4">
          <button 
            @click="emit('close')"
            class="flex-1 py-3 px-4 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          
          <button 
            @click="emit('confirm')"
            class="flex-1 py-3 px-4 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 hover:shadow-[0_8px_20px_rgba(239,68,68,0.3)] transition-all active:scale-[0.98]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
