<template>
  <div class="collection-page">
    <div class="page-header">
      <h2>我的收藏</h2>
    </div>
    
    <div class="collection-content" v-loading="loading">
      <div class="collection-grid" v-if="collections.length > 0">
        <div class="collection-item" v-for="food in collections" :key="food.id">
          <div class="food-card" @click="goDetail(food.id)">
            <div class="food-image">
              <img :src="getImageUrl(food.image)" :alt="food.name" />
            </div>
            <div class="food-info">
              <h3 class="food-name">{{ food.name }}</h3>
              <p class="food-desc">{{ food.description || '暂无描述' }}</p>
              <div class="food-meta">
                <span class="food-price">¥{{ food.price }}</span>
                <span class="sales">销量: {{ food.orderCount || 0 }}</span>
              </div>
              <div class="food-actions">
                <el-button 
                  type="danger" 
                  size="small" 
                  icon="el-icon-star-on"
                  @click.stop="cancelCollection(food.id)"
                >
                  取消收藏
                </el-button>
                <el-button 
                  type="primary" 
                  size="small" 
                  icon="el-icon-shopping-cart-2"
                  @click.stop="addToCart(food)"
                >
                  加入购物车
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <el-empty v-else description="暂无收藏，快去发现美食吧~"></el-empty>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Collection',
  data() {
    return {
      loading: false,
      collections: []
    }
  },
  created() {
    this.fetchCollections()
  },
  methods: {
    async fetchCollections() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }

      this.loading = true
      try {
        // userId由后端从Token获取
        const res = await this.$axios.get('/collection/list')
        
        if (res.data.code === 200) {
          // 后端直接返回 Food[] 数组
          this.collections = res.data.data || []
        } else {
          this.$message.error(res.data.msg || '获取收藏列表失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      } finally {
        this.loading = false
      }
    },
    getImageUrl(image) {
      if (!image) return require('@/assets/default-food.png')
      if (image.startsWith('http')) return image
      return 'http://localhost:8089' + image
    },
    async cancelCollection(foodId) {
      try {
        const res = await this.$axios.post('/collection/delete', { foodId })
        if (res.data.code === 200) {
          this.$message.success('已取消收藏')
          this.fetchCollections()
        } else {
          this.$message.error(res.data.msg || '取消收藏失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      }
    },
    addToCart(food) {
      this.$store.dispatch('addToCart', {
        foodId: food.id,
        foodName: food.name,
        foodImage: food.image,
        price: food.price
      })
      this.$message.success('已加入购物车')
    },
    goDetail(id) {
      this.$router.push(`/food/${id}`)
    }
  }
}
</script>

<style scoped>
.collection-page {
  min-height: 100vh;
  padding-bottom: 80px;
}

.page-header {
  background: transparent;
  padding: 16px 0 24px 0;
  max-width: 1200px;
  margin: 0 auto;
}


.page-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #1d1d1f;
}

.collection-content {
  max-width: 1200px;
  margin: 0 auto;
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.collection-item {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
  display: flex;
  flex-direction: column;
}

.collection-item:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.food-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.food-image {
  height: 180px;
  overflow: hidden;
  background: #f5f5f7;
}

.food-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.collection-item:hover .food-image img {
  transform: scale(1.05);
}

.food-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.food-name {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.food-desc {
  font-size: 14px;
  font-weight: 500;
  color: #86868b;
  margin: 0 0 16px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.food-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  margin-top: auto;
}

.food-price {
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1f;
}

.sales {
  font-size: 14px;
  font-weight: 500;
  color: #86868b;
}

.food-actions {
  display: flex;
  gap: 12px;
}

.food-actions >>> .el-button {
  flex: 1;
  padding: 10px 0;
  border-radius: 980px;
  font-weight: 600;
}
.food-actions >>> .el-button--danger {
  background: #f5f5f7;
  border: none;
  color: #e30000;
}
.food-actions >>> .el-button--danger:hover {
  background: #fee6e6;
}

@media (max-width: 768px) {
  .collection-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }
  
  .page-header, .collection-content {
    padding: 0 16px;
  }
}
</style>
