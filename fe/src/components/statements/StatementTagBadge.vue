<script setup lang="ts">
defineProps<{ tag: string }>()

// Simple deterministic color from tag name
function tagColor(tag: string): string {
  const colors = ['#0099FF', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2']
  let hash = 0
  for (const c of tag) hash = (hash * 31 + c.charCodeAt(0)) % colors.length
  return colors[Math.abs(hash)]
}
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
    :style="{ backgroundColor: tagColor(tag) + '20', color: tagColor(tag), borderColor: tagColor(tag) + '40', border: '1px solid' }"
  >
    {{ tag }}
  </span>
</template>
