import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 用户信息
    userId: localStorage.getItem('userId') || null,
    username: localStorage.getItem('username') || null,
    token: localStorage.getItem('token') || null,
    role: Number(localStorage.getItem('role')) || 0,
    isNewUser: localStorage.getItem('isNewUser') === '1',

    // 购物车（会话级存储，数组结构，每项包含 foodId, foodName, foodImage, price, quantity）
    cart: JSON.parse(sessionStorage.getItem('cart') || '[]')
  },

  getters: {
    isLoggedIn: state => !!state.token,
    isAdmin: state => state.role === 1,
    cartCount: state => state.cart.reduce((sum, item) => sum + item.quantity, 0),
    cartTotal: state => state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },

  mutations: {
    // 设置用户信息
    SET_USER(state, { userId, username, token, role, isNewUser }) {
      state.userId = userId
      state.username = username
      state.token = token
      state.role = role
      state.isNewUser = isNewUser === 1
      localStorage.setItem('userId', userId)
      localStorage.setItem('username', username)
      localStorage.setItem('token', token)
      localStorage.setItem('role', role)
      localStorage.setItem('isNewUser', isNewUser)
    },

    // 清除用户信息
    CLEAR_USER(state) {
      state.userId = null
      state.username = null
      state.token = null
      state.role = 0
      state.isNewUser = false
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('isNewUser')
    },

    // 更新新用户状态
    UPDATE_NEW_USER_STATUS(state, isNewUser) {
      state.isNewUser = isNewUser
      localStorage.setItem('isNewUser', isNewUser ? '1' : '0')
    },

    // 添加到购物车（统一使用 foodId 作为唯一标识）
    ADD_TO_CART(state, food) {
      const existIndex = state.cart.findIndex(item => item.foodId === food.foodId)
      if (existIndex !== -1) {
        // 已存在则累加数量
        state.cart[existIndex].quantity += (food.quantity || 1)
        // 限制最大数量为10
        if (state.cart[existIndex].quantity > 10) {
          state.cart[existIndex].quantity = 10
        }
      } else {
        state.cart.push({
          foodId: food.foodId,
          foodName: food.foodName,
          foodImage: food.foodImage,
          price: food.price,
          quantity: food.quantity || 1
        })
      }
      sessionStorage.setItem('cart', JSON.stringify(state.cart))
    },

    // 更新购物车数量
    UPDATE_CART_QUANTITY(state, { foodId, quantity }) {
      const item = state.cart.find(item => item.foodId === foodId)
      if (item) {
        item.quantity = Math.min(Math.max(quantity, 1), 10)
        sessionStorage.setItem('cart', JSON.stringify(state.cart))
      }
    },

    // 从购物车删除
    REMOVE_FROM_CART(state, foodId) {
      state.cart = state.cart.filter(item => item.foodId !== foodId)
      sessionStorage.setItem('cart', JSON.stringify(state.cart))
    },

    // 清空购物车
    CLEAR_CART(state) {
      state.cart = []
      sessionStorage.removeItem('cart')
    }
  },

  actions: {
    // 登录
    login({ commit }, userData) {
      commit('SET_USER', userData)
    },

    // 登出
    logout({ commit }) {
      commit('CLEAR_USER')
      commit('CLEAR_CART')
    },

    // 添加到购物车
    addToCart({ commit }, food) {
      commit('ADD_TO_CART', food)
    },

    // 更新购物车数量
    updateCartQuantity({ commit }, payload) {
      commit('UPDATE_CART_QUANTITY', payload)
    },

    // 从购物车删除
    removeFromCart({ commit }, foodId) {
      commit('REMOVE_FROM_CART', foodId)
    },

    // 清空购物车
    clearCart({ commit }) {
      commit('CLEAR_CART')
    }
  }
})
