<template>
  <div class="profile-page">
    <div class="page-header">
      <h2>个人中心</h2>
    </div>
    
    <div class="profile-content">
      <div class="user-info-card">
        <div class="user-avatar">
          <el-avatar :size="80" icon="el-icon-user-solid"></el-avatar>
        </div>
        <div class="user-details">
          <h3>{{ username || '游客' }}</h3>
          <p>普通用户</p>
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
          <div class="link-item" @click="goToCart">
            <div class="link-icon cart-icon">
              <i class="el-icon-shopping-cart-2"></i>
            </div>
            <span>购物车</span>
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
import { mapState } from 'vuex'

export default {
  name: 'Profile',
  data() {
    return {
      orderCount: 0,
      collectionCount: 0
    }
  },
  computed: {
    ...mapState(['username'])
  },
  created() {
    this.loadStats()
  },
  methods: {
    async loadStats() {
      const token = localStorage.getItem('token')
      if (!token) return
      
      try {
        // 获取订单数量（userId由后端从Token获取）
        const orderRes = await this.$axios.get('/order/list', {
          params: { status: null }
        })
        if (orderRes.data.code === 200) {
          this.orderCount = orderRes.data.data?.length || 0
        }
        
        // 获取收藏数量（userId由后端从Token获取）
        const collectionRes = await this.$axios.get('/collection/list')
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
    goToCart() {
      this.$router.push('/cart')
    },
    logout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('logout')
        this.$message.success('已退出登录')
        this.$router.push('/')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding-bottom: 80px;
}

.page-header {
  background: transparent;
  padding: 16px 0 24px 0;
  max-width: 680px;
  margin: 0 auto;
}


.page-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #1d1d1f;
}

.profile-content {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.user-info-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.user-avatar {
  margin-bottom: 24px;
}

.user-avatar >>> .el-avatar {
  background: #f5f5f7;
  color: #86868b;
  font-size: 40px;
}

.user-details h3 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.5px;
}

.user-details p {
  margin: 0 0 32px 0;
  color: #86868b;
  font-size: 15px;
  font-weight: 500;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: 64px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -1px;
}

.stat-label {
  font-size: 14px;
  font-weight: 500;
  color: #86868b;
  margin-top: 4px;
  display: inline-block;
}

.quick-links {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.quick-links h3 {
  margin: 0 0 24px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.5px;
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
  background: #f5f5f7;
}

.link-item:hover {
  background: rgba(0, 113, 227, 0.04);
  transform: translateY(-4px) scale(1.02);
}

.link-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 113, 227, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0071e3;
  font-size: 20px;
  transition: all 0.3s ease;
}

.cart-icon {
  background: rgba(0, 113, 227, 0.08);
  color: #0071e3;
}

.link-item:hover .link-icon {
  background: #0071e3;
  color: #fff;
}

.link-item span {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

.actions {
  text-align: center;
  margin-top: 16px;
}

.actions .el-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 980px;
  background: #f5f5f7;
  color: #e30000;
  border: none;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.actions .el-button:hover {
  background: #fee6e6;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .link-grid {
    grid-template-columns: 1fr;
  }
  
  .user-stats {
    gap: 32px;
  }
  
  .page-header, .profile-content {
    padding: 0 16px;
  }
}
</style>
