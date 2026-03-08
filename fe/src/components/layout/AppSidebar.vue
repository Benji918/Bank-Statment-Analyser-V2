<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import LogoIcon from '@/components/layout/LogoIcon.vue'

const router = useRouter()
const authStore = useAuthStore()

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
  <aside class="fixed left-0 top-0 h-full w-64 bg-[#050505] border-r border-[#1a1a1a] flex flex-col z-20 transition-all">
    <!-- Logo -->
    <div class="p-6">
      <RouterLink to="/" class="flex items-center gap-4 group">
        <div class="w-10 h-10 p-2 bg-[#0a0a0a] border border-[#222] rounded-xl flex items-center justify-center group-hover:border-[#0099FF] group-hover:shadow-[0_0_15px_rgba(0,153,255,0.2)] transition-all">
          <LogoIcon />
        </div>
        <div>
          <span class="font-heading font-bold text-white text-base tracking-wide block">IntelliBank</span>
          <span class="text-[10px] text-[#0099FF] font-medium tracking-widest uppercase">Finance</span>
        </div>
      </RouterLink>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6 space-y-2 mt-2">
      <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest pl-3 mb-4">Main Menu</div>
      
      <RouterLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 font-medium group transition-all duration-300 border border-transparent hover:border-[#222]"
        active-class="bg-[#111] text-white border-[#222] shadow-inner font-semibold"
      >
        <span class="text-lg group-hover:text-white transition-colors">{{ link.icon }}</span>
        <span class="tracking-wide">{{ link.label }}</span>
      </RouterLink>
    </nav>

    <!-- Upload CTA -->
    <div class="p-5 relative">
      <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none"></div>
      <RouterLink
        to="/statements/upload"
        class="relative flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-white text-[#0000EE] rounded-xl text-sm font-heading font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] focus:ring-2 focus:ring-white/50"
      >
        <span>+</span> Upload Statement
      </RouterLink>
    </div>

    <!-- User Profile / Logout -->
    <div class="p-5 border-t border-[#1a1a1a] bg-[#080808]">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0000EE] to-[#0099FF] flex items-center justify-center text-white text-sm font-bold shadow-md">
            {{ authStore.user?.full_name?.charAt(0)?.toUpperCase() ?? 'U' }}
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-medium text-white max-w-[100px] truncate">{{ authStore.user?.full_name || 'User' }}</span>
            <span class="text-[10px] text-gray-500">Pro Plan</span>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          title="Sign out"
        >
          ⎋
        </button>
      </div>
    </div>
  </aside>
</template>
