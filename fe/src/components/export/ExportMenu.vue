<script setup lang="ts">
import { ref } from 'vue'
import { useExport } from '@/composables/useExport'

const props = defineProps<{ statementId: string }>()
const emit = defineEmits<{ (e: 'preview-pdf'): void }>()
const isOpen = ref(false)
const { downloadExcel, downloadJson } = useExport(props.statementId)
</script>

<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-4 py-2 bg-[#262626] text-white rounded-full text-sm hover:bg-gray-700 transition-colors"
    >
      ↓ Export
      <span class="text-xs">▾</span>
    </button>
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-44 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl z-30 overflow-hidden"
        @click="isOpen = false"
      >
        <button @click="emit('preview-pdf'); isOpen = false" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left">
          📄 Export as PDF
        </button>
        <button @click="downloadExcel" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left">
          📊 Export as Excel
        </button>
        <button @click="downloadJson" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left">
          { } Export as JSON
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
