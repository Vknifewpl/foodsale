<template>
  <div class="admin-layout">
    <Sidebar />
    
    <el-container>
      <el-header class="admin-header">
        <div class="header-content">
          <h2>{{ pageTitle }}</h2>
          <div class="user-info">
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                {{ currentUser.username }} <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'

export default {
  name: 'AdminLayout',
  components: {
    Sidebar
  },
  data() {
    return {
      currentUser: {}
    }
  },
  computed: {
    pageTitle() {
      const routeTitleMap = {
        '/admin/food': '菜品管理',
        '/admin/category': '分类管理',
        '/admin/order': '订单管理',
        '/admin/stat': '数据统计'
      }
      return routeTitleMap[this.$route.path] || '后台管理'
    }
  },
  created() {
    this.loadCurrentUser()
  },
  methods: {
    loadCurrentUser() {
      const userStr = localStorage.getItem('admin_user')
      if (userStr) {
        this.currentUser = JSON.parse(userStr)
      }
    },
    handleCommand(command) {
      if (command === 'logout') {
        this.logout()
      } else if (command === 'profile') {
        this.$message.info('功能待完善')
      }
    },
    logout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        this.$message.success('已退出登录')
        this.$router.push('/admin/login')
      })
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  background-image: url('@/assets/back.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

.admin-layout > .el-container {
  margin-left: 240px;
  width: calc(100% - 240px);
  display: flex;
  flex-direction: column;
}

.admin-header {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
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

.admin-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.5px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #1d1d1f;
  font-size: 15px;
  font-weight: 600;
  transition: color 0.3s ease;
}

.el-dropdown-link:hover {
  color: #0071e3;
}

.admin-main {
  padding: 40px;
  flex: 1;
}
</style>
