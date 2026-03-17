<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppToast from './components/layout/AppToast.vue'
import { useUiStore } from './stores/ui.store'

const uiStore = useUiStore()

onMounted(() => {
  uiStore.updateThemeClass()
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100 transition-colors duration-300 font-primary">
    <RouterView />
    <AppToast />
  </div>
</template>
