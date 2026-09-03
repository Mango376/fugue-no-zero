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
// ============ 酒馆 iframe 高度自适应 ============
// 被 iframe 嵌入时，向父页面持续上报内容真实高度
function reportEmbedHeight() {
  try {
    if (window.parent === window) return   // 不在 iframe 里就不干活
    const h = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    )
    window.parent.postMessage({ type: 'fugue-height', height: h }, '*')
  } catch (e) { /* 忽略 */ }
}

// 初次挂载 + 尺寸变化 + 路由切换都上报
new ResizeObserver(reportEmbedHeight).observe(document.documentElement)
window.addEventListener('load', reportEmbedHeight)
router.afterEach(() => setTimeout(reportEmbedHeight, 300))
reportEmbedHeight()