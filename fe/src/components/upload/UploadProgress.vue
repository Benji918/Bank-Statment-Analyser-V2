<script setup lang="ts">
defineProps<{ progress: number; label?: string }>()
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between text-xs text-gray-400 mb-1">
      <span>{{ label ?? 'Uploading…' }}</span>
      <span>{{ progress }}%</span>
    </div>
    <div class="w-full bg-gray-800 rounded-full h-1.5">
      <div
        class="bg-accent h-1.5 rounded-full transition-all duration-300"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>
