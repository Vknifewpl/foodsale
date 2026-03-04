import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'

Vue.use(ElementUI)

// 配置axios基础URL（与后端端口一致）
axios.defaults.baseURL = 'http://localhost:8089'

// 请求拦截器：根据请求路径选择携带用户端token或管理员token
axios.interceptors.request.use(config => {
  const url = config.url || ''
  if (url.startsWith('/admin')) {
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
      if (url.startsWith('/admin')) {
        // 管理员端Token失效
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        router.push('/admin/login')
      } else {
        // 用户端Token失效
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        localStorage.removeItem('username')
        store.commit('CLEAR_USER')
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
