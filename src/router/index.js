import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/food/:id',
    name: 'FoodDetail',
    component: () => import('@/views/FoodDetail.vue')
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/order/pay',
    name: 'OrderPay',
    component: () => import('@/views/OrderPay.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'OrderList',
    component: () => import('@/views/OrderList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/order/:orderNo',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/collection',
    name: 'Collection',
    component: () => import('@/views/Collection.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/AdminLogin.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    component: () => import('@/components/AdminLayout.vue'),
    meta: { requiresAdminAuth: true },
    children: [
      {
        path: 'food',
        name: 'AdminFood',
        component: () => import('@/views/admin/FoodManage.vue')
      },
      {
        path: 'category',
        name: 'AdminCategory',
        component: () => import('@/views/admin/CategoryManage.vue')
      },
      {
        path: 'order',
        name: 'AdminOrder',
        component: () => import('@/views/admin/OrderManage.vue')
      },
      {
        path: 'stat',
        name: 'AdminStat',
        component: () => import('@/views/admin/Statistics.vue')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const adminToken = localStorage.getItem('admin_token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.requiresAdminAuth && !adminToken) {
    next('/admin/login')
  } else {
    next()
  }
})

// 动态浏览器标题：根据当前路由和用户角色切换"用户端"/"管理端"
router.afterEach((to) => {
  const isAdminRoute = to.path.startsWith('/admin')
  const role = Number(localStorage.getItem('role') || 0)
  document.title = (isAdminRoute || role === 1) ? '管理端' : '用户端'
})

export default router
