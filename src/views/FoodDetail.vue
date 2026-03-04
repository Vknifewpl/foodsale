<template>
  <div class="food-detail-page">
    <div class="page-header">
      <h2>菜品详情</h2>
    </div>
    
    <div class="food-content" v-loading="loading">
      <div class="food-main" v-if="food">
        <div class="food-image">
          <img :src="getImageUrl(food.image)" :alt="food.name" />
        </div>
        
        <div class="food-info">
          <h1 class="food-name">{{ food.name }}</h1>
          
          <div class="food-meta">
            <span class="category">分类: {{ food.categoryName || '未分类' }}</span>
            <span class="sales">销量: {{ food.orderCount || 0 }}</span>
            <span class="praise">好评: {{ food.praiseCount || 0 }}</span>
          </div>
          
          <div class="food-price">
            <span class="label">价格</span>
            <span class="value">¥{{ food.price }}</span>
          </div>
          
          <div class="food-desc">
            <h3>菜品描述</h3>
            <p>{{ food.description || '暂无描述' }}</p>
          </div>
          
          <div class="food-actions">
            <el-button 
              :type="isCollected ? 'danger' : 'default'" 
              @click="toggleCollect"
              :icon="isCollected ? 'el-icon-star-on' : 'el-icon-star-off'"
            >
              {{ isCollected ? '已收藏' : '收藏' }}
            </el-button>
            
            <div class="quantity-control">
              <el-input-number 
                v-model="quantity" 
                :min="1" 
                :max="10" 
                size="medium"
              ></el-input-number>
            </div>
            
            <el-button type="primary" icon="el-icon-shopping-cart-2" @click="addToCart">
              加入购物车
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 评论区域 -->
      <div class="comments-section">
        <h2 class="section-title">
          <i class="el-icon-chat-dot-round"></i> 用户评论
          <span class="comment-count">({{ comments.length }}条)</span>
        </h2>
        
        <div class="comments-list" v-if="comments.length > 0">
          <div class="comment-item" v-for="comment in comments" :key="comment.id">
            <div class="comment-header">
              <div class="user-info">
                <el-avatar size="small" icon="el-icon-user-solid"></el-avatar>
                <span class="username">{{ comment.username || '匿名用户' }}</span>
              </div>
              <div class="comment-rating">
                <el-rate v-model="comment.rating" disabled></el-rate>
              </div>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-time">{{ formatTime(comment.createTime) }}</div>
          </div>
        </div>
        
        <el-empty v-else description="暂无评论"></el-empty>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FoodDetail',
  data() {
    return {
      loading: false,
      food: null,
      quantity: 1,
      isCollected: false,
      comments: []
    }
  },
  created() {
    this.fetchFoodDetail()
    this.checkCollected()
  },
  methods: {
    getImageUrl(image) {
      if (!image) return require('@/assets/default-food.png')
      if (image.startsWith('http')) return image
      return 'http://localhost:8089' + image
    },
    async fetchFoodDetail() {
      this.loading = true
      try {
        const foodId = this.$route.params.id
        const res = await this.$axios.get('/food/detail', {
          params: { foodId }
        })
        if (res.data.code === 200) {
          // 后端返回 {food: Food, comments: Comment[], isCollected?: boolean}
          const result = res.data.data
          this.food = result.food
          this.comments = result.comments || []
          if (result.isCollected !== undefined) {
            this.isCollected = result.isCollected
          }
        } else {
          this.$message.error(res.data.msg || '获取菜品详情失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      } finally {
        this.loading = false
      }
    },
    async checkCollected() {
      const token = localStorage.getItem('token')
      if (!token) return
      
      try {
        const foodId = this.$route.params.id
        const res = await this.$axios.get('/collection/check', {
          params: { foodId }
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
      this.$store.dispatch('addToCart', {
        foodId: this.food.id,
        foodName: this.food.name,
        foodImage: this.food.image,
        price: this.food.price,
        quantity: this.quantity
      })
      this.$message.success('已加入购物车')
    },
    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleString()
    }
  }
}
</script>

<style scoped>
.food-detail-page {
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

.food-content {
  max-width: 1000px;
  margin: 0 auto;
}

.food-main {
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  margin-bottom: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.food-image {
  width: 320px;
  height: 320px;
  flex-shrink: 0;
  background: #f5f5f7;
}

.food-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.food-info {
  flex: 1;
  padding: 32px;
  display: flex;
  flex-direction: column;
}

.food-name {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.8px;
  color: #1d1d1f;
  margin: 0 0 12px 0;
}

.food-meta {
  display: flex;
  gap: 20px;
  color: #86868b;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 24px;
}

.food-price {
  background: #f5f5f7;
  padding: 16px 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.food-price .label {
  font-size: 14px;
  font-weight: 500;
  color: #86868b;
}

.food-price .value {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.5px;
}

.food-desc {
  margin-bottom: auto;
}

.food-desc h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 12px 0;
}

.food-desc p {
  color: #55555a;
  line-height: 1.6;
  font-size: 15px;
  margin: 0;
}

.food-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}

.quantity-control {
  background: #f5f5f7;
  border-radius: 980px;
  padding: 4px;
}
.quantity-control >>> .el-input-number__decrease,
.quantity-control >>> .el-input-number__increase {
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #1d1d1f;
}
.quantity-control >>> .el-input__inner {
  background: transparent;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.comments-section {
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 32px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: -0.5px;
}

.comment-count {
  font-size: 16px;
  color: #86868b;
  font-weight: 500;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  padding: 24px;
  background: #f5f5f7;
  border-radius: 20px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-weight: 600;
  font-size: 15px;
  color: #1d1d1f;
}

.comment-content {
  color: #1d1d1f;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.comment-time {
  font-size: 13px;
  font-weight: 500;
  color: #86868b;
}

@media (max-width: 768px) {
  .food-main {
    flex-direction: column;
  }
  
  .food-image {
    width: 100%;
    height: 350px;
  }
  
  .food-info {
    padding: 32px 24px;
  }
  
  .food-actions {
    flex-wrap: wrap;
  }
  
  .page-header {
    padding: 16px 24px;
  }
  
  .food-content {
    padding: 0 16px;
  }
}
</style>
