import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'

import App from './App.vue'
import router from './router'

import './style.css'
// Note: primevue requires its CSS depending on the version, using unstyled for tailwind passes in v4
// If PrimeVue v4 uses pass-through tailwind, configure here. For now we use basic init.

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue)

app.mount('#app')
