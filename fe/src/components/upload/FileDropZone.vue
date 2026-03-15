<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ (e: 'file-selected', file: File): void }>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) emit('file-selected', file)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) emit('file-selected', file)
}

function openFilePicker() {
  fileInput.value?.click()
}
const maxUploadSize = import.meta.env.VITE_MAX_UPLOAD_SIZE_MB ?? 20
</script>

<template>
  <div
    :class="[
      'border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center',
      isDragging
        ? 'border-accent bg-accent/10 scale-[1.01]'
        : 'border-gray-700 hover:border-gray-500 hover:bg-white/5',
    ]"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @click="openFilePicker"
  >
    <div class="text-5xl mb-4">📄</div>
    <p class="text-white font-heading font-semibold text-lg mb-1">Drop your PDF here</p>
    <p class="text-gray-400 text-sm">or click to browse — max {{ maxUploadSize }}MB</p>
    <input ref="fileInput" type="file" accept="application/pdf" class="hidden" @change="onFileChange" />
  </div>
</template>
