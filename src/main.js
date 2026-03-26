import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'

Vue.use(ElementUI)

// 全局兜底：忽略弹窗取消、已被拦截器处理的 401，以及浏览器扩展的 IO 错误，避免红色运行时遮罩
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  const text = String(reason?.message ?? reason ?? '').toLowerCase()
  if (text.includes('cancel') || text.includes('close')) {
    event.preventDefault()
    return
  }
  if (reason?.response?.status === 401) {
    event.preventDefault()
  }
  if (text.includes('io error') || text.includes('manifest')) {
    event.preventDefault()
  }
})

window.addEventListener('error', (event) => {
  const text = String(event.message ?? '').toLowerCase()
  if (text.includes('io error') || text.includes('manifest')) {
    event.preventDefault()
  }
})

// 配置axios基础URL（与后端端口一致）
axios.defaults.baseURL = 'http://localhost:8089'

// 请求拦截器：根据请求路径选择携带用户端token或管理员token
axios.interceptors.request.use(config => {
  const url = config.url || ''
  if (url.startsWith('/super')) {
    // 超级管理端请求使用 super_token
    const superToken = localStorage.getItem('super_token')
    if (superToken) {
      config.headers.Authorization = `Bearer ${superToken}`
    }
  } else if (url.startsWith('/admin')) {
    // 管理员端请求使用admin_token
    const adminToken = localStorage.getItem('admin_token')
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`
    }
  } else {
    // 用户端请求使用token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// 响应拦截器：处理401未授权
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      const url = error.config.url || ''
      const errorMsg = error.response.data?.msg || '登录已过期'
      
      if (url.startsWith('/super')) {
        localStorage.removeItem('super_token')
        localStorage.removeItem('super_user')
        Vue.prototype.$message.warning(errorMsg)
        router.push('/super/login')
      } else if (url.startsWith('/admin')) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        Vue.prototype.$message.warning(errorMsg)
        router.push('/admin/login')
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        localStorage.removeItem('username')
        store.commit('CLEAR_USER')
        Vue.prototype.$message.warning(errorMsg)
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)

Vue.prototype.$axios = axios
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
