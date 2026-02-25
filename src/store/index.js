import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 用户信息
    userId: localStorage.getItem('userId') || null,
    username: localStorage.getItem('username') || null,
    token: localStorage.getItem('token') || null,
    isNewUser: localStorage.getItem('isNewUser') === '1',
    
    // 购物车
    cart: JSON.parse(localStorage.getItem('cart') || '[]')
  },
  
  getters: {
    isLoggedIn: state => !!state.token,
    cartCount: state => state.cart.reduce((sum, item) => sum + item.quantity, 0),
    cartTotal: state => state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },
  
  mutations: {
    // 设置用户信息
    SET_USER(state, { userId, username, token, isNewUser }) {
      state.userId = userId
      state.username = username
      state.token = token
      state.isNewUser = isNewUser === 1
      localStorage.setItem('userId', userId)
      localStorage.setItem('username', username)
      localStorage.setItem('token', token)
      localStorage.setItem('isNewUser', isNewUser)
    },
    
    // 清除用户信息
    CLEAR_USER(state) {
      state.userId = null
      state.username = null
      state.token = null
      state.isNewUser = false
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      localStorage.removeItem('token')
      localStorage.removeItem('isNewUser')
    },
    
    // 更新新用户状态
    UPDATE_NEW_USER_STATUS(state, isNewUser) {
      state.isNewUser = isNewUser
      localStorage.setItem('isNewUser', isNewUser ? '1' : '0')
    },
    
    // 添加到购物车
    ADD_TO_CART(state, food) {
      const existIndex = state.cart.findIndex(item => item.foodId === food.foodId)
      if (existIndex !== -1) {
        state.cart[existIndex].quantity += 1
      } else {
        state.cart.push({ ...food, quantity: 1 })
      }
      localStorage.setItem('cart', JSON.stringify(state.cart))
    },
    
    // 更新购物车数量
    UPDATE_CART_QUANTITY(state, { foodId, quantity }) {
      const item = state.cart.find(item => item.foodId === foodId)
      if (item) {
        item.quantity = quantity
        localStorage.setItem('cart', JSON.stringify(state.cart))
      }
    },
    
    // 从购物车删除
    REMOVE_FROM_CART(state, foodId) {
      state.cart = state.cart.filter(item => item.foodId !== foodId)
      localStorage.setItem('cart', JSON.stringify(state.cart))
    },
    
    // 清空购物车
    CLEAR_CART(state) {
      state.cart = []
      localStorage.removeItem('cart')
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
