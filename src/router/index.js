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
  },
  // ===== 超级管理端路由 =====
  {
    path: '/super/login',
    name: 'SuperLogin',
    component: () => import('@/views/super/SuperLogin.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/super',
    component: () => import('@/components/SuperLayout.vue'),
    meta: { requiresSuperAuth: true },
    children: [
      {
        path: 'users',
        name: 'SuperUsers',
        component: () => import('@/views/super/UserManage.vue')
      },
      {
        path: 'foods',
        name: 'SuperFoods',
        component: () => import('@/views/super/FoodManage.vue')
      },
      {
        path: 'categories',
        name: 'SuperCategories',
        component: () => import('@/views/super/CategoryManage.vue')
      },
      {
        path: 'orders',
        name: 'SuperOrders',
        component: () => import('@/views/super/OrderManage.vue')
      },
      {
        path: 'comments',
        name: 'SuperComments',
        component: () => import('@/views/super/CommentManage.vue')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 全局修复 Vue Router 3.x 重复导航报错问题
// NavigationDuplicated 属于预期行为（已在当前页面），静默处理即可
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalPush.call(this, location, onResolve, onReject)
  }
  return originalPush.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated' && err.name !== 'NavigationRedirected') throw err
  })
}

const originalReplace = VueRouter.prototype.replace
VueRouter.prototype.replace = function replace(location, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalReplace.call(this, location, onResolve, onReject)
  }
  return originalReplace.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated' && err.name !== 'NavigationRedirected') throw err
  })
}

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = Number(localStorage.getItem('role'))
  const adminToken = localStorage.getItem('admin_token')
  const superToken = localStorage.getItem('super_token')

  if (to.meta.requiresAuth && (!token || role !== 0)) {
    // 用户端只允许 role=0
    if (role !== 0) {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      localStorage.removeItem('role')
      localStorage.removeItem('isNewUser')
    }
    next('/login')
  } else if (to.meta.requiresAdminAuth && !adminToken) {
    next('/admin/login')
  } else if (to.meta.requiresSuperAuth && !superToken) {
    next('/super/login')
  } else {
    next()
  }
})

// 动态浏览器标题：三端切换
router.afterEach((to) => {
  if (to.path.startsWith('/super')) {
    document.title = '超级管理端'
  } else if (to.path.startsWith('/admin')) {
    document.title = '商家端'
  } else {
    document.title = '用户端'
  }
})

export default router
