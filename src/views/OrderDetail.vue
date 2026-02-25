<template>
  <div class="order-detail-page">
    <div class="page-header">
      <el-button icon="el-icon-arrow-left" @click="$router.go(-1)">返回</el-button>
      <h2>订单详情</h2>
    </div>
    
    <div class="order-detail" v-loading="loading">
      <div class="order-basic-info">
        <div class="info-row">
          <span class="label">订单号:</span>
          <span class="value">{{ order.orderNo }}</span>
        </div>
        <div class="info-row">
          <span class="label">订单状态:</span>
          <span class="value status-text" :class="'status-' + order.status">
            {{ getStatusText(order.status) }}
          </span>
        </div>
        <div class="info-row">
          <span class="label">下单时间:</span>
          <span class="value">{{ formatTime(order.orderTime) }}</span>
        </div>
        <div class="info-row" v-if="order.payTime">
          <span class="label">支付时间:</span>
          <span class="value">{{ formatTime(order.payTime) }}</span>
        </div>
        <div class="info-row" v-if="order.completeTime">
          <span class="label">完成时间:</span>
          <span class="value">{{ formatTime(order.completeTime) }}</span>
        </div>
      </div>
      
      <div class="order-items-section">
        <h3>商品明细</h3>
        <div class="order-items">
          <div class="order-item" v-for="item in order.orderItems" :key="item.id">
            <div class="item-image">
              <img :src="getImageUrl(item.foodImage)" :alt="item.foodName" />
            </div>
            <div class="item-info">
              <h4>{{ item.foodName }}</h4>
              <p class="item-meta">
                <span>单价: ¥{{ item.price }}</span>
                <span>数量: {{ item.quantity }}</span>
                <span>小计: ¥{{ item.subtotal }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="order-summary">
        <h3>订单汇总</h3>
        <div class="summary-row">
          <span>商品合计:</span>
          <span>¥{{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span>配送费:</span>
          <span>¥0.00</span>
        </div>
        <div class="summary-row total-row">
          <span>订单总额:</span>
          <span class="total-amount">¥{{ order.totalAmount }}</span>
        </div>
      </div>
      
      <div class="order-actions" v-if="order.status == 0">
        <el-button type="primary" @click="payOrder">立即支付</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderDetail',
  data() {
    return {
      loading: false,
      order: {}
    }
  },
  computed: {
    subtotal() {
      return this.order.orderItems?.reduce((sum, item) => sum + item.subtotal, 0) || 0
    }
  },
  created() {
    this.fetchOrderDetail()
  },
  methods: {
    async fetchOrderDetail() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }

      this.loading = true
      try {
        const orderNo = this.$route.params.orderNo
        const res = await this.$axios.get('/order/detail', {
          params: { orderNo }
        })
        
        if (res.data.code === 200) {
          this.order = res.data.data || {}
        } else {
          this.$message.error(res.data.msg || '获取订单详情失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      } finally {
        this.loading = false
      }
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
    async payOrder() {
      try {
        const res = await this.$axios.post('/order/pay', { orderNo: this.order.orderNo })
        if (res.data.code === 200) {
          this.$message.success('支付成功')
          // 刷新当前页面
          this.fetchOrderDetail()
        } else {
          this.$message.error(res.data.msg || '支付失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      }
    }
  }
}
</script>

<style scoped>
.order-detail-page {
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

.order-detail {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}

.order-basic-info {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.info-row {
  display: flex;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f5f5f5;
}

.info-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.label {
  width: 100px;
  color: #999;
  font-size: 14px;
}

.value {
  flex: 1;
  color: #333;
  font-size: 14px;
}

.status-text.status-0 {
  color: #f56c6c;
}

.status-text.status-1 {
  color: #909399;
}

.status-text.status-2 {
  color: #67c23a;
}

.order-items-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.order-items-section h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #333;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  display: flex;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.item-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.order-summary {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.order-summary h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #333;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 5px 0;
  font-size: 14px;
  color: #666;
}

.summary-row.total-row {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  padding-top: 15px;
  border-top: 1px solid #eee;
  margin-top: 10px;
}

.total-amount {
  color: #f56c6c;
  font-size: 18px;
}

.order-actions {
  text-align: right;
  padding: 20px 0;
}

.order-actions .el-button {
  height: 40px;
  padding: 0 30px;
}

@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
    gap: 5px;
  }
  
  .label {
    width: auto;
  }
  
  .item-meta {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
