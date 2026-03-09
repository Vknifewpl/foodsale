<template>
  <div id="app">
    <!-- 顶部导航栏（仅在用户端非登录页面显示） -->
    <el-header class="header" v-if="showHeader">
      <div class="logo" @click="$router.push('/')"></div>
      <div class="nav-right">
        <el-button type="text" icon="el-icon-s-home" @click="$router.push('/')" style="margin-right: 8px;">
          首页
        </el-button>
        <el-badge :value="cartCount" :hidden="cartCount === 0" class="cart-badge">
          <el-button type="text" icon="el-icon-shopping-cart-2" @click="$router.push('/cart')">
            购物车
          </el-button>
        </el-badge>
        <template v-if="isLoggedIn">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              {{ username }}<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="orders">我的订单</el-dropdown-item>
              <el-dropdown-item command="collection">我的收藏</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="text" @click="$router.push('/login')">登录</el-button>
          <el-button type="text" @click="$router.push('/register')">注册</el-button>
        </template>
      </div>
    </el-header>
    
    <!-- 主内容区 -->
    <el-main :class="['main', { 'no-header': !showHeader }]">
      <router-view/>
    </el-main>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'App',
  computed: {
    ...mapGetters(['isLoggedIn', 'cartCount']),
    ...mapState(['username']),
    showHeader() {
      // 登录、注册、管理员、超级管理员相关页面不显示用户端导航栏
      const hiddenRoutes = ['Login', 'Register', 'AdminLogin', 'SuperLogin']
      if (hiddenRoutes.includes(this.$route.name)) return false
      // 管理员和超管后台页面不显示用户端导航栏
      if (this.$route.path.startsWith('/admin') || this.$route.path.startsWith('/super')) return false
      return true
    }
  },
  methods: {
    handleCommand(command) {
      switch (command) {
        case 'profile':
          this.$router.push('/profile')
          break
        case 'orders':
          this.$router.push('/orders')
          break
        case 'collection':
          this.$router.push('/collection')
          break
        case 'logout':
          this.$store.dispatch('logout')
          this.$message.success('已退出登录')
          if (this.$route.path !== '/') {
            this.$router.push('/')
          }
          break
      }
    }
  }
}
</script>

<style>
/* 极简 Apple 设计语言全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  color: #1d1d1f;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Helvetica", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-image: url('~@/assets/back.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* 毛玻璃顶级导航栏 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  background: transparent;
  border-bottom: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 60px;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.logo {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.5px;
  color: #1d1d1f;
  cursor: pointer;
  transition: opacity 0.3s;
}
.logo:hover {
  opacity: 0.7;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-right .el-button--text {
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s;
}
.nav-right .el-button--text:hover {
  color: #0071e3;
}

.el-dropdown-link {
  cursor: pointer;
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.el-dropdown-link:hover {
  color: #0071e3;
}

.main {
  margin-top: 60px;
  padding: 40px 20px;
  flex: 1;
}

.main.no-header {
  margin-top: 0;
  padding: 0;
}

/* 全局覆盖 ElementUI 样式以更贴合简约风 */
.el-button--primary {
  background-color: #0071e3 !important;
  border-color: #0071e3 !important;
  border-radius: 980px !important; /* 全圆角按钮 */
  font-weight: 500 !important;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) !important;
}
.el-button--primary:hover {
  background-color: #0077ed !important;
  transform: scale(1.02);
}
.el-button {
  border-radius: 980px !important;
  border: none;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.el-button.el-button--default {
  background-color: rgba(0, 0, 0, 0.05);
  color: #1d1d1f;
}
.el-button.el-button--default:hover {
  background-color: rgba(0, 0, 0, 0.08);
}
.el-button.el-button--danger {
  background-color: #e30000;
  color: #fff;
}
</style>
