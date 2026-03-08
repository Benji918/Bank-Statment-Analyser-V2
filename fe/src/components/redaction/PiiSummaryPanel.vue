<script setup lang="ts">
defineProps<{ entitiesSummary: Record<string, number> }>()
</script>

<template>
  <div class="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
    <h3 class="font-heading font-semibold text-white mb-3">PII Detected & Redacted</h3>
    <div v-if="Object.keys(entitiesSummary).length === 0" class="text-gray-400 text-sm">
      No PII detected on first pass.
    </div>
    <ul v-else class="space-y-2">
      <li
        v-for="(count, type) in entitiesSummary"
        :key="type"
        class="flex items-center justify-between text-sm"
      >
        <span class="text-gray-300 capitalize">{{ type.replace(/_/g, ' ').toLowerCase() }}</span>
        <span class="px-2 py-0.5 bg-accent/20 text-accent rounded-full font-mono text-xs">{{ count }}</span>
      </li>
    </ul>
    <p class="mt-4 text-xs text-gray-500 leading-relaxed">
      These items have been blacked out in the preview. The server will run an additional Presidio scan for extra safety.
    </p>
  </div>
</template>
