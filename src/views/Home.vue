<template>
  <div class="home-container">
    <div class="home">
      <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input v-model="searchKeyword" placeholder="搜索菜品" @keyup.enter.native="handleSearch">
        <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
      </el-input>
    </div>
    
    <!-- 分类导航与榜单入口 -->
    <div class="top-controls">
      <div class="category-nav">
        <div class="nav-pill" :class="{ active: activeCategory === null }" @click="selectCategory(null)">全部</div>
        <div class="nav-pill" v-for="cat in categories" :key="cat.id" 
             :class="{ active: activeCategory === cat.id }"
             @click="selectCategory(cat.id)">
          {{ cat.name }}
        </div>
      </div>
      <div class="rank-entry">
        <el-button round icon="el-icon-trophy" @click="showHotRank = true">热门排行</el-button>
      </div>
    </div>
    
    <!-- 菜品列表标题 -->
    <div class="section-title">
      <span v-if="isNewUser || !isLoggedIn">好评排行榜</span>
      <span v-else>为您推荐</span>
    </div>
    
    <!-- 菜品列表 -->
    <div class="food-list" v-loading="loading">
      <div class="food-card" v-for="food in displayFoods" :key="food.id" @click="goDetail(food.id)">
        <div class="food-image">
          <img :src="getImageUrl(food.image)" :alt="food.name">
        </div>
        <div class="food-info">
          <div class="info-top">
            <div class="name-row">
              <h3>{{ food.name }}</h3>
              <span class="category">{{ food.categoryName }}</span>
            </div>
            <p class="description">{{ food.description }}</p>
            <div class="food-stats">
              <span><i class="el-icon-sold-out"></i> 销量 {{ food.orderCount }}</span>
              <span><i class="el-icon-star-on"></i> 好评数 {{ food.praiseCount }}</span>
            </div>
          </div>
          <div class="price-row">
            <span class="price">¥{{ food.price }}</span>
            <div class="add-btn" @click.stop="addToCart(food)">
              <i class="el-icon-shopping-cart-2"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <el-empty v-if="!loading && displayFoods.length === 0" description="暂无菜品"></el-empty>
    
    <!-- 热门TOP10弹窗 -->
    <el-dialog title="热门菜品TOP10" :visible.sync="showHotRank" width="600px">
      <div class="hot-rank-list">
        <div class="rank-item" v-for="(food, index) in hotFoods" :key="food.id" @click="goDetail(food.id)">
          <span class="rank-num" :class="'top-' + (index + 1)">{{ index + 1 }}</span>
          <img :src="getImageUrl(food.image)" :alt="food.name">
          <div class="rank-info">
            <h4>{{ food.name }}</h4>
            <p>点餐次数: {{ food.orderCount }}</p>
          </div>
          <span class="rank-price">¥{{ food.price }}</span>
        </div>
      </div>
    </el-dialog>

    <!-- AI聊天助手 -->
    <AiChatWidget ref="aiChat" :allFoods="foods" />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import AiChatWidget from '@/components/AiChatWidget.vue'

