<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'

const props = defineProps<{ 
  pdfBlob: Blob | null,
  entities: any[]
}>()

const emit = defineEmits<{
  (e: 'ready'): void
}>()

const pdfUrl = ref<string | null>(null)
const isLoading = ref(true)
const scale = ref(1.2) // Default zoom

watch(() => props.pdfBlob, (newBlob) => {
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value)
  }
  
  if (newBlob) {
    pdfUrl.value = URL.createObjectURL(newBlob)
    isLoading.value = true
  } else {
    pdfUrl.value = null
  }
}, { immediate: true })

onUnmounted(() => {
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value)
  }
})

function handleDocumentRender() {
  isLoading.value = false
  emit('ready')
}

function zoomIn() {
  scale.value = Math.min(scale.value + 0.2, 3)
}

function zoomOut() {
  scale.value = Math.max(scale.value - 0.2, 0.5)
}

function resetZoom() {
  scale.value = 1.2
}
</script>

<template>
  <div class="relative flex flex-col h-[750px] w-full bg-[#111] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
    <!-- Zoom Controls -->
    <div class="absolute top-4 right-4 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-gray-700 p-1.5 rounded-xl">
      <button 
        @click="zoomOut"
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        title="Zoom Out"
      >
        <span class="text-xl">−</span>
      </button>
      <span class="text-xs font-mono text-gray-400 min-w-[45px] text-center">
        {{ Math.round(scale * 100) }}%
      </span>
      <button 
        @click="zoomIn"
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        title="Zoom In"
      >
        <span class="text-xl">+</span>
      </button>
      <div class="w-px h-4 bg-gray-700 mx-1"></div>
      <button 
        @click="resetZoom"
        class="px-2 py-1 text-[10px] uppercase tracking-wider font-bold hover:bg-gray-800 text-gray-400 hover:text-white rounded-md transition-colors"
      >
        Reset
      </button>
    </div>

    <div class="flex-1 w-full overflow-y-auto custom-scrollbar p-4">
      <div v-if="pdfUrl" class="flex justify-center">
        <div class="shadow-2xl bg-white ring-1 ring-gray-800">
          <VuePdfEmbed 
            :source="pdfUrl" 
            :scale="scale"
            @rendered="handleDocumentRender"
          />
        </div>
      </div>
    </div>
    
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-20">
      <div class="flex flex-col items-center">
        <div class="relative w-24 h-24 mb-6">
            <div class="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl animate-pulse">🔒</span>
            </div>
        </div>
        <h3 class="text-white font-heading text-xl font-bold mb-2">Secure Redaction Engine</h3>
        <p class="text-gray-400 text-sm">Preparing document preview...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #000;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #444;
}
</style>
