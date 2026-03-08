<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LogoIcon from '@/components/layout/LogoIcon.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const fullName = ref('')
const isSubmitting = ref(false)

const handleRegister = async () => {
  if (isSubmitting.value) return
  
  if (password.value !== confirmPassword.value) {
    uiStore.showToast('Passwords do not match.', 'error')
    return
  }

  isSubmitting.value = true
  try {
    await authStore.register({ 
      email: email.value, 
      password: password.value,
      full_name: fullName.value
    })
    uiStore.showToast('Account created successfully! Please log in.', 'success')
    router.push('/login')
  } catch (error: any) {
    uiStore.showToast(error?.response?.data?.detail || 'Registration failed.', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
    <!-- Subtle background glows -->
    <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-[#0099FF]/20 rounded-full blur-[120px] pointer-events-none transition-all duration-1000 animate-pulse"></div>
    <div class="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#0000EE]/10 rounded-full blur-[100px] pointer-events-none transition-all duration-1000 animate-pulse delay-1000"></div>

    <div class="max-w-md w-full z-10">
      <div class="p-10 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl relative">
        <div class="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none"></div>
        
        <div class="text-center mb-10">
          <LogoIcon class="mx-auto h-14 w-auto mb-6 drop-shadow-[0_0_15px_rgba(0,153,255,0.4)]" />
          <h2 class="text-3xl font-heading font-extrabold text-white tracking-tight">
            Create an account
          </h2>
          <p class="text-gray-400 text-sm mt-2 font-body">Join IntelliBank and gain intelligence</p>
        </div>

        <form class="space-y-5" @submit.prevent="handleRegister">
          <div>
            <label for="full-name" class="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
            <input 
              id="full-name" 
              name="name" 
              type="text" 
              required 
              v-model="fullName" 
              class="block w-full px-4 py-3 bg-[#111111] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0099FF]/50 focus:border-[#0099FF] transition-all duration-200" 
              placeholder="John Doe"
            >
          </div>
          <div>
            <label for="email-address" class="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Email address</label>
            <input 
              id="email-address" 
              name="email" 
              type="email" 
              autocomplete="email" 
              required 
              v-model="email" 
              class="block w-full px-4 py-3 bg-[#111111] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0099FF]/50 focus:border-[#0099FF] transition-all duration-200" 
              placeholder="name@company.com"
            >
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="password" class="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div class="relative">
                <input 
                  id="password" 
                  name="password" 
                  :type="showPassword ? 'text' : 'password'" 
                  autocomplete="new-password" 
                  required 
                  v-model="password" 
                  class="block w-full px-4 py-3 bg-[#111111] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0099FF]/50 focus:border-[#0099FF] transition-all duration-200" 
                  placeholder="••••••••"
                >
                <button 
                  type="button" 
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88 2 2"/><path d="M17.36 18.532A10.435 10.435 0 0 1 12 19c-7 0-10-7-10-7a13.16 13.16 0 0 1 2.174-2.906"/><path d="M4.22 4.22 22 22"/><path d="M2 12s3-7 10-7a9.45 9.45 0 0 1 5.074 1.477"/><path d="M22 12s-3 7-10 7a9.68 9.68 0 0 1-1.353-.095"/><path d="M15 12a3 3 0 0 0-5.46-1.74"/><path d="M9 12a3 3 0 0 0 4.1 2.76"/></svg>
                </button>
              </div>
            </div>
            <div>
              <label for="confirm-password" class="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Confirm</label>
              <div class="relative">
                <input 
                  id="confirm-password" 
                  name="confirm-password" 
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  autocomplete="new-password" 
                  required 
                  v-model="confirmPassword" 
                  class="block w-full px-4 py-3 bg-[#111111] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0099FF]/50 focus:border-[#0099FF] transition-all duration-200" 
                  placeholder="••••••••"
                >
                <button 
                  type="button" 
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88 2 2"/><path d="M17.36 18.532A10.435 10.435 0 0 1 12 19c-7 0-10-7-10-7a13.16 13.16 0 0 1 2.174-2.906"/><path d="M4.22 4.22 22 22"/><path d="M2 12s3-7 10-7a9.45 9.45 0 0 1 5.074 1.477"/><path d="M22 12s-3 7-10 7a9.68 9.68 0 0 1-1.353-.095"/><path d="M15 12a3 3 0 0 0-5.46-1.74"/><path d="M9 12a3 3 0 0 0 4.1 2.76"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="pt-3">
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="w-full flex justify-center items-center py-3.5 px-4 font-heading font-semibold rounded-full text-[#0000EE] bg-white hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span v-if="!isSubmitting">Create Account</span>
              <div v-else class="h-5 w-5 border-2 border-[#0000EE] border-t-transparent rounded-full animate-spin"></div>
            </button>
          </div>
        </form>

        <div class="mt-8 text-center text-sm">
          <span class="text-gray-500">Already have an account? </span>
          <RouterLink to="/login" class="font-medium text-[#0099FF] hover:text-[#0000EE] transition-colors">
            Sign in
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
