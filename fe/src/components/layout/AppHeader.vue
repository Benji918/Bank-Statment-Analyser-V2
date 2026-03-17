<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const authStore = useAuthStore()

function getPageTitle(): string {
  const map: Record<string, string> = {
    dashboard: 'Dashboard',
    statements: 'Statements',
    'statement-upload': 'Upload Statement',
    'statement-detail': 'Statement Detail',
    insights: 'Financial Insights',
    settings: 'Settings',
  }
  return map[String(route.name)] ?? 'Bank Analyser'
}
</script>

<template>
  <header class="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-[#1a1a1a] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10 transition-all duration-500">
    <div class="flex items-center gap-4">
      <div class="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#0000EE] to-[#0099FF]"></div>
      <h1 class="font-heading font-bold text-slate-900 dark:text-white text-xl tracking-wide">{{ getPageTitle() }}</h1>
    </div>
    
    <div class="flex items-center gap-5">
      <!-- Avatar Link to Settings -->
      <RouterLink to="/settings" class="flex items-center gap-3 pl-5 border-l border-slate-200 dark:border-[#222] hover:opacity-80 transition-opacity">
        <div class="text-right hidden md:block max-w-[120px]">
          <p class="text-slate-900 dark:text-white text-sm font-bold truncate">{{ authStore.user?.full_name?.split(' ')[0] || 'My Account' }}</p>
        </div>
        <div class="w-9 h-9 border border-[#0099FF]/40 rounded-full bg-gradient-to-tr from-[#0000EE] to-[#0099FF] flex items-center justify-center text-white text-sm font-bold shadow-[0_0_15px_rgba(0,153,255,0.3)] shadow-[#0099FF]/20">
          {{ authStore.user?.full_name?.charAt(0)?.toUpperCase() ?? 'U' }}
        </div>
      </RouterLink>
    </div>
  </header>
</template>
