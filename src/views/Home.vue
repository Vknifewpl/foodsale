<template>
  <div class="home">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input v-model="searchKeyword" placeholder="搜索菜品" @keyup.enter.native="handleSearch">
        <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
      </el-input>
    </div>
    
    <!-- 分类导航 -->
    <div class="category-nav">
      <el-tag :type="activeCategory === null ? 'danger' : 'info'" @click="selectCategory(null)">全部</el-tag>
      <el-tag v-for="cat in categories" :key="cat.id" 
              :type="activeCategory === cat.id ? 'danger' : 'info'"
              @click="selectCategory(cat.id)">
        {{ cat.name }}
      </el-tag>
    </div>
    
    <!-- 榜单入口 -->
    <div class="rank-entry">
      <el-button type="warning" size="small" @click="showHotRank = true">
        <i class="el-icon-trophy"></i> 热门TOP10
      </el-button>
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
          <h3>{{ food.name }}</h3>
          <p class="category">{{ food.categoryName }}</p>
          <div class="price-row">
            <span class="price">¥{{ food.price }}</span>
            <el-button type="primary" size="mini" icon="el-icon-shopping-cart-2" 
                       @click.stop="addToCart(food)">加入购物车</el-button>
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
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'Home',
  data() {
    return {
      searchKeyword: '',
      categories: [],
      activeCategory: null,
      foods: [],
      recommendFoods: [],
      hotFoods: [],
      loading: false,
      showHotRank: false
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
        const { data } = await this.$axios.get('/food/recommend', {
          params: { userId: this.userId }
        })
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
      this.$store.dispatch('addToCart', {
        foodId: food.id,
        foodName: food.name,
        foodImage: food.image,
        price: food.price
      })
      this.$message.success('已加入购物车')
    },
    getImageUrl(image) {
      if (!image) return 'https://via.placeholder.com/200x150?text=No+Image'
      if (image.startsWith('http')) return image
      return 'http://localhost:8080' + image
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.search-bar {
  margin-bottom: 20px;
}

.category-nav {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.category-nav .el-tag {
  cursor: pointer;
}

.rank-entry {
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #ff6b6b;
}

.food-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.food-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.3s;
}

.food-card:hover {
  transform: translateY(-5px);
}

.food-image {
  height: 180px;
  overflow: hidden;
}

.food-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.food-info {
  padding: 15px;
}

.food-info h3 {
  margin: 0 0 10px;
  font-size: 16px;
}

.food-info .category {
  color: #999;
  font-size: 12px;
  margin-bottom: 10px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #ff6b6b;
  font-size: 20px;
  font-weight: bold;
}

.hot-rank-list {
  max-height: 500px;
  overflow-y: auto;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.rank-item:hover {
  background: #f5f5f5;
}

.rank-num {
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border-radius: 50%;
  background: #ddd;
  color: white;
  font-weight: bold;
  margin-right: 15px;
}

.rank-num.top-1 { background: #ff6b6b; }
.rank-num.top-2 { background: #ffa502; }
.rank-num.top-3 { background: #ffd43b; }

.rank-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 5px;
  margin-right: 15px;
}

.rank-info {
  flex: 1;
}

.rank-info h4 {
  margin: 0 0 5px;
}

.rank-info p {
  color: #999;
  font-size: 12px;
  margin: 0;
}

.rank-price {
  color: #ff6b6b;
  font-weight: bold;
}
</style>
