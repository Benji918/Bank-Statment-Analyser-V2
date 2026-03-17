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
import { usePdfRedaction } from '@/composables/usePdfRedaction'
import { useFileUpload } from '@/composables/useFileUpload'
import { useUiStore } from '@/stores/ui.store'
import { pdfRestService } from '@/services/pdfrest.service'

type Step = 'upload' | 'detecting' | 'preview' | 'applying' | 'final' | 'uploading' | 'done'

const router = useRouter()
const uiStore = useUiStore()
const { redactPdf, progress: redactProgress } = usePdfRedaction()
const { validateFile, uploadRedactedFile, uploadProgress } = useFileUpload()

const step = ref<Step>('upload')
const selectedFile = ref<File | null>(null)
const workingBlob = ref<Blob | null>(null)
const finalizedBlob = ref<Blob | null>(null)
const detectedEntities = ref<any[]>([])
const entitiesSummary = ref<Record<string, number>>({})
const resourceId = ref<string | null>(null)

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
    workingBlob.value = result.redactedBlob
    detectedEntities.value = result.detectedEntities
    entitiesSummary.value = result.entitiesSummary
    resourceId.value = result.resourceId || null
    step.value = 'preview'
  } catch (e: any) {
    uiStore.showToast(e?.message ?? 'Redaction failed', 'error')
    step.value = 'upload'
  }
}

async function applyFinalRedaction() {
  if (!resourceId.value) return
  
  step.value = 'applying'
  try {
    const applyResult = await pdfRestService.applyRedaction(resourceId.value)
    finalizedBlob.value = await pdfRestService.getResourceBlob(applyResult.outputId)
    step.value = 'final'
  } catch (e: any) {
    uiStore.showToast(e?.message ?? 'Failed to apply redaction', 'error')
    step.value = 'preview'
  }
}

async function onFinalUpload() {
  if (!finalizedBlob.value || !selectedFile.value) return
  
  step.value = 'uploading'
  try {
    const statement = await uploadRedactedFile(finalizedBlob.value, selectedFile.value.name)
    step.value = 'done'
    uiStore.showToast('Statement uploaded successfully!', 'success')
    setTimeout(() => router.push(`/statements/${statement.id}`), 1200)
  } catch (e: any) {
    uiStore.showToast(e?.message ?? 'Upload failed', 'error')
    step.value = 'final'
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-black transition-colors duration-500">
    <AppSidebar />
    <div class="flex-1 ml-60 flex flex-col">
      <AppHeader />
      <main class="flex-1 p-8 max-w-5xl">
        <div class="flex items-center justify-between mb-8">
            <h2 class="font-heading text-3xl font-bold text-white">Secure Upload</h2>
            <div class="max-w-xs w-full">
                <RedactionPipeline :step="step" />
            </div>
        </div>

        <!-- Step: Upload -->
        <div v-if="step === 'upload'">
          <FileDropZone @file-selected="onFileSelected" />
        </div>

        <!-- Step: Detecting -->
        <div v-else-if="step === 'detecting'" class="text-center py-24">
          <div class="relative w-24 h-24 mx-auto mb-8">
            <div class="absolute inset-0 border-4 border-accent/20 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p class="text-white font-heading text-xl font-semibold">Running PII Analysis…</p>
          <p class="text-gray-400 text-sm mt-2">Scanning document for sensitive information</p>
          <div class="mt-8 max-w-sm mx-auto">
            <UploadProgress :progress="redactProgress" label="Searching for entities…" />
          </div>
        </div>

        <!-- Step: Preview (Highlights) -->
        <div v-else-if="step === 'preview'" class="flex flex-col lg:flex-row gap-8">
          <div class="flex-1 space-y-4">
            <div class="flex items-center justify-between bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                <div>
                    <h3 class="text-white font-bold">Step 1: Review Highlights</h3>
                    <p class="text-xs text-gray-500">Verify detected PII shown in <span class="text-red-400 font-bold underline">red highlights</span></p>
                </div>
                <div class="flex gap-3">
                    <button @click="step = 'upload'" class="px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
                    <button 
                        @click="applyFinalRedaction"
                        class="px-6 py-2.5 bg-[#0000EE] text-white rounded-xl text-sm font-bold hover:bg-[#0000CC] transition-all shadow-lg shadow-blue-500/10"
                    >
                        Apply Redactions →
                    </button>
                </div>
            </div>
            <PdfRedactionViewer 
              v-if="workingBlob" 
              :pdf-blob="workingBlob" 
              :entities="detectedEntities"
            />
          </div>
          <div class="w-full lg:w-80 shrink-0">
            <PiiSummaryPanel :entities-summary="entitiesSummary" />
          </div>
        </div>

        <!-- Step: Applying -->
        <div v-else-if="step === 'applying'" class="text-center py-24">
           <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
           <h3 class="text-white font-heading text-xl font-bold">Burning in Redactions…</h3>
           <p class="text-gray-400 text-sm mt-2">Committing changes permanently using PDFrest Cloud</p>
        </div>

        <!-- Step: Final (Blacked Out) -->
        <div v-else-if="step === 'final'" class="flex flex-col lg:flex-row gap-8">
          <div class="flex-1 space-y-4">
            <div class="flex items-center justify-between bg-green-500/5 p-4 rounded-2xl border border-green-500/20">
                <div>
                    <h3 class="text-white font-bold">Step 2: Final Verification</h3>
                    <p class="text-xs text-gray-500">Ensure all sensitive data is properly <span class="bg-black text-white px-1">blacked out</span> before upload.</p>
                </div>
                <div class="flex gap-3">
                    <button @click="step = 'preview'" class="px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors">Go Back</button>
                    <button 
                        @click="onFinalUpload"
                        class="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/10"
                    >
                        Finalize & Upload →
                    </button>
                </div>
            </div>
            <PdfRedactionViewer 
              v-if="finalizedBlob" 
              :pdf-blob="finalizedBlob" 
              :entities="[]"
            />
          </div>
          <div class="w-full lg:w-80 shrink-0 space-y-6">
            <div class="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                <h4 class="text-white font-bold mb-4">Final Check</h4>
                <ul class="text-sm space-y-3 text-gray-400">
                    <li class="flex gap-2">
                        <span class="text-green-500">✓</span>
                        Names removed
                    </li>
                    <li class="flex gap-2">
                        <span class="text-green-500">✓</span>
                        Account numbers hidden
                    </li>
                    <li class="flex gap-2">
                        <span class="text-green-500">✓</span>
                        Addresses scrubbed
                    </li>
                </ul>
            </div>
          </div>
        </div>

        <!-- Step: Uploading -->
        <div v-else-if="step === 'uploading'" class="text-center py-24">
          <div class="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p class="text-white font-heading font-semibold">Uploading to Secure Vault…</p>
          <div class="mt-6 max-w-xs mx-auto">
            <UploadProgress :progress="uploadProgress" label="Synchronizing statement data…" />
          </div>
        </div>

        <!-- Step: Done -->
        <div v-else-if="step === 'done'" class="text-center py-24">
          <div class="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
             <span class="text-4xl">✓</span>
          </div>
          <p class="text-white font-heading text-2xl font-bold">Process Complete</p>
          <p class="text-gray-400 text-sm mt-2">Redirecting to your analysis dashboard…</p>
        </div>
      </main>
    </div>
  </div>
</template>
