<template>
  <el-aside width="200px" class="sidebar">
    <div class="logo">
      <i class="el-icon-apple"></i>
      <span>餐饮管理</span>
    </div>
    
    <el-menu
      :default-active="activeMenu"
      :router="true"
      :unique-opened="true"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
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
      
      <el-menu-item @click="logout">
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
  background-color: #545c64;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #444;
}

.logo i {
  margin-right: 8px;
  font-size: 20px;
}

.el-menu {
  border: none;
  height: calc(100vh - 60px);
}
</style>
