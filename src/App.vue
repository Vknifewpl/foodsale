<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <el-header class="header" v-if="showHeader">
      <div class="logo" @click="$router.push('/')">美食点餐</div>
      <div class="nav-right">
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
    <el-main class="main">
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
      return !['Login', 'Register'].includes(this.$route.name)
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
          this.$router.push('/')
          break
      }
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: linear-gradient(135deg, #ff6b6b, #ffa502);
  color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-right .el-button--text {
  color: white;
}

.cart-badge {
  margin-right: 10px;
}

.el-dropdown-link {
  cursor: pointer;
  color: white;
}

.main {
  margin-top: 60px;
  padding: 20px;
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
}
</style>
