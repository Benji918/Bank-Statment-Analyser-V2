<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import StatementCard from '@/components/statements/StatementCard.vue'
import StatementFilterBar from '@/components/statements/StatementFilterBar.vue'
import { useStatementsStore } from '@/stores/statements.store'

const router = useRouter()
const store = useStatementsStore()

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
  <div class="flex min-h-screen bg-black">
    <AppSidebar />
    <div class="flex-1 ml-60 flex flex-col">
      <AppHeader />
      <main class="flex-1 p-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-heading text-2xl font-bold text-white">All Statements</h2>
          <RouterLink
            to="/statements/upload"
            class="px-5 py-2 bg-white text-[#0000EE] rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            + Upload
          </RouterLink>
        </div>

        <StatementFilterBar
          :tag="filterTag"
          :status="filterStatus"
          @update:tag="filterTag = $event"
          @update:status="filterStatus = $event"
          @clear="clearFilters"
        />

        <div v-if="store.isLoading" class="flex justify-center py-12">
          <div class="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>

        <div
          v-else-if="filtered.length === 0"
          class="p-12 text-center bg-[#1a1a1a] rounded-xl border border-gray-800 border-dashed"
        >
          <p class="text-gray-400">No statements found.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <StatementCard
            v-for="s in filtered"
            :key="s.id"
            :statement="s"
            @click="router.push(`/statements/${s.id}`)"
          />
        </div>
      </main>
    </div>
  </div>
</template>
