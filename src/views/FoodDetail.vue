<template>
  <div class="food-detail-page">
    <div class="page-header">
      <el-button icon="el-icon-arrow-left" @click="$router.back()">返回</el-button>
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
    this.fetchComments()
    this.checkCollected()
  },
  methods: {
    getImageUrl(image) {
      if (!image) return require('@/assets/default-food.png')
      if (image.startsWith('http')) return image
      return 'http://localhost:8080' + image
    },
    async fetchFoodDetail() {
      this.loading = true
      try {
        const foodId = this.$route.params.id
        const res = await this.$axios.get('/food/detail', {
          params: { foodId }
        })
        if (res.data.code === 200) {
          this.food = res.data.data
        } else {
          this.$message.error(res.data.msg || '获取菜品详情失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      } finally {
        this.loading = false
      }
    },
    async fetchComments() {
      try {
        const foodId = this.$route.params.id
        const res = await this.$axios.get('/comment/food', {
          params: { foodId }
        })
        if (res.data.code === 200) {
          this.comments = res.data.data || []
        }
      } catch (e) {
        console.log('获取评论失败')
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
      this.$store.commit('addToCart', {
        id: this.food.id,
        name: this.food.name,
        price: this.food.price,
        image: this.food.image,
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

.food-content {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.food-main {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  margin-bottom: 20px;
}

.food-image {
  width: 400px;
  height: 400px;
  flex-shrink: 0;
}

.food-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.food-info {
  flex: 1;
  padding: 30px;
}

.food-name {
  font-size: 28px;
  color: #333;
  margin: 0 0 20px 0;
}

.food-meta {
  display: flex;
  gap: 20px;
  color: #999;
  font-size: 14px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.food-price {
  background: #fff5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.food-price .label {
  font-size: 14px;
  color: #999;
  margin-right: 10px;
}

.food-price .value {
  font-size: 32px;
  font-weight: 600;
  color: #f56c6c;
}

.food-desc {
  margin-bottom: 30px;
}

.food-desc h3 {
  font-size: 16px;
  color: #333;
  margin: 0 0 10px 0;
}

.food-desc p {
  color: #666;
  line-height: 1.8;
  margin: 0;
}

.food-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.comments-section {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
}

.section-title {
  font-size: 18px;
  color: #333;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.comment-count {
  font-size: 14px;
  color: #999;
  font-weight: normal;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  font-weight: 500;
  color: #333;
}

.comment-content {
  color: #666;
  line-height: 1.6;
  margin-bottom: 10px;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

@media (max-width: 768px) {
  .food-main {
    flex-direction: column;
  }
  
  .food-image {
    width: 100%;
    height: 300px;
  }
  
  .food-actions {
    flex-wrap: wrap;
  }
}
</style>
