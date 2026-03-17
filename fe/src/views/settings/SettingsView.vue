<script setup lang="ts">
import { ref, reactive } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

const authStore = useAuthStore()
const uiStore = useUiStore()

const profileForm = reactive({
  full_name: authStore.user?.full_name || '',
  email: authStore.user?.email || '',
  password: ''
})

const isSaving = ref(false)

async function handleProfileUpdate() {
  isSaving.value = true
  try {
    const payload: any = { 
      full_name: profileForm.full_name,
      email: profileForm.email
    }
    if (profileForm.password) payload.password = profileForm.password
    
    await authStore.updateProfile(payload)
    uiStore.showToast('Profile updated successfully', 'success')
    profileForm.password = ''
  } catch (err: any) {
    uiStore.showToast(err.response?.data?.detail || 'Update failed', 'error')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-black transition-colors duration-500">
    <AppSidebar />
    <div 
      class="flex-1 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      :class="uiStore.isSidebarCollapsed ? 'ml-20' : 'ml-64'"
    >
      <AppHeader />
      <main class="flex-1 p-4 lg:p-10 max-w-4xl mx-auto w-full animate-fade-in">
        <header class="mb-10">
          <h2 class="font-heading text-3xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h2>
          <p class="text-slate-500 dark:text-gray-400 text-sm font-medium mt-1">Manage your account preferences and appearance.</p>
        </header>
        <div class="max-w-2xl">
          <!-- Main Content -->
          <div class="space-y-8">
            <!-- Profile Section -->
            <section class="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#1a1a1a] rounded-[2.5rem] p-8 shadow-sm">
              <h3 class="font-heading font-black text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span class="w-2 h-2 rounded-full bg-[#0099FF]"></span> Personal Information
              </h3>
              
              <form @submit.prevent="handleProfileUpdate" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest px-1">Full Name</label>
                    <input 
                      v-model="profileForm.full_name"
                      type="text" 
                      class="w-full bg-slate-50 dark:bg-[#050505] border border-slate-200 dark:border-[#1a1a1a] rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0099FF]/20 focus:border-[#0099FF] transition-all outline-none"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest px-1">Email Address</label>
                    <input 
                      v-model="profileForm.email"
                      type="email" 
                      class="w-full bg-slate-50 dark:bg-[#050505] border border-slate-200 dark:border-[#1a1a1a] rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0099FF]/20 focus:border-[#0099FF] transition-all outline-none"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest px-1">Update Password (optional)</label>
                  <input 
                    v-model="profileForm.password"
                    type="password" 
                    class="w-full bg-slate-50 dark:bg-[#050505] border border-slate-200 dark:border-[#1a1a1a] rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0099FF]/20 focus:border-[#0099FF] transition-all outline-none"
                    placeholder="••••••••"
                  />
                  <p class="px-1 text-[10px] text-slate-400 dark:text-gray-500 italic">Leave blank to keep current password.</p>
                </div>

                <div class="pt-4">
                  <button 
                    type="submit" 
                    :disabled="isSaving"
                    class="h-14 px-10 bg-[#0099FF] text-white rounded-2xl font-black text-sm hover:shadow-[0_8px_25_rgba(0,153,255,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <span v-if="!isSaving">Save Changes</span>
                    <span v-else class="flex items-center gap-2">
                      <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </span>
                  </button>
                </div>
              </form>
            </section>

            <!-- Appearance Section -->
            <section class="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#1a1a1a] rounded-[2.5rem] p-8 shadow-sm">
              <h3 class="font-heading font-black text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span class="w-2 h-2 rounded-full bg-amber-400"></span> Appearance
              </h3>
              
              <div class="flex items-center justify-between p-6 bg-slate-50 dark:bg-[#050505]/50 border border-slate-200 dark:border-[#1a1a1a] rounded-3xl">
                <div>
                  <h4 class="font-bold text-slate-900 dark:text-white">Interface Theme</h4>
                  <p class="text-xs text-slate-500 dark:text-gray-500 mt-1">Switch between light and dark modes.</p>
                </div>
                
                <button 
                  @click="uiStore.toggleTheme"
                  class="relative w-16 h-8 rounded-full transition-colors duration-300 flex items-center px-1"
                  :class="uiStore.theme === 'dark' ? 'bg-[#0099FF]' : 'bg-slate-300'"
                >
                  <div 
                    class="w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 flex items-center justify-center text-[10px] font-bold"
                    :class="uiStore.theme === 'dark' ? 'translate-x-8' : 'translate-x-0'"
                  >
                    <span v-if="uiStore.theme === 'dark'">🌙</span>
                    <span v-else>☀️</span>
                  </div>
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
