<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import LogoIcon from '@/components/layout/LogoIcon.vue'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/statements', label: 'Statements', icon: '📄' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <aside 
    class="fixed left-0 top-0 h-full bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-r border-slate-200 dark:border-[#1a1a1a] flex flex-col z-30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
    :class="uiStore.isSidebarCollapsed ? 'w-20' : 'w-64'"
  >
    <!-- Logo & Toggle -->
    <div class="p-4 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-3 overflow-hidden transition-all duration-300" :class="uiStore.isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'">
        <div class="w-10 h-10 p-2 bg-slate-100 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#222] rounded-xl flex items-center justify-center shrink-0">
          <LogoIcon />
        </div>
        <div class="flex flex-col whitespace-nowrap">
          <span class="font-heading font-bold text-slate-900 dark:text-white text-base tracking-tight">IntelliBank</span>
        </div>
      </RouterLink>
      
      <button 
        @click="uiStore.toggleSidebar"
        class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-[#111] hover:bg-slate-200 dark:hover:bg-[#1a1a1a] text-slate-500 dark:text-gray-400 transition-colors shrink-0"
      >
        <span class="text-xl transition-transform duration-500" :class="uiStore.isSidebarCollapsed ? 'rotate-180' : ''">‹</span>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
      <div 
        class="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] px-4 mb-4 whitespace-nowrap overflow-hidden transition-all duration-300"
        :class="uiStore.isSidebarCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'"
      >
        Dashboard
      </div>
      
      <RouterLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 dark:text-gray-400 font-medium group transition-all duration-300 border border-transparent hover:bg-slate-100 dark:hover:bg-[#111] hover:text-[#0099FF]"
        active-class="bg-[#0099FF]/10 !text-[#0099FF] !font-bold !border-[#0099FF]/20"
        v-tooltip="uiStore.isSidebarCollapsed ? link.label : ''"
      >
        <span class="text-xl shrink-0">{{ link.icon }}</span>
        <span 
          class="tracking-normal whitespace-nowrap transition-all duration-300 overflow-hidden"
          :class="uiStore.isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'"
        >
          {{ link.label }}
        </span>
      </RouterLink>
    </nav>

    <!-- Bottom Actions -->
    <div class="p-3 space-y-3">
      <RouterLink
        to="/statements/upload"
        class="flex items-center gap-4 w-full h-12 rounded-2xl bg-[#0099FF] text-white font-bold hover:shadow-[0_8px_20px_rgba(0,153,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden"
        :class="uiStore.isSidebarCollapsed ? 'justify-center p-0' : 'px-4'"
      >
        <span class="text-xl shrink-0">+</span>
        <span 
          class="whitespace-nowrap transition-all duration-300"
          :class="uiStore.isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'"
        >
          New Analysis
        </span>
      </RouterLink>

      <div class="p-3 border-t border-slate-200 dark:border-[#1a1a1a] bg-slate-50 dark:bg-[#080808]/50 rounded-2xl transition-all duration-300">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0000EE] to-[#0099FF] flex items-center justify-center text-white text-sm font-black shadow-lg shadow-[#0099FF]/20 shrink-0">
            {{ authStore.user?.full_name?.charAt(0)?.toUpperCase() ?? 'U' }}
          </div>
          <div 
            class="flex flex-col min-w-0 transition-all duration-300"
            :class="uiStore.isSidebarCollapsed ? 'w-0 opacity-0 invisible' : 'w-full opacity-100 visible'"
          >
            <span class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ authStore.user?.full_name || 'My Account' }}</span>
          </div>
          <button
            @click="handleLogout"
            class="p-2 text-slate-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
            :class="uiStore.isSidebarCollapsed ? 'hidden' : 'block'"
          >
            ⎋
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #222;
  border-radius: 10px;
}
</style>
