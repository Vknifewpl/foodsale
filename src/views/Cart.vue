<template>
  <div class="cart-page">
    <div class="page-header">
      <el-button icon="el-icon-arrow-left" @click="$router.go(-1)">返回</el-button>
      <h2>购物车</h2>
    </div>
    
    <div class="cart-content">
      <div class="cart-list" v-if="cartItems.length > 0">
        <div class="cart-item" v-for="item in cartItems" :key="item.id">
          <div class="item-image">
            <img :src="getImageUrl(item.image)" :alt="item.name" />
          </div>
          
          <div class="item-info">
            <h3 class="item-name">{{ item.name }}</h3>
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
              @click="removeFromCart(item.id)"
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
      return this.$store.state.cart.items || []
    },
    totalAmount() {
      return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }
  },
  methods: {
    getImageUrl(image) {
      if (!image) return require('@/assets/default-food.png')
      if (image.startsWith('http')) return image
      return 'http://localhost:8080' + image
    },
    updateQuantity(item) {
      this.$store.commit('updateCartItem', item)
    },
    removeFromCart(itemId) {
      this.$store.commit('removeFromCart', itemId)
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

.cart-content {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
}

.cart-item {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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

.item-name {
  font-size: 16px;
  color: #333;
  margin: 0 0 5px 0;
}

.item-price {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-total {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
  min-width: 100px;
  text-align: right;
}

.cart-footer {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.total-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
}

.total-amount {
  color: #f56c6c;
  font-size: 24px;
}

@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .item-controls {
    justify-content: space-between;
  }
  
  .item-total {
    text-align: right;
  }
  
  .cart-footer {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
  
  .total-info {
    justify-content: center;
  }
}
</style>
