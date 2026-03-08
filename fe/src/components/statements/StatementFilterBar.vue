<script setup lang="ts">
const emit = defineEmits<{
  (e: 'update:tag', value: string): void
  (e: 'update:status', value: string): void
  (e: 'clear'): void
}>()

defineProps<{ tag?: string; status?: string }>()
</script>

<template>
  <div class="flex flex-wrap gap-3 p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 mb-6">
    <input
      type="text"
      placeholder="Filter by tag…"
      class="flex-1 min-w-[140px] bg-black border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent"
      @input="emit('update:tag', ($event.target as HTMLInputElement).value)"
    />
    <select
      class="bg-black border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent"
      @change="emit('update:status', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">All statuses</option>
      <option value="uploaded">Uploaded</option>
      <option value="redacted">Redacted</option>
      <option value="done">Done</option>
      <option value="error">Error</option>
    </select>
    <button
      @click="emit('clear')"
      class="px-3 py-1.5 bg-[#262626] text-gray-400 hover:text-white rounded-lg text-sm transition-colors"
    >
      Clear
    </button>
  </div>
</template>
