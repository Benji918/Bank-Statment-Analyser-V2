<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import StatementCard from '@/components/statements/StatementCard.vue'
import StatementFilterBar from '@/components/statements/StatementFilterBar.vue'
import { useStatementsStore } from '@/stores/statements.store'
import { useUiStore } from '@/stores/ui.store'

const router = useRouter()
const store = useStatementsStore()
const uiStore = useUiStore()

const filterTag = ref('')
const filterStatus = ref('')

onMounted(() => store.fetchStatements())

const filtered = computed(() =>
  store.statements.filter((s) => {
    const tagMatch = !filterTag.value || s.tags?.includes(filterTag.value)
    const statusMatch = !filterStatus.value || s.status === filterStatus.value
    return tagMatch && statusMatch
  })
)

function clearFilters() {
  filterTag.value = ''
  filterStatus.value = ''
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
      <main class="flex-1 p-4 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
        <header class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 class="font-heading text-4xl font-black text-slate-900 dark:text-white tracking-tight">Statements</h2>
            <p class="text-slate-500 dark:text-gray-400 text-sm font-medium mt-1">Manage and audit your transaction records.</p>
          </div>
          <RouterLink
            to="/statements/upload"
            class="h-12 px-6 bg-[#0099FF] text-white rounded-2xl font-black text-sm hover:shadow-[0_8px_25px_rgba(0,153,255,0.4)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>+</span> Upload New
          </RouterLink>
        </header>

        <div class="mb-10 animate-slide-in" style="animation-delay: 0.1s">
          <StatementFilterBar
            :tag="filterTag"
            :status="filterStatus"
            @update:tag="filterTag = $event"
            @update:status="filterStatus = $event"
            @clear="clearFilters"
          />
        </div>

        <div v-if="store.isLoading" class="flex justify-center py-24">
          <div class="w-12 h-12 border-2 border-[#0099FF]/20 border-t-[#0099FF] rounded-full animate-spin" />
        </div>

        <div
          v-else-if="filtered.length === 0"
          class="p-20 text-center bg-white dark:bg-[#0a0a0a]/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-[#1a1a1a] animate-scale-up"
        >
          <div class="text-6xl mb-6 opacity-30">🔍</div>
          <p class="text-slate-900 dark:text-white font-heading font-black text-xl">No matching records</p>
          <p class="text-slate-500 dark:text-gray-400 text-sm mt-1 mb-8">Try adjusting your filters or upload a new statement.</p>
          <button @click="clearFilters" class="text-[#0099FF] font-bold hover:underline">Clear all filters</button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in" style="animation-delay: 0.2s">
          <StatementCard
            v-for="s in filtered"
            :key="s.id"
            :statement="s"
            class="hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            @click="router.push(`/statements/${s.id}`)"
          />
        </div>
      </main>
    </div>
  </div>
</template>
