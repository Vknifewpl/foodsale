<template>
  <div class="order-detail-page">
    <div class="page-header">
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
      return 'http://localhost:8089' + image
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
  padding-bottom: 80px;
}

.page-header {
  background: transparent;
  padding: 16px 0 24px 0;
  max-width: 800px;
  margin: 0 auto;
}


.page-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #1d1d1f;
}

.order-detail {
  max-width: 800px;
  margin: 0 auto;
}

.order-basic-info {
  background: #fff;
  border-radius: 18px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.info-row {
  display: flex;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.info-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.label {
  width: 100px;
  color: #86868b;
  font-size: 14px;
  font-weight: 500;
}

.value {
  flex: 1;
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 600;
}

.status-text {
  padding: 6px 14px;
  border-radius: 980px;
  font-size: 14px;
  display: inline-block;
}
.status-text.status-0 {
  background: rgba(227, 0, 0, 0.08);
  color: #e30000;
}
.status-text.status-1 {
  background: #f5f5f7;
  color: #55555a;
}
.status-text.status-2 {
  background: rgba(0, 113, 227, 0.08);
  color: #0071e3;
}

.order-items-section {
  background: #fff;
  border-radius: 18px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.order-items-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.3px;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  background: #f5f5f7;
  border-radius: 12px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-info h4 {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

.item-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #86868b;
  margin: 0;
}

.order-summary {
  background: #f5f5f7;
  border-radius: 18px;
  padding: 20px 24px;
  margin-bottom: 24px;
}

.order-summary h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.3px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #86868b;
}

.summary-row.total-row {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin-top: 12px;
  margin-bottom: 0;
}

.total-amount {
  color: #1d1d1f;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.order-actions {
  text-align: right;
  padding: 0;
}

.order-actions .el-button {
  height: 48px;
  padding: 0 32px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 980px;
  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.3);
}

@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .label {
    width: auto;
  }
  
  .item-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .page-header, .order-detail {
    padding: 0 16px;
  }
  
  .order-basic-info, .order-items-section, .order-summary {
    padding: 24px;
  }
}
</style>
