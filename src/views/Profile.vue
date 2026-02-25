<template>
  <div class="profile-page">
    <div class="page-header">
      <el-button icon="el-icon-arrow-left" @click="$router.go(-1)">返回</el-button>
      <h2>个人中心</h2>
    </div>
    
    <div class="profile-content">
      <div class="user-info-card">
        <div class="user-avatar">
          <el-avatar :size="80" icon="el-icon-user-solid"></el-avatar>
        </div>
        <div class="user-details">
          <h3>{{ userInfo.username || '游客' }}</h3>
          <p>{{ userInfo.role === 1 ? '管理员' : '普通用户' }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-number">{{ orderCount }}</span>
              <span class="stat-label">订单数</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ collectionCount }}</span>
              <span class="stat-label">收藏数</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="quick-links">
        <h3>快捷入口</h3>
        <div class="link-grid">
          <div class="link-item" @click="goToOrders">
            <div class="link-icon">
              <i class="el-icon-document"></i>
            </div>
            <span>我的订单</span>
          </div>
          <div class="link-item" @click="goToCollection">
            <div class="link-icon">
              <i class="el-icon-star-on"></i>
            </div>
            <span>我的收藏</span>
          </div>
          <div class="link-item" @click="goToProfile">
            <div class="link-icon">
              <i class="el-icon-setting"></i>
            </div>
            <span>账户设置</span>
          </div>
        </div>
      </div>
      
      <div class="actions">
        <el-button type="danger" @click="logout">退出登录</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  data() {
    return {
      userInfo: {},
      orderCount: 0,
      collectionCount: 0
    }
  },
  created() {
    this.loadUserInfo()
    this.loadStats()
  },
  methods: {
    loadUserInfo() {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        this.userInfo = JSON.parse(userStr)
      }
    },
    async loadStats() {
      const token = localStorage.getItem('token')
      if (!token) return
      
      try {
        // 获取订单数量
        const userId = JSON.parse(localStorage.getItem('user')).id
        const orderRes = await this.$axios.get('/order/list', {
          params: { userId, status: null }
        })
        if (orderRes.data.code === 200) {
          this.orderCount = orderRes.data.data?.length || 0
        }
        
        // 获取收藏数量
        const collectionRes = await this.$axios.get('/collection/list', {
          params: { userId }
        })
        if (collectionRes.data.code === 200) {
          this.collectionCount = collectionRes.data.data?.length || 0
        }
      } catch (e) {
        console.log('获取统计数据失败')
      }
    },
    goToOrders() {
      this.$router.push('/orders')
    },
    goToCollection() {
      this.$router.push('/collection')
    },
    goToProfile() {
      this.$message.info('账户设置功能待完善')
    },
    logout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        this.$store.commit('setUser', null)
        this.$message.success('已退出登录')
        this.$router.push('/')
      })
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

.page-header {
  background: #fff;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.profile-content {
  max-width: 600px;
  margin: 20px auto;
  padding: 0 20px;
}

.user-info-card {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.user-avatar {
  margin-bottom: 15px;
}

.user-details h3 {
  margin: 0 0 5px 0;
  font-size: 20px;
  color: #333;
}

.user-details p {
  margin: 0 0 20px 0;
  color: #999;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.quick-links {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.quick-links h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9f9f9;
}

.link-item:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
}

.link-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.link-item span {
  font-size: 14px;
  color: #333;
}

.actions {
  text-align: center;
  padding: 20px 0;
}

.actions .el-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .link-grid {
    grid-template-columns: 1fr;
  }
  
  .user-stats {
    gap: 20px;
  }
}
</style>
