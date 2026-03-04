<template>
  <el-aside width="240px" class="sidebar">
    <div class="logo">
      <i class="el-icon-apple"></i>
      <span>餐饮管理</span>
    </div>
    
    <el-menu
      :default-active="activeMenu"
      :router="true"
      :unique-opened="true"
      background-color="#fff"
      text-color="#86868b"
      active-text-color="#0071e3"
    >
      <el-menu-item index="/admin/food">
        <i class="el-icon-dish"></i>
        <span slot="title">菜品管理</span>
      </el-menu-item>
      
      <el-menu-item index="/admin/category">
        <i class="el-icon-folder"></i>
        <span slot="title">分类管理</span>
      </el-menu-item>
      
      <el-menu-item index="/admin/order">
        <i class="el-icon-document"></i>
        <span slot="title">订单管理</span>
      </el-menu-item>
      
      <el-menu-item index="/admin/stat">
        <i class="el-icon-data-analysis"></i>
        <span slot="title">数据统计</span>
      </el-menu-item>
      
      <el-menu-item @click="logout" class="logout-item">
        <i class="el-icon-switch-button"></i>
        <span slot="title">退出登录</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script>
export default {
  name: 'Sidebar',
  computed: {
    activeMenu() {
      const { path } = this.$route
      return path
    }
  },
  methods: {
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
.sidebar {
  background-color: #fff;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.logo {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1d1d1f;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.logo i {
  margin-right: 8px;
  font-size: 24px;
  color: #1d1d1f;
}

.el-menu {
  border: none;
  height: calc(100vh - 72px);
  padding: 16px 12px;
  background: transparent !important;
}

.sidebar >>> .el-menu-item {
  height: 50px;
  line-height: 50px;
  border-radius: 12px;
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #86868b !important;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.sidebar >>> .el-menu-item i {
  color: inherit !important;
  margin-right: 12px;
  font-size: 18px;
  transition: inherit;
}

.sidebar >>> .el-menu-item:hover {
  background-color: #f5f5f7 !important;
  color: #1d1d1f !important;
}

.sidebar >>> .el-menu-item.is-active {
  background-color: rgba(0, 113, 227, 0.08) !important;
  color: #0071e3 !important;
}

.sidebar >>> .logout-item {
  margin-top: 24px;
}
.sidebar >>> .logout-item:hover {
  color: #e30000 !important;
  background-color: rgba(227, 0, 0, 0.04) !important;
}
</style>
