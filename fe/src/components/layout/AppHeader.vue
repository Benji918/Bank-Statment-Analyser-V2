<script setup lang="ts">
import { useRoute } from 'vue-router'
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
  <header class="h-16 flex items-center justify-between px-8 border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10 transition-all">
    <div class="flex items-center gap-4">
      <div class="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#0000EE] to-[#0099FF]"></div>
      <h1 class="font-heading font-bold text-white text-xl tracking-wide">{{ getPageTitle() }}</h1>
    </div>
    
    <div class="flex items-center gap-5">
      <!-- Notification Icon (Mock) -->
      <button class="text-gray-500 hover:text-white transition-colors relative">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        <div class="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#0099FF] ring-2 ring-[#0a0a0a]"></div>
      </button>

      <!-- Avatar -->
      <div class="flex items-center gap-3 pl-5 border-l border-[#222]">
        <div class="text-right hidden md:block">
          <p class="text-white text-sm font-semibold">{{ authStore.user?.full_name || 'User' }}</p>
          <p class="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Admin</p>
        </div>
        <div class="w-9 h-9 border border-[#0099FF]/40 rounded-full bg-gradient-to-tr from-[#0000EE] to-[#0099FF] flex items-center justify-center text-white text-sm font-bold shadow-[0_0_15px_rgba(0,153,255,0.3)] shadow-[#0099FF]/20">
          {{ authStore.user?.full_name?.charAt(0)?.toUpperCase() ?? 'U' }}
        </div>
      </div>
    </div>
  </header>
</template>
