<script setup lang="ts">
type Status = 'uploaded' | 'redacting' | 'redacted' | 'analysing' | 'done' | 'error'
defineProps<{ status: Status }>()

const config: Record<Status, { label: string; classes: string }> = {
  uploaded: { label: 'Uploaded', classes: 'bg-gray-700 text-gray-300' },
  redacting: { label: 'Redacting', classes: 'bg-yellow-900/40 text-yellow-300' },
  redacted: { label: 'Redacted', classes: 'bg-blue-900/40 text-blue-300' },
  analysing: { label: 'Analysing', classes: 'bg-purple-900/40 text-purple-300' },
  done: { label: 'Done', classes: 'bg-green-900/40 text-green-300' },
  error: { label: 'Error', classes: 'bg-red-900/40 text-red-300' },
}
</script>

<template>
  <span
    :class="['px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0', config[status].classes]"
  >
    {{ config[status].label }}
  </span>
</template>
