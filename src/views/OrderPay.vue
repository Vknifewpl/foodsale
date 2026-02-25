<template>
  <div class="order-pay-page">
    <div class="page-header">
      <el-button icon="el-icon-arrow-left" @click="$router.go(-1)">返回</el-button>
      <h2>订单支付</h2>
    </div>
    
    <div class="order-content">
      <div class="order-info">
        <h3>订单信息</h3>
        <div class="order-items">
          <div class="order-item" v-for="item in orderItems" :key="item.id">
            <div class="item-image">
              <img :src="getImageUrl(item.image)" :alt="item.name" />
            </div>
            <div class="item-details">
              <h4>{{ item.name }}</h4>
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
          <div class="summary-row">
            <span>配送费:</span>
            <span>¥0.00</span>
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
      return 'http://localhost:8080' + image
    },
    loadOrderItems() {
      // 从路由参数判断是从购物车还是直接下单
      if (this.$route.query.fromCart === 'true') {
        // 从购物车获取数据
        this.orderItems = [...this.$store.state.cart.items]
      } else {
        // 直接下单（例如从菜品详情页）
        // 这里可以根据实际情况获取数据
        // 临时示例数据
        this.orderItems = this.$route.params.items || []
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
        // 提交订单
        const orderData = {
          userId: JSON.parse(localStorage.getItem('user')).id,
          orderItems: this.orderItems.map(item => ({
            foodId: item.id,
            foodName: item.name,
            foodImage: item.image,
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
            this.$store.commit('clearCart')
            
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

.order-content {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.order-info {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.order-info h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.order-items {
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
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

.item-details {
  flex: 1;
}

.item-details h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.item-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 14px;
  color: #666;
}

.order-summary {
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.summary-row.total-row {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  padding-top: 10px;
  border-top: 1px solid #eee;
  margin-top: 10px;
}

.total-amount {
  color: #f56c6c;
  font-size: 18px;
}

.payment-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  height: fit-content;
}

.payment-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.payment-methods {
  margin-bottom: 30px;
}

.payment-method {
  padding: 15px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-method.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.payment-method i {
  font-size: 20px;
  color: #409eff;
}

.confirm-section {
  text-align: center;
}

.confirm-section .el-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .order-content {
    grid-template-columns: 1fr;
  }
}
</style>
