<template>
  <div class="super-layout">
    <SuperSidebar />
    <el-container>
      <el-header class="super-header">
        <div class="header-content">
          <h2>{{ pageTitle }}</h2>
          <div class="user-info">
            <el-tag type="danger" size="small" style="margin-right: 12px">超级管理端</el-tag>
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                {{ currentUser.username }} <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="logout">
                  <i class="el-icon-switch-button"></i> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-main class="super-main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import SuperSidebar from '@/components/SuperSidebar.vue'

export default {
  name: 'SuperLayout',
  components: { SuperSidebar },
  data() {
    return { currentUser: {} }
  },
  computed: {
    pageTitle() {
      const map = {
        '/super/users': '用户管理',
        '/super/foods': '菜品管理',
        '/super/categories': '分类管理',
        '/super/orders': '订单管理',
        '/super/comments': '评论管理'
      }
      return map[this.$route.path] || '超级管理端'
    }
  },
  created() {
    try {
      const userStr = localStorage.getItem('super_user')
      if (userStr) {
        this.currentUser = JSON.parse(userStr)
      }
    } catch (e) {
      console.error('解析用户信息失败:', e)
      this.currentUser = {}
    }
  },
  methods: {
    handleCommand(cmd) {
      if (cmd === 'logout') {
        this.$confirm('确定退出登录吗？', '提示', { type: 'warning' }).then(() => {
          localStorage.removeItem('super_token')
          localStorage.removeItem('super_user')
          this.$message.success('已退出登录')
          this.$router.push('/login')
        }).catch(() => {})
      }
    }
  }
}
</script>

<style scoped>
.super-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f7;
}
.super-layout > .el-container {
  margin-left: 240px;
  width: calc(100% - 240px);
  display: flex;
  flex-direction: column;
}
.super-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0 40px;
  height: 72px !important;
  line-height: 72px;
  position: sticky;
  top: 0;
  z-index: 50;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}
.super-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
}
.user-info {
  display: flex;
  align-items: center;
}
.el-dropdown-link {
  cursor: pointer;
  color: #1d1d1f;
  font-size: 15px;
  font-weight: 600;
}
.super-main {
  padding: 40px;
  flex: 1;
}
</style>
