<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import StatementCard from '@/components/statements/StatementCard.vue'
import ConfirmDeleteModal from '@/components/statements/ConfirmDeleteModal.vue'
import { useStatementsStore } from '@/stores/statements.store'
import { useUiStore } from '@/stores/ui.store'
import { computed, ref } from 'vue'

const router = useRouter()
const statementsStore = useStatementsStore()
const uiStore = useUiStore()

const statementToDelete = ref<string | null>(null)
const filenameToDelete = computed(() => {
  return statementToDelete.value 
    ? statementsStore.statements.find(s => s.id === statementToDelete.value)?.filename 
    : ''
})

function promptDelete(id: string) {
  statementToDelete.value = id
}

async function confirmDelete() {
  if (statementToDelete.value) {
    await statementsStore.deleteStatement(statementToDelete.value)
    statementToDelete.value = null
  }
}

onMounted(() => statementsStore.fetchStatements())
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-black transition-colors duration-500">
    <AppSidebar />
    <div 
      class="flex-1 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      :class="uiStore.isSidebarCollapsed ? 'ml-20' : 'ml-64'"
    >
      <AppHeader />
      <main class="flex-1 p-4 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
        <header class="mb-10">
          <h1 class="font-heading text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome back, <span class="text-[#0099FF]">{{ statementsStore.statements.length > 0 ? 'analyst' : 'pioneer' }}</span>
          </h1>
          <p class="text-slate-500 dark:text-gray-400 text-sm font-medium mt-2">
            Here's what's happening with your accounts today.
          </p>
        </header>

        <!-- KPI Row -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div class="group p-8 bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-slate-200 dark:border-[#1a1a1a] shadow-sm hover:shadow-2xl hover:border-[#0099FF]/30 transition-all duration-500 relative overflow-hidden">
            <div class="absolute -right-6 -top-6 w-24 h-24 bg-[#0099FF]/5 rounded-full blur-2xl group-hover:bg-[#0099FF]/10 transition-colors"></div>
            <div class="flex items-center gap-4 mb-3">
              <div class="w-10 h-10 rounded-2xl bg-[#0099FF]/10 flex items-center justify-center text-[#0099FF] text-xl">📄</div>
              <p class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">Statements</p>
            </div>
            <p class="text-4xl font-heading font-black text-slate-900 dark:text-white">{{ statementsStore.statements.length }}</p>
          </div>
          
          <div class="group p-8 bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-slate-200 dark:border-[#1a1a1a] shadow-sm hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden">
            <div class="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
            <div class="flex items-center gap-4 mb-3">
              <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xl">✓</div>
              <p class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">Analysed</p>
            </div>
            <p class="text-4xl font-heading font-black text-slate-900 dark:text-white">
              {{ statementsStore.statements.filter(s => s.status === 'done').length }}
            </p>
          </div>

          <div class="group p-8 bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-slate-200 dark:border-[#1a1a1a] shadow-sm hover:shadow-2xl hover:border-amber-500/30 transition-all duration-500 relative overflow-hidden">
            <div class="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
            <div class="flex items-center gap-4 mb-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 text-xl">⏰</div>
              <p class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">Pending</p>
            </div>
            <p class="text-4xl font-heading font-black text-slate-900 dark:text-white">
              {{ statementsStore.statements.filter(s => !['done','error'].includes(s.status)).length }}
            </p>
          </div>
        </div>

        <!-- Recent Statements -->
        <div class="animate-slide-in" style="animation-delay: 0.2s">
          <div class="flex items-center justify-between mb-6">
            <h2 class="font-heading text-2xl font-black text-slate-900 dark:text-white tracking-tight">Recent Activity</h2>
            <RouterLink to="/statements" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#111] text-slate-600 dark:text-gray-400 text-xs font-bold hover:bg-slate-200 dark:hover:bg-[#1a1a1a] transition-all">
              View all
            </RouterLink>
          </div>

          <div v-if="statementsStore.isLoading" class="flex justify-center py-24 bg-white/50 dark:bg-[#0a0a0a]/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-[#1a1a1a]">
            <div class="relative w-12 h-12">
              <div class="absolute inset-0 border-2 border-[#0099FF]/20 rounded-full"></div>
              <div class="absolute inset-0 border-2 border-[#0099FF] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>

          <div
            v-else-if="statementsStore.statements.length === 0"
            class="p-16 text-center bg-white dark:bg-transparent rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-[#1a1a1a] animate-scale-up"
          >
            <div class="w-20 h-20 bg-slate-100 dark:bg-[#0a0a0a] rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">📄</div>
            <p class="text-slate-900 dark:text-white font-heading font-black text-2xl mb-2">No data sets found</p>
            <p class="text-slate-500 dark:text-gray-400 text-sm mb-8 max-w-sm mx-auto">Start by uploading your first bank statement for detailed AI-powered insights.</p>
            <RouterLink
              to="/statements/upload"
              class="inline-flex items-center px-8 py-4 bg-[#0099FF] text-white rounded-2xl font-black text-sm hover:shadow-[0_8px_25px_rgba(0,153,255,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              + Upload Statement
            </RouterLink>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <StatementCard
              v-for="s in statementsStore.statements.slice(0, 6)"
              :key="s.id"
              :statement="s"
              class="hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              @click="router.push(`/statements/${s.id}`)"
              @delete-request="promptDelete"
            />
          </div>
        </div>
      </main>
    </div>

    <ConfirmDeleteModal 
      :is-open="!!statementToDelete"
      :filename="filenameToDelete"
      @close="statementToDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
