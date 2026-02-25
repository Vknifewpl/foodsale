<template>
  <div class="food-card" @click="goDetail">
    <div class="food-image">
      <img :src="getImageUrl(food.image)" :alt="food.name" />
      <div class="collect-btn" @click.stop="toggleCollect">
        <i :class="['el-icon-star-on', { collected: isCollected }]"></i>
      </div>
    </div>
    <div class="food-info">
      <h3 class="food-name">{{ food.name }}</h3>
      <p class="food-desc">{{ food.description || '暂无描述' }}</p>
      <div class="food-bottom">
        <span class="food-price">¥{{ food.price }}</span>
        <div class="food-stats">
          <span class="order-count">销量: {{ food.orderCount || 0 }}</span>
          <span class="praise-count">好评: {{ food.praiseCount || 0 }}</span>
        </div>
      </div>
      <el-button 
        type="primary" 
        size="small" 
        class="add-cart-btn"
        @click.stop="addToCart"
      >
        <i class="el-icon-shopping-cart-2"></i> 加入购物车
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FoodCard',
  props: {
    food: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isCollected: false
    }
  },
  mounted() {
    this.checkCollected()
  },
  methods: {
    getImageUrl(image) {
      if (!image) return require('@/assets/default-food.png')
      if (image.startsWith('http')) return image
      return 'http://localhost:8080' + image
    },
    goDetail() {
      this.$router.push(`/food/${this.food.id}`)
    },
    async checkCollected() {
      const token = localStorage.getItem('token')
      if (!token) return
      
      try {
        const res = await this.$axios.get('/collection/check', {
          params: { foodId: this.food.id }
        })
        if (res.data.code === 200) {
          this.isCollected = res.data.data
        }
      } catch (e) {
        console.log('检查收藏状态失败')
      }
    },
    async toggleCollect() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      
      try {
        if (this.isCollected) {
          const res = await this.$axios.post('/collection/delete', {
            foodId: this.food.id
          })
          if (res.data.code === 200) {
            this.isCollected = false
            this.$message.success('已取消收藏')
          }
        } else {
          const res = await this.$axios.post('/collection/add', {
            foodId: this.food.id
          })
          if (res.data.code === 200) {
            this.isCollected = true
            this.$message.success('收藏成功')
          }
        }
      } catch (e) {
        this.$message.error('操作失败')
      }
    },
    addToCart() {
      this.$store.commit('addToCart', {
        id: this.food.id,
        name: this.food.name,
        price: this.food.price,
        image: this.food.image,
        quantity: 1
      })
      this.$message.success('已加入购物车')
    }
  }
}
</script>

<style scoped>
.food-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.food-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.food-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.food-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.food-card:hover .food-image img {
  transform: scale(1.05);
}

.collect-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.collect-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

.collect-btn i {
  font-size: 20px;
  color: #ccc;
}

.collect-btn i.collected {
  color: #f56c6c;
}

.food-info {
  padding: 15px;
}

.food-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.food-desc {
  font-size: 12px;
  color: #999;
  margin: 0 0 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.food-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.food-price {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.food-stats {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #999;
}

.add-cart-btn {
  width: 100%;
}
</style>
