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
}

.admin-header {
  background: #fff;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 60px;
  line-height: 60px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
</style>
