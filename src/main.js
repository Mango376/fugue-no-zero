import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router'
import './style.css'
import './assets/styles/fonts.css'
import App from './App.vue'

// 👇 新增：引入你的 AI 服务
import aiService from './services/aiService' 

// 👇 新增：一进入页面，立刻触发 SDK 初始化！
// 不用 await 等它，让它在后台默默握手建立连接
aiService._ensureInit().catch(console.error)

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
