<script setup lang="ts">
defineProps<{
  step: 'upload' | 'detecting' | 'preview' | 'confirm' | 'uploading' | 'done'
}>()

const steps = [
  { key: 'upload', label: 'Select PDF' },
  { key: 'detecting', label: 'Detecting PII' },
  { key: 'preview', label: 'Review' },
  { key: 'confirm', label: 'Confirm' },
  { key: 'uploading', label: 'Uploading' },
  { key: 'done', label: 'Done' },
] as const

type StepKey = typeof steps[number]['key']

function getStepIndex(key: StepKey) {
  return steps.findIndex((s) => s.key === key)
}
</script>

<template>
  <div class="flex items-center gap-0 mb-8">
    <template v-for="(s, i) in steps" :key="s.key">
      <div class="flex flex-col items-center">
        <div
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
            getStepIndex(step) > i ? 'bg-accent text-white' :
            getStepIndex(step) === i ? 'bg-white text-[#0000EE] ring-2 ring-white/40' :
            'bg-gray-800 text-gray-500',
          ]"
        >
          {{ getStepIndex(step) > i ? '✓' : i + 1 }}
        </div>
        <span
          :class="[
            'text-xs mt-1 whitespace-nowrap',
            getStepIndex(step) === i ? 'text-white font-medium' : 'text-gray-500',
          ]"
        >{{ s.label }}</span>
      </div>
      <div v-if="i < steps.length - 1" class="flex-1 h-px bg-gray-800 mx-2 mt-[-12px]" />
    </template>
  </div>
</template>
