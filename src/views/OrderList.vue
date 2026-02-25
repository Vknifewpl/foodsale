<template>
  <div class="order-list-page">
    <div class="page-header">
      <el-button icon="el-icon-arrow-left" @click="$router.go(-1)">返回</el-button>
      <h2>我的订单</h2>
    </div>
    
    <div class="filter-tabs">
      <el-tabs v-model="activeStatus" @tab-click="handleTabClick">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="待支付" name="0"></el-tab-pane>
        <el-tab-pane label="已支付" name="1"></el-tab-pane>
        <el-tab-pane label="已完成" name="2"></el-tab-pane>
      </el-tabs>
    </div>
    
    <div class="order-list" v-loading="loading">
      <div class="order-item" v-for="order in orders" :key="order.id">
        <div class="order-header">
          <span class="order-no">订单号: {{ order.orderNo }}</span>
          <span class="order-status" :class="'status-' + order.status">
            {{ getStatusText(order.status) }}
          </span>
        </div>
        
        <div class="order-body">
          <div class="order-items">
            <div class="order-item-detail" v-for="item in order.orderItems" :key="item.id">
              <div class="item-image">
                <img :src="getImageUrl(item.foodImage)" :alt="item.foodName" />
              </div>
              <div class="item-info">
                <h4>{{ item.foodName }}</h4>
                <p>¥{{ item.price }} × {{ item.quantity }} = ¥{{ item.subtotal }}</p>
              </div>
            </div>
          </div>
          
          <div class="order-summary">
            <div class="summary-row">
              <span>订单金额:</span>
              <span class="amount">¥{{ order.totalAmount }}</span>
            </div>
            <div class="summary-row">
              <span>下单时间:</span>
              <span>{{ formatTime(order.orderTime) }}</span>
            </div>
            <div class="summary-row" v-if="order.payTime">
              <span>支付时间:</span>
              <span>{{ formatTime(order.payTime) }}</span>
            </div>
          </div>
        </div>
        
        <div class="order-actions">
          <el-button 
            v-if="order.status == 0" 
            type="primary" 
            size="small"
            @click="payOrder(order.orderNo)"
          >
            立即支付
          </el-button>
          <el-button 
            type="info" 
            size="small"
            @click="viewOrder(order.orderNo)"
          >
            查看详情
          </el-button>
        </div>
      </div>
      
      <el-empty v-if="orders.length === 0" description="暂无订单"></el-empty>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderList',
  data() {
    return {
      loading: false,
      activeStatus: 'all',
      orders: []
    }
  },
  created() {
    this.fetchOrders()
  },
  methods: {
    async fetchOrders() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }

      this.loading = true
      try {
        const userId = JSON.parse(localStorage.getItem('user')).id
        const status = this.activeStatus === 'all' ? null : parseInt(this.activeStatus)
        
        const res = await this.$axios.get('/order/list', {
          params: { userId, status }
        })
        
        if (res.data.code === 200) {
          this.orders = res.data.data || []
        } else {
          this.$message.error(res.data.msg || '获取订单列表失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      } finally {
        this.loading = false
      }
    },
    handleTabClick() {
      this.fetchOrders()
    },
    getStatusText(status) {
      const statusMap = {
        0: '待支付',
        1: '已支付',
        2: '已完成'
      }
      return statusMap[status] || '未知'
    },
    getImageUrl(image) {
      if (!image) return require('@/assets/default-food.png')
      if (image.startsWith('http')) return image
      return 'http://localhost:8080' + image
    },
    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleString()
    },
    async payOrder(orderNo) {
      try {
        const res = await this.$axios.post('/order/pay', { orderNo })
        if (res.data.code === 200) {
          this.$message.success('支付成功')
          this.fetchOrders() // 刷新列表
        } else {
          this.$message.error(res.data.msg || '支付失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      }
    },
    viewOrder(orderNo) {
      this.$router.push(`/order/${orderNo}`)
    }
  }
}
</script>

<style scoped>
.order-list-page {
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

.filter-tabs {
  background: #fff;
  padding: 15px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.order-list {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
}

.order-item {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.order-no {
  font-size: 14px;
  color: #666;
}

.order-status {
  font-size: 14px;
  padding: 4px 10px;
  border-radius: 4px;
}

.status-0 {
  background: #fef0f0;
  color: #f56c6c;
}

.status-1 {
  background: #f4f4f5;
  color: #909399;
}

.status-2 {
  background: #f0f9eb;
  color: #67c23a;
}

.order-body {
  display: flex;
  gap: 20px;
}

.order-items {
  flex: 1;
}

.order-item-detail {
  display: flex;
  gap: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.order-item-detail:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #333;
}

.item-info p {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.order-summary {
  width: 200px;
  flex-shrink: 0;
  padding-left: 20px;
  border-left: 1px solid #f5f5f5;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px;
  color: #666;
}

.amount {
  color: #f56c6c;
  font-weight: 600;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f5f5f5;
}

@media (max-width: 768px) {
  .order-body {
    flex-direction: column;
  }
  
  .order-summary {
    width: 100%;
    padding-left: 0;
    border-left: none;
    border-top: 1px solid #f5f5f5;
    margin-top: 15px;
    padding-top: 15px;
  }
  
  .order-actions {
    justify-content: stretch;
  }
}
</style>
