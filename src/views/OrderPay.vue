<template>
  <div class="order-pay-page">
    <div class="page-header">
      <h2>订单支付</h2>
    </div>
    
    <div class="order-content">
      <div class="order-info">
        <h3>订单信息</h3>
        <div class="order-items">
          <div class="order-item" v-for="item in orderItems" :key="item.foodId">
            <div class="item-image">
              <img :src="getImageUrl(item.foodImage)" :alt="item.foodName" />
            </div>
            <div class="item-details">
              <h4>{{ item.foodName }}</h4>
              <div class="item-meta">
                <span>单价: ¥{{ item.price }}</span>
                <span>数量: {{ item.quantity }}</span>
                <span>小计: ¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="order-summary">
          <div class="summary-row">
            <span>商品总价:</span>
            <span>¥{{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="summary-row total-row">
            <span>订单总额:</span>
            <span class="total-amount">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <div class="payment-section">
        <h3>支付方式</h3>
        <div class="payment-methods">
          <div class="payment-method active">
            <i class="el-icon-wallet"></i>
            <span>在线支付</span>
          </div>
        </div>
        
        <div class="confirm-section">
          <el-button 
            type="primary" 
            size="large" 
            @click="submitOrder"
            :loading="submitting"
            :disabled="submitting"
          >
            {{ submitting ? '提交中...' : '立即支付' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderPay',
  data() {
    return {
      orderItems: [],
      submitting: false
    }
  },
  computed: {
    subtotal() {
      return this.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    },
    totalAmount() {
      return this.subtotal // 配送费为0
    }
  },
  created() {
    this.loadOrderItems()
  },
  methods: {
    getImageUrl(image) {
      if (!image) return require('@/assets/default-food.png')
      if (image.startsWith('http')) return image
      return 'http://localhost:8089' + image
    },
    loadOrderItems() {
      // 从购物车获取数据
      if (this.$route.query.fromCart === 'true') {
        this.orderItems = this.$store.state.cart.map(item => ({
          foodId: item.foodId,
          foodName: item.foodName,
          foodImage: item.foodImage,
          price: item.price,
          quantity: item.quantity
        }))
      } else {
        // 直接下单场景（暂不支持）
        this.orderItems = []
      }
    },
    async submitOrder() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }

      if (this.orderItems.length === 0) {
        this.$message.warning('订单不能为空')
        return
      }

      this.submitting = true
      try {
        // 提交订单（userId由后端从Token获取）
        const orderData = {
          orderItems: this.orderItems.map(item => ({
            foodId: item.foodId,
            foodName: item.foodName,
            foodImage: item.foodImage,
            price: item.price,
            quantity: item.quantity,
            subtotal: parseFloat((item.price * item.quantity).toFixed(2))
          }))
        }

        const res = await this.$axios.post('/order/submit', orderData)
        if (res.data.code === 200) {
          const orderNo = res.data.data.orderNo
          
          // 模拟支付
          const payRes = await this.$axios.post('/order/pay', { orderNo })
          if (payRes.data.code === 200) {
            // 清空购物车
            this.$store.commit('CLEAR_CART')
            
            this.$message.success('订单提交成功！')
            this.$router.push(`/order/${orderNo}`)
          } else {
            this.$message.error(payRes.data.msg || '支付失败')
          }
        } else {
          this.$message.error(res.data.msg || '订单提交失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.order-pay-page {
  min-height: 100vh;
  padding-bottom: 40px;
}

.page-header {
  background: transparent;
  padding: 16px 0 24px 0;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #1d1d1f;
}

.order-content {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 28px;
  align-items: start;
}

.order-info {
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.order-info h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.3px;
}

.order-items {
  margin-bottom: 16px;
  max-height: 340px;
  overflow-y: auto;
}

.order-item {
  display: flex;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 68px;
  height: 68px;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-details h4 {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

.item-meta {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #86868b;
  font-weight: 500;
}

.order-summary {
  background: #f5f5f7;
  border-radius: 14px;
  padding: 16px 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #86868b;
}

.summary-row.total-row {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin-top: 10px;
  margin-bottom: 0;
}

.total-amount {
  color: #1d1d1f;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.payment-section {
  background: transparent;
  padding: 0;
  height: fit-content;
}

.payment-section h3 {
  margin: 0 0 14px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.3px;
}

.payment-methods {
  margin-bottom: 20px;
}

.payment-method {
  padding: 16px;
  background: #fff;
  border: 2px solid transparent;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
}

.payment-method.active {
  border-color: #0071e3;
  background: rgba(0, 113, 227, 0.04);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.15);
}

.payment-method i {
  font-size: 20px;
  color: #0071e3;
}
.payment-method span {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

.confirm-section {
  text-align: center;
}

.confirm-section .el-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.3);
}

@media (max-width: 768px) {
  .order-content {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 0 16px;
  }
  
  .page-header {
    padding: 16px;
  }
  
  .order-info {
    padding: 24px;
  }
}
</style>
