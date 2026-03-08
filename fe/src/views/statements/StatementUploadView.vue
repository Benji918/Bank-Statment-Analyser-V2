<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import FileDropZone from '@/components/upload/FileDropZone.vue'
import UploadProgress from '@/components/upload/UploadProgress.vue'
import RedactionPipeline from '@/components/redaction/RedactionPipeline.vue'
import PdfRedactionViewer from '@/components/redaction/PdfRedactionViewer.vue'
import PiiSummaryPanel from '@/components/redaction/PiiSummaryPanel.vue'
import RedactionControls from '@/components/redaction/RedactionControls.vue'
import RedactionConfirmModal from '@/components/redaction/RedactionConfirmModal.vue'
import { usePdfRedaction } from '@/composables/usePdfRedaction'
import { useFileUpload } from '@/composables/useFileUpload'
import { useUiStore } from '@/stores/ui.store'

type Step = 'upload' | 'detecting' | 'preview' | 'confirm' | 'uploading' | 'done'

const router = useRouter()
const uiStore = useUiStore()
const { redactPdf, isProcessing, progress: redactProgress } = usePdfRedaction()
const { validateFile, uploadRedactedFile, isUploading, uploadProgress } = useFileUpload()

const step = ref<Step>('upload')
const selectedFile = ref<File | null>(null)
const redactedBlob = ref<Blob | null>(null)
const entitiesSummary = ref<Record<string, number>>({})
const showConfirmModal = ref(false)

async function onFileSelected(file: File) {
  const error = validateFile(file)
  if (error) {
    uiStore.showToast(error, 'error')
    return
  }

  selectedFile.value = file
  step.value = 'detecting'

  try {
    const result = await redactPdf(file)
    redactedBlob.value = result.redactedBlob
    entitiesSummary.value = result.entitiesSummary
    step.value = 'preview'
  } catch (e: any) {
    uiStore.showToast(e?.message ?? 'Redaction failed', 'error')
    step.value = 'upload'
  }
}

function onConfirmClick() {
  showConfirmModal.value = true
}

async function onConfirmedUpload() {
  showConfirmModal.value = false
  step.value = 'uploading'

  try {
    const statement = await uploadRedactedFile(redactedBlob.value!, selectedFile.value!.name)
    step.value = 'done'
    uiStore.showToast('Statement uploaded successfully!', 'success')
    setTimeout(() => router.push(`/statements/${statement.id}`), 1200)
  } catch (e: any) {
    uiStore.showToast(e?.message ?? 'Upload failed', 'error')
    step.value = 'preview'
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-black">
    <AppSidebar />
    <div class="flex-1 ml-60 flex flex-col">
      <AppHeader />
      <main class="flex-1 p-8 max-w-4xl">
        <h2 class="font-heading text-2xl font-bold text-white mb-6">Upload Statement</h2>
        <RedactionPipeline :step="step" />

        <!-- Step: Upload -->
        <div v-if="step === 'upload'">
          <FileDropZone @file-selected="onFileSelected" />
        </div>

        <!-- Step: Detecting -->
        <div v-else-if="step === 'detecting'" class="text-center py-16">
          <div class="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p class="text-white font-heading font-semibold">Detecting PII…</p>
          <p class="text-gray-400 text-sm mt-1">Running client-side analysis on your document</p>
          <div class="mt-6 max-w-xs mx-auto">
            <UploadProgress :progress="redactProgress" label="Analysing PDF…" />
          </div>
        </div>

        <!-- Step: Preview -->
        <div v-else-if="step === 'preview'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <p class="text-white font-heading font-semibold mb-3">Redacted Preview</p>
            <PdfRedactionViewer v-if="redactedBlob" :pdf-blob="redactedBlob" />
          </div>
          <div class="space-y-4">
            <PiiSummaryPanel :entities-summary="entitiesSummary" />
            <RedactionControls />
            <button
              @click="onConfirmClick"
              class="w-full py-3 px-4 bg-white text-[#0000EE] rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Review & Confirm →
            </button>
          </div>
        </div>

        <!-- Step: Uploading -->
        <div v-else-if="step === 'uploading'" class="text-center py-16">
          <div class="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p class="text-white font-heading font-semibold">Uploading…</p>
          <div class="mt-6 max-w-xs mx-auto">
            <UploadProgress :progress="uploadProgress" label="Securely uploading redacted PDF…" />
          </div>
        </div>

        <!-- Step: Done -->
        <div v-else-if="step === 'done'" class="text-center py-16">
          <p class="text-5xl mb-4">✓</p>
          <p class="text-white font-heading text-xl font-semibold">Upload complete!</p>
          <p class="text-gray-400 text-sm mt-1">Redirecting to your statement…</p>
        </div>

        <!-- Confirm Modal -->
        <RedactionConfirmModal
          v-if="showConfirmModal"
          @confirm="onConfirmedUpload"
          @cancel="showConfirmModal = false"
        />
      </main>
    </div>
  </div>
</template>
