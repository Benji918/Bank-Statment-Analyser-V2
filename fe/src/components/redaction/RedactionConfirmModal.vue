<script setup lang="ts">
const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()
</script>

<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-[#111] border border-gray-700 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
      <h2 class="font-heading text-2xl font-bold text-white mb-4">Confirm Redaction</h2>
      <div class="p-4 bg-yellow-900/20 border border-yellow-700/40 rounded-lg mb-6">
        <p class="text-yellow-300 text-sm leading-relaxed">
          ⚠ <strong>Please note:</strong> The redaction system does not guarantee 100% PII removal. 
          Review the preview carefully before confirming. 
          Once confirmed, the redacted version will be uploaded for server-side processing.
        </p>
      </div>
      <p class="text-gray-300 text-sm mb-6">
        By confirming, you acknowledge that you have reviewed the redacted document and you consent 
        to the redacted PDF being uploaded to our servers for AI analysis.
      </p>
      <div class="flex gap-3">
        <button
          @click="emit('cancel')"
          class="flex-1 py-3 px-4 bg-[#262626] text-white rounded-full font-medium hover:bg-gray-700 transition-colors"
        >
          Go Back & Review
        </button>
        <button
          @click="emit('confirm')"
          class="flex-1 py-3 px-4 bg-white text-[#0000EE] rounded-full font-semibold hover:bg-gray-100 transition-colors"
        >
          Confirm & Upload
        </button>
      </div>
    </div>
  </div>
</template>
