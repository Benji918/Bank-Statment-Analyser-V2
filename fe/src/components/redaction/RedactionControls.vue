<script setup lang="ts">
// RedactionControls: allows user to draw additional manual redaction boxes
// This is a placeholder for the canvas-drawing interaction
</script>

<template>
  <div class="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
    <h3 class="font-heading font-semibold text-white mb-2 text-sm">Manual Redaction Controls</h3>
    <p class="text-gray-400 text-xs mb-3">Draw additional black boxes over any areas you want redacted.</p>
    <div class="flex gap-2">
      <button class="px-3 py-1.5 bg-[#262626] text-gray-300 rounded-lg text-xs hover:bg-gray-700 transition-colors">
        ✎ Draw Box
      </button>
      <button class="px-3 py-1.5 bg-[#262626] text-gray-300 rounded-lg text-xs hover:bg-gray-700 transition-colors">
        ↺ Undo
      </button>
      <button class="px-3 py-1.5 bg-[#262626] text-gray-300 rounded-lg text-xs hover:bg-gray-700 transition-colors">
        ✕ Clear All
      </button>
    </div>
  </div>
</template>
