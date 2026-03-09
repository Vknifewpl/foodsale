<template>
  <el-aside width="240px" class="super-sidebar">
    <div class="logo">
      <i class="el-icon-s-custom"></i>
      <span>超级管理端</span>
    </div>
    <el-menu
      :default-active="$route.path"
      :router="true"
      :unique-opened="true"
      background-color="#fff"
      text-color="#86868b"
      active-text-color="#c0392b"
    >
      <el-menu-item index="/super/users">
        <i class="el-icon-user"></i>
        <span slot="title">用户管理</span>
      </el-menu-item>
      <el-menu-item index="/super/foods">
        <i class="el-icon-dish"></i>
        <span slot="title">菜品管理</span>
      </el-menu-item>
      <el-menu-item index="/super/categories">
        <i class="el-icon-folder"></i>
        <span slot="title">分类管理</span>
      </el-menu-item>
      <el-menu-item index="/super/orders">
        <i class="el-icon-document"></i>
        <span slot="title">订单管理</span>
      </el-menu-item>
      <el-menu-item index="/super/comments">
        <i class="el-icon-chat-dot-round"></i>
        <span slot="title">评论管理</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script>
export default { name: 'SuperSidebar' }
</script>

<style scoped>
.super-sidebar {
  background: #fff;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  border-right: 1px solid rgba(0,0,0,0.05);
}
.logo {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0392b;
  font-size: 18px;
  font-weight: 700;
}
.logo i { margin-right: 8px; font-size: 22px; }
.el-menu { border: none; height: calc(100vh - 72px); padding: 16px 12px; }
.super-sidebar >>> .el-menu-item {
  height: 50px;
  line-height: 50px;
  border-radius: 12px;
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #86868b !important;
  transition: all 0.3s;
}
.super-sidebar >>> .el-menu-item i { color: inherit !important; margin-right: 12px; font-size: 18px; }
.super-sidebar >>> .el-menu-item:hover { background-color: #fdf0ef !important; color: #c0392b !important; }
.super-sidebar >>> .el-menu-item.is-active { background-color: rgba(192,57,43,0.08) !important; color: #c0392b !important; }
</style>
