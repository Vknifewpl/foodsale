<template>
  <div class="cart-page">
    <div class="page-header">
      <h2>购物车</h2>
    </div>
    
    <div class="cart-content">
      <div class="cart-list" v-if="cartItems.length > 0">
        <div class="cart-item" v-for="item in cartItems" :key="item.foodId">
          <div class="item-image">
            <img :src="getImageUrl(item.foodImage)" :alt="item.foodName" />
          </div>
          
          <div class="item-info">
            <h3 class="item-name">{{ item.foodName }}</h3>
            <div class="item-price">¥{{ item.price }}</div>
          </div>
          
          <div class="item-controls">
            <el-input-number 
              v-model="item.quantity" 
              :min="1" 
              :max="10" 
              size="small"
              @change="updateQuantity(item)"
            ></el-input-number>
            <el-button 
              type="danger" 
              icon="el-icon-delete" 
              size="small" 
              @click="removeFromCart(item.foodId)"
            ></el-button>
          </div>
          
          <div class="item-total">
            ¥{{ (item.price * item.quantity).toFixed(2) }}
          </div>
        </div>
      </div>
      
      <el-empty v-else description="购物车为空，快去选购吧~"></el-empty>
      
      <div class="cart-footer" v-if="cartItems.length > 0">
        <div class="total-info">
          <span>总计:</span>
          <span class="total-amount">¥{{ totalAmount.toFixed(2) }}</span>
        </div>
        <el-button 
          type="primary" 
          size="large" 
          @click="checkout"
          :disabled="cartItems.length === 0"
        >
          去结算
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Cart',
  computed: {
    cartItems() {
      return this.$store.state.cart
    },
    totalAmount() {
      return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }
  },
  methods: {
    getImageUrl(image) {
      if (!image) return require('@/assets/default-food.png')
      if (image.startsWith('http')) return image
      return 'http://localhost:8089' + image
    },
    updateQuantity(item) {
      this.$store.commit('UPDATE_CART_QUANTITY', {
        foodId: item.foodId,
        quantity: item.quantity
      })
    },
    removeFromCart(foodId) {
      this.$store.commit('REMOVE_FROM_CART', foodId)
    },
    checkout() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      
      // 将购物车数据传递给订单支付页面
      this.$router.push({
        path: '/order/pay',
        query: { fromCart: 'true' }
      })
    }
  }
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  padding-bottom: 80px;
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

.cart-content {
  max-width: 1000px;
  margin: 0 auto;
}

.cart-item {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.cart-item:hover {
  transform: translateY(-4px) scale(1.005);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
}

.item-image {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 6px 0;
}

.item-price {
  font-size: 15px;
  font-weight: 500;
  color: #86868b;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-controls >>> .el-input-number {
  border-radius: 980px;
  overflow: hidden;
  background: #f5f5f7;
}

.item-controls >>> .el-input__inner {
  border: none;
  background: transparent;
  color: #1d1d1f;
  font-weight: 600;
}

.item-controls >>> .el-input-number__decrease,
.item-controls >>> .el-input-number__increase {
  background: transparent;
  border: none;
  color: #1d1d1f;
}

.item-controls >>> .el-button--danger {
  background: #f5f5f7;
  border: none;
  color: #e30000;
  box-shadow: none;
}
.item-controls >>> .el-button--danger:hover {
  background: #fee6e6;
  color: #e30000;
}

.item-total {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  min-width: 100px;
  text-align: right;
}

.cart-footer {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px 24px;
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.total-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  color: #1d1d1f;
  font-weight: 500;
}

.total-amount {
  color: #1d1d1f;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.cart-footer >>> .el-button--primary {
  padding: 12px 32px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .item-image {
    width: 100%;
    height: 200px;
  }
  
  .item-controls {
    width: 100%;
    justify-content: space-between;
    margin-top: 16px;
  }
  
  .item-total {
    text-align: left;
    margin-top: 16px;
  }
  
  .cart-footer {
    flex-direction: column;
    gap: 24px;
    align-items: center;
  }
  
  .page-header, .cart-content {
    padding: 0 16px;
  }
}
</style>
