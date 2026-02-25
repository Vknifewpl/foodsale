<template>
  <div class="collection-page">
    <div class="page-header">
      <el-button icon="el-icon-arrow-left" @click="$router.go(-1)">返回</el-button>
      <h2>我的收藏</h2>
    </div>
    
    <div class="collection-content" v-loading="loading">
      <div class="collection-grid" v-if="collections.length > 0">
        <div class="collection-item" v-for="item in collections" :key="item.id">
          <div class="food-card">
            <div class="food-image">
              <img :src="getImageUrl(item.food.image)" :alt="item.food.name" />
            </div>
            <div class="food-info">
              <h3 class="food-name">{{ item.food.name }}</h3>
              <p class="food-desc">{{ item.food.description || '暂无描述' }}</p>
              <div class="food-meta">
                <span class="food-price">¥{{ item.food.price }}</span>
                <span class="sales">销量: {{ item.food.orderCount || 0 }}</span>
              </div>
              <div class="food-actions">
                <el-button 
                  type="danger" 
                  size="small" 
                  icon="el-icon-star-on"
                  @click="cancelCollection(item.food.id)"
                >
                  取消收藏
                </el-button>
                <el-button 
                  type="primary" 
                  size="small" 
                  icon="el-icon-shopping-cart-2"
                  @click="addToCart(item.food)"
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
        const userId = JSON.parse(localStorage.getItem('user')).id
        const res = await this.$axios.get('/collection/list', {
          params: { userId }
        })
        
        if (res.data.code === 200) {
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
      return 'http://localhost:8080' + image
    },
    async cancelCollection(foodId) {
      try {
        const res = await this.$axios.post('/collection/delete', {
          foodId
        })
        if (res.data.code === 200) {
          this.$message.success('已取消收藏')
          this.fetchCollections() // 刷新列表
        } else {
          this.$message.error(res.data.msg || '取消收藏失败')
        }
      } catch (e) {
        this.$message.error('网络错误，请重试')
      }
    },
    addToCart(food) {
      this.$store.commit('addToCart', {
        id: food.id,
        name: food.name,
        price: food.price,
        image: food.image,
        quantity: 1
      })
      this.$message.success('已加入购物车')
    }
  }
}
</script>

<style scoped>
.collection-page {
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

.collection-content {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.collection-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.collection-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.food-card {
  cursor: pointer;
}

.food-image {
  height: 180px;
  overflow: hidden;
}

.food-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.collection-item:hover .food-image img {
  transform: scale(1.05);
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

.food-meta {
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

.sales {
  font-size: 12px;
  color: #999;
}

.food-actions {
  display: flex;
  gap: 10px;
}

.food-actions .el-button {
  flex: 1;
}

@media (max-width: 768px) {
  .collection-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
</style>
