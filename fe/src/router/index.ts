import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', name: 'landing', component: () => import('../views/LandingView.vue') },
        { path: '/login', name: 'login', component: () => import('../views/auth/LoginView.vue') },
        { path: '/register', name: 'register', component: () => import('../views/auth/RegisterView.vue') },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('../views/dashboard/DashboardView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/statements',
            name: 'statements',
            component: () => import('../views/statements/StatementsListView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/statements/upload',
            name: 'statement-upload',
            component: () => import('../views/statements/StatementUploadView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/statements/:id',
            name: 'statement-detail',
            component: () => import('../views/statements/StatementDetailView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/statements/:id/insights',
            name: 'insights',
            component: () => import('../views/insights/InsightsView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import('../views/settings/SettingsView.vue'),
            meta: { requiresAuth: true },
        },
    ],
})

// Navigation guard
router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore()
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next({ name: 'login', query: { redirect: to.fullPath } })
    } else {
        next()
    }
})

export default router