export default {
  name: 'Home',
  components: { AiChatWidget },
  data() {
    return {
      searchKeyword: '',
      categories: [],
      activeCategory: null,
      foods: [],
      recommendFoods: [],
      hotFoods: [],
      loading: false,
      showHotRank: false,
      // AI推荐相关
      aiLoading: false
    }
  },
  computed: {
    ...mapState(['userId', 'isNewUser']),
    ...mapGetters(['isLoggedIn']),
    displayFoods() {
      if (this.searchKeyword) {
        return this.foods
      }
      if (this.activeCategory) {
        return this.foods.filter(f => f.categoryId === this.activeCategory)
      }
      if (this.isNewUser || !this.isLoggedIn) {
        return this.foods
      }
      return this.recommendFoods.length > 0 ? this.recommendFoods : this.foods
    }
  },
  created() {
    this.loadCategories()
    this.loadFoods()
    this.loadHotRank()
    if (this.isLoggedIn && !this.isNewUser) {
      this.loadRecommend()
    }
  },
  methods: {
    async loadCategories() {
      try {
        const { data } = await this.$axios.get('/category/list')
        if (data.code === 200) {
          this.categories = data.data
        }
      } catch (error) {
        console.error('加载分类失败', error)
      }
    },
    async loadFoods() {
      this.loading = true
      try {
        const { data } = await this.$axios.get('/food/praise-rank')
        if (data.code === 200) {
          this.foods = data.data
        }
      } catch (error) {
        console.error('加载菜品失败', error)
      }
      this.loading = false
    },
    async loadRecommend() {
      try {
        const { data } = await this.$axios.get('/food/recommend')
        if (data.code === 200) {
          this.recommendFoods = data.data
        }
      } catch (error) {
        console.error('加载推荐失败', error)
      }
    },
    async loadHotRank() {
      try {
        const { data } = await this.$axios.get('/food/hot-rank')
        if (data.code === 200) {
          this.hotFoods = data.data
        }
      } catch (error) {
        console.error('加载热门榜单失败', error)
      }
    },
    async handleSearch() {
      if (!this.searchKeyword.trim()) {
        this.loadFoods()
        return
      }
      this.loading = true
      try {
        const { data } = await this.$axios.get('/food/search', {
          params: { keyword: this.searchKeyword }
        })
        if (data.code === 200) {
          this.foods = data.data
        }
      } catch (error) {
        console.error('搜索失败', error)
      }
      this.loading = false
    },
    selectCategory(categoryId) {
      this.activeCategory = categoryId
      this.searchKeyword = ''
      if (categoryId) {
        this.loadCategoryFoods(categoryId)
      } else {
        this.loadFoods()
      }
    },
    async loadCategoryFoods(categoryId) {
      this.loading = true
      try {
        const { data } = await this.$axios.get('/food/category', {
          params: { categoryId }
        })
        if (data.code === 200) {
          this.foods = data.data
        }
      } catch (error) {
        console.error('加载分类菜品失败', error)
      }
      this.loading = false
    },
    goDetail(id) {
      this.$router.push(`/food/${id}`)
    },
    addToCart(food) {
      if (!this.isLoggedIn) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      this.$store.dispatch('addToCart', {
        foodId: food.id,
        foodName: food.name,
        foodImage: food.image,
        price: food.price
      })
      this.$message.success('已加入购物车')
      // 触发AI推荐（购物车不同菜品种类<3时）
      this.tryAiRecommend(food.id)
    },
    /** 尝试获取AI搭配推荐 */
    async tryAiRecommend(addedFoodId) {
      const cart = this.$store.state.cart
      if (cart.length >= 3) return
      if (this.aiLoading) return

      this.aiLoading = true
      try {
        const cartFoodIds = cart.map(item => item.foodId)
        const { data } = await this.$axios.post('/ai/recommend', {
          currentAddedFoodId: addedFoodId,
          cartFoodIds: cartFoodIds
        })
        if (data.code === 200 && data.data) {
          const recommendId = data.data.recommendFoodId
          const reason = data.data.reason
          const found = this.foods.find(f => f.id === recommendId)
          if (found && this.$refs.aiChat) {
            this.$refs.aiChat.showRecommend(found, reason)
          }
        }
      } catch (e) {
        console.error('AI推荐请求失败', e)
      } finally {
        this.aiLoading = false
      }
    },
    /** 接受AI推荐，将推荐菜品加入购物车 */
    acceptAiRecommend(food) {
      if (!food) return
      this.$store.dispatch('addToCart', {
        foodId: food.id,
        foodName: food.name,
        foodImage: food.image,
        price: food.price
      })
      this.$message.success(`已将「${food.name}」加入购物车`)
    },
    getImageUrl(image) {
      if (!image) return require('@/assets/default-food.png')
      if (image.startsWith('http')) return image
      return 'http://localhost:8089' + image
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
}
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0 60px;
}

.search-bar {
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* 覆盖 el-input 样式以实现极致极简 */
.search-bar >>> .el-input__inner {
  border-radius: 980px;
  background-color: #fff;
  border: none;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
  height: 52px;
  font-size: 16px;
  color: #1d1d1f;
  padding-left: 24px;
}
.search-bar >>> .el-input-group__append {
  background-color: transparent;
  border: none;
  font-size: 20px;
  color: #1d1d1f;
  border-radius: 0 980px 980px 0;
}

.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 40px;
}

.category-nav {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.nav-pill {
  padding: 8px 20px;
  border-radius: 980px;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.nav-pill:hover {
  background: rgba(0, 0, 0, 0.03);
}

.nav-pill.active {
  background: #1d1d1f;
  color: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 24px;
  letter-spacing: -0.5px;
}

.food-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 32px;
}

.food-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
  display: flex;
  flex-direction: column;
}

.food-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
}

.food-image {
  height: 220px;
  overflow: hidden;
}

.food-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.food-card:hover .food-image img {
  transform: scale(1.05);
}

.food-info {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.name-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 6px;
}

.name-row h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.name-row .category {
  color: #86868b;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.info-top .description {
  color: #6e6e73;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.food-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}
.food-stats span {
  color: #86868b;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 3px;
}
.food-stats i {
  font-size: 13px;
  color: #ff9500;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #1d1d1f;
  font-size: 22px;
  font-weight: 700;
}

.add-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f5f5f7;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.food-card:hover .add-btn {
  background-color: #0071e3;
  color: #fff;
}
.add-btn:active {
  transform: scale(0.9);
}

.hot-rank-list {
  max-height: 500px;
  overflow-y: auto;
  padding: 0 10px;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 16px;
  background: #f5f5f7;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.rank-item:hover {
  transform: scale(1.01);
  background: #e8e8ed;
}

.rank-num {
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  border-radius: 50%;
  background: #d2d2d7;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  margin-right: 16px;
}

.rank-num.top-1 { background: #1d1d1f; }
.rank-num.top-2 { background: #55555a; }
.rank-num.top-3 { background: #86868b; }

.rank-item img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 12px;
  margin-right: 16px;
}

.rank-info {
  flex: 1;
}

.rank-info h4 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.rank-info p {
  color: #86868b;
  font-size: 12px;
  margin: 0;
}

.rank-price {
  color: #1d1d1f;
  font-weight: 700;
  font-size: 16px;
}
</style>
