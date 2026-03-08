<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

const props = defineProps<{ pdfBlob: Blob }>()

const canvasRefs = ref<HTMLCanvasElement[]>([])
const numPages = ref(0)
const isRendering = ref(true)

onMounted(async () => {
  const arrayBuffer = await props.pdfBlob.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  numPages.value = pdf.numPages

  await new Promise((r) => setTimeout(r, 50)) // wait for canvases

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = canvasRefs.value[i - 1]
    if (!canvas) continue
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport }).promise
  }
  isRendering.value = false
})
</script>

<template>
  <div class="space-y-4">
    <div v-if="isRendering" class="flex items-center justify-center h-40">
      <div class="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
    <canvas
      v-for="n in numPages"
      :key="n"
      :ref="(el) => { if (el) canvasRefs[n - 1] = el as HTMLCanvasElement }"
      class="w-full rounded-lg border border-gray-700 shadow-lg"
    />
  </div>
</template>
