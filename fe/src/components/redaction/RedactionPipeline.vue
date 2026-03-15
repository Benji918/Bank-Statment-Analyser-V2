<script setup lang="ts">
defineProps<{
  step: 'upload' | 'detecting' | 'preview' | 'applying' | 'final' | 'uploading' | 'done'
}>()

const steps = [
  { key: 'upload', label: 'Select' },
  { key: 'detecting', label: 'Analyze' },
  { key: 'preview', label: 'Highlights' },
  { key: 'final', label: 'Redacted' },
  { key: 'uploading', label: 'Upload' },
  { key: 'done', label: 'Done' },
] as const

type StepKey = typeof steps[number]['key'] | 'applying'

function getStepIndex(key: StepKey) {
  if (key === 'applying') return 2.5 // Special case for transition
  return steps.findIndex((s) => s.key === key)
}
</script>

<template>
  <div class="flex items-center gap-0 mb-8 overflow-x-auto pb-2 noscrollbar">
    <template v-for="(s, i) in steps" :key="s.key">
      <div class="flex flex-col items-center flex-shrink-0">
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
            'text-[10px] mt-1 whitespace-nowrap uppercase tracking-tighter',
            getStepIndex(step) === i ? 'text-white font-bold' : 'text-gray-500',
          ]"
        >{{ s.label }}</span>
      </div>
      <div v-if="i < steps.length - 1" class="flex-1 min-w-[30px] h-px bg-gray-800 mx-1 mt-[-10px]" />
    </template>
  </div>
</template>

<style scoped>
.noscrollbar::-webkit-scrollbar {
  display: none;
}
.noscrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
